requirejs([
    'util/uri',
    'rubensjs/colors',
    'rubensjs/types',
    'rubensjs/OBJ/gauge',
    'rubensjs/OBJ/columnChart'], function(URI, CLR, R, G, C){

        window.addEventListener('popstate', onPopState);

        window.addEventListener('resize', () => { init(); onPopState(); applyScores()});

        var btnStart = document.querySelector('#btnStart'),
            btnStop = document.querySelector('#btnStop'),
            btnClear = document.querySelector('#btnClear'),
            btnSortMean = document.querySelector('#iconMean'),
            btnSortPeak = document.querySelector('#iconPeak');

        btnStart.addEventListener('click', () => {
            if( ! btnStart.classList.contains('grayed'))
                onBtnStartClick()
        })

        btnStop.addEventListener('click', () => {
            if( ! btnStop.classList.contains('grayed')){
                btnClear.classList.remove('grayed')
                btnSortPeak.classList.remove('grayed')
                btnSortMean.classList.remove('grayed')
                onBtnStopClick()
            }
        })

        btnClear.addEventListener('click', () => {
            clearList(); score = {s:0, index:0, mean:0};
            scores = []; take = 0
            btnClear.classList.add('grayed')
            btnSortMean.classList.add('grayed')
            btnSortPeak.classList.add('grayed')
        })

        btnSortMean.addEventListener('click', () => {

            sortProp = 1
            applyScores()
        })

        btnSortPeak.addEventListener('click', () => {
            sortProp = 0
            applyScores()
        })

        // A gauge as the stroke of a path in two layers:
        // a static layer and a layer indicating value(s)
        var graph = null

        // 0 == gauge, 1 == columns
        var graphMode = 0

        var S = {
            'start':'start',
            'stop':'stop'
        }

        var scores = [],
            score = {s:0, index:0, mean:0},
            mode = 0,
            sortProp = 0,
            total = 0,
            nTotal = 0;
            take = 0;

        function init(){
            if(typeof bridge != 'undefined'){
                S = JSON.parse(bridge.getStrings())
            }

            document.querySelector('#btnStart').innerHTML = S.start
            document.querySelector('#btnStop').innerHTML = S.stop
        }

        function initColumns(){

            graph = new C.ColumnChart("chart1", 18, "#888", "#202020")

            graph.opts.drawLabelsOnTop = false

            graph.opts.labelType = 4

            graph.opts.mode = R.CONST.ADD

            graph.opts.colorIter = 2

            graph.opts.superGroups = false

            CLR['color_items'] = [
                {color:CLR.color_indicator_yellow},
                {color:CLR.color_indicator_green},
                {color:CLR.color_indicator_red}
            ]

            graph.init({
                padding:4,
                paddingBottom:100,
                paddingTop:20
            })

            graph.setRange(new R.Range(0, 10, 0, 80))

            graph.setSteps(10, 10)
        }

        function initGauge(){

            graph = new G.Gauge("chart1", 18, '#888', '#202020')

            graph.init({
                paddingLeft:10,
                paddingRight:10,
                paddingTop:20,
                paddingBottom:20,
                padding:0,
                opts: {
                    green:64-30/2,
                    yellow:(128+30)*(0.75+1/8)-30,
                    red:128,
                    pointer:true,
                    angle:270,
                    r:210,
                    makeRadiusFit:true,
                    strokeWidth:8,
                    offset:-30,
                    colorPointer:'#888'
                }
            })

            graph.setRange(new R.Range(0,2,-30,Math.pow(2,7)));

            if(graph.r > 200)
                graph.setSteps(10,8)
            else
                graph.setSteps(10,8/2)

            graph.drawStaticVisual()

            graph.D.openGroup('outerRing')
            .attr({
                transform: 'rotate(' + graph.getLayerRotationAngle() + ' ' + graph.pivotPoint.x + ' ' + graph.pivotPoint.y + ')'
            })

            if(graph.r > 200)
                graph.stepsY = 8//7*2
            else
                graph.stepsY = 8

            //graph.drawLabels(graph.getLabelPositions(30))
            var oldSteps = graph.stepsY
            graph.stepsY = 5*graph.stepsY
            graph.drawMarks(
                getLabelPositions(-10, 0),
                getLabelPositions(-1*graph.r / 30 - 10, 5),
                false,
                {'stroke-width': graph.r > 200? 2: 1})

            graph.stepsY = oldSteps
            var lbls = ['0',10,20,30,40,50,60,70,80]
            graph.drawLabels(getLabelPositions(-1*graph.r / 30 -30, 0), lbls, 0, 0, 'Arial', '80%')

            graph.D.closeGroup();

        }

        // Plot from range -30 - 128 into 0 - 80
        function plot(val){
            return ((val - graph.D.reachMinY) /
                (graph.D.reachMaxY - graph.D.reachMinY)) * 80
        }

        function between(val, yMin, yMax){
            return Math.max(
                Math.min(
                    plot(parseFloat(val) - yMin),
                    plot(yMax) - plot(yMin)
                ),
                0
            )
        }

        function onPopState(){

            var valArray = new URI.URI().uri.split(",")

            // The score
            val = parseFloat(valArray[0])

            var score = plot(val)

            score = round(score, 1)

            if(mode == 1)
                valueToHighestScore(score)

            // The graph
            if(graphMode == 0){

                var data = [{
                    label:null,
                    row:0,
                    data:[
                        {to:val}]
                    }
                ]
            }
            else if(graphMode == 1){
                var vals1 = [],
                    vals2 = [],
                    vals3 = [],
                    equ = [32, 64, 125, 250, 500, '1K', '2K', '4K', '8K', '16K']

                // 0 - 40
                valArray.forEach( (v, n) => {
                    if(n > 0){
                        vals1.push({data:[{to: between(v, 0, 40)}], label:equ[n-1], row:1})
                    }
                })

                // 40 - 60
                valArray.forEach( (v, n) => {
                    if(n > 0){
                        vals2.push({data:[{to: between(v, 40, 60)}], label:equ[n-1], row:1})
                    }
                })

                // 60 - 80
                valArray.forEach( (v, n) => {
                    if(n > 0){
                        vals3.push({data:[{to: between(v, 60, 80)}], label:equ[n-1], row:1})
                    }
                })
                var data = [vals1, vals2, vals3]
            }

            graph.setData(data)

            graph.invalidate('.svgLayer');

            graph.D.openGroup('svgLayer')

            graph.drawData()

            graph.D.closeGroup('svgLayer')

        }

        function getLabelPositions(off, makeLonger){

            var positions = []

            for(var n = 0; n < graph.stepsY + 1; n++){

                var offset = off

                if(makeLonger > 0 && n % makeLonger == 0)
                    offset -= graph.r / 40

                var angle = (270/360/2),
                    fullAngle = graph.opts.angle / 360,
                    graphAngle = graph.opts.angle,
                    val =  n / (graph.stepsY),
                    angle = (val+(1-(graphAngle/360))*360/graphAngle)*fullAngle - (1-graph.opts.angle/360) % 1,
                    p = graph.D.pointOnCircleWithAngleFromCenter(graph.r + offset, angle);

                if(angle > 0.75){
                    p = graph.D.pointOnCircleWithAngleFromCenter(graph.r + offset, 0.75 % 1);
                    p1 = graph.D.pointOnCircleWithAngleFromCenter(graph.r + offset, angle % 1);

                    p.x = p.x + p1.x
                    p.y = p.y + p1.y

                    positions.push(new graph.PointAngle(
                        new R.Point(
                            graph.getMidX() + p.x,
                            p.y + graph.D.config.paddingTop - offset
                            )
                        ,
                        angle)
                    )
                }
                else{
                    positions.push(new graph.PointAngle(
                        new R.Point(
                            graph.getMidX() + p.x,
                            p.y + graph.D.config.paddingTop - offset
                            )
                        ,
                        angle)
                    )
                }

            }
            return positions
        }

        function valueToHighestScore(value){

            total += value

            nTotal++

            if(value > score.s)
                score = {s:value, index:take}
        }

        function onBtnStopClick(){

            var mean = total / nTotal

            score.mean = round(mean, 1);

            scores.push(score)

            score = {s:0, index:0, mean:0}

            nTotal = 0

            total = 0

            mode = 0

            applyScores()

            var btn = document.querySelector('#btnStop')
            btn.classList.add('grayed')

            var btn = document.querySelector('#btnStart')
            btn.classList.remove('grayed')
        }

        function onBtnStartClick(){

            mode = 1

            take++

            var btn = document.querySelector('#btnStart')
            btn.classList.add('grayed')

            var btn = document.querySelector('#btnStop')
            btn.classList.remove('grayed')
        }

        function applyScores(){

            clearList();

            scores = sortScores(scores)

            scores.forEach( (s, n) => {
                formatLi(s.s, s.mean, s.index)
            })

        }

        function formatLi(score, mean, index){

            var li = document.createElement('li')

            for(var c = 0; c < 3; c++){
                var spn = document.createElement('span')
                if(c == 0)
                    spn.innerHTML = index + ' : '
                else if(c == 1)
                    spn.innerHTML = score + '&nbsp;'
                else if(c == 2){
                    spn.classList.add('red')
                    spn.innerHTML = '(' + mean + ')'
                }
                li.appendChild(spn)
            }

            var ul = document.querySelector('#scores')
            if(ul)
                ul.appendChild(li)
        }

        function clearList(){
            document.querySelector("#scores").innerHTML = ''
        }

        function sortScores(scores){
            if(sortProp == 1){
                scores.sort( (a, b) => {
                    if(a.mean <= b.mean)
                        return 1
                    else if(a.mean > b.mean)
                        return -1
                })
            }
            else{
                scores.sort( (a, b) => {
                    if(a.s <= b.s)
                        return 1
                    else if(a.s > b.s)
                        return -1
                })
            }
            return scores
        }

        function round(number, decimals){
            var fact = Math.pow(10, decimals)
            return Math.floor(number * fact + 0.5) / fact
        }

        init()
        if(graphMode == 0)
            initGauge()
        else
            initColumns()
        onPopState()

})