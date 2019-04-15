define([
    'external/hammer.min', 'rubensjs/types'], function (Hammer, R) {

        return {

            Zoomable: function () {

                return {
                    // Zoom level
                    zoom: 1,

                    // In pixels
                    topLeft: null,

                    // In values
                    center: new R.Point(0, 0), // The default for empty map

                    drawDataZoomable: function (resolve) {

                        // Open view to scale the map with this.zoom
                        this.D.paper.vOpen()
                        .attr({ viewBox: this.viewBox(), name: 'svgmap' })

                        this.drawData1(resolve)

                        this.D.paper.vClose()

                        //if(resolve)
                        //	resolve()
                    },

                    handleInput: function (px, py, zoom) {

                        // Center
                        var x = this.D.toValueX(
                                    this.zoomedX(
                                        this.D.deviceXToCanvasX(this.id, px))),

                        y = this.D.toValueY(
                                    this.zoomedY(
                                        this.D.deviceYToCanvasY(this.id, py)));

                        // Zoom
                        this.setZoom(zoom)

                        this.centerMap(x, y)
                        //this.centerMap(0,0)

                        this.applyViewbox()
                    },

                    applyViewbox: function () {
                        var vb = this.viewBox()
                        document.querySelector("#" + this.id + " svg  svg[name=svgmap]")
                        .setAttribute('viewBox', vb)
                    },

                    centerMap: function (x, y) {

                        if (typeof x == 'undefined') {
                            x = (this.D.reachMaxX + this.D.reachMinX) / 2,
                            y = (this.D.reachMaxY + this.D.reachMinY) / 2
                        }

                        // Set to centered
                        if (this.zoom == 1) {
                            x = (this.D.reachMaxX + this.D.reachMinX) / 2,
                            y = (this.D.reachMaxY + this.D.reachMinY) / 2
                        }

                        this.topLeft = new R.Point(
                            this.D.toVPointX(x - this.zoom * (this.D.reachMaxX - this.D.reachMinX) / (2 * this.zoom)) - this.D.getGraphLeft(),
                            this.D.toVPointY(y + this.zoom * (this.D.reachMaxY - this.D.reachMinY) / (2 * this.zoom)) - this.D.getGraphTop()
                        )

                        this.center = new R.Point(x, y)
                    },

                    // This is correct now for p == center.x or zoom == 1 ???
                    // ...
                    zoomedX: function (p) {
                        var x = this.D.toVPointX(this.center.x)
                        return x// + (x - p)
                    },

                    zoomedY: function (p) {
                        var y = this.D.toVPointY(this.center.y),
                            ytop = this.D.toPointY(this.D.reachMaxY)
                        return p
                    },

                    // Make a viewBox attribute with this.zoom and this.topLeft
                    viewBox: function () {

                        var rect = document.querySelector("#" + this.id).getBoundingClientRect()

                        return (0.5 * (rect.width - rect.width * (1 / this.zoom)) + this.topLeft.x) + ' '
                             + (0.5 * (rect.height - rect.height * (1 / this.zoom)) + this.topLeft.y) + ' '
                            + (rect.width * (1 / this.zoom)) + " "
                            + (rect.height * (1 / this.zoom));
                    },

                    setZoom: function (upDown) {
                        // set zoom
                        if (upDown < 0)
                            this.zoom /= 2
                        else if (upDown > 0)
                            this.zoom *= 2
                    },
                }
            }
        }
    })