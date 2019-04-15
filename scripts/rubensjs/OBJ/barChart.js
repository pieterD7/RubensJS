define([
    "rubensjs/rubens",
    "rubensjs/_2d",
    "rubensjs/inlay",
    "rubensjs/interface",
    "rubensjs/PLG/pannableOrigin",
    "rubensjs/PLG/swipeableY",
    "rubensjs/PLG/pullLines",
    "rubensjs/types",
    "rubensjs/colors",
    "util/util"],
    function (Rubens, _2d, L, I, P, S, PP, R, C, util) {

        return {
            Range: R.Range,

            Point: R.Point,

            // Consider this object in a dashboard application:
            // A bar should equal the height of the lines in CSS/HTML
            // in order to extend multiple table rows with one graph
           BarChart: function (id, fontSize, fontColor, bgColor, axisColor, lineHeight) {
                this.config = null;

                return util.extend(
                    [
                    new S.SwipeableY(),

                    new I.I()], {

                        drawMarkersAndLabelsY: false,

                        D: new _2d.D(),

                        id: id,

                        yAxisMarksAttributes: {
                            "stroke": "#000", 
                            'transform': ''
                        },

                        yAxisLabelsAttributes: {
                            "fill": "#000", 
                            'transform': ''
                        },

                        opts: {
                            useMasks: true,          // Use hatches to draw shapes
                            cmpMode: 1,
                            mode: R.CONST.ADD,       // 1 == all data elements are added to first, color per part
                                                     // 2 == project second data element behind first, color per row 
                                                     // 3 == substract
                                                     // 4 == same
                                                     // 5 == same set
                                                     // 6 == compare: first to the left, second to the right
                            sort: 1,
                            sortByColNr: null,
                            relativizeValues: false, // Make values relative per row
                            superGroups: false,

                            colorIter: 1,
                            baseLineX: 0,
                            labelType: true,         // Show or hide labels
                                                     // ... 1 == start, 2 == end, 3 == besides the bar, 4 == in the bar, 0 == none
                            drawLabelsOnTop: false,
                            reverse: false,          // Draw from right to left
                            groupBy: 1,              // Number of grouped columns
                            groupGutter: 0,          // Space between groups
                            fillHeight: true         // Base bar height on fontSize and lineheight (false) or on available height
                        },

                        length: 0,

                        colorMasksIndex: 0,

                        // Number of visible groups
                        groups: 1,

                        newView: true,

                        init: function (config) {

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

                        },

                        legend: new L.Inlay(id),

                        drawData1: function (promise, options, animate) {

                            if (options)
                                this.opts = util.extend(options, this.opts)

                            // Calc relative values
                            if (this.opts.relativizeValues === true) { 
                                                                                       
                                this.data = this.toRelativeRowValues(this.data);   
                            }

                            if(this.opts.reverse){
                                this.D.reverse = true
                                this.D.centerIsMax = true
                            }
                            else{
                                this.D.reverse = false
                                this.D.centerIsMax = false
                            }

                            this.groupOffset = 0

                            var fg = [],
                                bg = [],
                                dataSort = []

                            this.newView = true
                                
                            // Make one or two columns from one or more
                            if (this.data.length > 1) {
                                if (this.opts.mode == R.CONST.ADD)
                                    this.cols = this.add(this.data.concat())
                                else if (this.opts.mode == R.CONST.CMP || this.opts.mode == 6)
                                    this.cols = this.compare(this.data.concat())
                                else if (this.opts.mode == R.CONST.SUB) {
                                    this.cols = this.substract(this.data.concat())
                                }
                                else if (this.opts.mode == R.CONST.SAME) {
                                    this.cols = this.same(this.data.concat(), this.opts.superGroups)
                                }
                                else if (this.opts.mode == R.CONST.SET) {
                                    this.cols = this.add(this.data.concat(), this.opts.superGroups)

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


                            this.cols[0].forEach((d) => {

                                fg.push(d)


                            })

                            if (this.cols.length == 2) {

                                this.cols[1].forEach((d) => {

                                    bg.push(d)

                                })
                            }
 
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

                                this.draw(true, false, false, null)
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


                            this.length = fg.length * this.opts.groupBy

                            this.draw(false, bg.length > 0, animate, promise)

                            if (typeof this.initSwipeableY == 'function') {

                                if (this.data && this.lengthData() > this.stepsY) {
                                    this.initSwipeableY(
                                        new R.Point(0, 0),
                                        new R.Point(0, this.lengthData() - 1), true)

                                }
                            }

                        },                        

                        // Overides interface function
                        lengthData: function () {
                            return this.length
                        },

                        visibleData2: function(data){
                            var r = []
                            data.forEach( (d, n) => {

                                if(this.opts.mode == R.CONST.SET)
                                    n *= d.data.length

                                if(n >= this.D.reachMinY && n <= this.D.reachMinY + this.stepsY)
                                    r.push(d)
                            })
                                                        
                            return r
                        },

                        draw: function (isBg, shrink, animate, promise) {

                            var color = null;

                            this.groupOffset = 0

                            this.data3 = this.visibleData2(this.data2)

                            this.data3.forEach((d, n) => {

                                n += this.D.reachMinY

                                var ni = n

                                if (animate) { 

                                    this.inAnimate = true

                                    setTimeout(() => { 
                                        
                                        if(this.opts.mode == R.CONST.SET)
                                            ;//ni *= this.data3[0].data.length

                                        this.bar(d, ni, isBg, shrink, color)

                                        if (n == this.data3.length - 1 + this.D.reachMinY && promise) {
                                            //this.inAnimate = false
                                            promise('ok')
                                        }

                                    }, (n - this.D.reachMinY) * 50)
                                } 
                                else { 
                                    if(this.opts.mode == R.CONST.SET)
                                        ;//ni *= this.data3[0].data.length
                                    this.bar(d, ni, isBg, shrink, color)
                                }
                                
                            })

                            if (!animate && promise){
                                promise('ok');
                            }
                        },

                        height: function(){

                            var fH = this.D.toPointY(this.D.reachMinY) - this.D.toPointY(this.D.reachMaxY),
                                rH = (this.D.toPointY(this.D.reachMinY) - this.D.toPointY(this.D.reachMaxY)) % (fontSize * lineHeight);

                            // Fill up all the height
                            if(this.opts.fillHeight)
                                return fH
                                   / (this.stepsY)
                                   - ((this.groups - 1) * this.opts.groupGutter) / this.stepsY 
                                   - 2*this.D.config.padding

                            // Show as many bars as will fit completely
                            else
                                return (fH - rH)
                                   / (this.stepsY)
                                   - ((this.groups - 1) * this.opts.groupGutter) / this.stepsY 
                                   - 2*this.D.config.padding
                        },

                        drawLabelAtEnd: function(xEnd, yEnd, label, clrBar, widthBarPx){

                            var l = String(label).length * fontSize,
                                align = this.opts.reverse? 'start' : 'end',
                                clr = clrBar.dark === true || C.isDark(clrBar.color)? '#ffffff' : '#000000';
                                

                            if (l > widthBarPx) {
                                clr = fontColor
                                align = 'start'

                                if (this.opts.reverse) {
                                    align = 'end'
                                    xEnd -= 2
                                }
                                else
                                    xEnd += 2
                            }
                            else { 
                                if (this.opts.reverse)
                                    xEnd += 2
                                else
                                    xEnd -= 2
                            }
                            
                            if (clrBar.mask && this.opts.useMasks) { 

                                var x = xEnd - l + 8
                                if (this.opts.reverse) {
                                    x = xEnd
                                    xEnd += 2
                                }

                                clr = fontColor

                                this.D.paper.rect(x, yEnd - fontSize + 4, 
                                    l - 4, fontSize + 4)
                                .attr({ fill: bgColor})                            
                            }

                            if (this.opts.yValueIsSeconds) { 
                                this.D.paper.text(xEnd, yEnd + 1, this.D.toTimeFormat(util.round(label, 2)))
                                .attr({
                                    "fill": clr,
                                    "text-anchor": align
                                })                            
                            }
                            else { 
                                this.D.paper.text(xEnd, yEnd + 1, label)
                                .attr({
                                    "fill": clr,
                                    "text-anchor": align
                                })
                            }
                        },

                        drawBarOutOfReach: function(i){

                            var height = this.height(),
                                y = this.D.toPointY(i - 0.5),
                                x = this.D.toPointX(this.opts.baseLineX, height / 4);

                            if(this.opts.reverse)
                                x = this.D.toPointX(this.D.reachMaxX, -1 * height / 4)

                            this.D.drawCrossOutOfReach(x, y, height / 2, {stroke: '#ff0000', 'stroke-width': 3})                        
                        },

                       bar: function(d, n, isBg, shrink, color){

                            var from1 = /*this.opts.mode == R.CONST.ADD && this.data.length == 1?  0 :*/ this.opts.baseLineX,
                                from2 = this.opts.baseLineX,                                
                                m = 0,
                                msk1 = true; // Needed for the rect stroke;

                            // Compare doesn't have baseline setting
                            if (this.opts.mode == 6) { 
                                from1 = 0;
                                from2 = 0;
                            }
                            
                            // If outside reach, don't draw column at all
                            var t = 0,
                                u = Infinity;

                            if(this.opts.mode != R.CONST.ADD)
                                t = -Infinity

                            d.data.forEach((dd) => { 
                                                            
                                if(this.opts.mode == R.CONST.ADD)
                                    t += R.Float(dd.to)
                                else if(dd.to > t)
                                    t = dd.to
                                else if(dd.to < u)
                                    u = dd.to
                            })

                            if (R.Float(t) > this.D.reachMaxX || R.Float(t) < this.D.reachMinX) { 
                                    
                                this.drawBarOutOfReach(this.D.reachMaxY - (n - this.D.reachMinY ))                            
                                return 
                            }

                            if (this.opts.groupBy == 1)
                                this.groups = 1
                            else
                                this.groups = parseInt((this.D.reachMaxY - this.D.reachMinY) / this.opts.groupBy)

                            if (this.opts.groupBy > 1 && n - this.D.reachMinY > 0)
                                this.groupOffset += this.opts.groupGutter

                            d.data.forEach((dd, nn) => {

                                if (true || (this.opts.mode == R.CONST.ADD 
                                    && nn < this.D.reachMaxY 
                                    && nn + n >= this.D.reachMinY)
                                    || (n + nn < this.D.reachMaxY
                                    && n + nn >= this.D.reachMinY)) {
                                    
                                    var ii = nn,
                                        i = n,
                                        ni = this.opts.mode == R.CONST.SET?
                                            this.D.reachMinY + (i -  this.D.reachMinY)*this.opts.groupBy+ii
                                            :
                                            n


                                    if (this.opts.mode == R.CONST.ADD || this.opts.mode == R.CONST.SUB) {
                                        if (this.opts.colorIter == 1)

                                            // I like to start with grey at the bottom, which is +5
                                            color = C.itemColor(ii + 5);
                                        else if(this.opts.colorIter == 2)
                                            color = C.itemAlternateColor(ii + 5);

                                        else
                                            color = C.itemColor(0)

                                        // Mark negatives red 
                                        if (this.opts.mode == R.CONST.SUB && dd.to < this.opts.baseLineX) { 
                                            color = C.itemColor(3)
                                        }
                                    }                                              
                                    else if (this.opts.mode == R.CONST.CMP) { 
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
                                    }
                                    else if (this.opts.mode == R.CONST.SET) { 
                                        if (this.opts.colorIter == 1)
                                            color = C.itemColor(d.row);
                                        else if (this.opts.colorIter == 2)
                                            color = C.itemAlternateColor(d.row);
                                        else
                                            color = C.itemColor(0)

                                        if (this.opts.groupBy > 1 && this.opts.colorIter == 2)
                                            color = C.itemAlternateColor((nn) % this.opts.groupBy)
                                        else if (this.opts.groupBy > 1 && this.opts.colorIter == 1)
                                            color = C.itemColor((nn) % this.opts.groupBy)                                      
                                    }
                                    else if (this.opts.mode > R.CONST.SUB && this.opts.mode <= 6) {

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
                                    }                                    

                                    var hideLabel = nn != d.data.length - 1 ? true : false

                                    if (this.opts.mode == R.CONST.SUB) { 
                                        hideLabel = nn != 0? true : false
                                    }

                                    if(this.opts.mode == 6)
                                        ;
                                    else if (isBg && this.opts.cmpMode == 1 && this.opts.mode != 6)                                        
                                        color.color = C.shadesOfColor(color.color, 2)[0]
                                    else if(isBg)
                                        color = { color: axisColor }
                                    
                                    if(isBg)
                                        hideLabel = true

                                    var y = false

                                    if(this.opts.mode == R.CONST.ADD){                                        

                                        y = this.rect(n, R.Float(from1), R.Float(from1 + dd.to), isBg, shrink, color)
                                        from1 += R.Float(dd.to)
                                    }
                                    else{

                                        if (dd.to >= 0) {                                            
                                            //if (this.opts.mode == R.CONST.ADD) {
                                            //    y = this.rect(ni, from1, dd.to, isBg, shrink, color)
                                            //    from1 += dd.to
                                            //}
                                            //else
                                                y = this.rect(ni, from1, dd.to, isBg, shrink, color)
                                        }
                                        else { 
                                            y = this.rect(ni, from2, dd.to, isBg, shrink, color)
                                            //if(this.opts.mode == R.CONST.ADD)
                                            //    from2 += dd.to                                        
                                        }
                                    }

                                    if (this.opts.drawLabelsOnTop                                         
                                        || (this.opts.mode == R.CONST.ADD && this.opts.relativizeValues && R.Float(from1) == 0)) { 

                                        var from10 = from1,
                                            to10 = dd.to

                                        if (this.opts.reverse) {
                                            from10 = this.D.reachMaxX - from1
                                            to10 = this.D.reachMaxX - dd.to + this.D.reachMinX 
                                        }

                                        var xEnd = this.D.toPointX(to10),
                                            yEnd = this.D.toPointY(this.D.reachMaxY - (n - this.D.reachMinY), this.height() / 2),
                                            width = Math.abs(this.D.toPointX(to10) - this.D.toPointX(from10));

                                        if (this.opts.mode == R.CONST.ADD && !hideLabel) {                                                                                                                                   
                                            this.drawLabelAtEnd(this.D.toPointX(from10), y, from1, color, width)
                                        }
                                        else if (!hideLabel || this.opts.mode == R.CONST.SET) {
                                            if(isBg && this.opts.cmpMode == 1)
                                                y += this.height() / 2 + 2
                                            this.drawLabelAtEnd(xEnd, y, dd.to, color, width)
                                        }
                                    }

                                    if (this.opts.groupBy > 1) { 
                                        var q = (this.opts.groupBy - 1) / 2

                                        y -= q * (this.height() + 2 * this.D.config.padding);
                                    }

                                    if(this.opts.cmpMode == 1 && this.cols.length == 2 && this.opts.mode != 6) 
                                        y += this.height() / 2 - fontSize / 2


                                    if (this.opts.mode == 6) { 
                                        if (this.opts.labelType != 0 && !hideLabel) {

                                            var x = null,
                                                anch = 'end';

                                            if (this.opts.labelType == 1) {
                                                x = this.D.toPointX(this.D.reachMinX, -1 * fontSize)
                                            }
                                            else {
                                                x = this.D.toPointX(this.D.reachMaxX, 1 * fontSize)
                                                anch = 'start'
                                            }

                                            if (n < this.D.reachMinY + this.stepsY 
                                                && n >= this.D.reachMinY 
                                                && y) {

                                                this.D.paper.text(x, y, d.label)
                                                .attr({
                                                    'text-anchor': anch,
                                                     'fill': fontColor
                                                })
                                            }
                                        }
                                    }
                                    else { 
                                        if (this.opts.labelType != 0 && !hideLabel) {
                                            var x = null,
                                                anch = null;
                                            
                                            if (this.opts.labelType == 1) { 
                                                if(this.opts.reverse){
                                                    x = this.D.toPointX(this.D.reachMaxX, 1 * fontSize)
                                                    anch = 'start';
                                                }
                                                else{
                                                     x = this.D.toPointX(this.D.reachMinX, -1 * fontSize)
                                                     anch = 'end';
                                                }                                           
                                            }
                                            else if (this.opts.labelType == 2) { 
                                                if(this.opts.reverse){
                                                    x = this.D.toPointX(this.D.reachMinX, -1 * fontSize)
                                                    anch = 'end';
                                                }
                                                else{
                                                     x = this.D.toPointX(this.D.reachMaxX, 1 * fontSize)
                                                     anch = 'start';
                                                }                                            
                                            }

                                            else if (this.opts.labelType == 3) { 
                                                     
                                                x = this.D.toPointX(this.D.reachMinX, 1 * fontSize)
                                                anch = 'start';
                                           
                                            } 
                                            else if (this.opts.labelType == 4) { 
                                                if (this.opts.reverse) {
                                                    x = this.D.toPointX(this.D.reachMaxX, -1 * fontSize)
                                                    anch = 'end';         
                                                }
                                                else { 
                                                    x = this.D.toPointX(this.D.reachMinX, 1 * fontSize)
                                                    anch = 'start';                                                
                                                }
                                           
                                            } 
 

                                            if (n < this.D.reachMinY + this.stepsY && n >= this.D.reachMinY) {                                                

                                                this.D.paper.text(x, y, d.label)
                                                .attr({
                                                    'text-anchor': anch,
                                                     'fill': fontColor
                                                })
                                            }

                                        }                                        
                                    }

                                    if (this.newView) {
                                        this.groupOffset = 0
                                    }

                                }

                            })                        
                        },

                        calcNumberOfLines: function () {

                            return Math.max(
                                    1, 
                                    parseInt(
                                    this.D.h
                                    /
                                    (fontSize * lineHeight)
                                )
                            )
                        },

                        nextColorMask: function(color){

                            return this.colorMasksIndex++ 
                        },

                        rect: function (n, from, to, isBg, shrink, color) {

                            var mask = ''

                            n -= this.D.reachMinY

                            // With monochrome use one of the masks property of the color
                            if (this.opts.colorIter == 3 
                                && this.opts.useMasks
                                && color.masks) { 

                                mask = color.masks[this.nextColorMask() 
                                    % Math.min(color.masks.length, (this.opts.groupBy > 1? this.opts.groupBy: Infinity))]
                                //color.stroke = color.color
                            }

                            if (this.opts.reverse && this.opts.mode == 6) {
                                from = this.D.reachMaxX - from 
                                to = this.D.reachMaxX - to
                            }
                            else if(this.opts.reverse){ 
                                from = this.D.reachMaxX - from + this.D.reachMinX
                                to = this.D.reachMaxX - to + this.D.reachMinX                            
                            }

                            if(!isBg && this.opts.mode == 6){
                                from *= -1
                                to *= -1
                            }

                            var y = this.D.toPointY(this.D.reachMaxY,  
                                        n * (this.height() + 2 * this.D.config.padding)
                                        + parseInt(n / (this.stepsY / this.groups)) * this.opts.groupGutter + this.D.config.padding),
                                left = this.D.toPointX(from),
                                width = this.D.toPointX(to) - left;                            

                            if (isNaN(y) || y === false) return

                            if(n >= this.stepsY) return

                            // Left part of feather diagram?
                            if (this.opts.mode == 6 && isBg) { 
                                isBg = false
                                shrink = false

                                if (to < 0) {
                                    left -= 1
                                }
                                else { 
                                    left += 1                                
                                }
                            }
                            else if (this.opts.mode == 6) {
                                shrink = false
                                if(to > 0)
                                    left += 1
                                else
                                    left -= 1
                            }

                            var h = this._rect(left, y, width, color, isBg, shrink, mask)

                            return y + h / 2

                        },

                        _rect: function (x, y, width, clr, isBg, shrink, mask) {

                            if(!this.opts.useMasks)
                                mask = ''
                            else
                                mask = mask || clr.mask
                            
                            var padd = this.D.config.padding

                            var height = this.height()

                            if (shrink && this.opts.cmpMode == 0) { 
                                y += 1
                                height -= 2
                            }

                            //if (isBg)
                            //    clr = '#e0e0e0'

                            if (this.cols.length == 2
                                && this.opts.cmpMode == 1
                                && this.opts.mode != 6) { 
                                height /= 2 
                                height -= 2
                            }

                            if (isBg && this.opts.cmpMode == 1) { 
                                y += height + 4                                      
                            }

                            if (width < 0) {
                                width = Math.abs(width)
                                x -= width
                            }

                            this.newView = false

                            // Draw bg for stroke + pattern
                            if (mask) {
                                this.D.paper.rect(x, y, width, height)
                                .attr({
                                    'stroke': clr.color,
                                    'fill': 'none'
                                })
                            }

                            if (this.opts.cmpMode == 0 && isBg) { 
                                this.D.paper.rect(x, y, width, height)
                                .attr({
                                    'stroke': isBg ? 'black' : clr.stroke,
                                    'stroke-dasharray': isBg ? 2 : 0,
                                    fill: isBg ? 'none' : clr.color,
                                    //mask: mask 
                                }) 
                            
                                if (this.cols.length == 2
                                    && this.opts.cmpMode == 1) {
                                    height *= 2
                                }                            
                            } 
                            else { 
                                this.D.paper.rect(x, y, width, height)
                                .attr({
                                    'stroke': clr.color,
                                    //'stroke-dasharray': isBg ? 2 : 0,
                                    fill: /*isBg ? 'none' : */clr.color,
                                    mask: mask 
                                })                             
                            }

                            if (this.cols.length == 2
                                && this.opts.cmpMode == 1) {
                                height *= 2
                                return height / 2
                            } 

                            return height
                        }
                    }
                )
            },
        }
    }
)