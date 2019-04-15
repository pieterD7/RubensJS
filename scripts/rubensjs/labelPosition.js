
define([], () => { 

        return {

            LabelPosition: function(){

                    this.labelPos = []

                    /*
                        lastPoint: Point,
                        fontSize: fontSize,
                        mode: 1 == above, 2 == below, 3 == above and below
                    */
                    this.unique = function(lastPoint, fontSize, mode) { 

                        var offs = 0,
                            fnd = false

                        while (!fnd) { 

                            if((mode == 1 || mode == 3)
                                && this._uniqueAbove(lastPoint, offs, fontSize))
                                fnd = 1
                            else if(mode != 1 &&
                                this._uniqueBelow(lastPoint, offs, fontSize))
                                fnd = 2
                            
                            if(!fnd)
                                offs++
                        }
                
                        if (offs > 0 && fnd == 1) 
                            lastPoint.y -= offs
                        else if(offs > 0)
                            lastPoint.y += offs

                        this.labelPos.push(lastPoint)    

                        return lastPoint
                    }

                    this._uniqueBelow = function(lastPoint, offs, fontSize){ 

                        var ret = true

                        this.labelPos.forEach((p) => { 

                            if (lastPoint.y + offs < p.y + fontSize
                                && lastPoint.y + offs >= p.y
                                && lastPoint.x - 5 * fontSize < p.x
                                && lastPoint.x + 5 * fontSize > p.x) {
                                ret = false
                            }
                            else if (lastPoint.y + offs > p.y - fontSize
                                && lastPoint.y + offs <= p.y
                                && lastPoint.x - 5 * fontSize < p.x
                                && lastPoint.x + 5 * fontSize > p.x) {
                                ret = false
                            }
                        })            

                        return ret
                    }  
                
                    this._uniqueAbove = function (lastPoint, offs, fontSize) { 
                        var ret = true

                        this.labelPos.forEach((p) => { 

                            if (lastPoint.y - offs < p.y + fontSize
                                && lastPoint.y - offs >= p.y
                                && lastPoint.x - 5 * fontSize < p.x
                                && lastPoint.x + 5 * fontSize > p.x) {
                                ret = false
                            }
                            else if (lastPoint.y - offs > p.y - fontSize
                                && lastPoint.y - offs <= p.y
                                && lastPoint.x - 5 * fontSize < p.x
                                && lastPoint.x + 5 * fontSize > p.x) {
                                ret = false
                            }

                        })            

                        return ret                    
                    }
            
            },
        }

    }
)