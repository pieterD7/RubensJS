define([
    "rubensjs/rubens",
    "rubensjs/_2d",
    "rubensjs/inlay",
    "rubensjs/interface",
    "rubensjs/PLG/pannableOrigin",
    "rubensjs/PLG/zoomable",
    "rubensjs/PLG/pushableData",
    "rubensjs/PLG/swipeableX",
    "rubensjs/PLG/pullLines",
    "rubensjs/types",
    "rubensjs/colors",
    "util/util"],
    function (Rubens, _2d, L, I, P, Z, PP, S, U, R, C, util) {
        return {
            Range: R.Range,

            Point: R.Point,

            data: null,

            dataSort: null,

            ColumnChart: function (id, fontSize, fontColor, bgColor, axisColor) {

                this.config = null;

                return util.extend(
                    [//new P.PannableOrigin(),

                    new PP.PushableData(),

                    new S.SwipeableX(),

                    new U.PullLines(),

                    new I.I()], {

                        // For use with swipeableX
                        bringToTheFore: ["pullLine"],

                        // This object does not have support for
                        // counters and default marks on x-axis
                        drawMarkersAndLabelsX: false,

                        D: new _2d.D(),

                        id: id,

                        plusStepsX: 0,

                        colorMasksIndex: 0,

                        yAxisMarksAttributes: {
                            "stroke": C['color_overhead_marks'], 
                            // 'transform': 'translate(-20, 0)'
                        },

                        yAxisLabelsAttributes: {
                            "fill": C['color_overhead_labels'],
                            // 'transform': 'translate(-20, 0)'
                        },

                        labelsAttributes: {
                            'letter-spacing': 1
                        },

                        opts: {
                            useMasks: true,          // Use patterns to draw shapes
                            mode: R.CONST.ADD,       
                            cmpMode: 1,
                            divisor: 1,
                            unstack: 0,
                            binaryColors: false,
                            superGroups: false,
                            relativizeValues: false, // Make values relative per row
                            drawLabelsOnTop: true,   // Draw values on top
                            legendItemWidth: 100,
                            startAtEnd: false,       // Start at the right side (swipe backwards)
                            colorIter: 2,            // Color order 1 == rainbow, 2 == alternate, 3 == mono
                            labelType: 1,            // 1 == default, 2 = underneath, 3 == none, 4 == default no circle
                            sort: 0,                 // Sort option  0 == no sort, 1 == fg DESC, 2 == fg ASC, 3 == bg DESC, 4 == bg ASC
                            sortByColNr: null,
                            groupBy: 1,              // Number of grouped columns
                            groupGutter: 0,          // Space between groups
                            baseLineY: 0,            // Base line
                            yValueIsSeconds: false,
                            graphTotal: false,
                        },

                        init: function (config) {

                            //config.halfFontXHeight = 8

                            this.axisColor = axisColor

                            this.fontColor = fontColor

                            this.bgColor = bgColor

                            this.fontSize = fontSize

                            // Save config
                            this.config = config;

                            // Set config, width and height
                            this.D.init(this.id, config);

                            // Make Rubens object
                            this.D.paper = new Rubens(this.id, true, true, fontSize, bgColor);

                            C.color_pull_line_line = axisColor
                            C.color_pull_line_pin_locked = axisColor

                        },

                        legend: new L.Inlay(id),

                        m: 0,

                        groups: 1,

                        newView: true,

                        length: 0,

                        // Overides interface function
                        lengthData: function () {
                            return this.length
                        },

                        // Draw a marker with value (x, y)
                        drawMarker: function(x, y){
                            var x1 = this.D.toPointX(x), 
                                y1 = this.D.toPointY(y);
                            if(x1 && y1)
                                return this.D.paper.mrkrCircle(x1, y1)
                        },

                        // Graph array of values and draw lines in between two points
                        graphValues: function(ar){

                            var clr = C.itemColor(0)

                            ar.forEach( (p) => { 
                                var m = this.drawMarker(p.x, p.y)
                                if(m)
                                    m.attr({ 
                                        stroke: clr.color, 
                                        'stroke-width': this.opts.strokeWidth,
                                        fill: clr.color,
                                    })
                            })

                            this.D.polygon(ar, null, false, false)
                            .attr({
                                stroke: clr.color,
                                'stroke-width': this.opts.strokeWidth,
                            })
                        },

                        drawData1: function (promise, options, animate, reject) {

                            if (options)
                                this.opts = util.extend(options, this.opts)

                            var fg = [],
                                bg = [],
                                brk = 0,
                                dataSort = [];

                            // Calc relative values
                            if (this.opts.relativizeValues === true) { 
                                                                                       
                                this.data = this.toRelativeRowValues(this.data);   
                            }
                                                            
                            // Make one or two columns from one or more
                            if (this.data.length > 1) { 

                                if(this.opts.mode == R.CONST.ADD)
                                    this.cols = this.add(this.data.concat(), this.opts.superGroups)
                                else if(this.opts.mode == R.CONST.CMP)
                                    this.cols = this.compare(this.data.concat())
                                else if (this.opts.mode == R.CONST.SUB) { 
                                    this.cols = this.substract(this.data.concat())
                                }
                                else if (this.opts.mode == R.CONST.SAME) { 
                                    this.cols = this.same(this.data.concat(), this.opts.superGroups)
                                }
                                else if (this.opts.mode == R.CONST.SET){

                                    this.cols = this.add(this.data.concat(), this.opts.superGroups)
                                    
                                    // set grouped
                                    if(!this.opts.superGroups && this.data.length > 2)
                                        this.opts.groupBy = this.data.length
                                    else if(this.opts.superGroups)
                                        this.opts.groupBy = parseInt(this.data.length / 2)
                                }                                 
                            } 
                            else { 
                                this.cols = this.data.concat()
                                this.opts.mode = R.CONST.SAME
                            }

                            this.cols[0].forEach( (d, n) => {

                                fg.push(d)

                            })

                                                        
                            // Compare two columns
                            if (this.opts.mode == R.CONST.CMP
                                || this.opts.superGroups) {

                                this.cols[1].forEach( (d) => {

                                    bg.push(d)
                                })
                            }

                            this.length = fg.length * this.opts.groupBy

                            this.m = 0;

                            this.newView = true

                            var orderAr = null

                            // Sort on foreground or background
                            if (this.opts.sort == 1 || this.opts.sort == 2) {                                    
                                orderAr = this.sort(fg)
                            }
                            else if (this.opts.sort == 3 || this.opts.sort == 4) {                                     
                                orderAr = this.sort(bg)
                            }

                            if (bg.length > 0) {
                                dataSort = bg

                                if(this.opts.sort == 1 || this.opts.sort == 2)
                                    this.data2 = this.applyOrder(dataSort, orderAr)

                                else if(this.opts.sort == 3 || this.opts.sort == 4)
                                    this.data2 = this.sort(dataSort)

                                else if(this.opts.sort == 0)
                                    this.data2 = bg

                                this.draw(true, false, true, false, null)
                            }

                            if (this.opts.sort == 1 || this.opts.sort == 2) { 
                                this.data2 = orderAr
                            }
                            else if (this.opts.sort == 3 || this.opts.sort == 4) { 
                                dataSort = fg                            
                                this.data2 = this.applyOrder(dataSort, orderAr)
                            }
                            else if (this.opts.sort == 0) {
                                this.data2 = fg
                            }

                            this.draw(false, bg.length > 0, bg.length > 0 || this.opts.mode == R.CONST.SUB, animate, promise)


                            // graph total of foreground
                            if (this.opts.graphTotal 
                                && this.opts.mode != R.CONST.ADD
                                && this.cols.length != R.CONST.CMP) { 

                                var a = [];

                                this.data2.forEach( (d, n) => { 
                                                                             
                                    var tot = 0

                                    d.data.forEach( (dd, nn) => { 

                                        tot += dd.to
                                    })
                                                                               
                                    a.push(new R.Point(n * this.opts.groupBy + this.opts.groupBy / 2, tot))

                                })
                                this.graphValues(a)
                            }

                            // If plugin loaded
                            if (typeof this.initSwipeableX == 'function') {

                                if (this.data && this.lengthData() > this.stepsX) {
                                    if (this.opts.startAtEnd) {

                                        this.initSwipeableX(
                                            new R.Point(-1 * this.stepsX + 1, 0),
                                            new R.Point(this.lengthData(), 0),
                                            true,
                                            true)
                                    }
                                    else {
                                        this.initSwipeableX(
                                            new R.Point(0, 0), 
                                            new R.Point(this.lengthData() + this.stepsX - 1, 0), 
                                            true, 
                                            false)
                                    }
                                }

                            }                          
                        },

                        visibleData2: function(data){
                            var r = [],
                                stepsX = this.stepsX;

                            if (this.opts.unstack > 0) {
                                stepsX = parseInt(this.stepsX / 2);
                            }

                            data.forEach( (d, n) => {

                                if(this.opts.mode == R.CONST.SET)
                                    n *= d.data.length

                                if (n >= this.D.reachMinX && n < this.D.reachMinX + this.stepsX ) {
                                    r.push(d)
                                }
                            })

                            return r
                        },

                        draw: function (isBg, shrink, hideLabelsOnTop2, animate, promise) {

                            var color = null,
                                c = 0;

                            this.data3 = this.visibleData2(this.data2)

                            this.data3.forEach((d, i) => {

                                var ni = i + this.D.reachMinX

                                if (animate && this.stepsX < 250) { 

                                    // Animate for about 1 sec.                                    
                                    this.inAnimate = true

                                    setTimeout(() => { 

                                        util.eventHandler(() => {                                           

                                            this.column(d, ni + c, isBg, shrink, hideLabelsOnTop2, color)

                                            if(this.opts.unstack > 0)
                                                c++

                                            if (i == this.data3.length - 1 && promise) {
                                                //this.inAnimate = false
                                                promise('ok')
                                            }                                        
                                        }, errorBox)

                                    }, i * 1000 / this.stepsX)
                                } 
                                else { 
                                            
                                    this.column(d, ni + c, isBg, shrink, hideLabelsOnTop2, color)

                                    if(this.opts.unstack > 0)
                                        c++
                                }

                            })


                            if ((!animate || this.stepsX > 249) && promise) {
                                //this.inAnimate = false
                                promise('ok')
                            }
                            
                        },

                        drawColumnOutOfReach: function(i){

                            var padding = this.D.config.padding || 0,
                                size = (this.D.toPointX(this.D.reachMaxX) - this.D.toPointX(this.D.reachMinX))
                                / this.stepsX
                                - 2 * padding 
                                - parseInt(((this.stepsX - 1) / this.opts.groupBy)) * this.opts.groupGutter / this.stepsX,                                
                                //- ((this.groups - 1) * this.opts.groupGutter / this.stepsX),
                                x = this.D.toPointX(i + 0.5),
                                y = this.D.toPointY(this.opts.baseLineY, -1 * size / 4);
                        
                            this.D.drawCrossOutOfReach(x, y, size / 2, {stroke: '#ff0000', 'stroke-width': 3})                        
                        },

                        nextColorMask: function(color){

                            return this.colorMasksIndex++ 
                        },

                        // call rect() for all data elements of d using x = i
                        column: function(d, i, isBg, shrink, hideLabelsOnTop2, color){

                                // If drawing negative parts we need to stack those
                                var from1 = 0,
                                    from2 = 0,
                                    isNull = false,
                                    isNull2 = false,
                                    m = 0,
                                    msk1 = true; // Needed for the rect stroke

                                // If outside reach, don't draw column at all
                                var t = 0,
                                    t2 = 0;

                                if(this.opts.unstack == 0){
                                    d.data.forEach((dd, ii) => { 

                                        if(this.opts.mode == R.CONST.ADD){
                                            //t += dd.to  
                                            t += R.Float(dd.to)
                                        }
                                        else{
                                            if(dd.to > t)
                                                t = dd.to                                    
                                        }
                                    })                                     
                                }
                                else{
                                    d.data.forEach((dd, ii) => { 

                                        if(this.opts.mode == R.CONST.ADD){
                                            //t += dd.to  
                                            if(ii < this.opts.unstack)
                                                t += R.Float(dd.to)
                                            else
                                                t2 += R.Float(dd.to)
                                        }
                                        else{
                                            if(dd.to > t)
                                                t = dd.to                                    
                                        }
                                    })                                  
                                }

                                if (R.Float(t) > this.D.reachMaxY || R.Float(t) < this.D.reachMinY) { 

                                    this.drawColumnOutOfReach(i)
                                    //return 
                                }

                                if (R.Float(t2) > this.D.reachMaxY || R.Float(t2) < this.D.reachMinY) { 

                                    this.drawColumnOutOfReach(i)
                                    //return 
                                }

                                if(R.Float(t) == 0 && this.opts.relativizeValues)
                                    isNull = true
                                if(R.Float(t2) == 0 && this.opts.unstack > 0)
                                    isNull2 = true


                                if (this.opts.groupBy == 1)
                                    this.groups = 1
                                else
                                    this.groups = (this.D.reachMaxX - this.D.reachMinX) / this.opts.groupBy   

                                d.data.forEach((dd, ii) => {

                                    if (this.opts.mode == R.CONST.ADD || this.opts.mode == R.CONST.SUB) {
                                        if (this.opts.colorIter == 1)
                                            // I like to start with grey at the bottom, which is +5
                                            color = C.itemColor(ii + 5);
                                        else if(this.opts.colorIter == 2)
                                            color = C.itemAlternateColor(ii + 5);

                                        else
                                            color = C.itemColor(0)

                                        // Mark negatives red 
                                        if (this.opts.mode == R.CONST.SUB && dd.to < 0) { 
                                            color = C.itemColor(3)
                                        }

                                    }
                                    else if (this.opts.mode >= 2 && this.opts.mode <= 4) {

                                        if (this.opts.colorIter == 1)
                                            color = C.itemColor(d.row);
                                        else if (this.opts.colorIter == 2)
                                            color = C.itemAlternateColor(d.row);
                                        else
                                            color = C.itemColor(0)

                                        if (this.opts.groupBy > 1 && this.opts.colorIter == 2)
                                            color = C.itemAlternateColor((i) % this.opts.groupBy)
                                        else if (this.opts.groupBy > 1 && this.opts.colorIter == 1)
                                            color = C.itemColor((i) % this.opts.groupBy)

                                        //color.color = C.shadesOfColor(color.color)[4]
                                        //console.log(color.color, C.shadesOfColor(color.color))
                                        //color.color = shadeColor(color.color, 80)

                                    }
                                    else { 

                                        if (this.opts.colorIter == 1)
                                            color = C.itemColor(d.row);
                                        else if (this.opts.colorIter == 2)
                                            color = C.itemAlternateColor(d.row);
                                        else
                                            color = C.itemColor(0)

                                        if (this.opts.groupBy > 1 && this.opts.colorIter == 2)
                                            color = C.itemAlternateColor(ii % this.opts.groupBy)
                                        else if (this.opts.groupBy > 1 && this.opts.colorIter == 1)
                                            color = C.itemColor(ii % this.opts.groupBy)                                    
                                    }

                                    if (isBg && this.opts.cmpMode == 1)                                        
                                        color.color = C.shadesOfColor(color.color, 2)[0]
                                    else if(isBg)
                                        color = { color: axisColor }

                                    var hideLabel = null//ii != d.data.length - 1 ? true : false;

                                    this.colsEven = d.data.length % 2 == 0

                                    if(this.colsEven)
                                        hideLabel = (ii + 1 != d.data.length / 2)
                                    else
                                        hideLabel = (ii + 1 != d.data.length / 2 + 0.5)

                                    var hideLabelsOnTop = false

                                    if(isBg)
                                        hideLabel = true

                                    if(this.opts.mode == R.CONST.ADD && ii+1 != d.data.length)
                                        hideLabelsOnTop = true    

                                    if (this.opts.binaryColors && this.opts.unstack > 0 && ii < d.data.length - this.opts.unstack) { 
                                        color.color = C.shadesOfColor(C.itemColor(3).color, d.data.length)[d.data.length - ii - 1]                                    
                                    }
                                    else if (this.opts.binaryColors && this.opts.unstack > 0) { 
                                        color.color = C.shadesOfColor(C.itemColor(6).color, 
                                            d.data.length)[d.data.length - 1 - (ii - d.data.length + this.opts.unstack)]                                    
                                    }                                   

                                    if (this.opts.unstack > 0 && ii > d.data.length - this.opts.unstack - 1) { 
                                        if (ii == d.data.length - this.opts.unstack) {
                                            i += 1
                                            from1 = 0
                                            from2 = 0
                                            hideLabel = true
                                        }
                                    }                                       

                                    var ni = i,
                                        qi = i;

                                    if (this.opts.mode == R.CONST.SET) {
                                        from1 = 0
                                        from2 = 0
                                        ni = i * this.opts.groupBy + ii

                                        qi = this.D.reachMinX+(i-this.D.reachMinX)*this.opts.groupBy+ii

                                    }


                                    if (dd.to > 0) {

                                        if(this.opts.mode == R.CONST.SUB)
                                            from1 = 0
                                                                                
                                        // Need to draw rect in bgColor for stroke of color
                                        if (this.opts.useMasks 
                                            && color.mask || msk1) { 

                                            var color2 = {color:bgColor, stroke: color.color}

                                            this.rect(ni, R.Float(from1), R.Float(from1 + dd.to), (d.label != 0 ? d.label : '0'), isBg, shrink, color2, true, 
                                                true, false);
                                        }

                                        this.rect(qi, R.Float(from1), R.Float(from1 + dd.to), (d.label != 0 ? d.label : '0'), isBg, shrink, color, hideLabel, hideLabelsOnTop2 || hideLabelsOnTop, (this.opts.unstack == 0 || ii < d.data.length - this.opts.unstack? isNull : isNull2));
                                        
                                        if(this.opts.mode == R.CONST.ADD)
                                            from1 += R.Float(dd.to)
                                    }
                                    else {

                                        if(this.opts.mode == R.CONST.SUB)
                                            from2 = 0

                                        if (this.opts.useMasks
                                            && color.mask || msk1) { 

                                            var color2 = {color:bgColor, stroke: color.color}

                                            this.rect(i, R.Float(from2), R.Float(from2 + dd.to), (d.label != 0 ? d.label : '0'), isBg, shrink, color, true, true, false);
                                        }

                                        this.rect(qi, R.Float(from2), R.Float(from2 + dd.to), (d.label != 0 ? d.label : '0'), isBg, shrink, color, hideLabel, hideLabelsOnTop2 || hideLabelsOnTop, (this.opts.unstack == 0 || ii < d.data.length - this.opts.unstack? isNull : isNull2));
                                        from2 += dd.to
                                    }

                                })                               
                        },

                        drawLabel: function (n, left, width, label, color, mask) {


                            if (this.opts.labelType == 1) {
                                if (label) {

                                    if (this.opts.mode == R.CONST.ADD) {
                                        var t = this.D.paper.text(
                                                    left + width / 2 + 2 * this.D.config.halfFontXHeight,
                                                    this.D.toPointY(this.D.reachMinY, 2 * this.D.config.halfFontXHeight),
                                                    label);

                                        t.attr(
                                            util.extend({
                                                'class': 'label',
                                                'text-anchor': 'start',
                                                'transform': 'rotate(45,' + (left + width / 2 + this.D.config.halfFontXHeight) + " "
                                                    + this.D.toPointY(this.D.reachMinY) + ")",
                                                'fill': fontColor
                                            },
                                                this.labelsAttributes)
                                        );
                                    }

                                    else { 
                                        var t = this.D.paper.text(
                                                    left + width / 2 + 4 * this.D.config.halfFontXHeight,
                                                    this.D.toPointY(this.D.reachMinY, 12 + 2 * this.D.config.halfFontXHeight),
                                                    label);

                                        t.attr(
                                            util.extend({
                                                'class': 'label',
                                                'text-anchor': 'start',
                                                'transform': 'rotate(45,' + (left + width / 2 + 2 * this.D.config.halfFontXHeight) + " "
                                                    + this.D.toPointY(this.D.reachMinY) + ")",
                                                'fill': fontColor
                                            },
                                                this.labelsAttributes)
                                        );

                                        if (this.opts.mode != R.CONST.SET
                                            && this.opts.unstack == 0) { 
                                            this.D.paper.circle(
                                                left + width / 2 + 1,
                                                this.D.toPointY(this.D.reachMinY, 10 + this.D.config.halfFontXHeight),
                                                4)
                                            .attr({
                                                fill: color.color
                                            })                                         
                                        }                                   
                                    }
                                }


                            }
                            else if (this.opts.labelType == 2 || this.opts.labelType == 4){

                                if(this.colsEven && this.opts.labelType == 2)
                                    left += width + this.D.config.padding
                                else
                                    left += 0.5 * width

                                var y = this.D.toPointY(this.D.reachMinY, this.m * 20 + 10 + this.D.config.halfFontXHeight)

                                if (this.opts.labelType == 4 && n % 2 == 1) { 
                                    y = this.D.toPointY(this.D.reachMinY, 1.5*fontSize)
                                }
                                else if(this.opts.labelType == 4)
                                    y = this.D.toPointY(this.D.reachMinY, 3*fontSize)

                                if (label) {

                                    var lft = this.opts.mode != R.CONST.SET && this.opts.labelType == 2? 
                                        this.D.toPointX(this.D.reachMinX, 30 + n * 10) :left, //+ this.D.config.padding / 2: left,
                                        offset = this.opts.unstack == 0 && this.opts.mode != R.CONST.SET? 30 : 0,
                                        t = this.D.paper.text(
                                                lft,
                                                y,
                                                label),
                                        anc = (this.opts.unstack == 0
                                            && this.opts.mode != R.CONST.SET
                                            && this.opts.mode != R.CONST.SUB
                                            && this.opts.labelType == 2) ? 'start' : 'middle';

                                    t.attr(
                                        util.extend({
                                            'class': 'label',
                                            'text-anchor': anc,
                                            'transform': '',
                                            'fill': fontColor
                                        },
                                        this.labelsAttributes)
                                    );

                                    if (this.opts.unstack == 0
                                        && this.opts.mode != R.CONST.SET
                                        && this.opts.mode != R.CONST.SUB
                                        && this.opts.labelType == 2) {
                                        this.D.paper.rect(
                                            this.D.toPointX(this.D.reachMinX, n * 10),
                                            this.D.toPointY(this.D.reachMinY, this.m * 20 + 2 * this.D.config.halfFontXHeight),
                                            20,
                                            5
                                            )

                                        .attr({
                                            'class': 'label',
                                            fill: color.pattern || color.color,
                                            stroke: 'transparent',
                                            'mask': mask
                                        });
                                    }

                                    // Change Y pos
                                    if(this.opts.unstack == 0
                                        && this.opts.mode != R.CONST.SET )
                                        this.m++
                                }
                            }
                        },

                        drawLabelOnTop: function(left, y, width, height, color){

                            // Label on top of column
                            var tdark = null
                            if (typeof color.dark == 'boolean')
                                tdark = color.dark
                            else
                                tdark = C.isDark(color.color)

                            var isHatched = color.mask && this.opts.useMasks

                            // Check if space in the column or above 
                            var miny = this.D.toPointY(this.D.reachMinY, -1 * this.D.config.halfFontXHeight),
                                ay = this.D.toPointY(y, fontSize ),
                                by = '',
                                fll = tdark ? C.text_color_light : C.text_color_dark

                            if (ay < miny) {
                                by = ay
                            }
                            else {
                                by = miny
                                fll = fontColor
                            }

                            if (height < fontSize)
                                fll = fontColor

                            // Draw background for readability
                            if (isHatched) { 
                                this.D.paper.rect(left, by - fontSize + 3, width, fontSize + 4)
                                .attr({ fill: bgColor})

                                fll = fontColor
                            }

                            if (this.opts.yValueIsSeconds) {
                                this.D.paper.text(
                                    left + 0.5 * width,
                                    by,
                                    this.D.toTimeFormat(util.round(y, 2)))
                                .attr({
                                    fill: fll,
                                    'text-anchor': 'middle'
                                });
                            }
                            else{
                                this.D.paper.text(
                                    left + 0.5 * width,
                                    by,
                                    this.opts.divisor == 1? util.round(y, 2) :  util.round(y, 0))
                                .attr({
                                    fill: fll,
                                    'text-anchor': 'middle'
                                });
                            }                        
                        },

                        // Plot column x = n
                        // At minX + left
                        rect: function (n, y1, y, label, isBg, shrink, color, hideLabel, hideLabelsOnTop, isNull) {
                            var padding = this.D.config.padding || 0;

                            //if (n < this.D.reachMaxX && n >= this.D.reachMinX
                            if (n < this.D.reachMinX + this.stepsX && n >= this.D.reachMinX
                                && y <= this.D.reachMaxY && y >= this.D.reachMinY) {

                                this.newView = false

                                if (shrink && this.opts.cmpMode == 0)
                                    padding += 2

                                var width = (this.D.toPointX(this.D.reachMaxX) - this.D.toPointX(this.D.reachMinX))
                                    / this.stepsX
                                    - 2 * padding;

                                if (this.opts.groupBy > 1)
                                    width -= parseInt(((this.stepsX - 1) / this.opts.groupBy)) * this.opts.groupGutter / this.stepsX

                                // Make it zero based
                                var m = n - this.D.reachMinX;

                                var height = 0,
                                    base = 0;
                                if (this.opts.mode != R.CONST.ADD 
                                    /*&& this.data.length == 1*/)
                                    base = this.D.toPointY(this.opts.baseLineY)
                                else
                                    base = this.D.toPointY(y1);

                                var left = this.D.toPointX( Math.max(this.D.reachMinX, 0),
                                           m * (width + 2 * padding)
                                           + parseInt((n - this.D.reachMinX) / (this.stepsX / this.groups)) * this.opts.groupGutter + padding),
                                    top = this.D.toPointY(y),
                                    height = base - this.D.toPointY(y);

                                if (isNaN(left)) return;

                                if (height < 0) {
                                    height = top - base
                                    top = base
                                }


                                if (top && left >= 0 && width > 0) {

                                    // ...
                                    var mask = this.opts.useMasks ? color.mask : '',
                                        strk = isBg ? color.color :  color.color//'transparent';

                                    // With monochrome use one of the masks property of the color
                                    if (this.opts.colorIter == 3
                                        && this.opts.useMasks
                                        && color.masks) {

                                        mask = color.masks[n
                                            % Math.min(color.masks.length, (this.opts.groupBy > 1 ? this.opts.groupBy : Infinity))]
                                        //color.stroke = color.color
                                        //color.mask = mask
                                    }

                                    if (true || this.opts.useMasks) {
                                        width -= 2
                                        left += 1
                                    }

                                    if (color.color == bgColor)
                                        strk = color.stroke


                                    if (this.cols.length == 2
                                        && this.opts.cmpMode == 1) { 
                                        width /= 2 
                                        width -= 2
                                    }

                                    if (isBg && this.opts.cmpMode == 1) { 
                                        left += width + 4                                      
                                    }

                                    if (this.opts.cmpMode == 1) {

                                        this.D.paper.rect(
                                            left,
                                            top,
                                            width,
                                            height
                                        )
                                        .attr({
                                            'stroke': strk,
                                            'stroke-width': '1',
                                            //'stroke-dasharray': isBg ? 2 : 0,
                                            'fill': /*isBg ? 'none' : */color.pattern || color.color,
                                            'mask': mask ? mask : ''
                                        })

                                        if (this.cols.length == 2
                                            && this.opts.cmpMode == 1) {
                                            width *= 2
                                        }
                                    }
                                    else { 
                                        this.D.paper.rect(
                                            left,
                                            top,
                                            width,
                                            height
                                        )
                                        .attr({
                                            'stroke': strk,
                                            'stroke-width': '1',
                                            'stroke-dasharray': isBg ? 2 : 0,
                                            'fill': isBg ? 'none' : color.pattern || color.color,
                                            'mask': mask ? mask : ''
                                        })

                                        if (this.cols.length == 2
                                            && this.opts.cmpMode == 1) { 
                                            width *= 2
                                        }                                    
                                    }

                                }

                                if (this.opts.drawLabelsOnTop && !hideLabelsOnTop) {
                                    this.drawLabelOnTop(left, y, width, height, color)
                                }
                                if (!this.opts.drawLabelsOnTop && isNull) {
                                    if(y == 0)
                                        this.drawLabelOnTop(left, y, width, height, color)
                                }

                                if ((this.opts.unstack > 0
                                    || this.opts.mode == R.CONST.SET)) {

                                    if (/*n % this.opts.groupBy == this.opts.groupBy - 1
                                        &&*/ (!hideLabel)) {
                                        this.drawLabel(m, left, width, label, color, mask)
                                    }
                                }
                                else {
                                    if (!isBg && !hideLabel) {
                                        this.drawLabel(m, left, width, label, color, mask)
                                    }
                                }
                            }


                            else { 
                                //console.log("OUT OF REACH", label, n)
                            }

                        },
                    }
               )
            }
        }
    }
)