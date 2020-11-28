'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ListJoueurs = function (_React$Component) {
    _inherits(ListJoueurs, _React$Component);

    /*
     * expected props : {joueurs: [{couleur: "", pseudo: ""}]}
     * with always at least one element, the self player at the beginning
     */
    function ListJoueurs(props) {
        _classCallCheck(this, ListJoueurs);

        var _this = _possibleConstructorReturn(this, (ListJoueurs.__proto__ || Object.getPrototypeOf(ListJoueurs)).call(this, props));

        _this.state = {
            list: props.joueurs.slice(),
            hoverable: false
        };

        _this.updateHoverable = _this.updateHoverable.bind(_this);
        _this.updatePlayers = _this.updatePlayers.bind(_this);

        //probably lots of socket binds in constructor
        io_socket.on('updateListPlayers', _this.updatePlayers);
        io_socket.on('updateListPlayersHoverable', _this.updateHoverable);
        return _this;
    }

    _createClass(ListJoueurs, [{
        key: 'updateHoverable',
        value: function updateHoverable(val) {
            this.setState({ hoverable: val });
        }
    }, {
        key: 'handleMouseEnter',
        value: function handleMouseEnter(id) {
            if (!this.state.hoverable) return;
            var divPlayer = document.getElementById(id);
            divPlayer.style.border = "medium solid red";
        }
    }, {
        key: 'handleMouseLeave',
        value: function handleMouseLeave(id) {
            //if(!this.state.hoverable) return;
            var divPlayer = document.getElementById(id);
            divPlayer.style.border = "";
        }
    }, {
        key: 'handleClick',
        value: function handleClick(pseudo) {
            if (!this.state.hoverable) return;
            console.log('emitting selectedPlayer : ' + pseudo);
            io_socket.emit('selectedPlayer', pseudo);
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.props.joueurs.forEach(function (player) {
                var canvas = document.getElementById("canvasListPlayers" + player.couleur);

                var context = canvas.getContext("2d");

                context.beginPath();
                context.fillStyle = player.couleur;
                context.arc(25, 25, 20, 0, 2 * Math.PI);
                context.fill();
            });
        }
    }, {
        key: 'updatePlayers',
        value: function updatePlayers(new_players) {

            this.setState({ list: new_players });
            this.state.list.forEach(function (player) {
                var canvas = document.getElementById("canvasListPlayers" + player.couleur);

                var context = canvas.getContext("2d");

                context.beginPath();
                context.fillStyle = player.couleur;
                context.arc(25, 25, 20, 0, 2 * Math.PI);
                context.fill();
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var selfPlayer = this.state.list[0];
            var otherPlayers = this.state.list.slice(1);

            var otherDivs = otherPlayers.map(function (player) {
                return React.createElement(
                    'div',
                    { key: player.couleur, id: "listPlayers" + player.couleur,
                        onMouseEnter: function onMouseEnter() {
                            return _this2.handleMouseEnter("listPlayers" + player.couleur);
                        }, onMouseLeave: function onMouseLeave() {
                            return _this2.handleMouseLeave("listPlayers" + player.couleur);
                        }, onClick: function onClick() {
                            return _this2.handleClick(player.pseudo);
                        } },
                    React.createElement('canvas', { id: "canvasListPlayers" + player.couleur, height: 50, width: 50 }),
                    React.createElement(
                        'span',
                        { className: 'pseudoList' },
                        player.pseudo
                    )
                );
            });

            return React.createElement(
                'div',
                { id: 'listPlayers', className: 'gameComponent' },
                React.createElement(
                    'div',
                    { key: selfPlayer.couleur, id: "listPlayers" + selfPlayer.couleur },
                    React.createElement('canvas', { id: "canvasListPlayers" + selfPlayer.couleur, width: 50, height: 50 }),
                    React.createElement(
                        'span',
                        { className: 'pseudoList' },
                        selfPlayer.pseudo
                    )
                ),
                otherDivs
            );
        }
    }]);

    return ListJoueurs;
}(React.Component);

var Chat = function (_React$Component2) {
    _inherits(Chat, _React$Component2);

    function Chat(props) {
        _classCallCheck(this, Chat);

        var _this3 = _possibleConstructorReturn(this, (Chat.__proto__ || Object.getPrototypeOf(Chat)).call(this, props));

        _this3.state = {
            logs: []

            //also probably lots of binds here
            //io_socket.removeListener('displayGeneralMessage');

        };_this3.displayGeneralMessage = _this3.displayGeneralMessage.bind(_this3);
        _this3.displayAlertMessage = _this3.displayAlertMessage.bind(_this3);
        _this3.displayWhisper = _this3.displayWhisper.bind(_this3);
        _this3.handleSubmit = _this3.handleSubmit.bind(_this3);

        //TODO : code displayGeneralMessage
        io_socket.on('displayGeneralMessage', _this3.displayGeneralMessage);
        io_socket.on('displayWhisper', _this3.displayWhisper);
        io_socket.on('displayAlertMessage', _this3.displayAlertMessage);
        return _this3;
    }

    _createClass(Chat, [{
        key: 'displayGeneralMessage',
        value: function displayGeneralMessage(data) {
            /*data = {color: "", pseudo: ""} */
            this.setState(function (state) {
                return { logs: state.logs.concat([React.createElement(
                        'div',
                        { key: state.logs.length },
                        React.createElement(
                            'span',
                            { style: { fontWeight: "bold", color: data.color } },
                            data.pseudo + ':'
                        ),
                        ' ' + data.text
                    )]) };
            });
        }
    }, {
        key: 'displayWhisper',
        value: function displayWhisper(data) {
            this.setState(function (state) {
                return { logs: state.logs.concat([React.createElement(
                        'div',
                        { key: state.logs.length },
                        React.createElement(
                            'span',
                            { style: { fontStyle: "italic" } },
                            data
                        )
                    )]) };
            });
        }
    }, {
        key: 'displayAlertMessage',
        value: function displayAlertMessage(data) {
            this.setState(function (state) {
                return { logs: state.logs.concat([React.createElement(
                        'div',
                        { key: state.logs.length },
                        React.createElement(
                            'span',
                            { style: { color: "red" } },
                            data
                        )
                    )]) };
            });
        }
    }, {
        key: 'handleSubmit',
        value: function handleSubmit(event) {

            event.preventDefault();

            var inputDiv = document.getElementById('chatInputGame');
            var input = inputDiv.value;

            if (input[0] == '[') {

                var tokens = input.split(']', 2);

                //console.log(tokens);

                if (tokens.length > 1) {
                    var dest = tokens[0];
                    dest = dest.substring(1); //removes the first '['
                    var message = tokens[1];
                    if (message[0] == ' ') {
                        message = message.substring(1);
                    }

                    if (dest[0] == ' ') {
                        dest = dest.substring(1);
                    }
                    if (dest[dest.length - 1] == ' ') {
                        dest = dest.slice(0, -1);
                    }

                    //console.log('|'+dest+'| : ('+message+')');

                    io_socket.emit('sendPrivateMessage', { dest: dest, text: message });
                } else {
                    io_socket.emit('sendGeneralMessage', input);
                }
            } else if (input[0] == '/') {

                io_socket.emit('reqDebug', input.substring(1));
            } else {
                io_socket.emit('sendGeneralMessage', input);
            }

            inputDiv.value = "";
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'gameComponent', id: 'chatAreaGame' },
                React.createElement(
                    'div',
                    { className: 'chatLog', id: 'chatLogGame' },
                    this.state.logs
                ),
                React.createElement(
                    'form',
                    { className: 'chatForm', id: 'chatFormGame', onSubmit: this.handleSubmit, autoComplete: 'off' },
                    React.createElement('input', { className: 'chatInput', id: 'chatInputGame', type: 'text' })
                )
            );
        }
    }]);

    return Chat;
}(React.Component);

