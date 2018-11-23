define([
    "rubensjs/rubens",
    "rubensjs/_2d",
    "rubensjs/PLG/zoomable",
    "rubensjs/interface",
    "rubensjs/PLG/pannableOrigin",
    "rubensjs/types",
    "rubensjs/colors",
    "util/util",
    //'external/proj4',
    "rubensjs/svgFromXml",
    "rubensjs/inlay",
    'external/hammer.min'],
    function (Rubens, _2d, Z, I, P, T, C, util, /*proj4,*/ S, L, H) {

        return {

            Map: function (id, fontSize, fontColor, bgColor, crs) {

                return util.extend(

                    // Mixins

                    // Interface to the coordinate system
                    [
                    new I.I(),

                    new Z.Zoomable(),

                    // test plugin
                    new P.PannableOrigin()
                    ], {

                        // End mixins

                        // RFC compliant?
                        RFC7946: false,

                        // Coordinate system
                        D: new _2d.D(),

                        // HTML id of the canvas container without hash
                        id: id,

                        // Set if Hammer handlers already attached
                        hasHandlers: false,

                        // Layers with GEOJson data
                        data: [],

                        // Import layer filter value
                        filterRegexString: '.*',

                        // Set to WGS84
                        crs: crs || 'EPSG:4326',

                        // A sub svg
                        legend: new L.Inlay(),

                        //invalidate: function(){
                        //    this.deleteMap()
                        //},

                        zoomable: false,

                        // Init display map
                        init: function (config) {
                            this.config = config;
                            this.D.init(this.id, config);
                            this.D.paper = new Rubens(this.id, true, true, fontSize, bgColor);

                            var mngr = new H(
                                document.querySelector("#" + this.id),
                                {
                                    recognizers: [[Hammer.Pinch, {}], [Hammer.Pan, { direction: Hammer.DIRECTION_ALL }]]
                                }
                            )

                            if (this.zoomable && !this.hasHandlers) {
                                mngr.on("pinchend", (e) => {

                                    if (e.scale < 1) {
                                        this.handleInput(e.center.x, e.center.y, -1)
                                    }
                                    else
                                        this.handleInput(e.center.x, e.center.y, 1)
                                })

                                // Scroll mouse and mousepad
                                document.querySelector("#" + this.id)
                                .addEventListener('mousewheel', (event) => {

                                    // Zoom
                                    if (event.deltaY > 0) {
                                        this.handleInput(event.x, event.y, 1)
                                    }
                                    else if (event.deltaY < 0) {
                                        this.handleInput(event.x, event.y, -1)
                                    }
                                })

                                this.hasHandlers = true
                            }

                        },

                        handleInput: function (px, py, zoom) {

                            // Center
                            var x = this.D.toValueX(
                                        this.zoomedX(this.D.deviceXToCanvasX(this.id, px))),
                            y = this.D.toValueY(
                                        this.zoomedY(this.D.deviceYToCanvasY(this.id, py)));

                            // Zoom
                            this.setZoom(zoom)

                            this.centerMap(x, y)
                            //this.centerMap(0,0)

                            this.applyViewbox()
                        },

                        getCRS: function () {
                            return this.crs;
                        },

                        reproject: function (d, crsSrc, crsTrg) {
                            var ps = []

                            // Foreach XY
                            d.forEach((xy) => {

                                // Projection
                                if (xy[0] > -180.0 && xy[0] < 180.0 && xy[1] > -90.0 && xy[1] < 90.0) {
                                    var p = proj4(crsSrc, crsTrg, [xy[0], xy[1]]),
                                        pp = p;

                                    ps.push(new T.Point(pp[0], pp[1]))
                                }
                            })

                            return ps
                        },

                        setData: function (data, filter, type, fillColor, strokeColor, strokeWidth, crs, marker) {

                            this.data.push({
                                data: data,
                                type: type,
                                filter: filter,
                                crs: crs || "EPSG:3857",
                                marker: marker,
                                fillColor: fillColor, strokeColor: strokeColor,
                                strokeWidth: strokeWidth
                            });
                        },

                        drawData1: function (resolve) {

                            if (!this.data[0])

                                this.drawEnvelope()
                            else
                                // Foreach layer
                                this.data.forEach((layer) => {

                                    this.drawLayer(layer)
                                })

                            if (resolve)
                                resolve('ok')
                        },

                        drawLayer: function (layer) {

                            this.D.openGroup(0)
                            .attr({ name: 'layer' })

                            // Foreach Feature
                            layer.data.forEach((dd) => {

                                this.drawLayerData(dd, layer.filter, layer.crs, layer.type, layer.fillColor, layer.strokeColor, layer.strokeWidth, layer.marker)

                            })

                            this.D.closeGroup()
                        },

                        applyFilter: function (propAr, filter) {

                            var f = null,
                                cmp = null,
                                v = null,
                                prts = [],
                                _filter = new String(filter)

                            if (_filter.indexOf("=") > -1) {
                                cmp = '='
                                prts = _filter.split("=")
                            }
                            else if (_filter.indexOf(">") > -1) {
                                cmp = '='
                                prts = _filter.split(">")
                            }
                            else if (_filter.indexOf("<") > -1) {
                                cmp = '='
                                prts = _filter.split("<")
                            }

                            if (prts.length == 2) {
                                f = prts[0]
                                v = prts[1]

                                if (_filter.indexOf(">") > -1) cmp = '>'
                                if (_filter.indexOf("<") > -1) cmp = '<'

                            }


                            if (!cmp) {
                                if (propAr.properties) {
                                    for (var i in propAr.properties) {
                                        if (String(propAr.properties[i]).match(new RegExp(filter, "i"))) {
                                            return propAr
                                        }
                                    }
                                    return false
                                }
                                else return propAr
                            }
                            else {

                                if (propAr.properties) {
                                    if (cmp == '=') {
                                        if (String(propAr.properties[f]) == v)
                                            return propAr
                                    }
                                    else if (cmp == '>') {
                                        if (Number(propAr.properties[f]) > v)
                                            return propAr
                                    }
                                    else if (cmp == '<') {
                                        if (Number(propAr.properties[f]) < v)
                                            return propAr
                                    }
                                }
                                else
                                    return propAr
                            }
                        },


                        // Draws GeoJson encoded objects
                        drawLayerData: function (dd, filter, crs, type, fillColor, strokeColor, strokeWidth, marker) {

                            // Apply filter
                            dd = this.applyFilter(dd, filter)

                            if (!dd)
                                return

                            // RFC 7946 3.1
                            //if( ! dd.coordinates) return.

                            // POINT
                            if (type == 'Point') {
                                this.drawPoint(dd.geometry.coordinates[0], dd.geometry.coordinates[1], crs, dd.properties.name, marker)
                            }

                                // MULTIPOINT
                                // ...

                            else if (type == 'LineString') {

                                this.drawLineStrings(dd, crs, fillColor, strokeColor, strokeWidth)
                            }

                                // MULTILINESTRING
                                // ...

                            else if (type == 'Polygon') {
                                if (dd.geometry && dd.geometry.coordinates)
                                    dd = dd.geometry

                                if (dd.coordinates)
                                    this.drawPolygon(dd.coordinates[0], crs, fillColor, strokeColor, strokeWidth)
                                else if (dd.geometry && dd.geometry.type == 'GeometryCollection') {
                                    this.drawLayerData(dd, filter, crs, dd.geometry.type, fillColor, strokeColor, strokeWidth, marker)
                                }
                            }

                            else if (type == 'MultiPolygon') {
                                if (dd.geometry && dd.geometry.coordinates)
                                    this.drawMultiPolygons(dd.geometry.coordinates, crs, fillColor, strokeColor, strokeWidth)
                                else if (dd.geometries && dd.geometries.coordinates)
                                    this.drawMultiPolygons(dd.geometries.coordinates, crs, fillColor, strokeColor, strokeWidth)
                            }

                            else if (type == 'GeometryCollection') {

                                if (!(dd.geometry && dd.geometry.geometries)) {
                                    if (dd.geometry) {
                                        var g = dd.geometry
                                        dd.geometry.geometries = []
                                        dd.geometry.geometries[0] = g
                                    }
                                }

                                if (dd.geometry && dd.geometry.geometries) {
                                    var name = '';
                                    if (dd.properties && dd.properties.name)
                                        name = dd.properties.name

                                    var iso2 = ''
                                    if (dd.properties && dd.properties.ISO2)
                                        iso2 = dd.properties.ISO2

                                    this.D.openGroup(0)
                                    .attr({ name: 'C_' + name, iso2: iso2 })

                                    dd.geometry.geometries.forEach((d) => {
                                        if (d.type == 'Polygon' && d.coordinates)
                                            this.drawLayerData(d, filter, crs, d.type, fillColor, strokeColor, strokeWidth, marker)
                                    })

                                    this.D.closeGroup()
                                }
                            }
                            else {
                                console.log(type + " is not supported")
                            }
                        },

                        drawMultiPolygons: function (dd, crs, fillColor, strokeColor, strokeWidth) {

                            this.D.openGroup()
                            //.attr({name:"C_" + dd.name})

                            dd.forEach((d) => {

                                var holes = [],
                                    poly = ''

                                d.forEach((q, n) => {

                                    // https://tools.ietf.org/html/rfc7946#section-3.1.6 :

                                    // Assume, with reference to QGis, multipolygons are some
                                    // polygons described in A3, eg with holes defined by
                                    // the second and further polygons, so this applies
                                    // and the type mentioned by A6 doesn't exist in practice.

                                    // QUOTE:
                                    // For Polygons with more than one of these rings, the first MUST be
                                    // the exterior ring, and any others MUST be interior rings.  The
                                    // exterior ring bounds the surface, and the interior rings (if
                                    // present) bound holes within the surface.

                                    // Tests:
                                    // Pampus is a hole in the shape of the water
                                    // Countries surrounded by another country like San Marino
                                    // Markermeer is not land but water

                                    if (n == 0)
                                        poly = q
                                    else if (q)
                                        holes.push(q)

                                    if (this.RFC7946)
                                        this.drawPolygon(q, crs, fillColor, strokeColor, strokeWidth)
                                })

                                if (!this.RDF7946)
                                    this.drawPolygon(poly, crs, fillColor, strokeColor, strokeWidth, holes)
                            })

                            this.D.closeGroup()
                        },

                        drawPolygon: function (d, crs, fillColor, strokeColor, strokeWidth, holes) {
                            var ps = [],
                                hls = []

                            ps = this.reproject(d, crs, this.crs)

                            if (holes)
                                holes.forEach((hole) => {
                                    hls.push(this.reproject(hole, crs, this.crs))
                                })

                            if (ps.length > 0) {
                                var p = this.D.polygon(ps, hls, true, true)
                                if (p) {
                                    p.attr({ 'fill': fillColor, 'stroke': strokeColor, 'stroke-width': strokeWidth })
                                }
                            }
                        },

                        drawPoint: function (x, y, crs, label, marker) {
                            var ps = [],
                                pixPoint = new T.Point()

                            ps = this.reproject([[x, y]], crs, this.crs)

                            pixPoint.x = this.D.toPointX(ps[0].x)
                            pixPoint.y = this.D.toPointY(ps[0].y);

                            if (ps.length > 0) {
                                this.markerOnMap(marker, pixPoint)

                                if (label)
                                    this.D.paper.text(pixPoint.x + this.D.config.halfFontXHeight, pixPoint.y, label)
                            }
                        },

                        legendOnMap: function () {
                            this.legend.insert(this.D.paper)
                            this.legend.drawLegend(
                                this.D.toPointX(this.D.reachMaxX, -150),
                                this.D.toPointY(this.D.reachMaxY, -2),
                                152,
                                50,
                                [{ color: C.nextItemColor().color, label: 'een' },
                                { color: C.nextItemColor().color, label: 'twee' }],
                                'rect',
                                'Legend',
                                { "stroke-width": 1, fill: '#fff', stroke: '#000' }
                             )
                        },

                        markerOnMap: function (xml, ps) {
                            var svg = new S.svgFromXml()
                            svg.insert(this.D.paper)
                            svg.renderXml(xml, ps)
                        },

                        drawLineStrings: function (dd, crs, fillColor, strokeColor, strokeWidth) {
                            var ps = []

                            dd.geometry.coordinates.forEach((d) => {

                                // Projection
                                if (crs !== this.crs) {
                                    var p = proj4(crs, this.crs, [d[0], d[1]]),
                                    pp = p;
                                }
                                else
                                    pp = [d[0], d[1]]

                                ps.push(new T.Point(pp[0], pp[1]))

                                if (ps.length > 1) {
                                    var lp = this.D.line(ps[ps.length - 2], ps[ps.length - 1])
                                    if (lp)
                                        lp.attr({ 'fill': fillColor, 'stroke': strokeColor, 'stroke-width': strokeWidth })
                                }
                            })
                        },

                        drawEnvelope: function () {

                            // Open group
                            this.D.openGroup()
                            .attr({ name: 'Empty map' })

                            // Draw rectangle
                            this.D.polygon([
                                new T.Point(this.D.reachMaxX, this.D.reachMinY),
                                new T.Point(this.D.reachMinX, this.D.reachMinY),
                                new T.Point(this.D.reachMinX, this.D.reachMaxY),
                                new T.Point(this.D.reachMaxX, this.D.reachMaxY),
                                new T.Point(this.D.reachMaxX, this.D.reachMinY)
                            ])
                            .attr({ stroke: fontColor, /*mask:'url(#chart1dots)', fill: '#ff0000' */ })

                            // Draw diagonals
                            this.D.line(
                                new T.Point(this.D.reachMaxX, this.D.reachMinY),
                                new T.Point(this.D.reachMinX, this.D.reachMaxY)
                            )
                            .attr({ stroke: fontColor })

                            this.D.line(
                                new T.Point(this.D.reachMinX, this.D.reachMinY),
                                new T.Point(this.D.reachMaxX, this.D.reachMaxY)
                            )
                            .attr({ stroke: fontColor})

                            this.D.closeGroup()
                        }
                    }
            )
            }
        }
    })