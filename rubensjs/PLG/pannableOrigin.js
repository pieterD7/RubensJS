define([
    'util/util', "rubensjs/types",
    "external/hammer.min", "rubensjs/colors"], function (util, R, H, C) {

        return {
            PannableOrigin: function () {
                return {

                    pannableDotAttributes: {
                        'stroke': 'transparent',
                        'fill': C.color_items[0].color
                    },

                    hasOriginDot: function (id) {
                        return this.dot != null;
                    },
                    initPannableOrigin: function () {
                        if (!this.hasOriginDot()) {
                            this.setPanDot();
                            var h = new H(document.querySelector("#" + this.id + " .originDot")),
                              my = this;
                            h.on('panend', function (event) {
                                my.panEnd(event);
                                event.srcEvent.stopPropagation();
                            });
                            var my = this;
                            h.on('pan', function (event) {

                                util.eventHandler(function () {
                                    my.pan(my, event);
                                    event.srcEvent.stopPropagation();
                                });
                            })
                        }
                        else {
                            this.removeDot();
                            return;
                        }
                    },
                    setPanDot: function () {
                        this.dot = this.D.paper.circle(this.D.getOriginPointX(), this.D.getOriginPointY(), 20);
                        //                      this.D.paper.text(
                        //                         this.D.getOriginPointX(),
                        //                         this.D.getOriginPointY(),
                        //                         this.D.origin.x + "/" + this.D.origin.y)
                        //                      .attr({
                        //                        'fill':'#ffffff',
                        //                        'cursor':'pointer',
                        //                        'class':'hideonfocus',
                        //                        'font-size':12})

                        this.dot.attr(
                          util.extend(
                              this.pannableDotAttributes,
                              { 'class': 'originDot', 'cursor': 'pointer' }
                          )
                        );
                    },
                    removeDot: function () {
                        if (this.dot) {
                            this.dot.attr(this.pannableDotAttributes);
                            this.dot.remove();
                            this.dot = null;
                        }
                    },
                    pan: function (my, event) {
                        var p = new R.Point(
                            this.D.toValueXSteps(
                                this.D.deviceXToCanvasX(this.id, event.center.x), this.stepsX),
                            this.D.toValueYSteps(
                                this.D.deviceYToCanvasY(this.id, event.center.y), this.stepsY)
                         );

                        if (p.x != this.D.origin.x ||
                          p.y != this.D.origin.y) {
                            // wipe all paths class=axis labels
                            this.D.removeAxisAndLabels(my.id);
                            // setOrigin en drawAxis
                            this.D.setOrigin(this.D.toWithinReach(p));

                            this.D.drawMarksXAxis(this.stepsX, this.xAxisMarksAttributes, this.xAxisLabelsAttributes);
                            this.D.drawMarksYAxis(this.stepsY, this.yAxisMarksAttributes, this.yAxisLabelsAttributes);

                            this.D.drawAxis(this.drawOrigin, this.xAxisAttributes, this.yAxisAttributes, this.originTextAttributes);

                            // move target on top
                            if (this.dot) {
                                this.dot.attr(this.pannableDotAttributes);

                                this.dot.attr({
                                    'cx': my.D.deviceXToCanvasX(my.id, event.center.x),
                                    'cy': my.D.deviceYToCanvasY(my.id, event.center.y)
                                });
                            }
                        }
                    },
                    panEnd: function () {
                        this.removeDot();
                    }
                }
            }
        }
    })