// ********************************************
// *       DESCRIPTION OF ALL EFFECTS         *
// ********************************************

// all others ahead is max 3
// /!\ any adventurer : the effect is "divisible" among players, but the player can't choose it =/= other adventurer is indivisible but he can choose it
const effectTargets = ["self", "any adventurer", "any cerbere","other adventurer", "other cerbere", "cerbere", "all others"]

//
const targetedEffects = ["step back", "step forward", "draw survival", "draw treason", "discard"]

//
const generalActions = ["collect actions", "bark", "advance dice", "back dice", "augment dice", "reduce dice", "chase"]

/*
targetEffect {
    target: smth in effectTargets
    effect: [smth in targetedEffects]
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
    targetedEffects: [],
    generalEffects: [],
},
cost: {
    targetedEffects: [],
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
                    effects: {
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
                    effects: {
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
                                target: "any adventurer",
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

const defaultAdventurerDeck = [
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
        },
        {
            effect: {
                targetedEffects: [
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
                targetedEffects: [
                    {
                        target: "self",
                        effect: "discard",
                        addData: 1,
                    }
                ],
                generalEffects: [],
            },
        },
    ],
    [
        {
            effect: {
                targetedEffects: [
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
                targetedEffects: [],
                generalEffects : [
                    {
                        effect: "advance dice",
                        addData: 1,
                    }
                ],
            },
        },
        {
            effect: {
                targetedEffects: [],
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
                targetedEffects: [],
                generalEffects: [
                    {
                        effect: "advance dice",
                        addData: 1,
                    }
                ],
            }
        },
    ],
    [
        {
            effect: {
                targetedEffects: [
                    {
                        target: "self",
                        effect: "draw survival",
                        addData: 2,
                    }
                ],
                generalEffects: [],
            },
            cost: {
                targetedEffects: [],
                generalEffects: [
                    {
                        effect: "advance dice",
                        addData: 1,
                    }
                ],
            }
        },
        {
            effect: {
                targetedEffects: [
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
                targetedEffects: [],
                generalEffects: [
                    {
                        target: "advance dice",
                        addData: 1,
                    }
                ],
            },
        },
    ],
    [
        {
            effect: {
                targetedEffects: [
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
                targetedEffects: [],
                generalEffects: [
                    {
                        effect: "advance dice",
                        addData: 1,
                    }
                ],
            },
        },
        {
            effect: {
                targetedEffects: [
                    {
                        target: "self",
                        effect: "step forward",
                        addData: 2,
                    }
                ],
                generalEffects: [],
            },
            cost: {
                targetedEffects: [],
                generalEffects: [
                    {
                        effect: "advance dice",
                        addData: 1,
                    }
                ],
            }
        }
    ],
];

var ActionDeck = function() {
    var self = {
        available: [],
        discard: [],
    };

    self.getAvailable = function() {
        return this.available.slice();
    };

    // returns true if the was found and discarded, false otherwise
    self.discardCard = function(card) {
        var idx = this.available.indexOf(card);
        if(idx < 0) return false;
        else {
            this.available.splice(idx, 1);
            this.discard.push(card);
            return true;
        }
    };

    self.collectCards = function() {
        this.discard.forEach(function(card){
            this.available.push(card);
        });
        while(this.discard.length) this.discard.pop();
    };

    return self;
}

var AdventurerDeck = function() {
    var self = ActionDeck();
    self.available = defaultAdventurerDeck.slice();

    return self;
}


// *********************************************
// *              CERBERE DECK                 *
// *********************************************

const defaultCerbereDeck = [
    [
        {
            effect: {
                targetedEffects: [],
                generalEffects: [
                    {
                        effect: "collect actions",
                        addData: 0,
                    }
                ],
            },
            cost: {
                targetedEffects: [],
                generalEffects: [],
            }
        },
        {
            effect: {
                targetedEffects: [
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
                targetedEffects: [
                    {
                        target: "other adventurer",
                        effect: "step forward",
                        addData: 2,
                    }
                ],
                generalEffects: [],
            }
        }
    ],
    [
        {
            effect: {
                targetedEffects: [
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
                targetedEffects: [],
                generalEffects: [
                    {
                        effect: "reduce dice",
                        addData: 1,
                    }
                ],
            }
        },
        {
            effect: {
                targetedEffects: [],
                generalEffects: [
                    {
                        effect: "augment dice",
                        addData: 1,
                    }
                ],
            },
            cost: {
                targetedEffects: [],
                generalEffects: [],
            }
        }
    ],
    [
        {
            effect: {
                targetedEffects: [
                    {
                        target: "self",
                        effect: "draw cerbere",
                        addData: 1,
                    }
                ],
                generalEffects: [],
            },
            cost: {
                targetedEffects: [],
                generalEffects: [],
            }
        },
        {
            effect: {
                targetedEffects: [
                    {
                        target: "cerbere",
                        effect: "step forward",
                        addData: 1,
                    }
                ],
                generalEffects: [],
            },
            cost: {
                targetedEffects: [],
                generalEffects: [],
            }
        }
    ],
    [
        {
            effect: {
                targetedEffects: [],
                generalEffects: [
                    {
                        effect: "advance dice",
                        addData: 1,
                    }
                ],
            },
            cost: {
                targetedEffects: [],
                generalEffects: [],
            }
        },
        {
            effect: {
                targetedEffects: [
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
                targetedEffects: [
                    {
                        target: "other adventurer",
                        effect: "step forward",
                        addData: 1,
                    },
                ],
                generalEffects: [],
            }
        }
    ]
];


var CerbereDeck = function() {
    var self = ActionDeck();
    self.available = defaultCerbereDeck.slice();

    return self;
}

exports.createSurvival = SurvivalCard;
exports.createTreason = TreasonCard;

exports.createAdventurerDeck = AdventurerDeck;
exports.createCerbereDeck = CerbereDeck;