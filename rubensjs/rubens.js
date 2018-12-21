/*
    Rubensjs was made in order to serve svg files that can be
    previewed in Dropbox.
    It has the same structure and variables, for what has become of it,
    as Raphaeljs and is therefore compatible with it.

*/

define(['util/util', 'rubensjs/colors'], function (util, C) {

    var fontSize = '14px',  // This is the same as 1em but makes conversion to pt possible 
                            // with export svg and variable font-sizes in %
                            // This is the best option for Inkscape but not tested with other apps
            fontFamily = 'arial, helvetica, verdana, sans-serif',

            svgNs = {
                "xmlns:xlink": "http://www.w3.org/1999/xlink",
                version: "1.1",
                xmlns: "http://www.w3.org/2000/svg",
                "xmlns:inkscape": "http://www.inkscape.org/namespaces/inkscape"
            },

            svgStyle = [
                { 'font-family': fontFamily },
                { 'font-size': fontSize },
                { 'color': '#000000' },
                { 'font-weight': 'normal' },
                { 'fill': '#000' },

                { 'stroke-width': '1' },
                // CNC design
                //{'stroke-width': '0.001mm'},

                { 'stroke-linejoin': 'round' },
                { 'stroke-linecap': 'butt' }
            ],

            svgAttr = {

            };

    // We new RElement() and mixin the methods
    function RElement(el) {
        this.el = el;
    }

    return function Rubens(id, includeMarkers, background, fontSize, bgColor) {

        if (typeof background == 'undefined')
            background = true
            
        var preId = id

        //console.trace("Rubens constructed")

        this.el = null;

        // pointer to static memory 'cause we'll
        // only have one svg propper
        var S = this;

        this.svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        for (var a in svgNs)
            this.svgEl.setAttribute(a, svgNs[a]);

        this.canvas = document.querySelector("#" + id);

        if(!this.canvas) return null

        // Zoom and viewbox attribute, NOT USED: sub svg can have zoom
        var zoom = 1,
            rect = this.canvas.getBoundingClientRect()
        this.viewBox = 0.5 * (rect.width - rect.width * (1 / zoom)) + ' '
                + 0.5 * (rect.height - rect.height * (1 / zoom)) + ' '
                + (rect.width * (1 / zoom)) + " "
                + (rect.height * (1 / zoom));

        var s = '';
        svgStyle.forEach(function (a) {
            for (aa in a)
                if (aa == 'font-size') {
                    if (fontSize && String(fontSize).match("em"))
                        S.svgEl.style[aa] = fontSize
                    else
                        S.svgEl.style[aa] = (fontSize ? fontSize : '14') + 'px';
                }
                else
                    S.svgEl.style[aa] = a[aa];
        });


        this.svgEl.setAttribute('width', this.canvas.getBoundingClientRect().width);
        this.svgEl.setAttribute('height', this.canvas.getBoundingClientRect().height);

        //this.svgEl.setAttribute('viewBox', this.viewBox)

        for (a in svgAttr)
            this.svgEl.setAttribute(a, this.svgAttr[a]);

        // Reloading page causes svg to be emptied. so remove those
        // Causes error w/ Edge (Access denied)
        var a = document.querySelectorAll("#" + id + " > svg");
        if (a.length > 0)
            a.forEach(function (el) {
                el.remove();
            }
        );

        this.canvas.appendChild(this.svgEl);

        var el = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
            desc = document.createElementNS('http://www.w3.org/2000/svg', 'desc'),
            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs'),
            cPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath'),
            rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        desc.innerHTML = "Created with RubensJS";

        rect.setAttribute('x', '0');
        rect.setAttribute('y', '0');

        rect.setAttribute('width', this.canvas.getBoundingClientRect().width);
        rect.setAttribute('height', this.canvas.getBoundingClientRect().height);

        // Append rect for preview file in Dropbox        
        //cPath.setAttribute("id", "mainClip")
        cPath.appendChild(rect);

        defs.appendChild(cPath);

        this.svgEl.appendChild(desc);

        if (includeMarkers == true) {

            var m = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            m.setAttribute('id', 'arrowHead');
            m.setAttribute('orient', 'auto');
            m.setAttribute('markerUnits', 'strokeWidth');
            m.setAttribute('markerWidth', '10');
            m.setAttribute('markerHeight', '10');
            m.setAttribute('refX', '3');
            m.setAttribute('refY', '3');
            //m.setAttribute('fill', 'context-stroke') //needs svg 2.0
            m.setAttribute('fill', C.color_measure_value); //fill would be svg.style.fill

            var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            p.setAttribute('d', "M 0,0 L 0,6 L 9,3 z");
            m.appendChild(p);

            defs.appendChild(m);

            m = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            m.setAttribute('id', 'arrowHeadGreen');
            m.setAttribute('orient', 'auto');
            m.setAttribute('markerUnits', 'strokeWidth');
            m.setAttribute('markerWidth', '10');
            m.setAttribute('markerHeight', '10');
            m.setAttribute('refX', '3');
            m.setAttribute('refY', '3');
            //m.setAttribute('fill', 'context-stroke') //needs svg 2.0
            m.setAttribute('fill', C.color_pull_line_pin_locked); //fill would be svg.style.fill

            var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            p.setAttribute('d', "M 0,0 L 0,6 L 9,3 z");
            m.appendChild(p);

            defs.appendChild(m);

            m = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            m.setAttribute('id', 'arrowStart');
            m.setAttribute('orient', 'auto');
            m.setAttribute('markerUnits', 'strokeWidth');
            m.setAttribute('markerWidth', '4');
            m.setAttribute('markerHeight', '10');
            m.setAttribute('refX', '1');
            m.setAttribute('refY', '1');
            //m.setAttribute('fill', 'context-stroke') //needs svg 2.0
            m.setAttribute('fill', C.color_pull_line_pin_locked); //fill would be svg.style.fill
            //m.setAttribute('stroke', C.color_pull_line_pin_locked);

            var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            p.setAttribute('d', "M 0,0 L 0,2 L 2,2 L2,0 z");
            m.appendChild(p);

            defs.appendChild(m);
        }

        // Patterns
        // https://stackoverflow.com/questions/13069446/simple-fill-pattern-in-svg-diagonal-hatching
        // http://www.heropatterns.com/
        if (includeMarkers && C.color_items.length > 0) {
            var p = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
            p.setAttribute('id', '' + 'pat1')
            p.setAttribute('patternUnits', 'userSpaceOnUse') // Other values not possible
            p.setAttribute('patternTransform', "rotate(45)")
            //p.setAttribute('viewBox', '0 0 4 4')
            p.setAttribute('width', '8')
            p.setAttribute('height', '8')
            p.setAttribute('fill', bgColor)

            // Somehow ids of patterns should not be unique ...
            var p2 = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
            //p2.setAttribute('id', preId + 'pat11')
            p2.setAttribute('id', 'pat11')
            p2.setAttribute('patternUnits', 'userSpaceOnUse') // Other values not possible
            //p.setAttribute('viewBox', '0 0 4 4')
            p2.setAttribute('width', '8')
            p2.setAttribute('height', '8')
            p2.setAttribute('fill', bgColor)
            //p2.setAttribute('mix-blend-mode', 'lighten')

            var p3 = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
            p3.setAttribute('id', '' + 'pat13')
            p3.setAttribute('patternUnits', 'userSpaceOnUse') // Other values not possible
            p3.setAttribute('patternTransform', "rotate(-45)")
            //p.setAttribute('viewBox', '0 0 4 4')
            p3.setAttribute('width', '8')
            p3.setAttribute('height', '8')
            //p3.setAttribute('fill', bgColor)
            p3.setAttribute('fill', '#ffffff')

            var p4 = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
            p4.setAttribute('id', '' + 'pat14')
            p4.setAttribute('patternUnits', 'userSpaceOnUse') // Other values not possible
            //p.setAttribute('viewBox', '0 0 4 4')
            p4.setAttribute('width', '8')
            p4.setAttribute('height', '8')
            p4.setAttribute('fill', bgColor)


            var p5 = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
            p5.setAttribute('id', '' + 'pat15')
            p5.setAttribute('patternUnits', 'userSpaceOnUse') // Other values not possible
            //p.setAttribute('viewBox', '0 0 4 4')
            p5.setAttribute('width', '8')
            p5.setAttribute('height', '8')
            p5.setAttribute('fill', bgColor)

            var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M 4 4 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0')
            //path.setAttribute('style', 'stroke:' + C.color_items[0].color + ';stoke-width:1')

            var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('width', '8')
            rect.setAttribute('height', '4')
           // rect.setAttribute('transform', "translate(0,0)")
            //rect.setAttribute('fill', bgColor)
            rect.setAttribute('fill', '#ffffff')

            var rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect2.setAttribute('width', '8')
            rect2.setAttribute('height', '4')
         //   rect2.setAttribute('transform', "translate(0,0)")
            //rect2.setAttribute('fill', bgColor)
            rect2.setAttribute('fill', '#ffffff')

            var rect3 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect3.setAttribute('width', '8')
            rect3.setAttribute('height', '4')
           // rect3.setAttribute('transform', "translate(0,0)")
            //rect3.setAttribute('fill', bgColor)
            rect3.setAttribute('fill', '#ffffff')

            var rect4 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect4.setAttribute('width', '4')
            rect4.setAttribute('height', '8')
           // rect4.setAttribute('transform', "translate(0,0)")
            //rect4.setAttribute('fill', bgColor)
            rect4.setAttribute('fill', '#ffffff')

            var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', '4')
            circle.setAttribute('cy', '4')
            circle.setAttribute('r', '3')
            //circle.setAttribute('fill', bgColor)
            circle.setAttribute('fill', '#ffffff')

            p.appendChild(rect)
            p2.appendChild(circle)
            p3.appendChild(rect2)
            p4.appendChild(rect3)
            p5.appendChild(rect4)

            defs.appendChild(p)
            defs.appendChild(p2)
            defs.appendChild(p3)
            defs.appendChild(p4)
            defs.appendChild(p5)

            var mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
            mask.setAttribute('id', preId + 'stripes1')

            var mask2 = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
            mask2.setAttribute('id', preId + 'dots')

            var mask3 = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
            mask3.setAttribute('id', preId + 'stripes2')

            var mask4 = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
            mask4.setAttribute('id', preId + 'rectangles1')

            var mask5 = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
            mask5.setAttribute('id', preId + 'rectangles2')

            var el = document.createElementNS('http://www.w3.org/2000/svg', 'rect'),
                el2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect'),
                el3 = document.createElementNS('http://www.w3.org/2000/svg', 'rect'),
                el4 = document.createElementNS('http://www.w3.org/2000/svg', 'rect'),
                el5 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

            el.setAttribute('width', '100%')
            el.setAttribute('height', '100%')
            el.setAttribute('fill', 'url(#' + '' + 'pat1) ' + bgColor)

            el2.setAttribute('width', '100%')
            el2.setAttribute('height', '100%')
            el2.setAttribute('fill', 'url(#' + '' + 'pat11) ' + bgColor)
            el2.setAttribute('fill-opacity', '1')
            el2.setAttribute('mix-blend-mode', 'lighten')

            el3.setAttribute('width', '100%')
            el3.setAttribute('height', '100%')
            el3.setAttribute('fill', 'url(#' + '' + 'pat13) ' + bgColor)

            el4.setAttribute('width', '100%')
            el4.setAttribute('height', '100%')
            el4.setAttribute('fill', 'url(#' + '' + 'pat14) ' + bgColor)

            el5.setAttribute('width', '100%')
            el5.setAttribute('height', '100%')
            el5.setAttribute('fill', 'url(#' + '' + 'pat15) ' + bgColor)

            mask.appendChild(el)
            mask2.appendChild(el2)
            mask3.appendChild(el3)
            mask4.appendChild(el4)
            mask5.appendChild(el5)

            defs.appendChild(mask)
            defs.appendChild(mask2)
            defs.appendChild(mask3)
            defs.appendChild(mask4)
            defs.appendChild(mask5)

            var p = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
            p.setAttribute('id', preId + 'pat2')
            p.setAttribute('patternUnits', 'userSpaceOnUse') // Other values not possible
            p.setAttribute('width', '8')
            p.setAttribute('height', '8')

            /*var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M-2,2 l4,-4M0,8 l8,-8M6,10 l4,-4')
            path.setAttribute('style', 'stroke:' + C.color_items[1].color + ';stoke-width:1')
            p.appendChild(path)*/

            //defs.appendChild(p)

            var p = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
            p.setAttribute('id', preId + 'pat3')
            p.setAttribute('patternUnits', 'userSpaceOnUse') // Other values not possible
            p.setAttribute('width', '4')
            p.setAttribute('height', '4')

            /*var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M0 5L5 0H2.5L0 2.5M5 5V5L2.5 5')
            path.setAttribute('style', 'stroke:' + C.color_items[2].color + ';stoke-width:1')
            p.appendChild(path)*/

            defs.appendChild(p)

        }


        this.svgEl.appendChild(defs);

        // Background
        var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', this.canvas.getBoundingClientRect().width);
        rect.setAttribute('height', this.canvas.getBoundingClientRect().height);
        rect.setAttribute('fill', bgColor);
        //rect.setAttribute('strokeWidth', '0');
        rect.setAttribute('class', 'bg_rect')

        if (background)
            this.svgEl.appendChild(rect);


        return {

            // Properties
            id: id,

            // variable to hold head to append to
            head: [],

            // Element methods
            remove: function () {
                this.el.remove()
            },

            // SVG methods
            svg: function () {

                S.svgEl.appendChild(el)
                return this
            },

            vOpen: function (props) {
                var el = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
                    cPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath'),
                    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs'),
                    rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

                if (typeof props !== 'undefined') {
                    rect.setAttribute('x', '0');
                    rect.setAttribute('y', '0');

                    el.setAttribute('x', props.x)
                    el.setAttribute('y', props.y)

                    //el.setAttribute('transform', "translate(" + props.x + " " + props.y + " )")

                    rect.setAttribute('width', props.w);
                    rect.setAttribute('height', props.h);

                    el.setAttribute('fill', props.fill || '#fff')

                    cPath.setAttribute('id', props.id)

                    cPath.appendChild(rect)
                    defs.appendChild(cPath)
                    el.appendChild(defs)
                }

                // Defs -> clipPath

                S.svgEl.appendChild(el);

                this.head.push(S.svgEl)
                S.svgEl = el
                return util.extend(new RElement(el), this);
            },

            vClose: function () {
                S.svgEl = this.head.pop()
            },

            /*
                A layer or group element
            */
            gOpen: function () {
                var el = document.createElementNS('http://www.w3.org/2000/svg', 'g');

                // For a 1:1 export put a clipping path around layers with size of 
                // visible part This prevents showing the svg in an editor with labels 
                // outside visible area. To show the cipped paths in full the svg needs
                // to be de-grouped and main element (a layer) needs to have the
                // clipping mask removed. This is a bit of a hassle though ...
                //el.setAttribute('clip-path', 'url(#mainClip)')

                S.svgEl.appendChild(el);

                this.head.push(S.svgEl)
                S.svgEl = el
                return util.extend(new RElement(el), this);
            },

            gClose: function () {
                S.svgEl = this.head.pop()
                return util.extend(new RElement(S.svgEl), this);
            },


            foreignObject: function () {
                var el = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');

                el.setAttribute('width', '100%')
                el.setAttribute('height', '100%')

                S.svgEl.appendChild(el);

                return util.extend(new RElement(el), this);
            },

            /*
                A path in the svg
            */
            path: function (d) {
                var def = {
                    opacity: 1,
                    stroke: '#000',
                    fill: 'none',
                    visibility: 'visible'
                };

                var el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                for (a in def)
                    el.setAttribute(a, def[a]);

                el.setAttribute('d', d);

                S.svgEl.appendChild(el);

                return util.extend(new RElement(el), this);
            },

            // Bring id to the foreground
            use: function (id) {
                var el = document.createElementNS('http://www.w3.org/2000/svg', 'use');
                el.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id);
                S.svgEl.appendChild(el);
                return util.extend(new RElement(el), this);
            },

            // Draws a pin drawn with Inkscape
            pin: function (left, top) {
                return this.path("m " + left + " " + top +
                    "a 4.500196,1.7379924 12.753314 0 0 -2.6102936,0.8397 4.500196,1.7379924 12.753314 0 0 0.022,0.634 l -1.7775305,3.9323 a 4.4205887,1.9914504 16.212619 0 0 -1.0221615,0.7895 4.4205887,1.9914504 16.212619 0 0 2.7111988,2.8795 l -2.4253365,4.8248 -0.1946443,1.7828 1.4404091,-1.4332 2.4114103,-4.7638 a 4.4205887,1.9914504 16.212619 0 0 4.5013403,-0.6864 4.4205887,1.9914504 16.212619 0 0 -0.361337,-1.3049 l 2.537036,-3.7843 a 4.500196,1.7379924 12.753314 0 0 0.848305,-0.6227 4.500196,1.7379924 12.753314 0 0 -3.617218,-2.7354 4.500196,1.7379924 12.753314 0 0 -2.463176,-0.3519 z"
            );
            },

            mrkrTriangle: function (left, top) {
                return this.path("m " + left + " " + top +
                    " 4,-4 -8,0 4,4 z"
                    )
            },

            mrkrCircle: function (left, top) {
                return this.path("m " + (left + 3.5222) + " " + top +
                    "a 3.522259,3.522259 0 0 1 -3.522259,3.5222 3.522259,3.522259 0 0 1 -3.522259,-3.5222 3.522259,3.522259 0 0 1 3.522259,-3.5223 3.522259,3.522259 0 0 1 3.522259,3.5223 z")
            },

            mrkrSquare: function (left, top) {
                return this.path("m " + (left + 3) + " " + top +
                    " 0,3 -6,0 0,-6 6,0 0,6Z"
                    )
            },

            mrkrStar: function (left, top) {
                return this.path("m " + left + " " + top +
                   " 3,0 0,3 -6,0 0,-6 6,0 0,6 z"
                   )
            },



            /*
                A text in the svg
            */
            text: function (x, y, label) {
                var def = {
                    'text-anchor': "start",
                    'visibility': 'visible',
                    'stroke-width': 1,
                    'fill': '#000'
                };
                var el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                el.setAttribute('x', x);
                el.setAttribute('y', y + 4);
                el.innerHTML = label;

                for (a in def)
                    el.setAttribute(a, def[a]);

                S.svgEl.appendChild(el);
                return util.extend(new RElement(el), this);
            },

            /*
                A rectangle in svg
            */
            rect: function (left, top, width, height, fill) {
                var el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                el.setAttribute('x', left);
                el.setAttribute('y', top);
                el.setAttribute('width', width);
                el.setAttribute('height', height);

                if (fill)
                    el.setAttribute('fill', fill)

                S.svgEl.appendChild(el)
                return util.extend(new RElement(el), this);
            },

            /*
                A rectangle in svg with arrow
            */
            balloon: function (left, top, width, height) {
                var el = document.createElementNS('http://www.w3.org/2000/svg', 'path');

                el.setAttribute('d',

                    // Left top
                    'M' + left + ',' + top +

                    // Right top
                    'L' + (left + width) + ',' + top +

                    // Bottom right
                    'L' + (left + width) + ',' + (top + height) +

                    // Before arrow
                    'L' + (left + (width / 2) + 10) + ',' + (top + height) +

                    // Arrow
                    'L' + (left + (width / 2)) + ',' + (top + height + 10) +

                    // After arrow
                    'L' + (left + (width / 2) - 10) + ',' + (top + height) +

                    // Bottom left
                    'L' + (left) + ',' + (top + height) +

                    // Top Left
                    'Z'
                );

                S.svgEl.appendChild(el);
                return util.extend(new RElement(el), this);
            },

            /*
                A circle in svg
            */
            circle: function (x, y, r) {
                var el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                el.setAttribute('cx', x);
                el.setAttribute('cy', y);
                el.setAttribute('r', r);

                S.svgEl.appendChild(el);
                return util.extend(new RElement(el), this);
            },


            // Atribute methods
            attr: function (o) {
                if (this.el)
                    for (a in o) {
                        if (isNaN(a))
                            this.el.setAttribute(a, o[a]);
                    }
                return util.extend(new RElement(this.el), this);
            },

            // Should not be used. Use coordinates to determine reactive event by simple hittesting
            click: function (cb) {
                if (typeof cb === 'function') {
                    this.el.removeEventListener('click', cb);
                    this.el.addEventListener('click', cb);
                }
                return util.extend(new RElement(el), this);
            }
        }
    }
})