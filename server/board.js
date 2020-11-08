var Map = require('./map_tiles');
var Utils = require('./utils');
var Piste = require('./piste');
var Player = require('./player');

var Decks = require('./decks')
/*
cell:
-> cerbere
-> effect associated with the cell
-> number of treason cards to receive if you get caught here

special effects: piloti, portals, bridges, are described after

bridge: {
    connectedCells : [index],
    intact: true
}

portals: {
    connectedCells: [index],
    activator: index,
    activated: bool
}

The first cell, "l'Antre de cerbère", is not considered a cell (so it would be "cell -1")
*/

/*
Competitor : {
    id : coincides with Player/Socket id,
    pion: ,
    status: "alive", "dead", "out",
    action_cards: [],
    hero_cards: [],
    position: ,
}
*/

/*
map {
    cells: the array of cells
    start: cell where players start
    unveil : cell where barks are unveiled
    pilotis : [idx] corresponding to pilotis
    bridges : 
    portals:
}
*/

/*
 *
 * @param: addCellsPiste is the number of cells that are more than the number of pawns (2 in original game)
 *         players: arrays of effective players
 */
var Board = function(addCellsPiste, players) {
    var self = {
        map: undefined,
        piste: undefined,
        list_pions: undefined,

        barks: [1,2,3],
        barks_unveiled: false,
        pos_cerbere: -1, // Antre de Cerbère

        competitors: [],

        activePlayer: 0,
        pending_effects: [],
        pending_costs: [],

    }   

    self.map = Map.genNewMap();

    if(self.map == undefined) return undefined;

    self.list_pions = Player.listColors;

    players.forEach(function(player){
        self.competitors.push({
            id: player.id,
            pion: player.pion,
            status: "alive",
            action_cards: [],
            // Here : initialization of action decks
            hero_cards : Decks.createAdventurerDeck(),
            position: self.map.start,
        });
    });

    self.deadOutPions = function() {
        var res = list_pions.slice();
        this.competitors.forEach(function(compet){
            if(compet.status == "alive") {
                var idx = res.indexOf(compet.pion);
                res.splice(idx, 1);
            }
        });
        return res;
    }

    self.piste = Piste.newPiste(self.list_pions.length + addCellsPiste, self.deadOutPions().length);

    //we shuffle the barks
    Utils.suffle(self.barks);

    /* returns an array of competitors ids on a cell*/
    self.getPlayersByPos = function(pos) {
        if(pos < 0 || pos >= this.map.cells.length) return [];
        var res = [];
        this.competitors.forEach(function(compet){
            if(compet.pos == pos) res.push(compet.id);
        });
        return res;
    };

    /*return an array of possible next cells.
      takes param : competitor: the concerned competitor, and direction : should be "forward" or "back"
    */
    self.checkPossibleNextCells = function(competitor, direction) {

        if(direction != "forward" && direction != "back") return undefined;
        var pos = competitor.pos;
        var res = [];
        // TODO : return if we can jump in bark ?

        /* the next cell is possible if 
           - it is on the board
           - if it is on a piloti, then there's no player on it
        */
        if(pos < this.map.cells.length - 1 && direction == "forward" && !(this.map.pilotis.includes(pos + 1) && this.getPlayersByPos(pos+1).length > 0)) {
            res.push(pos+1);
        }

    }

    // TODO :
    /* 
     * - playerDrawCard, playerDiscardCard
     * - advancePlayer, backPlayer : bouge les joueurs. Prend aussi une case en entrée ! (car potentiellement plusieurs choix)
     * - checkPossibleNextCells : vérifie quelles sont les prochaines cases pour un joueur
     * - checkCost : vérifie si un coût est "payable" (en prenant en compte qu'on peut donner des cartes aux joueurs)
     * - apply effect : applique effectivement un effet, relativement à un joueur
     * - hunt
     */

    // we elect the initial player at random
    self.activePlayer = Math.floor(Math.random() * competitors.length);

    return self;
}