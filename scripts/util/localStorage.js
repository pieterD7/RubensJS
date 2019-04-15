
// Save and retrieve JSON encoded and AES encrypted strings in localStorage
// All strings should represent arrays of objects
// Encryption always occurs. If password is not entered and ok is clicked the password
// is set to a space.

define(['util/localStorage'], function(){

    function crypto(){

        return{
            encrypt: function(msg, pass){
                return CryptoJS.AES.encrypt(msg, pass)
            },

            decrypt: function(msg, pass){
                return CryptoJS.AES.decrypt(msg, pass)
            }
        };
    }

    function myPrompt(msg, cb){

        return new Promise(function(resolve){

            function onClick(){

                var passPhrase = document.querySelector("input[name=password]").value;

                if(!passPhrase || passPhrase == "")
                    passPhrase = " ";

                if(typeof cb == 'function'){
                    document.querySelector('.dialogue').style.display = 'none'
                    cb(passPhrase);

                    // Clear to avoid running more then once
                    cb = null;

                    resolve();
                }
            }

            document.querySelector(".loginError").style.display = 'none';

            document.querySelector('.dialogue .msg').innerHTML = msg;
            document.querySelector('.dialogue input').value = "";

            document.querySelector('.dialogue').style.display = 'block';
            document.querySelector('.dialogue input').focus();
            document.querySelector('.dialogue input').click();

            // removeEventListener() doesn't work. As a result entering passphrase twice
            // will trigger the onclick twice the second time. We solve this with the .then()
            // part of the promise. The callback may run many times but this shouldn't harm.
            // The .then() part will only run once;
            document.querySelector('.dialogue .ok').removeEventListener('click', onClick);
            document.querySelector('.dialogue .ok').addEventListener('click', onClick);
        })

    }

    // Static variable for all module instances
    // To bypass the passphrase dialog set this to a non-empty string
    var passPhrase = null;

    if(typeof medicontact !== 'undefined')
        passPhrase = " ";

    // Each value object has a t for matching and an s property for the value
    function LS(){

        this.value = null;
        this.error = false;

        return {
            call: function(key, cb){

                // Do not call cb() if some error
                if(this.error || ! this.value) return;

                // Return value should be an array
                if(key){
                    cb(  this.value[key] || []);
                }
                // Return value is object
                else
                    cb(this.value);
            },

            parse: function(){
                try{
                    if(typeof  this.value != 'object')
                        this.value = JSON.parse( this.value);
                    if(typeof  this.value != 'object')
                        this.value = JSON.parse( this.value);
                }
                catch(error){
                    throw("Unable to parse data as JSON.");
                    this.error = true;
                }
            },

            decrypt: function(passPhrase, v){
                if(passPhrase && v){
                    try{
                        var v2 = new crypto().decrypt(v, passPhrase);
                        this.value = v2.toString(CryptoJS.enc.Utf8);
                    }
                    catch(error){
                        throw("Unable to parse data as UTF-8");
                        this.value = null;
                        this.error = true;
                    }
                }
                else
                    this.value = "{}";
            },

            _getItems: function(v, key, passPhrase2, cb){
                try{
                    this.decrypt(passPhrase2, v);
                    this.parse();
                    this.call(key, cb);
                }
                catch(error){
                    // Trigger the prompt again
                    passPhrase = null;
                    document.querySelector(".loginError").style.display = 'block';
                    document.querySelector('.no-data').style.display = 'none';
                }
            },

            getItems: function(key, cb){
                var my = this;
                this.error = false;
                if(localStorage){
                    var v = localStorage.getItem("key");
                    if(v && !passPhrase){
                        myPrompt('Enter your passphrase', function(p){

                            passPhrase = p;
                        })
                        .then(function(){
                            my._getItems(v, key, passPhrase, cb);
                        });
                    }
                    else if(v && passPhrase)
                        my._getItems(v, key, passPhrase, cb);
                    else if(!v){
                        this.value = {};
                        this.call(key, cb);
                    }
                }
            },

            _setItems: function(key, value){
                var keyItems = null,
                    my = this;
                this.getItems(null, function(k){
                    keyItems = k;
                    if(typeof value != 'undefined' && value && ! my.error){
                        keyItems[key] = value;
                        keyItems = new crypto().encrypt(JSON.stringify(keyItems), passPhrase)
                        localStorage.setItem("key", keyItems);
                        return true;
                    }
                });
            },

            setItems: function(key, value){
                var my = this;
                this.error = false;
                if(localStorage){

                    if(!passPhrase){
                        myPrompt('Choose your passphrase', function(p){

                            passPhrase = p;
                        })
                        .then(function(){
                            if(passPhrase)
                                my._setItems(key, value);
                        })
                    }
                    else
                        my._setItems(key, value);
                }
            },

            getMatchingKeys: function(key, match /* regExp */, cb){
                var matchingKeys = [];
                this.getItems(key, function(value){
                    if(value.length && value.length > 0){
                        value.forEach(function(item){
                            if(item.t.match(new RegExp(match)))
                                matchingKeys.push(item);
                        })
                    if(typeof cb == 'function')
                        cb(matchingKeys);
                    }
                });
            },

            updateItem: function(key, newItem, property){
                var my = this;

                if(!property)
                    property = 't';

                this.getItems(key, function(s){
                    var saved = s || []

                    // Update item if exists
                    var found = false;
                    for(var c = 0; c < saved.length; c++){
                        if(saved[c][property].match(newItem[property]))
                        {
                            found = true;
                            if(newItem.s != null){
                                saved[c].s = newItem.s;
                            }
                            else{
                                // Remove item
                                saved.splice(c,1);
                            }
                        }
                    }

                    // Add item if it doesn't exist
                    if(!found && newItem.s)
                        saved.push(newItem);

                    my.setItems(key, saved);
                });
            },

            removeItems: function(key, keys, property){
                var my = this;

                if(!property)
                    property = 't';

                this.getItems(key, function(s){

                    var saved = s || [];
                    keys.forEach(function(k){

                        saved.forEach(function(ss, n){
                            if(ss[property] == k){
                                saved.splice(n, 1);
                            }
                        })
                    })
                    my.setItems(key, saved);
                })
            }
        }
    }

    return{
        LS:LS
    }
})
