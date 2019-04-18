define([    "rubensjs/rubens",
            "rubensjs/_2d",
            "rubensjs/types",
            "util/util",
            "rubensjs/interface",
            "rubensjs/PLG/swipeableX",
             "rubensjs/colors",
             "rubensjs/inlay",
], function (Rubens, _2d, R, util, I, S, C, L) {    

    return {

        // Pie piece colors are based on row indices of the data
        // Color order is optional
        // Doughnut hole should be less then the radius
        // Grouped items have no label and take background color and can have value indicators
        // Order is taken from inner pie
        // Multiple 2 pies share the same inner pie
        // The pie starts at 12 o'clock turning clockwise
        // An arc is ordered biggest piece left, second right, third left above the first etc
        Pie: function (id, fontSize, fontColor, bgColor) {

            return util.extend(
                [
                    new I.I(),

                    new S.SwipeableX()

                ], {
                    D: new _2d.D(),

                    // HTML id of the canvas container without hash
                    id: id,

                    opts: {
                        useMasks: true,         // Use masks to fill shapes
                        mode: R.CONST.ONE_PIE,   
                        makeRadiusFit: false,   // Scale radius of the circle to the width of the container
                        stroke: true,
                        colorIter: 1,           // color order, 1 == rainbow, 2 == alternate   
                        doughnutHole: 33,       // Size of the doughnut hole
                        doughnutHoleInner: 33,
                        doughnutHoleOuter: 70,  // For 2 pies
                        r: 100,                 // Radius
                        rInner: 50,
                        rOuter: 125,
                        drawLabels: true,       // Text labels of the pieces
                        drawValues: true,       // Draw percentage in the piece
                        drawLineToLabel: false,  // Marker line to text labels of the pieces > 3/4
                        groupLastItems: 1,       // Number of last items to group.
                        groupBy: 1,               // Used by scrollwheel handler
                        sortByColNr: null,
                        sort: 1,
                    },

                    pies: null,

                    pieWidth: 0,

                    // For labels
                    lastLabelPos: new R.Point(),

                    lastLabelPos2: new R.Point(),

                    nVisible: 0,

                    yPlus: 0,

                    yPlusLeft: 0,

                    init: function (config) {
                        this.config = config;
                        this.D.init(this.id, config);
                        this.D.paper = new Rubens(this.id, true, true, fontSize, bgColor);
                        this.D.reachMinX = 0

                        this.yPlus = 0
                        this.yPlusLeft = 0
                        this.r = this.opts.r
                    },

                    lengthData: function () {
                        return this.pies.length
                    },

                    drawData1: function (promise, options, animate) {

                        var n = 0;

                        this.pies = []

                        if (options)
                            this.opts = util.extend(options, this.opts)

                        this.data.forEach((d, n) => {

                            this.pies[n] = []

                            if (d.length > 0) {
                                d.forEach((dd) => {
                                    this.pies[n].push(dd)
                                })
                            }
                        })
                            
                        // ... 
                        if (this.opts.sortByRow && this.opts.sortByRow != "0") {
                            var row = parseInt(this.opts.sortByRow.split(" ")[0]),
                                dir = this.opts.sortByRow.split(" ")[1];

                            if (dir == 'D')
                                this.opts.sort = 1
                            else if (dir == 'A')
                                this.opts.sort = 2

                            if (dir == 'D' || dir == 'A') {
                                this.pies2 = []

                                this.pies.forEach((p) => {
                                    this.pies2.push(this.toRelativeColValues(p))
                                })

                                this.pies = this.sortByRow(this.pies2, row)

                                var ordr = this.getColOrder(this.pies, row),
                                    hdrs = [];

                                ordr.forEach((i) => {

                                    var q = this.mapConfig.lblLabelXTextArray
                                        .filter((o) => { if (o.col == i) return o })

                                    if(q[0])
                                        hdrs.push(q[0])
                                })

                                this.mapConfig.lblLabelXTextArray = hdrs
                            }

                        } 
                        else { 
                            var ordr = this.getColOrder(this.pies, 0),
                                hdrs = [];

                            ordr.forEach((i) => {

                                var q = this.mapConfig.lblLabelXTextArray
                                    .filter((o) => { if (o.col == i) return o })

                                if(q[0])
                                    hdrs.push(q[0])
                            })

                            this.mapConfig.lblLabelXTextArray = hdrs                        
                        }
                        

                        if (this.opts.mode == R.CONST.ONE_PIE) {
                            this.pieWidth = this.opts.r * 3
                        }
                        else if (this.opts.mode == R.CONST.TWO_PIES) {
                            this.pieWidth = this.opts.rOuter * 3
                        }
                        else if (this.opts.mode == R.CONST.ARC) {
                            this.pieWidth = 300
                        }

                        this.nVisible = Math.max(parseInt(this.D.w / this.pieWidth), 1)

                        this.stepsX = this.nVisible
                        this.setRangeX(this.D.reachMinX, this.D.reachMinX + this.nVisible)

                        // Avoid sharing yPlus
                        if(this.nVisible > 1)
                            animate = false

                        var ps = this.pies.concat()

                        if (this.opts.mode == R.CONST.ONE_PIE) {
                            this.drawDataMode1(this.add(ps), animate, promise)
                        }
                        else if (this.opts.mode == R.CONST.TWO_PIES) {
                            this.drawDataMode2(this.add(ps), animate, promise)
                        }
                        else if (this.opts.mode == R.CONST.ARC) {
                            this.drawDataMode3(this.add(ps), animate, promise)
                        }
                        else
                            promise('ok')

                        // If plugin loaded
                        if (typeof this.initSwipeableX == 'function' 
                            && !this.hasSwipeHandler) {

                            this.checkSwipeYWithinGraph = false

                            if (this.pies) {

                                this.initSwipeableX(
                                    new R.Point(0, 0), 
                                    new R.Point(this.pies.length - (this.opts.mode == R.CONST.TWO_PIES ? 1 : 0), 0), false)
                            }
                        }
                    },

                    drawDataMode1: function (pies, animate, promise) {
                        var x = 0,
                            y = this.D.toPointY(this.D.reachMaxY),
                            clrs = []

                        if (!pies[0] || !pies[0][0]) {
                            promise('ok')
                            return
                        }

                        this.r = this.opts.r

                        if (this.opts.makeRadiusFit) {
                            this.r = this.D.w / 2 / 1.5
                            if (this.opts.doughnutHole > 0)
                                this.opts.doughnutHole = this.r / 3
                        }


                        for (var c = this.D.reachMinX; c < this.D.reachMinX + this.nVisible; c++) { 
                               
                            // Sort pie pieces clockwise large to small 
                            var p = this.sort(pies[0], c)

                            this.drawTitle(c, p[0].data[c].col, 
                                2 * this.opts.r + 5 * fontSize + (this.mapConfig.lblXOffset ? this.mapConfig.lblXOffset : 0))

                            this.drawPie(c, y, p, true, false, true, false, animate, promise)
                        }

                    },

                    drawTitle: function (c, n, y) {

                        var cc = this.next(c)

                        if (n && cc && this.mapConfig.lblLabelXTextArray
                            /*&& this.mapConfig.lblLabelXTextArray[n]*/) {

                            this.D.paper.text(
                                cc,
                                this.D.toPointY(this.D.reachMaxY, y),
                                this.mapConfig.lblLabelXTextArray.filter((o) => {if (o && o.col == n) return o})[0].header)

                            .attr({
                                'font-size': '100%',
                                //'font-weight': 'bold',
                                'fill': fontColor,
                                'text-anchor': 'middle'
                            })
                        }
                    },

                    drawDataMode2: function (pies, animate, promise) {

                        if (!pies[0]) return

                        if (this.opts.makeRadiusFit) {

                            var rd = this.opts.rOuter / this.opts.rInner,
                                rr = this.opts.rOuter / this.opts.doughnutHoleOuter,
                                rh = this.opts.doughnutHoleOuter / this.opts.doughnutHoleInner

                            this.opts.rOuter = this.D.w / 2
                            this.opts.rInner = this.opts.rOuter * 1 / rd
                            this.opts.doughnutHoleOuter = this.opts.rOuter * 1 / rr
                            this.opts.doughnutHoleInner = this.opts.doughnutHoleOuter * 1 / rh
                        }

                        var a = this.calcPieData(pies)

                        a = this.sort(a, 0)

                        for (var c = this.D.reachMinX + 1; c < this.D.reachMinX + this.nVisible + 1; c++) { 
                            this.r = this.opts.rOuter

                            this.opts.doughnutHole = this.opts.doughnutHoleOuter

                            this.draw2PiesOuter(a, c)

                            this.yPlus = 0

                            this.r = this.opts.rInner

                            this.opts.doughnutHole = this.opts.doughnutHoleInner
                            
                            this.drawTitles2(c, a[0].data[c].col)                        

                            this.draw2PiesInner(a, c, animate, promise)                        
                        }

                    },

                    drawTitles2: function (n, col) {
                        var attr = {
                            'font-size': '100%',
                            //'font-weight': 'bold',
                            'fill': this.mapConfig.fontColor,
                            'text-anchor': 'middle'
                        }

                        var x1 = this.next(n - 1)
                            
                        if (x1) {

                            // Show text + utf8 glyph small circle for inner pie
                            this.D.paper.text(
                                x1,
                                this.D.toPointY(this.D.reachMaxY, 2 * this.opts.rOuter + 5 * fontSize + this.mapConfig.lblXOffset),
                                    this.mapConfig.lblLabelXTextArray[0].header + " &#x25CB;")

                            .attr(attr)

                            // Show text + utf8 glyph large circle for outer pie
                            this.D.paper.text(
                                x1,
                                this.D.toPointY(this.D.reachMaxY, 
                                    2 * this.opts.rOuter + 6.5 * fontSize + (this.mapConfig.lblXOffset ? this.mapConfig.lblXOffset : 0)),
                                    this.mapConfig.lblLabelXTextArray.filter((o) => {if (o && o.col == col) return o})[0].header + " &#x25EF;")

                            .attr(attr)
                        }
                    },

                    drawDataMode3: function (pies, animate, promise) {

                        if (!pies[0]) return

                        var y = this.D.toPointY(this.D.reachMaxY)

                        this.r = this.opts.rOuter

                        this.opts.doughnutHole = this.r / 3

                        if (this.opts.makeRadiusFit) {
                            this.r = this.D.w / 2 / 1.5
                            this.opts.doughnutHole = this.r / 3
                        }

                        /*pies.forEach((p, n) => {
                            if(n >= this.D.reachMinX && n < this.D.reachMinX + this.nVisible){
                                this.drawArc(n, y, p, animate, promise)
                                this.drawTitle(n, this.r + 5 * fontSize + (this.mapConfig.lblXOffset ? this.mapConfig.lblXOffset : 0))
                            
                            }
                        })*/

                        for (var c = this.D.reachMinX; c < this.D.reachMinX + this.nVisible; c++) { 
                              
                            // ...
                            //if(pies[0][0].data[c]){

                                var p = pies[0]//this.sort(pies[0], c)

                                if (!p) { 
                                    promise('ok')
                                }

                                this.drawTitle(c, p[0].data[c].col, this.r + 5 * fontSize + (this.mapConfig.lblXOffset ? this.mapConfig.lblXOffset : 0))

                                this.drawArc(c, y, p, animate, promise)                            
                            //}
                        }
                    },

                    drawPie: function (x, y, data, drawlabels, drawValues, calcPieData, drawInner, animate, promise) {

                        var a = [],
                            b = [],
                            tot = 0

                        // Reset for labels Y not overlapping
                        this.yPlus = 0

                        if (calcPieData)
                            a = this.calcPieData([data])
                        else {
                            a = data
                        }


                        // Radius
                        var r = this.r,

                            // Pixel pos X
                            xp = 0


                        xp = this.next(x)
                        if (!xp) {  
                            
                            if(promise)
                                promise('ok')

                            return
                        }

                        var dgr = 0

                        a.forEach((dd, m) => { 

                            dd.data.forEach((d, n) => { 

                                if(drawInner)
                                    x = 0

                                if (n == x + (drawInner || this.opts.mode != R.CONST.TWO_PIES? 0 : 1)) { 
                                    var strkW = d.toR < 0.01 ? '1px' : '1px',
                                        clr = this.opts.colorIter == 2 ? C.itemAlternateColor(dd.row) : C.itemColor(dd.row),
                                        strkClr = clr.color,
                                        hasBgColor = false
                                   

                                    if (m > a.length - parseInt(this.opts.groupLastItems)) {
                                        clr.dark = false
                                        clr.color = bgColor
                                        hasBgColor = true
                                    }
                                    

                                    if (this.opts.stroke) {
                                        // 'none' or 'transparent' causes problem w/ visible lines as hairlines
                                        strkClr = 'none'

                                        // To 'fix'
                                        strkClr = bgColor

                                        //strkW = '0.00001mm'
                                    }

                                    var mask = ''

                                    if(this.opts.useMasks && clr.mask)
                                        mask = clr.mask

                                    if (animate) { 
                                
                                        this.inAnimate = true

                                        var t1 = setTimeout(() => { 
                                            this.drawPiePiece(d.toR, xp, y, this.opts.doughnutHole > 0)
                                            .attr({
                                                'fill-rule': "evenodd",
                                                fill: clr.color,
                                                stroke: strkClr,
                                                mask : mask,
                                                'stroke-width': strkW,
                                                transform: 'rotate(' + ((dgr) * 360) + ' ' + xp + ' ' + (y + r) + ')'
                                            })

                                            if (!hasBgColor && drawlabels && (this.opts.drawLabels || this.opts.drawValues)) {

                                                this.drawLabel(xp, y, clr, dgr, d.toR, dd.label)

                                            }
                                            if (!hasBgColor && drawValues && this.opts.drawValues) {
                                                this.drawValueInnerPie(xp, y, clr, dgr, d.toR)
                                            }

                                            dgr += d.toR  
                                    
                                            if (m == a.length - 1) {
                                        
                                                //this.inAnimate = false

                                                // Avoid the ghost spokes bug in rendering svg engine
                                                this.D.paper.circle(xp, y + this.r, this.opts.doughnutHole)
                                                .attr({ fill: bgColor })

                                                if(promise)
                                                    promise('ok')
                                            }

                                        }, m * 50)                            
                                    } 
                                    else { 
                                        this.drawPiePiece(d.toR, xp, y, this.opts.doughnutHole > 0)
                                        .attr({
                                            'fill-rule': "evenodd",
                                            fill: clr.color,
                                            stroke: strkClr,
                                            mask : mask,
                                            'stroke-width': strkW,
                                            transform: 'rotate(' + ((dgr) * 360) + ' ' + xp + ' ' + (y + r) + ')'
                                        })

                                        if (!hasBgColor && drawlabels && (this.opts.drawLabels || this.opts.drawValues)) {

                                            this.drawLabel(xp, y, clr, dgr, d.toR, dd.label)

                                        }
                                        if (!hasBgColor && drawValues && this.opts.drawValues) {
                                            this.drawValueInnerPie(xp, y, clr, dgr, d.toR)
                                        }

                                        dgr += d.toR 

                                    }

                                    if (!animate && m == a.length - 1) {                         

                                        // Avoid the ghost spokes bug in rendering svg engine
                                        this.D.paper.circle(xp, y + this.r, this.opts.doughnutHole)
                                        .attr({ fill: bgColor })

                                        if(promise)
                                            promise('ok')
                                    }
                           
                                }

                            })                        
                        })                            
                            
                   },

                    drawArc: function (x, y, p, animate, promise) {
                        var a = [],
                            tot = 0,
                            dgr = 0,
                            xp = 0,
                            strkClr = null,
                            strkW = '1px'

                        // Reset for labels Y not overlapping
                        this.yPlus = 0
                        this.yPlusLeft = 0



                        a = this.calcPieData([p])

                        a = this.sort(a, x)

                        xp = this.next(x)
                        if (!xp) { 
                            if(promise)
                                promise('ok')                        
                            return 
                        }


                        // For labels with arc, need to add pieces from bottom to top
                        // in orer to calc overlapping labels
                        var b = [],
                            c = [],
                            dgr = 0

                        a.forEach((d) => {
                            d.dgr = dgr
                            dgr += d.data[x].toR / 2
                            b.push(d)
                        })

                        var nn = b.length
                        for (var n = 0; n < nn; n++) {
                            var q = null
                            if (n % 2 == 0) {
                                q = b.pop()
                            }
                            else {
                                q = b.shift()
                            }
                            c.push(q)
                        }

                        c.forEach((d, n) => {

                            var clr = this.opts.colorIter == 2 ? C.itemAlternateColor(d.row) : C.itemColor(d.row),
                                mask = '',
                                hasBgColor = false;

                            if(n > c.length - parseInt(this.opts.groupLastItems))
                                hasBgColor = true

                            if(this.opts.useMasks && clr.mask)
                                mask = clr.mask

                            if (animate) {

                                this.inAnimate = true

                                setTimeout(() => {

                                    strkClr = clr.color

                                    if (this.opts.stroke)
                                        strkClr = bgColor
                                    else {
                                        strkW = 0;
                                        strkClr = 'none'
                                    }

                                    this.drawPiePiece(d.data[x].toR / 2, xp, y, this.opts.doughnutHole)
                                    .attr({
                                        'fill-rule': "evenodd",
                                        fill: hasBgColor ? bgColor : clr.color,
                                        stroke: strkClr,
                                        mask: mask,
                                        'stroke-width': strkW,
                                        transform: 'rotate(' + ((d.dgr * 360) - 90) + ' ' + xp + ' ' + (y + this.opts.rOuter) + ')'
                                    })


                                    if (this.opts.drawLabels && !hasBgColor) {

                                        this.drawLabel2(xp, y, clr, d.dgr, d.data[x].toR, d.label, hasBgColor)

                                    }

                                    if (n == c.length - 1) {
                                        //this.inAnimate = false

                                        // Avoid the ghost spokes bug in rendering svg engine
                                        this.D.paper.circle(xp, y + this.r, this.opts.doughnutHole)
                                        .attr({ fill: bgColor })

                                        if(promise)
                                            promise('ok')
                                    }

                                }, n * 50)
                            }
                            else { 

                                strkClr = clr.color

                                if (this.opts.stroke)
                                    strkClr = bgColor
                                else {
                                    strkW = 0;
                                    strkClr = 'none'
                                }

                                this.drawPiePiece(d.data[x].toR / 2, xp, y, this.opts.doughnutHole)
                                .attr({
                                    'fill-rule': "evenodd",
                                    fill: hasBgColor ? bgColor : clr.color,
                                    stroke: strkClr,
                                    mask: mask,
                                    'stroke-width': strkW,
                                    transform: 'rotate(' + ((d.dgr * 360) - 90) + ' ' + xp + ' ' + (y + this.opts.rOuter) + ')'
                                })


                                if (this.opts.drawLabels  && !hasBgColor) {

                                    this.drawLabel2(xp, y, clr, d.dgr, d.data[x].toR, d.label, hasBgColor)

                                }     
                                
                            }

                            // Avoid the ghost spokes bug in rendering svg engine
                            /*this.D.paper.circle(xp, y + this.r, this.opts.doughnutHole)
                            .attr({ fill: bgColor })

                            if(!animate && promise)                                            
                                promise('ok')   */
                        
                            if (!animate && n == c.length - 1) {                         

                                // Avoid the ghost spokes bug in rendering svg engine
                                this.D.paper.circle(xp, y + this.r, this.opts.doughnutHole)
                                .attr({ fill: bgColor })

                                if(promise)
                                    promise('ok')
                            }

                        })

                    },

                    draw2PiesInner: function (data, n, animate, promise) {
                        var y = this.D.toPointY(this.D.reachMaxY, this.opts.rOuter - this.r)

                        this.drawPie(n - 1, y, data, false, true, false, true, animate, promise)
                    },

                    draw2PiesOuter: function (data, n) {
                        var y = this.D.toPointY(this.D.reachMaxY)

                        this.drawPie(n - 1, y, data, true, false, false, false, false)
                    },

                    calcPieData: function (data) {
 
                        return this.toRelativeColValues(data[0])                 

                    },

                    next: function (x) {

                        return this.D.toPointX(x + 0.5)
                    },

                    sort: function (a, col) {

                        if(!a[0] || !a[0].data[col]) return false

                        var a = a.sort(function (a, b) {
                            return b.data[col].to - a.data[col].to
                        })

                        // Sort arc: highest left, second right and so on
                        if (this.opts.mode == R.CONST.ARC) {

                            var b = [],
                                c = []

                            a.forEach((el, n) => {
                                if (n % 2 == 0) {
                                    b.push(el)
                                }
                                else {
                                    c.push(el)
                                }
                            })

                            a = b.concat(c.reverse())
                        }

                        return a
                    },

                    formatValue: function (val) {
                        var cln = 0.01.toLocaleString().substring(1, 2)
                        if (val % 1 == 0)
                            val += cln + '0'
                        else
                            val = val.toLocaleString()

                        return val
                    },

                    drawValueInnerPie: function (x, y, color, dgr, to) {
                        var hole = Math.max(20, this.opts.doughnutHoleInner),
                            p = this.D.pointOnCircleWithAngleFromCenter(this.r / 2 + hole / 2, R.Float(dgr + to / 2)),
                            val = util.round(to * 100, 1),
                            clr = color.dark === true|| C.isDark(color.color) ? '#ffffff' : '#000000'

                        if (to < 0.05) return

                        val = this.formatValue(val)

                        if (dgr + to / 2 >= 0.75) {

                            // Draw rectangle of bgColor behind label
                            if (this.opts.useMasks && color.mask) { 

                                this.D.paper.rect(
                                    x + p.x - (this.r / 2 + hole / 2) - val.length * fontSize / 4,
                                    p.y + y + this.r - fontSize + fontSize / 2,
                                    val.length * fontSize / 2,
                                    fontSize + 1
                                )
                                .attr({
                                    'fill': color.color
                                })
                            }

                            this.D.paper.text(
                                x + p.x - (this.r / 2 + hole / 2),
                                p.y + y + this.r,
                                val
                             )
                             .attr({
                                 'text-anchor': 'middle',
                                 'fill': clr
                             })
                        }
                        else {

                            // Draw rectangle of bgColor behind label
                            if (this.opts.useMasks && color.mask) { 

                                this.D.paper.rect(
                                    x + p.x - val.length * fontSize / 4,
                                    p.y + y + this.r - this.r / 2 - hole / 2 - fontSize + fontSize / 2,
                                    val.length * fontSize / 2,
                                    fontSize + 1
                                )
                                .attr({
                                    'fill': color.color
                                })
                            }

                            this.D.paper.text(
                                x + p.x,
                                p.y + y + this.r - this.r / 2 - hole / 2,
                                val
                            )
                            .attr({
                                'text-anchor': 'middle',
                                'fill': clr
                            })
                        }
                    },

                    drawLabel: function (x, y, color, dgr, to, label) {
                        var offs = fontSize, // Space between labels and circle

                            // Outer circle
                            p = this.D.pointOnCircleWithAngleFromCenter(this.r + offs, R.Float(dgr + to / 2)),

                            // Inner circle
                            p2 = this.D.pointOnCircleWithAngleFromCenter(this.r, R.Float(dgr + to / 2)),

                            p3 = this.D.pointOnCircleWithAngleFromCenter((this.r / 3) * 2, R.Float(dgr + to / 2)),

                            p4 = this.D.pointOnCircleWithAngleFromCenter(this.r - (this.r - this.opts.doughnutHoleOuter) / 2, R.Float(dgr + to / 2))


                        var clr = color.dark === true || C.isDark(color.color) ? '#ffffff' : '#000000',
                            val = util.round(to * 100, 1)

                        val = this.formatValue(val)


                        if (dgr + to / 2 >= 0.75) {
                            if (this.lastLabelPos.matches(
                                    new R.Rect(
                                        new R.Point(
                                            x + p.x - this.r - offs - 8 * fontSize,
                                            p.y + y + this.r - this.yPlus - fontSize),
                                        new R.Point(
                                            x + p.x - this.r - offs + 8 * fontSize,
                                            p.y + y + this.r - this.yPlus + fontSize)
                                    ))
                                )
                                this.yPlus += fontSize


                            if (this.opts.drawValues && this.opts.mode == R.CONST.ONE_PIE && to >= 0.04) {

                                // Draw rectangle of bgColor behind label
                                if (this.opts.useMasks && color.mask) { 

                                    this.D.paper.rect(
                                        x + p3.x - (this.r / 3) * 2 - val.length * fontSize / 4,
                                        p3.y + y + this.r - fontSize + fontSize / 2,
                                        val.length * fontSize / 2,
                                        fontSize + 1
                                    )
                                    .attr({
                                        'fill': color.color
                                    })
                                }

                                this.D.paper.text(
                                    x + p3.x - (this.r / 3) * 2,
                                    p3.y + y + this.r,
                                    val)
                                 .attr({
                                     'text-anchor': 'middle',
                                     'fill': clr
                                 })
                            }
                            else if (this.opts.drawValues && this.opts.mode == R.CONST.TWO_PIES && to >= 0.04) {

                                // Draw rectangle of bgColor behind label
                                if (this.opts.useMasks && color.mask) { 

                                    this.D.paper.rect(
                                         x + p4.x - this.r + (this.r - this.opts.doughnutHoleOuter) / 2 - val.length * fontSize / 4,
                                        p4.y + y + this.r - fontSize + fontSize / 2,
                                        val.length * fontSize / 2,
                                        fontSize + 1
                                    )
                                    .attr({
                                        'fill': color.color
                                    })
                                }


                                this.D.paper.text(
                                    x + p4.x - this.r + (this.r - this.opts.doughnutHoleOuter) / 2,
                                    p4.y + y + this.r,
                                    val)
                                 .attr({
                                     'text-anchor': 'middle',
                                     'fill': clr
                                 })
                            }

                            if (this.opts.drawLabels) {
                                this.D.paper.text(
                                    x + p.x - this.r - offs - (this.opts.drawLineToLabel ? 4 : 0),
                                    p.y + y + this.r - this.yPlus, label)

                                .attr({ 'text-anchor': 'end', fill: fontColor })

                                this.lastLabelPos.x = x + p.x - this.r - offs
                                this.lastLabelPos.y = p.y + y + this.r - this.yPlus

                                if (this.opts.drawLineToLabel) {
                                    this.D.paper.path("M " +
                                        (x + p2.x - this.r) + " " + (p2.y + y + this.r) +
                                        " " +
                                        (x + p.x - this.r - offs) + " " + (p.y + y + this.r - this.yPlus)
                                    )
                                    .attr({ stroke: color.color })
                                }
                            }

                        }
                        else {

                            // Adjust lastPosition
                            this.lastLabelPos.x = p.x + x
                            this.lastLabelPos.y = p.y + y - offs - this.yPlus

                            if (this.opts.drawValues && this.opts.mode == R.CONST.ONE_PIE && to >= 0.04) {

                                // Draw rectangle of bgColor behind label
                                if (this.opts.useMasks && color.mask) { 

                                    this.D.paper.rect(
                                        x + p3.x - val.length * fontSize / 4,
                                        p3.y + y + this.r - (this.r / 3) * 2 - fontSize + fontSize / 2,
                                        val.length * fontSize / 2,
                                        fontSize + 1
                                    )
                                    .attr({
                                        'fill': color.color
                                    })
                                }

                                this.D.paper.text(
                                    x + p3.x,
                                    p3.y + y + this.r - (this.r / 3) * 2,
                                    val)
                                .attr({
                                    'text-anchor': 'middle',
                                    'fill': clr
                                })
                            }
                            else if (this.opts.drawValues && this.opts.mode == R.CONST.TWO_PIES && to >= 0.04) {
                                var clr = color.dark === true || C.isDark(color.color) ? '#ffffff' : '#000000'

                                // Draw rectangle of bgColor behind label
                                if (this.opts.useMasks && color.mask) { 

                                    this.D.paper.rect(
                                        x + p4.x - val.length * fontSize / 4,
                                        p4.y + y + (this.r - this.opts.doughnutHoleOuter) / 2 - fontSize + fontSize / 2,
                                        val.length * fontSize / 2,
                                        fontSize + 1
                                    )
                                    .attr({
                                        'fill': color.color
                                    })
                                }


                                this.D.paper.text(
                                    x + p4.x,
                                    p4.y + y + (this.r - this.opts.doughnutHoleOuter) / 2,
                                    val)
                                .attr({
                                    'text-anchor': 'middle',
                                    'fill': clr
                                })
                            }

                            if (this.opts.drawLabels) {
                                var l = this.D.paper.text(p.x + x, p.y + y - offs - this.yPlus, label)
                                if (p2.y == 2 * this.r) {
                                    l.attr({ 'text-anchor': 'middle', fill: fontColor })
                                }
                                else if (this.lastLabelPos.x > x) {
                                    l.attr({ 'text-anchor': 'start', fill: fontColor })
                                }
                                else {
                                    l.attr({ 'text-anchor': 'end', fill: fontColor })
                                }
                            }
                        }
                    },


                    drawLabel2: function (x, y, color, dgr, to, label) {

                        var right = false
                        if (dgr > 0.25) right = true

                        var offs = fontSize, // Space between labels and circle

                        // For arc: 0 < dgr < 0.25 || 0.75 < dgr < 1 
                        p = this.D.pointOnCircleWithAngleFromCenter(this.opts.rOuter + offs, R.Float((0.75 + dgr + to / 4) % 1)),

                        p2 = this.D.pointOnCircleWithAngleFromCenter(this.opts.rOuter - (this.opts.rOuter - this.opts.doughnutHole) / 2, R.Float((0.75 + dgr + to / 4) % 1)),

                        l = null,

                        clr = color.dark === true || C.isDark(color.color) ? '#ffffff' : '#000000',

                        val = util.round(to * 100, 1);


                        val = this.formatValue(val)

                        // near the top labels might overlap
                        // and we could do something about it
                        if (dgr + to / 4 > 0.30 / 2 && dgr + to / 4 < 0.70 / 2) {

                            if (right && this.lastLabelPos && this.lastLabelPos.matches(
                                    new R.Rect(
                                        new R.Point(
                                            x + p.x - 8 * fontSize,
                                            p.y + y - 1 * fontSize - this.yPlus),
                                        new R.Point(
                                            x + p.x + 8 * fontSize,
                                            p.y + y + 1 * fontSize + this.yPlus)
                                    ))
                                ) {
                                var dlt = fontSize //- (p.y + y - this.lastLabelPos.y)
                                this.yPlus += dlt//fontSize
                            }

                            else if (!right && this.lastLabelPos2 && this.lastLabelPos2.matches(
                                 new R.Rect(
                                        new R.Point(
                                            x + p.x - this.opts.rOuter - offs - 8 * fontSize,
                                            p.y + y + this.opts.rOuter + offs - this.yPlusLeft - offs - 1 * fontSize),
                                        new R.Point(
                                            x + p.x - this.opts.rOuter - offs + 8 * fontSize,
                                            p.y + y + this.opts.rOuter + offs - this.yPlusLeft - offs + 1 * fontSize)
                                    ))
                                ) {
                                var dlt = fontSize// (p.y + y - 1 * fontSize - this.yPlusLeft) -  this.lastLabelPos2.y
                                this.yPlusLeft += dlt
                            }
                        }

                        // If large enough piece to have a label
                        if (to / 4 > 0.007) {
                            if (0.75 + dgr + to / 4 < 1) {
                                var qx = x + p.x - this.opts.rOuter - offs
                                if (right) {
                                    var qy = p.y + y + this.opts.rOuter + offs - this.yPlus - offs
                                    this.lastLabelPos.x = qx
                                    this.lastLabelPos.y = qy
                                }
                                else {
                                    var qy = p.y + y + this.opts.rOuter + offs - this.yPlusLeft - offs
                                    this.lastLabelPos2.x = qx
                                    this.lastLabelPos2.y = qy
                                }

                                this.D.paper.text(
                                    qx,
                                    qy, label)

                                .attr({ 'text-anchor': 'end', fill: fontColor })

                                if (this.opts.drawValues && to >= 0.08) {
                                    var clr = color.dark === true || C.isDark(color.color) ? '#ffffff' : '#000000'

                                    // Draw rectangle of bgColor behind label
                                    if (this.opts.useMasks && color.mask) { 

                                        this.D.paper.rect(
                                            x + p2.x - this.opts.rOuter + (this.opts.rOuter - this.opts.doughnutHole) / 2 - val.length * fontSize / 4,
                                            p2.y + y + this.opts.rOuter - fontSize + fontSize / 2,
                                            val.length * fontSize / 2,
                                            fontSize + 1
                                        )
                                        .attr({
                                            'fill': color.color
                                        })
                                    }

                                    this.D.paper.text(
                                        x + p2.x - this.opts.rOuter + (this.opts.rOuter - this.opts.doughnutHole) / 2,
                                        p2.y + y + this.opts.rOuter,
                                        val)
                                    .attr({
                                        'text-anchor': 'middle',
                                        'fill': clr
                                    })
                                }
                            }
                            else {
                                var qx = p.x + x
                                if (right) {
                                    var qy = p.y + y - offs - this.yPlus
                                    this.lastLabelPos.x = qx
                                    this.lastLabelPos.y = qy
                                }
                                else {
                                    var qy = p.y + y - offs - this.yPlusLeft
                                    this.lastLabelPos2.x = qx
                                    this.lastLabelPos2.y = qy
                                }

                                l = this.D.paper.text(qx, qy, label)
                                l.attr({ 'text-anchor': 'start', fill: fontColor })


                                if (this.opts.drawValues && to >= 0.08) {

                                    // Draw rectangle of bgColor behind label
                                    if (this.opts.useMasks && color.mask) { 

                                        this.D.paper.rect(
                                            x + p2.x - val.length * fontSize / 4,
                                            p2.y + y + this.opts.rOuter - (this.opts.rOuter / 3) * 2 - fontSize + fontSize / 2,
                                            val.length * fontSize / 2,
                                            fontSize + 1
                                        )
                                        .attr({
                                            'fill': color.color
                                        })
                                    }

                                    this.D.paper.text(
                                        x + p2.x,
                                        p2.y + y + this.opts.rOuter - (this.opts.rOuter / 3) * 2,
                                        val)
                                    .attr({
                                        'text-anchor': 'middle',
                                        'fill': clr
                                    })
                                }
                            }
                        }
                            // No labels so we can sub from the offset
                        else {
                            if (this.yPlus > fontSize)
                                this.yPlus -= fontSize
                        }
                    },

                    // ...
                    // Stroke is visible whem clipped (doughnuthole)
                    drawPiePiece: function (p, x, y, hole) {
                        var rr = this.opts.doughnutHole,
                            dx = this.r,
                            dy = this.r,
                            r = this.r,
                            d = this.D.pointOnCircleWithAngleFromCenter(r, p),
                            dd = this.D.pointOnCircleWithAngleFromCenter(rr, p)

                        if (p <= 0.50) {
                            var hle = " M " + x + "," + (y + r) +
                                " L " + x + "," + (y + r - rr) +
                                " a " + rr + "," + rr + " 1 0,1 " + (dd.x) + "," + (dd.y) +
                                " Z "
                            var o = this.D.paper.path(
                                "M" + x + "," + (y + r) +
                                " L" + x + "," + y +
                                " a " + r + "," + r + " 1 0,1 " + (d.x) + "," + (d.y) +
                                " Z " + (hole ? hle : '')
                                )
                        }
                        else if (p <= 0.75) {
                            var hle = " M " + x + "," + (y + r) +
                                " L" + x + "," + (y + r - rr) +
                                " a " + rr + "," + rr + " 1 1,1 " + (dd.x) + "," + (dd.y) +
                                " Z "
                            var o = this.D.paper.path(
                                "M" + x + "," + (y + r) +
                                " L" + x + "," + y +
                                " a " + r + "," + r + " 1 1,1 " + (d.x) + "," + (d.y) +
                                " Z " + (hole ? hle : "")
                                )
                        }
                        else if (p <= 1.0) {
                            var hle = " M " + x + "," + (y + r) +
                               " L" + x + "," + (y + r - rr) +
                               " a " + rr + "," + rr + " 0 1,1 " + (-1 * rr) + "," + (rr) +
                               " a " + rr + "," + rr + " 0 0,1 " + dd.x + "," + dd.y +
                               " Z "
                            var o = this.D.paper.path(
                               "M" + x + "," + (y + r) +
                               " L" + x + "," + y +
                               " a " + r + "," + r + " 0 1,1 " + (-1 * r) + "," + (r) +
                               " a " + r + "," + r + " 0 0,1 " + (d.x) + "," + (d.y) +
                               " Z " + (hole ? hle : "")
                               )

                        }
                        return o
                    }
                }
            )
        }
    }
})