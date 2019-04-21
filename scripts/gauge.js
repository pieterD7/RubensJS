requirejs([
    'util/uri',
    'rubensjs/types',
    'rubensjs/OBJ/gauge'], function(URI, R, G){

        window.addEventListener('popstate', onPopState);

        // A gauge as the stroke of a path in two layers:
        // a static layer and a layer indicating value(s)
        var graph = new G.Gauge("chart1", 18, '#888', '#202020')

        graph.init({
            paddingLeft:10,
            paddingRight:10,
            paddingTop:80,
            paddingBottom:50,
            padding:0,
            opts: {
                green:128,
                yellow:192,
                red:256,
                pointer:true,
                angle:90,
                r:150,
                makeRadiusFit:true,
                strokeWidth:20,
                offset:-30,
                colorPointer:'#888'
            }
        })

        graph.setRange(new R.Range(0,2,0,Math.pow(2,8)));

        graph.setSteps(10,8)

        //graph.labels = [void(0), '&#x2648;', '&#x2649;']

        graph.drawStaticVisual()

        graph.D.openGroup('outerRing')
        .attr({
            transform: 'rotate(' + graph.getLayerRotationAngle() + ' ' + graph.pivotPoint.x + ' ' + graph.pivotPoint.y + ')'
        })

        graph.stepsY = 8*2

        graph.drawLabels(graph.getLabelPositions(30))

        graph.D.closeGroup();

        function onPopState(){

            var val = new URI.URI().uri.split(",")

            var data = [{
                label:null,
                row:0,
                data:[
                    {to:parseInt(val[0])}]
                }
            ]

            graph.setData(data)

            graph.invalidate();

            graph.D.openGroup('svgLayer')

            graph.drawData()

            graph.D.closeGroup('svgLayer')

        }

        onPopState()

})