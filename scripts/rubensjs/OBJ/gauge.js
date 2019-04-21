define([    "rubensjs/rubens",
            "rubensjs/_2d",
            "rubensjs/types",
            "util/util",
            "rubensjs/interface",
            "rubensjs/colors",
], function (Rubens, _2d, R, util, I, C) {

    return {

        Gauge: function (id, fontSize, fontColor, bgColor) {

            return util.extend( [ new I.I() ],
                {
                    D: new _2d.D(),

                    // HTML id of the canvas container without hash
                    id: id,

                    // Specific labels can go here
                    labels: [],

                    opts:{
                        red:0,              // Value to indicate in red (maximum value)
                        yellow:0,           // Laid on top of red
                        green:0,
                        angle:90,           // The angle of the arc
                        r: 200,             // The radius of the arc
                        makeRadiusFit:true, // Make radius fit
                        offset: -30,        // Offset labels to arc
                        strokeWidth: 20,    // The width of the arc
                        colorPointer:'#000',
                    },

                    init: function (config) {
                        this.config = config;
                        this.opts = util.extend(config.opts, this.opts)
                        this.D.init(this.id, config);
                        this.D.paper = new Rubens(this.id, true, true, fontSize, bgColor);
                        this.D.reachMinX = 0

                        this.r = this.opts.r

                        if (this.opts.makeRadiusFit) {
                            if(this.opts.angle > 180)
                                this.r = (this.D.w < this.D.h? this.D.w / 2 : this.D.h) / 2
                            else if( this.D.w > this.D.h)
                                this.r = this.D.w / 2
                             else
                                this.r = this.D.h / 2;
                        }

                        this.opts.angle %= 361
                    },

                    //invalidate: function(){
                    //},

                    pivotPoint: new R.Point(),

                    // The angle to rotate from 0 == 12 o'clock
                    getLayerRotationAngle: function(){
                        return -1 * this.opts.angle / 2
                    },

                    arcTo: function(from, to, angle){
                        if(angle < 0.5){
                            return this.D.paper.path(
                            "M" + from.x + "," + (from.y - this.r)  +
                            " a " + this.r + "," + this.r + " 1 0,1 " + (to.x) + "," + (to.y) + " "
                            )
                         }
                        else{
                            var p3 = this.D.pointOnCircleWithAngleFromCenter(this.r, 0.5),
                                p4 = this.D.pointOnCircleWithAngleFromCenter(this.r, angle - 0.5)

                            return this.D.paper.path(
                                "M" + this.pivotPoint.x + "," + (this.pivotPoint.y - this.r)  +
                                " a " + this.r + "," + this.r + " 1 0,1 " + (p3.x) + "," + (p3.y) + " " +
                                "M" + (this.pivotPoint.x+p3.x) + "," + (this.pivotPoint.y+p3.y-this.r)  +
                                " a " + this.r + "," + this.r + " 1 0,1 " + -1*(p4.x) + "," + -1*(p4.y) + " "
                            )
                        }
                    },

                    // Indicates a value and rotate
                    indicate: function(pV, color, angle){
                        if(angle > 0){
                            this.arcTo(this.pivotPoint, pV, angle)
                            .attr(                            {
                                 'stroke-linejoin': 'miter',
                                 'stroke': color,
                                 'stroke-width':this.opts.strokeWidth,
                                 fill:'none',
                                 transform: 'rotate(' + this.getLayerRotationAngle() +
                                 ' ' + this.pivotPoint.x + ' ' + (this.pivotPoint.y ) + ')'
                            })
                        }
                    },

                    indicateValue: function(val, color){

                        var angleV = this.valueToAngle(val);

                        this.indicate(
                            this.D.pointOnCircleWithAngleFromCenter(this.r, R.Float(angleV)),
                            color,
                            angleV
                        )
                    },

                    valueToAngle: function(value){
                        if(value > this.D.reachMinY && value <= this.D.reachMaxY)
                            return (this.opts.angle / 360) * ((value - this.D.reachMinY)
                                /
                                (this.D.reachMaxY - this.D.reachMinY))
                        else
                            return 0
                    },

                    getMidX: function(){
                        return this.D.toPointX((this.D.reachMaxX - this.D.reachMinX) / 2)
                    },

                    getLabelPositions: function(offset){
                        var midX = this.getMidX()

                        var positions = []
                        for(var n = 0; n < this.stepsY + 1; n++){

                            var angle = 0;

                            angle = this.opts.angle / (this.stepsY ) / 360 * n

                            var p3 = this.D.pointOnCircleWithAngleFromCenter(this.r + offset, R.Float(angle))

                            if(angle < 0.75){
                                p3.y -= offset - this.D.config.paddingTop
                                positions.push(new R.Point(p3.x  + midX, p3.y))
                            }
                            else{
                                var p3 = this.D.pointOnCircleWithAngleFromCenter(this.r + offset, 0.5),
                                    p4 = this.D.pointOnCircleWithAngleFromCenter(this.r + offset, angle - 0.5)

                                positions.push(new R.Point(
                                    midX+p3.x + -1*p4.x,
                                    p3.y + this.D.config.paddingTop - offset + -1*p4.y)
                                )
                            }
                        }
                        return positions;
                    },

                    drawLabels: function(positions, labels){
                        for(var nn = 0; nn < positions.length - (this.opts.angle == 360? 1:0); nn++){
                            var lbl = typeof labels != 'undefined' && typeof labels[nn] != 'undefined'?
                                labels[nn]
                                :
                                ((this.D.reachMaxY - this.D.reachMinY)
                                /
                                (this.stepsY) * nn + this.D.reachMinY)

                            this.D.paper.text(positions[nn].x,positions[nn].y,lbl)
                            .attr({
                                'font-size': '100%',
                                'fill': fontColor,
                                'text-anchor': 'middle',
                                'transform': 'rotate(' +
                                (this.opts.angle / (this.stepsY) * nn) + ' ' + (positions[nn].x) + ' ' + (positions[nn].y ) + ')'
                            })
                        }
                    },

                    drawData1: function(){

                        this.indicateValue(this.opts.red, C.color_indicator_red)

                        this.indicateValue(this.opts.yellow, C.color_indicator_yellow)

                        this.indicateValue(this.opts.green, C.color_indicator_green)

                        if(this.opts.pointer)
                            this.drawPointer(this.data[0].data[0].to)
                        else
                            this.indicateValue(this.data[0].data[0].to, C.itemColor(1).color)
                    },

                    drawPointer: function(val){

                        var pV = new R.Point(this.getMidX(), this.D.config.paddingTop),
                            angle = this.valueToAngle(val)

                        this.D.paper.circle(this.pivotPoint.x, this.pivotPoint.y, 4)
                        .attr({
                            fill:this.opts.colorPointer,
                        })

                        this.D.paper.path(
                            "M " + (this.pivotPoint.x - 1) + ', ' + this.pivotPoint.y + ' ' +
                            "L " + pV.x + ', ' + pV.y + ' ' +
                            "L " + (this.pivotPoint.x + 1) + ', ' + this.pivotPoint.y + ' Z'
                        )
                        .attr({
                            fill:this.opts.colorPointer,
                            stroke: this.opts.colorPointer,
                             transform: 'rotate(' + (this.getLayerRotationAngle() + angle * 360) +
                             ' ' + this.pivotPoint.x + ' ' + (this.pivotPoint.y ) + ')'
                        })
                    },

                    drawStaticVisual: function(){

                        // Take mid screen as pixel value
                        var midX = this.getMidX()

                        // Plot half of a circle
                        var
                            p = this.D.pointOnCircleWithAngleFromCenter(this.r, R.Float((0))),
                            p2 = this.D.pointOnCircleWithAngleFromCenter(this.r, R.Float(this.opts.angle / 360));

                        // Adjust position
                        p.x = midX
                        p.y += this.D.config.paddingTop

                        var
                            x = p.x,
                            y = p.y,
                            r = this.r,
                            d = p2

                        // Open a group to transform all as a group
                        this.D.openGroup('gauge')

                        .attr({
                           transform: 'rotate(' + this.getLayerRotationAngle() + ' ' +
                           x + ' ' + (y + r) + ')'
                        })

                        this.pivotPoint = new R.Point(x, y + r)

                        // Draw the main shape as background without rotation
                        this.arcTo(this.pivotPoint, p2, this.opts.angle / 360)
                        .attr({
                            //'fill': '',
                            'stroke-linejoin': 'miter',
                            'stroke': C.itemColor(0).color,
                            'stroke-width':this.opts.strokeWidth,
                        })

                        // Draw the labels
                        this.drawLabels(this.getLabelPositions(this.opts.offset), this.labels)

                        this.D.closeGroup()

                    },
                }
            )
        }
    }
})