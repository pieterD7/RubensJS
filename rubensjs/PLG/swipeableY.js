define([
    'external/hammer.min', 'rubensjs/types',
    'util/util'
], function (Hammer, R, util) {

    return {

        SwipeableY: function () {

            return {
                hasSwipeHandler: false,

                animateSwipeY: false,

                checkSwipeYWithinGraph: false,

                addReachDeltaY: function (startY) {
                    if (!isNaN(startY)) {
                        this.D.reachMinY += startY;
                        this.D.reachMaxY += startY;
                    }
                },

                // Animate: https://crbug.com/574343#c40
                // and https://developers.google.com/web/tools/chrome-devtools/profile/evaluate-performance/rail
                initSwipeableY: function (minCursor, maxCursor, animate) {

                    this.animateSwipeY = animate;

                    this.minCursor = minCursor;
                    this.maxCursor = maxCursor;

                    this.cursor = new R.Point(this.D.reachMinY, this.D.reachMinY)

                    if (this.hasSwipeHandler === false) {
                        var el = document.querySelector("#" + this.id),
                            h = new Hammer.Manager(
                                 document.querySelector('#' + this.id),
                                 {
                                     recognizers: [[Hammer.Pan, { direction: Hammer.DIRECTION_ALL }]]
                                 }
                             );

                        //                        h.on("pancancel", function(){console.log("CANCEL")})
                        //                        h.on("panmove", function(){console.log("MOVE")})

                        h.on("panstart", (event) => {
                            //console.log("START")
                            util.eventHandler(() => {

                                if (!event.center.y) return;

                                var x, y;
                                x = this.D.toPointX(
                                       this.D.toValueX(
                                           this.D.deviceXToCanvasX(this.id, event.center.x))
                                , true);
                                y = this.D.toPointY(
                                       this.D.toValueY(
                                           this.D.deviceYToCanvasY(this.id, event.center.y))
                                , true);

                                // Pan ends inside of the graph?
                                if (/*x &&*/ x || !this.checkSwipeYWithinGraph) {
                                    if (event.direction == Hammer.DIRECTION_DOWN) {
                                        this.updateSwipeableYGraph(-1);
                                    }
                                    else if (event.direction == Hammer.DIRECTION_UP) {
                                        this.updateSwipeableYGraph(1);
                                    }
                                    event.srcEvent.stopPropagation();
                                }
                                else if (typeof this.onPanends === 'function') {

                                    this.onPanends(event.direction);
                                    event.srcEvent.stopPropagation();
                                }
                            })
                        });

                        // Desktop use scroll event
                        el.addEventListener('mousewheel', (event) => {

                            var newO = null,
                                x = this.D.toPointX(
                                        this.D.toValueX(
                                            this.D.deviceXToCanvasX(this.id, event.x))
                                ),
                                y = this.D.toPointY(
                                        this.D.toValueY(
                                            this.D.deviceYToCanvasY(this.id, event.y))
                                );

                            // Save config 'cause we cannot use it here
                            // deltaX is always |1| with scrollwheel so animation
                            // is not wanted. Just scroll one column
                            var anim = this.animateSwipeY;
                            if (true /*&& x && y*/) {
                                if (event.deltaY < 0) {
                                    this.updateSwipeableYStep(-1 * this.opts.groupBy);
                                }
                                else if (event.deltaY > 0) {
                                    this.updateSwipeableYStep(1 * this.opts.groupBy);
                                }
                            }

                            // Restore config
                            this.animateSwipeY = anim;

                            event.stopPropagation()
                            event.preventDefault()
                        });

                        this.hasSwipeHandler = true;
                    }
                },

                updateSwipeableYStep: function (dir) {

                    var o = null

                    o = new R.Point(this.cursor.x, this.D.reachMinY + dir);                      

                    if ((o.y <= this.maxCursor.y) && (o.y >= this.minCursor.y)) {
                        this.invalidate()
                        .then( (result) => { 
                            if(result == 'ok'){

                                // Adjust reach
                                this.addReachDeltaY(dir);   
                                
                                this.cursor.y += dir

                                this.setOrigin();

                                this.D.openGroup()

                                this.drawData();

                                // Bring to the fore
                                if (this.bringToTheFore) {
                                    this.bringToTheFore.forEach((id) => {
                                        this.D.paper.use(id);
                                    })
                                }

                                this.D.closeGroup()                            
                            }
                        })
                    }
                },

                updateSwipeableYGraph: function (dir) {

                    var deltaY = dir * parseInt(this.stepsY / this.opts.groupBy) * this.opts.groupBy;

                    this.animateSwipeYStepsTaken = 0;

                    this.updateSwipeableYGraphSteps(dir, deltaY);

                },

                animateSwipeYStepsTaken: 0,

                updateSwipeableYGraphSteps: function (dir, deltaY) {

                    if (this.animateSwipeY == true && this.stepsY < 25) {
                        setTimeout(() => {
                            util.eventHandler(() => {
                                this.updateSwipeableYStep(dir);
                                if (++this.animateSwipeYStepsTaken < Math.abs(deltaY))
                                    this.updateSwipeableYGraphSteps(dir, deltaY);
                            })
                        }, 15);
                    }
                    else {
                        this.updateSwipeableYStep(deltaY);
                    }
                }
            }
        }
    }
})