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

            MeasurementStatus: function(id){

               return util.extend(
                    [   new I.I()], {

                         D: new _2d.D(),

                         id: id,

                         opts: {
                            displayText:  true
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

                             this.opts = util.extend(this.opts, this.config.opts)

                             // Set config, width and height
                             this.D.init(this.id, config);

                             // This object does not have support for
                             // counters and default marks on x-axis
                             this.drawMarkersAndlabelsX = false;

                             // Make Raphael object
                             this.D.paper = new Rubens(this.id, false, true, 12, '#fff');


                             this.setRange(0, 1, 0, 1)
                         },

                         // Bloodpressure characteristic measurement status bits:
                         // 0   1   2   3   4   5
                         // 0 = No body movement
                         // 1 = Cuff fits properly
                         // 2 = No irregular pulse detected
                         // 3 - 4 = Pulse rate is within the range (not indicated)
                         // 5 = Proper measurement position

                         // Display the bits of 2 bytes, unset is green,
                         // set is yellow and the irhb-bit is red when set
                         // and all others are green, otherwise yellow when
                         // set and green when unset

                         // Order all squares from left to right in a fixed order
                         // Indicate labels with lines underneath starting from bottom
                         // # # # #
                         // | | | |
                         // | | | -> irhb
                         // | | -> proper measurement position
                         // | -> cuff fits properly
                         // -> no body movement
                         drawData: function(promise){

                            if(this.data === false) return

                            var n = 0;
                            for(var b in this.measurementBits){

                                if(this.data & Math.pow(2, this.measurementBits[b].bit))

                                    this.displayBlockN(
                                        n++,
                                        this.measurementBits[b].msg2,
                                        this.data == Math.pow(2, 2) ?
                                            C.color_indicator_red :
                                            C.color_indicator_yellow
                                    )
                                else

                                    this.displayBlockN(
                                        n++,
                                        this.measurementBits[b].msg1,
                                        C.color_indicator_green
                                    )

                            }

                         },

                         measurementBits:[
                            { bit: 0, msg1: 'no body movement', msg2: 'body movement during measurement'},
                            { bit: 5, msg1: 'proper measurement position', msg2:'improper measurement position'},
                            { bit: 1, msg1: 'cuff fits properly', msg2:'cuff too loose'},
                            { bit: 2, msg1: 'no irregular pulse detected', msg2: 'irregular pulse detected'}
                         ],

                         displayBlockN: function(n, text, color){
                             var left = this.D.toPointX(1/10 * n),
                                 top = 0,
                                 width = (this.D.toPointX(this.D.reachMaxX) - this.D.toPointX(this.D.reachMinX)) / 10,
                                 height = width,
                                 fontSize = 12;

                              if(! this.opts.displayText){
                                top += 2
                                width = width * 10 / 6
                                height = width
                                left = this.D.toPointX(1/4 * n)
                              }

                             this.D.paper.rect(
                                 left, top, width, height
                             )
                             .attr({
                                 'class': this.svgClass,
                                 fill: color,
                                 'stroke-width' : '3%',
                                 stroke : 'white'
                             })

                             if( ! this.opts.displayText) return

                             var availHeight = this.D.toPointY(0) - height;

                             this.D.paper.path(
                                 "M" + (this.D.toPointX((n+1)/10) - width /2) + " " + (this.D.toPointY(1) + height + 5) + " " +
                                 "L" + (this.D.toPointX((n+1)/10) - width /2) + " " + (height + 10 + (availHeight / 5) * (3-n+0.5))  + " " +
                                 "L" + (this.D.toPointX((n+1)/10) - width / 2 + 20) + " " + (height + 10 + (availHeight / 5) * (3-n+0.5)))

                             .attr({
                                'class': this.svgClass,
                                 stroke:color,
                                'stroke-width' : '0.15%'
                             })


                             this.D.paper.text(
                             (this.D.toPointX((n+1)/10) - width / 2 + 30), height + fontSize/2 + (availHeight / 5) * (3-n+0.5), text
                             )
                             .attr({
                                'class': this.svgClass,
                                'alignment-baseline': 'middle'
                             })
                         }
                    }
               )

            }
        }
    }
)