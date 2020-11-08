var Cards = require("./cards");
var Utils = require("./utils")

const deckSurvivalComposition = {
    "Sacrifice": 4,
    "Favoritisme": 4,
}

const deckTreasonComposition = {
    "Embuscade": 4,
}

var SurvivalDeck = [];
var TreasonDeck = [];

var SurvivalDiscards = [];
var TreasonDiscards = [];

// *******************************
// *   INITIALISATION OF DECKS   *
// *******************************

var initDecks = function() {
    SurvivalDiscards = [];
    TreasonDiscards = [];

    // we fill the Survival Deck
    for (var survival_name in deckSurvivalComposition) {
        if (deckSurvivalComposition.hasOwnProperty(survival_name)) {           
            for(var i = 0; i < deckSurvivalComposition[survival_name]; i++) {
                var new_card = Cards.createSurvival();
                if(new_card != undefined) SurvivalDeck.push(new_card);
            }
        }
    }

    // idem for Treason Deck
    for (var treason_name in deckTreasonComposition) {
        if (deckTreasonComposition.hasOwnProperty(treason_name)) {           
            for(var i = 0; i < deckTreasonComposition[treason_name]; i++) {
                var new_card = Cards.createTreason();
                if(new_card != undefined) TreasonDeck.push(new_card);
            }
        }
    }

    // and now, shuff----fle
    Utils.shuffle(SurvivalDeck);
    Utils.shuffle(TreasonDeck);

    //okay I suppose
}

// ****************************************************
// *     EXPORTED FUNCTIONS TO DRAW/DISCARD CARDS     *
// ****************************************************

// this function empties the Discards of survival, and put everything in the Deck
var shuffleSurvival = function () {
    SurvivalDiscards.forEach(function(card) {
        SurvivalDeck.push(card);
    });
    // we emtpy it
    SurvivalDeck.length = 0;

    Utils.suffle(SurvivalDeck);
};

var shuffleTreason = function () {
    TreasonDiscards.forEach(function(card) {
        TreasonDiscards.push(card);
    });

    TreasonDeck.length = 0;

    Utils.shuffle(TreasonDeck);
};

// undefined should be interpreted as "no more survival cards" (in deck and in discard)
var drawSurvivalCard = function() {
    if(SurvivalDeck.length == 0) {
        shuffleSurvival();
    }
    if(SurvivalDeck.length == 0) {
        return undefined;
    }
    return SurvivalDeck.pop();
}

var drawTreasonCard = function() {
    if(TreasonDeck.length == 0) {
        shuffleTreason();
    }
    if(TreasonDeck.length == 0) {
        return undefined;
    }
    return TreasonDeck.pop();
}

var discardSurvivalCard = function(card) {
    SurvivalDiscards.push(card);
}

var discardTreasonCard = function(card) {
    TreasonDiscards.push(card);
}

// *********************************************
// *           EXPORTATION OF SYMBOLS          *
// *********************************************

exports.initDecks = initDecks;
exports.drawSurvivalCard = drawSurvivalCard;
exports.drawTreasonCard = drawTreasonCard;
exports.discardSurvivalCard = discardSurvivalCard;
exports.discardTreasonCard = discardTreasonCard;
exports.createAdventurerDeck = Cards.createAdventurerDeck;
exports.createCerbereDeck = Cards.createCerbereDeck;