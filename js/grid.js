export function drawGrid(graph)
{

    var canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0px';
    canvas.style.left = '0px';
    canvas.style.zIndex = -1;
    graph.container.appendChild(canvas);
    
    var ctx = canvas.getContext('2d');
    
    // Modify event filtering to accept canvas as container
    var mxGraphViewIsContainerEvent = mxGraphView.prototype.isContainerEvent;
    mxGraphView.prototype.isContainerEvent = function(evt)
    {
        return mxGraphViewIsContainerEvent.apply(this, arguments) ||
            mxEvent.getSource(evt) == canvas;
    };
    
    var s = 0;
    var gs = 0;
    var tr = new mxPoint();
    var w = 0;
    var h = 0;

    graph.minimumGraphSize = new mxRectangle(0, 0, 1000, 800);  // Width and height in pixels
    graph.sizeDidChange();  // Apply change
    repaintGrid(canvas, graph, ctx, w, h, s, tr, gs);
    
    var mxGraphViewValidateBackground = mxGraphView.prototype.validateBackground;
    mxGraphView.prototype.validateBackground = function()
    {
        mxGraphViewValidateBackground.apply(this, arguments);
        repaintGrid(canvas, graph, ctx, w, h, s, tr, gs);
    };
};

function repaintGrid(canvas, graph, ctx, w, h, s, tr, gs)
{

    if (ctx != null)
    {
        var bounds = graph.getGraphBounds();
        var width = Math.max(bounds.x + bounds.width, graph.container.scrollWidth || graph.container.clientWidth);
        var height = Math.max(bounds.y + bounds.height, graph.container.scrollHeight || graph.container.clientHeight);

        var sizeChanged = width != w || height != h;
        
        if (graph.view.scale != s || graph.view.translate.x != tr.x || graph.view.translate.y != tr.y ||
            gs != graph.gridSize || sizeChanged)
        {
            tr = graph.view.translate.clone();
            s = graph.view.scale;
            gs = graph.gridSize;
            w = width;
            h = height;
            
            // Clears the background if required
            if (!sizeChanged)
            {
                ctx.clearRect(0, 0, w, h);
            }
            else
            {
                canvas.setAttribute('width', w);
                canvas.setAttribute('height', h);
            }

            var tx = tr.x * s;
            var ty = tr.y * s;

            // Sets the distance of the grid lines in pixels
            var minStepping = graph.gridSize;
            var stepping = minStepping * s;

            if (stepping < minStepping)
            {
                var count = Math.round(Math.ceil(minStepping / stepping) / 2) * 2;
                stepping = count * stepping;
            }

            var xs = Math.floor((0 - tx) / stepping) * stepping + tx;
            var xe = Math.ceil(w / stepping) * stepping;
            var ys = Math.floor((0 - ty) / stepping) * stepping + ty;
            var ye = Math.ceil(h / stepping) * stepping;

            xe += Math.ceil(stepping);
            ye += Math.ceil(stepping);

            var ixs = Math.round(xs);
            var ixe = Math.round(xe);
            var iys = Math.round(ys);
            var iye = Math.round(ye);

            // Draws the actual grid
            ctx.strokeStyle = '#f6f6f6';
            ctx.beginPath();
            
            for (var x = xs; x <= xe; x += stepping)
            {
                x = Math.round((x - tx) / stepping) * stepping + tx;
                var ix = Math.round(x);
                
                ctx.moveTo(ix + 0.5, iys + 0.5);
                ctx.lineTo(ix + 0.5, iye + 0.5);
            }

            for (var y = ys; y <= ye; y += stepping)
            {
                y = Math.round((y - ty) / stepping) * stepping + ty;
                var iy = Math.round(y);
                
                ctx.moveTo(ixs + 0.5, iy + 0.5);
                ctx.lineTo(ixe + 0.5, iy + 0.5);
            }

            ctx.closePath();
            ctx.stroke();
        }
    }
}