import {ElComponent} from "./ElectricComponent.js";
import {getStyleValue} from "./utils.js"

export function addOutputButtonFunctionality(graph){
    var outputButton = document.getElementById("outputButton")
    outputButton.onclick = function (){
        printOutput(graph);
    } 
}

function printOutput(graph){
    const model = graph.getModel();
    const parent = graph.getDefaultParent();
    const children = model.getChildren(parent) || [];

    const edges = children.filter(cell => !(cell instanceof ElComponent));
    var edgeGroups = groupEdges(edges);

    const components = children.filter(cell => (cell instanceof ElComponent));
    var componentData = [];

    // prepare component data
    for (let i=0; i<components.length; i++){
        var d = components[i].getProperties();

        for (let j=0; j<components[i].edges.length; j++){
            var name = assignWireNames(graph, components[i], components[i].edges[j]);
            d[name] = getEdgeGroupIndex(components[i].edges[j], edgeGroups);
        }

        componentData.push(d);
    }
    console.log(componentData);
}

// finds the name of the connection constraint that is used between edge and cell
function assignWireNames(graph, component, edge){
    // gets the cell shape constraints
    const state = graph.view.getState(component);
    const constraints = state.shape.constructor.prototype.constraints;

    // gets the edge constraint styling on the side of the component
    const isSource = edge.source === component;
    const prefix = isSource ? "exit" : "entry";

    var x = parseFloat(getStyleValue(edge.style, prefix + "X", 0));
    var y = parseFloat(getStyleValue(edge.style, prefix + "Y", 0));
    var name = null;

    constraints.forEach(constraint => {
        if (constraint.point.x == x && constraint.point.y == y){
            name = constraint.name;
        }
    });

    return name;
}

// finds in which edge group is the specific edge
function getEdgeGroupIndex(edge, group){
    for (let i=0; i<group.length; i++){
        if (group[i].includes(edge)){
            return i;
        }
    }
    return null;
}

//groups edges by selecting the first known edge and finding all connected edges, then repeating until all edges are used
function groupEdges(edges){
    var groups = []
    while (edges.length > 0){
        groups.push(getConnectedEdges(edges, edges[0], []))
        edges = edges.filter(el => !groups.flat().includes(el));    
    }

    return groups
    
} 


function getConnectedEdges(allEdges, edge, groupedEdges){
    groupedEdges.push(edge);

    // finds edges that connect to the edge
    for(let i=0; i<allEdges.length; i++){
        if (!groupedEdges.includes(allEdges[i])){
            if (allEdges[i].source == edge || allEdges[i].target == edge){
                getConnectedEdges(allEdges, allEdges[i], groupedEdges);
            }
        }
    }

    // find edges that the edge is connected tos
    if(edge.source != null && !(edge.source instanceof ElComponent) &&!(groupedEdges.includes(edge.source))){
        getConnectedEdges(allEdges, edge.source, groupedEdges);
    }
    if(edge.target != null && !(edge.target instanceof ElComponent)&&!(groupedEdges.includes(edge.target))){
        getConnectedEdges(allEdges, edge.target, groupedEdges);
    }
    return groupedEdges;
}