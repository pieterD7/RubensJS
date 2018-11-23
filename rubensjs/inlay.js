define([
    "rubensjs/rubens",
    "rubensjs/_2d",
    "rubensjs/colors",
    "rubensjs/types"], function (Rubens, _2d, C, T) {

        return {

            Inlay: function (id) {

                return {
                    id: null,

                    paper: null,

                    // Insert into existing SVG
                    insert: function (paper) {
                        this.paper = paper
                    },

                    invalidate: function () {
                        var a = document.querySelectorAll('#' + id + ' .legend')
                        a.forEach((x) => {
                            x.remove()
                        })
                    },

                    drawLegend: function (x, y, w, h, oa, type, header, attr, my, fontColor, nextTo, fontSize, row, offsetText, superGrouped) {

                        // Open svg
                        var p = this.paper.vOpen({ w: w, h: h, x: x, y: y, name: 'Legend' }),
                            left = 8,    // Offset from svg border
                            top = 0

                        if(!offsetText)
                            offsetText = 0

                        this.paper.gOpen()
                        .attr({ 'class': 'legend' })

                        if (type == 'rect') {
                            oa.forEach((o) => {
                                var r = p.rect(left, top + 5, 20, 10)
                                r.attr({ 
                                    'class': this.svgClass, 
                                    fill: o.color,
                                //    mask: mask
                                })

                                p.text(left + 28, top + 10, o.label)
                                .attr({ 
                                    'class': this.svgClass, 
                                    fill: o.color })

                                top += 18
                            })
                        }
                        else if (type == 'cb') {

                            var x2 = 4 ;

                            oa.forEach((o, i) => {

                                if (nextTo) {

                                    my.drawLegendMarker(
                                        this.paper, 
                                        x2, top + fontSize, 180, i, 
                                        oa.length, 
                                        o.color,
                                        o.mask,
                                        superGrouped,
                                        o.sorted
                                    )

                                    var fo = this.paper.foreignObject(),
                                        //div = document.createElementNS('div', 'http://www.w3.org/1999/xhtml'),
                                        div = document.createElement('div')

                                    div.innerHTML = o.label

                                    div.setAttribute('style', 
                                        'max-width:' + (my.opts.legendItemWidth - fontSize * 2) + 'px;' +
                                        //'max-height:' + fontSize + 'px;' + 
                                        (o.right? 'text-align:right;' : '') +
                                        'overflow: hidden;' +
                                        'white-space: nowrap')

                                    fo.el.appendChild(div)

                                    fo.attr({
                                        x: x2 + fontSize * 1.25 + offsetText,
                                        y: top + fontSize / 2 - 0.5,
                                        'color': fontColor
                                    })

                                    x2 += my.opts.legendItemWidth
                                }
                                else { 
                                    my.drawLegendMarker(
                                        this.paper, 
                                        x2, top + fontSize, 180, i, 
                                        oa.length, 
                                        o.color,
                                        o.mask,
                                        superGrouped,
                                        o.sorted
                                    )                                    

                                    var fo = this.paper.foreignObject(),
                                        //div = document.createElementNS('div', 'http://www.w3.org/1999/xhtml'),
                                        div = document.createElement('div')

                                    div.innerHTML = o.label

                                    div.setAttribute('style', 
                                        'max-width:' + (my.opts.legendItemWidth - fontSize * 2) + 'px;' +
                                        //'max-height:' + fontSize + 'px;' + 
                                        (o.right? 'text-align:right;' : '') +
                                        'overflow: hidden;' +
                                        'white-space: nowrap')

                                    fo.el.appendChild(div)

                                    fo.attr({
                                        x: x2 + fontSize * 1.25 + offsetText,
                                        y: top + fontSize / 2 - 0.5,
                                        'color': fontColor
                                    })                      
                                    
                                    top += fontSize * 1.5  
                                }
                            })
                        }
                        else if (type == 'line') {

                        }

                        this.paper.gClose()
                        this.paper.vClose()
                    }
                }
            }
        }
    })