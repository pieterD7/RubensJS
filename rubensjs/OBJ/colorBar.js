define([
    "rubensjs/rubens",
    "util/util"],
    function (Rubens, util) {
        return {

            Colorbar: function (id) {
                return util.extend(
                    [], {

                        papers: [],

                        initColors: function(colors, withPatterns){
                        
                            if(colors.length > 0){
                                                                    
                                colors.forEach((clr, n) => {

                                    var canvas = document.querySelector("#clr" + n)

                                    if (canvas) { 
                                        var r = new Rubens('clr' + n, true, false, null, '#fff'),                                        
                                            rect = canvas.getBoundingClientRect(),
                                            mask = clr.mask? clr.mask.replace('#' +'chart1', '#clr' + n) : '';
                                                                      
                                        if(!withPatterns){
                                            mask = ''
                                        }
                                        
                                        r.rect(0, 0, rect.width, rect.height)
                                        .attr({
                                            
                                            fill: clr.color,

                                            // ...
                                            //stroke: clr.color,
                                            
                                            mask: mask 
                                        })                                    
                                    }                                    

                                })
                            }
                        
                        }

                    }
                )
            }
        }
    }
)