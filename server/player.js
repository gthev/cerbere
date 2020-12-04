const number_max = 7

// *********************
// *       PIONS       *
// *********************

var colors = [
    {
        name: "red",
        rgb: "(255,0,0)"
    },
    {
        name: "orange",
        rgb: "(255,165,0)"
    },
    {
        name: "khaki",
        rgb: "(255,255,255)"
    },
    {
        name: "turquoise",
        rgb: "(64,224,208)"
    },
    {
        name: "indigo",
        rgb: "(75,0,130)"
    },
    {
        name: "lawngreen",
        rgb: "(124,252,0)"
    },
    {
        name: "hotpink",
        rgb: "(255,105,180)"
    }
];

var PionManager = function() {
    var self = {
        number_pions: 0,
        number_max: 7,
        used: [],
        available: colors.slice()
    };

    self.init = function() {
        this.number_max = number_max;
        this.number_pions = 0;
        this.used = [];
        this.available = colors.slice();
    };

    self.newPion = function() {
        if(this.number_pions < this.number_max) {
            this.number_pions += 1;
            var pion = this.available.shift();
            this.used.unshift(pion);
            return pion;
        } else {
            //if no more is available...
            return undefined;
        }
    }

    self.deletePion = function(pion) {
        var k=-1;
        var counter = 0;
        //we search for the element
        this.used.forEach(function(un_pion){
            if(un_pion == pion) {
                k = counter;
            }
            counter++;
        });
        //if we found it, we delete it
        if(k>=0) {
            this.used.splice(k,1)
            this.available.push(pion);
            this.number_pions--;
        }
    }

    return self;
}

var Pions = PionManager();
Pions.init();

exports.pions = Pions;

// ********************
// *     JOUEURS      *
// ********************

var Player = function(pseudo_joueur, socket_id) {
    var self = {
        pion: undefined,
        pseudo: pseudo_joueur,
        id: socket_id,
    };

    self.init = function() {
        this.pion = Pions.newPion()
        if (this.pion == undefined) {
            return false;
        } else {
            return true;
        }
    };

    self.destruct = function() {
        if(this.pion != undefined) {
            Pions.deletePion(this.pion);
        }
    }

    return self;
}

exports.new_player = Player;
exports.getPlayerColor = function(player) {
    if(player == undefined) return undefined;
    if(player.pion == undefined) {
        return undefined;
    } else {
        return player.pion.name;
    }
}

exports.numberMaxPlayers = number_max;
exports.listColors = colors.slice();
