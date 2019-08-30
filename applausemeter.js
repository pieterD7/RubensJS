requirejs([
    'util/uri',
    'rubensjs/types',
    'rubensjs/OBJ/gauge'], function(URI, R, G){

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

        function onPopState(){

            var val = new URI.URI().uri.split(",")

            val = parseFloat(val[0])

            var score = ((val - graph.D.reachMinY) /
                (graph.D.reachMaxY - graph.D.reachMinY)) * 80

            score = round(score, 1)

            if(mode == 1)
                valueToHighestScore(score)

            var data = [{
                label:null,
                row:0,
                data:[
                    {to:val}]
                }
            ]

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
        onPopState()

})