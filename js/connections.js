import {addEdgeToEdgeConnections} from "./parallelConnections.js";
import {orthogonalConnectionPathing} from "./connectionPathing.js";


export function initiateConnections(graph){

    orthogonalConnectionPathing();

    addConnectionConstraints();
    addConnectionPreview(graph);
    addEdgeToEdgeConnections(graph);
    disableEdgesFromCellCenter(graph);
    disableLoopStyle(graph);

    graph.setConnectable(true); // can make new connections
    graph.setAllowDanglingEdges(true); // allow unconnected terminals
    graph.setConnectableEdges(true);   // allow edges to be connectable
    graph.setAllowLoops(true);         // allow loops (edge connected to itself, optional)
    graph.setDisconnectOnMove(false);
    graph.setCellsSelectable(true);

    // connection formatting
    graph.getStylesheet().getDefaultEdgeStyle()['edgeStyle'] = 'orthogonalConnectionStyle'; 
    graph.getStylesheet().getDefaultEdgeStyle()['strokeWidth'] = 2; 
    graph.getStylesheet().getDefaultEdgeStyle()['strokeColor'] = "#000000"; 
    //graph.getStylesheet().getDefaultEdgeStyle()['jettySize'] = 0; 

    // cell edge formatting
    graph.getStylesheet().getDefaultVertexStyle()['strokeWidth'] = 2; 
    graph.getStylesheet().getDefaultVertexStyle()['strokeColor'] = "#000000"; 
    delete graph.getStylesheet().getDefaultEdgeStyle()['endArrow']; 

}

function addConnectionConstraints(){
    // Overridden to define per-shape connection points
    mxGraph.prototype.getAllConnectionConstraints = function(terminal, source)
    {
        if (terminal != null && terminal.shape != null)
        {
            if (terminal.shape.stencil != null)
            {
                if (terminal.shape.stencil.constraints != null)
                {
                    return terminal.shape.stencil.constraints;
                }
            }
            else if (terminal.shape.constraints != null)
            {
                return terminal.shape.constraints;
            }
        }

        return null;
    };

    // Defines the default constraints for all shapes
    mxShape.prototype.constraints = [
        new mxConnectionConstraint(new mxPoint(0, 0.5), true, "input", -1, null, "input"),
        new mxConnectionConstraint(new mxPoint(1, 0.5), true, "output", 1, null,  "output")
    ] 


    // Edges have no connection points
    mxPolyline.prototype.constraints = null;
}

function addConnectionPreview(graph){
    // Enables connect preview for the default edge style
    graph.connectionHandler.createEdgeState = function(me)
    {
        var edge = this.graph.createEdge();
        
        if (this.sourceConstraint != null && this.previous != null)
        {
            edge.style = mxConstants.STYLE_EXIT_X+'='+this.sourceConstraint.point.x+';'+
                mxConstants.STYLE_EXIT_Y+'='+this.sourceConstraint.point.y+';';
        }
        else if (this.graph.model.isEdge(me.getCell()))
        {
            var scale = this.graph.view.scale;
            var tr = this.graph.view.translate;
            var pt = new mxPoint(this.graph.snap(me.getGraphX() / scale) - tr.x,
                    this.graph.snap(me.getGraphY() / scale) - tr.y);
            edge.geometry.setTerminalPoint(pt, true);
        }
        
        return this.graph.view.createState(edge);
    };
}


function disableEdgesFromCellCenter(graph){
    
    graph.connectionHandler.isConnectableCell = function(cell)
    {
        if (this.graph.getModel().isEdge(cell))
        {
            return true;
        }
        else
        {
            var geo = (cell != null) ? this.graph.getCellGeometry(cell) : null;
            
            return (geo != null) ? geo.relative : false;
        }
    };
    mxEdgeHandler.prototype.isConnectableCell = function(cell)
    {
        return graph.connectionHandler.isConnectableCell(cell);
    };
}

function disableLoopStyle(graph){
    graph.view.isLoopStyleEnabled = function(edge, points, source, target){
        false;
    };
}