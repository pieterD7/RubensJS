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

                    PointAngle: function(point, angle){

                        this.point = point,
                        this.angle = angle
                    },

                    // HTML id of the canvas container without hash
                    id: id,

                    // Specific labels can go here
                    labels: [],

                    opts:{
                        red:0,              // Value to indicate in red (maximum value)
                        yellow:0,
                        green:0,
                        angle:90,           // The angle of the arc
                        r: 200,             // The radius of the arc
                        makeRadiusFit:true, // Make radius fit
                        offset: -30,        // Offset labels to arc
                        strokeWidth: 20,    // The width of the arc
                        colorPointer:'#000',
                    },

                    init: function (config) {
                        this.config = util.extend(config, { marksYLength:0 });
                        this.opts = util.extend(config.opts, this.opts)
                        this.D.init(this.id, this.config);
                        this.D.paper = new Rubens(this.id, true, true, fontSize, bgColor);
                        this.D.reachMinX = 0

                        this.r = this.opts.r

                        if (this.opts.makeRadiusFit) {
                            if(this.opts.angle > 180){

                                this.r = (this.D.w < this.D.h?
                                    this.D.w / 2 : // - this.D.config.paddingLeft - this.D.config.paddingRight :
                                    this.D.h / 2 )//- this.D.config.paddingTop - this.D.config.paddingBottom)

                                if(this.r < 200)
                                    this.opts.strokeWidth *= 1/2
                            }
                            else if( this.D.w < this.D.h)
                                this.r = this.D.w / 2
                            else
                                this.r = this.D.h + ((180 - this.opts.angle) / 180 * this.D.h / 2)

                        }

                        this.opts.angle %= 361
                    },

                    invalidate: function(cls){

                        var els = document.querySelectorAll(cls)
                        if(els){
                            els.forEach( (el) =>{
                                el.remove()
                            })
                        }
                    },

                    pivotPoint: new R.Point(),

                    // The angle to rotate from 0 == 12 o'clock
                    getLayerRotationAngle: function(){
                        return -1 * this.opts.angle / 2
                    },

                    arcTo: function(from, to, angle){
                        if(angle <= 0.5){
                            return this.D.paper.path(
                            "M" + (this.pivotPoint.x + from.x) + "," + (this.pivotPoint.y + from.y - this.r)  +
                            " a " + this.r + "," + this.r + " 1 0,1 " + (to.x - from.x) + "," + (to.y - from.y) + " "
                            )
                         }
                        else{
                            var p3 = this.D.pointOnCircleWithAngleFromCenter(this.r, 0.5),
                                p4 = this.D.pointOnCircleWithAngleFromCenter(this.r, angle - 0.5)

                            return this.D.paper.path(
                                "M" + (this.pivotPoint.x + from.x) + "," + (this.pivotPoint.y + from.y - this.r)   +
                                " a " + this.r + "," + this.r + " 1 0,1 " + (p3.x) + "," + (p3.y ) + " " +
                                "M " + (this.pivotPoint.x+p3.x) + "," + (this.pivotPoint.y+p3.y-this.r)  +
                                " a " + this.r + "," + this.r + " 1 0,1 " + -1*(p4.x) + "," + -1*(p4.y) + " "
                            )
                        }
                    },

                    // Indicates a value and rotate
                    indicate: function(pV0, pV, color, angle){
                        if(angle > 0){
                            this.arcTo(pV0, pV, angle)
                            .attr({
                                 'id':'arcValue',
                                 'stroke-linejoin': 'miter',
                                 'stroke': color,
                                 //'opacity':0.25,
                                 'stroke-width':this.opts.strokeWidth / 2,
                                 fill:'none',
                                 transform: 'rotate(' + this.getLayerRotationAngle() +
                                 ' ' + this.pivotPoint.x + ' ' + (this.pivotPoint.y ) + ')'
                            })
                        }
                    },

                    indicateValue: function(valFrom, valTo, color){

                        var
                            angleV = this.valueToAngle(valFrom),
                            angleVT = this.valueToAngle(valTo);

                        this.indicate(
                            this.D.pointOnCircleWithAngleFromCenter(this.r, angleV),
                            this.D.pointOnCircleWithAngleFromCenter(this.r, angleVT),
                            color,
                            angleVT - angleV
                        )
                    },

                    valueToAngle: function(value){
                        if(value > this.D.reachMinY && value <= this.D.reachMaxY)
                            return R.Float((this.opts.angle / 360) * (value - this.D.reachMinY)
                                /
                                (this.D.reachMaxY - this.D.reachMinY))
                        else
                            return 0
                    },

                    getMidX: function(){
                        return this.D.toPointX((this.D.reachMaxX - this.D.reachMinX) / 2)
                    },

                    getLabelPositions: function(offset, offsetVal){
                        var midX = this.getMidX(),
                            offVal = typeof offsetVal != 'undefined'? offsetVal : 0;

                        var positions = [],
                            offAngle = 0//0.5 / 8

//                        for(var n = 0; n < (this.stepsY-1) * (this.opts.angle >= 180? 2 : (this.opts.angle < 90 ? 4 : 4)) + (this.opts.angle < 360? 0 : -1); n++){
                        for(var n = 0; n < (this.opts.angle < 90? 4*this.stepsY : this.opts.angle < 180? 4*this.stepsY : 2*this.stepsY - 2) + (this.opts.angle < 360? 0 : -1); n++){

                            var angle = 0;

                            angle = (this.opts.angle / (this.stepsY - 1) / 360) * (n + (offVal % (this.D.reachMaxY)))

                            angle += offAngle

                            var p3 = this.D.pointOnCircleWithAngleFromCenter(this.r + offset, R.Float(angle))

                            if(angle < 0.75){
                                p3.y -= offset - this.D.config.paddingTop
                                positions.push(new this.PointAngle(new R.Point(p3.x  + midX, p3.y), angle))
                            }
                            else{
                                var p3 = this.D.pointOnCircleWithAngleFromCenter(this.r + offset, 0.5),
                                    p4 = this.D.pointOnCircleWithAngleFromCenter(this.r + offset, angle - 0.5)

                                positions.push(new this.PointAngle(
                                    new R.Point(
                                        midX+p3.x + -1*p4.x,
                                        p3.y + this.D.config.paddingTop - offset + -1*p4.y
                                        )
                                    ,
                                    angle)
                                )
                            }
                        }

                        return positions;
                    },

                    drawLabels: function(positions, labels, start, offVal, fntFamily, fontSize){
                        var indexPlus = typeof start != 'undefined'? start : 0;
                        var offVal = typeof offVal != 'undefined'? offVal : 0
                        for(var nn = 0; nn < positions.length - (this.opts.angle == 360? 1:0); nn++){
                            var lbl = typeof labels != 'undefined'
                                    && typeof labels[(nn+indexPlus+labels.length) % labels.length] != 'undefined' ?
                                        labels[(nn+indexPlus+labels.length)% labels.length] : null

                                angle = positions[nn].angle*360

                            if(lbl){
                                this.D.paper.text(positions[nn].point.x,positions[nn].point.y,lbl)
                                .attr({
                                    'font-size': fontSize? fontSize : '100%',
                                    'fill': fontColor,
                                    'font-family': fntFamily? fntFamily : '',
                                    'text-anchor': 'middle',
                                    'transform': 'rotate(' +
                                    angle + ' ' + (positions[nn].point.x) + ' ' + (positions[nn].point.y ) + ')'
                                })
                            }
                        }
                    },

                    drawMarks: function(fromPosis, toPosis, hideFirst, attr){
                        if(fromPosis.length == toPosis.length){
                            for(var n = this.opts.angle == 360 ? 1 : 0; n < fromPosis.length; n++){
                               this.D.paper.path(
                                "M " + fromPosis[n].point.x + " " + fromPosis[n].point.y +
                                "L " + toPosis[n].point.x + " " + toPosis[n].point.y
                               )
                               .attr(
                                    util.extend(attr, {
                                        stroke:'#888',
                                        'stroke-width': 1
                                    })
                               )
                            }
                        }
                    },

                    drawData1: function(){

                        this.indicateValue(this.opts.yellow, this.opts.red, C.color_indicator_red)

                        this.indicateValue(this.opts.green, this.opts.yellow, C.color_indicator_yellow)

                        this.indicateValue(-30, this.opts.green, C.color_indicator_green)

                        if(this.opts.pointer)
                            this.drawPointer(this.data[0].data[0].to)
                        else
                            this.indicateValue(-30, this.data[0].data[0].to, C.itemColor(1).color)
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

                    drawIndicator:function(){
                        // Draw indicator
                        var pV = new R.Point(this.getMidX(), this.D.config.paddingTop + 10),
                            angle = this.valueToAngle(this.D.reachMaxY - this.D.reachMinY)/2 + this.opts.angle / 2 / 360
                        this.D.paper.path(
                            "M " + (this.pivotPoint.x - 1) + ', ' + (this.pivotPoint.y-this.r+30) + ' ' +
                            "L " + pV.x + ', ' + pV.y + ' ' +
                            "L " + (this.pivotPoint.x + 1) + ', ' + (this.pivotPoint.y-this.r+30) + ' Z'
                        )
                        .attr({
                            fill:C.color_indicator_red,
                            stroke: C.color_indicator_red,
                            transform: 'rotate(' + (this.getLayerRotationAngle() + angle * 360) +
                            ' ' + this.pivotPoint.x + ' ' + (this.pivotPoint.y ) + ')'
                        })
                    },

                    drawStaticVisual: function(start, fraction, drawArc){

                        this.invalidate('.gauge')

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

                        //p2.x += this.getMidX()
                        //p2.y += this.D.config.paddingTop

                        // Draw the main shape as background without rotation
                        this.arcTo(new R.Point(0,0), p2, this.opts.angle / 360)
                        //this.arcTo(new R.Point(this.D.config.paddingTop, this.getMidX()), p2, 0.25)
                        .attr({
                            //'fill': '',
                            'stroke-linejoin': 'miter',
                            'stroke': '#000',// C.itemColor(0).color,
                            'stroke-width':this.opts.strokeWidth + 10,
                        })
                        .click( () => {
                            this.clickHandler()
                        })

                        // Draw the labels
                        this.drawLabels(this.getLabelPositions(this.opts.offset, fraction), this.labels, start, void(0), 'astro')

                        this.D.closeGroup()

                    },

                    touchState: 0,

                    touchHandler: function(){
                        util.eventHandler(
                            () => {
                                if(this.touchState++ % 2 == 0){
                                    this.indicateValue(this.D.reachMinY, this.D.reachMaxY, '#fff')
                                    this.D.paper.use('gauge')
                                    this.D.paper.use('outerRing')

                                    var timer = setTimeout(() => {
                                        var el = document.querySelector('#arcValue')
                                        if(el)
                                            el.remove()
                                        }, 500)
                                    this.touchState = 0
                                }
                                else{
                                    var el = document.querySelector('#arcValue')
                                    if(el)
                                        el.remove()
                                }
                            }
                        )
                    },

                    clickElState:0,

                    clickHandler : function(){
                        util.eventHandler(
                            () => {
                                if(this.clickElState++ % 2 == 0){
                                    this.indicateValue(this.D.reachMinY, this.D.reachMaxY, '#fff')
                                    this.D.paper.use('gauge')
                                    this.D.paper.use('outerRing')

                                    var timer = setTimeout(() => {
                                        var el = document.querySelector('#arcValue')
                                        if(el)
                                            el.remove()
                                        }, 500)
                                    this.clickElState = 0
                                }
                                else{
                                    var el = document.querySelector('#arcValue')
                                    if(el)
                                        el.remove()
                                }
                            }
                        )
                    }
                }
            )
        }
    }
})