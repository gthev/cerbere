// ********************************************
// *       DESCRIPTION OF ALL EFFECTS         *
// ********************************************

// all others ahead is max 3
// /!\ any adventurer : the effect is "divisible" among players, but the player can't choose it =/= other adventurer is indivisible but he can choose it
const effectTargets = ["self", "any adventurer", "any cerbere", "other adventurer", "other cerbere", "cerbere", "all other adventurers"]

//
const targetEffects = ["step back", "step forward", "draw survival", "draw treason", "discard"]

//
const generalActions = ["collect actions", "bark", "advance dice", "back dice", "augment dice", "reduce dice", "hunt"]

/*
targetEffect {
    target: smth in effectTargets
    effect: [smth in targetEffects]
    addData: additional data (number of cases/cards, eg) -> can be special value -1 for "all people ahead of you, max 3"
}

generalEffect {
    effect: smth in generalActions
    addData: additional data (number for example)
}
*/

/*
Structure of a card : 

name : 
effects : 

TO COPY-PASTE
effect: {
    targetEffects: [],
    generalEffects: [],
},
cost: {
    targetEffects: [],
    generalEffects: [],
}

*/

var SurvivalCard = function(name) {

    var self = {
        name: name,
    };

    switch (name) {
        case "Sacrifice":
            self.effects = [
                {
                    effect: {
                        targetEffects: [
                            {
                                target: "other adventurer",
                                effect: "step back",
                                addData: 1,
                            }
                        ],
                        generalEffects: [
                            {
                                effect: "back dice",
                                addData: 1
                            }
                        ]
                
                    },

                    cost: {
                        targetEffects: [],
                        generalEffects: []
                    }
                },
                {
                    effect: {
                        targetEffects: [
                            {
                                target: "other adventurer",
                                effect: "step back",
                                addData: 2
                            }
                        ],
                        generalEffects: [
                            {
                                effect: "back dice",
                                addData: 2,
                            }
                        ]
                    },

                    cost: {
                            targetEffects : [
                                {
                                    target: "any adventurer",
                                    effect: "discard",
                                    addData: 1
                                }
                            ],
                            generalEffects : [] 
                    },
                },
            ];

            break;

        case "Favoritisme":
            self.effects = [
                {
                    effect: {
                        targetEffects: [
                            {
                                target: "self",
                                effect: "step forward",
                                addData: 1,
                            },
                            {
                                target: "other adventurer",
                                effect: "step forward",
                                addData: 1,
                            }
                        ],
                        generalEffects: [
                        ],
                    },
                    

                    cost: {
                        targetEffects: [],
                        generalEffects: []
                    }
                },
                {
                    effect: {
                        targetEffects: [
                            {
                                target: "self",
                                effect: "step forward",
                                addData: 3
                            },
                            {
                                target: "other adventurer",
                                effect: "step forward",
                                addData: 2
                            },
                            {
                                target: "other adventurer",
                                effect: "step forward",
                                addData: 1
                            }
                        ],
                        generalEffects: [
                        ],
                    },
                    
                
                    cost: {
                        targetEffects: [
                            {
                                target: "any adventurer",
                                effect: "discard",
                                addData: 3
                            }
                        ],
                        generalEffects: []
                    }
                },
            ];
            break;

        // TODO : les autres cartes survies !
    
        default:
            return undefined;
    }

    return self;
}

var TreasonCard = function(name) {

    var self = {
        name: name
    };

    switch (name) {
        case "Embuscade":
            self.effects = [
                {
                    effect: {
                        targetEffects: [
                            {
                                target: "cerbere",
                                effect: "step forward",
                                addData: 1
                            }
                        ],

                        generalEffects: [],
                    },

                    cost: {
                        targetEffects: [],
                        generalEffects: []
                    }
                },
                {
                    effect: {
                        targetEffects: [
                            {
                                target: "cerbere",
                                effect: "step forward",
                                addData: 2,
                            }
                        ],

                        generalEffects: [],
                    },

                    cost: {
                        targetEffects: [
                            {
                                target: "any cerbere",
                                effect: "discard",
                                addData: 1,
                            }
                        ],

                        generalEffects: [],
                    }
                }
            ]
            break;
    
        default:
            return undefined;
    }

    // TODO : reste des cartes trahisons !

    return self;
}

// ****************************************
// *          ADVENTURER CARDS            *
// ****************************************

