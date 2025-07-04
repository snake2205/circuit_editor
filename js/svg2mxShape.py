from xml.dom import minidom
from svg.path import parse_path
import numpy as np

def is_letter(s):
    return len(s) == 1 and s.isalpha()

def chunk_list(lst, size):
    return [lst[i:i+size] for i in range(0, len(lst), size)]

def writePathGX(points, count, closed = False):
    code = ""
    coord0 = points.pop(0)
    code += f"c.moveTo(w*{coord0[0]}, h * {coord0[1]});\n"
    for i in range(count-1):
        coord = points.pop(0)
        code += f"c.lineTo(w*{coord[0]}, h * {coord[1]});\n"

    if closed == True:
        code += f"c.lineTo(w*{coord0[0]}, h * {coord0[1]});\n"
        
    return code

def writeCurvedPathGX(points):
    code = ""
    coord1 = points.pop(0)
    coord2 = points.pop(0)
    coord3 = points.pop(0)
    code += f"c.curveTo(w*{coord1[0]}, h * {coord1[1]}, w*{coord2[0]}, h * {coord2[1]}, w*{coord3[0]}, h * {coord3[1]} );\n"
        
    return code

def get_point_at(path, distance, scale, offset):
    pos = path.point(distance)
    pos += offset
    pos *= scale
    return pos.real, pos.imag


def points_from_path(path, density, scale, offset):
    step = 2#int(path.length() * density)
    last_step = step - 1

    if last_step == 0:
        yield get_point_at(path, 0, scale, offset)
        return

    for distance in range(step):
        yield get_point_at(
            path, distance / last_step, scale, offset)

def straightPathPoints(commands, points):
    coords = []
    print(commands)
    commands = commands.split(" ")
    if commands[0].lower() == "m":
        coords.append(tuple(map(float, commands[1].split(","))))
        commands = commands[2:]
    else:
        coords.append(points[-1])

    for i in range(0, len(commands), 2):
        if commands[i] == "h":
            coords.append((coords[-1][0]+float(commands[i+1]), coords[-1][1]))
        elif commands[i] == "H":
            coords.append((float(commands[i+1]), coords[-1][1]))
        elif commands[i] == "V":
            coords.append((coords[-1][0], float(commands[i+1])))
        elif commands[i] == "v":
            coords.append((coords[-1][0], coords[-1][1] + float(commands[i+1])))

    print(f"coords {coords}")

    return coords

def curvedPathPoints(commands, points):
    coords = []
    start = points[-1]
    commands = commands.split(" ")[1:]
    
    for i in range(len(commands)):
        coords.append(tuple(map(float, commands[i].split(","))))

    coords = chunk_list(coords, 3)
    for i in range(len(coords)):
        c = np.array(coords[i])
        c[:,0] += start[0]
        c[:,1] += start[1]
        start = c[-1]
        coords[i] = c
    
    print(coords)
    print("asd")
    
    return coords

def splitPathCommands(commands):
    split = commands.split(" ")
    curved_start =-1
    straight_start = 0
    coms = []
    types = []
    for i in range(len(split)):
        if split[i] == "c":
            curved_start = i
            coms.append(" ".join(split[straight_start:i]))
            types.append("straight")
            straight_start = -1
            
        elif is_letter(split[i]) and curved_start != -1:
            coms.append(" ".join(split[curved_start:i]))
            types.append("curved")
            curved_start = -1
            straight_start = i

    if straight_start != -1:
        coms.append(" ".join(split[straight_start:]))
        types.append("straight")
    else:
        coms.append(" ".join(split[curved_start:]))
        types.append("curved")

    return(coms, types)
        

points = []
elements = []

with open('inductor.svg',encoding="utf-8") as f:
    
    content = '\n'.join([line.strip() for line in f.readlines()])
    svg_dom = minidom.parseString(content)

    path_strings = [path.getAttribute('d') for path in svg_dom.getElementsByTagName('path')]

    for path_string in path_strings:
        commands, types = splitPathCommands(path_string)


        for command, typ in zip(commands, types): 

            if typ == "straight":
                coords = straightPathPoints(command, points)
                points.extend([coords[0], coords[-1]])
                elements.append("straight_path")
            elif typ=="curved":
                coords = curvedPathPoints(command, points)

                for coord in coords:
                    points.extend(coord)
                    elements.append("curved_path")


    rect_strings = [(float(path.getAttribute('x')), float(path.getAttribute('y')), float(path.getAttribute('width')), float(path.getAttribute('height'))) for path in svg_dom.getElementsByTagName('rect')]

    for x,y,w,h in rect_strings:
        points.append((x, y))
        points.append((x+w, y))
        points.append((x+w,y+h))
        points.append((x, y+h))
        elements.append("rect")


points = np.array(points)

# rotacija
#points1 = np.empty_like(points)
#points1[:,0] = points[:,1]
#points1[:,1] = -points[:,0]
#points = points1

max_y, min_y = points[:,1].max(), points[:,1].min()
max_x, min_x = points[:,0].max(), points[:,0].min()
points[:,1] -= min_y
points[:,0] -= min_x
points[:,1] /= (max_y-min_y)#*2
points[:,0] /= (max_x-min_x)

points = points.tolist()


print(np.array(points))

for i in range(len(elements)):
    if elements[i] == "rect":
        print(writePathGX(points, 4, True))
    elif elements[i] == "straight_path":
        print(writePathGX(points, 2))
    elif elements[i] == "curved_path":
        print(writeCurvedPathGX(points))

print("c.end()")


        
    
    


