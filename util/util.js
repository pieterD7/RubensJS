define([], function () {

    Warn = function (t) { return { type: 'warning', t: t } }

    Err = function (t) { return { type: 'error', t: t } }

    return {

        dgrToRad: 0.0174532925,

        // from stackoverflow/
        clone: function(obj){
            if (null == obj || "object" != typeof obj) return obj;
            var copy = obj.constructor();
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
            }
            return copy;
        },

        /**
            params: 
                destination: Object
                source: Object with defaults
        */
        extend: function (destination, source) {

            if (typeof destination == 'object' &&
                destination.length > 0) {
                var o = new Object()

                o = this._extend(o, source);

                destination.forEach((d) => {                    
                    o = this._extend(o, d);
                });
                return o;
            }
            else {
                return this._extend(destination, source);
            }
        },
        _extend: function (source, destination) {
            var destination = destination || new Object();
            for (var k in source) {
                if (source.hasOwnProperty(k)) {
                    destination[k] = source[k];
                }
            }
            return destination;
        },

        mixin: function (baseObject, data) {
            var b = this.extend(new baseObject, data);
            return b;
        },

        round: function (n, decimals) {
            return Number(Math.round(n + 'e' + decimals) + 'e-' + decimals)

        },

        // Wrapper function to enable stack traces in DOM eventhandlers
        eventHandler: function (cb, errorBox) {
            if (typeof cb == 'function') {
                try {
                    return cb();
                }
                catch (err) {
                    console.trace(err);
                    if (errorBox)
                        errorBox.showErrorMsg(err.toString())
                }
            }
        },

        trim: function (s) {
            // remove trailing and leading space
            return s.replace(/^\s*|\s*$/, '')
        },

        toFirstCharUppercase: function (str) {
            var _str = String(str);
            var pos = 0;
            return _str.toString().charAt(pos).toLocaleUpperCase() + _str.slice(pos + 1);
        },

        hasClassName: function (el, cls) {
            var na = String(el.className).split(' '),
                str = ''

            na.forEach(function (name) {
                str += "." + name
            })

            if (String(str).match('.' + cls))
                return true
            return false
        },

        /**
         * @description Adds classname(s) to this element. Keeps classnames and 
         * checks if the classname is already applied
         * @param {String} className Name of class 
         */
        addClassName: function (el, className) {
            var clsNames = String(el.className).split(' '),
                str = clsNames.join(" ")
            clsNames.forEach((clsName) => {
                if (!this.hasClassName(el, className) &&
                    !str.match(className)) {
                    str += ' ' + className
                }
            })
            el.className = str
        },

        removeClassName: function (el, className) {
            var na = String(el.className).split(' '),
            str = ''

            na.forEach(function (name) {
                if (className != name)
                    str += name + ' '
            })
            el.className = str
        },

        httpRequest: function (url, params, __cbSuccess__, method) {
            var xmlhttp;
            if (window.XMLHttpRequest) {
                xmlhttp = new XMLHttpRequest();
            } else {
                // code for older browsers
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
            xmlhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    __cbSuccess__(this.responseText)
                }
            };
            xmlhttp.open(method || "GET", url, true);
            xmlhttp.send(params);
        },

        getXmlParser: function (xmlStr) {

            if (typeof window.DOMParser != "undefined") {
                parseXml = function (xmlStr) {
                    return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
                };
            } else if (typeof window.ActiveXObject != "undefined" &&
                    new window.ActiveXObject("Microsoft.XMLDOM")) {

                // Support for IE 8
                parseXml = function (xmlStr) {
                    var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
                    xmlDoc.async = "false";
                    xmlDoc.loadXML(xmlStr);
                    return xmlDoc;
                };
            } else {
                throw new Error("No XML parser found");
            }
            return parseXml;
        },


        toJson: function (str) {
            if (typeof str == 'string') {
                var inp = new String(str).replace(/\n|\r|\t/g, '')
                inp = inp
                        .replace(/{\s*'/g, '{"')
                        .replace(/:\s*'/g, ':"')
                        .replace(/'\s*:/g, '":')
                        .replace(/'\s*}/g, '"}')
                        .replace(/,\s*'/g, ',"')
                        .replace(/'\s*,/g, '",')
                        .replace(/\]\s*'/g, ']"')
                        .replace(/'\s*\]/g, '"]')
                        .replace(/\[\s*'/g, '["')
                        .replace(/\[\s*'/g, '["')

                var json = JSON.parse(inp)
                return json
            }
            return str
        },

        splitQuotedBy: function (txt, del, stripEscape) {
            var ret = [],
                q = -1, // Within quotes?
                str = '',
                parts = String(txt).split(del);
                            
            var s = false // State change?

            parts.forEach(function (p) {

                if (p.indexOf("\"") > -1) {
                    q *= -1
                    s = true
                }
                
                // Two quotes?
                if (p.match(/"(.*)"/)) {
                    q *= -1
                    s = false
                }

                if(stripEscape)
                    //p = p.replace(/^["]|["]$/g, "")
                    p = p.replace(/["]/g, "")

                if (q == 1 && s) {
                    str = del + p
                }
                else if (q == -1 && s) {
                    ret.push(str + p)
                    str = ''
                }
                else if (q == 1) {
                    str += p
                }
                else if (q == -1) {
                    ret.push(p)
                }
            })

            // We could get here if found only one quote
            if (str != '') {
                var lns = str.split(del)
                ret.push.apply(ret, lns)
            }
            return ret
        },

        /*makeFloat: function(str){
            if(String(str).indexOf(".") === -1)
                return parseFloat(String(str).replace(/[,]/g, "").split(/\W![-]/)[0])
            else
                return parseFloat(String(str).replace(/[,]/g, ""))
        },*/

        isNaN: function (str) {
            if (str == "") return true
            return isNaN(str)
        }

    }
})
