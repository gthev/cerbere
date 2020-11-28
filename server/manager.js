var Board = require('./board')
var Utils = require('./utils')

/*
    list of correct status of the manager when it receives a socket message
 */
var validMessagesWrtStatus = {
    "selectedPsgCard" : ["waitingPsgChoose"],
    "selectedActionCard" : ["waitingDiscardCost", "waitingActionChoose"],
    "selectedPendingEffect": ["waitingPendingEffect", "waitingPendingCost"],
    "selectedPlayer": ["waitingSelectedPlayer"],
    "selectedMapCell": ["waitingSelectedMapCell"],
    "skipAction": ["waitingActionChoose"],
    "clickSeeBark": ["waitingBarksActionChoose"],
    "clickTransposeBark": ["waitingBarksActionChoose"],
    "selectedBark": ["waitingSelectedSeeBark", "waitingSelectedTransposeBark1", "waitingSelectedTransposeBark2"],
    "cancelActiveEffect": ["waitingDiscardCost", "waitingPendingEffect", "waitingPendingCost"],
}
var isEffectEmpty = function(effect) {
    return (effect.targetEffects.length + effect.generalEffects.length == 0);
}

var emptyEffect = function() {
    return {targetEffects: [], generalEffects: []};
}


var Manager = function(addCellsPiste, players, socket_list, number_non_cerberable_players) {

    var self = {
        board: Board.board(addCellsPiste, players, socket_list, number_non_cerberable_players),
        activePlayer: 0,
        //currentEffectAlreadySelected: [],
        status: "waitingPsgChoose",

        current_subeffect: undefined,
        bark_already_selected: [],
        targeted: false,
        target_selected: -1,
        turnPosition: 0,
        pending_effects: undefined,
        pending_costs: undefined,
        // TODO : handle cancel, /!\ restore deck ?
        // this sould be a complete and deep copy of the board (compets, piste,...) + DECKS
        save_cancel : undefined,
    }

    self.checkCorrectStatus = function(message) {
        if(message in validMessagesWrtStatus) {
            return (validMessagesWrtStatus[message].includes(self.status));
        } else {
            return false;
        }
    }

    // ****************************************
    // *            HANDLE SAVES              *
    // ****************************************

    // SHOULD BE CALLED DURING ACT CHOOSE OR PSG CHOOSE
    self.saveState = function() {
        if(self.status != "waitingPsgChoose" && self.status != "waitingActionChoose") {
            console.log("Warning : save state called during state "+self.status);
        }
        var save = {
            board: Board.getCopyBoard(self.board),
            activePlayer: self.activePlayer,
            status: self.status,

            current_subeffect: undefined,
            bark_already_selected: self.bark_already_selected.slice(),
            targeted: self.targeted,
            target_selected: self.target_selected,
            turnPosition: self.turnPosition,
            pending_effects: undefined,
            pending_costs: undefined,
            save_cancel: undefined,
        }

        self.save_cancel = save;
    }

    self.restoreSave = function() {

        var save = self.save_cancel;
        Board.restoreCopyBoard(save.board);
        self.board = save.board;
        self.activePlayer = save.activePlayer;
        self.status = save.status;

        self.current_subeffect = save.current_subeffect;
        self.bark_already_selected = save.bark_already_selected;
        self.targeted = save.targeted;
        self.target_selected = save.target_selected;
        self.turnPosition = save.turnPosition;
        self.pending_effects = save.pending_effects;
        self.pending_costs = save.pending_costs;
        self.save_cancel = save.save_cancel;

        // here : update everything for everyone. Branch on state to know what to hoverable

        self.reinitHoverable();
        self.updateComponents();
        self.board.emitToAll("updatePendingEffects", emptyEffect());

        if(self.status == "waitingPsgChoose") {
            self.board.competitors[self.activePlayer].socket.emit('updatePsgHoverable', true);
        } else if (self.status == "waitingActionChoose") {
            self.board.competitors[self.activePlayer].socket.emit('updateActionHoverable', true);
        } else {
            console.log("restore with suspiscious status");
        }
    }

    //=============================
    self.bindAllCompets = function(message, reaction) {
        self.board.competitors.forEach(function(compet, competIdx){
            if(compet != undefined) {
                compet.socket.on(message, ((data) => reaction(data, competIdx)));
            }
        });
    };

    //===================================================
    //================= CHAT FUNCTIONS ==================
    //===================================================

    self.alertPlayer = function(competIdx, message) {
        if(self.board.competitors[competIdx] != undefined) {
            self.board.competitors[competIdx].socket.emit('displayAlertMessage', message);
        } else {
            console.log("Alert player : competIdx undefined "+ competIdx);;
        }
    }

    self.alertAllPlayers = function(message) {
        self.board.competitors.forEach(function(compet, competIdx){
            self.alertPlayer(competIdx, message);
        });
    }

    //===================================================
    //================= BARK HANDLING ===================
    //===================================================

    self.triggerBarkChoose = function() {
        if(self.board.barks_unveiled) return false;
        self.reinitHoverable();
        self.changeStatus("waitingBarksActionChoose");
        self.board.competitors[self.activePlayer].socket.emit("updateSeeButton", true);
        self.board.competitors[self.activePlayer].socket.emit("updateTransposeButton", true);
        return true;
    }

    //===================================================
    //=========== SPECIFIC UPDATE FUNCTIONS =============
    //===================================================

    self.reinitHoverable = function() {
        self.board.emitToAll('updateHoverablePendingEffects', false);
        self.board.emitToAll('updatePsgHoverable', false);
        self.board.emitToAll('updateActionHoverable', false);
        self.board.emitToAll('updateSkipable', false);
        self.board.emitToAll('updateListPlayersHoverable', false);
        self.board.emitToAll('updateSeeButton', false);
        self.board.emitToAll('updateTransposeButton', false);
        self.board.emitToAll('updateHoverableBarks', []);
        self.board.emitToAll('updateMapHighlighted', []);
        self.board.emitToAll('updateCancelActive', false);
        self.board.emitToAll('updateHoverablePendingEffects', false);
    }

    self.updateComponents = function() {
        self.board.updateListPlayers();
        self.board.updatePiste();
        self.board.updateMap();
        self.board.updateBarks();
        self.board.competitors.forEach(function(compet){self.board.updateDeckCards(compet)});
    }

    self.changeStatus = function(new_status) {
        console.log("New status : "+new_status);
        self.status = new_status;
    }

    //===============================================
    //========== HANDLE CHANGES OF STATE ============
    //===============================================

    self.changeStateSelectPlayer = function() {
        self.alertPlayer(self.activePlayer, "Merci de sélectionner un joueur à qui appliquer l'effet dans la liste.");
        self.reinitHoverable();
        self.changeStatus('waitingSelectedPlayer');
        self.board.competitors[self.activePlayer].socket.emit('updateListPlayersHoverable', true);
    }

    //===============================================
    //========= TRIGGERS PENDING EFFECT/COST =========
    //===============================================
    self.triggersPendingEffect = function() {
        console.log("triggers pending effect");
        self.reinitHoverable();
        self.changeStatus("waitingPendingEffect");
        let competActive = self.board.competitors[self.activePlayer];
        competActive.socket.emit('updatePendingEffects', self.pending_effects);
        competActive.socket.emit('updateHoverablePendingEffects', true);
        competActive.socket.emit('updateCancelActive', true);
    }

    self.triggersPendingCost = function() {
        console.log("triggers pending effect");
        self.reinitHoverable();
        self.changeStatus("waitingPendingCost");
        let competActive = self.board.competitors[self.activePlayer];
        competActive.socket.emit('updatePendingEffects', self.pending_costs);
        competActive.socket.emit('updateHoverablePendingEffects', true);
        competActive.socket.emit('updateCancelActive', true);
    }

    //===============================================
    //==== WHEN THE PLAYER SELECTS A NEW EFFECT =====
    //===============================================
    //assumed for active player
    self.handleNewEffect = function(effect) {
        old_status = self.status;
        //TODO : handle check cost effect
        self.pending_costs = Utils.copyEffect(effect.cost);

        //we can at least try that
        if(!self.board.checkCost(self.activePlayer, self.pending_costs)) {
            console.log("Effect refused due to cost impossibility");
            return false;
        }

        self.pending_effects = Utils.copyEffect(effect.effect);

        console.log(effect);

        // we assume there's only one discard cost
        let idx_discard = -1;
        self.pending_costs.targetEffects.forEach(function(subeffect, idx){
            if(subeffect.effect == "discard") idx_discard = idx;
        });

        self.reinitHoverable();

        if(idx_discard >= 0) {
            //we pay this cost first
            self.changeStatus("waitingDiscardCost");
            let discard_cost = self.pending_costs.targetEffects[idx_discard];
            //we remove it from the pending costs list
            self.pending_costs.targetEffects.splice(idx_discard, 1);
            self.target = self.board.targetToListOfPlayers(self.activePlayer, discard_cost.target);
            self.effectAddLeft = discard_cost.addData;

            if(self.target == [] || self.effectAddLeft <= 0) {
                console.log("Warning discard card cost");
                return;
            }

            self.alertPlayer(self.activePlayer, "Vous devez payer "+self.effectAddLeft+" cartes action pour jouer cet effet.");
            self.board.competitors[self.activePlayer].socket.emit("updateCancelActive", true);

            //we update the hoverable properties
            self.board.competitors.forEach(function(compet, idx){
                if(compet == undefined) return;
                compet.socket.emit('updatePsgHoverable', false);
                if(self.target.includes(idx)) {
                    compet.socket.emit('updateActionHoverable', true);
                } else {
                    compet.socket.emit('updateActionHoverable', false);
                }
            });

        } else if (!isEffectEmpty(self.pending_effects)) {

            self.triggersPendingEffect();

        } else {
            console.log("Warning empty effect ?")
            return false;
        }
        return true;
    }

    //=====================================================
    //============ APPLY TARGETED EFFECT ==================
    //=====================================================

    self.whenTargetSelected = function(targetIdx, effect) {
        let target = self.board.competitors[targetIdx];
        if(target == undefined) {
            console.log("whenTargetSelected, unknown target Idx : "+targetIdx);
            return;
        }
        switch (effect) {
            case "draw survival":
                self.effectAddLeft = self.current_subeffect.addData;
                if(target.status != "alive") {
                    console.log("whenTargetSelected, trying to draw survival for non alive player");
                    return;
                }
                while(self.effectAddLeft > 0) {
                    self.board.applyEffect(self.activePlayer, "draw survival", true, {targetIdx: targetIdx});
                    self.effectAddLeft--;
                }
                self.handleSubEffectDone();
                break;

            case "draw treason":
                self.effectAddLeft = self.current_subeffect.addData;
                if(target.status != "cerbere") {
                    console.log("whenTargetSelected, trying to draw treason for non cerbere player");
                    return;
                }
                while(self.effectAddLeft > 0) {
                    self.board.applyEffect(self.activePlayer, "draw survival", true, {targetIdx: targetIdx});
                    self.effectAddLeft--;
                }
                self.handleSubEffectDone();
                break;

            case "step forward":
            case "step back":
                self.target_selected = targetIdx;
                let mapCellsPotential = self.board.checkPossibleNextCells(target, (effect == "step forward")? "forward" : "back");

                //if none is available : do something else douche
                if(mapCellsPotential.length == 0) {
                    self.alertPlayer(self.activePlayer, "Ce joueur n'a aucune case où aller. Sélectionnez en un autre.");
                    return;
                }

                self.reinitHoverable();
                self.changeStatus("waitingSelectedMapCell");
                console.log("highlighted : "+mapCellsPotential);
                self.alertPlayer(self.activePlayer, "Sélectionnez la case où aller.");
                self.board.competitors[self.activePlayer].socket.emit('updateMapHighlighted', mapCellsPotential);
                break;
        
            default:
                console.log("whenTargetSelected : unknown effect "+effect);
                break;
        }

        self.updateComponents();
    }

    //=====================================================
    //============ WHEN A SUBEFFECT IS FINISHED ===========
    //=====================================================
    self.handleSubEffectDone = function() {
        /*
         check the turn, and if empty, continue as expected
         */

        // but first, we reinitialize all hoverable
        self.reinitHoverable();
        self.updateComponents();
        
         //TODO : check if the state is right ? maybe ?
        if(isEffectEmpty(self.pending_effects)) {
            if(isEffectEmpty(self.pending_costs)) {

               // we have to change state
               // if we were at turn 1, we go at turn 2 and pending effect, else the turn is finished
                if(self.turnPosition == 1) {

                    self.board.competitors[self.activePlayer].socket.emit('updatePendingEffects', {targetEffects: [], generalEffects: []});
                    self.changeStatus("waitingActionChoose");
                    self.board.competitors[self.activePlayer].socket.emit("updateActionHoverable", true);
                    self.board.competitors[self.activePlayer].socket.emit("updateSkipable", true); 

                } else if (self.turnPosition == 2) {

                    self.board.competitors[self.activePlayer].socket.emit('updatePendingEffects', {targetEffects: [], generalEffects: []});
                    self.changeStatus("waitingPsgChoose");
                    self.activePlayer = (self.activePlayer+1) % (self.board.competitors.length);
                    self.alertPlayer(self.activePlayer, "A vous de jouer !");
                    self.board.competitors[self.activePlayer].socket.emit("updatePsgHoverable", true);

                } else {
                    console.log("Warning : handleSubEffectDone with turn position : "+self.turnPosition);
                }
            } else {
                self.triggersPendingCost();
            }
        } else {
            self.triggersPendingEffect();
        }

        self.updateComponents();
    }

    //==========================================
    /*
     * Now we begin the fun part : THE AUTOMATA
     */
    //==========================================

    self.bindAllCompets('selectedPsgCard', function(idxCard, competIdx) {
        // we check if we were expecting a psg card to be selected...
        if(!self.checkCorrectStatus('selectedPsgCard')) return;
        // ... from this player
        if(self.board.competitors[competIdx] == undefined) return;
        if(competIdx != self.activePlayer) return;

        console.log("Selected Psg Card !");

        // we search for the selected effet
        let compet = self.board.competitors[competIdx];
        let selectedEffect = compet.hero_cards.findAvailableEffectByIdx(idxCard);

        //if we didn't find it
        if(selectedEffect == undefined) return;

        // we save the state before changing anything
        self.saveState();

        self.turnPosition = 1;
        if(!self.handleNewEffect(selectedEffect.effect)) return;
        compet.hero_cards.discardCard(selectedEffect.card);

        self.updateComponents();
    });

    self.bindAllCompets('selectedActionCard', function(idxCard, competIdx) {
        if(!self.checkCorrectStatus('selectedActionCard')) return;
        let compet = self.board.competitors[competIdx];
        if(compet == undefined) return;

        switch (self.status) {
            case 'waitingDiscardCost':
                if(self.board.competitors[competIdx] == undefined) return;
                if(!self.target.includes(competIdx)) return;

                let discarded_card = self.board.findAvailableActionByIdx(competIdx, idxCard);
                if(discarded_card == undefined) return;

                // dans l'ordre : on discard la carte, on descend le nombre de cartes à payer, et si c'est bon, on passe aux effets
                self.board.playerDiscardActionCard(competIdx, discarded_card.card, discarded_card.idxCard);

                self.effectAddLeft--;

                if(self.effectAddLeft <= 0) {
                    //we deactive the action hoverable to every one
                    self.board.emitToAll('updateActionHoverable', false);
                    self.triggersPendingEffect();
                }

                break;

            case 'waitingActionChoose':
                // we check that it's from the player we were expecting
                let compet = self.board.competitors[competIdx];
                if(self.activePlayer != competIdx || compet == undefined) {
                    console.log("Warning : received waitngActionChoose from incorrect player " + competIdx);
                    return;
                }

                let selected_effect = self.board.findAvailableActionByIdx(competIdx, idxCard);

                if(selected_effect == undefined) return;

                // we also save the state
                self.saveState();

                self.turnPosition = 2;
                self.board.emitToAll('updateActionHoverable', false);
                if(!self.handleNewEffect(selected_effect.effect)) return;
                self.board.playerDiscardActionCard(competIdx, selected_effect.card, selected_effect.idxCard);
                break;
        
            default:
                console.log("Warning : selectedActionCard : status not handled");
                break;
        }

        self.updateComponents();
    });

    /*
     even more fun part lol
    */

    self.bindAllCompets('selectedPendingEffect', function(effectInfo, competIdx){
        console.log("Selected Pending Effect!")
        if(!self.checkCorrectStatus('selectedPendingEffect')) return;
        let compet = self.board.competitors[competIdx];
        if(compet == undefined) return;
        // only the active player can select a pending effect, right ?
        if(self.activePlayer != competIdx) return;

        switch (self.status) {
            case 'waitingPendingEffect':
            case 'waitingPendingCost':
                let targeted = effectInfo.targeted;
                let effectIdx = effectInfo.idx;
                let selEffect;
                let pending_list = (self.status == "waitingPendingCost")? self.pending_costs: self.pending_effects;
                self.targeted = targeted;

                if(targeted) {
                    selEffect = pending_list.targetEffects[effectIdx];
                    if(selEffect == undefined) {
                        console.log("Warning : selected undefined pending effect");
                        return;
                    }

                    self.current_subeffect = {target: selEffect.target, effect: selEffect.effect, addData: selEffect.addData};

                    pending_list.targetEffects.splice(effectIdx, 1);

                    switch (self.current_subeffect.effect) {
                        case "step forward":
                        case "step back":
                        case "draw survival":
                        case "draw treason":
                            self.effectAddLeft = self.current_subeffect.addData;

                            // we want the player to select someone
                            if(self.current_subeffect.target == "self") {
                                //we go directly to effect application

                                self.whenTargetSelected(competIdx, self.current_subeffect.effect);

                            } else if(self.current_subeffect.target == "cerbere"){
                                // TODO :handle : only step forward/back ! 

                                let theEffect = self.current_subeffect.effect;
                                if(theEffect == "step forward" || theEffect == "step back") {
                                    let numberSteps = self.current_subeffect.addData;
                                    if(theEffect == "step back") numberSteps *= -1;
                                    self.board.applyEffect(self.active_player, theEffect, true, {targetIdx: -1, cellNumber: numberSteps});
                                    self.handleSubEffectDone();
                                } else {
                                    console.log("selectedPendingEffect: unknown effect associated with cerbere : "+theEffect);
                                    return;
                                }

                            } else {
                                self.changeStateSelectPlayer();
                            }
                            break;
                    
                        case "discard":
                            console.log(" selectedPendingEffect : discard not handled, shouldn't happen actually, I think (at least for now)");
                            //sorry for wat im about todo
                            poiuytreza = 1; // so that the server crashes... TODO : change it later
                            break;

                        default:
                            break;
                    }

                //handle choose of psg
                } else {
                    selEffect = pending_list.generalEffects[effectIdx];
                    if(selEffect == undefined) {
                        console.log("Warning : selected undefined pending effect");
                        return;
                    }

                    self.current_subeffect = {effect: selEffect.effect, addData: selEffect.addData};
                    self.effectAddLeft = selEffect.addData;

                    pending_list.generalEffects.splice(effectIdx, 1);

                    switch (self.current_subeffect.effect) {
                        case "hunt":
                        case "collect actions":
                            self.board.applyEffect(self.activePlayer, self.current_subeffect.effect, false, undefined);
                            self.handleSubEffectDone();
                            break;

                        case "advance dice":
                        case "back dice":
                        case "augment dice":
                        case "reduce dice":
                            self.effectAddLeft = self.current_subeffect.addData;
                            while(self.effectAddLeft > 0) {
                                self.board.applyEffect(self.activePlayer, self.current_subeffect.effect, false, undefined);
                                self.effectAddLeft--;
                            }
                            self.handleSubEffectDone();
                            break;

                        case "bark":
                            if(!self.triggerBarkChoose()) {
                                //it means that the barks are already unveiled
                                self.alertPlayer(self.activePlayer, "Les barques sont déjà révélées");
                                break;
                            }
                            break;

                        default:
                            console.log("selectedPendingEffect: don't know this subeffect : "+self.current_subeffect.effect);
                            break;
                    }
                }
                break;
        
            default:
                console.log("Warning : selectedPendingEffect : status not handled");
                break;
        }
        self.updateComponents();
    });

    self.bindAllCompets('selectedPlayer', function(pseudo, competIdx){
        if(!self.checkCorrectStatus('selectedPlayer')) return;

        let selectedIdx = self.board.findCompetIdxByPseudo(pseudo);
        if(selectedIdx < 0) {
            console.log("Could not find player by pseudo in 'selectedPlayer' handler.");
            return;
        }

        switch (self.status) {
            case "waitingSelectedPlayer":
                // check, to avoid making errors
                if(!self.targeted) {
                    console.log("Warning : waitingSelectedPlayer but no expected targeted");
                    return;
                }
                if(self.current_subeffect == undefined) {
                    console.log("Warning : waitingSelectedPlayer but no current subeffect");
                    return;
                }
                // let's go
                let candidates = self.board.targetToListOfPlayers(self.activePlayer, self.current_subeffect.target);
                if(!candidates.includes(selectedIdx)) {
                    self.alertPlayer(competIdx, "Vous ne pouvez pas sélectionner ce joueur. Recommencez plz.");
                    return;
                }

                self.whenTargetSelected(selectedIdx, self.current_subeffect.effect);

                break;
        
            default:
                console.log("Warning : 'selectedPlayer' handler failed because of unhandled status");
                break;
        }

        self.updateComponents();
    });

    self.bindAllCompets('selectedMapCell', function(cellNumber, competIdx){
        if(!self.checkCorrectStatus('selectedMapCell')) return;
        if(self.board.competitors[competIdx] == undefined) return;
        if(competIdx != self.activePlayer) return;

        console.log("Selected Map Cell");

        let targetIdx = self.target_selected;

        self.board.applyEffect(self.active_player, self.current_subeffect.effect, true, {targetIdx: targetIdx, cellNumber: cellNumber});

        self.effectAddLeft--;
        if(self.effectAddLeft > 0) {
            self.whenTargetSelected(targetIdx, self.current_subeffect.effect);
        } else {
            self.handleSubEffectDone();
        }

        self.updateComponents();
    });

    self.bindAllCompets('skipAction', function(unused, competIdx){

        if(!self.checkCorrectStatus('skipAction')) return;
        if(self.board.competitors[competIdx] == undefined) return;
        if(competIdx != self.activePlayer) return;

        self.pending_effects = emptyEffect();
        self.pending_costs = emptyEffect();
        self.turnPosition = 2;
        self.handleSubEffectDone();
    });

    self.bindAllCompets('cancelActiveEffect', function(unused, competIdx){
        if(!self.checkCorrectStatus('cancelActiveEffect')) return;
        if(self.board.competitors[competIdx] == undefined) return;
        if(competIdx != self.activePlayer) return;

        self.restoreSave();
    });

    //=============================================================
    //======================= BIND FOR BARKS ======================
    //=============================================================
    self.bindAllCompets('clickSeeBark', function(unused, competIdx){

        if(!self.checkCorrectStatus('clickSeeBark')) return;
        if(competIdx != self.activePlayer) return;

        let compet = self.board.competitors[competIdx];
        if(compet == undefined) return;

        self.reinitHoverable();
        compet.socket.emit("updateHoverableBarks", Utils.rangeArray(self.board.barks.length));
        self.alertPlayer(self.activePlayer, "Merci de sélectionner la barque à dévoiler.");
        self.changeStatus("waitingSelectedSeeBark");
    });

    //======================================================================
    self.bindAllCompets('clickTransposeBark', function(unused, competIdx){
        if(!self.checkCorrectStatus('clickTransposeBark')) return;
        if(competIdx != self.activePlayer) return;

        let compet = self.board.competitors[competIdx];
        if(compet == undefined) return;

        self.reinitHoverable();
        compet.socket.emit("updateHoverableBarks", Utils.rangeArray(self.board.barks.length));
        self.alertPlayer(self.activePlayer, "Merci de sélectionner les barques à échanger.");
        self.changeStatus("waitingSelectedTransposeBark1");
    });

    //==================================================================
    self.bindAllCompets('selectedBark', function(numberBark, competIdx){
        if(!self.checkCorrectStatus('selectedBark')) return;
        if(competIdx != self.activePlayer) return;

        let compet = self.board.competitors[competIdx];
        if(compet == undefined) return;

        if(!Utils.rangeArray(self.board.barks.length).includes(numberBark)) {
            console.log("Bark out of bound");
            return;
        }

        switch (self.status) {
            case "waitingSelectedSeeBark":
                self.reinitHoverable();
                let barkRoom = self.board.applyEffect(self.activePlayer, self.current_subeffect.effect, false, {barkEffect: "see", barkValue: numberBark});
                self.alertPlayer(self.activePlayer, "La barque sélectionnée a "+barkRoom+" "+((barkRoom > 1)? "places" : "place"));
                self.handleSubEffectDone();
                break;

            case "waitingSelectedTransposeBark1":
                self.bark_already_selected.push(numberBark);
                let barksLeft = Utils.rangeArray(self.board.barks.length);
                let idxToRemove = barksLeft.indexOf(numberBark);
                if(idxToRemove<0) {
                    console.log("Warning waitingSelectedTransposeBark1 : idx bark not found");
                    self.bark_already_selected = [];
                    return;
                }
                barksLeft.splice(idxToRemove, 1);
                self.reinitHoverable();
                compet.socket.emit("updateHoverableBarks", barksLeft);
                self.alertPlayer(self.activePlayer, "Sélectionnez-en une seconde.");
                self.changeStatus("waitingSelectedTransposeBark2");
                break;

            case "waitingSelectedTransposeBark2":
                self.bark_already_selected.push(numberBark);
                
                self.board.applyEffect(self.activePlayer, self.current_subeffect.effect, false, {barkEffect: "transpose", barkValue: self.bark_already_selected});
                self.alertAllPlayers("Les barques "+self.bark_already_selected[0]+" et "+self.bark_already_selected[1]+" ont été échangées.");

                self.bark_already_selected = [];
                self.handleSubEffectDone();
                break;
        
            default:
                break;
        }
        self.updateComponents();
    });

    
    
    // we choose the first player at random
    self.activePlayer = Math.floor( Math.random() * players.length );

    // FOR DEBUG PURPOSE
    self.board.playerDrawActionCard(self.activePlayer);
    self.board.playerDrawActionCard(self.activePlayer);
    self.board.playerDrawActionCard(self.activePlayer);
    //init :

    //=============================
    // update everything at first
    self.board.updateListPlayers();
    self.board.updatePiste();
    self.board.updateMap();
    self.board.updateBarks();
    self.board.competitors.forEach(function(compet){self.board.updateDeckCards(compet)});

    self.board.competitors[self.activePlayer].socket.emit('updatePsgHoverable', true);

    return self;
};

// *********************************
// *           EXPORTS             *
// *********************************

exports.newGame = Manager;