const num_intermediate_tiles = 2;

var emptyEffect = function() {
    return {
        targetEffects: [],
        generalEffects: [],
    };
}

// **********************************
// *          BEGIN TILES           *
// **********************************          

const begin_tiles = [
    {
        cells: [
            {
                cerbere: true,
                effect: emptyEffect(),
                treason: 2,
            },
            {
                cerbere: false,
                effect: emptyEffect(),
                treason: 2,
            },
            {
                cerbere: false,
                effect: {
                    targetEffects: [ {
                            target: "self",
                            effect: "draw hero",
                            addData: 1,
                        },
                    ],
                    generalEffects: [],
                },
                treason: 1,
            },
            {
                cerbere: true,
                effect: emptyEffect(),
                treason: 1,
            },
            {
                cerbere: false,
                effect: emptyEffect(),
                treason: 1,
            },
            {
                cerbere: false,
                effect: emptyEffect(),
                treason: 1,
            }
        ],

        difficulty: 4,
        pilotis: [],
        bridges: [],
        portals: [],
        start: 0,
    },
]

// **************************************
// *        INTERMEDIATE TILES          *
// **************************************

const interm_tiles = [
    {
        cells: [
            {
                cerbere: true,
                effect: emptyEffect(),
                treason: 0,
            },
            {
                cerbere: false,
                effect: {
                    targetEffects: [],
                    generalEffects: [
                        {
                            effect: "bark",
                            addData: 0,
                        }
                    ],
                },
                treason: 0,
            },
            {
                cerbere: true,
                effect: emptyEffect(),
                treason: 0,
            },
            {
                cerbere: false,
                effect: emptyEffect(),
                treason: 0,
            },
        ],

        difficulty: 2,
        pilotis: [],
        bridges: [],
        portals: [],
    },
    {
        cells: [
            {
                cerbere: true,
                effect: emptyEffect(),
                treason: 0,
            },
            {
                cerbere: false,
                effect: emptyEffect(),
                treason: 0,
            },
            {
                cerbere: false,
                effect:  emptyEffect(),
                treason: 0,
            },
            {
                cerbere: true,
                effect: emptyEffect(),
                treason: 0,
            },
            {
                cerbere: false,
                effect: emptyEffect(),
                treason: 0,
            },
        ],

        difficulty: 3,
        pilotis: [1,2],
        bridges: [],
        portals: [],
    }
];

// **********************************************
// *                FINAL TILES                 *
// **********************************************

const fin_tiles = [
    {
        cells: [
            {
                cebere: true,
                effect: emptyEffect(),
                treason: 0,
            },
            {
                cerbere: false,
                effect: emptyEffect(),
                treason: 0,
            },
            {
                cerbere: false,
                effect: {
                    targetEffects: [],
                    generalEffects: [
                        {
                            effect: "advance dice",
                            addData: 1,
                        },
                    ],
                },
                treason: 0,
            },
            {
                cerbere: false,
                effect: emptyEffect(),
                treason: 0,
            }
        ],

        difficulty: 2,
        pilotis: [],
        bridges: [],
        portals: [],
        unveil: 0
    },
];

// ******************************
// *       EXPORTATION          *
// ******************************

// TODO: take difficulty into account !

/*
returns a map, dict of the form {
    cells: the array of cells
    start: cell where players start
    unveil : cell where barks are unveiled
    pilotis : [idx] corresponding to pilotis
    bridges : 
    portals:
}
*/
var getRawMap = function(difficulty) {
    var begin_left = begin_tiles.slice();
    var interm_left = interm_tiles.slice();
    var fin_left = fin_tiles.slice();

    var current_length = 0;

    var rawmap = {cells: [], pilotis: [], bridges: [], portals: []};


    if(begin_left.length > 0 && interm_left.length >= num_intermediate_tiles && fin_left.length > 0) {

        var beginTile = begin_left[Math.floor(Math.random() * (begin_left.length))];

        current_length += beginTile.cells.length;
        rawmap.cells = rawmap.cells.concat(beginTile.cells);
        rawmap.start = beginTile.start;
        rawmap.pilotis = rawmap.pilotis.concat(beginTile.pilotis);
        rawmap.bridges = rawmap.bridges.concat(beginTile.bridges);
        rawmap.portals = rawmap.portals.concat(beginTile.portals);

        for(var i=0; i<num_intermediate_tiles; i++) {

            var indexTile = Math.floor(Math.random() * (interm_left.length));
            var intermTile = interm_left[indexTile];
            interm_left.splice(indexTile,1);

            rawmap.cells = rawmap.cells.concat(intermTile.cells);
            
            for(var pilIdx = 0; pilIdx < intermTile.pilotis.length; pilIdx++) {
                intermTile.pilotis[pilIdx] += current_length;
            }

            rawmap.pilotis = rawmap.pilotis.concat(intermTile.pilotis);

            intermTile.bridges.forEach(function(bridge){
                for(var i=0; i<bridge.connectedCells.length; i++) {
                    bridge.connectedCells[i] += current_length;
                }
            });

            rawmap.bridges = rawmap.bridges.concat(intermTile.bridges);

            intermTile.portals.forEach(function(portal){
                for(var i=0; i<portal.connectedCells.length; i++) {
                    portal.connectedCells[i] += current_length;
                }
            });

            rawmap.portals = rawmap.portals.concat(intermTile.portals);

            current_length += intermTile.cells.length;

        }

        var indexFin = Math.floor(Math.random() * (fin_left.length));
        var finTile = fin_left[indexFin];
        fin_left.splice(indexFin,1);

        rawmap.cells = rawmap.cells.concat(finTile.cells);
            
        rawmap.unveil = finTile.unveil + current_length;

        for(var pilIdx = 0; pilIdx < finTile.pilotis.length; pilIdx++) {
            finTile.pilotis[pilIdx] += current_length;
        }

        rawmap.pilotis = rawmap.pilotis.concat(finTile.pilotis);

        finTile.bridges.forEach(function(bridge){
            for(var i=0; i<bridge.connectedCells.length; i++) {
                bridge.connectedCells[i] += current_length;
            }
        });

        rawmap.bridges = rawmap.bridges.concat(finTile.bridges);

        finTile.portals.forEach(function(portal){
            for(var i=0; i<portal.connectedCells.length; i++) {
                portal.connectedCells[i] += current_length;
            }
        });

        rawmap.portals = rawmap.portals.concat(finTile.portals);

        current_length += finTile.cells.length;

        return rawmap;


    } else {
        return undefined;
    }
}

var getCopyMap = function(rawmap) {
    var res = [];
    // the obj in cells are theorically not changed during the game
    res.cells = rawmap.cells.slice();
    res.start = rawmap.start;
    res.unveil = rawmap.unveil;
    res.pilotis = rawmap.pilotis.slice();
    res.bridges = rawmap.bridges.map((bridge) => ({connectedCells: bridge.connectedCells.slice(), intact: bridge.intact}));
    res.portals = rawmap.portals.map((portal) => ({connectedCells: portal.connectedCells.slice(), activator: portal.activator}));

    return res;
}

//=============================

exports.genNewMap = getRawMap;
exports.copyMap = getCopyMap;