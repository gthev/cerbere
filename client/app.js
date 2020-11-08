;
jQuery(function($){

    //chat log should be changed when the game begins
    var cache = {
        gameArea: $("#gameArea"),
        logScreen: $("#loginScreen").html(),
        prepScreen: $("#preparationScreen").html(),
        runningGame: $("#runningGame").html(),
        chatLog: null,
        chatInput: null,
        chatForm: null,
    }

    var IO = {
        init: function() {
            IO.socket = io.connect();
            IO.bindEvents();
        },

        bindEvents: function() {
            IO.socket.on('displayGeneralMessage', this.displayGeneralMessage);
            IO.socket.on('displayAlertMessage', this.displayAlertMessage);
            IO.socket.on('invalidLog', this.invalidLog);
            IO.socket.on('enterPrep', this.enterPrep);
            IO.socket.on('displayWhisper', this.displayWhisper);
        },

        displayGeneralMessage: function(data) {
            console.log("display");
            cache.chatLog.innerHTML += '<div><span style=\"font-weight:bold;color: '+data.color+';\">'+data.pseudo+': </span>'+data.text+'</div>';
        },

        displayWhisper: function(data) {
            cache.chatLog.innerHTML += '<div><span style=\"font-style: italic\">'+data+'</span></div>';
        },

        displayAlertMessage: function(data) {
            cache.chatLog.innerHTML += '<div><span style=\"color: red;\">'+data+'</span></div>';
        },

        invalidLog: function(data){
            var invalidDiv = document.getElementById("invalidPasswd");
            invalidDiv.innerHTML = data;
        },

        enterPrep: function() {
            console.log("entering prep");
            Prep.init();
        },
    }

    var Login = {
        init: function() {
            cache.gameArea.html(cache.logScreen);

            console.log("hi");

            var logForm = document.getElementById("loginForm");
            var logPasswd = document.getElementById("logPasswd");
            var logPseudo = document.getElementById("logPseudo");

            logForm.onsubmit = function(e) {
                e.preventDefault();

                var data = {
                    passwd: logPasswd.value,
                    pseudo: logPseudo.value
                };

                IO.socket.emit('log-try', data);
            }

        }
    }

    var bindChat = function() {
        cache.chatForm.onsubmit = function(e) {
            e.preventDefault();
            var input = cache.chatInput.value;
            if(input[0] == '[') {

                var tokens = input.split(']', 2);

                console.log(tokens);

                if(tokens.length > 1) {
                    var dest = tokens[0];
                    dest = dest.substring(1); //removes the first '['
                    var message = tokens[1];
                    if(message[0] == ' ') {
                        message = message.substring(1);
                    } 

                    if(dest[0] == ' ') {
                        dest = dest.substring(1);
                    }
                    if(dest[dest.length - 1] == ' ') {
                        dest = dest.slice(0,-1);
                    }

                    //console.log('|'+dest+'| : ('+message+')');

                    IO.socket.emit('sendPrivateMessage', {dest: dest, text: message});

                } else {
                    IO.socket.emit('sendGeneralMessage', input);
                }
                
            } else if(input[0] == '/') {
                
                IO.socket.emit('reqDebug', input.substring(1));

            } else {
                IO.socket.emit('sendGeneralMessage', cache.chatInput.value);
            }
            
            cache.chatInput.value = "";
        }
    }

    var Prep = {
        init : function() {
            cache.gameArea.html(cache.prepScreen);
            cache.chatLog = document.getElementById("chatLogPrep");
            cache.chatInput = document.getElementById("chatInputPrep");
            cache.chatForm = document.getElementById("chatFormPrep");

            //init of input handling
            bindChat();

            IO.socket.emit('enteredPrep', {});
        }
    }

    IO.init();
    Login.init();

}($));