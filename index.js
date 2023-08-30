/*
Copyright (C) 2020 Gaspard Thévenon

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

var express = require('express');
var app = express();
var serv = require('http').Server(app);

var utils = require('./server/utils')
//for now, maybe we'll change it later
var play = require('./server/player');
var Game = require('./server/manager');
var Debug = require('./server/debug');


//************
//*   DEBUG  *
//************
let DEBUG = false;
let passwd = (DEBUG) ? "pample" : utils.gen_passwd();

let verbose = 0;

Debug.setDebug(verbose);

// *********************
// * STARTUP OF SERVER *
// *********************
app.get('/',function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

app.use('/client' , express.static(__dirname + '/client'));

serv.listen(5555);

console.log('Server started');
console.log('Password : '+passwd);

// *********************
// *  LIST OF PLAYERS  *
// *********************

var SOCK_IDS = [];
var SOCKET_LIST = {};
var PLAYERS = {};

var isGameRunning = false;

let GameManager;

function findIdByPseudo(pseudo) {
    var id = undefined;
    SOCK_IDS.forEach(function(le_id) {
        if(PLAYERS[le_id] != undefined) {
            if(PLAYERS[le_id].pseudo == pseudo) {
                id = le_id
            }
        }
    });

    return id;
}

const io = require('socket.io')(serv, {
    cors: {
        origin: "http://localhost:8100",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true
});

// ***************************
// *      SOCKET EVENTS      *
// ***************************
io.sockets.on('connection', function(socket){
    

    //=======================================
    // Just for debug in dev, remove it later
    if(DEBUG) {

        if(SOCK_IDS.length < 3) {

            SOCK_IDS.push(socket.id);
            SOCKET_LIST[socket.id] = socket;

            chatInit(socket);

            const pseudoTest = ["mathilde", "jack", "jo", "gwen", "alex", "tif", "mailys"];
            var count = 0;
            SOCK_IDS.forEach(function(id){
                if(PLAYERS[id] != undefined) count++;
            });
            var player = play.new_player(pseudoTest[count], socket.id);
            if(!player.init()) return;
            PLAYERS[socket.id] = player;
            
            if(SOCK_IDS.length == 3) {
                SOCK_IDS.forEach(function(id){
                    if(PLAYERS[id] != undefined) {
                        SOCKET_LIST[id].emit('beginGame');
                    }
                });
                GameManager = Game.newGame(2, SOCK_IDS.map((id) => (PLAYERS[id])), SOCKET_LIST, 2);
            }

        }
        
        return;
    };
    //=======================================


    //say hi when entering preparation room, and probably other things later
    socket.on('enteredPrep', function() {
        socket.emit('displayAlertMessage', "Bienvenue dans la salle de préparation.");
    });

    socket.on('log-try', function(data) {
        if(data.passwd == passwd) {

            if(findIdByPseudo(data.pseudo) != undefined) {
                console.log("pseudo deja pris");
                socket.emit('invalidLog', "Pseudo déjà pris");
                return;
            }

            var player = play.new_player(data.pseudo, socket.id);
            if(!player.init()) {
                socket.emit('invalidLog', "Nombre maximum de joueurs dans le salon");
                return;
            }

            if(isGameRunning) {
                socket.emit('invalidLog', "La partie est déjà en cours");
                return;
            }

            SOCK_IDS.forEach(function(id){
                if(PLAYERS[id] != undefined) {
                    SOCKET_LIST[id].emit('displayAlertMessage', data.pseudo+' a rejoint le salon.');
                }
            });

            SOCK_IDS.push(socket.id);
            SOCKET_LIST[socket.id] = socket;            

            PLAYERS[socket.id] = player;
            socket.emit('enterPrep', (SOCK_IDS.length == 1));

            chatInit(socket);

        } else {
            console.log("Invalid password");
            socket.emit('invalidLog', "Mot de passe invalide.");
        }
    });


    // ************************************
    // *          GAME START              *
    // ************************************

    var numberPlayers = function() {
        let count = 0;
        SOCK_IDS.forEach(function(id){
            if(PLAYERS[id] != undefined) count++;
        });
        return count;
    }

    socket.on('askBeginGame', function() {
        if(socket.id == SOCK_IDS[0]) {
            if(numberPlayers() >= 3) {
                SOCK_IDS.forEach(function(id){
                    if(PLAYERS[id] != undefined) {
                        SOCKET_LIST[id].emit('beginGame');
                    }
                });
                GameManager = Game.newGame(2, SOCK_IDS.map((id) => (PLAYERS[id])), SOCKET_LIST, 2);
                isGameRunning = true;
            } else {
                // not enough players
                socket.emit("displayAlertMessage", "Il faut au moins trois joueurs pour commencer le jeu.");
            }
        }
    });

    socket.on('disconnect', function() {
        //clean up, do things
        var idx_id = SOCK_IDS.indexOf(this.id);
        if(idx_id == -1) {
            console.log("not found");
            return;
        }
        SOCK_IDS.splice(idx_id, 1);
        if(PLAYERS[socket.id] != undefined) PLAYERS[socket.id].destruct();
        //delete in players ?
        PLAYERS[socket.id] = undefined;
        SOCKET_LIST[socket.id] = undefined;
    });

    console.log('Connection initialized');
});



// *****************
// *   CHAT INIT   *
// *****************

var chatInit = function(socket) {

    socket.on('sendGeneralMessage', function(data){

        Debug.showDebug("Message received: " + data);

        var sender = PLAYERS[socket.id];
        var color = play.getPlayerColor(PLAYERS[socket.id]);

        if(sender != undefined && color != undefined) {
            SOCK_IDS.forEach(function(id){
                if(PLAYERS[id] != undefined) {
                    SOCKET_LIST[id].emit('displayGeneralMessage', {pseudo: sender.pseudo, text: data, color: color});
                }
            });
        }; 
    });

    socket.on('sendPrivateMessage', function(data) {
        var sender = PLAYERS[socket.id];
        
        var dest_pseudo = data.dest;
        var message = data.text;
        var dest_id = findIdByPseudo(dest_pseudo);

        if(dest_id == undefined) {
            socket.emit('displayAlertMessage', "Je ne connais pas de "+dest_pseudo);
            return;
        }

        dest = PLAYERS[dest_id];

        if(sender != undefined && dest != undefined && message != undefined) {
            var sender_pseudo = sender.pseudo;
            var pm = sender_pseudo+"->"+dest_pseudo+": "+message;
            var general = sender_pseudo+" a chuchoté quelque chose à "+dest_pseudo+"...";

            SOCK_IDS.forEach(function(id){
                if(id == dest_id) {
                    SOCKET_LIST[id].emit("displayWhisper", pm);
                } else if(id == socket.id) {
                    SOCKET_LIST[id].emit("displayWhisper", pm);
                } else {
                    if(PLAYERS[id] != undefined) {
                        SOCKET_LIST[id].emit("displayWhisper", general);
                    }
                }
            });

        }
    });

    socket.on('reqDebug', function(data){
        if(!DEBUG) return;
        var res = eval(data);
        Debug.showDebug('DEBUG REQUEST:');
        Debug.showDebug(data);
        //socket.emit('displayAlertMessage', res)
    });
}
