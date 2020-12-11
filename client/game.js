'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Banner = function (_React$Component) {
    _inherits(Banner, _React$Component);

    function Banner(props) {
        _classCallCheck(this, Banner);

        var _this = _possibleConstructorReturn(this, (Banner.__proto__ || Object.getPrototypeOf(Banner)).call(this, props));

        _this.state = {
            text: "",
            subtext: ""
        };

        _this.updateText = _this.updateText.bind(_this);
        _this.updateSubText = _this.updateSubText.bind(_this);

        io_socket.on("updateBannerText", _this.updateText);
        io_socket.on("updateBannerSubText", _this.updateSubText);
        return _this;
    }

    _createClass(Banner, [{
        key: "updateText",
        value: function updateText(new_text) {
            this.setState({ text: new_text });
        }
    }, {
        key: "updateSubText",
        value: function updateSubText(new_text) {
            this.setState({ subtext: new_text });
        }
    }, {
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                { className: "bannerDiv" },
                React.createElement(
                    "h3",
                    { className: "banner" },
                    this.state.text
                ),
                React.createElement(
                    "h5",
                    { className: "subBanner" },
                    this.state.subtext
                )
            );
        }
    }]);

    return Banner;
}(React.Component);

var ListJoueurs = function (_React$Component2) {
    _inherits(ListJoueurs, _React$Component2);

    /*
     * expected props : {joueurs: [{couleur: "", pseudo: "", state: ""}]}
     * with always at least one element, the self player at the beginning
     */
    function ListJoueurs(props) {
        _classCallCheck(this, ListJoueurs);

        var _this2 = _possibleConstructorReturn(this, (ListJoueurs.__proto__ || Object.getPrototypeOf(ListJoueurs)).call(this, props));

        _this2.state = {
            list: props.joueurs.slice(),
            hoverable: false
        };

        _this2.updateHoverable = _this2.updateHoverable.bind(_this2);
        _this2.updatePlayers = _this2.updatePlayers.bind(_this2);

        //probably lots of socket binds in constructor
        io_socket.on('updateListPlayers', _this2.updatePlayers);
        io_socket.on('updateListPlayersHoverable', _this2.updateHoverable);
        return _this2;
    }

    _createClass(ListJoueurs, [{
        key: "updateHoverable",
        value: function updateHoverable(val) {
            this.setState({ hoverable: val });
        }
    }, {
        key: "handleMouseEnter",
        value: function handleMouseEnter(id) {
            if (!this.state.hoverable) return;
            var divPlayer = document.getElementById(id);
            divPlayer.style.border = "medium solid red";
        }
    }, {
        key: "handleMouseLeave",
        value: function handleMouseLeave(id) {
            //if(!this.state.hoverable) return;
            var divPlayer = document.getElementById(id);
            divPlayer.style.border = "";
        }
    }, {
        key: "handleClick",
        value: function handleClick(pseudo) {
            if (!this.state.hoverable) return;
            console.log('emitting selectedPlayer : ' + pseudo);
            io_socket.emit('selectedPlayer', pseudo);
        }
    }, {
        key: "componentDidMount",
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
        key: "updatePlayers",
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
        key: "render",
        value: function render() {
            var _this3 = this;

            var selfPlayer = this.state.list[0];
            var otherPlayers = this.state.list.slice(1);

            var otherDivs = otherPlayers.map(function (player) {
                return React.createElement(
                    "div",
                    { key: player.couleur, id: "listPlayers" + player.couleur, className: "pseudoListElement",
                        onMouseEnter: function onMouseEnter() {
                            return _this3.handleMouseEnter("listPlayers" + player.couleur);
                        }, onMouseLeave: function onMouseLeave() {
                            return _this3.handleMouseLeave("listPlayers" + player.couleur);
                        }, onClick: function onClick() {
                            return _this3.handleClick(player.pseudo);
                        } },
                    React.createElement("canvas", { id: "canvasListPlayers" + player.couleur, height: 50, width: 50 }),
                    React.createElement(
                        "div",
                        { className: "pseudoList" },
                        React.createElement(
                            "span",
                            { className: "pseudoList" + player.state },
                            player.pseudo
                        )
                    )
                );
            });

            return React.createElement(
                "div",
                { id: "listPlayers", className: "gameComponent" },
                React.createElement(
                    "div",
                    { key: selfPlayer.couleur, id: "listPlayers" + selfPlayer.couleur, className: "pseudoListElement" },
                    React.createElement("canvas", { id: "canvasListPlayers" + selfPlayer.couleur, width: 50, height: 50 }),
                    React.createElement(
                        "div",
                        { className: "pseudoList" },
                        React.createElement(
                            "span",
                            { className: "pseudoList" + selfPlayer.state },
                            selfPlayer.pseudo
                        )
                    )
                ),
                otherDivs
            );
        }
    }]);

    return ListJoueurs;
}(React.Component);

