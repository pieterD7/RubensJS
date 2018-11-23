define([
    'util/util', "rubensjs/types",
    "external/hammer.min", "rubensjs/colors",
    "util/localStorage"], function (util, R, H, C, LS) {

        return {
            PullLines: function () {
                return {

                    svgClassPLG: 'pullLines',

                    hasHint: null,

                    balloon: null,

                    pin: null,

                    pinPos: null,

                    pinLocked: false,

                    pullLine: null,

                    hasPulledLine: false,

                    removeSvgClass: function () {
                        var a = document.querySelectorAll("#" + this.id + " ." + this.svgClassPLG)
                        a.forEach((el) => { el.remove() })
                    },

                    // Add some to the length of the line on the right to get the arrow head over the labels
                    // and the pulled line label next to the labels on the y axis
                    makeDAttr: function (p1, p2) {
                        return "M " + this.D.toPointX(p1.x) + " " + this.D.toPointY(p1.y) +
                               "L " + this.D.toPointX(p2.x, 25) + " " + this.D.toPointY(p2.y);
                    },

                    drawPulledLinePin: function (y) {
                        //if(this.pin)
                        //    this.pin.remove();
                        this.D.paper.pin(
                            this.D.toPointX(this.D.reachMaxX),
                            this.D.toPointY(y) - 12
                        )
                        .attr({
                            fill: !this.pinLocked ? C.color_pull_line_pin_lock : C.color_pull_line_line,
                            stroke: 'none', 'stroke-width': 1, 'id': 'pullLinePin', 'class': this.svgClassPLG
                        });
                    },

                    drawPulledLine: function (p1, p2) {

                        this.D.line(p1, p2)
                        .attr({
                            "id": "pullLine",
                            'class': this.svgClassPLG,
                            "d": this.makeDAttr(p1, p2),
                            'stroke-width': 2,
                            //'marker-end': 'url(#arrowHeadGreen)',
                            'marker-start': 'url(#arrowStart)',
                            "stroke-dasharray": '10',
                            stroke: this.axisColor
                        });
                        this.D.paper.text(
                            this.D.toPointX(p2.x, 25),
                            this.D.toPointY(p2.y),
                           Math.round(p2.y, 2).toLocaleString()
                        )
                        .attr({
                            'class': this.svgClassPLG,
                            'fill': this.axisColor
                        })
                    },

                    // Called on resize or to remove the pulled line
                    restorePinnedLine: function () {
                        // Here we've lost the connection to the line in svg so renew it
                        var oEl = document.querySelector("#" + this.id + " #pullLine");
                        if (oEl)
                            oEl.remove();

                        if (this.pullLines && this.pullLines[0]) {
                            this.pullLines[0].t.remove();
                        }

                        if (this.pinPos) {

                            var y = this.pinPos,
                                p1 = new R.Point(this.D.reachMinX, y),
                                p2 = new R.Point(this.D.reachMaxX, y);

                            this.drawPulledLine(p1, p2);
                            this.drawPulledLinePin(y);
                        }
                    },

                    // Called onTap and returns true if tap on pin
                    tapPullLinesOnPin: function (event) {
                        if (this.pinPos) {
                            var point = new R.Point(
                                    // minus 10 to avoid Infinity returned from toPointX(event.x)
                                    this.D.toValueX(this.D.toPointX(this.D.reachMaxX) - 10),
                                    this.pinPos
                                ),
                                rect = new R.Rect(
                                    new R.Point(
                                        this.D.toValueX(this.D.deviceXToCanvasX(this.id, event.center.x - 20)),
                                        this.D.toValueY(this.D.deviceYToCanvasY(this.id, event.center.y + 20))
                                    ),
                                    new R.Point(
                                        this.D.toValueX(this.D.deviceXToCanvasX(this.id, event.center.x + 20)),
                                        this.D.toValueY(this.D.deviceYToCanvasY(this.id, event.center.y - 20))
                                    )
                                );
                            if (point.matches(rect)) {
                                // Update UI
                                if (this.pinLocked) {
                                    this.pinLocked = false;
                                    this.drawPulledLinePin(this.pinPos)
                                }
                                else {
                                    this.pinLocked = true;
                                    this.drawPulledLinePin(this.pinPos)
                                }

                                if (this.pinLocked && this.pinPos) {

                                    // Save the pin position in localStorage by uri
                                    var newItem = { t: '', s: this.pinPos };

                                    // Only save with consent, e.g. some data has been entered
                                    var consentLocalStorage = typeof medicontact != 'undefined' ? true : JSON.parse(localStorage.getItem('consentLocalStorage'));

                                    if (consentLocalStorage) {
                                        var ls = new LS.LS();
                                        ls.updateItem("pinpos", newItem)
                                    }
                                }

                                return true;
                            }
                            else
                                return false;
                        }
                        else
                            return false;
                    },

                    // Called onTap to show hint or remove it
                    tapPullLines: function (params) {
                        if (!this.hasHint) {

                            this.balloon = this.D.paper.balloon(
                                this.D.toPointX(this.D.reachMinX + (this.D.reachMaxX - this.D.reachMinX) / 2) - params.width / 2,
                                this.D.toPointY(this.D.reachMinY) - 62,
                                params && params.width ? params.width : 128,
                                40)
                            .attr({
                                fill: C.color_balloon_fill,
                                'class': this.svgClassPLG,
                                stroke: C.color_balloon_stroke
                            });

                            var t = this.D.paper.text(
                                this.D.toPointX(this.D.reachMinX + (this.D.reachMaxX - this.D.reachMinX) / 2) - params.width / 2 + 25,
                                this.D.toPointY(this.D.reachMinY) - 40,
                                params && params.hint ? params.hint : "Pull lines"
                            );
                            t.attr({
                                'text-anchor': 'center',
                                'class': this.svgClassPLG,
                                'fill': C.color_balloon_text
                            });
                            this.hasHint = t;
                        }
                        else {

                            this.removeSvgClass()
                            this.hasHint = null;
                            this.balloon = null;
                        }
                    },

                    // Called on panstart
                    initPullLinesY: function (event) {

                        if (this.balloon)
                            this.balloon.remove();

                        if (this.hasHint)
                            this.hasHint.remove();

                        // Check to see if x-axis was tapped
                        var y = this.D.toValueY(this.D.deviceYToCanvasY(this.id, event.center.y)),
                            deltaPix = this.D.toPointY(this.D.reachMinY) - this.D.toPointY(y);

                        // Show line
                        if (deltaPix < 20) {
                            this.hasPulledLine = true
                        }

                        this.moduleOnClickHandlers = [this.tapPullLinesOnPin]
                    },

                    // Called on panmove
                    movePullLinesY: function (event) {

                        //if(!this.pullLines[0])
                        //  this.initPullLinesY(event)
                        if (this.pinLocked || !this.hasPulledLine) return;

                        var y = this.D.toValueY(this.D.deviceYToCanvasY(this.id, event.center.y)),
                            y2 = this.D.toPointY(y),
                            p1 = new R.Point(this.D.reachMinX, y),
                            p2 = new R.Point(this.D.reachMaxX, y);

                        // Dragged to within reach?
                        if ((y2 > -0)) {
                            this.removeSvgClass()


                            this.drawPulledLine(p1, p2);

                            this.drawPulledLinePin(y);

                            // Store
                            this.pinPos = y;
                        }
                        else {

                            this.removeSvgClass()

                            this.hasPulledLine = false
                        }
                    }
                }
            }
        }
    })