define([], function () {


    const   CONST = {

        ONE_PIE: 1,
        TWO_PIES: 2,
        ARC: 3,

        ADD: 1,         // all data elements are added to first, color per part
        CMP: 2,         // project second data element behind first, color per row 
        SUB: 3,         // substract
        SAME: 4,        // same
        SET: 5,          // same set

    }
    


    // Avoids calculation and comparison errors with floating points with 
    // last positions invalid
    function Float(f) {
        return parseFloat(parseFloat(parseFloat(f).toPrecision(12)).toFixed(12))
    }

    function Point(xp, yp) {

        this.x = Float(xp);
        this.y = Float(yp);

        this.isValid = function () {

            if ((this.x && this.y)
                || (this.x == 0 && this.y)
                || (this.y == 0 && this.x)
                || (this.y == 0 && this.x == 0))
                return true
        }

        // Checks if points are identical and valid
        this.equals = function (p) {
            if (p.isValid() && this.isValid())
                return this.x == p.x && this.y == p.y;
            return false
        }

        // Point within Rect true / false
        this.matches = function (rect) {
            if (this.x < rect.pointBR.x &&
                this.x > rect.pointBL.x &&
                this.y < rect.pointTL.y &&
                this.y > rect.pointBL.y)
                return true;
            return false
        };
    }

    function Circle(x, y, r) {
        this.x = x
        this.y = y
        this.r = r
    }

    // A line in point/slope form
    //
    //  y = M(x - Px) + Py
    //
    // where M is the slope and Px and Py
    // the coordinates of the point
    function Line(pointA, pointB) {

        var toSlope = function (pointA, pointB) {
            return (pointA.y - pointB.y) / (pointA.x - pointB.x);
        }


        this.pointA = pointA;
        this.pointB = pointB;
        this.slope = toSlope(pointA, pointB);
        this.x = pointA.x;
        this.y = pointA.y;

        // A line from point slope to y = ax + c
        // (y - y1) = m(x - x1)
        // mx - mx1 = y - y1
        // y = mx - mx1 + y1
        this.intersectionPoints = function (circle) {
            // A circle
            // (x-p)^2 + (y-q)^2 = r^2

            // Substitute y = mx - mx1 + y1 into (x-p)^2 + (y-q)^2 = r^2
            // (x-p)^2 + (mx - mx1 + y1)^2 = r^2
            // https://math.stackexchange.com/questions/228841/how-do-i-calculate-the-intersections-of-a-straight-line-and-a-circle
        }

        this.intersectionPoint = function (line, linePieces) {

            if (linePieces) {
                if (!((this.pointA.x >= line.x && this.pointB.x <= line.x) ||
                    (this.pointB.x >= line.x && this.pointA.x <= line.x) ||
                    ((this.pointA.y >= line.y && this.pointB.y <= line.y) ||
                    (this.pointB.y >= line.y && this.pointA.y <= line.y))
                    ))
                    return false
            }


            // M1(x - P1x) + P1y = M2 (x - P2x) + P2y
            // M1 * x - M1 * P1x  = M2 * x - M2 * P2x + P2y - P1y
            // M1 * x - M2 *  x = M1 * P1x - M2 * P2x + P2y - P1y
            // (M1 - M2) * x =  M1 * P1x - M2 * P2x + P2y - P1y
            // x =  (M1 * P1x - M2 * P2x + P2y - P1y) / (M1 - M2)
            var x = null,
                y = null
            if (line.slope > -Infinity && line.slope < Infinity &&
                this.slope > -Infinity && this.slope < Infinity) {

                if (((this.pointA.x <= line.x && this.pointB.x >= line.x) ||
                    (this.pointB.x <= line.x && this.pointA.x >= line.x)) ||
                    ((this.pointA.y <= line.y && this.pointB.y >= line.y) ||
                    (this.pointB.y <= line.y && this.pointA.y >= line.y)))

                    x = (this.slope * this.x - line.slope * line.x + line.y - this.y)
                       /
                       (this.slope - line.slope)

                y = this.slope * (x - this.x) + this.y;
            }
            else if ((line.slope == -Infinity || line.slope == Infinity) &&
                (this.slope == -Infinity || this.slope == Infinity)) {

                if (this.x == line.x) {
                    x = this.x
                    y = this.y
                }
            }
            else if (line.slope == -Infinity || line.slope == Infinity) {

                if (this.pointA.x <= line.x && this.pointB.x >= line.x)
                    x = line.x
                else if (this.pointB.x <= line.x && this.pointA.x >= line.x)
                    x = line.x

                if (x)
                    y = this.slope * (x - this.x) + this.y;
            }
            else if (this.slope == -Infinity || this.slope == Infinity) {

                if (this.pointA.y <= line.y && this.pointB.y >= line.y)
                    x = this.x
                else if (this.pointB.y <= line.y && this.pointA.y >= line.y)
                    x = this.x

                if (x)
                    y = line.slope * (x - line.x) + line.y
            }

            if (linePieces) {
                if (!((this.pointA.x >= x && this.pointB.x <= x) ||
                   (this.pointB.x >= x && this.pointA.x <= x) &&
                   ((this.pointA.y >= y && this.pointB.y <= y) ||
                   (this.pointB.y >= y && this.pointA.y <= y))
                   ))
                    return false
            }

            return new Point(x, y)
        }

        this.intersects = function (rect) {
            if (this.slope * (rect.pointBL.x - this.x) + this.y > rect.pointBL.y &&
                this.slope * (rect.pointBR.x - this.x) + this.y < rect.pointTR.y &&
                rect.pointBL.x < Math.max(this.pointA.x, this.pointB.x) &&
                rect.pointBL.x > Math.min(this.pointA.x, this.pointB.x))
                return true;
            return false;
        }
    }

    function Rect(pointBL, pointTR) {

        this.pointBL = pointBL;
        this.pointTR = pointTR;

        this.pointBR = new Point(pointTR.x, pointBL.y);
        this.pointTL = new Point(pointBL.x, pointTR.y);
    }

    function Polygon(pointArr) {

        this.points = pointArr

        this.pointInside = function (point) {

            var vs = this.points

            // http://bl.ocks.org/bycoffe/5575904
            // ray-casting algorithm based on
            // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
            var xi, xj, i, intersect,
                x = point.x,
                y = point.y,
                inside = false;
            for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                xi = vs[i].x,
                yi = vs[i].y,
                xj = vs[j].x,
                yj = vs[j].y,
                intersect = ((yi > y) != (yj > y))
                    && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }
            return inside;
        }
    }

    return {

        CONST: CONST,

        Float: Float,

        Point: Point,

        Line: Line,

        Rect: Rect,

        Polygon: Polygon,

        Range: function (minX, maxX, minY, maxY) {
            this.minX = minX
            this.maxX = maxX
            this.minY = minY
            this.maxY = maxY
        },

        // Module config
        Config: function () {
            return {
                canvas: null,      // ID attribute of the container Width and height
                // will be taken from here
                // Sizes are in pixels (eg may look big when using meta 
                // tag with viewport width)
                marksYLength: 8,   // Length marks on y-axis measuring rod
                markersYBetween: 1,// Multiplier to draw markers in between labels y-axis 
                // (2 = halfway)
                marksXLength: 8,   // Length marks on x-axis measuring rod
                markersXBetween: 1,// Multiplier to draw markers in between labels x-axis 
                // (1 = none)
                paddingLeft: 20,   // Space for labels
                paddingRight: 20,
                paddingTop: 10,
                paddingBottom: 10,
                labelsY: 0,          // For use with column charts
                halfFontXHeight: 8,  // Space between font and marker
                precision: 0,        // Round to precision 0 means no change
                flipSignX: 0,        // In marker texts: 0 == no change, 1 == flip sign if negative, 2 == flip sign if positive
            }
        }
    }
})