var Chat = function (_React$Component3) {
    _inherits(Chat, _React$Component3);

    function Chat(props) {
        _classCallCheck(this, Chat);

        var _this4 = _possibleConstructorReturn(this, (Chat.__proto__ || Object.getPrototypeOf(Chat)).call(this, props));

        _this4.state = {
            logs: []

            //also probably lots of binds here
            //io_socket.removeListener('displayGeneralMessage');

        };_this4.displayGeneralMessage = _this4.displayGeneralMessage.bind(_this4);
        _this4.displayAlertMessage = _this4.displayAlertMessage.bind(_this4);
        _this4.displayWhisper = _this4.displayWhisper.bind(_this4);
        _this4.handleSubmit = _this4.handleSubmit.bind(_this4);

        io_socket.on('displayGeneralMessage', _this4.displayGeneralMessage);
        io_socket.on('displayWhisper', _this4.displayWhisper);
        io_socket.on('displayAlertMessage', _this4.displayAlertMessage);
        return _this4;
    }

    _createClass(Chat, [{
        key: "scrollUpdate",
        value: function scrollUpdate(id) {
            var element = document.getElementById(id);
            var topPos = element.offsetTop;
            document.getElementById("chatLogGame").scrollTop = topPos;
        }
    }, {
        key: "displayGeneralMessage",
        value: function displayGeneralMessage(data) {
            var _this5 = this;

            /*data = {color: "", pseudo: ""} */
            this.setState(function (state) {
                return { logs: state.logs.concat([React.createElement(
                        "div",
                        { id: "messageLog" + _this5.state.logs.length, key: state.logs.length },
                        React.createElement(
                            "span",
                            { style: { fontWeight: "bold", color: data.color } },
                            data.pseudo + ':'
                        ),
                        ' ' + data.text
                    )]) };
            });

            this.scrollUpdate("messageLog" + (this.state.logs.length - 1));
        }
    }, {
        key: "displayWhisper",
        value: function displayWhisper(data) {
            var _this6 = this;

            this.setState(function (state) {
                return { logs: state.logs.concat([React.createElement(
                        "div",
                        { id: "messageLog" + _this6.state.logs.length, key: state.logs.length },
                        React.createElement(
                            "span",
                            { style: { fontStyle: "italic" } },
                            data
                        )
                    )]) };
            });

            this.scrollUpdate("messageLog" + (this.state.logs.length - 1));
        }
    }, {
        key: "displayAlertMessage",
        value: function displayAlertMessage(data) {
            var _this7 = this;

            this.setState(function (state) {
                return { logs: state.logs.concat([React.createElement(
                        "div",
                        { id: "messageLog" + _this7.state.logs.length, key: state.logs.length },
                        React.createElement(
                            "span",
                            { style: { color: "red" } },
                            data
                        )
                    )]) };
            });

            this.scrollUpdate("messageLog" + (this.state.logs.length - 1));
        }
    }, {
        key: "handleSubmit",
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
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                { className: "gameComponent", id: "chatAreaGame" },
                React.createElement(
                    "div",
                    { className: "chatLog", id: "chatLogGame" },
                    this.state.logs
                ),
                React.createElement(
                    "form",
                    { className: "chatForm", id: "chatFormGame", onSubmit: this.handleSubmit, autoComplete: "off" },
                    React.createElement("input", { className: "chatInput", id: "chatInputGame", type: "text" })
                )
            );
        }
    }]);

    return Chat;
}(React.Component);

