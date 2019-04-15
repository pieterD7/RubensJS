define(function(){
    return {
        URI: function (str){

            var h = document.location.hash || "",
                str = str || decodeURIComponent(h.replace("#", "")),
                U = this;

            this.y = null;
            this.unit = "";
            this.uri = "";

            // Function to see some pages as the same page id
            // for the pullLines plugin
            this.getCurrentPage = function(){
                return U.uri.replace("all", "").toLowerCase();
            }

            this.str = str;
            this.parts = null;

            this.parts = this.str.replace(/;.*/, "").split(":");
            if(this.parts.length > 0)
            {
               this.uri = this.parts[0];

               if(this.parts.length > 1)
                   this.y = this.parts[1];
            }

            this.parts = this.str.split(";");
            if(this.parts.length > 1)
               this.unit = this.parts[1];
        }
   }
})