function getDefaultAdventurerDeck() {
    return [
        [
            {
                effect: {
                    targetEffects: [
                        {
                            target: "self",
                            effect: "step forward",
                            addData: 2,
                        },
                        {
                            target: "other adventurer",
                            effect: "step forward",
                            addData: 1,
                        },
                    ],
    
                    generalEffects: [],
                },
    
                cost: {
                    targetEffects: [],
                    generalEffects: [
                        {
                            effect: "augment dice",
                            addData: 1,
                        }
                    ],
                },

                idx: 0,
            },
            {
                effect: {
                    targetEffects: [
                        {
                            target: "self",
                            effect: "step forward",
                            addData: 1,
                        },
                        {
                            target: "other adventurer",
                            effect: "step forward",
                            addData: 2,
                        }
                    ],
                    generalEffects: [],
                },
                cost: {
                    targetEffects: [
                        {
                            target: "self",
                            effect: "discard",
                            addData: 1,
                        }
                    ],
                    generalEffects: [],
                },

                idx: 1,
            },
        ],
        [
            {
                effect: {
                    targetEffects: [
                        {
                            target: "self",
                            effect: "draw survival",
                            addData: 1,
                        }
                    ],
                    generalEffects: [
                        {
                            effect: "collect actions",
                            addData: 0,
                        }
                    ],
                },
                cost: {
                    targetEffects: [],
                    generalEffects : [
                        {
                            effect: "advance dice",
                            addData: 1,
                        }
                    ],
                },

                idx: 2,
            },
            {
                effect: {
                    targetEffects: [],
                    generalEffects: [
                        {
                            effect: "bark",
                            addData: 0,
                        },
                        {
                            effect: "collect actions",
                            addData: 0,
                        },
                    ],
                },
                cost: {
                    targetEffects: [],
                    generalEffects: [
                        {
                            effect: "advance dice",
                            addData: 1,
                        }
                    ],
                },

                idx: 3,
            },
        ],
        [
            {
                effect: {
                    targetEffects: [
                        {
                            target: "self",
                            effect: "draw survival",
                            addData: 2,
                        }
                    ],
                    generalEffects: [],
                },
                cost: {
                    targetEffects: [],
                    generalEffects: [
                        {
                            effect: "advance dice",
                            addData: 1,
                        }
                    ],
                },

                idx: 4,
            },
            {
                effect: {
                    targetEffects: [
                        {
                            target: "self",
                            effect: "draw survival",
                            addData: 1,
                        },
                        {
                            target: "other adventurer",
                            effect: "draw survival",
                            addData: 1,
                        },
                        {
                            target: "other adventurer",
                            effect: "draw survival",
                            addData: 1
                        }
                    ],
                    generalEffects: [],
                },
                cost: {
                    targetEffects: [],
                    generalEffects: [
                        {
                            target: "advance dice",
                            addData: 1,
                        }
                    ],
                },

                idx: 5,
            },
        ],
        [
            {
                effect: {
                    targetEffects: [
                        {
                            target: "other adventurer",
                            effect: "step forward",
                            addData: 3,
                        },
                        {
                            target: "other adventurer",
                            effect: "step forward",
                            addData: 1,
                        }
                    ],
                    generalEffects: [],
                },
                cost: {
                    targetEffects: [],
                    generalEffects: [
                        {
                            effect: "advance dice",
                            addData: 1,
                        }
                    ],
                },

                idx: 6,
            },
            {
                effect: {
                    targetEffects: [
                        {
                            target: "self",
                            effect: "step forward",
                            addData: 2,
                        }
                    ],
                    generalEffects: [],
                },
                cost: {
                    targetEffects: [],
                    generalEffects: [
                        {
                            effect: "advance dice",
                            addData: 1,
                        }
                    ],
                },

                idx: 7,
            }
        ],
    ];
}

var HeroDeck = function() {
    var self = {
        available: [],
        discard: [],
    };

    self.getAvailable = function() {
        return self.available.slice();
    };

    self.findAvailableEffectByIdx = function(idx) {
        var idxCard = undefined;
        self.available.forEach(function(card){
            card.forEach(function(effect) {
                if(effect.idx == idx) idxCard = {
                    effect: effect,
                    card: card,
                };
            })
        });
        return idxCard;
    }

    // returns true if the was found and discarded, false otherwise
    self.discardCard = function(card) {
        var idx = self.available.indexOf(card);
        if(idx < 0) return false;
        else {
            self.available.splice(idx, 1);
            self.discard.push(card);
            return true;
        }
    };

    self.collectCards = function() {
        self.discard.forEach(function(card){
            self.available.push(card);
        });
        while(self.discard.length) self.discard.pop();
    };

    return self;
}

