define([
    'external/hammer.min', 'rubensjs/types',
    'util/util'
], function (Hammer, R, util) {

    return {

        SwipeableX: function () {

            return {
                hasSwipeHandler: false,

                animateSwipeX: false,

                checkSwipeXWithinGraph: true,

                addReachDeltaX: function (startX) {
                    if (!isNaN(startX)) {

                        // ...
                        if (this.D.reachMinX + startX >= this.minCursor.x
                            && this.D.reachMaxX + startX <= this.maxCursor.x) { 

                            this.D.reachMinX += startX;
                            this.D.reachMaxX += startX;                        
                        }
                    }
                },

                // Animate: https://crbug.com/574343#c40
                // and https://developers.google.com/web/tools/chrome-devtools/profile/evaluate-performance/rail
                initSwipeableX: function (minCursor, maxCursor, animate, end) {

                    if (this.hasSwipeHandler === false) {

                        this.animateSwipeX = animate;

                        this.minCursor = minCursor;
                        this.maxCursor = maxCursor;

                        if(end)
                            this.cursor = new R.Point(maxCursor.x - this.stepsX, 0)
                            
                        else
                            this.cursor = new R.Point(minCursor.x, 0)

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
                                if (/*x &&*/ y || !this.checkSwipeXWithinGraph) {
                                    if (event.direction == Hammer.DIRECTION_RIGHT) {
                                        this.updateSwipeableXGraph(-1);
                                    }
                                    else if (event.direction == Hammer.DIRECTION_LEFT) {
                                        this.updateSwipeableXGraph(1);
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

                            var startX = 0,
                                newO = null,
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
                            var anim = this.animateSwipeX;
                            if (true /*event.shiftKey && x && y*/) {
                                if (event.deltaY < 0) {
                                    this.updateSwipeableXStep(-1 * this.opts.groupBy);
                                }
                                else if (event.deltaY > 0) {
                                    this.updateSwipeableXStep(1 * this.opts.groupBy);
                                }
                            }

                            // Restore config
                            this.animateSwipeX = anim;

                            event.stopPropagation()
                            event.preventDefault()
                        });

                        this.hasSwipeHandler = true;
                    }
                },

                updateSwipeableXStep: function (dir) {

                    var o = null                  
                                       
                    o = new R.Point( this.cursor.x + dir, this.cursor.y);

                    if ((o.x <= this.maxCursor.x) && (o.x >= this.minCursor.x)) {
                        this.invalidate()
                        .then( (result) => { 
                            if (result == 'ok') { 
                       
                                // Adjust reach
                                this.addReachDeltaX(dir);
                                
                                // Advance
                                this.cursor.x += dir

                                // Update axis
                                this.setOrigin();

                                // Create group after invalidate()
                                this.D.openGroup('svgLayer')

                                this.drawData()
                                .then((result) => { 

                                    if (result == 'ok') { 

                                        // Bring to the fore
                                        if (this.bringToTheFore) {
                                            this.bringToTheFore.forEach((id) => {
                                                this.D.paper.use(id);
                                            })
                                        }

                                        this.D.closeGroup()                                      
                                    }
                                    else
                                        this.D.closeGroup()
                                })
                           
                            }
                        })


                    }
                },

                updateSwipeableXGraph: function (dir) {

                    var stepsX = this.opts.unstack > 0? parseInt(this.stepsX / 2) : this.stepsX,
                        deltaX = dir * parseInt(stepsX / this.opts.groupBy) * this.opts.groupBy;
                    
                    this.animateSwipeXStepsTaken = 0;
                        
                    this.updateSwipeableXGraphSteps(dir, deltaX);
                },

                animateSwipeXStepsTaken: 0,

                updateSwipeableXGraphSteps: function (dir, deltaX) {

                    if (this.animateSwipeX == true && this.stepsX < 25) {
                        setTimeout(() => {
                            util.eventHandler(() => {
                                this.updateSwipeableXStep(dir);
                                if (++this.animateSwipeXStepsTaken < Math.abs(deltaX))
                                    this.updateSwipeableXGraphSteps(dir, deltaX);
                            })
                        }, 15);
                    }
                    else {
                        this.updateSwipeableXStep(deltaX);
                    }
                }
            }
        }
    }
})