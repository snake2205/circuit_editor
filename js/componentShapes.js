export function addComponents(){

    function ResistorShape() { }
    ResistorShape.prototype = new mxCylinder();
    ResistorShape.prototype.constructor = ResistorShape;

    ResistorShape.prototype.redrawPath = function(c, x, y, w, h, isForeground) {
        if (isForeground){
            c.moveTo(w*0.0, h * 0.4999977857114362);
            c.lineTo(w*0.22222223633157054, h * 0.4999977857114362);

            c.moveTo(w*0.7777777636684293, h * 0.4999977857114362);
            c.lineTo(w*1.0, h * 0.4999977857114362);

            c.moveTo(w*0.22222226807760426, h * 0.0);
            c.lineTo(w*0.7777777954144631, h * 0.0);
            c.lineTo(w*0.7777777954144631, h * 1.0);
            c.lineTo(w*0.22222226807760426, h * 1.0);
            c.lineTo(w*0.22222226807760426, h * 0.0);

            c.end()
        }
    };


    function CapacitorShape() { }
    CapacitorShape.prototype = new mxCylinder();
    CapacitorShape.prototype.constructor = CapacitorShape;

    CapacitorShape.prototype.redrawPath = function(c, x, y, w, h, isForeground) {
        if (isForeground){
            c.moveTo(w*0.0, h * 0.49999964285714377);
            c.lineTo(w*0.4, h * 0.49999964285714377);

            c.moveTo(w*0.6, h * 0.49999964285714377);
            c.lineTo(w*1.0, h * 0.49999964285714377);

            c.moveTo(w*0.4, h * 0.0);
            c.lineTo(w*0.4, h * 1.0);

            c.moveTo(w*0.6, h * 0.0);
            c.lineTo(w*0.6, h * 1.0);

            c.end()
        }
    };

    function DCSourceShape() { }
    DCSourceShape.prototype = new mxCylinder();
    DCSourceShape.prototype.constructor = DCSourceShape;

    DCSourceShape.prototype.redrawPath = function(c, x, y, w, h, isForeground) {
        if (isForeground){
            c.moveTo(w*0.7463666908961102, h * 1.0);
            c.lineTo(w*0.7463666908961102, h * 0.0);

            c.moveTo(w*0.6219722313942317, h * 0.7499999701033464);
            c.lineTo(w*0.6219722313942317, h * 0.24999999003444873);

            c.moveTo(w*0.9951556098998674, h * 0.4999999800688975);
            c.lineTo(w*0.7463666908961102, h * 0.4999999800688975);

            c.moveTo(w*0.6219722313942317, h * 0.4999999800688975);
            c.lineTo(w*0.0, h * 0.4999999800688975);

            c.moveTo(w*0.9067042347117846, h * 0.19047546030183476);
            c.lineTo(w*0.9067042347117846, h * 0.0029754611322973484);

            c.moveTo(w*0.8134083371932467, h * 0.09672545407336523);
            c.lineTo(w*1.0, h * 0.09672545407336523);

            c.end()
        }

    };

    function InductorShape() { }
    InductorShape.prototype = new mxCylinder();
    InductorShape.prototype.constructor = InductorShape;

    InductorShape.prototype.redrawPath = function(c, x, y, w, h, isForeground) {
        if (isForeground){
            c.moveTo(w*1.0, h * 0.5);
            c.lineTo(w*0.8571429048690342, h * 0.5);

            c.curveTo(w*0.8567133692762354, h * 0.0017694026455178293, w*0.7140710419416689, h * 0.0017694026455178293, w*0.7142856904226259, h * 0.5 );

            c.curveTo(w*0.7140709226262266, h * 0.0017687987174559187, w*0.5710018636117586, h * 0.003539444744277143, w*0.5714285952916601, h * 0.5 );

            c.curveTo(w*0.5714259345572936, h * 0.0, w*0.4281391845180865, h * 0.0, w*0.428571440502973, h * 0.5 );

            c.curveTo(w*0.4285742921420475, h * 0.0035400841975189432, w*0.2859289819214198, h * 0.0017694026455178293, w*0.285714285714286, h * 0.5 );

            c.curveTo(w*0.2852847501214873, h * 0.0017694026455178293, w*0.14374101972322476, h * 0.0017694026455178293, w*0.14374101972322476, h * 0.5 );

            c.moveTo(w*0.14374101972322476, h * 0.5);
            c.lineTo(w*0.0, h * 0.5);

            c.end()
        }
    };

    mxCellRenderer.registerShape('resistor', ResistorShape);
    mxCellRenderer.registerShape('capacitor', CapacitorShape);
    mxCellRenderer.registerShape('dc_source', DCSourceShape);
    mxCellRenderer.registerShape('inductor', InductorShape);
}