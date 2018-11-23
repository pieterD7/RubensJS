define([
    "rubensjs/rubens",
    "rubensjs/_2d",
    "rubensjs/interface",
    "rubensjs/types",
    "rubensjs/PLG/zoomable",
    "util/util"],
    function (Rubens, _2d, I, T, Z, util) {
        return {

            Soccer: function (id, fontSize, fontColor, bgColor, axisColor) {
                return util.extend(
                    [
                        new I.I(),

                        new Z.Zoomable()

                    ], {

                        D: new _2d.D(),

                        id: id,

                        plusStepsX: 0,

                        opts: {
                            landscape: true
                        },

                        zoomable: true,

                        // Soccer field is 120 x 75
                        fieldLength: 120,

                        fieldWidth: 75,

                        right: 0,

                        top: 0,

                        init: function (config) {

                            // Save config
                            this.config = util.extend(config, { marksYLength: 0, precision: 3 })

                            // Set config, width and height
                            this.D.init(this.id, this.config);

                            // This object does not have support for
                            // counters and default marks
                            this.drawMarkersAndlabelsX = false;
                            this.drawMarkersAndlabelsY = false;

                            // Make Rubens object
                            this.D.paper = new Rubens(this.id, true, true, fontSize, bgColor);

                            // Set orientation
                            if (!this.opts.landscape) {
                                this.top = this.fieldLength
                                this.right = this.fieldWidth
                            }
                            else {
                                this.top = this.fieldWidth
                                this.right = this.fieldLength
                            }

                            // Set range
                            this.D.setReachMinX(-10)
                            this.D.setReachMaxX(this.right + 10)
                            this.D.setReachMinY(-10)
                            this.D.setReachMaxY(this.top + 10)

                            this.D.constrainProportions()

                            this.centerMap()
                            this.initZoomable()
                        },

                        drawGrass: function () {
                            // Draw background
                            this.D.polygon([
                                /*new T.Point(this.right + 10, -10),
                                new T.Point(-10, -10),
                                new T.Point(-10, this.top + 10),
                                new T.Point(this.right + 10, this.top + 10),
                                new T.Point(this.right + 10, -10)*/
                                new T.Point(this.right + 20, -20),
                                new T.Point(-20, -20),
                                new T.Point(-20, this.top + 20),
                                new T.Point(this.right + 20, this.top + 20),
                                new T.Point(this.right + 20, -20)
                            ], null, true, false)
                            .attr({ fill: '#7fce7f', stroke: 'none' })

                            // Draw field
                            this.D.polygon([
                                new T.Point(this.right, 0),
                                new T.Point(0, 0),
                                new T.Point(0, this.top),
                                new T.Point(this.right, this.top),
                                new T.Point(this.right, 0)
                            ], null, true, false)
                            .attr({ fill: 'none', stroke: '#ffffff' })

                        },

                        drawlandScape: function () {
                            // Draw goals
                            this.D.polygon(
                                [
                                new T.Point(0, this.top / 2 - 7.32 / 2),
                                new T.Point(-3, this.top / 2 - 7.32 / 2),
                                new T.Point(-3, this.top / 2 + 7.32 / 2),
                                new T.Point(0, this.top / 2 + 7.32 / 2)
                                ],
                                null
                                )
                            .attr({ stroke: '#ffffff' })

                            // Draw goal area's
                            this.D.polygon(
                                [new T.Point(0, this.top / 2 - 18.3 / 2),
                                new T.Point(5, this.top / 2 - 18.3 / 2),
                                new T.Point(5, this.top / 2 + 18.3 / 2),
                                new T.Point(0, this.top / 2 + 18.3 / 2)],
                                null
                                )
                            .attr({ stroke: '#ffffff' })

                            // Draw penalty area
                            this.D.polygon([
                                new T.Point(0, this.top / 2 - 40.3 / 2),
                                new T.Point(16.5, this.top / 2 - 40.3 / 2),
                                new T.Point(16.5, this.top / 2 + 40.3 / 2),
                                new T.Point(0, this.top / 2 + 40.3 / 2)
                            ], null)
                            .attr({ stroke: '#ffffff' })

                            // Draw circles
                            var mp = this.D.unitToPixelX()
                            this.D.paper.circle(this.D.toPointX(this.right / 2), this.D.toPointY(this.top / 2), 9.15 * mp)
                            .attr({ stroke: '#ffffff', fill: 'none' })

                            // Draw mid spot
                            this.D.paper.circle(this.D.toPointX(this.right / 2), this.D.toPointY(this.top / 2), 0.50 * mp)
                            .attr({ stroke: 'none', fill: '#ffffff' })

                            // Draw penalty mark
                            this.D.paper.circle(this.D.toPointX(11), this.D.toPointY(this.top / 2), 0.50 * mp)
                            .attr({ stroke: 'none', fill: '#ffffff' })

                            var d = 'M '
                            d += this.D.toPointX(16.5) + " " + this.D.toPointY(this.top / 2 - 40.3 / 2)
                            d += ' A '
                            d += ' ' + 9.15 * mp / 2 + ' ' + 9.15 * mp / 2
                            d += ' 1 1 0'
                            d += ' ' + this.D.toPointX(16.5) + " " + this.D.toPointY(this.top / 2 + 40.3 / 2)
                            this.D.paper.path(d)
                            .attr({ stroke: '#ffffff', fill: 'none' })

                        },

                        drawPortrait: function () {
                            // Draw goals
                            this.D.polygon(
                                [
                                new T.Point(this.right / 2 - 7.32 / 2, 0),
                                new T.Point(this.right / 2 - 7.32 / 2, -3),
                                new T.Point(this.right / 2 + 7.32 / 2, -3),
                                new T.Point(this.right / 2 + 7.32 / 2, 0)
                                ],
                                null
                                )
                            .attr({ stroke: '#ffffff' })

                            // Draw goal area's
                            this.D.polygon(
                                [new T.Point(this.right / 2 - 18.3 / 2, 0),
                                new T.Point(this.right / 2 - 18.3 / 2, 5),
                                new T.Point(this.right / 2 + 18.3 / 2, 5),
                                new T.Point(this.right / 2 + 18.3 / 2, 0)],
                                null
                                )
                            .attr({ stroke: '#ffffff' })

                            // Draw penalty area
                            this.D.polygon([
                                new T.Point(this.right / 2 - 40.3 / 2, 0),
                                new T.Point(this.right / 2 - 40.3 / 2, 16.5),
                                new T.Point(this.right / 2 + 40.3 / 2, 16.5),
                                new T.Point(this.right / 2 + 40.3 / 2, 0)
                            ], null)
                            .attr({ stroke: '#ffffff' })

                            // Draw circles
                            var mp = this.D.unitToPixelX()
                            this.D.paper.circle(this.D.toPointX(37.5), this.D.toPointY(60), 9.15 * mp)
                            .attr({ stroke: '#ffffff', fill: 'none' })
                        },

                        drawData1: function () {

                            this.drawGrass()

                            if (this.opts.landscape) {
                                // Draw mid field line
                                this.D.line(
                                    new T.Point(this.right / 2, 0),
                                    new T.Point(this.right / 2, this.top)
                                )
                                .attr({ stroke: '#ffffff' })
                            }
                            else {
                                // Draw mid field line
                                this.D.line(
                                    new T.Point(0, this.top / 2),
                                    new T.Point(this.right, this.top / 2)
                                )
                                .attr({ stroke: '#ffffff' })
                            }

                            if (this.opts.landscape) {
                                this.drawlandScape()
                            }
                            else {

                                this.drawPortrait()
                            }

                        }
                    })
            }
        }
    }
)