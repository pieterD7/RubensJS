define(['util/util'], function (util) {

    return {
        'color_indicator_green': '#15AA33',
        'color_indicator_yellow': '#fbd800',
        'color_indicator_red': '#ff0000',
        'color_balloon_fill': '#f7f7f7',
        'color_balloon_stroke': '#b3b3b3',
        'color_balloon_text': '#b3b3b3',
        'color_overhead_axis': '#b3b3b3',
        'color_overhead_origin': '#b3b3b3',
        'color_overhead_labels': '#b3b3b3',
        'color_overhead_marks': '#b3b3b3',
        'color_pull_line_pin_lock': '#ff0000',
        'color_pull_line_pin_locked': '#404040',
        'color_pull_line_line': '#404040',
        'color_pull_line_text': '#b3b3b3',
        'color_measure_value': '#FFC900',
        'color_items': [

 /*           {color: '#000000', dark: false},
            {color: '#000000', pattern:'url(#pat1)', dark: false},
            {color: '#000000', dark: false},
*/

            // Grey
            { color: '#404040' },
            { color: '#606060' },
            { color: '#808080' },
            { color: '#a0a0a0' },
            { color: '#c0c0c0' },
            { color: '#e0e0e0' },

        ],
        'text_color_dark': '#505050',
        'text_color_light': '#f3f3f3',


        // From https://www.w3.org/TR/css-color-3/#svg-color
        colorNames: [
            {"clr":"aliceblue","code":"#F0F8FF"},
            {"clr":"antiquewhite","code":"#FAEBD7"},
            {"clr":"aqua","code":"#00FFFF"},
            {"clr":"aquamarine","code":"#7FFFD4"},
            {"clr":"azure","code":"#F0FFFF"},
            {"clr":"beige","code":"#F5F5DC"},
            {"clr":"bisque","code":"#FFE4C4"},
            {"clr":"black","code":"#000000"},
            {"clr":"blanchedalmond","code":"#FFEBCD"},
            {"clr":"blue","code":"#0000FF"},
            {"clr":"blueviolet","code":"#8A2BE2"},
            {"clr":"brown","code":"#A52A2A"},
            {"clr":"burlywood","code":"#DEB887"},
            {"clr":"cadetblue","code":"#5F9EA0"},
            {"clr":"chartreuse","code":"#7FFF00"},
            {"clr":"chocolate","code":"#D2691E"},
            {"clr":"coral","code":"#FF7F50"},
            {"clr":"cornflowerblue","code":"#6495ED"},
            {"clr":"cornsilk","code":"#FFF8DC"},
            {"clr":"crimson","code":"#DC143C"},
            {"clr":"cyan","code":"#00FFFF"},
            {"clr":"darkblue","code":"#00008B"},
            {"clr":"darkcyan","code":"#008B8B"},
            {"clr":"darkgoldenrod","code":"#B8860B"},
            {"clr":"darkgray","code":"#A9A9A9"},
            {"clr":"darkgreen","code":"#006400"},
            {"clr":"darkgrey","code":"#A9A9A9"},
            {"clr":"darkkhaki","code":"#BDB76B"},
            {"clr":"darkmagenta","code":"#8B008B"},
            {"clr":"darkolivegreen","code":"#556B2F"},
            {"clr":"darkorange","code":"#FF8C00"},
            {"clr":"darkorchid","code":"#9932CC"},
            {"clr":"darkred","code":"#8B0000"},
            {"clr":"darksalmon","code":"#E9967A"},
            {"clr":"darkseagreen","code":"#8FBC8F"},
            {"clr":"darkslateblue","code":"#483D8B"},
            {"clr":"darkslategray","code":"#2F4F4F"},
            {"clr":"darkslategrey","code":"#2F4F4F"},
            {"clr":"darkturquoise","code":"#00CED1"},
            {"clr":"darkviolet","code":"#9400D3"},
            {"clr":"deeppink","code":"#FF1493"},
            {"clr":"deepskyblue","code":"#00BFFF"},
            {"clr":"dimgray","code":"#696969"},
            {"clr":"dimgrey","code":"#696969"},
            {"clr":"dodgerblue","code":"#1E90FF"},
            {"clr":"firebrick","code":"#B22222"},
            {"clr":"floralwhite","code":"#FFFAF0"},
            {"clr":"forestgreen","code":"#228B22"},
            {"clr":"fuchsia","code":"#FF00FF"},
            {"clr":"gainsboro","code":"#DCDCDC"},
            {"clr":"ghostwhite","code":"#F8F8FF"},
            {"clr":"gold","code":"#FFD700"},
            {"clr":"goldenrod","code":"#DAA520"},
            {"clr":"gray","code":"#808080"},
            {"clr":"green","code":"#008000"},
            {"clr":"greenyellow","code":"#ADFF2F"},
            {"clr":"grey","code":"#808080"},
            {"clr":"honeydew","code":"#F0FFF0"},
            {"clr":"hotpink","code":"#FF69B4"},
            {"clr":"indianred","code":"#CD5C5C"},
            {"clr":"indigo","code":"#4B0082"},
            {"clr":"ivory","code":"#FFFFF0"},
            {"clr":"khaki","code":"#F0E68C"},
            {"clr":"lavender","code":"#E6E6FA"},
            {"clr":"lavenderblush","code":"#FFF0F5"},
            {"clr":"lawngreen","code":"#7CFC00"},
            {"clr":"lemonchiffon","code":"#FFFACD"},
            {"clr":"lightblue","code":"#ADD8E6"},
            {"clr":"lightcoral","code":"#F08080"},
            {"clr":"lightcyan","code":"#E0FFFF"},
            {"clr":"lightgoldenrodyellow","code":"#FAFAD2"},
            {"clr":"lightgray","code":"#D3D3D3"},
            {"clr":"lightgreen","code":"#90EE90"},
            {"clr":"lightgrey","code":"#D3D3D3"},
            {"clr":"lightpink","code":"#FFB6C1"},
            {"clr":"lightsalmon","code":"#FFA07A"},
            {"clr":"lightseagreen","code":"#20B2AA"},
            {"clr":"lightskyblue","code":"#87CEFA"},
            {"clr":"lightslategray","code":"#778899"},
            {"clr":"lightslategrey","code":"#778899"},
            {"clr":"lightsteelblue","code":"#B0C4DE"},
            {"clr":"lightyellow","code":"#FFFFE0"},
            {"clr":"lime","code":"#00FF00"},
            {"clr":"limegreen","code":"#32CD32"},
            {"clr":"linen","code":"#FAF0E6"},
            {"clr":"magenta","code":"#FF00FF"},
            {"clr":"maroon","code":"#800000"},
            {"clr":"mediumaquamarine","code":"#66CDAA"},
            {"clr":"mediumblue","code":"#0000CD"},
            {"clr":"mediumorchid","code":"#BA55D3"},
            {"clr":"mediumpurple","code":"#9370DB"},
            {"clr":"mediumseagreen","code":"#3CB371"},
            {"clr":"mediumslateblue","code":"#7B68EE"},
            {"clr":"mediumspringgreen","code":"#00FA9A"},
            {"clr":"mediumturquoise","code":"#48D1CC"},
            {"clr":"mediumvioletred","code":"#C71585"},
            {"clr":"midnightblue","code":"#191970"},
            {"clr":"mintcream","code":"#F5FFFA"},
            {"clr":"mistyrose","code":"#FFE4E1"},
            {"clr":"moccasin","code":"#FFE4B5"},
            {"clr":"navajowhite","code":"#FFDEAD"},
            {"clr":"navy","code":"#000080"},
            {"clr":"oldlace","code":"#FDF5E6"},
            {"clr":"olive","code":"#808000"},
            {"clr":"olivedrab","code":"#6B8E23"},
            {"clr":"orange","code":"#FFA500"},
            {"clr":"orangered","code":"#FF4500"},
            {"clr":"orchid","code":"#DA70D6"},
            {"clr":"palegoldenrod","code":"#EEE8AA"},
            {"clr":"palegreen","code":"#98FB98"},
            {"clr":"paleturquoise","code":"#AFEEEE"},
            {"clr":"palevioletred","code":"#DB7093"},
            {"clr":"papayawhip","code":"#FFEFD5"},
            {"clr":"peachpuff","code":"#FFDAB9"},
            {"clr":"peru","code":"#CD853F"},
            {"clr":"pink","code":"#FFC0CB"},
            {"clr":"plum","code":"#DDA0DD"},
            {"clr":"powderblue","code":"#B0E0E6"},
            {"clr":"purple","code":"#800080"},
            {"clr":"red","code":"#FF0000"},
            {"clr":"rosybrown","code":"#BC8F8F"},
            {"clr":"royalblue","code":"#4169E1"},
            {"clr":"saddlebrown","code":"#8B4513"},
            {"clr":"salmon","code":"#FA8072"},
            {"clr":"sandybrown","code":"#F4A460"},
            {"clr":"seagreen","code":"#2E8B57"},
            {"clr":"seashell","code":"#FFF5EE"},
            {"clr":"sienna","code":"#A0522D"},
            {"clr":"silver","code":"#C0C0C0"},
            {"clr":"skyblue","code":"#87CEEB"},
            {"clr":"slateblue","code":"#6A5ACD"},
            {"clr":"slategray","code":"#708090"},
            {"clr":"slategrey","code":"#708090"},
            {"clr":"snow","code":"#FFFAFA"},
            {"clr":"springgreen","code":"#00FF7F"},
            {"clr":"steelblue","code":"#4682B4"},
            {"clr":"tan","code":"#D2B48C"},
            {"clr":"teal","code":"#008080"},
            {"clr":"thistle","code":"#D8BFD8"},
            {"clr":"tomato","code":"#FF6347"},
            {"clr":"turquoise","code":"#40E0D0"},
            {"clr":"violet","code":"#EE82EE"},
            {"clr":"wheat","code":"#F5DEB3"},
            {"clr":"white","code":"#FFFFFF"},
            {"clr":"whitesmoke","code":"#F5F5F5"},
            {"clr":"yellow","code":"#FFFF00"},
            {"clr":"yellowgreen", "code":"#9ACD32"}
            ],

        colorNamesToColorCodeWithHash: function(str){
            var s = str.split(' ')
            s.forEach((word) => {
                if (true) { 
                    var code = this.colorNames.filter((clrN) => { 
                        if(word.match(new RegExp(clrN.clr, 'i')))
                            return clrN
                    })
                    if (code && code[0]) { 
                        str = str.replace(word, code[0].code.toLowerCase() + ' ')
                    }
                }
            })
            return str
        },

        iColorItems: 0,
        nextItemColorIndex: function () {
            return this.iColorItems++ % this['color_items'].length;
        },
        nextItemColor: function () {
            return this['color_items'][this.nextItemColorIndex()];
        },
        itemColor: function (i) {
            return util.clone(this.color_items[i % this['color_items'].length]);
        },

        itemAlternateColor: function (i) {
            if(this.color_items.length % 2 == 0)
                i *= 3
            else
                i *= 2
            return util.clone(this.itemColor(i))
        },
        isDark: function (str) {
            if (str.indexOf("#") > -1)
                str = str.replace("#", "")

            var r = str.substring(0, 2),
                g = str.substring(2, 4),
                b = str.substring(4, 6)

            if (str.length == 3) { 
                r = str.substring(0, 1),
                g = str.substring(1, 2),
                b = str.substring(2, 3)
            }

            return (parseInt(r, 16) + parseInt(g, 16) + parseInt(b, 16))
                    / 3
                    < parseInt("80", 16)
        },
        shadesOfColor: function (str, n) { 

            str = String(str).replace('#', '')

            var r = parseInt(str.slice(0,2), 16),
                g = parseInt(str.slice(2,4), 16),
                b = parseInt(str.slice(4,6), 16),
                ar = [],
                min = Math.min(r,g,b);
                
            if (!(r == g && r == b)) {
                for (var c = n; c > 0; c--) {

                    var r2 = r == min ? r : r + (r - min) / (c + 1)
                    var g2 = g == min ? g : g + (g - min) / (c + 1)
                    var b2 = b == min ? b : b + (b - min) / (c + 1)


                    r2 > 254 ? r2 = 255 : r2 = r2
                    b2 > 254 ? b2 = 255 : b2 = b2
                    g2 > 254 ? g2 = 255 : g2 = g2

                    var q = this.toGrey(parseInt(r2), parseInt(g2), parseInt(b2), c)

                    ar.push(this.rgbToHex(q[0], q[1], q[2]))
                }
            }
            else { 

                // If grey given make it 20% darker
                ar.push( this.rgbToHex(parseInt(r - r/5), parseInt(r - r/5), parseInt(r - r/5)))
            }

            return ar;
        },

        // From color triplet in decimal to less saturated
        toGrey: function (r, g, b, n) { 

            var max = Math.max(r, g, b),
                r2 = max,
                g2 = max,
                b2 = max;

            if (n > 0) { 
                r != max? r2 -= parseInt((max - r) / n) : r2 = r2
                g != max? g2 -= parseInt((max - g) / n) : b2 = b2
                b != max? b2 -= parseInt((max - b) / n) : g2 = g2
            }

            return [r2, g2, b2]
        },

        // From stackoverflow.com/
        rgbToHex: function(r, g, b) {
            return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
        },

        hexToRgb: function(hex){
            var chas = [],
                h = hex.replace('#', '');
            
            chas[0] = parseInt(h.slice(0, 2), 16),
            chas[1] = parseInt(h.slice(2, 4), 16),
            chas[2] = parseInt(h.slice(4, 6), 16);

            return chas;
        },
        
        componentToHex: function(c) {
            var hex = c.toString(16);

            if(hex.length > 2) console.log(c)

            return hex.length == 1 ? "0" + hex : hex;
        }
    }

})