requirejs([
    'util/uri',
    'rubensjs/types',
    'rubensjs/OBJ/measurementStatus',
    'rubensjs/colors'], function(URI, R, L, C){

        window.addEventListener('popstate', onPopState);

        var indi = new L.MeasurementStatus("measurementStatus")

        indi.init({
            paddingLeft:100,
            paddingRight:0,
            paddingTop:0,
            paddingBottom:0,
            padding:0,
            halfFontXHeight:-4,
            opts: {
                displayText:true
            }
        })

        function onPopState(){

            var val = new URI.URI().uri,
                vals = val.split("&");

            val = vals[0];

            if(vals[1] && vals[1] == 'bar')
                indi.opts.displayText = false
            else
                indi.opts.displayText = true

            indi.setData(parseInt(val))

            indi.invalidate()

            indi.drawData()
        }

        onPopState()

})