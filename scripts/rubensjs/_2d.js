define([
    'rubensjs/types',
    'rubensjs/colors',
    'util/util'], function (R, C, util) {

        return {
            D: function () {
                return {
                    paper: null,

                    origin: null,

                    config: null,

                    marksLeft: true,

                    marksBottom: true,

                    reachMaxX: 5,

                    reachMaxY: 5,

                    reachMinX: -5,

                    reachMinY: -5,

                    flipXMarks: false,

                    flipYMarks: false,

                    reverse: false,

                    centerIsMax: false,

                    hasPannableOrigin: false,

                    w: 0,

                    h: 0,

                    init: function (id, _config) {

                        var config = new R.Config();
                        this.config = util.extend(_config, config);

                        var mXLength = this.getConfigMarksXLength(),
                            mYlength = this.getConfigMarksYLength();

                        var rect = document.querySelector("#" + id).getBoundingClientRect();

                        this.w = rect.width
                            - mYlength
                            - this.config.paddingLeft
                            - this.config.paddingRight

                        this.h = rect.height
                            - mXLength
                            - this.config.paddingTop
                            - this.config.paddingBottom
                    },

                    getGraphLeft: function () {
                        return this.config.paddingLeft + this.config.marksYLength
                    },

                    getGraphTop: function () {
                        if (!this.marksBottom)
                            return this.config.paddingTop + this.config.marksXLength
                        return this.config.paddingTop
                    },

                    // Returns the size of one unit of measurement in pixel
                    unitToPixelX: function () {
                        return this.toVPointX(1) - this.toVPointX(0)
                    },

                    unitToPixelY: function () {
                        return this.toVPointY(0) - this.toVPointY(1)
                    },

                    constrainProportions: function () {

                        // Calc side to scale
                        var d1 = this.w / (this.reachMaxX - this.reachMinX),
                            d2 = this.h / (this.reachMaxY - this.reachMinY)

                        // constrained:
                        // 1 unit x should equal 1 unit y in pixels
                        // Calculate new maxX or maxY
                        // to keep center, add maxNew - maxOld / 2 to max and
                        // substract the same from min

                        // if(this.w / (maxX - minX) > this.h / (maxY - minY))
                        //     this.w / (maxX - minX) = this.h / (Ymax - minY)
                        // this.h * (Ymax - minY) = (maxX - minX) * this.w
                        // (maxY - minY) = (maxX - minX) * this.w / this.h


                        if (d1 > d2) {
                            var nMax = ((this.reachMaxY - this.reachMinY) * this.w) / this.h,
                                maxX = this.reachMaxX,
                                minX = this.reachMinX
                            this.reachMaxX += R.Float((nMax - (maxX - minX)) / 2)
                            this.reachMinX -= R.Float((nMax - (maxX - minX)) / 2)

                        }
                        else {
                            var nMax = ((this.reachMaxX - this.reachMinX) * this.h) / this.w,
                                maxY = this.reachMaxY,
                                minY = this.reachMinY
                            this.reachMaxY += R.Float((nMax - (maxY - minY)) / 2)
                            this.reachMinY -= R.Float((nMax - (maxY - minY)) / 2)

                        }

                        this.reachMaxY = R.Float(this.reachMaxY)
                        this.reachMinX = R.Float(this.reachMinX)
                    },

                    getConfigMarksYLength: function () {
                        if (this.flipYMarks === true &&
                            this.hasPannableOrigin === true)
                            return 2 * this.config.marksYLength;
                        return this.config.marksYLength;
                    },

                    getConfigMarksXLength: function () {
                        if (this.flipXMarks === true &&
                            this.hasPannableOrigin === true)
                            return 2 * this.config.marksXLength;
                        return this.config.marksXLength;
                    },

                    // Transpose x to within the axis
                    // and zero is y-axis
                    toX: function (x) {
                        return x + this.config.paddingLeft + this.config.marksYLength;
                    },

                    // Transpose y to within the axis
                    // and zero equals x-axis (bottom)
                    toY: function (y) {
                        var n = this.h - (y - this.config.paddingTop);
                        if (!this.marksBottom)
                            n += this.config.marksXLength;
                        return n;
                    },

                    toWithinReach: function (p) {
                        var pp = new R.Point(p.x, p.y);

                        try {
                            if (p.x < this.reachMinX)
                                p.x = this.reachMinX;
                            else if (p.x > this.reachMaxX)
                                p.x = this.reachMaxX;

                            if (p.y < this.reachMinY)
                                p.y = this.reachMinY;
                            else if (p.y > this.reachMaxY)
                                p.y = this.reachMaxY;

                            if (!pp.equals(p)) {
                                var err = new Error();
                                //throw err.stack
                                //throw "Corrected to within reach corrected:" +
                                //p.x + "," + p.y + " input:" + pp.x + "," + pp.y
                            }
                        } catch (error) {
                            console.log(error);
                        }

                        return p;
                    },

                    removeAxisAndLabels: function (id) {

                        var a = document.querySelectorAll(
                            '#' + id + ' .marks,' +
                            '#' + id + ' .axis,' +
                            '#' + id + ' .label,' +
                            '#' + id + ' .originDashedLine');
                        a.forEach(function (p) {
                            p.remove();
                        });
                    },

                    openGroup: function (name, rotateDegrees) {
                        var x = this.toPointX((this.reachMaxX + this.reachMinX) / 2),
                            y = this.toPointY((this.reachMaxY + this.reachMinY) / 2),
                            o = this.paper.gOpen(),
                            n = name || 'svgLayer'

                        if (!rotateDegrees || isNaN(rotateDegrees))
                            rotateDegrees = 0;


                        o.attr({ 'class': n, 'id': n /*, transform:'rotate (' + rotateDegrees + " " + x + " " + y + ')'*/ })
                        return o
                    },

                    closeGroup: function () {
                        this.paper.gClose()
                    },

                    // Draws a line within the chart
                    line: function (pointA, pointB) {

                        var rp1 = this.toRPoints(pointA, pointB)

                        if (rp1)
                            return this.paper.path(
                                "M " + rp1[0].x + " " + rp1[0].y +
                                "L " + rp1[1].x + " " + rp1[1].y);
                        else {
                            console.log(this, pointA, pointB, rp1)
                            return false
                        }
                    },

                    // For turning clockwise with arcTo (lowercase a)
                    // Starting point is given by zero degrees or 12 o'clock
                    // and turning clockwise
                    pointOnCircleWithAngleFromCenter: function (radius, angle) {

                        var r = radius,
                            dx = r,
                            dy = r

                        if(isNaN(angle)) return new R.Point(0, 0)

                        if (angle <= 0.25) {

                            var d = angle * 360 * util.dgrToRad

                            // sin(d) = opposite / hypotenuse
                            // sin(d) = x / r
                            dx = Math.sin(d) * r

                            // x*x + y*y = r*r
                            // y*y = r*r - x*x
                            dy = r - Math.sqrt(r * r - dx * dx)

                            return new R.Point(dx, dy)
                        }
                        else if (angle <= 0.5) {
                            var d = angle * 360 * util.dgrToRad

                            dx = Math.sin(d) * r
                            dy = r + Math.sqrt(r * r - dx * dx)

                            return new R.Point(dx, dy)
                        }
                        else if (angle <= 0.75) {
                            var d = angle * 360 * util.dgrToRad
                            dx = Math.sin(d) * r

                            dy = r + Math.sqrt(r * r - dx * dx)

                            return new R.Point(dx, dy)
                        }
                        else if (angle <= 1.0) {
                            var d = (angle - 0.75) * 360 * util.dgrToRad
                            dy = -1 * Math.sin(d) * r
                            dx = r - Math.sqrt(r * r - dy * dy)

                            return new R.Point(dx, dy)
                        }
                        else return new R.Point(0,0)

                    },



                    // Doesn't take inside/outside into account
                    // .. 
                    addCorners: function (lastP, p, rpts, P, cornerPoints) {

                        // Top right
                        if (/*lastP.x <= this.reachMaxX
                        && */lastP.y >= this.reachMaxY
                            && p.x >= this.reachMaxX) {

                            var x = this.toPointX(this.reachMaxX),
                                y = this.toPointY(this.reachMaxY)

                            if (!cornerPoints.tr && x && y && P.pointInside(new R.Point(this.reachMaxX, this.reachMaxY))) {
                                rpts.push(x + " " + y)
                                cornerPoints.tr = true
                                return cornerPoints
                            }
                        }
                        // Top left
                        if (/*lastP.x <= this.reachMinX
                        && */lastP.y <= this.reachMaxY
                            && p.x <= this.reachMinX
                            && p.y >= this.reachMaxY) {

                            var x = this.toPointX(this.reachMinX),
                            y = this.toPointY(this.reachMaxY)

                            if (!cornerPoints.tl && x && y && P.pointInside(new R.Point(this.reachMinX, this.reachMaxY))) {
                                rpts.push(x + " " + y)
                                cornerPoints.tl = true
                                return cornerPoints
                            }
                        }
                        // Bottom left
                        if (/*lastP.x >= this.reachMinX
                        && */lastP.y <= this.reachMinY
                            && p.x <= this.reachMinX
                            /*&& p.y <= this.reachMinY*/) {

                            var x = this.toPointX(this.reachMinX),
                                y = this.toPointY(this.reachMinY)

                            if (!cornerPoints.bl && x && y && P.pointInside(new R.Point(this.reachMinX, this.reachMinY))) {
                                rpts.push(x + " " + y)
                                cornerPoints.bl = true
                                return cornerPoints
                            }
                        }
                        // Bottom right
                        if (/*lastP.x >= this.reachMinX
                        && */lastP.y <= this.reachMinY
                            && p.x >= this.reachMaxX
                            /* && p.y <= this.reachMinY */) {

                            var x = this.toPointX(this.reachMaxX),
                                y = this.toPointY(this.reachMinY)
                            if (!cornerPoints.br && x && y && P.pointInside(new R.Point(this.reachMaxX, this.reachMinY))) {
                                rpts.push(x + " " + y)
                                cornerPoints.br = true
                                return cornerPoints
                            }
                        }
                        return cornerPoints
                    },

                    nBorderValues: function (rp) {
                        var n = 0;

                        rp.forEach((r) => {
                            if (r.x == this.toPointX(this.reachMinX))
                                n++
                            if (r.x == this.toPointX(this.reachMaxX))
                                n++
                            if (r.y == this.toPointY(this.reachMinY))
                                n++
                            if (r.y == this.toPointY(this.reachMaxY))
                                n++
                        })
                        return n
                    },

                    pointHalfwayIsInside: function (P, pntIn, pntOut) {
                        var p = new R.Point(
                                (Math.max(pntIn.x, pntOut.x) - Math.min(pntIn.x, pntOut.x)) / 2,
                                (Math.max(pntIn.y, pntOut.y) - Math.min(pntIn.y, pntOut.y)) / 2
                            )
                        return P.pointInside(p)
                    },

                    pointArrayToD: function (points, solid, closed) {

                        var P = new R.Polygon(points),

                            polies = [],
                            cPoly = [],
                            prevPnts = [],
                            firstP = null,
                            lastP = null,
                            n = 0,           // counter for in / out. Even is outside
                            corners = 4,
                            inOutLeft = false,
                            inOutTop = false,
                            inOutRight = false,
                            inOutBottom = false,
                            pntIn = 0,
                            pntOut = 0,
                            pointOut = null,
                            pointIn = null,
                            cornerPoints = { tl: false, tr: false, br: false, bl: false }

                        points.forEach((p) => {

                            if (lastP && !lastP.equals(p)) {

                                var rp = this.toRPoints(lastP, p)

                                if (rp) {

                                    // Substitution? (go in or out)
                                    if (rp[2] == true) {

                                        inOutLeft = inOutTop = inOutRight = inOutBottom = false

                                        // Adjust inside/outside counter
                                        n++

                                        // Go in and out?
                                        if (this.nBorderValues(rp) > 1) {
                                            if (rp[0].x == this.toPointX(this.reachMinX))
                                                inOutLeft = true
                                            if (rp[0].x == this.toPointX(this.reachMaxX))
                                                inOutRight = true
                                            if (rp[0].y == this.toPointY(this.reachMaxY))
                                                inOutTop = true
                                            if (rp[0].y == this.toPointY(this.reachMinY))
                                                inOutBottom = true

                                            cPoly.push(rp[0].x + " " + rp[0].y)
                                            cPoly.push(rp[1].x + " " + rp[1].y)

                                        }
                                            // Go in?
                                        else if (n % 2 == 1) {

                                            if (rp[0].x == this.toPointX(this.reachMinX)) {
                                                inOutLeft = true
                                                pntIn = 1
                                                pointIn = lastP
                                            }
                                            if (rp[0].x == this.toPointX(this.reachMaxX)) {
                                                inOutRight = true
                                                pntIn = 2
                                                pointIn = lastP
                                            }
                                            if (rp[0].y == this.toPointY(this.reachMaxY)) {
                                                inOutTop = true
                                                pntIn = 3
                                                pointIn = lastP
                                            }
                                            if (rp[0].y == this.toPointY(this.reachMinY)) {
                                                inOutBottom = true
                                                pntIn = 4
                                                pointIn = lastP
                                            }

                                            if (rp[1].x == this.toPointX(this.reachMinX)) {
                                                inOutLeft = true
                                                pntIn = 1
                                                pointIn = p
                                            }
                                            if (rp[1].x == this.toPointX(this.reachMaxX)) {
                                                inOutRight = true
                                                pntIn = 2
                                                pointIn = p
                                            }
                                            if (rp[1].y == this.toPointY(this.reachMaxY)) {
                                                inOutTop = true
                                                pntIn = 3
                                                pointIn = p
                                            }
                                            if (rp[1].y == this.toPointY(this.reachMinY)) {
                                                inOutBottom = true
                                                pntIn = 4
                                                pointIn = p
                                            }

                                            if (pntOut == false)
                                                pntOut = pntIn

                                            if (cPoly.length > 0 && pointIn && pointOut
                                                && !this.pointHalfwayIsInside(P, pointIn, pointOut)) {

                                                // new polygon
                                                polies.push(cPoly)
                                                cPoly = []
                                                cPoly.push(rp[0].x + " " + rp[0].y)
                                            }
                                            else {
                                                cPoly.push(rp[0].x + " " + rp[0].y)
                                                cPoly.push(rp[1].x + " " + rp[1].y)
                                            }

                                        }
                                            // Go out
                                        else {

                                            if (rp[0].x == this.toPointX(this.reachMinX)) {
                                                inOutLeft = true
                                                pntOut = 1
                                                pointOut = lastP
                                            }
                                            if (rp[0].x == this.toPointX(this.reachMaxX)) {
                                                inOutRight = true
                                                pntOut = 2
                                                pointOut = lastP
                                            }
                                            if (rp[0].y == this.toPointY(this.reachMaxY)) {
                                                inOutTop = true
                                                pntOut = 3
                                                pointOut = lastP
                                            }
                                            if (rp[0].y == this.toPointY(this.reachMinY)) {
                                                inOutBottom = true
                                                pntOut = 4
                                                pointOut = lastP
                                            }

                                            if (rp[1].x == this.toPointX(this.reachMinX)) {
                                                inOutLeft = true
                                                pntOut = 1
                                                pointOut = p
                                            }
                                            if (rp[1].x == this.toPointX(this.reachMaxX)) {
                                                inOutRight = true
                                                pntOut = 2
                                                pointOut = p
                                            }
                                            if (rp[1].y == this.toPointY(this.reachMaxY)) {
                                                inOutTop = true
                                                pntOut = 3
                                                pointOut = p
                                            }
                                            if (rp[1].y == this.toPointY(this.reachMinY)) {
                                                inOutBottom = true
                                                pntOut = 4
                                                pointOut = p
                                            }

                                            if (pntIn == false)
                                                pntIn = pntOut

                                            cPoly.push(rp[0].x + " " + rp[0].y)
                                            cPoly.push(rp[1].x + " " + rp[1].y)

                                        }

                                    }
                                        // Not going in or out
                                    else {

                                        // Push point
                                        cPoly.push(rp[0].x + " " + rp[0].y)

                                        cPoly.push(rp[1].x + " " + rp[1].y)
                                    }
                                }

                                    // No rp
                                else {
                                    // corner in p? push corner(s) if in P
                                    // ...
                                    if (true) {
                                        if (solid && corners) {
                                            cornerPoints = this.addCorners(lastP, p, cPoly, P, cornerPoints)
                                        }
                                    }

                                }

                                lastP = p

                            }
                            else {
                                if (!firstP)
                                    firstP = p
                                lastP = p
                            }
                        })

                        // End iter

                        //if (prevPnts.length > 0) {
                        //    cPoly = cPoly.concat(prevPnts)
                        //}

                        if (closed) {
                            // Close shape by calc last rp
                            var rp = this.toRPoints(lastP, firstP)
                            if (rp) {
                                cPoly.push(rp[0].x + " " + rp[0].y)
                                cPoly.push(rp[1].x + " " + rp[1].y)
                            }
                        }

                        polies.push(cPoly)

                        // Return array of d-attribute (partial) values

                        var ret = []
                        polies.forEach((p) => {

                            if (p.length > 1)
                                ret.push("M " + p.join(" ") + (closed ? "Z" : ""))
                        })

                        return ret
                    },

                    polygon: function (points, holes, solid, closed) {
                        var d = ''

                        d = this.pointArrayToD(points, solid, closed).join(" ")

                        if (holes)
                            holes.forEach((points) => {
                                if (points.length > 0)
                                    d += this.pointArrayToD(points, solid).join(" ")
                            })

                        if (d)
                            return this.paper.path(d)
                        else
                            return false
                    },

                    // Draws both axis and origin if needed and possible
                    drawAxis: function (drawOrigin, attrsPathX, attrsPathY, attrsText) {

                        // x and y-axis
                        this.line(
                           new R.Point(this.origin.x, this.reachMaxY),
                           new R.Point(this.origin.x, this.reachMinY)
                        )
                        .attr(util.extend(attrsPathX, { 'class': 'axis' }));

                        this.line(
                           new R.Point(this.reachMinX, this.origin.y),
                           new R.Point(this.reachMaxX, this.origin.y)
                        )
                        .attr(util.extend(attrsPathY, { 'class': 'axis' }));

                        // origin text
                        if (drawOrigin && this.origin.x == 0 && this.origin.y == 0) {
                            this.paper.text(
                                this.toPointX(0, -1 * this.config.halfFontXHeight),
                                this.toPointY(0, this.config.halfFontXHeight), "0")
                           .attr(util.extend(attrsText, { 'class': 'mark originText'  }));
                        }
                        else {
                            ;// this.drawDashedLineToXYAxis(new R.Point(0,0));
                        }

                    },

                    drawLabelXAxis: function (text, attr, position, drawArrow) {

                        if (position == '1') {

                            this.paper.text(
                                this.toPointX(this.reachMinX),
                                this.toPointY(this.reachMinY, 50),
                                text
                            )

                            .attr(util.extend(attr, { 'class': 'label', "text-anchor": 'start', 'letter-spacing': '0.2em' }))

                            if (drawArrow) {
                                this.paper.path(
                                    "M" +
                                    (this.toPointX(this.reachMaxX, -100)) + " " +
                                    (this.toPointY(this.reachMinY, 50)) + " " +
                                    (this.toPointX(this.reachMaxX, -10)) + " " +
                                    (this.toPointY(this.reachMinY, 50))
                                )
                            }
                        }
                        else if (position == '2') {
                            this.paper.text(
                                this.toPointX((this.reachMaxX - this.reachMinX) / 2 + this.reachMinX),
                                this.toPointY(this.reachMinY, 50),
                                text
                            )

                            .attr(util.extend(attr, { 'class': 'label', "text-anchor": 'middle', 'letter-spacing': '0.2em' }))
                        }
                        else if (position == '3') {
                            this.paper.text(
                                this.toPointX(this.reachMaxX),
                                this.toPointY(this.reachMinY, 50),
                                text
                            )

                            .attr(util.extend(attr, { 'class': 'label', "text-anchor": 'end', 'letter-spacing': '0.2em' }))
                        }
                        else if (position == '4') {
                            this.paper.text(
                                this.toPointX(this.reachMinX),
                                this.toPointY(this.reachMaxY, -50),
                                text
                            )

                            .attr(util.extend(attr, { 'class': 'label', "text-anchor": 'start', 'letter-spacing': '0.2em' }))
                        }
                        else if (position == '5') {
                            this.paper.text(
                                this.toPointX((this.reachMaxX + this.reachMinX) / 2),
                                this.toPointY(this.reachMaxY, -50),
                                text
                            )

                            .attr(util.extend(attr, { 'class': 'label', "text-anchor": 'middle', 'letter-spacing': '0.2em' }))
                        }
                        else if (position == '6') {
                            this.paper.text(
                                this.toPointX(this.reachMaxX),
                                this.toPointY(this.reachMaxY, -50),
                                text
                            )

                            .attr(util.extend(attr, { 'class': 'label', "text-anchor": 'end', 'letter-spacing': '0.2em' }))
                        }
                    },

                    // Draws the marks at the x-axis
                    drawMarksXAxis: function (steps, attrsPath, attrsText, isSeconds) {
                        var max = this.reachMaxX,
                            min = this.reachMinX,
                            marksXLength = this.config.marksXLength,
                            halfFontXHeight = this.config.halfFontXHeight;

                        if (this.flipXMarks ||
                            !this.marksBottom) {
                            marksXLength *= -1;
                            halfFontXHeight *= -1
                        }

                        var div = this.config.markersXBetween

                        for (var c = 0; c < steps * div + 1; c++) {

                            var xp1 = this.toPointX(this.reachMinX + c * (max - min) / steps / div),
                                yp1 = this.toPointY(this.origin.y) + marksXLength / (1 + (c % div != 0)),
                                xp2 = this.toPointX(this.reachMinX + c * (max - min) / steps / div),
                                yp2 = (this.toPointY(this.origin.y)),
                                xp3 = this.toPointX(this.reachMinX + c * (max - min) / steps),
                                yp3 = this.toPointY(this.origin.y) + marksXLength + 2 * halfFontXHeight

                            if (xp1 && xp2 && yp1 && yp2) {
                                this.paper.path(
                                        "M " + xp1 + "," +
                                                yp1 +
                                        "L " + xp2 + "," +
                                                yp2)
                                .attr(util.extend(attrsPath, { 'class': 'axis' }));

                                if (c < steps + 1 && (c % (div - 1) == 0 || div == 1)) {

                                    var lbl = R.Float((min + c * (max - min) / steps))

                                    if( ! this.reverse){
                                        this.paper.text(
                                            xp3,
                                            yp3,
                                            this.toPrecisionX(lbl, isSeconds)
                                        )

                                        .attr(util.extend(attrsText, { 'class': 'marks', 'text-anchor': 'middle', "font-size": '80%' }));                                    
                                    }
                                    else{
                                        lbl = R.Float((max - c * (max - min) / steps))

                                        if (this.centerIsMax && lbl < 0) { 
                                            lbl += -1 * min
                                        }
                                        else if (this.centerIsMax) { 
                                            lbl -= -1 * min
                                        }

                                        this.paper.text(
                                            xp3,
                                            yp3,
                                            this.toPrecisionX(lbl, isSeconds)
                                        )

                                        .attr(util.extend(attrsText, { 'class': 'marks', 'text-anchor': 'middle', "font-size": '80%' }));                                    
                                    }
                                }
                            }
                        }
                    },

                    drawLabelYAxis: function (text, attr, position, offset) {

                        //if(this.origin.x == this.reachMinX)
                        //    left *= -1

                        var x = this.origin.x,
                            y = this.reachMaxY,
                            ta = 'middle'

                        if (position == 1) { x = this.reachMinX; y = this.reachMinY; }
                        else if (position == 2) { x = (this.reachMinX + this.reachMaxX) / 2; y = this.reachMinY; }
                        else if (position == 3) { x = this.reachMaxX; y = this.reachMinY; }
                        else if (position == 4) { x = this.reachMinX; y = this.reachMaxY; offset *= -1; }
                        else if (position == 5) { x = (this.reachMinX + this.reachMaxX) / 2; y = this.reachMaxY; offset *= -1; }
                        else if (position == 6) { x = this.reachMaxX; y = this.reachMaxY; y = this.reachMaxY; offset *= -1; }

                        this.paper.text(
                            this.toPointX(x),
                            this.toPointY(y, offset),
                            text
                        )

                        .attr(util.extend(attr, { 'class': 'label', "text-anchor": ta, 'letter-spacing': '0.2em' }))
                    },

                    drawVerticalLabelYAxis: function (text, attr, offset) {
                        var left = this.config.paddingLeft / 2,
                            offset = offset || 0

                        left -= offset

                        if (this.origin.x == this.reachMinX)
                            left *= -1

                        this.paper.text(
                            this.toPointX(this.origin.x, left),
                            this.toPointY((this.reachMaxY + this.reachMinY) / 2),
                            text
                        )

                        .attr(util.extend(attr, { 'class': 'label', "text-anchor": 'middle', 'letter-spacing': '0.2em' }))
                    },

                    // Draws the marks at the y-axis
                    drawMarksYAxis: function (steps, attrsPath, attrsText, isSeconds) {
                        var max = this.reachMaxY,
                           min = this.reachMinY,
                           marksYLength = this.config.marksYLength,
                           halfFontXHeight = this.config.halfFontXHeight;

                        if (this.marksLeft || this.flipYMarks) {
                            marksYLength *= -1;
                            halfFontXHeight *= -1
                        }

                        var div = this.config.markersYBetween

                        for (var c = 0; c <= steps * div; c++) {

                            var xp1 = this.toPointX(this.origin.x),
                                yp1 = this.toPointY(Math.min(this.reachMinY + (c * ((max - min) / steps / div)), this.reachMaxY)),
                                xp2 = this.toPointX(this.origin.x, marksYLength / (1 + (c % div != 0))),
                                yp2 = this.toPointY(Math.min(this.reachMinY + (c * ((max - min) / steps / div)), this.reachMaxY)),
                                xp3 = this.toPointX(this.origin.x, marksYLength + halfFontXHeight),
                                yp3 = this.toPointY(Math.max(this.reachMaxY - (c * (max - min) / steps), this.reachMinY))

                            if (xp1 && xp2 && yp1 && yp2) {
                                this.paper.path(
                                        "M" + xp1 + "," +
                                            yp1 +
                                        "L" + xp2 + "," +
                                            yp2
                                )
                                .attr(util.extend(attrsPath, { 'class': 'axis'}));

                                if (c < steps + 1 && (c % (div - 1) == 0 || div == 1)) {

                                    var t = this.paper.text(
                                        xp3,
                                        yp3,
                                        this.toPrecisionY(R.Float(max - (max - min) / steps * c), isSeconds)
                                    );
                                    if (this.marksLeft)
                                        t.attr(util.extend(attrsText, { 'class': 'marks', "font-size": '80%', 'text-anchor': 'end'}));
                                    else
                                        t.attr(util.extend(attrsText, { 'class': 'marks', "font-size": '80%', 'text-anchor': 'start'}));
                                }
                            }
                        }
                    },

                    // Sets the reach of the data (max X)
                    setReachMaxX: function (max) {
                        this.reachMaxX = parseFloat(max);
                    },

                    //  Sets the reach of the data (max Y)
                    setReachMaxY: function (max) {
                        this.reachMaxY = parseFloat(max);
                    },

                    //  Sets the reach of the data (min X)
                    setReachMinX: function (min) {
                        this.reachMinX = parseFloat(min);
                    },

                    //  Sets the reach of the data (min Y)
                    setReachMinY: function (min) {
                        this.reachMinY = parseFloat(min);
                    },

                    // Plots a point X to the graph
                    // else returns false if it doesn't fit
                    toPointX: function (xp, offset) {
                        // Check bounds
                        if (xp > this.reachMaxX) {
                            return false
                        }
                        else if (R.Float(xp) < R.Float(this.reachMinX)) {
                            return false
                        }
                        return this.toX((this.w / (this.reachMaxX - this.reachMinX)) * (xp - this.reachMinX)) + (offset ? offset : 0);
                    },

                    // Return a point X even if it is a virtual point that cannot be drawn
                    toVPointX: function (xp) {
                        return this.toX((this.w / (this.reachMaxX - this.reachMinX)) * (xp - this.reachMinX));
                    },

                    // Plots a point Y to the graph
                    // else returns false if it doesn't fit
                    toPointY: function (yp, offset) {
                        // Check bounds
                        if (yp > this.reachMaxY) {
                            return false
                        }
                        else if (R.Float(yp) < R.Float(this.reachMinY)) {
                            return false
                        }
                        return this.toY((this.h / (this.reachMaxY - this.reachMinY)) * (yp - this.reachMinY)) + (offset ? offset : 0);
                    },

                    // Return a point Y even if it is a virtual point that cannot be drawn
                    toVPointY: function (yp) {
                        return this.toY((this.h / (this.reachMaxY - this.reachMinY)) * (yp - this.reachMinY));
                    },

                    // Returns a set of two real points in pixel coordinates within the graph. Line pieces that 
                    // go over the limit(s) are intersected by the limit(s) and the intersection point(s)  
                    // are returned in the set. The third value returned is a boolean indicating substitution.
                    // Retuns false if a linepiece between the two points is outside the current reach
                    // Given points must be different and contain values
                    toRPoints: function (xp1, yp1, xp2, yp2) {

                        // Overloaded by a stackframe of two Points?
                        if (arguments[0] instanceof R.Point && arguments[1] instanceof R.Point) {
                            var _p1 = arguments[0],
                                _p2 = arguments[1],

                                xp1 = _p1.x,
                                yp1 = _p1.y,
                                xp2 = _p2.x,
                                yp2 = _p2.y
                        }

                        // Intersect with reach
                        var l = new R.Line(new R.Point(xp1, yp1), new R.Point(xp2, yp2)),

                            minX = new R.Line(
                                new R.Point(this.reachMinX, this.reachMinY),
                                new R.Point(this.reachMinX, this.reachMaxY)
                            ),

                            maxX = new R.Line(
                                new R.Point(this.reachMaxX, this.reachMinY),
                                new R.Point(this.reachMaxX, this.reachMaxY)
                            ),

                            minY = new R.Line(
                                new R.Point(this.reachMinX, this.reachMinY),
                                new R.Point(this.reachMaxX, this.reachMinY)
                            ),

                            maxY = new R.Line(
                                new R.Point(this.reachMinX, this.reachMaxY),
                                new R.Point(this.reachMaxX, this.reachMaxY)
                            )


                        // Both within reach?
                        if (xp1 >= this.reachMinX && xp1 <= this.reachMaxX &&
                            xp2 >= this.reachMinX && xp2 <= this.reachMaxX &&
                            yp1 >= this.reachMinY && yp1 <= this.reachMaxY &&
                            yp2 >= this.reachMinY && yp2 <= this.reachMaxY) {


                            return [
                                new R.Point(this.toPointX(xp1), this.toPointY(yp1)),
                                new R.Point(this.toPointX(xp2), this.toPointY(yp2)),
                                false
                            ]
                        }
                        else {
                            // One or two of these points must be on a reach line piece
                            var p1 = l.intersectionPoint(minX, true),

                                p2 = l.intersectionPoint(maxX, true),

                                p3 = l.intersectionPoint(minY, true),

                                p4 = l.intersectionPoint(maxY, true)
                        }

                        // Two intersection points?
                        if ((xp1 >= this.reachMaxX || xp1 <= this.reachMinX ||
                            yp1 >= this.reachMaxY || yp1 <= this.reachMinY) &&
                            (xp2 >= this.reachMaxX || xp2 <= this.reachMinX ||
                            yp2 >= this.reachMaxY || yp2 <= this.reachMinY)) {

                            var pA = null,
                                pB = null

                            // Choose intersection points
                            if (p1 && p1.x == this.reachMinX &&
                                p1.y >= this.reachMinY &&
                                p1.y <= this.reachMaxY)

                                pA = p1

                            if (p2 && p2.x == this.reachMaxX &&
                                p2.y >= this.reachMinY &&
                                p2.y <= this.reachMaxY) {

                                if (pA && !pA.equals(p2))
                                    pB = p2
                                else
                                    pA = p2
                            }

                            if (p3 && p3.y == this.reachMinY &&
                                p3.x >= this.reachMinX &&
                                p3.x <= this.reachMaxX) {

                                if (pA && !pA.equals(p3))
                                    pB = p3
                                else
                                    pA = p3
                            }

                            if (p4 && p4.y == this.reachMaxY &&
                                p4.x >= this.reachMinX &&
                                p4.x <= this.reachMaxX) {

                                if (pA && !pA.equals(p4))
                                    pB = p4
                                else
                                    pA = p4
                            }
                            if (pA && pB) {
                                // Order ?
                                // ...
                                if (yp1 > yp2 && pA.y < pB.y) {
                                    var q = pA
                                    pA = pB
                                    pB = q
                                }
                                if (xp1 > xp2 && pA.x < pB.x) {
                                    var q = pA
                                    pA = pB
                                    pB = q
                                }

                            }

                            var p1 = null,
                                p2 = null,
                                p3 = null

                            if (pA)
                                p1 = new R.Point(this.toPointX(pA.x), this.toPointY(pA.y))

                            if (pB)
                                p2 = new R.Point(this.toPointX(pB.x), this.toPointY(pB.y))

                            p3 = new R.Point(this.toPointX(xp2), this.toPointY(yp2))


                            if (p1 && p2 && p1.isValid() && p2.isValid()) {
                                return [
                                    p1,
                                    p2,
                                    true,
                                    pA,
                                    pB
                                ]
                            }
                            else if (p1 && p3 && p1.isValid() && p3.isValid())
                                return [
                                    p1,
                                    p3,
                                    true,
                                    pA
                                ]
                            else if (p1 && p1.isValid())
                                return [
                                    p1,
                                    p1,
                                    true
                                ]
                            else if (p2 && p2.isValid())
                                return [
                                    p2,
                                    p2,
                                    true
                                ]
                            else return false

                        }

                            // First point out of reach?
                        else if (xp1 < this.reachMinX || xp1 > this.reachMaxX ||
                                yp1 < this.reachMinY || yp1 > this.reachMaxY
                            ) {

                            var pA = null

                            // Choose intersection points
                            if (p1.x == this.reachMinX &&
                                p1.y >= this.reachMinY &&
                                p1.y <= this.reachMaxY)

                                pA = p1

                            else if (p2.x == this.reachMaxX &&
                                p2.y >= this.reachMinY &&
                                p2.y <= this.reachMaxY)

                                pA = p2

                            else if (p3 && p3.y == this.reachMinY &&
                                p3.x >= this.reachMinX &&
                                p3.x <= this.reachMaxX)

                                pA = p3

                            else if (p4 && p4.y == this.reachMaxY &&
                                p4.x >= this.reachMinX &&
                                p4.x <= this.reachMaxX)

                                pA = p4

                            var p1 = null,
                            p2 = null

                            if (pA)
                                p1 = new R.Point(this.toPointX(pA.x), this.toPointY(pA.y))

                            p2 = new R.Point(this.toPointX(xp2), this.toPointY(yp2))

                            if (p1 && p2 && p1.isValid() && p2.isValid())
                                return [
                                    p1,
                                    p2,
                                    true,
                                    pA,
                                    xp1,
                                    yp1,
                                    xp2,
                                    yp2
                                ]
                            else if (p2 && p2.isValid()) {
                                return [
                                    p2,
                                    p2,
                                    true
                                ]
                            }

                            else
                                return false
                        }

                            // Second point out of reach
                        else if (xp2 < this.reachMinX || xp2 > this.reachMaxX ||
                                yp2 < this.reachMinY || yp2 > this.reachMaxY
                            ) {
                            var pA = null

                            // Choose intersection points
                            if (p1.x == this.reachMinX &&
                                p1.y >= this.reachMinY &&
                                p1.y <= this.reachMaxY)

                                pA = p1

                            else if (p2.x == this.reachMaxX &&
                                p2.y >= this.reachMinY &&
                                p2.y <= this.reachMaxY)

                                pA = p2

                            else if (p3 && p3.y == this.reachMinY &&
                                p3.x >= this.reachMinX &&
                                p3.x <= this.reachMaxX)

                                pA = p3

                            else if (p4 && p4.y == this.reachMaxY &&
                                p4.x >= this.reachMinX &&
                                p4.x <= this.reachMaxX)

                                pA = p4

                            var p1 = null,
                            p2 = null


                            if (pA)
                                p1 = new R.Point(this.toPointX(pA.x), this.toPointY(pA.y))

                            p2 = new R.Point(this.toPointX(xp1), this.toPointY(yp1))


                            if (p1 && p2 && p1.isValid() && p2.isValid())
                                return [
                                    p2,
                                    p1,
                                    true,
                                    pA
                                ]
                            else if (p2 && p2.isValid()) {
                                return [
                                    p2,
                                    p2,
                                    true
                                ]
                            }

                            return false
                        }

                        return [
                                new R.Point(this.toPointX(xp1), this.toPointY(yp1)),
                                new R.Point(this.toPointX(xp2), this.toPointY(yp2)),
                                false
                        ]

                    },

                    valueToNearestStepX: function (valueX, steps) {
                        var step = (this.reachMaxX - this.reachMinX) / steps;
                        return Math.ceil(valueX / step) * step;
                    },

                    valueToNearestStepY: function (valueY, steps) {
                        var step = (this.reachMaxY - this.reachMinY) / steps;
                        return Math.ceil(valueY / step) * step;
                    },

                    toValueX: function (x) {
                        return parseFloat((
                            (x - this.config.paddingLeft) / this.w *
                            (this.reachMaxX - this.reachMinX)) + this.reachMinX);
                    },

                    toValueY: function (y) {
                        return parseFloat((
                            (this.h - (y - this.config.paddingTop)) / this.h *
                            (this.reachMaxY - this.reachMinY)) + this.reachMinY);
                    },

                    toValueXSteps: function (x, steps) {
                        return this.valueToNearestStepX(
                                this.toValueX(x),
                                steps);
                    },

                    toValueYSteps: function (y, steps) {
                        return this.valueToNearestStepY(
                            this.toValueY(y),
                            steps);
                    },

                    setOrigin: function (point) {
                        if (point.x >= (this.reachMinX + (this.reachMaxX - this.reachMinX) / 2))
                            this.marksLeft = false;
                        else
                            this.marksLeft = true;

                        if (point.y > (this.reachMinY + (this.reachMaxY - this.reachMinY) / 2))
                            this.marksBottom = false;
                        else
                            this.marksBottom = true;

                        if (point instanceof R.Point)
                            this.origin = point;
                    },

                    getOriginPointX: function () {
                        return this.toPointX(this.origin.x);
                    },

                    getOriginPointY: function () {
                        return this.toPointY(this.origin.y);
                    },

                    deviceXToCanvasX: function (id, x) {
                        var rect = document.querySelector("#" + id).getBoundingClientRect();
                        return x - rect.left;
                    },

                    deviceYToCanvasY: function (id, y) {
                        var rect = document.querySelector("#" + id).getBoundingClientRect();
                        return y - rect.top;
                    },

                    canvasXToDeviceX: function (id, x) {
                        return document.querySelector('#' + id).getBoundingClientRect().left + x;
                    },

                    canvasYToDeviceY: function (id, y) {
                        return y + document.querySelector('#' + id).getBoundingClientRect().top;
                    },

                    toPrecisionX: function (n, isSeconds) {

                        if (isSeconds) { 
                            return this.toTimeFormat(n)
                        }
                        
                        if (this.config.flipSignX == 1) { 
                            if(n < 0) n *= -1
                        }
                        else if (this.config.flipSignX == 2) { 
                            if(n > 0) n *= -1
                        }


                        if (this.config.precisionX > 0)
                            return Number(n).toPrecision(this.config.precisionX).toLocaleString();
                        else if (this.config.precision > 0)
                            return Number(n).toPrecision(this.config.precision).toLocaleString();
                        return Number(n).toLocaleString()
                    },

                    toTimeFormat: function(n){
                        var decimalH = '',
                            decimalM = '',
                            decimalS = 0;

                        n = Number(n)

                        decimalH = parseInt(n / (60 * 60))
                        decimalM = parseInt((n - decimalH * 60 * 60) / 60)
                        decimalS = parseInt((n - decimalH * 60 * 60) - decimalM * 60)
                        
                        if(decimalM < 10)
                            decimalM = '0' + decimalM

                        if(decimalS < 10)
                            decimalS = '0' + decimalS

                        if(decimalH)
                            return decimalH + ':' + decimalM + ':' + decimalS
                        else
                            return  decimalM + ':' + decimalS
                    },

                    toPrecisionY: function (n, isSeconds) {
                        
                        if (isSeconds) { 
                            return this.toTimeFormat(n)
                        }

                        if (this.config.precisionY > 0)
                            return Number(n).toPrecision(this.config.precisionY).toLocaleString();
                        if (this.config.precision > 0)
                            return Number(n).toPrecision(this.config.precision).toLocaleString();
                        return Number(n).toLocaleString()
                    },

                    // Draw a cross with center cx, cy to indicate column is not visible
                    drawCrossOutOfReach: function(cx, cy, size, attr){
                        
                        var x1 = cx - size / 2,
                            x2 = cx + size / 2,
                            x3 = cx + size / 2,
                            x4 = cx - size / 2,
                            y1 = cy + size / 2,
                            y2 = cy - size / 2,
                            y4 = cy - size / 2,
                            y3 = cy + size / 2;

                            this.paper.path(
                                "M " + x1 + " " + y1 + 
                                "L " + x2 + " " + y2
                            )
                            .attr(attr)

                            this.paper.path(
                                "M " + x3 + " " + y3 + 
                                "L " + x4 + " " + y4
                            )
                            .attr(attr)

                    },                    

                    drawDashedLineToXYAxis: function (point) {

                        var attr = {
                            "stroke-dasharray": '5',
                            "stroke": C.color_overhead_origin,
                            'class': 'originDashedLine'
                        };

                        if (point.x == this.reachMinX && point.y == this.reachMinY)
                            return

                        var l = this.line(
                                point,
                                new R.Point(this.origin.x, point.y)
                            )
                        if (l)
                            l.attr(attr);

                        var l = this.line(
                            point,
                            new R.Point(point.x, this.origin.y)
                        )
                        if (l)
                            l.attr(attr);
                    }
                }
            }
        }
    })
