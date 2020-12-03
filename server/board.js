var Map = require('./map_tiles');
var Utils = require('./utils');
var Piste = require('./piste');
var Player = require('./player');

var Decks = require('./decks')

Array.prototype.rotate = (function() {
    // save references to array functions to make lookup faster
    var push = Array.prototype.push,
        splice = Array.prototype.splice;

    return function(count) {
        var len = this.length >>> 0, // convert to uint
            count = count >> 0; // convert to int

        // convert count to value in range [0, len)
        count = ((count % len) + len) % len;

        // use splice.call() instead of this.splice() to make function generic
        push.apply(this, splice.call(this, 0, count));
        return this;
    };
})();

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
}

The first cell, "l'Antre de cerbère", is not considered a cell (so it would be "cell -1")
*/

/*
Competitor : {
    id : coincides with Player/Socket id,
    socket: ,
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
 *          
 * @param number_non_cerberable_players: from this number of players, captured players don't benefit from Cebere's mercy -> dead
 *                                       default: should be 2
 */

// TODO: décrire le système d'états ici ?

var Board = function(addCellsPiste, players, socket_list, number_non_cerberable_players) {
    var self = {
        init_props: {addCellsPiste: addCellsPiste, players: players, socket_list: socket_list, number_non_cerberable_players: number_non_cerberable_players},
        
        map: undefined,
        piste: undefined,
        list_pions: undefined,

        barks: [1,2,3],
        barks_unveiled: false,
        pos_cerbere: -1, // Antre de Cerbère

        competitors: [],
    }   

    self.map = Map.genNewMap();

    if(self.map == undefined) return undefined;

    self.list_pions = Player.listColors;

    players.forEach(function(player){
        self.competitors.push({
            id: player.id,
            socket: socket_list[player.id],
            pseudo : player.pseudo,
            pion: player.pion,
            status: "alive",
            action_cards: [],
            // Here : initialization of action decks
            hero_cards : Decks.createAdventurerDeck(),
            position: self.map.start,
        });
    });

    self.deadOutPions = function() {
        var res = self.list_pions.slice();
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
    Utils.shuffle(self.barks);

    /* returns an array of competitors ids on a cell*/
    self.getPlayersByPos = function(pos) {
        if(pos < 0 || pos >= this.map.cells.length) return [];
        var res = [];
        this.competitors.forEach(function(compet){
            if(compet.position == pos && compet.status == "alive") res.push(compet);
        });
        return res;
    };

    self.findAvailableActionByIdx = function(playerIdx, cardIdx) {
        if(self.competitors[playerIdx] == undefined) return undefined;
        let res = undefined;
        self.competitors[playerIdx].action_cards.forEach(function(card, idxCard){
            card.effects.forEach(function(effect){
                if(cardIdx == effect.idx) res = {
                    card: card,
                    effect: effect,
                    idxCard: idxCard,
                }
            });
        });

        return res;
    }

    /*return an array of possible next cells.
      takes param : competitor: the concerned competitor, and direction : should be "forward" or "back"
    */
    self.checkPossibleNextCells = function(competitor, direction) {

        if(direction != "forward" && direction != "back") return undefined;
        var pos = competitor.position;
        var res = [];
        // TODO : return if we can jump in bark ?

        console.log("checkPossibleNextCells, player at pos "+pos+" direction "+ direction);

        /* the next cell is possible if 
           - it is on the board (or it is the bark)
           - if it is on a piloti, then there's no player on it
        */
        if(pos < self.map.cells.length && direction == "forward" && !(self.map.pilotis.includes(pos + 1) && self.getPlayersByPos(pos+1).length > 0)) {
            res.push(pos+1);
        }
        if(pos > 0 && direction == "back" && !(self.map.pilotis.includes(pos - 1) && self.getPlayersByPos(pos-1).length > 0)) {
            res.push(pos-1);
        }

        self.map.bridges.forEach(function(bridge){
            if(bridge.intact && bridge.connectedCells.includes(pos)) {
                var remainCells = bridge.connectedCells.slice();
                var idxPos = remainCells.indexOf(pos);
                remainCells.splice(idxPos, 1);

                res.concat(remainCells);
            }
        });

        self.map.portals.forEach(function(portal){
            let playersOnActivor = self.getPlayersByPos(portal.activator);
            if(playersOnActivor.length > 0 && portal.connectedCells.includes(pos)) {
                var remainCells = portal.connectedCells.slice();
                var idxPos = remainCells.indexOf(pos);
                remainCells.splice(idxPos, 1);

                res.concat(remainCells);
            }
        });

        return res;
    }

    self.findCompetIdxById = function(id_play) {
        let playIdx = -1;
        self.competitors.forEach(function(compet, idx){
            if(compet != undefined && compet.id == id_play) playIdx = idx;
        });
        return playIdx;
    }

    self.findCompetIdxByPseudo = function(pseudo_compet) {
        let playIdx = -1;
        self.competitors.forEach(function(compet, idx){
            if(compet != undefined && compet.pseudo == pseudo_compet) playIdx = idx;
        });
        return playIdx;
    }

    self.playerDrawActionCard = function(playIdx) {
        if(playIdx < 0) {
            console.log("Warning : playerDrawCard player not found");
            return;
        }
        let compet = self.competitors[playIdx];
        let new_card;
        if(compet.status == "alive") {
            new_card = Decks.drawSurvivalCard();
        } else if (compet.status == "cerbere") {
            new_card = Decks.drawTreasonCard();
        } else {
            console.log("Warning : playerDrawCard player neither alive nor cerbere tries to draw");
            return;
        }
        if(new_card == undefined) {
            console.log("TODO : handle draw when empty deck");
            return;
        }
        compet.action_cards.push(new_card);
    }

    self.playerDiscardActionCard = function(competIdx, card, idxCard) {
        let compet = self.competitors[competIdx];
        if(compet == undefined) {
            console.log("Warning : playerDiscardCard player not found");
            return;
        }
        
        if(compet.status == "alive") {Decks.discardSurvivalCard(card);}
        else if(compet.status == "cerbere") {Decks.discardTreasonCard(card);}
        else {console.log("discard card from neither alive nor cerbere ?");}
        compet.action_cards.splice(idxCard, 1); 
    }

    self.playerCollectHeroCards = function(competIdx) {
        if(competIdx == -1) {
            console.log("Warning : playerCollectHeroCards player not found");
            return;
        }
        let compet = self.competitors[competIdx];
        compet.hero_cards.collectCards(); 
    }

    self.playerDiscardHeroCard = function(competIdx, idx_card) {
        let compet = self.competitors[competIdx];
        if(compet == undefined) {
            console.log("Warning : playerDiscardHeroCard player not found");
            return;
        }
        let availableCards = compet.hero_cards.getAvailable();
        let card_idx = -1;
        availableCards.forEach(function(card,idx){
            if(card != undefined && card.idx == idx_card) card_idx = idx;
        });
        if(card_idx == -1) {
            console.log("Warning : playerDiscardHeroCard card not found among availables");
            return;
        }
        compet.hero_cards.discardCard(availableCards[card_idx]);
    }

    // argument : active_player_idx is the idx of the active_player
    self.targetToListOfPlayers = function(active_player_idx, target) {
        //let activeCompet = self.competitors[active_player_idx];
        let res = [];
        switch (target) {
            case "self":
                res = [active_player_idx];
                break;
        
            case "all other adventurers":
            case "any adventurer":
                self.competitors.forEach(function(compet, idx){
                    if(compet.status == "alive") res.push(idx);
                });
                break;

            case "any cerbere":
                self.competitors.forEach(function(compet, idx){
                    if(compet.status == "cerbere") res.push(idx);
                });
                break;

            case "other adventurer":
                self.competitors.forEach(function(compet, idx){
                    if(compet.status == "alive" && idx != active_player_idx) res.push(idx);
                });
                break;

            case "other cerbere":
                self.competitors.forEach(function(compet, idx){
                    if(compet.status == "cerbere" && idx != active_player_idx) res.push(idx);
                });
                break;
            

            // eg "cerbere"
            default:
                break;
        }
        return res;
    }
    // TODO :
    /* 
     * - OK advancePlayer, backPlayer : bouge les joueurs. Prend aussi une case en entrée ! (car potentiellement plusieurs choix)
     * - checkCost : vérifie si un coût est "payable" (en prenant en compte qu'on peut donner des cartes aux joueurs)
     * - apply effect : applique effectivement un effet, relativement à un joueur
     * - OK kill player (! update piste !)
     * - OK hunt
     * 
     * - update functions for client !
     */

    /*
     ok we could at least check general effects...
     so for now, this function just checks general effects
     */
    self.checkCost = function(activeCompet, cost) {
        if(activeCompet == undefined || cost == undefined) return false;
        cost.generalEffects.forEach(function(genEffect){
            // "collect cards", "bark" (not even really costs...), "hunt", "advance dice" are always possible
            if(genEffect != undefined) {
                switch (genEffect.effect) {
                    case "augment dice":
                        if(!self.piste.checkAugmentDice(genEffect.addData)) return false;
                        break;
                
                    case "reduce dice":
                        if(!self.piste.checkReduceDice(genEffect.addData)) return false;
                        break;

                    case "back dice":
                        if(!self.piste.checkBackDice(genEffect.addData)) return false;
                        break;
                    default:
                        break;
                }
            }
        });
        return true;
    }

    self.applyEffect = function(activeCompet, effect, targeted, additional) {
        if(!targeted) {
            switch (effect) {
                case "hunt":
                    self.triggerHunt();
                    break;
                
                case "collect actions":
                    self.playerCollectHeroCards(activeCompet);
                    break;

                case "augment dice":
                    self.piste.augmentDice();
                    break;

                case "reduce dice":
                    self.piste.reduceDice();
                    break;

                case "back dice":
                    self.piste.backDice();
                    break;

                case "advance dice":
                    if(self.piste.advanceDice() != undefined) self.triggerHunt();
                    break;

                case "bark":
                    if(additional.barkEffect == undefined || (additional.barkEffect == "transpose" && additional.barkValue == undefined)) {
                        console.log("Warning : bad value for applyEffect bark: ");
                        console.log(additional);
                        return undefined;
                    } else {
                        if(additional.barkEffect == "see") {
                            let idx = additional.barkValue;
                            if(idx < 0 || idx >= this.barks.length) {
                                console.log("Warning : bad value for applyEffect barkValue: ");
                                console.log(additional.barkValue);
                                return undefined;
                            }
                            return self.barks[idx];
                        } else if (additional.barkEffect == "transpose") {
                            let idx1 = additional.barkValue[0];
                            let idx2 = additional.barkValue[1];
                            if(self.barks[idx1] != undefined && self.barks[idx2] != undefined) {
                                let temp = self.barks[idx1];
                                self.barks[idx1] = self.barks[idx2];
                                self.barks[idx2] = temp;
                            }
                        } else {
                            console.log("Warning : bad value for applyEffect barkEffect: ");
                            console.log(additional.barkEffect);
                        }
                    }
                    break;
            
                default:
                    break;
            }
        } else {
            let targetIdx;
            let target;
            let cellNumber;
            switch (effect) {
                case "draw survival":
                    targetIdx = additional.targetIdx;
                    target = self.competitors[targetIdx];
                    if(target == undefined || target.status != "alive") {
                        console.log("draw survival applyEffect");
                        return;
                    }
                    self.playerDrawActionCard(targetIdx);
                    break;

                case "draw treason":
                    targetIdx = additional.targetIdx;
                    target = self.competitors[targetIdx];
                    if(target == undefined || target.status != "cerbere") {
                        console.log("draw treason applyEffect");
                        return;
                    }
                    self.playerDrawActionCard(targetIdx);
                    break;

                
                case "step forward":
                    targetIdx = additional.targetIdx;
                    cellNumber = additional.cellNumber;
                    if(targetIdx < 0) {
                        //then we decided it was interpreted as Cerbere
                        self.moveCerbere(cellNumber);
                        break;
                    }
                    target = self.competitors[targetIdx];
                    if(target == undefined) {
                        console.log("apply effect step forward: unknown player idx "+ targetIdx);
                        return;
                    }
                    self.playerStepForward(target, cellNumber);
                    break;

                case "step back":
                    targetIdx = additional.targetIdx;
                    cellNumber = additional.cellNumber;
                    if(targetIdx < 0) {
                        //then we decided it was interpreted as Cerbere
                        self.moveCerbere(cellNumber);
                        break;
                    }
                    target = self.competitors[targetIdx];
                    if(target == undefined) {
                        console.log("apply effect step back: unknown player idx "+ targetIdx);
                        return;
                    }
                    self.playerStepBack(target, cellNumber);
                    break;
            
                default:
                    break;
            }
        }
    }

    // this function should be called when a players triggers a cell
    self.handleCellSpecifics = function(oldPosition, cellNumber) {
        //handle unveil
        if(self.map.unveil == cellNumber) {
            if(!self.unveiled) {
                self.barks_unveiled = true;
                self.barks = [self.barks[0]];
            }
        }
        for(let i=0; i<self.map.bridges.length; i++) {
            let bridge = self.map.bridges[i];
            if(bridge.connectedCells.includes(oldPosition) && bridge.connectedCells.includes(cellNumber)) {
                bridge.intact = false;
            }
        }
    }

    // returns yes if captured by cerbere.
    self.playerStepForward = function(compet, nextCell) {
        // we just check... theorically, useless, but hey my code's not perfect
        if(!self.checkPossibleNextCells(compet, "forward").includes(nextCell)) return false;
        let oldPos = compet.position;
        compet.position = nextCell;
        // - is on cerbere ? if yes, stop here
        if(compet.position == self.pos_cerbere) {
            self.capturePlayer(compet);
            return true;
        }
        self.handleCellSpecifics(oldPos, nextCell);
        return false;
        // - trigger effect ? NOP : here, we don't know if you STOP on this cell -> should be handled higher level  
    }

    self.playerStepBack = function(compet, nextCell) {
        if(!self.checkPossibleNextCells(compet, "back").includes(nextCell)) return false;
        let oldPos = compet.position;
        compet.position = nextCell;
        // - is on cerbere ? if yes, stop here
        if(compet.position == self.pos_cerbere) {
            self.capturePlayer(compet);
            return true;
        }
        self.handleCellSpecifics(oldPos, nextCell);
        return false;
    }

    self.numberPlayersAlive = function () {
        let res = 0;
        self.competitors.forEach(function (compet) {
            if (compet != undefined && compet.status == "alive") res++;
        });
        return res;
    }

    self.moveCerbere = function(number) {
        if(number == 0) return;
        let step = (number>0)? 1 : -1;
        let numberabs = (number>0)? number : -number;
        for(let i=0; i<numberabs; i++) {
            if((!(step > 0 && self.pos_cerbere >= self.map.cells.length - 1)) && !(step < 0 && self.pos_cerbere <= 0)) self.pos_cerbere += step;
            //check for players on this cell
            let playersOnCell = self.getPlayersByPos(self.pos_cerbere);
            if(playersOnCell.length > 0) {

                //we capture them
                Utils.shuffle(playersOnCell);
                playersOnCell.forEach(function(captured){
                    self.capturePlayer(captured);
                });
                //we back cerbere to the last point
                if(self.pos_cerbere > 0) self.pos_cerbere--;
                while(self.pos_cerbere > 0 && !self.map.cells[self.pos_cerbere].cerbere) self.pos_cerbere--;
                // we reset the dice
                self.piste.resetDice();
                // I think we stop cerbere here
                break;
            }
        }
    }

    /*
    Should be called when a player is captured. It places it on the piste, and changes its status
    */
    self.capturePlayer = function(compet) {
        if(compet != undefined && compet.status == "alive") {
            
            self.piste.reduceSlopeSize();

            if(self.numberPlayersAlive() > number_non_cerberable_players) {
                compet.status = "cerbere";
                compet.hero_cards = Decks.createCerbereDeck();
                //we discard its remaining survival cards
                compet.action_cards.forEach(function(survival){
                    Decks.discardSurvivalCard(survival);
                });
                compet.action_cards.length = 0;
                // and we add treason cards
                for(let i=0; i<self.map.cells[compet.position].treason; i++) {
                    let treason_card = Decks.drawTreasonCard();
                    if(treason_card != undefined) {
                        compet.action_cards.push(treason_card);
                    }
                }
            }
            else
                compet.status = "dead";
        }
    }

    /*
     * triggers hunt, if necessary capture players, updates dice if necessary and moves Cerbere
     */

    self.triggerHunt = function() {
        let numberMaxSteps = self.piste.dice.current;
        let captured = false;
        for(let i=1; i<=numberMaxSteps; i++) {
            //si on peut avancer, on le fait
            if(self.pos_cerbere < self.map.cells.length)
                self.pos_cerbere++;

            let capturedPlayers = self.getPlayersByPos(self.pos_cerbere);
            if(capturedPlayers.length > 0) {
                captured = true;

                Utils.shuffle(capturedPlayers);
                capturedPlayers.forEach(function(capturedPlayer){
                    self.capturePlayer(capturedPlayer);
                });
                // we don't want to go further
                break;
            }
        }

        if(captured) {
            //we step back of at least one cell (if we're not on the first cell)
            if(self.pos_cerbere > 0) self.pos_cerbere--;
            while(self.pos_cerbere > 0 && !self.map.cells[self.pos_cerbere].cerbere) self.pos_cerbere--;
            // we reset the dice
            self.piste.resetDice();
        } else {
            //we augment the dice (if possible)
            self.piste.augmentDice();
        }
    }


    self.emitToAll = function(command, data) {
        self.competitors.forEach(function(compet){
            if(compet != undefined) {
                compet.socket.emit(command, data);
            }
        });
    }

     /*
      * UPDATE FUNCTIONS
      * ================
      * updateListPlayers      OK
      * updatePiste            OK
      * updateMap              OK
      * updatePendingEffects   OK
      * updateBarks            OK
      * updateDeck             OK
      * 
      * au niveau au dessus : updateCancelCard, updateActionSkipable, updatePlayersHoverable, updateEffectsHoverable, updateChoseCell...
      */

    self.updateMap = function() {
        let cells = self.map.cells.map(function(cell, index) {
            let compets_here = self.getPlayersByPos(index);
            return({
                players: compets_here.map((compet) => (compet.pion.name)),
                cerbere: cell.cerbere,
            });
        });

        self.emitToAll('updateMap', {cells: cells, pos_cerbere: self.pos_cerbere, unveil: self.map.unveil, pilotis: self.map.pilotis,
                                        portals: self.map.portals, bridges: self.map.bridges});
    }

    self.updatePendingEffects = function(active_compet, pendingEffects) {
        active_compet.socket.emit('updatePendingEffects', pendingEffects);
    }

    self.updateDeckCards = function(compet) {
        compet.socket.emit('updatePsgCards', compet.hero_cards.getAvailable());
        compet.socket.emit('updateActionCards', compet.action_cards);
    }

    self.updateBarks = function() {
        // data should be interpreted, if unveiled, as the bark, otherwise as the number of (hidden) barks
        if (self.barks_unveiled) {
            self.emitToAll('updateBarks', {
                unveiled: true,
                data: self.barks[0]
            });
        } else {
            self.emitToAll('updateBarks', {
                unveiled: false,
                data: self.barks.length
            });
        }
    }

    self.updateListPlayers = function() {
        let sockets = [];
        let players_to_send = [];
        // we do all this thing to send a list beginning by the active player
        self.competitors.forEach(function(compet){
            if(compet != undefined) {
                sockets.push(compet.socket);
                players_to_send.push({couleur: compet.pion.name, pseudo: compet.pseudo, state: compet.status});
            }
        });

        for(let i=0; i<sockets.length; i++) {
            sockets[0].emit('updateListPlayers', players_to_send);
            sockets.rotate(1);
            players_to_send.rotate(1);
        }
    }

    self.updatePiste = function() {
        let pawns_colors = self.deadOutPions().map ((pion) => (pion.name));
        self.emitToAll('updatePiste',{
            pawns: pawns_colors, size: self.piste.actual_size ,dice: {pos: self.piste.dice.position, val: self.piste.dice.current}
        });
    }

      /*
       * ===============
       *  END OF UPDATE
       */

    return self;
}

// *********************************
// *        handle of copy         *
// *********************************

var getCopyCompet = function(compet) {
    var new_compet = {
        id: compet.id,
        socket: compet.socket,
        pseudo: compet.pseudo,
        pion: compet.pion,
        status: compet.status,
        action_cards: compet.action_cards.slice(),
        hero_cards: Decks.copyHeroDeck(compet.hero_cards),
        position: compet.position,
    }
    return new_compet;
}

// can't be used as it

var getCopyBoard = function(board) {

    var new_board = Board(board.init_props.addCellsPiste, board.init_props.players, board.init_props.socket_list, board.init_props.number_non_cerberable_players);
    
    new_board.map = Map.copyMap(board.map);
    new_board.piste = Piste.copyPiste(board.piste);
    new_board.list_pions = board.list_pions.slice();

    new_board.barks = board.barks.slice();
    new_board.barks_unveiled = board.barks_unveiled;
    new_board.pos_cerbere = board.pos_cerbere;

    new_board.competitors = board.competitors.map((compet) => (getCopyCompet(compet)));

    new_board.copiedDeck = Decks.getCopyState();

    

    return new_board;
}

// returns void, it changes the state of
var restoreCopyBoard = function(copy) {
    Decks.restoreCopyState(copy.copiedDeck);
}


// *******************************
// *           EXPORTS           *
// *******************************

exports.board = Board;
exports.getCopyBoard = getCopyBoard;
exports.restoreCopyBoard = restoreCopyBoard;