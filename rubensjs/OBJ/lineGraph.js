define([
    "rubensjs/rubens",
    "rubensjs/_2d",
    "rubensjs/inlay",
    "rubensjs/interface",
    "rubensjs/PLG/pannableOrigin",
    "rubensjs/PLG/pushableData",
    "rubensjs/PLG/pullLines",
    "rubensjs/labelPosition",
    "rubensjs/types",
    "rubensjs/colors",
    "util/util"],
    function (Rubens, _2d, L, I, P, PP, U, LPOS, R, C, util) {

        return {
            Range: R.Range,

            Point: R.Point,

            LineGraph: function (id, fontSize, fontColor, bgColor, axisColor) {

                return util.extend([
                    new P.PannableOrigin(),
                    new U.PullLines(),
                    new I.I()], {

                        D: new _2d.D(),

                        id: id,

                        svgClass: 'svgLayer',

                        legend: new L.Inlay(id),

                        stepsX: 0,

                        plusStepsX: 1, // stepsX + 1 for two points for one line

                        stepsY: 0,

                        originTextAttributes: {
                            'fill': "#000"
                        },

                        xAxisAttributes: {
                            "stroke-width": 2,
                            "stroke": "#000"
                        },

                        yAxisAttributes: {
                            "stroke-width": 2,
                            "stroke": "#000"
                        },

                        xAxisMarksAttributes: {
                            "stroke": "#000"
                        },

                        xAxisLabelsAttributes: {
                            "fill": "#000"
                        },

                        yAxisMarksAttributes: {
                            "stroke": "#000", 
                            'transform': ''
                        },

                        yAxisLabelsAttributes: {
                            "fill": "#000", 
                            'transform': ''
                        },

                        labelPos: null,

                        opts: {
                            fillArea: false,
                            strokeWidth: 2,
                            positionLegend: 2,
                            offsetLegend: 0,
                            drawMarkers: true,
                            connectPoints: false,
                            showHeaderLabels: false,
                        },

                        init: function (config) {
                            this.config = config;
                            this.D.init(id, config);
                            this.D.paper = new Rubens(this.id, true, true, fontSize, bgColor);

                            this.axisColor = axisColor
                            this.fontSize = fontSize

                            C.color_pull_line_line = axisColor
                            C.color_pull_line_pin_locked = axisColor
                        },

                        invalidate: function () {

                            return new Promise((resolve) => { 
                                //C.iColorItems = 0;

                                //var a = document.querySelectorAll('.' + this.svgClass);
                                var a = document.querySelectorAll('.svgLayer');
                                a.forEach(function (e) {
                                    e.remove();
                                });

                                this.D.paper = new Rubens(this.id, true, true, fontSize, bgColor);       
                                
                                resolve('ok')
                            })

                        },

                        drawLegend: function (items, fillArea) {
                            var data = []
                            items.forEach(function (i, n) {
                                data.push({ color: C.itemColor(n).color, label: i.header })
                            })

                            this.legend.insert(this.D.paper)

                            var x1 =  this.D.toPointX(this.D.reachMaxX, -1 * this.opts.legendItemWidth + this.fontSize)

                            if(this.legendLeft(data.length))
                                x1 = this.legendLeft(data.length)


                            if (this.opts && this.opts.positionLegend == 1) {
                                this.legend.drawLegend(
                                    x1,
                                    this.D.toPointY(this.D.reachMaxY, -1 * this.config.paddingTop / 3 + -1 * this.opts.offsetYLegend),
                                    152,
                                    55,
                                    data,
                                    'cb',
                                    'Legend',
                                    { "stroke-width": 1, fill: bgColor, stroke: fontColor },
                                    this,
                                    fontColor,
                                    true,
                                    fontSize,
                                    0,
                                    -4
                                 )
                            }
                            else if (this.opts && this.opts.positionLegend == 2) {
                                this.legend.drawLegend(
                                    x1,
                                    this.D.toPointY(this.D.reachMinY, 40 + this.opts.offsetYLegend),
                                    152,
                                    55,
                                    data,
                                    'cb',
                                    'Legend',
                                    { "stroke-width": 1, fill: this.bgColor, stroke: this.fontColor },
                                    this,
                                    fontColor,
                                    true,
                                    this.fontSize,
                                    0,
                                    -4
                                )

                            }
                            else if (this.opts && this.opts.positionLegend == 3) {
                                this.legend.drawLegend(
                                    x1,
                                    this.D.toPointY(this.D.reachMaxY, -1 * this.config.paddingTop / 3 + -1 * this.opts.offsetYLegend),
                                    152,
                                    55,
                                    data,
                                    'cb',
                                    'Legend',
                                    { "stroke-width": 1, fill: this.bgColor, stroke: this.fontColor },
                                    this,
                                    fontColor,
                                    false,
                                    this.fontSize,
                                    0, 
                                    -4
                                )
                            }
                            else if (this.opts && this.opts.positionLegend == 4) {
                                this.legend.drawLegend(
                                    x1,
                                    this.D.toPointY(this.D.reachMinY, 40 + this.opts.offsetYLegend),
                                    152,
                                    55,
                                    data,
                                    'cb',
                                    'Legend',
                                    { "stroke-width": 1, fill: this.bgColor, stroke: this.fontColor },
                                    this,
                                    fontColor,
                                    false,
                                    this.fontSize,
                                    0,
                                    -4
                                )
                            }
                            else if(this.opts && (this.opts.positionLegend == 5 || this.opts.positionLegend == 6) ){

                                var l = data.length / 2,
                                    y1 = this.D.toPointY(this.D.reachMaxY, -1 * this.config.paddingTop / 3 + -1 * this.opts.offsetYLegend);

                                if(this.opts.positionLegend == 5 || this.opts.positionLegend == 6)
                                    l = parseInt((data.length + 1) / 2)

                                if(this.opts.positionLegend == 6)
                                    y1 = this.D.toPointY(this.D.reachMinY, 40 + this.opts.offsetYLegend)

                                for (var c = 0; c < l; c++) { 

                                    var d = data.concat().filter((dd, n) => { 
                                        if(n >= c*(data.length / l) && n < (c+1) * (data.length / l))
                                            return dd
                                    })                           

                                    this.legend.drawLegend(
                                        x1 + c * this.opts.legendItemWidth,
                                        y1,
                                        152,
                                        55,
                                        d,
                                        'cb',
                                        'Legend',
                                        { "stroke-width": 1, fill: this.bgColor, stroke: this.fontColor },
                                        this,
                                        fontColor,
                                        false,
                                        this.fontSize,
                                        c,
                                        -4
                                    )                              
                                }

                            }
                        },

                        drawLegendMarker: function (paper, _x, _y, ang, n, nMarkers, clr, mask, row) {
                            var m = 8
                            //n+=4

                            if(row == 1)
                                n += nMarkers

                            if (this.opts.colorIter == 3) { 

                                clr = C.itemColor(0).color

                                paper.mrkrTriangle(_x, _y)
                                 .attr({ 'class': this.svgClass, fill: clr, 'stroke-width': this.opts.strokeWidth, stroke: clr, transform: 'rotate(' + (ang + 90) + ' ' + _x + ' ' + _y + ')' })
                                return                            
                            }


                            if (this.opts.fillArea || this.opts.positionLegend == 0 || !this.opts.connectPoints || !this.opts.drawMarkers) {
                                paper.mrkrCircle(_x, _y)
                                 .attr({ 'class': this.svgClass, fill: clr, stroke: clr, 'stroke-width': this.opts.strokeWidth })
                                return
                            }

                            if (n % m == 0) {
                                paper.mrkrTriangle(_x, _y)
                                 .attr({ 'class': this.svgClass, fill: clr, 'stroke-width': this.opts.strokeWidth, stroke: clr, transform: 'rotate(' + (ang + 90) + ' ' + _x + ' ' + _y + ')' })
                            }
                            else if (n % m == 1) {
                                paper.mrkrSquare(_x, _y)
                                .attr({ 'class': this.svgClass, fill: clr, 'stroke-width': this.opts.strokeWidth, stroke: clr, transform: 'rotate(' + (ang) + ' ' + _x + ' ' + _y + ')' })
                            }
                            else if (n % m == 2) {
                                paper.mrkrCircle(_x, _y)
                                .attr({ 'class': this.svgClass, fill: clr, 'stroke-width': this.opts.strokeWidth, stroke: clr })
                            }
                            else if (n % m == 3) {
                                paper.mrkrCircle(_x, _y)
                                .attr({ 'class': this.svgClass, fill: 'none', 'stroke-width': this.opts.strokeWidth, stroke: clr })
                            }
                            else if (n % m == 4) {
                                paper.mrkrSquare(_x, _y)
                                .attr({ 'class': this.svgClass, fill: 'none', 'stroke-width': this.opts.strokeWidth, stroke: clr, transform: 'rotate(' + (ang - 90 + 45) + ' ' + _x + ' ' + _y + ')' })
                            }
                            else if (n % m == 5) {
                                paper.mrkrSquare(_x, _y)
                                .attr({ 'class': this.svgClass, fill: 'none', 'stroke-width': this.opts.strokeWidth, stroke: clr, transform: 'rotate(' + (ang) + ' ' + _x + ' ' + _y + ')' })
                            }
                            else if (n % m == 6) {
                                paper.mrkrTriangle(_x, _y)
                                 .attr({ 'class': this.svgClass, fill: 'none', 'stroke-width': this.opts.strokeWidth, stroke: clr, transform: 'rotate(' + (ang + 90) + ' ' + _x + ' ' + _y + ')' })
                            }
                            else {
                                paper.mrkrSquare(_x, _y)
                                .attr({ 'class': this.svgClass, fill: clr, 'stroke-width': this.opts.strokeWidth, stroke: clr, transform: 'rotate(' + (ang - 90 + 45) + ' ' + _x + ' ' + _y + ')' })
                            }
                        },

                        getBaseLineY: function () {
                            var mY = this.D.reachMinY >= 0 ? this.D.reachMinY : 0

                            if (mY < this.D.reachMinY)
                                mY = this.D.reachMinY
                            return mY
                        },

                        drawData1: function(promise, options){
                            C.iColorItems = 0

                            var lastP = null,   // To calc angle
                                ang = 0,
                                lastAng = 0,
                                pnts = [],       // The polygon
                                x = null;

                            this.clr = C.nextItemColor().color

                            if (options)
                                this.opts = util.extend(options, this.opts)

                            this.labelPos = new LPOS.LabelPosition()
                        

                            // For all shapes
                            var lastPoint = new R.Point(),
                                lpos = []

                            this.data.forEach((col, i) => {

                                if (col.length > 0) {

                                    if (this.opts.colorIter == 2) { 
                                        this.clr = C.itemAlternateColor(i).color;
                                    }
                                    else if(this.opts.colorIter == 3){
                                        this.clr = C.itemColor(0).color
                                    }

                                    col.forEach((d, q) => {

                                        // For all values
                                        d.data.forEach((dd, ii) => {
                                            
                                            // If no to 
                                            if (dd.to == null) return;

                                            // If there is a x value
                                            if (d.label != null && isNaN(d.label))
                                                x = (parseFloat(String(d.label)))
                                            else
                                                x = d.label                                                                       

                                            // If needed find the point(s) to start the filled form
                                            if (q == 0 && this.opts.fillArea) {
                                                var mY = this.getBaseLineY(),
                                                    crnr = null;

                                                // MinX or MaxX?
                                                var xp1a = this.D.toPointX(x)

                                                if (xp1a) {
                                                    crnr = new R.Point(x, mY)
                                                }
                                                else if (x > this.D.reachMaxX) {
                                                    crnr = new R.Point(this.D.reachMaxX, mY);
                                                }
                                                else {
                                                    crnr = new R.Point(this.D.reachMinX, mY);
                                                }
                                                pnts.push(crnr)

                                                //notDrawLastPAsMeasure = true
                                            }


                                            pnts.push(new R.Point(x, dd.to))

                                            lastPoint = new R.Point(
                                                this.D.toPointX(x, this.D.config.halfFontXHeight),
                                                this.D.toPointY(dd.to)
                                                )

                                        })
                                    })


                                    // If needed, find the last point before closing the form
                                    if (this.opts.fillArea) {
                                        var mY = this.getBaseLineY(),
                                            cX = x

                                        if (x > this.D.reachMaxX)
                                            cX = this.D.reachMaxX
                                        else if (x < this.D.reachMinX)
                                            cX = this.D.reachMinX

                                        // if(?????)
                                        //pnts.push(lastP)
                                        pnts.push(new R.Point(cX, this.getBaseLineY()))

                                    }                                    

                                    // Draw the accumulated points
                                    if (this.opts.connectPoints && pnts.length > 1) {

                                        var poly = null
                                        if (this.opts.fillArea)
                                            poly = this.D.polygon(pnts, null, true, true)
                                        else
                                            poly = this.D.polygon(pnts, null, false, false)
                                        if (poly)
                                            poly.attr({
                                                'fill-opacity': (this.opts.fillArea ? 0.8 : 1.0),
                                                stroke: this.clr, fill: (this.opts.fillArea ? this.clr : 'none'),
                                                'class': this.svgClass, 'stroke-width': this.opts.strokeWidth
                                            });

                                    }

                                    // Reset                                        
                                    pnts = []
                                    this.clr = C.nextItemColor().color                                    
                                }

                                if (this.opts.showHeaderLabels) { 

                                    lastPoint = this.labelPos.unique(lastPoint, fontSize, 1)

                                    this.D.paper.text(lastPoint.x, lastPoint.y, this.mapConfig.lblLabelXTextArray[i].header)
                                    .attr({
                                        fill: fontColor
                                    })
                                }

                            })

                            C.iColorItems = 0
                            this.clr = C.nextItemColor().color                                

                            var n = 0

                            // For all measure points
                            this.data.forEach( (col, i) => {
                                
                                if (col.length > 0) {

                                    if(this.opts.colorIter == 2)
                                        this.clr = C.itemAlternateColor(i).color;
                                    else if(this.opts.colorIter == 3)
                                        this.clr = C.itemColor(0).color  

                                    col.forEach((d) => {

                                        // For all values
                                        d.data.forEach((dd, ii) => {

                                            // If no to 
                                            if (dd.to == null) return;

                                            // If there is a x value
                                            if (d.label != null && isNaN(d.label))
                                                x = (parseFloat(String(d.label)))
                                            else
                                                x = d.label                                             

                                            if(lastP){

                                                // If within reach calc angle and draw measure point
                                                var x1 = this.D.toPointX(x),
                                                    y1 = this.D.toPointY(dd.to),
                                                    rp1 = new R.Point(x1, y1)
            
                                                if (x1 && y1) {
            
                                                    var _x = this.D.toPointX(lastP.x),
                                                        _y = this.D.toPointY(lastP.y),
                                                        rp0 = new R.Point(_x, _y)
            
                                                    // Points in graph?
                                                    if (_x && _y) {
            
                                                        // calculate angle
                                                        ang = Math.atan2(rp0.y - rp1.y, rp0.x - rp1.x) * 180 / Math.PI
            
                                                        if (isNaN(ang))
                                                            ang = lastAng
                                                        if (this.opts.drawMarkers)
                                                            this.drawLegendMarker(this.D.paper, _x, _y, ang, n, null, this.clr)

                                                        lastAng = ang
            
                                                    }
                                                                                                    
                                                    lastP = new R.Point(x, dd.to);
                                                } 
                                            }
                                            else{
                                                lastP = new R.Point(x, dd.to)
                                            }

                                        })  

                                    })    
                                    
                                    if (lastP) {

                                        // Calculate marker at the to point 
                                        var _x = this.D.toPointX(lastP.x),
                                            _y = this.D.toPointY(lastP.y)
        
                                        if (isNaN(ang) || /*p == 'M'*/ pnts.length == 0)
                                            ang = lastAng;
        
                                        // If within reach draw it
                                        if (_x && _y && this.opts.drawMarkers)
                                            this.drawLegendMarker(this.D.paper, _x, _y, ang, n, null, this.clr)

                                        lastAng = ang
                                    }                                     
                                    
                                    // Reset for next
                                    lastP = null
                                    x = 0
                                    n++
                                    this.clr = C.nextItemColor().color    
                                    if(this.opts.colorIter == 2)
                                        this.clr = C.itemAlternateColor(i).color;
                                    else if(this.opts.colorIter == 3)
                                        this.clr = C.itemColor(0).color
                                }                                
                            })

                            this.D.paper.use('grid');

                            if(promise)
                                promise('ok')
                        },

                    }
                )
            }
        }
    })