export function addEdgeToEdgeConnections(graph){
    mxEdgeHandler.prototype.snapToTerminals = true;

    enableSelectionByHovering(graph);
    terminalPointCalculation();
    terminalPointUpdateHandling();
    edgeResizeHandling();
    disableSnapToMiddle();

}

function enableSelectionByHovering(graph){
    // makes it possible to select edge by hovering over any point of it (not only the middle)
    graph.connectionHandler.marker.intersects = function(state, evt)
    {
        return true;
    };
}

function terminalPointUpdateHandling(){
    var mxConnectionHandlerUpdateCurrentState = mxConnectionHandler.prototype.updateCurrentState;
    mxConnectionHandler.prototype.updateCurrentState = function(me)
    {
        mxConnectionHandlerUpdateCurrentState.apply(this, arguments);

        if (this.edgeState != null)
        {
            this.edgeState.cell.geometry.setTerminalPoint(null, false);
        
            if (this.shape != null && this.currentState != null &&
                this.currentState.view.graph.model.isEdge(this.currentState.cell))
            {
                var scale = this.graph.view.scale;
                var tr = this.graph.view.translate;
                var pt = new mxPoint(this.graph.snap(me.getGraphX() / scale) - tr.x,
                        this.graph.snap(me.getGraphY() / scale) - tr.y);

                this.edgeState.cell.geometry.setTerminalPoint(pt, false);
            }
        }
    };
}

function edgeResizeHandling(){
    mxEdgeSegmentHandler.prototype.clonePreviewState = function(point, terminal)
    {
        var clone = mxEdgeHandler.prototype.clonePreviewState.apply(this, arguments);
        clone.cell = clone.cell.clone();
        
        if (this.isSource || this.isTarget)
        {
            clone.cell.geometry = clone.cell.geometry.clone();
            
            // Sets the terminal point of an edge if we're moving one of the endpoints
            if (this.graph.getModel().isEdge(clone.cell))
            {
                // TODO: Only set this if the target or source terminal is an edge
                clone.cell.geometry.setTerminalPoint(point, this.isSource);
            }
            else
            {
                clone.cell.geometry.setTerminalPoint(null, this.isSource);				
            }
        }

        return clone;
    };
}

function terminalPointCalculation(){
    mxGraphView.prototype.updateFixedTerminalPoint = function(edge, terminal, source, constraint)
    {
        var pt = null;
        
        if (constraint != null)
        {
            pt = this.graph.getConnectionPoint(terminal, constraint);
        }

        if (source)
        {
            edge.sourceSegment = null;
        }
        else
        {
            edge.targetSegment = null;
        }

        
        if (pt == null)
        {
            var s = this.scale;
            var tr = this.translate;
            var orig = edge.origin;
            var geo = this.graph.getCellGeometry(edge.cell);
            pt = geo.getTerminalPoint(source);

            // Computes edge-to-edge connection point
            if (pt != null)
            {
                pt = new mxPoint(s * (tr.x + pt.x + orig.x),
                                    s * (tr.y + pt.y + orig.y));
                
                // Finds nearest segment on edge and computes intersection
                if (terminal != null && terminal.absolutePoints != null)
                {
                    var seg = mxUtils.findNearestSegment(terminal, pt.x, pt.y);

                    // Finds orientation of the segment
                    var p0 = terminal.absolutePoints[seg];
                    var pe = terminal.absolutePoints[seg + 1];
                    var horizontal = (p0.x - pe.x == 0);
                    
                    // Stores the segment in the edge state
                    var key = (source) ? 'sourceConstraint' : 'targetConstraint';
                    var value = (horizontal) ? 'horizontal' : 'vertical';
                    edge.style[key] = value;
                    
                    // Keeps the coordinate within the segment bounds
                    if (horizontal)
                    {
                        pt.x = p0.x;
                        pt.y = Math.min(pt.y, Math.max(p0.y, pe.y));
                        pt.y = Math.max(pt.y, Math.min(p0.y, pe.y));
                    }
                    else
                    {
                        pt.y = p0.y;
                        pt.x = Math.min(pt.x, Math.max(p0.x, pe.x));
                        pt.x = Math.max(pt.x, Math.min(p0.x, pe.x));
                    }
                }
            }
            // Computes constraint connection points on vertices and ports
            else if (terminal != null && terminal.cell.geometry.relative)
            {
                pt = new mxPoint(this.getRoutingCenterX(terminal),
                    this.getRoutingCenterY(terminal));
            }
        }

        edge.setAbsoluteTerminalPoint(pt, source);
    };
}

function disableSnapToMiddle(){
    // bug when connecting from edge to constraint adds to all new edges entryX and endtryY
    // makes edges from constraint to edge snap to the middle of the target edge
    mxGraphView.prototype.updateFixedTerminalPoints = function(edge, source, target)
    {
        // filters out entryX and entryY when neccessary
        if (source != null && target != null){
            if ( !source.cell.edge && target.cell.edge) {
                delete edge.style[mxConstants.STYLE_ENTRY_X]
                delete edge.style[mxConstants.STYLE_ENTRY_Y]
            }
        }
        this.updateFixedTerminalPoint(edge, source, true,
            this.graph.getConnectionConstraint(edge, source, true));
        this.updateFixedTerminalPoint(edge, target, false,
            this.graph.getConnectionConstraint(edge, target, false));
    };
}