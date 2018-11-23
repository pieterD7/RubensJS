define([
    "rubensjs/types", "rubensjs/colors",
    "util/util", "external/hammer.min"],

    function (R, C, util, Hammer) {

        return {

            I: function () {

                return {
                    //pullLinesHintText: "Drag your target",
                            
                    inAnimate: false,

                    pullLinesHintWidth: 0,

                    originTextAttributes: {
                        'fill': C['color_overhead_origin'],
                        'transform': 'translate(-20, 0)'
                    },

                    xAxisAttributes: {
                        "stroke-width": 2,
                        "stroke": C['color_overhead_axis']
                    },

                    yAxisAttributes: {
                        "stroke-width": 2,
                        "stroke": C['color_overhead_axis']
                    },

                    xAxisMarksAttributes: {
                        "stroke": C['color_overhead_marks']
                    },

                    xAxisLabelsAttributes: {
                        "fill": C['color_overhead_labels']
                    },

                    yAxisMarksAttributes: {
                        "stroke": C['color_overhead_marks'], 
                    },

                    yAxisLabelsAttributes: {
                        "fill": C['color_overhead_labels'],
                    },

                    origin: null,

                    stepsX: null,

                    stepsY: null,

                    drawOrigin: false,

                    drawMarkersAndLabelsX: true,

                    drawMarkersAndLabelsY: true,

                    optDrawAxis: true,

                    dataHeaders: null,

                    dataTitle: 'title',

                    clickable: true,

                    hasClickHandler: false,

                    onClickHandlers: [],

                    // Old dataTable in HTML
                    hasDataTable: false,

                    hasExport: false,

                    hasHandlers: false,

                    view: 'svg',

                    invalidate: function () {
                        return new Promise( (resolve) => {
                            var a = document.querySelectorAll('#' + this.id + ' .svgLayer');
                            a.forEach(function (e) {
                                e.remove();
                            });     
                            resolve('ok')
                        })
                    },

                    deleteMap: function () {
                        var dq = document.querySelector("#" + this.id + " svg  svg[name='svgmap']")
                        if (dq)
                            dq.remove()
                    },

                    initZoomable: function () {
                        var mngr = new Hammer(
                            document.querySelector("#" + this.id),
                            {
                                recognizers: [[Hammer.Pinch, {}], [Hammer.Pan, { direction: Hammer.DIRECTION_ALL }]]
                            }
                        )

                        if (this.zoomable && !this.hasHandlers) {
                            mngr.on("pinchend", (e) => {

                                if (e.scale < 1) {
                                    this.handleInput(e.center.x, e.center.y, -1)
                                }
                                else
                                    this.handleInput(e.center.x, e.center.y, 1)
                            })

                            // Scroll mouse and mousepad
                            document.querySelector("#" + this.id)
                            .addEventListener('mousewheel', (event) => {

                                // Zoom
                                if (event.deltaY > 0) {
                                    this.handleInput(event.x, event.y, 1)
                                }
                                else if (event.deltaY < 0) {
                                    this.handleInput(event.x, event.y, -1)
                                }
                            })
                            this.hasHandlers = true
                        }
                    },

                    drawData: function (options, animate) {

                        // Marks at axis
                        if (options && options.hideMarksY) { 
                            this.yAxisMarksAttributes = {visibility:'hidden'}
                        }

                        if (options && options.hideMarksX) {
                            this.xAxisMarksAttributes = { visibility: 'hidden' }
                        }
                        else if(options) { 
                            this.xAxisMarksAttributes = {visibility:'visible'}                         
                        }

                        // Values at axis
                        var exX = 0

                        /*if (options) {
                            exX = -1 * parseInt(options.expandGrid) / 2 + this.D.config.marksYLength + this.D.config.halfFontXHeight

                            if (options.marksOnTop)
                                this.yAxisLabelsAttributes = util.extend({
                                    'transform': 'translate(' + (exX) + ', ' + -8 + ')',
                                    'text-anchor': 'start'
                                }, this.yAxisLabelsAttributes)
                                
                        }*/

                        // Draw data
                        return new Promise((resolve, reject) => {                              

                            // Check for colors defined
                            if (C.color_items.length == 0)
                                C.color_items = [{ color: '#000' }]

                            if (this.drawDataZoomable && this.zoomable) {

                                this.drawDataZoomable(resolve, options, animate)
                            }

                            else {

                                this.drawData1(resolve, options, animate)

                            } 

                        })
                    },

                    findDataElByRow: function (a, row) {
                        var ret = -1
                        a.forEach((o, n) => {
                            if (parseInt(o.row) == parseInt(row))
                                ret = n
                        })
                        if (ret > -1)
                            return a[ret]
                        return false
                    },

                    applyOrder: function (a, orderAr) {
                        var ret = []

                        orderAr.forEach((o) => {
                            var q = this.findDataElByRow(a, o.row)
                            if (q) {
                                ret.push(q)
                            } 
                        })

                        return ret
                    },

                    // Return col2 in the col order of col0
                    applyOrderByCol: function(col0, col2){
                        var ret = []
                        
                        col0.forEach((o) => { 
                            ret.push(col2.filter( (oo) => 
                                { if(oo.col == o.col) return oo}))
                        })

                        if(ret.length == col0.length)
                            return ret
                    },

                    getColOrder: function(ar, row){
                        var cols = []
                        ar.forEach((c) => { 
                            cols.push(c[row].data[0].col)
                        })
                        return cols
                    },

                    // Sort columns by row with relative values
                    sortByRow: function(ar, row){
                        ar = ar.sort((a, b) => { 
                            if (this.opts.sort == 1) {
                                if (a[row] && b[row]) {
                                    return parseFloat(b[row].data[0].toR) - parseFloat(a[row].data[0].toR)
                                }
                                else
                                    return -Infinity
                            }
                            else { 
                                if (a[row] && b[row]) { 
                                    return parseFloat(a[row].data[0].toR) - parseFloat(b[row].data[0].toR)
                                }
                                else
                                    return Infinity                            
                            }
                        })

                        return ar
                    },                    
                    
                    sort: function (dataSort) {

                        var col = parseInt(this.opts.sortByColNr)

                        if(isNaN(col)) col = null

                        if (this.opts.sort == 0) {
                            return dataSort.concat()
                        }
                        else if (this.opts.sort == 1 || this.opts.sort == 3) {
                            return dataSort.sort(function (a, b) {
                                if (a.data && a.data[0] && b.data) {

                                    var ta = 0,
                                        tb = 0
                                    a.data.forEach( (d, n) => { 
                                        if(col === null || n === col)
                                            ta += parseFloat(d.to) //- parseFloat(d.from)
                                    })
                                    b.data.forEach( (d, n) => { 
                                        if(col === null || n === col)
                                            tb += parseFloat(d.to) //- parseFloat(d.from)
                                    })
                                    return tb - ta
                                }
                                else {
                                    return -Infinity
                                }
                            })
                        }
                        else if (this.opts.sort == 2 || this.opts.sort == 4) {
                            return dataSort.sort(function (a, b) {
                                if (a.data && a.data[0] && b.data) {
                                    
                                    var ta = 0,
                                        tb = 0
                                    a.data.forEach( (d, n) => {
                                        if(col === null || n === col)
                                            ta += parseFloat(d.to) // - parseFloat(d.from)
                                    })
                                    b.data.forEach( (d, n) => { 
                                        if(col === null || n === col)
                                            tb += parseFloat(d.to) // - parseFloat(d.from)
                                    })
                                    return ta - tb
                                }
                                else {
                                    return Infinity
                                }
                            })
                        }
                    },

                    calcTot: function(data, col){
                        
                        var tot = 0

                        data.forEach((d) => { 

                            if (d.data[col].to < 0)                                            
                                d.data[col].to *= -1

                            tot += d.data[col].to    
                        })

                        return tot
                    },

                    /*
                        calculate relative values per col after add()
                        and modify last param
                    */
                    toRelativeColValues: function(ar){                    
                    
                        var a = []
                        ar.forEach((row) => { 
                                                                    
                            for(var c = 0; c < row.data.length; c++){
                                
                                var tot1 = this.calcTot(ar, c)

                                row.data[c].toR = row.data[c].to / tot1
                            }
                                                                
                            a.push({ label: row.label, data:row.data, row: row.row })                            

                        })   
                        return a
                    },

                    // Calculate and assign relative values to multiple cols before add()
                    toRelativeRowValues: function(ar, div){
            
                        ar.forEach( (col) => {

                            for (var c = 0; c < col.length; c++) { 

                                var tot = 0

                                ar.forEach( (col) => { 
                        
                                    col.forEach( (row, n) => {
                            
                                        if(n == c)

                                            row.data.forEach( (dd) => {
                                                if(dd.to > 0) tot += dd.to
                                                else tot += -1 * dd.to
                                            })                                                
                                    })                    
                                })

                                ar.forEach( (col) => { 
                        
                                    col.forEach( (row, n) => { 
                            
                                        if(tot != 0)

                                            if(n == c)

                                                row.data.forEach( (dd) => {                                                                    
                                                    dd.to = (dd.to / tot) * 100 / 1
                                                })
                                    })                    
                                })
                
                            }
                        })
            
                        return ar
                    },

                    // Return two coulmns
                    compare: function(ar){
                        var ret = [],
                            retA = [],
                            retB = [];
                        
                        for (var n = 0; n < ar.length; n++) { 

                            if (n % 2 == 0)
                                retA.push(ar[n])
                            
                            else
                                retB.push(ar[n])
                        }
                        ret.push(...retA)
                        ret.push(...retB)
                        return ret
                    },

                    // Make one col appending to first
                    // Make two cols with supergroups
                    same: function(ar, superGroups){
                        var ret = [],
                            ret1 = [],
                            ret2 = [];

                        ar.forEach( (col, n) => { 

                            col.forEach( (dd) => { 

                                if (superGroups) { 
                                    if(n < ar.length / 2 )
                                        ret1.push(dd)
                                    else
                                        ret2.push(dd)
                                }
                                else
                                    ret.push(dd)
                            })
                        })

                        if (superGroups) { 
                            ret.push(ret1)
                            ret.push(ret2)                        
                        }
                        else
                            ret = [ret]

                        return ret
                    },

                    // Every even col gets the value of the result of the 
                    // substraction from the col before                    
                    substract: function(ar){

                        var ar = this.add(ar)

                        var ret = [];
                                                
                        ar[0].forEach( (col, n) => { 

                            col.data.forEach( (dd, row) =>  {
                                    
                                if(row % 2 == 1 && col.data[row - 1])
                                    col.data[row].to = col.data[row - 1].to - col.data[row].to
                            })

                        }) 
                        
                        return ar
                    },

                    // Add all data elements to first
                    add: function(ar, superGroups){

                        var a = [],
                            b = [],
                            c = [],
                            e = [],
                            is = [];

                        ar.forEach( (col, m) => {

                            col.forEach( (dd, row) => { 

                                dd.data.forEach((d) => { 

                                    var v2 = d.to,
                                        col = d.col;

                                    if (m < ar.length / 2 || !superGroups) {
                                        if (m > 0) { 
                                
                                            var q = b.indexOf(row)

                                            if(q > -1){

                                                a[q].data.push({to: v2, col: col})
                               
                                            }

                                        }
                                        else { 
                                            is.push({to:v2, col:col})

                                            if (dd.label) { 
                                                a.push({ label: dd.label, data: is, row: row })
                                                b.push(row)                                
                                            }
                                            is = []                            
                                        }
                                    }
                                    else { 
                                        if (m > ar.length / 2) { 
                                
                                            var q = e.indexOf(row)

                                            if(q > -1){

                                                c[q].data.push({to: v2, col:col})
                               
                                            }

                                        }
                                        else { 
                                            is.push({to:v2})

                                            if (dd.label) { 
                                                c.push({ label: dd.label, data: is, row: row })
                                                e.push(row)                                
                                            }
                                            is = []                            
                                        }                                    
                                    }
                            
                                })                    
                            
                            })
                        })
                        

                        var ret = []
                        if (superGroups) { 
                            ret.push(a)
                            ret.push(c)
                        }
                        else
                            ret.push(a)

                        return ret
                    },

                    legendLeft: function(length){
                        var x1 = false

                        if (this.opts.positionLegend == 1 
                            || this.opts.positionLegend == 2
                            ||  this.opts.positionLegend == 5
                            ||  this.opts.positionLegend == 6) { 
                                

                            var l = length

                            if(this.opts.positionLegend == 5 || this.opts.positionLegend == 6)
                                l = parseInt((l + 1) / 2)
                           

                            if(l == 1 && length == 1)
                                x1 = this.D.toPointX(this.D.reachMaxX, 
                                    -1 * this.opts.legendItemWidth )
                            else if(l == 1)
                               x1 = this.D.toPointX(this.D.reachMinX + (this.D.reachMaxX - this.D.reachMinX) / 2, 
                                   -0.5 * this.opts.legendItemWidth)
                            else if(l == 2)
                                x1 = this.D.toPointX(this.D.reachMinX + (this.D.reachMaxX - this.D.reachMinX) / 2, 
                                    -1 * this.opts.legendItemWidth);
                            else if(l == 3)
                                x1 = this.D.toPointX(this.D.reachMinX + (this.D.reachMaxX - this.D.reachMinX) / 3, 
                                    -1 * this.opts.legendItemWidth);
                            else if(l == 4)
                                x1 = this.D.toPointX(this.D.reachMinX + (this.D.reachMaxX - this.D.reachMinX) / 4, 
                                    -1 * this.opts.legendItemWidth);
                            else if(l == 5)
                                x1 = this.D.toPointX(this.D.reachMinX + (this.D.reachMaxX - this.D.reachMinX) / 5, 
                                    -1 * this.opts.legendItemWidth);
                            else if(l == 6)
                                x1 = this.D.toPointX(this.D.reachMinX, 
                                    -1 * this.D.config.paddingLeft / 2);                               
                            else 
                                x1 = this.D.toPointX(this.D.reachMinX, -1 * this.D.config.paddingLeft);
                        } 
                        
                        return x1
                    },

                    drawLegend: function (items, superHeaders, promise) {
                        var data = [],
                            clr = null,
                            bgItems = [];

                        if(!this.legend) return

                        if(this.opts.superGroups && superHeaders.length > 0){
                            bgItems = items.slice(items.length / 2, items.length)
                            items = items.slice(0, items.length / 2)
                        }

                        items.forEach( (i, n) => {
                            // ...
                            // mode == 1
                            var clr = this.opts.colorIter == 1? 
                                C.itemColor(n + 5) : C.itemAlternateColor(n + 5),
                                mask = null;

                            if(this.opts.colorIter == 3)
                                clr = C.itemColor(0)

                            if (this.opts.unstack > 0 && this.opts.binaryColors) { 

                                if(n < items.length - this.opts.unstack){
                                    clr.color = C.shadesOfColor(C.itemColor(3).color, items.length)[items.length - n - 1]
                                }
                                else{
                                    clr.color = C.shadesOfColor(C.itemColor(6).color, 
                                            items.length)[items.length - 1 - (n - items.length + this.opts.unstack)]  
                                }
                            }
                            else if(this.opts.mode == 6){
                                if (this.opts.colorIter == 1) { 
                                    clr = C.itemColor(n % 2 + 1)
                                }
                                else if(this.opts.colorIter == 2){ 
                                    clr = C.itemAlternateColor(n % 2 + 1)
                                }
                                else
                                    clr = C.itemColor(0)
                            }
                            else if(this.opts.mode == 4){
                                clr = ''
                            }
                            else if(this.opts.mode == 5){
                                if (bgItems.length == 0 && this.opts.superGroups && this.opts.cmpMode == 1 && n > (items.length - 1) / 2) {
                                    clr = this.opts.colorIter == 1 ? 
                                        C.itemColor(n - parseInt(items.length / 2)) : 
                                        C.itemAlternateColor(n - parseInt(items.length / 2));
                                    clr.color = C.shadesOfColor(clr.color, 2)[0]
                                }
                                else
                                    clr = this.opts.colorIter == 1 ? C.itemColor(n) : C.itemAlternateColor(n);
                                
                                if (this.opts.colorIter == 3) {
                                    clr = C.itemColor(0)
                                    mask = clr.masks[n % clr.masks.length]
                                }
                            }

                            var hdr = i.header
                            if (n % 2 == 1 && this.opts.mode == 3) { 
                                hdr = items[n - 1].header + ' - ' + i.header
                            }

                            var sorted = false
                            if(n == this.opts.sortByColNr)
                                sorted = true

                            data.push({ color: clr.color, label: hdr, mask: mask? mask: clr.mask, sorted: sorted, right: n == 0 && this.opts.mode == 6 })

                        })

                        var dta = []

                        for (var c = 0; c < data.length / 2; c++) {                             
                            if(data[2*c + 1])
                                dta.push(data[2*c + 1])
                            dta.push(data[2*c])
                        }

                        if(this.opts 
                            && (this.opts.positionLegend == 5 ||this.opts.positionLegend == 6))
                            data = dta

                        if (superHeaders.length > 1) {
                            var hdr = superHeaders[1]
                            if (this.opts.superGroups && hdr) {
                                data.push({ color: 'transparent', label: hdr.header, mask: '' })
                            }
                        }
                        else { 
                            //console.log('No superlabel')
                        }
                        
                        this.legend.invalidate()
                        this.legend.insert(this.D.paper)

                        if(this.opts.reverse){
                            ;//data = data.reverse()
                        }

                        var x1 =  this.D.toPointX(this.D.reachMaxX, 
                            -1 * this.opts.legendItemWidth 
                            + this.opts.offsetXLegend)


                        if(this.legendLeft(data.length))
                            x1 = this.legendLeft(data.length) + this.opts.offsetXLegend


                        if (this.opts && this.opts.positionLegend == 1) {
                            this.legend.drawLegend(
                                x1,
                                this.D.toPointY(
                                    this.D.reachMaxY, 
                                    -1 * this.config.paddingTop / 3 + -1 * this.opts.offsetYLegend),
                                152,
                                55,
                                data,
                                'cb',
                                'Legend',
                                { "stroke-width": 1, fill: this.bgColor, stroke: this.fontColor },
                                this,
                                this.fontColor,
                                true,
                                this.fontSize,
                                1,
                                2,
                                bgItems.length > 0
                            )
                        }
                        else if (this.opts && this.opts.positionLegend == 2) {
                            this.legend.drawLegend(
                                x1,
                                this.D.toPointY(
                                    this.D.reachMinY, 
                                    this.opts.offsetYLegend),
                                152,
                                55,
                                data,
                                'cb',
                                'Legend',
                                { "stroke-width": 1, fill: this.bgColor, stroke: this.fontColor },
                                this,
                                this.fontColor,
                                true,
                                this.fontSize,
                                1,
                                2,
                                bgItems.length > 0
                            )
                        }
                        else if (this.opts && this.opts.positionLegend == 3) {
                            this.legend.drawLegend(
                                x1,
                                this.D.toPointY(
                                    this.D.reachMaxY, 
                                    -1 * this.config.paddingTop / 3 + -1 * this.opts.offsetYLegend),
                                152,
                                55,
                                data,
                                'cb',
                                'Legend',
                                { "stroke-width": 1, fill: this.bgColor, stroke: this.fontColor },
                                this,
                                this.fontColor,
                                false,
                                this.fontSize,
                                1,
                                4,
                                bgItems.length > 0
                            )
                        }
                        else if (this.opts && this.opts.positionLegend == 4) {
                            this.legend.drawLegend(
                                x1,
                                this.D.toPointY(
                                    this.D.reachMinY, 
                                    this.opts.offsetYLegend),
                                152,
                                55,
                                data,
                                'cb',
                                'Legend',
                                { "stroke-width": 1, fill: this.bgColor, stroke: this.fontColor },
                                this,
                                this.fontColor,
                                false,
                                this.fontSize,
                                1,
                                4,
                                bgItems.length > 0
                            )
                        }
                        else if(this.opts && (this.opts.positionLegend == 5 || this.opts.positionLegend == 6) ){

                            var l = 0,
                                y1 = this.D.toPointY(this.D.reachMaxY, 
                                    -1 * this.config.paddingTop / 3 + -1 * this.opts.offsetYLegend);

                            if(this.opts.positionLegend == 5 || this.opts.positionLegend == 6)
                                l = parseInt((data.length + 1) / 2)

                            if(this.opts.positionLegend == 6)
                                y1 = this.D.toPointY(this.D.reachMinY, 
                                        40 + this.opts.offsetYLegend)

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
                                    d.reverse(),
                                    'cb',
                                    'Legend',
                                    { "stroke-width": 1, fill: this.bgColor, stroke: this.fontColor },
                                    this,
                                    this.fontColor,
                                    false,
                                    this.fontSize,
                                    1,
                                    2,
                                    bgItems.length > 0
                                )                              
                            }

                        }
                        else if(this.opts && this.opts.positionLegend == 6){
                        
                        }

                        if(promise)
                            promise('ok')
                    },

                    drawLegendMarker: function (paper, _x, _y, ang, n, nMarkers, clr, mask, superGrouped, sorted) {

                        var msk = mask

                        if(!this.opts.useMasks)
                            msk = ''

                        // Foreground / background?
                        if ((this.opts.mode == 2 
                            || (!superGrouped && this.opts.superGroups && (nMarkers - 1) / 2 <= n) && this.opts.cmpMode == 0) 
                            || (this.opts.colorIter == 3 && !this.opts.useMasks)) {

                            if (n == 0 || this.opts.colorIter == 3) {
                                ;
                            }
                            else if(this.opts.mode != 6 && this.opts.cmpMode == 0){
                                paper.rect(_x, _y - this.fontSize / 2, this.fontSize, this.fontSize)
                                .attr({
                                    fill: 'transparent',
                                    'stroke-dasharray': 2,
                                    stroke: this.axisColor,
                                    mask: msk
                                })
                            }
                        }
                                
                        else  if (this.opts.mode == 1 
                            || this.opts.mode == 3
                            || this.opts.mode == 4
                            || this.opts.mode == 5){


                            if (clr) { 
                                paper.rect(_x, _y - this.fontSize / 2, this.fontSize, this.fontSize)
                                .attr({
                                    fill: clr,
                                    stroke: clr,
                                    mask: msk
                                })                            
                            }

                                                        
                            if ( clr && sorted !== false && typeof sorted !== 'undefined'){
                                        
                                var clr2 = C.shadesOfColor(clr, 2)[0]

                                if (this.opts.sort == 1) { 
                                    paper.text(_x + this.fontSize / 2, _y - 2, "&darr;")
                                    .attr({
                                        fill: clr2,
                                        stroke: clr2,
                                        'text-anchor': 'middle'
                                    })
                                }
                                else{ 
                                    paper.text(_x + this.fontSize / 2, _y - 2, "&uarr;")
                                    .attr({
                                        fill: clr2,
                                        stroke: clr2,
                                        'text-anchor': 'middle'
                                    })
                                }
                            }
                        }
 
                    },


                    minimum: function(ar){
                        var min = Infinity

                        ar.forEach( (o, row) => {
                            if (o != "" && o < min)
                                min = o
                        })
                        return min
                    },

                    maximum: function(ar){
                        var max = -Infinity

                        ar.forEach( (o, row) => {
                            if (!isNaN(o) && o > max)
                                max = o
                        })
                        return max
                    },

                    roundUpSeconds: function(x, d){
                        var q = x

                        if (q > 60 * 60)
                            return (parseInt(q / (60 * 60)) + 1) * 60
                        else { 
                            if((parseInt(q / 60) + 1) * 60 > 45 * 60)
                                return 60 * 60
                            else if((parseInt(q / 60) + 1) * 60 > 30 * 60)
                                return 45 * 60
                            else if((parseInt(q / 60) + 1) * 60 > 15 * 60)
                                return 15 * 60
                            else if((parseInt(q / 60) + 1) * 60 > 5 * 60)
                                return 10 * 60
                            else if((parseInt(q / 60) + 1) * 60 > 2 * 60)
                                return 5 * 60
                            else if((parseInt(q / 60) + 1) * 60 > 1 * 60)
                                return 2 * 60
                            else
                                return 1 * 60
                        }
               
                    },

                    roundUp: function(x, d){
                        var n = 0,
                            lessThenOne = false,
                            div = 1 / Math.pow(10, 10);

                        for(var m = 0; div < 2; div *= 10){
                            if (d < div) { 
                                lessThenOne = (1 / div) * 10;
                                d *= lessThenOne
                                x *= lessThenOne;
                            }
                        }

                        if(x > 0)
                            n = Math.floor(parseInt(x + d) / d) * d > 0 ?  Math.floor(parseInt(x + d) / d) * d : 0;
                        else if(x < 0)
                            n = Math.floor(parseInt(x + d) / d) * d > 0 ?  Math.ceil(parseInt(x + d) / d) * d : 0;
                        else n = 0

                        if (lessThenOne) { 
                            n = n / lessThenOne
                        }

                        return n
                    },

                    roundDown: function(x, d){
                        var n = 0,
                            lessThenOne = false,
                            div = 1 / Math.pow(10, 10);

                        for(var m = 0; div < 2; div *= 10){
                            if (d < div) { 
                                lessThenOne = (1 / div) * 10;
                                d *= lessThenOne;
                                x *= lessThenOne;
                            }
                        }

                        if(x > 0)
                            n = Math.floor(parseInt(x - d) / d) * d > 0 ?  Math.floor(parseInt(x - d) / d) * d: 0
                        else if(x < 0)
                            n = Math.floor(parseInt(x - d) / d) * d < 0 ? Math.ceil(parseInt(x - d) / d) * d : 0
                        else
                            n = 0

                        if (lessThenOne) { 
                            n =  n / lessThenOne
                        }

                        return n
                    },

                    toRoundValues: function(min, max){


                        var d = Math.pow(10, 24);
                        for (var n = 0; n < 48; n++) { 
                            d /= 10;
                            var dd = d / 2;

                            if(max - min > dd)
                                return d
                        }
                        return false

                    },

                    toSteps: function(min, max, d){
                        var steps = 5,
                            _v = [2, 3, 5, 4, 6, 7],
                            //_v = [7, 6, 5, 4, 3, 2],
                            min = parseInt(min),
                            max = parseInt(max)

                        for(v in _v){
                            if((max - min) % _v[v] == 0)
                                steps = _v[v]
                        }

                        if(d == 2)
                            steps = (max - min) / 2;
                        if(d == 1)
                            steps = (max - min) * 2;

                        return parseInt(steps)
                    },


                    calcMinMaxes: function(items, calculation){

                        var minY = Infinity,
                            maxY = -Infinity,
                            minX = Infinity,
                            maxX = -Infinity;

                        items.forEach( (i) => { 
                                
                            i.forEach((ii) => { 
                                
                                if(ii.data[0].to < minY)
                                    minY = ii.data[0].to
                                
                                if(ii.data[0].to > maxY)
                                    maxY = ii.data[0].to 
                            })
                                
                        })

                        if (calculation == 'sub') { 

                            var vq = null
                            items.forEach( (i, n) => { 

                                i.forEach( (ii, m) => { 

                                    if (n % 2 == 1) { 
                                        vq = items[n - 1][m].data[0].to - ii.data[0].to
                                    }                    
                                    
                                    if(vq > maxY)
                                        maxY = vq

                                    if(vq < minY)
                                        minY = vq

                                })
                            })
                        }
                        else if (calculation == 'add') {

                            for (var c = 0; c < items[0].length; c++) {

                                var tot = 0

                                items.forEach((i, n) => {

                                    i.forEach((ii, m) => {
                                        if (c == m)
                                            tot += ii.data[0].to
                                    })
                                })

                                if (tot > maxY)
                                    maxY = tot

                                if (tot < minY)
                                    minY = tot
                            }
                        }

                        // Calc min and max for X col
                        items.forEach( (i) => {
                            var q = this.minimum(i.map( (v) => v.label)),
                                qq = this.maximum(i.map( (v) => v.label));

                            if(q < minX)
                                minX = q
                            if(qq > maxX)
                                maxX = qq
                        }) 

                        // Adjust before rounding
                        if (minX == maxX) { 
                            minX -= 0.1 * minX
                            maxX += 0.1 * maxX
                        }

                        if (minY == maxY) { 
                            minY -= 0.1 * minY
                            maxY += 0.1 * maxY
                        }

                        var d = this.toRoundValues(minY, maxY),
                            dd = this.toRoundValues(minX, maxX)

                        // Round to multiples of pow(10, n). Min and max should not be equal
                        var _minX =  this.roundDown(minX, dd),
                            _maxX =  this.roundUp(maxX, dd),
                            _minY =  this.roundDown(minY, d),
                            _maxY =  this.roundUp(maxY, d),
                            stepsX = this.toSteps(_minX, _maxX, dd),
                            stepsY = this.toSteps(_minY, _maxY, d);

                        if (this.yValueIsSeconds) { 
                            _maxY = this.roundUpSeconds(maxY, d)
                        }

                        if(_maxX == 0)
                            _maxX = items.length
                        
                        return {
                            roundMinX: _minX, roundMaxX: _maxX, 
                            roundMinY: _minY, roundMaxY: _maxY, 
                            minX: minX, maxX: maxX,
                            minY: minY, maxY:maxY,
                            stepsX: stepsX, stepsY: stepsY}
                    },

                    lengthData: function () {
                        return this.data[0].length
                    },

                    startAtEnd: function (end) {
                        if (!isNaN(end) && end > 0) { 
                            this.setRangeX(end - this.stepsX, end)
                            this.setRangeY(this.D.reachMinY, this.D.reachMaxY)                            
                        }                                                     
                    },

                    initCursor: function(end){
                        if (!isNaN(end) && end > 0) 
                            this.cursor =  new R.Point(end, 0)                    
                        else
                            this.cursor =  new R.Point(0, 0)

                    },

                    startAtBegin: function (x1, x2, y1, y2) {
                        this.setRangeX(x1, x2)
                        this.setRangeY(y1, y2)
                    },

                    setOrigin: function (point) {

                        if(!point && this.origin){
                            point = this.originString
                        }
                        else if(point){
                            this.originString = point
                        }

                        if (point instanceof R.Point) {
                            this.D.setOrigin(point);
                        }
                        else {
                            if (point == 'tr')
                                this.D.setOrigin(new R.Point(this.D.reachMaxX, this.D.reachMaxY))
                            else if (point == 'tl')
                                this.D.setOrigin(new R.Point(this.D.reachMinX, this.D.reachMaxY))
                            else if (point == 'br')
                                this.D.setOrigin(new R.Point(this.D.reachMaxX, this.D.reachMinY))
                            else if (point == 'bl')
                                this.D.setOrigin(new R.Point(this.D.reachMinX, this.D.reachMinY))
                            else if (point == 'cxyb')
                                this.D.setOrigin(new R.Point((this.D.reachMinX + this.D.reachMaxX) / 2, this.D.reachMinY))
                            else if (point == 'cxyt')
                                this.D.setOrigin(new R.Point((this.D.reachMinX + this.D.reachMaxX) / 2, this.D.reachMaxY))
                            else if (point == 'xlcy')
                                this.D.setOrigin(new R.Point(this.D.reachMinX, (this.D.reachMinY + this.D.reachMaxY) / 2))
                            else if (point == 'xrcy')
                                this.D.setOrigin(new R.Point(this.D.reachMaxX, (this.D.reachMinY + this.D.reachMaxY) / 2))
                            else if (point == 'cc')
                                this.D.setOrigin(new R.Point((this.D.reachMinX + this.D.reachMaxX) / 2, (this.D.reachMinY + this.D.reachMaxY) / 2))
                            else if(point == 'x0yt')
                                this.D.setOrigin(new R.Point(0, this.D.reachMaxY))
                            else if(point == 'x0yb')
                                this.D.setOrigin(new R.Point(0, this.D.reachMinY))
                            else if(point == 'x0yc')
                                this.D.setOrigin(new R.Point(0, (this.D.reachMinY + this.D.reachMaxY) / 2))
                        }
                    },
                    setRangeX: function (min, max) {
                        this.D.setReachMinX(Math.min(min, max));
                        this.D.setReachMaxX(Math.max(max, min));
                    },
                    setRangeY: function (min, max) {
                        this.D.setReachMinY(Math.min(min, max));
                        this.D.setReachMaxY(Math.max(max, min));
                    },
                    setRange: function (minX, maxX, minY, maxY) {

                        // Overloaded by Points?
                        if (arguments[0] instanceof R.Point && arguments[1] instanceof R.Point) {
                            this.setRangeX(arguments[0].x, arguments[1].x);
                            this.setRangeY(arguments[0].y, arguments[1].y);
                            this.setOrigin(new R.Point(arguments[0].x, arguments[0].y));

                        }
                            // Overloaded by a Range?
                        else if (arguments[0] instanceof R.Range) {
                            this.setRangeX(arguments[0].minX, arguments[0].maxX);
                            this.setRangeY(arguments[0].minY, arguments[0].maxY);
                            this.setOrigin(new R.Point(arguments[0].minX, arguments[0].minY));
                        }
                        else {

                            this.setRangeX(minX, maxX);
                            this.setRangeY(minY, maxY);
                            this.setOrigin(new R.Point(minX, minY));
                        }
                    },

                    setData: function (data) {

                        this.data = data;

                    },

                    setSteps: function (stepsX, stepsY) {
                        this.stepsX = parseInt(stepsX);
                        this.stepsY = parseInt(stepsY);
                    },

                    setDrawOrigin: function (b) {
                        this.drawOrigin = b;
                    },

                    setDrawMarkersAndLabels: function (b) {
                        this.drawMarkersAndlabels = b;
                    },

                    setClickable: function (b) {
                        this.clickable = b;
                    },

                    addOnClickHandler: function (cb) {

                        this.onClickHandlers.push(cb);
                    },

                    onClick: function (event) {

                        if (this.hasPannableOrigin)
                            this.initPannableOrigin();

                        if (this.hasDataTable) {
                            table.initDataTable(thid);
                            table.showDataTable();
                            table.toggleView();
                        }

                        if (this.hasExport) {
                            requirejs(['rubensjs/export'], (E) => {
                                E.doExport(this.id);
                            });
                        }
                    },

                    dashedLine: function (p1, p2) {
                        var l = this.D.line(p1, p2)

                        if (l)
                            l.attr({
                                "stroke-dasharray": 5,
                                "stroke": this.axisColor
                            });
                        else console.log(p1, p2)
                        return l
                    },

                    dashedYGridLines: function (steps, expand, expandDir, attr) {
                        var 
                            expand = parseInt(expand),
                            y = this.D.reachMinY,
                            expR = 0,
                            expL = 0;
                            
                        if (expandDir == 1) { 
                            expL = -1 * expand / 2
                            expR = expand / 2
                        }
                        else if (expandDir == 2) { 
                            expR = expand / 2
                            expL = 0
                        }

                        if (expand && expandDir == 1) { 
                            expL -= this.D.config.marksYLength + this.D.config.halfFontXHeight
                            expR += this.D.config.marksYLength + this.D.config.halfFontXHeight                        
                        }
                        else if (expand && expandDir == 2) { 
                            expR += this.D.config.marksYLength + this.D.config.halfFontXHeight                        
                        }

                        for (var c = 0; c <= steps; c++) {

                            var exp = parseInt(expand) ? parseInt(expand) : 0,
                                x1 = this.D.toPointX(this.D.reachMinX),
                                y1 = this.D.toPointY(this.D.reachMinY + c * (this.D.reachMaxY - this.D.reachMinY) / steps),
                                x2 = this.D.toPointX(this.D.reachMaxX, expR),
                                y2 = this.D.toPointY(this.D.reachMinY + c * (this.D.reachMaxY - this.D.reachMinY) / steps)

                            this.D.paper.path("M " + x1 + "," + y1 + " L" + x2 + "," + y2)
                            .attr( util.extend({ 
                                'class': this.svgClass, 
                                'transform': 'translate(' + expL + ', 0)',                                
                                "stroke": this.axisColor}, attr))
                        }
                    },

                    dashedXGridLines: function (steps, attr) {
                        var x = this.D.reachMinX;

                        for (var c = 0; c <= steps; c++) {

                            var x1 = this.D.toPointX( this.D.reachMinX + c * (this.D.reachMaxX - this.D.reachMinX) / steps),
                                y1 = this.D.toPointY( this.D.reachMaxY ),
                                x2 = this.D.toPointX( this.D.reachMinX + c * (this.D.reachMaxX - this.D.reachMinX) / steps),
                                y2 = this.D.toPointY( this.D.reachMinY )

                            this.D.paper.path("M " + x1 + "," + y1 + " L" + x2 + "," + y2)
                            .attr( util.extend({ 
                                'class': this.svgClass, 
                                "stroke": this.axisColor}, attr))
                        }

                    },


                    drawAxis: function (drawAxis, xValueIsSeconds, yValueIsSeconds) {
                                                            
                        if (this.drawMarkersAndLabelsX) {
                            this.D.drawMarksXAxis(this.stepsX, this.xAxisMarksAttributes, this.xAxisLabelsAttributes, xValueIsSeconds);
                        }
                        if (this.drawMarkersAndLabelsY) {
                            this.D.drawMarksYAxis(this.stepsY, this.yAxisMarksAttributes, this.yAxisLabelsAttributes, yValueIsSeconds);
                        }
                        if (parseInt(drawAxis))
                            this.D.drawAxis(this.drawOrigin, this.xAxisAttributes, this.yAxisAttributes, this.originTextAttributes);

                        this.makeClickable()
                    },

                    makeClickable: function () {
                        // Make clickable
                        var h = new Hammer.Manager(
                            document.querySelector('#' + this.id),
                            {
                                recognizers: [
                                   [Hammer.Pan, { direction: Hammer.DIRECTION_ALL }],
                                   [Hammer.Tap]
                                ]
                            }
                        );
                        if (!this.hasPanHandler && this.movePullLinesY) {
                            this.hasPanHandler = true

                            h.on("panstart", (event) => {
                                util.eventHandler(() => {
                                    this.initPullLinesY(event);
                                }, errorBox);
                            })
                            h.on("panmove", (event) => {
                                util.eventHandler(() => {
                                    this.movePullLinesY(event);
                                }, errorBox);
                            })
                        }
                        if (this.clickable && !this.hasClickHandler) {
                            var clickLevel = 0;
                            h.on("tap", (event) => {
                                if (this.clickable) {
                                    util.eventHandler(() => {
                                        if (clickLevel == 0 && this.hasPullLines && !this.pinPos) {
                                            clickLevel = 1;


                                            if (this.hasPannableOrigin)
                                                this.initPannableOrigin();

                                            if (this.pullLinesHintText)
                                                this.tapPullLines({
                                                    hint: this.pullLinesHintText,
                                                    width: this.pullLinesHintWidth
                                                });
                                        }
                                        else {
                                            clickLevel = 0;

                                            var cb = null
                                            if (this.moduleOnClickHandlers &&
                                                typeof this.moduleOnClickHandlers[0] == 'function')
                                                cb = this.moduleOnClickHandlers[0].bind(this)
                                            if (cb && cb(event))
                                                ;
                                            else {
                                                this.onClick(event);

                                                this.onClickHandlers.forEach((cb) => {
                                                    if (typeof cb == 'function')
                                                        cb(event);
                                                });
                                            }
                                        }
                                    }, errorBox)
                                }
                            })
                            this.hasClickHandler = true;
                        }
                    }
                }
            }
        }
    })
