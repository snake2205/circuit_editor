import {getStyleValue} from "./utils.js"

// Base component class
export class ElComponent extends mxCell {
    constructor(x, y, increment, graph, config) {
        
        const {width, height, shape, name, type, properties} = config;
        const stylePrefix = "aspect=fixed;labelRotation=0;noLabel=1;shape=";

        super("", new mxGeometry(x, y, width, height), stylePrefix + shape);

        this.graph = graph;
        this.width = width;
        this.height = height;
        this.shape = shape;
        this.stylePrefix = stylePrefix;
        this.label = null;
        this.labelOffset = 0.1;
        this.name = name;
        this.displayName = true;
        this.type = type;
        this.increment = 0;
        this.properties = JSON.parse(JSON.stringify(properties));
        
        // new constraint point implementation individualy for all components
        this.constraints = [
            new mxConnectionConstraint(new mxPoint(0, 0.5), true, "input", -1, null, "input"),
            new mxConnectionConstraint(new mxPoint(1, 0.5), true, "output", 1, null,  "output")
        ] 

        this.setIncrement(increment);
        this.addLabel();
        this.setVertex(true);
    }

    // set the unique increment of the component
    setIncrement(increment) {
        this.increment = increment;
        this.name = this.name + increment.toString();
    }

    // add text cell with info about component
    addLabel() {
        const labelStr = this.getLabelString();
        const label = new mxCell( labelStr, new mxGeometry(0.5, 1 + this.labelOffset, 0, 0), "fontSize=12;align=center;verticalAlign=top;");
        
        label.setVertex(true);
        label.geometry.relative = true;

        this.graph.getModel().beginUpdate();
        this.labelCell = this.graph.addCell(label, this);
        this.labelCell.setConnectable(false);
        this.graph.getModel().endUpdate();
    }

    // update label after making changes to component info
    updateLabel(){
        const labelStr = this.getLabelString();
        this.labelCell.value = labelStr;
        this.graph.refresh(this);
    }

    // from component properties return text for the label cell
    getLabelString() {
        var str = this.displayName ? `${this.name}\n` : "";
        this.properties.forEach((prop) => {
        if (prop.display) {
            str += `${prop.name}=${prop.value}${prop.unit}\n`;
        }
        });
        return str.trim();
    }

    // rotate component by degrees
    rotate(angle) {
        this.graph.getModel().beginUpdate();

        const currentRotation = parseInt(getStyleValue(this.style, "rotation", 0), 10);
        const newRotation = (currentRotation + angle) % 360;
        const newStyle = mxUtils.setStyle(this.style, "rotation", newRotation);
        this.setStyle(newStyle);

        this.adjustLabel(newRotation);

        this.graph.getModel().endUpdate();
        this.graph.refresh();
    }

    // adjust label cell position relative to component depending on current rotation
    adjustLabel(angle) {
        let style = this.labelCell.style;
        if (angle === 0) {
            this.labelCell.geometry.x = 0.5;
            style = mxUtils.setStyle(style, "align", "center");
            style = mxUtils.setStyle(style, "verticalAlign", "top");
        } else if (angle === 90) {
            this.labelCell.geometry.x = 0;
            style = mxUtils.setStyle(style, "align", "right");
            style = mxUtils.setStyle(style, "verticalAlign", "center");
        } else if (angle === 180) {
            this.labelCell.geometry.x = 0.5;
            style = mxUtils.setStyle(style, "align", "center");
            style = mxUtils.setStyle(style, "verticalAlign", "bottom");
        } else if (angle === 270) {
            this.labelCell.geometry.x = 1;
            style = mxUtils.setStyle(style, "align", "left");
            style = mxUtils.setStyle(style, "verticalAlign", "top");
        }
        this.labelCell.setStyle(style);
    }

    // return electric properties of the component
    getProperties(){
        return {type:this.type, name:this.name, displayName:this.displayName, properties:this.properties}
    }

    // set electric properties of the component
    setProperties(properties){
        this.name = properties.name;
        this.displayName = properties.displayName;
        this.properties = properties.properties;
        this.updateLabel();
    }

    delete(){
        this.graph.removeCells([this]);
    }

    flip(direction){
        var flipStyleStr = "flipH";
        var rotation = parseInt(getStyleValue(this.style, "rotation", 0), 10);
        
        if(direction == "horizontal"){
            if(rotation == 0 || rotation == 180){
                flipStyleStr = "flipH";
            } else {
                flipStyleStr = "flipV";
            }
        } else if (direction == "vertical"){
            if(rotation == 0 || rotation == 180){
                flipStyleStr = "flipV";
            } else {
                flipStyleStr = "flipH";
            }
        }


        this.graph.getModel().beginUpdate();

        // visual changes
        const currentFlip = parseInt(getStyleValue(this.style, flipStyleStr, 0), 10);
        const newFlip = (currentFlip + 1) % 2;
        var newStyle = mxUtils.setStyle(this.style, flipStyleStr, newFlip);

        this.setStyle(newStyle);

        // constraint point changes
        this.flipConstraints(direction);
        this.flipEdgeStyling(direction);
        
        this.graph.getModel().endUpdate();
        this.graph.refresh();
    }

    // flips the constraint point positions along specified direction
    flipConstraints(direction){
        const terminal = this.graph.view.getState(this);;
        var newConstraints = []

        for(let i=0;i<this.constraints.length; i++){
            newConstraints.push(new mxConnectionConstraint(new mxPoint(this.constraints[i].point.x, this.constraints[i].point.y), this.constraints[i].perimeter, this.constraints[i].name, this.constraints[i].dx, this.constraints[i].dy))

            if (direction == "horizontal"){
                newConstraints[i].point.x = 1 - newConstraints[i].point.x;
                newConstraints[i].dx = -newConstraints[i].dx;
            }
            if (direction == "vertical"){
                newConstraints[i].point.y = 1 - newConstraints[i].point.y;
                newConstraints[i].dy = -newConstraints[i].dy;
            }
        }
        this.constraints = newConstraints;
    }

    // flips the edge connection points registered in style property so they move with flipped constraint points
    flipEdgeStyling(direction){
        this.edges.forEach(edge=>{
            const isSource = (edge.source === this);
            const prefix = isSource ? "exit":"entry";
            if(direction == "horizontal"){
                var x = getStyleValue(edge.style, prefix+"X", 0);
                var newX = 1 - x;
                edge.setStyle(mxUtils.setStyle(edge.style, prefix+"X", newX));
            }
            if(direction == "vertical") {
                var y = getStyleValue(edge.style, prefix+"Y", 0);
                var newY = 1 - y;
                edge.setStyle(mxUtils.setStyle(edge.style, prefix+"Y", newY));
            }
            console.log("end", edge.style)
        });
    }
}