var AdventurerDeck = function() {
    var self = HeroDeck();
    var idx=0;
    self.available = getDefaultAdventurerDeck();

    return self;
}


// *********************************************
// *              CERBERE DECK                 *
// *********************************************

function getDefaultCerbereDeck() {
    return [
        [
            {
                effect: {
                    targetEffects: [],
                    generalEffects: [
                        {
                            effect: "collect actions",
                            addData: 0,
                        }
                    ],
                },
                cost: {
                    targetEffects: [],
                    generalEffects: [],
                },

                idx: 0,
            },
            {
                effect: {
                    targetEffects: [
                        {
                            target: "self",
                            effect: "draw treason",
                            addData: 1,
                        }
                    ],
                    generalEffects: [
                        {
                            effect: "collect actions",
                            addData: 0,
                        }
                    ],
                },
                cost: {
                    targetEffects: [
                        {
                            target: "other adventurer",
                            effect: "step forward",
                            addData: 2,
                        }
                    ],
                    generalEffects: [],
                },

                idx: 1,
            }
        ],
        [
            {
                effect: {
                    targetEffects: [
                        {
                            target: "self",
                            effect: "draw treason",
                            addData: 2,
                        },
                        {
                            target: "other cerbere",
                            effect: "draw treason",
                            addData: 1,
                        }
                    ],
                    generalEffects: [],
                },
                cost: {
                    targetEffects: [],
                    generalEffects: [
                        {
                            effect: "reduce dice",
                            addData: 1,
                        }
                    ],
                },

                idx: 2,
            },
            {
                effect: {
                    targetEffects: [],
                    generalEffects: [
                        {
                            effect: "augment dice",
                            addData: 1,
                        }
                    ],
                },
                cost: {
                    targetEffects: [],
                    generalEffects: [],
                },

                idx: 3,
            }
        ],
        [
            {
                effect: {
                    targetEffects: [
                        {
                            target: "self",
                            effect: "draw cerbere",
                            addData: 1,
                        }
                    ],
                    generalEffects: [],
                },
                cost: {
                    targetEffects: [],
                    generalEffects: [],
                },

                idx: 4,
            },
            {
                effect: {
                    targetEffects: [
                        {
                            target: "cerbere",
                            effect: "step forward",
                            addData: 1,
                        }
                    ],
                    generalEffects: [],
                },
                cost: {
                    targetEffects: [],
                    generalEffects: [],
                },

                idx: 5,
            }
        ],
        [
            {
                effect: {
                    targetEffects: [],
                    generalEffects: [
                        {
                            effect: "advance dice",
                            addData: 1,
                        }
                    ],
                },
                cost: {
                    targetEffects: [],
                    generalEffects: [],
                },

                idx: 6,
            },
            {
                effect: {
                    targetEffects: [
                        {
                            target: "other adventurer",
                            effect: "step back",
                            addData: 1,
                        },
                        {
                            target: "other adventurer",
                            effect: "step back",
                            addData: 1,
                        },
                        {
                            target: "other adventurer",
                            effect: "step back",
                            addData: 1,
                        },
                    ],
                    generalEffects: [],
                },
                cost: {
                    targetEffects: [
                        {
                            target: "other adventurer",
                            effect: "step forward",
                            addData: 1,
                        },
                    ],
                    generalEffects: [],
                },

                idx: 7,
            }
        ]
    ];
}


var CerbereDeck = function() {
    var self = HeroDeck();
    var idx=0;
    let cerbereDeck = getDefaultCerbereDeck();
    self.available = cerbereDeck.slice();

    return self;
}

//===========================
var getCopyDeck = function(deck) {
    var new_deck = HeroDeck();
    new_deck.available = deck.available.slice();
    new_deck.discard = deck.discard.slice();

    return new_deck;
}

exports.createSurvival = SurvivalCard;
exports.createTreason = TreasonCard;

exports.createAdventurerDeck = AdventurerDeck;
exports.createCerbereDeck = CerbereDeck;

exports.copyDeck = getCopyDeck;