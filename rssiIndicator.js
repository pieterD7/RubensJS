requirejs([
    'util/uri',
    'rubensjs/types',
    'rubensjs/OBJ/rssiIndicator'], function(URI, R, L){

        window.addEventListener('popstate', onPopState);

        var indi = new L.RssiIndicator("rssiIndicator")

        indi.init({
            paddingLeft:0,
            paddingRight:0,
            paddingTop:0,
            paddingBottom:0,
            padding:0,
            marksYLength:0,
            halfFontXHeight:0,
            opts: {
                dir:1,
                mode:0
            }
        })

        indi.setRange(new R.Range(0,5,0,120));

        function onPopState(){

            var val = new URI.URI().uri

            indi.setData(parseInt(val))

            indi.invalidate()

            indi.drawData()
        }

        onPopState()

})