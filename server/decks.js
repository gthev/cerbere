var Cards = require("./cards");
var Utils = require("./utils")

const deckSurvivalComposition = {
    "Sacrifice": 4,
    "Favoritisme": 4,
    "Opportunisme": 4,
    "Fatalisme": 4,
    "Egoïsme": 4,
    "Couardise": 4,
    "Arrogance": 4,
}

const deckTreasonComposition = {
    "Embuscade": 5,
    "Perfidie": 5,
    "Violence": 5,
    "Rancune": 5,
    "Fourberie": 5,
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

    idx_survival = 0;
    idx_treason = 0;
    // we fill the Survival Deck
    for (var survival_name in deckSurvivalComposition) {
        if (deckSurvivalComposition.hasOwnProperty(survival_name)) {           
            for(var i = 0; i < deckSurvivalComposition[survival_name]; i++) {
                var new_card = Cards.createSurvival(survival_name);
                // we define the card's idx/key
                new_card.effects.forEach(function(effect){effect.idx = idx_survival; idx_survival++});
                if(new_card != undefined) SurvivalDeck.push(new_card);
            }
        }
    }

    // idem for Treason Deck
    for (var treason_name in deckTreasonComposition) {
        if (deckTreasonComposition.hasOwnProperty(treason_name)) {           
            for(var i = 0; i < deckTreasonComposition[treason_name]; i++) {
                var new_card = Cards.createTreason(treason_name);
                new_card.effects.forEach(function(effect){effect.idx = idx_treason; idx_treason++});
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

// this function empties the Discards of survival, and puts everything in the Deck
var shuffleSurvival = function () {
    SurvivalDiscards.forEach(function(card) {
        SurvivalDeck.push(card);
    });
    // we emtpy it
    SurvivalDiscards.length = 0;

    Utils.shuffle(SurvivalDeck);
};

var shuffleTreason = function () {
    TreasonDiscards.forEach(function(card) {
        TreasonDiscards.push(card);
    });

    TreasonDiscards.length = 0;

    Utils.shuffle(TreasonDeck);
};

// undefined should be interpreted as "no more survival cards" (in deck and in discard)
var drawSurvivalCard = function() {
    if(SurvivalDeck.length == 0) {
        console.log("Shuffling deck");
        shuffleSurvival();
    }
    if(SurvivalDeck.length == 0) {
        console.log("Warning !!! Empty survival deck");
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
// *            HANDLING OF COPIES             *
// *********************************************

var getCopyOfDecks = function() {
    return {
        survivaldeck: SurvivalDeck.slice(),
        survivaldiscard: SurvivalDiscards.slice(),
        treasondeck: TreasonDeck.slice(),
        treasondiscards: TreasonDiscards.slice(),
    };
}

var restoreCopyOfDecks = function(copy) {
    SurvivalDeck = copy.survivaldeck;
    SurvivalDiscards = copy.survivaldiscard;
    TreasonDeck = copy.treasondeck;
    TreasonDiscards = copy.treasondiscards;
}


// *********************************************
// *           EXPORTATION OF SYMBOLS          *
// *********************************************

initDecks();

exports.printAvailable = function() {
    console.log(SurvivalDeck.map((effect)=>(effect.effects)));
};
exports.initDecks = initDecks;
exports.drawSurvivalCard = drawSurvivalCard;
exports.drawTreasonCard = drawTreasonCard;
exports.discardSurvivalCard = discardSurvivalCard;
exports.discardTreasonCard = discardTreasonCard;
exports.createAdventurerDeck = Cards.createAdventurerDeck;
exports.createCerbereDeck = Cards.createCerbereDeck;
exports.copyHeroDeck = Cards.copyDeck;
exports.getCopyState = getCopyOfDecks;
exports.restoreCopyState = restoreCopyOfDecks;