var Pist = function (_React$Component4) {
    _inherits(Pist, _React$Component4);

    function Pist(props) {
        _classCallCheck(this, Pist);

        var _this8 = _possibleConstructorReturn(this, (Pist.__proto__ || Object.getPrototypeOf(Pist)).call(this, props));

        _this8.state = {
            pawns: props.pawns, //just a list of colors
            sizePiste: props.sizePiste,
            dicePos: props.dicePos,
            diceValue: props.diceValue
        };

        _this8.updatePawns = _this8.updatePawns.bind(_this8);
        _this8.updateSizePiste = _this8.updateSizePiste.bind(_this8);
        _this8.updateDice = _this8.updateDice.bind(_this8);

        // io binds
        io_socket.on('updatePiste', function (data) {
            this.updatePawns(data.pawns);
            this.updateSizePiste(data.size);
            this.updateDice(data.dice);
        }.bind(_this8));
        return _this8;
    }

    _createClass(Pist, [{
        key: "clearAllDiceCanvas",
        value: function clearAllDiceCanvas() {
            for (var i = 0; i < this.state.sizePiste; i++) {
                var canvas = document.getElementById("canvasPisteDice" + i);
                var ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }, {
        key: "colorPawns",
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
        key: "colorDice",
        value: function colorDice() {
            if (this.state.diceValue > 9) {
                console.log("Warning : dice value overflow : " + this.state.diceValue);
                return;
            }
            if (this.state.dicePos >= 0 && this.state.dicePos < this.state.sizePiste && this.state.diceValue) {
                var canvas = document.getElementById("canvasPisteDice" + this.state.dicePos);
                var ctx = canvas.getContext("2d");
                ctx.font = "40px Texturina";
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.fillText(this.state.diceValue, canvas.width / 2, canvas.height * (2 / 3));
            }
        }
    }, {
        key: "updatePawns",
        value: function updatePawns(new_pawns) {
            this.setState({ pawns: new_pawns });
            this.colorPawns();
        }
    }, {
        key: "updateSizePiste",
        value: function updateSizePiste(new_size) {
            this.setState({ sizePiste: new_size });
            this.colorPawns();
            this.clearAllDiceCanvas();
            this.colorDice();
        }
    }, {
        key: "updateDice",
        value: function updateDice(new_dice) {
            this.setState({ dicePos: new_dice.pos, diceValue: new_dice.val });
            this.clearAllDiceCanvas();
            this.colorDice();
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            //we draw the pawns and the dice
            this.colorPawns();

            this.colorDice();
        }
    }, {
        key: "render",
        value: function render() {

            var pawnsCanvas = this.state.pawns.map(function (pawnColor) {
                return React.createElement("canvas", { key: "canvasPistePawn" + pawnColor, id: "canvasPistePawn" + pawnColor, width: 50, height: 50, style: { border: "2px solid white" } });
            });

            var pisteCanvas = [];
            for (var i = 0; i < this.state.sizePiste; i++) {
                pisteCanvas.push(React.createElement("canvas", { key: "canvasPisteDice" + i, id: "canvasPisteDice" + i, width: 50, height: 50, style: { border: "2px solid white" } }));
            }

            return React.createElement(
                "div",
                { className: "gameComponent", id: "pisteCerbere" },
                pawnsCanvas,
                " ",
                pisteCanvas
            );
        }
    }]);

    return Pist;
}(React.Component);

var Deck = function (_React$Component5) {
    _inherits(Deck, _React$Component5);

    /*
     * psg_cards et action_cards : normal card + idx for server
     */
    function Deck(props) {
        _classCallCheck(this, Deck);

        var _this9 = _possibleConstructorReturn(this, (Deck.__proto__ || Object.getPrototypeOf(Deck)).call(this, props));

        _this9.state = {
            psg_cards: props.psg_cards,
            action_cards: props.action_cards,
            psg_hoverable: false,
            action_hoverable: false,
            show_skip: false

            //binds function
        };_this9.updatePsgCards = _this9.updatePsgCards.bind(_this9);
        _this9.updateActionCards = _this9.updateActionCards.bind(_this9);
        _this9.updatePsgHoverable = _this9.updatePsgHoverable.bind(_this9);
        _this9.updateActionHoverable = _this9.updateActionHoverable.bind(_this9);
        _this9.updateSkipable = _this9.updateSkipable.bind(_this9);

        //binds
        io_socket.on('updatePsgCards', _this9.updatePsgCards);
        io_socket.on("updateActionCards", _this9.updateActionCards);
        io_socket.on('updatePsgHoverable', _this9.updatePsgHoverable);
        io_socket.on('updateActionHoverable', _this9.updateActionHoverable);
        io_socket.on('updateSkipable', _this9.updateSkipable);
        return _this9;
    }

    _createClass(Deck, [{
        key: "drawCards",
        value: function drawCards() {
            this.state.psg_cards.forEach(function (psg) {
                var listIdsCanvas = [];
                var listEffects = [];
                psg.forEach(function (effect) {
                    listIdsCanvas.push("psgCardCanvasEffect" + effect.idx);
                    listIdsCanvas.push("psgCardCanvasCost" + effect.idx);
                    listEffects.push(effect.effect.targetEffects.concat(effect.effect.generalEffects));
                    listEffects.push(effect.cost.targetEffects.concat(effect.cost.generalEffects));
                });
                drawListEffect(listIdsCanvas, listEffects);
            });
            this.state.action_cards.forEach(function (action) {
                var listIdsCanvas = [];
                var listEffects = [];
                action.effects.forEach(function (effect) {
                    listIdsCanvas.push("actionCardCanvasEffect" + effect.idx);
                    listIdsCanvas.push("actionCardCanvasCost" + effect.idx);
                    listEffects.push(effect.effect.targetEffects.concat(effect.effect.generalEffects));
                    listEffects.push(effect.cost.targetEffects.concat(effect.cost.generalEffects));
                });
                drawListEffect(listIdsCanvas, listEffects);
            });
        }
    }, {
        key: "updatePsgCards",
        value: function updatePsgCards(new_psg_cards) {
            this.setState({ psg_cards: new_psg_cards });
            this.drawCards();
        }
    }, {
        key: "updateActionCards",
        value: function updateActionCards(new_action_cards) {
            this.setState({ action_cards: new_action_cards });
            this.drawCards();
        }
    }, {
        key: "updatePsgHoverable",
        value: function updatePsgHoverable(new_val) {
            this.setState({ psg_hoverable: new_val });
        }
    }, {
        key: "updateActionHoverable",
        value: function updateActionHoverable(new_val) {
            this.setState({ action_hoverable: new_val });
        }
    }, {
        key: "updateSkipable",
        value: function updateSkipable(new_val) {
            this.setState({ show_skip: new_val });
        }
    }, {
        key: "handleMouseEnterPsg",
        value: function handleMouseEnterPsg(id) {
            if (!this.state.psg_hoverable) return;
            var divCard = document.getElementById(id);
            if (divCard != undefined) divCard.style.border = "medium solid red";
        }
    }, {
        key: "handleMouseEnterAction",
        value: function handleMouseEnterAction(id) {
            if (!this.state.action_hoverable) return;
            var divCard = document.getElementById(id);
            if (divCard != undefined) divCard.style.border = "medium solid red";
        }
    }, {
        key: "handleMouseLeavePsg",
        value: function handleMouseLeavePsg(id) {
            //if(!this.state.psg_hoverable) return;
            var divCard = document.getElementById(id);
            if (divCard != undefined) divCard.style.border = "";
        }
    }, {
        key: "handleMouseLeaveAction",
        value: function handleMouseLeaveAction(id) {
            //if(!this.state.action_hoverable) return;
            var divCard = document.getElementById(id);
            if (divCard != undefined) divCard.style.border = "";
        }
    }, {
        key: "handleClickPsg",
        value: function handleClickPsg(idx) {
            if (!this.state.psg_hoverable) return;
            io_socket.emit('selectedPsgCard', idx);
        }
    }, {
        key: "handleClickAction",
        value: function handleClickAction(idx) {
            if (!this.state.action_hoverable) return;
            io_socket.emit('selectedActionCard', idx);
        }
    }, {
        key: "handleClickSkip",
        value: function handleClickSkip() {
            if (!this.state.show_skip) return;
            io_socket.emit('skipAction');
        }
    }, {
        key: "render",
        value: function render() {
            var _this10 = this;

            var divsPsg = this.state.psg_cards.map(function (psg_card) {
                return React.createElement(
                    "div",
                    { className: "psgCard", id: "cardPsg" + psg_card[0].idx, key: "cardPsg" + psg_card[0].idx },
                    psg_card.map(function (effect) {
                        return React.createElement(
                            "div",
                            { className: "effect", id: "cardPsgEffect" + effect.idx, key: "cardPsgEffect" + effect.idx, onClick: function onClick() {
                                    return _this10.handleClickPsg(effect.idx);
                                },
                                onMouseEnter: function onMouseEnter() {
                                    return _this10.handleMouseEnterPsg("cardPsgEffect" + effect.idx);
                                }, onMouseLeave: function onMouseLeave() {
                                    return _this10.handleMouseLeavePsg("cardPsgEffect" + effect.idx);
                                } },
                            React.createElement("canvas", { id: "psgCardCanvasEffect" + effect.idx }),
                            React.createElement("canvas", { id: "psgCardCanvasCost" + effect.idx })
                        );
                    })
                );
            });

            var divsAct = this.state.action_cards.map(function (act_card) {
                return React.createElement(
                    "div",
                    { className: "actionCard", id: "cardAct" + act_card.effects[0].idx, key: "cardAct" + act_card.effects[0].idx },
                    React.createElement(
                        "span",
                        { className: "actionName" },
                        act_card.name
                    ),
                    act_card.effects.map(function (effect) {
                        return React.createElement(
                            "div",
                            { className: "effect", id: "cardActEffect" + effect.idx, key: "cardPsgEffect" + effect.idx, onClick: function onClick() {
                                    return _this10.handleClickAction(effect.idx);
                                },
                                onMouseEnter: function onMouseEnter() {
                                    return _this10.handleMouseEnterAction("cardActEffect" + effect.idx);
                                }, onMouseLeave: function onMouseLeave() {
                                    return _this10.handleMouseLeaveAction("cardActEffect" + effect.idx);
                                } },
                            React.createElement("canvas", { id: "actionCardCanvasEffect" + effect.idx }),
                            React.createElement("canvas", { id: "actionCardCanvasCost" + effect.idx })
                        );
                    })
                );
            });

            var buttonDiv = this.state.show_skip ? React.createElement(
                "div",
                { id: "skipButtonDiv" },
                React.createElement(
                    "button",
                    { className: "button", id: "skipbutton", type: "button", onClick: function onClick() {
                            return _this10.handleClickSkip();
                        } },
                    "Sauter l'action"
                )
            ) : React.createElement("div", { id: "skipButtonDiv" });

            return React.createElement(
                "div",
                { className: "gameComponent", id: "deck" },
                divsPsg,
                divsAct,
                buttonDiv
            );
        }
    }]);

    return Deck;
}(React.Component);

var Barks = function (_React$Component6) {
    _inherits(Barks, _React$Component6);

    function Barks(props) {
        _classCallCheck(this, Barks);

        var _this11 = _possibleConstructorReturn(this, (Barks.__proto__ || Object.getPrototypeOf(Barks)).call(this, props));

        _this11.state = {
            unveiled: false,
            barksData: 3,
            hoverableBarks: [],
            showSeeButton: false,
            showTransposeButton: false

            //======= bindings
        };_this11.updateBarksData = _this11.updateBarksData.bind(_this11);
        _this11.updateSeeButton = _this11.updateSeeButton.bind(_this11);
        _this11.updateTransposeButton = _this11.updateTransposeButton.bind(_this11);
        _this11.updateHoverableBarks = _this11.updateHoverableBarks.bind(_this11);

        io_socket.on('updateBarks', _this11.updateBarksData);
        io_socket.on('updateSeeButton', _this11.updateSeeButton);
        io_socket.on('updateTransposeButton', _this11.updateTransposeButton);
        io_socket.on('updateHoverableBarks', _this11.updateHoverableBarks);
        return _this11;
    }

    _createClass(Barks, [{
        key: "updateBarksData",
        value: function updateBarksData(val) {
            this.setState({ unveiled: val.unveiled, barksData: val.data });
        }
    }, {
        key: "updateSeeButton",
        value: function updateSeeButton(val) {
            this.setState({ showSeeButton: val });
        }
    }, {
        key: "updateTransposeButton",
        value: function updateTransposeButton(val) {
            this.setState({ showTransposeButton: val });
        }
    }, {
        key: "updateHoverableBarks",
        value: function updateHoverableBarks(barks) {
            this.setState({ hoverableBarks: barks });
        }
    }, {
        key: "handleMouseEnter",
        value: function handleMouseEnter(number) {
            if (!this.state.hoverableBarks.includes(number)) return;
            var divBark = document.getElementById("barkDiv" + number);
            divBark.style.border = "medium solid green";
        }
    }, {
        key: "handleMouseLeave",
        value: function handleMouseLeave(number) {
            //if(!(this.state.hoverableBarks.includes(number))) return;
            var divBark = document.getElementById("barkDiv" + number);
            divBark.style.border = "";
        }
    }, {
        key: "handleClickBark",
        value: function handleClickBark(number) {
            if (!this.state.hoverableBarks.includes(number)) return;
            io_socket.emit("selectedBark", number);
        }
    }, {
        key: "handleClickShow",
        value: function handleClickShow() {
            if (!this.state.showSeeButton) return;
            io_socket.emit("clickSeeBark");
        }
    }, {
        key: "handleClickTranspose",
        value: function handleClickTranspose() {
            if (!this.state.showTransposeButton) return;
            io_socket.emit("clickTransposeBark");
        }
    }, {
        key: "render",
        value: function render() {
            var _this13 = this;

            var barksDiv = this.state.unveiled ? [React.createElement(
                "div",
                { id: "barkDiv0", key: "barkDiv0" },
                React.createElement(
                    "span",
                    { className: "roomBark" },
                    "Places : ",
                    this.state.barksData
                )
            )] : function () {
                var _this12 = this;

                var res = [];

                var _loop = function _loop(i) {
                    res.push(React.createElement(
                        "div",
                        { id: "barkDiv" + i, key: "barkDiv" + i, onMouseEnter: function onMouseEnter() {
                                return _this12.handleMouseEnter(i);
                            }, onMouseLeave: function onMouseLeave() {
                                return _this12.handleMouseLeave(i);
                            }, onClick: function onClick() {
                                return _this12.handleClickBark(i);
                            } },
                        React.createElement(
                            "span",
                            { className: "barkUnknown" },
                            "Barque " + (i + 1)
                        )
                    ));
                };

                for (var i = 0; i < this.state.barksData; i++) {
                    _loop(i);
                }
                return res;
            }.bind(this)();

            return React.createElement(
                "div",
                { id: "barkArea", className: "gameComponent" },
                React.createElement(
                    "div",
                    { id: "barksList" },
                    barksDiv
                ),
                React.createElement(
                    "div",
                    { id: "barkButtons" },
                    this.state.showSeeButton ? React.createElement(
                        "div",
                        { id: "barkShowButton" },
                        React.createElement(
                            "button",
                            { className: "button", type: "button", onClick: function onClick() {
                                    return _this13.handleClickShow();
                                } },
                            "Voir"
                        )
                    ) : React.createElement("div", { id: "barkShowButton" }),
                    this.state.showTransposeButton ? React.createElement(
                        "div",
                        { id: "barkTransposeButton" },
                        React.createElement(
                            "button",
                            { className: "button", type: "button", onClick: function onClick() {
                                    return _this13.handleClickTranspose();
                                } },
                            "Echanger"
                        )
                    ) : React.createElement("div", { id: "barkTransposeButton" })
                )
            );
        }
    }]);

    return Barks;
}(React.Component);

var MapCells = function (_React$Component7) {
    _inherits(MapCells, _React$Component7);

    /*
        cells: {
            players: [colors],
            cerbere
            TODO : effets, pilotis, portails, etc
        }
        pilotis : [idx],
        bridges: [{
            connectedCells: [idx],
            intact: bool
        }]
        portals; [{
            connectedCells: [idx],
            activator: idx
        }]
    */
    function MapCells(props) {
        _classCallCheck(this, MapCells);

        var _this14 = _possibleConstructorReturn(this, (MapCells.__proto__ || Object.getPrototypeOf(MapCells)).call(this, props));

        _this14.state = {
            cells: [],
            pos_cerbere: -1,
            highlighted: [],

            unveil: 0,
            pilotis: [],
            bridges: [],
            portals: [],

            specificsCanvas: []
        };

        //===== bindings
        _this14.updateData = _this14.updateData.bind(_this14);
        _this14.updateHighlighted = _this14.updateHighlighted.bind(_this14);

        io_socket.on('updateMap', _this14.updateData);
        io_socket.on('updateMapHighlighted', _this14.updateHighlighted);
        return _this14;
    }

    _createClass(MapCells, [{
        key: "pilotisToCanvasId",
        value: function pilotisToCanvasId(idx_cell) {
            return "canvasIdPiloti" + idx_cell;
        }
    }, {
        key: "unveilToCanvasId",
        value: function unveilToCanvasId(idx_cell) {
            return "canvasIdUnveil" + idx_cell;
        }
    }, {
        key: "bridgeToCanvasId",
        value: function bridgeToCanvasId(idx_bridge, idx_cell) {
            return "canvasIdBridge" + idx_bridge + "cell" + idx_cell;
        }
    }, {
        key: "activatorToCanvasId",
        value: function activatorToCanvasId(idx_portal) {
            return "canvasIdActivator" + idx_portal;
        }
    }, {
        key: "portalToCanvasId",
        value: function portalToCanvasId(idx_portal, idx_cell) {
            return "canvasIdPortal" + idx_portal + "cell" + idx_cell;
        }
    }, {
        key: "drawBorders",
        value: function drawBorders() {
            this.state.cells.forEach(function (cell, idx) {
                if (cell.cerbere) {
                    document.getElementById("cellBorder" + idx).style.border = "thin solid white";
                } else {
                    document.getElementById("cellBorder" + idx).style.border = "thin solid #aba0bd";
                }
            });
        }
    }, {
        key: "updateData",
        value: function updateData(new_data) {
            this.setState({ cells: new_data.cells, pos_cerbere: new_data.pos_cerbere, unveil: new_data.unveil,
                pilotis: new_data.pilotis, bridges: new_data.bridges, portals: new_data.portals });

            var newSpecifics = [];
            for (var i = 0; i < new_data.cells.length; i++) {
                newSpecifics.push(this.getCellSpecificsCanvas(i, new_data.unveil, new_data.portals, new_data.bridges, new_data.pilotis));
            }
            this.setState({ specificsCanvas: newSpecifics });

            this.drawBorders();
            this.drawSpecifics();
            this.drawPawns();
            this.drawCerbere();
        }
    }, {
        key: "drawSpecifics",
        value: function drawSpecifics() {
            //unveil
            drawMapSpecifics(this.unveilToCanvasId(this.state.unveil), "unveil");
            this.state.pilotis.forEach(function (idxPiloti) {
                drawMapSpecifics(this.pilotisToCanvasId(idxPiloti), "piloti");
            }.bind(this));
            this.state.bridges.forEach(function (bridge, idxBridge) {
                if (bridge.intact) {
                    bridge.connectedCells.forEach(function (idxCell) {
                        drawMapSpecifics(this.bridgeToCanvasId(idxBridge, idxCell), "bridge");
                    });
                }
            }.bind(this));
            this.state.portals.forEach(function (portal, idxPortal) {
                portal.connectedCells.forEach(function (idxCell) {
                    drawMapSpecifics(this.portalToCanvasId(idxPortal, idxCell), "portal");
                });
                drawMapSpecifics(this.activatorToCanvasId(idxPortal), "activator");
            }.bind(this));
        }
    }, {
        key: "drawPawns",
        value: function drawPawns() {
            this.state.cells.forEach(function (cell) {
                cell.players.forEach(function (playerColor) {
                    drawPawn("pawnMapCanvas" + playerColor, playerColor);
                }.bind(this));
            }.bind(this));
        }
    }, {
        key: "drawCerbere",
        value: function drawCerbere() {
            drawCerbereHandle("pawnMapCanvasCerbere");
        }
    }, {
        key: "handleMouseClick",
        value: function handleMouseClick(cellNumber) {
            if (!this.state.highlighted.includes(cellNumber)) return;
            io_socket.emit('selectedMapCell', cellNumber);
        }
    }, {
        key: "colorHightlighted",
        value: function colorHightlighted() {
            for (var i = 0; i < this.state.cells.length; i++) {
                // here, change cellDiv to cellContainer
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
        key: "updateHighlighted",
        value: function updateHighlighted(new_highlighted) {
            this.setState({ highlighted: new_highlighted });
            this.colorHightlighted();
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            this.colorHightlighted();
        }
    }, {
        key: "getCellSpecificsCanvas",
        value: function getCellSpecificsCanvas(idxCell, unveil, portals, bridges, pilotis) {
            var res = [];
            if (unveil == idxCell) {
                var canvasid = this.unveilToCanvasId(idxCell);
                res.push(React.createElement(
                    "div",
                    { id: "div" + canvasid, key: "div" + canvasid, className: "canvasSpecifics" },
                    React.createElement("canvas", { id: canvasid, key: canvasid })
                ));
            }
            if (pilotis.includes(idxCell)) {
                var _canvasid = this.pilotisToCanvasId(idxCell);
                res.push(React.createElement(
                    "div",
                    { id: "div" + _canvasid, key: "div" + _canvasid, className: "canvasSpecifics" },
                    React.createElement("canvas", { id: _canvasid, key: _canvasid })
                ));
            }
            bridges.forEach(function (bridge, bridgeIdx) {
                if (bridge.intact && bridge.connectedCells.includes(idxCell)) {
                    var _canvasid2 = this.bridgeToCanvasId(bridgeIdx, idxCell);
                    res.push(React.createElement(
                        "div",
                        { id: "div" + _canvasid2, key: "div" + _canvasid2, className: "canvasSpecifics" },
                        React.createElement("canvas", { id: _canvasid2, key: _canvasid2 })
                    ));
                }
            });
            portals.forEach(function (portal, portalIdx) {
                if (portal.activator == idxCell) {
                    var _canvasid3 = this.activatorToCanvasId(portalIdx);
                    res.push(React.createElement(
                        "div",
                        { id: "div" + _canvasid3, key: "div" + _canvasid3, className: "canvasSpecifics" },
                        React.createElement("canvas", { id: _canvasid3, key: _canvasid3 })
                    ));
                }
                if (portal.connectedCells.includes(idxCell)) {
                    var _canvasid4 = this.portalToCanvasId(portalIdx, idxCell);
                    res.push(React.createElement(
                        "div",
                        { id: "div" + _canvasid4, key: "div" + _canvasid4, className: "canvasSpecifics" },
                        React.createElement("canvas", { id: _canvasid4, key: _canvasid4 })
                    ));
                }
            });
            return res;
        }
    }, {
        key: "render",
        value: function render() {

            var cellDivs = this.state.cells.map(function (cell, index) {
                var _this15 = this;

                return React.createElement(
                    "div",
                    { id: "cellContainer" + index, key: "cellContainer" + index, className: "mapCellContainer",
                        onClick: function onClick() {
                            return _this15.handleMouseClick(index);
                        } },
                    React.createElement(
                        "div",
                        { id: "cellBorder" + index, className: "mapCellStateBorder" },
                        React.createElement(
                            "div",
                            { id: "cellDiv" + index, key: "cellDiv" + index, className: "mapCell" },

                            // here we draw the pawns
                            cell.players.map(function (colorPawn) {
                                return React.createElement(
                                    "div",
                                    { id: "pawnMapDiv" + colorPawn, className: "pawnMapDiv", key: "pawnMapDiv" + colorPawn },
                                    React.createElement("canvas", { id: "pawnMapCanvas" + colorPawn, key: "pawnMapCanvas" + colorPawn })
                                );
                            }),
                            this.state.pos_cerbere == index ? React.createElement(
                                "div",
                                { id: "pawnMapDivCerbere", className: "pawnMapDiv" },
                                React.createElement("canvas", { id: "pawnMapCanvasCerbere" })
                            ) : ""
                        ),
                        React.createElement(
                            "div",
                            { id: "cellSpecifics" + index, key: "cellSpecifics" + index, className: "mapCell" },
                            this.state.specificsCanvas[index]
                        )
                    )
                );
            }.bind(this));

            return React.createElement(
                "div",
                { id: "gameMap", className: "gameComponent" },
                cellDivs
            );
        }
    }]);

    return MapCells;
}(React.Component);

var PendingEffects = function (_React$Component8) {
    _inherits(PendingEffects, _React$Component8);

    function PendingEffects(props) {
        _classCallCheck(this, PendingEffects);

        var _this16 = _possibleConstructorReturn(this, (PendingEffects.__proto__ || Object.getPrototypeOf(PendingEffects)).call(this, props));

        _this16.state = {
            listEffects: { targetEffects: [], generalEffects: [] },
            cancelActive: false,
            hoverable: false
        };

        _this16.updateListEffects = _this16.updateListEffects.bind(_this16);
        _this16.updateCancelActive = _this16.updateCancelActive.bind(_this16);
        _this16.updateHoverable = _this16.updateHoverable.bind(_this16);

        io_socket.on('updatePendingEffects', _this16.updateListEffects);
        io_socket.on('updateCancelActive', _this16.updateCancelActive);
        io_socket.on('updateHoverablePendingEffects', _this16.updateHoverable);
        return _this16;
    }

    _createClass(PendingEffects, [{
        key: "updateListEffects",
        value: function updateListEffects(new_list) {
            this.setState({ listEffects: new_list });
            this.state.listEffects.targetEffects.forEach(function (subeffect, idx) {
                drawSubEffect("pendingEffectTargetCanvas" + idx, subeffect);
            });
            this.state.listEffects.generalEffects.forEach(function (subeffect, idx) {
                drawSubEffect("pendingEffectGeneralCanvas" + idx, subeffect);
            });
        }
    }, {
        key: "updateCancelActive",
        value: function updateCancelActive(new_val) {
            this.setState({ cancelActive: new_val });
        }
    }, {
        key: "updateHoverable",
        value: function updateHoverable(new_val) {
            this.setState({ hoverable: new_val });
        }
    }, {
        key: "handleMouseEnter",
        value: function handleMouseEnter(target, idx) {
            if (!this.state.hoverable) return;
            var effectDiv = document.getElementById('pending' + (target ? 'Target' : 'General') + 'Effect' + idx);
            effectDiv.style.border = "medium solid red";
        }
    }, {
        key: "handleMouseLeave",
        value: function handleMouseLeave(target, idx) {
            //if(!this.state.hoverable) return;
            var effectDiv = document.getElementById('pending' + (target ? 'Target' : 'General') + 'Effect' + idx);
            effectDiv.style.border = "";
        }
    }, {
        key: "handleEffectClick",
        value: function handleEffectClick(target, idx) {
            if (!this.state.hoverable) return;
            io_socket.emit('selectedPendingEffect', { targeted: target, idx: idx });
        }
    }, {
        key: "handleCancelClick",
        value: function handleCancelClick() {
            if (!this.state.cancelActive) return;
            io_socket.emit('cancelActiveEffect');
        }
    }, {
        key: "render",
        value: function render() {
            var _this19 = this;

            var listTargetEffectsDiv = this.state.listEffects.targetEffects.map(function (subEffect, idx) {
                var _this17 = this;

                return React.createElement(
                    "div",
                    { key: "pendingTargetEffect" + idx, id: "pendingTargetEffect" + idx, onMouseEnter: function onMouseEnter() {
                            return _this17.handleMouseEnter(true, idx);
                        }, onMouseLeave: function onMouseLeave() {
                            return _this17.handleMouseLeave(true, idx);
                        },
                        onClick: function onClick() {
                            return _this17.handleEffectClick(true, idx);
                        }, className: "pendingEffect" },
                    React.createElement("canvas", { id: "pendingEffectTargetCanvas" + idx })
                );
            }.bind(this));

            var listGeneralEffectsDiv = this.state.listEffects.generalEffects.map(function (effect, idx) {
                var _this18 = this;

                return React.createElement(
                    "div",
                    { key: "pendingGeneralEffect" + idx, id: "pendingGeneralEffect" + idx, onMouseEnter: function onMouseEnter() {
                            return _this18.handleMouseEnter(false, idx);
                        }, onMouseLeave: function onMouseLeave() {
                            return _this18.handleMouseLeave(false, idx);
                        },
                        onClick: function onClick() {
                            return _this18.handleEffectClick(false, idx);
                        }, className: "pendingEffect" },
                    React.createElement("canvas", { id: "pendingEffectGeneralCanvas" + idx })
                );
            }.bind(this));

            return React.createElement(
                "div",
                { className: "gameComponent", id: "pendingEffects" },
                React.createElement(
                    "div",
                    { id: "pendginEffectsList" },
                    listTargetEffectsDiv,
                    listGeneralEffectsDiv
                ),
                this.state.cancelActive ? React.createElement(
                    "div",
                    { id: "cancelButtonPendingEffects" },
                    React.createElement(
                        "button",
                        { className: "button", type: "button", onClick: function onClick() {
                                return _this19.handleCancelClick();
                            } },
                        "Annuler"
                    )
                ) : React.createElement("div", { id: "cancelButtonPendingEffects" })
            );
        }
    }]);

    return PendingEffects;
}(React.Component);

function playGame() {

    //The React render should be here ultimately
    ReactDOM.render(React.createElement(
        "div",
        { id: "runningGame" },
        React.createElement(
            "div",
            { className: "columnLeft", id: "gameLeft" },
            React.createElement(Banner, null),
            React.createElement(Pist, { pawns: ["cyan", "green"], sizePiste: 5, dicePos: 2, diceValue: 4 }),
            React.createElement(
                "div",
                { id: "boardArea" },
                React.createElement(MapCells, null)
            ),
            React.createElement(Deck, { psg_cards: [], action_cards: [] }),
            React.createElement(
                "div",
                null,
                React.createElement(
                    "div",
                    { className: "columnLeftEqual" },
                    React.createElement(PendingEffects, null)
                ),
                React.createElement(
                    "div",
                    { className: "columnRightEqual" },
                    React.createElement(Barks, null)
                )
            )
        ),
        React.createElement(
            "div",
            { className: "columnRight", id: "gameRight" },
            React.createElement(ListJoueurs, { joueurs: [{ couleur: "white", pseudo: "" }] }),
            React.createElement(Chat, null)
        )
    ), document.getElementById('gameArea'));

    //console.log(listplayers);
    //listplayers.updatePlayers([{couleur: "red", pseudo: "tif"},{couleur: "yellow", pseudo: "new"}]);

    //io_socket.on('updateListPlayers', listplayers.updatePlayers);
    //io_socket.emit('gameReady');
};