define([
    "rubensjs/rubens",
    "rubensjs/_2d",
    "rubensjs/interface",
    "rubensjs/types",
    "rubensjs/colors",
    "util/util"],
    function(Rubens, _2d, I, R, C, util)
    {
        return {
            Range: R.Range,

            Point: R.Point,

            data: null,

            RssiIndicator: function(id){

               return util.extend(
                    [   new I.I()], {

                         D: new _2d.D(),

                         id: id,

                         opts: {
                            mode: 0,    // Circles == 1, otherwise rectangles
                            dir: -1     // Upside down == -1
                         },

                         svgClass: 'columnChart',

                         invalidate: function(){

                             var a = document.querySelectorAll('#' + id + ' .' + this.svgClass);
                             a.forEach(function(e){
                                e.remove();
                             });
                         },

                         init: function(config){
                             // Save config
                             this.config = config;

                             this.opts = this.config.opts

                             // Set config, width and height
                             this.D.init(this.id, config);

                             // This object does not have support for
                             // counters and default marks on x-axis
                             this.drawMarkersAndlabelsX = false;

                             // Make Raphael object
                             this.D.paper = new Rubens(this.id, false, true, 12, '#fff');
                         },


                        // Draw max 24 rectangles in three columns:
                        // 4 8 12
                        // 2x2 4x2 6x2
                         drawData: function(promise){

                            this.data = Math.max(0, Math.min(this.data, 120))

                            this.data = (this.data / 120 * 24) % 25

                            for(var c = 1; c < this.data + 1; c++){
                                if(c < 5){
                                    this.drawSquare(0, c)
                                }
                                else if(c < 13){
                                    this.drawSquare(0, 4)
                                    this.drawSquare(1, c -  4)
                                }
                                else if(c < 25){
                                    this.drawSquare(0, 4)
                                    this.drawSquare(1, 8)
                                    this.drawSquare(2, c - 12)
                                }
                            }

                         },
                         drawSquare: function(xcol, ycol){
                             var left, top, width, height, dir

                             dir = this.opts.dir

                             width = (this.D.toPointX(this.D.reachMaxX) / 3) / 2

                             height = (this.D.toPointY(this.D.reachMaxY) - this.D.toPointY(this.D.reachMinY)) / 6

                             left = 0

                             if(xcol == 1)
                                 left = this.D.toPointX(this.D.reachMaxX / 3)

                             else if(xcol == 2)
                                 left  = this.D.toPointX((this.D.reachMaxX / 3 )* 2)

                             var y = ycol -1,
                                 tp = y % 2 + 1
                             top = this.D.toPointY((dir == -1? this.D.reachMaxY : this.D.reachMinY))
                             if(dir == -1)
                                 top += height
                             top += dir * tp * height

                             if(xcol == 1 && y % 4 >1)
                                 top += dir * 2 * height
                             if(xcol == 2 && y % 6 >1)
                                 top += dir * 2 * height
                             if(xcol == 2 && y % 6 >3)
                                 top += dir * 2 * height

                             bottom = top - height

                             if(y < (xcol + 1) * 2){
                                 left = this.D.toPointX(this.D.reachMinX + xcol * ((this.D.reachMaxX - this.D.reachMinX) /3));
                             }
                             else if(y < (xcol + 1) * 4){
                                 left = this.D.toPointX(this.D.reachMinX + xcol * ((this.D.reachMaxX - this.D.reachMinX) /3)) + width;
                             }
                             else if(y < (xcol + 1) * 8){
                                 left = this.D.toPointX(this.D.reachMinX + xcol * ((this.D.reachMaxX - this.D.reachMinX) /3)) + 2*width;
                             }
                             else if(y < (xcol + 1) * 12){
                                 left = this.D.toPointX(this.D.reachMinX + xcol * ((this.D.reachMaxX - this.D.reachMinX) /3)) + 3*width;
                             }

                             var q
                             if(this.opts.mode == 1)
                                 q = this.D.paper.circle(left + width / 2, top + width / 2, width/3)
                             else
                                 q = this.D.paper.rect(
                                     left,
                                     top,
                                     width,
                                     bottom - top
                                 )

                                 q.attr({
                                     'class': this.svgClass,
                                     'stroke':'white',
                                     'stroke-width': '2%',
                                     'fill': C.color_indicator_green})
                         },
                    }
               )

            }
        }
    }
)