define([
 "rubensjs/rubens",
 "rubensjs/_2d",
 "rubensjs/types"], function (Rubens, _2d, T) {

     return {

         svgFromXml: function () {

             return {
                 id: null,

                 D: new _2d.D(),

                 paper: null,

                 hasRubens: true,

                 // Creates new SVG
                 init: function (id) {
                     this.id = id
                     this.D.init(id)

                     // svg without markers/patterns and background
                     this.D.paper = new Rubens(this.id, false, false);

                     this.paper = this.D.paper
                 },

                 // Insert into existing SVG
                 insert: function (paper) {
                     this.paper = paper
                     this.hasRubens = false
                 },

                 renderXml: function (xml, topLeft, zoom) {
                     var h = parseFloat(xml[0].height.baseVal.value),
                         w = parseFloat(xml[0].width.baseVal.value)

                     if (!this.hasRubens) {

                         var p = this.paper.vOpen({
                             w: w,
                             h: h,
                             x: topLeft.x - w / 2,
                             y: topLeft.y - h / 2,
                             id: 'markerClip'
                         })
                     }

                     var q = document.querySelector('#' + this.id + ' svg')
                     q.setAttribute('viewBox', '0 0 ' + w + ' ' + h)

                     this.renderChildren(xml[0].children)

                     if (!this.hasRubens)
                         this.paper.vClose()
                 },

                 // Children should be paths and groups
                 // and without a translate attribute for sub-svg
                 renderChildren: function (c) {
                     var lyrs = 0

                     c.forEach((child) => {

                         var attr = {},
                             nname = child.nodeName

                         for (var a in child.attributes) {
                             if (child.attributes[a].nodeName)
                                 attr[child.attributes[a].nodeName] =
                                     child.attributes[a].nodeValue
                         }

                         if (nname == 'g') {

                             if (lyrs == 0)
                                 attr['clip-path'] = 'url(#markerClip)'

                             lyrs++
                             this.paper.gOpen()
                             .attr(attr)
                         }
                         else if (nname == 'path') {
                             this.paper.path(attr.d)
                             .attr(attr)
                         }


                         if (child.children)
                             this.renderChildren(child.children)
                     })

                     for (var n = 0; n < lyrs; n++)
                         this.paper.gClose()
                 }
             }
         }

     }

 })