var Pist = function (_React$Component3) {
    _inherits(Pist, _React$Component3);

    function Pist(props) {
        _classCallCheck(this, Pist);

        var _this4 = _possibleConstructorReturn(this, (Pist.__proto__ || Object.getPrototypeOf(Pist)).call(this, props));

        _this4.state = {
            pawns: props.pawns, //just a list of colors
            sizePiste: props.sizePiste,
            dicePos: props.dicePos,
            diceValue: props.diceValue
        };

        _this4.updatePawns = _this4.updatePawns.bind(_this4);
        _this4.updateSizePiste = _this4.updateSizePiste.bind(_this4);
        _this4.updateDice = _this4.updateDice.bind(_this4);

        // io binds
        io_socket.on('updatePiste', function (data) {
            this.updatePawns(data.pawns);
            this.updateSizePiste(data.size);
            this.updateDice(data.dice);
        }.bind(_this4));
        return _this4;
    }

    _createClass(Pist, [{
        key: 'clearAllDiceCanvas',
        value: function clearAllDiceCanvas() {
            for (var i = 0; i < this.state.sizePiste; i++) {
                var canvas = document.getElementById("canvasPisteDice" + i);
                var ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }, {
        key: 'colorPawns',
        value: function colorPawns() {
            this.state.pawns.forEach(function (colorPawn) {
                var canvas = document.getElementById("canvasPistePawn" + colorPawn);
                var context = canvas.getContext("2d");
                context.beginPath();
                context.fillStyle = colorPawn;
                context.arc(25, 25, 20, 0, 2 * Math.PI);
                context.fill();
            });
        }
    }, {
        key: 'colorDice',
        value: function colorDice() {
            if (this.state.diceValue > 9) {
                console.log("Warning : dice value overflow : " + this.state.diceValue);
                return;
            }
            if (this.state.dicePos >= 0 && this.state.dicePos < this.state.sizePiste && this.state.diceValue) {
                var canvas = document.getElementById("canvasPisteDice" + this.state.dicePos);
                var ctx = canvas.getContext("2d");
                ctx.font = "40px serif";
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.fillText(this.state.diceValue, canvas.width / 2, canvas.height * (3 / 4));
            }
        }
    }, {
        key: 'updatePawns',
        value: function updatePawns(new_pawns) {
            this.setState({ pawns: new_pawns });
            this.colorPawns();
        }
    }, {
        key: 'updateSizePiste',
        value: function updateSizePiste(new_size) {
            this.setState({ sizePiste: new_size });
            this.colorPawns();
            this.clearAllDiceCanvas();
            this.colorDice();
        }
    }, {
        key: 'updateDice',
        value: function updateDice(new_dice) {
            this.setState({ dicePos: new_dice.pos, diceValue: new_dice.val });
            this.clearAllDiceCanvas();
            this.colorDice();
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            //we draw the pawns and the dice
            this.colorPawns();

            //for now, we do it to avoid writing out of the canvas... maybe we can change it later
            this.colorDice();
        }
    }, {
        key: 'render',
        value: function render() {

            var pawnsCanvas = this.state.pawns.map(function (pawnColor) {
                return React.createElement('canvas', { key: "canvasPistePawn" + pawnColor, id: "canvasPistePawn" + pawnColor, width: 50, height: 50, style: { border: "2px solid white" } });
            });

            var pisteCanvas = [];
            for (var i = 0; i < this.state.sizePiste; i++) {
                pisteCanvas.push(React.createElement('canvas', { key: "canvasPisteDice" + i, id: "canvasPisteDice" + i, width: 50, height: 50, style: { border: "2px solid white" } }));
            }

            return React.createElement(
                'div',
                { className: 'gameComponent', id: 'pisteCerbere' },
                pawnsCanvas,
                ' ',
                pisteCanvas
            );
        }
    }]);

    return Pist;
}(React.Component);

var Deck = function (_React$Component4) {
    _inherits(Deck, _React$Component4);

    /*
     * psg_cards et action_cards : normal card + idx for server
     */
    function Deck(props) {
        _classCallCheck(this, Deck);

        var _this5 = _possibleConstructorReturn(this, (Deck.__proto__ || Object.getPrototypeOf(Deck)).call(this, props));

        _this5.state = {
            psg_cards: props.psg_cards,
            action_cards: props.action_cards,
            psg_hoverable: false,
            action_hoverable: false,
            show_skip: false

            //binds function
        };_this5.updatePsgCards = _this5.updatePsgCards.bind(_this5);
        _this5.updateActionCards = _this5.updateActionCards.bind(_this5);
        _this5.updatePsgHoverable = _this5.updatePsgHoverable.bind(_this5);
        _this5.updateActionHoverable = _this5.updateActionHoverable.bind(_this5);
        _this5.updateSkipable = _this5.updateSkipable.bind(_this5);

        //binds
        io_socket.on('updatePsgCards', _this5.updatePsgCards);
        io_socket.on("updateActionCards", _this5.updateActionCards);
        io_socket.on('updatePsgHoverable', _this5.updatePsgHoverable);
        io_socket.on('updateActionHoverable', _this5.updateActionHoverable);
        io_socket.on('updateSkipable', _this5.updateSkipable);
        return _this5;
    }

    _createClass(Deck, [{
        key: 'updatePsgCards',
        value: function updatePsgCards(new_psg_cards) {
            this.setState({ psg_cards: new_psg_cards });
        }
    }, {
        key: 'updateActionCards',
        value: function updateActionCards(new_action_cards) {
            this.setState({ action_cards: new_action_cards });
        }
    }, {
        key: 'updatePsgHoverable',
        value: function updatePsgHoverable(new_val) {
            console.log("update psg hoverable: " + new_val);
            this.setState({ psg_hoverable: new_val });
        }
    }, {
        key: 'updateActionHoverable',
        value: function updateActionHoverable(new_val) {
            console.log("update action hoverable: " + new_val);
            this.setState({ action_hoverable: new_val });
        }
    }, {
        key: 'updateSkipable',
        value: function updateSkipable(new_val) {
            this.setState({ show_skip: new_val });
        }
    }, {
        key: 'handleMouseEnterPsg',
        value: function handleMouseEnterPsg(id) {
            if (!this.state.psg_hoverable) return;
            var divCard = document.getElementById(id);
            if (divCard != undefined) divCard.style.border = "medium solid red";
        }
    }, {
        key: 'handleMouseEnterAction',
        value: function handleMouseEnterAction(id) {
            if (!this.state.action_hoverable) return;
            var divCard = document.getElementById(id);
            if (divCard != undefined) divCard.style.border = "medium solid red";
        }
    }, {
        key: 'handleMouseLeavePsg',
        value: function handleMouseLeavePsg(id) {
            //if(!this.state.psg_hoverable) return;
            var divCard = document.getElementById(id);
            if (divCard != undefined) divCard.style.border = "";
        }
    }, {
        key: 'handleMouseLeaveAction',
        value: function handleMouseLeaveAction(id) {
            //if(!this.state.action_hoverable) return;
            var divCard = document.getElementById(id);
            if (divCard != undefined) divCard.style.border = "";
        }
    }, {
        key: 'handleClickPsg',
        value: function handleClickPsg(idx) {
            if (!this.state.psg_hoverable) return;
            console.log('sending selectedPsgCard');
            io_socket.emit('selectedPsgCard', idx);
        }
    }, {
        key: 'handleClickAction',
        value: function handleClickAction(idx) {
            if (!this.state.action_hoverable) return;
            io_socket.emit('selectedActionCard', idx);
        }
    }, {
        key: 'handleClickSkip',
        value: function handleClickSkip() {
            if (!this.state.show_skip) return;
            io_socket.emit('skipAction');
        }
    }, {
        key: 'render',
        value: function render() {
            var _this6 = this;

            var divsPsg = this.state.psg_cards.map(function (psg_card) {
                return React.createElement(
                    'div',
                    { className: 'card', id: "cardPsg" + psg_card[0].idx, key: "cardPsg" + psg_card[0].idx },
                    psg_card.map(function (effect) {
                        return React.createElement(
                            'div',
                            { className: 'effect', id: "cardPsgEffect" + effect.idx, key: "cardPsgEffect" + effect.idx, onClick: function onClick() {
                                    return _this6.handleClickPsg(effect.idx);
                                },
                                onMouseEnter: function onMouseEnter() {
                                    return _this6.handleMouseEnterPsg("cardPsgEffect" + effect.idx);
                                }, onMouseLeave: function onMouseLeave() {
                                    return _this6.handleMouseLeavePsg("cardPsgEffect" + effect.idx);
                                } },
                            effect.idx
                        );
                    })
                );
            });

            var divsAct = this.state.action_cards.map(function (act_card) {
                return React.createElement(
                    'div',
                    { className: 'card', id: "cardAct" + act_card.effects[0].idx, key: "cardAct" + act_card.effects[0].idx },
                    act_card.name,
                    act_card.effects.map(function (effect) {
                        return React.createElement(
                            'div',
                            { className: 'effect', id: "cardActEffect" + effect.idx, key: "cardPsgEffect" + effect.idx, onClick: function onClick() {
                                    return _this6.handleClickAction(effect.idx);
                                },
                                onMouseEnter: function onMouseEnter() {
                                    return _this6.handleMouseEnterAction("cardActEffect" + effect.idx);
                                }, onMouseLeave: function onMouseLeave() {
                                    return _this6.handleMouseLeaveAction("cardActEffect" + effect.idx);
                                } },
                            effect.idx
                        );
                    })
                );
            });

            var buttonDiv = this.state.show_skip ? React.createElement(
                'div',
                { id: 'skipButtonDiv' },
                React.createElement(
                    'button',
                    { id: 'skipbutton', type: 'button', onClick: function onClick() {
                            return _this6.handleClickSkip();
                        } },
                    'skip action'
                )
            ) : React.createElement('div', { id: 'skipButtonDiv' });

            return React.createElement(
                'div',
                { className: 'gameComponent', id: 'deck' },
                divsPsg,
                divsAct,
                buttonDiv
            );
        }
    }]);

    return Deck;
}(React.Component);

var Barks = function (_React$Component5) {
    _inherits(Barks, _React$Component5);

    function Barks(props) {
        _classCallCheck(this, Barks);

        var _this7 = _possibleConstructorReturn(this, (Barks.__proto__ || Object.getPrototypeOf(Barks)).call(this, props));

        _this7.state = {
            unveiled: false,
            barksData: 3,
            hoverableBarks: [],
            showSeeButton: false,
            showTransposeButton: false

            //======= bindings
        };_this7.updateBarksData = _this7.updateBarksData.bind(_this7);
        _this7.updateSeeButton = _this7.updateSeeButton.bind(_this7);
        _this7.updateTransposeButton = _this7.updateTransposeButton.bind(_this7);
        _this7.updateHoverableBarks = _this7.updateHoverableBarks.bind(_this7);

        io_socket.on('updateBarks', _this7.updateBarksData);
        io_socket.on('updateSeeButton', _this7.updateSeeButton);
        io_socket.on('updateTransposeButton', _this7.updateTransposeButton);
        io_socket.on('updateHoverableBarks', _this7.updateHoverableBarks);
        return _this7;
    }

    _createClass(Barks, [{
        key: 'updateBarksData',
        value: function updateBarksData(val) {
            this.setState({ unveiled: val.unveiled, barksData: val.data });
        }
    }, {
        key: 'updateSeeButton',
        value: function updateSeeButton(val) {
            this.setState({ showSeeButton: val });
        }
    }, {
        key: 'updateTransposeButton',
        value: function updateTransposeButton(val) {
            this.setState({ showTransposeButton: val });
        }
    }, {
        key: 'updateHoverableBarks',
        value: function updateHoverableBarks(barks) {
            this.setState({ hoverableBarks: barks });
        }
    }, {
        key: 'handleMouseEnter',
        value: function handleMouseEnter(number) {
            if (!this.state.hoverableBarks.includes(number)) return;
            var divBark = document.getElementById("barkDiv" + number);
            divBark.style.border = "medium solid green";
        }
    }, {
        key: 'handleMouseLeave',
        value: function handleMouseLeave(number) {
            //if(!(this.state.hoverableBarks.includes(number))) return;
            var divBark = document.getElementById("barkDiv" + number);
            divBark.style.border = "";
        }
    }, {
        key: 'handleClickBark',
        value: function handleClickBark(number) {
            if (!this.state.hoverableBarks.includes(number)) return;
            io_socket.emit("selectedBark", number);
        }
    }, {
        key: 'handleClickShow',
        value: function handleClickShow() {
            if (!this.state.showSeeButton) return;
            io_socket.emit("clickSeeBark");
        }
    }, {
        key: 'handleClickTranspose',
        value: function handleClickTranspose() {
            if (!this.state.showTransposeButton) return;
            io_socket.emit("clickTransposeBark");
        }
    }, {
        key: 'render',
        value: function render() {
            var _this9 = this;

            var barksDiv = this.state.unveiled ? [React.createElement(
                'div',
                { id: 'barkDiv0', key: 'barkDiv0' },
                React.createElement(
                    'span',
                    { className: 'roomBark' },
                    'Places : ',
                    this.state.barksData
                )
            )] : function () {
                var _this8 = this;

                var res = [];

                var _loop = function _loop(i) {
                    res.push(React.createElement(
                        'div',
                        { id: "barkDiv" + i, key: "barkDiv" + i, onMouseEnter: function onMouseEnter() {
                                return _this8.handleMouseEnter(i);
                            }, onMouseLeave: function onMouseLeave() {
                                return _this8.handleMouseLeave(i);
                            }, onClick: function onClick() {
                                return _this8.handleClickBark(i);
                            } },
                        React.createElement(
                            'span',
                            { className: 'barkUnknown' },
                            "Bark " + (i + 1)
                        )
                    ));
                };

                for (var i = 0; i < this.state.barksData; i++) {
                    _loop(i);
                }
                return res;
            }.bind(this)();

            return React.createElement(
                'div',
                { id: 'barkArea', className: 'gameComponent' },
                React.createElement(
                    'div',
                    { id: 'barksList' },
                    barksDiv
                ),
                React.createElement(
                    'div',
                    { id: 'barkButtons' },
                    this.state.showSeeButton ? React.createElement(
                        'div',
                        { id: 'barkShowButton' },
                        React.createElement(
                            'button',
                            { type: 'button', onClick: function onClick() {
                                    return _this9.handleClickShow();
                                } },
                            'Show'
                        )
                    ) : React.createElement('div', { id: 'barkShowButton' }),
                    this.state.showTransposeButton ? React.createElement(
                        'div',
                        { id: 'barkTransposeButton' },
                        React.createElement(
                            'button',
                            { type: 'button', onClick: function onClick() {
                                    return _this9.handleClickTranspose();
                                } },
                            'Transpose'
                        )
                    ) : React.createElement('div', { id: 'barkTransposeButton' })
                )
            );
        }
    }]);

    return Barks;
}(React.Component);

var MapCells = function (_React$Component6) {
    _inherits(MapCells, _React$Component6);

    /*
        cells: {
            players: [colors],
            TODO : effets, pilotis, portails, etc
        }
    */
    function MapCells(props) {
        _classCallCheck(this, MapCells);

        var _this10 = _possibleConstructorReturn(this, (MapCells.__proto__ || Object.getPrototypeOf(MapCells)).call(this, props));

        _this10.state = {
            cells: [],
            pos_cerbere: -1,
            highlighted: []
        };

        //===== bindings
        _this10.updateData = _this10.updateData.bind(_this10);
        _this10.updateHighlighted = _this10.updateHighlighted.bind(_this10);

        io_socket.on('updateMap', _this10.updateData);
        io_socket.on('updateMapHighlighted', _this10.updateHighlighted);
        return _this10;
    }

    _createClass(MapCells, [{
        key: 'updateData',
        value: function updateData(new_data) {
            this.setState({ cells: new_data.cells, pos_cerbere: new_data.pos_cerbere });
        }
    }, {
        key: 'handleMouseClick',
        value: function handleMouseClick(cellNumber) {
            if (!this.state.highlighted.includes(cellNumber)) return;
            io_socket.emit('selectedMapCell', cellNumber);
        }
    }, {
        key: 'colorHightlighted',
        value: function colorHightlighted() {
            for (var i = 0; i < this.state.cells.length; i++) {
                var divCell = document.getElementById("cellDiv" + i);
                if (divCell == undefined) continue;
                if (this.state.highlighted.includes(i)) {
                    divCell.style.border = "medium solid green";
                } else {
                    divCell.style.border = "";
                }
            }
        }
    }, {
        key: 'updateHighlighted',
        value: function updateHighlighted(new_highlighted) {
            this.setState({ highlighted: new_highlighted });
            this.colorHightlighted();
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.colorHightlighted();
        }
    }, {
        key: 'render',
        value: function render() {

            var cellDivs = this.state.cells.map(function (cell, index) {
                var _this11 = this;

                // TODO : améliorer ça, franchement !
                return React.createElement(
                    'div',
                    { id: "cellDiv" + index, key: "cellDiv" + index, className: 'mapCell',
                        onClick: function onClick() {
                            return _this11.handleMouseClick(index);
                        } },
                    cell.players,
                    this.state.pos_cerbere == index ? "CERBERE" : ""
                );
            }.bind(this));

            return React.createElement(
                'div',
                { id: 'gameMap', className: 'gameComponent' },
                cellDivs
            );
        }
    }]);

    return MapCells;
}(React.Component);

var PendingEffects = function (_React$Component7) {
    _inherits(PendingEffects, _React$Component7);

    function PendingEffects(props) {
        _classCallCheck(this, PendingEffects);

        var _this12 = _possibleConstructorReturn(this, (PendingEffects.__proto__ || Object.getPrototypeOf(PendingEffects)).call(this, props));

        _this12.state = {
            listEffects: { targetEffects: [], generalEffects: [] },
            cancelActive: false,
            hoverable: false
        };

        _this12.updateListEffects = _this12.updateListEffects.bind(_this12);
        _this12.updateCancelActive = _this12.updateCancelActive.bind(_this12);
        _this12.updateHoverable = _this12.updateHoverable.bind(_this12);

        io_socket.on('updatePendingEffects', _this12.updateListEffects);
        io_socket.on('updateCancelActive', _this12.updateCancelActive);
        io_socket.on('updateHoverablePendingEffects', _this12.updateHoverable);
        return _this12;
    }

    _createClass(PendingEffects, [{
        key: 'updateListEffects',
        value: function updateListEffects(new_list) {
            this.setState({ listEffects: new_list });
        }
    }, {
        key: 'updateCancelActive',
        value: function updateCancelActive(new_val) {
            this.setState({ cancelActive: new_val });
        }
    }, {
        key: 'updateHoverable',
        value: function updateHoverable(new_val) {
            this.setState({ hoverable: new_val });
        }
    }, {
        key: 'handleMouseEnter',
        value: function handleMouseEnter(target, idx) {
            if (!this.state.hoverable) return;
            var effectDiv = document.getElementById('pending' + (target ? 'Target' : 'General') + 'Effect' + idx);
            effectDiv.style.border = "medium solid red";
        }
    }, {
        key: 'handleMouseLeave',
        value: function handleMouseLeave(target, idx) {
            //if(!this.state.hoverable) return;
            var effectDiv = document.getElementById('pending' + (target ? 'Target' : 'General') + 'Effect' + idx);
            effectDiv.style.border = "";
        }
    }, {
        key: 'handleEffectClick',
        value: function handleEffectClick(target, idx) {
            if (!this.state.hoverable) return;
            io_socket.emit('selectedPendingEffect', { targeted: target, idx: idx });
        }
    }, {
        key: 'handleCancelClick',
        value: function handleCancelClick() {
            if (!this.state.cancelActive) return;
            io_socket.emit('cancelActiveEffect');
        }
    }, {
        key: 'render',
        value: function render() {
            var _this15 = this;

            var listTargetEffectsDiv = this.state.listEffects.targetEffects.map(function (effect, idx) {
                var _this13 = this;

                return React.createElement(
                    'div',
                    { key: "pendingTargetEffect" + idx, id: "pendingTargetEffect" + idx, onMouseEnter: function onMouseEnter() {
                            return _this13.handleMouseEnter(true, idx);
                        }, onMouseLeave: function onMouseLeave() {
                            return _this13.handleMouseLeave(true, idx);
                        },
                        onClick: function onClick() {
                            return _this13.handleEffectClick(true, idx);
                        }, className: 'pendingEffect' },
                    "Targeted " + idx
                );
            }.bind(this));

            var listGeneralEffectsDiv = this.state.listEffects.generalEffects.map(function (effect, idx) {
                var _this14 = this;

                return React.createElement(
                    'div',
                    { key: "pendingGeneralEffect" + idx, id: "pendingGeneralEffect" + idx, onMouseEnter: function onMouseEnter() {
                            return _this14.handleMouseEnter(false, idx);
                        }, onMouseLeave: function onMouseLeave() {
                            return _this14.handleMouseLeave(false, idx);
                        },
                        onClick: function onClick() {
                            return _this14.handleEffectClick(false, idx);
                        }, className: 'pendingEffect' },
                    "General " + idx
                );
            }.bind(this));

            return React.createElement(
                'div',
                { className: 'gameComponent', id: 'pendingEffects' },
                React.createElement(
                    'div',
                    { id: 'pendginEffectsList' },
                    listTargetEffectsDiv,
                    listGeneralEffectsDiv
                ),
                this.state.cancelActive ? React.createElement(
                    'div',
                    { id: 'cancelButtonPendingEffects' },
                    React.createElement(
                        'button',
                        { type: 'button', onClick: function onClick() {
                                return _this15.handleCancelClick();
                            } },
                        'Annuler'
                    )
                ) : React.createElement('div', { id: 'cancelButtonPendingEffects' })
            );
        }
    }]);

    return PendingEffects;
}(React.Component);

function playGame() {

    //The React render should be here ultimately
    ReactDOM.render(React.createElement(
        'div',
        { id: 'runningGame' },
        React.createElement(
            'div',
            { className: 'columnLeft', id: 'gameLeft' },
            React.createElement(Pist, { pawns: ["cyan", "green"], sizePiste: 5, dicePos: 2, diceValue: 4 }),
            React.createElement(
                'div',
                { id: 'boardArea' },
                React.createElement(MapCells, null),
                React.createElement(Barks, null)
            ),
            React.createElement(Deck, { psg_cards: [], action_cards: [] }),
            React.createElement(PendingEffects, null)
        ),
        React.createElement(
            'div',
            { className: 'columnRight', id: 'gameRight' },
            React.createElement(ListJoueurs, { joueurs: [{ couleur: "white", pseudo: "" }] }),
            React.createElement(Chat, null)
        )
    ), document.getElementById('gameArea'));

    //console.log(listplayers);
    //listplayers.updatePlayers([{couleur: "red", pseudo: "tif"},{couleur: "yellow", pseudo: "new"}]);

    //io_socket.on('updateListPlayers', listplayers.updatePlayers);
    //io_socket.emit('gameReady');
};