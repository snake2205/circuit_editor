


export function initiateConnections(graph){

    addConnectionConstraints();
    addConnectionPreview(graph);

    graph.setConnectable(true); // can make new connections
    graph.getStylesheet().getDefaultEdgeStyle()['edgeStyle'] = 'orthogonalEdgeStyle'; // connections drawn orthogonaly
    graph.getStylesheet().getDefaultEdgeStyle()['strokeWidth'] = 2; // connections drawn orthogonaly
    graph.getStylesheet().getDefaultEdgeStyle()['strokeColor'] = "#000000"; // connections drawn orthogonaly

    graph.getStylesheet().getDefaultVertexStyle()['strokeWidth'] = 2; // connections drawn orthogonaly
    graph.getStylesheet().getDefaultVertexStyle()['strokeColor'] = "#000000"; // connections drawn orthogonaly
    delete graph.getStylesheet().getDefaultEdgeStyle()['endArrow']; // connections drawn orthogonaly
    
    console.log(graph.getStylesheet())

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
        new mxConnectionConstraint(new mxPoint(0, 0.5), true),
        new mxConnectionConstraint(new mxPoint(1, 0.5), true)
    ]


    // Edges have no connection points
    mxPolyline.prototype.constraints = null;
}

function addConnectionPreview(graph){
    // Enables connect preview for the default edge style
    graph.connectionHandler.createEdgeState = function(me)
    {
        var edge = graph.createEdge(null, null, null, null, null);
        
        return new mxCellState(this.graph.view, edge, this.graph.getCellStyle(edge));
    };
}