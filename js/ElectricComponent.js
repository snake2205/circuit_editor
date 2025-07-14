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
        this.properties = JSON.parse(JSON.stringify(properties));;

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
        console.log(angle);

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
}
