'use strict';

class ListJoueurs extends React.Component {
    /*
     * expected props : {joueurs: [{couleur: "", pseudo: ""}]}
     * with always at least one element, the self player at the beginning
     */
    constructor(props) {
        super(props);

        this.state = {
            list: props.joueurs.slice(),
            hoverable: false,
        };

        this.updateHoverable = this.updateHoverable.bind(this);
        this.updatePlayers = this.updatePlayers.bind(this);

        //probably lots of socket binds in constructor
        io_socket.on('updateListPlayers', this.updatePlayers);
        io_socket.on('updateListPlayersHoverable', this.updateHoverable);
    };

    updateHoverable(val) {
        this.setState({hoverable: val});
    }

    handleMouseEnter(id) {
        if(!this.state.hoverable) return;
        var divPlayer = document.getElementById(id);
        divPlayer.style.border = "medium solid red";
    }

    handleMouseLeave (id) {
        //if(!this.state.hoverable) return;
        var divPlayer = document.getElementById(id);
        divPlayer.style.border = "";
    }

    handleClick(pseudo) {
        if(!this.state.hoverable) return;
        console.log('emitting selectedPlayer : '+pseudo);
        io_socket.emit('selectedPlayer', pseudo);
    }

    componentDidMount() {
        this.props.joueurs.forEach(function(player){
            var canvas = document.getElementById("canvasListPlayers"+player.couleur);
            
            var context = canvas.getContext("2d");

            context.beginPath();
            context.fillStyle=player.couleur;
            context.arc(25, 25, 20, 0, 2 * Math.PI);
            context.fill();
        });

    };

    updatePlayers(new_players) {

        this.setState({list: new_players});
        this.state.list.forEach(function(player){
            var canvas = document.getElementById("canvasListPlayers"+player.couleur);
            
            var context = canvas.getContext("2d");

            context.beginPath();
            context.fillStyle=player.couleur;
            context.arc(25, 25, 20, 0, 2 * Math.PI);
            context.fill();
        });
        
    }


    render() {
        const selfPlayer = this.state.list[0];
        const otherPlayers = this.state.list.slice(1);

        const otherDivs = otherPlayers.map((player) => 
            (<div key={player.couleur} id={"listPlayers" +player.couleur} 
                onMouseEnter={() => this.handleMouseEnter("listPlayers"+player.couleur)} onMouseLeave={() => this.handleMouseLeave("listPlayers"+player.couleur)} onClick={() => this.handleClick(player.pseudo)}>
                <canvas id={"canvasListPlayers"+player.couleur} height={50} width={50}></canvas>
                <span className="pseudoList">{player.pseudo}</span>
            </div>
            )
        );

        return (
            <div id="listPlayers" className="gameComponent">
                <div key={selfPlayer.couleur} id={"listPlayers" +selfPlayer.couleur}>
                    <canvas id={"canvasListPlayers"+selfPlayer.couleur} width={50} height={50}/>
                    <span className="pseudoList">{selfPlayer.pseudo}</span></div>
                {otherDivs}
            </div>
        );
    };
}

class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logs: [],
        }

        //also probably lots of binds here
        //io_socket.removeListener('displayGeneralMessage');

        this.displayGeneralMessage = this.displayGeneralMessage.bind(this);
        this.displayAlertMessage = this.displayAlertMessage.bind(this);
        this.displayWhisper = this.displayWhisper.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        //TODO : code displayGeneralMessage
        io_socket.on('displayGeneralMessage', this.displayGeneralMessage);
        io_socket.on('displayWhisper', this.displayWhisper);
        io_socket.on('displayAlertMessage', this.displayAlertMessage);
    }

    displayGeneralMessage(data) {
        /*data = {color: "", pseudo: ""} */
        this.setState((state)=>
            ({logs: state.logs.concat([<div key={state.logs.length}><span style={{fontWeight: "bold", color: data.color}}>{data.pseudo+':'}</span>{' '+data.text}</div>])})
        );
    }

    displayWhisper(data){
        this.setState((state)=>
            ({logs: state.logs.concat([<div key={state.logs.length}><span style={{fontStyle: "italic"}}>{data}</span></div>])})
        );
    }

    displayAlertMessage(data) {
        this.setState((state)=>
            ({logs: state.logs.concat([<div key={state.logs.length}><span style={{color: "red"}}>{data}</span></div>])})
        );
    }

    handleSubmit(event) {

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

    render() {
        return (
            <div className="gameComponent" id="chatAreaGame">
                <div className="chatLog" id="chatLogGame">{this.state.logs}</div>
                <form className="chatForm" id="chatFormGame" onSubmit={this.handleSubmit} autoComplete="off">
                    <input className="chatInput" id="chatInputGame" type="text"></input>
                </form>
            </div>
        );
    }
}

class Pist extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pawns: props.pawns, //just a list of colors
            sizePiste: props.sizePiste,
            dicePos: props.dicePos,
            diceValue: props.diceValue,
        }

        this.updatePawns = this.updatePawns.bind(this);
        this.updateSizePiste = this.updateSizePiste.bind(this);
        this.updateDice = this.updateDice.bind(this);

        // io binds
        io_socket.on('updatePiste', (function(data){
            this.updatePawns(data.pawns);
            this.updateSizePiste(data.size);
            this.updateDice(data.dice);
        }).bind(this));
    }

    clearAllDiceCanvas() {
        for(let i=0; i<this.state.sizePiste; i++) {
            var canvas = document.getElementById("canvasPisteDice"+i);
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0,0, canvas.width, canvas.height);
        }
    }

    colorPawns() {
        this.state.pawns.forEach(function(colorPawn){
            var canvas = document.getElementById("canvasPistePawn"+colorPawn);
            var context = canvas.getContext("2d");
            context.beginPath();
            context.fillStyle=colorPawn;
            context.arc(25, 25, 20, 0, 2 * Math.PI);
            context.fill();
        });
    }

    colorDice() {
        if(this.state.diceValue > 9) {
            console.log("Warning : dice value overflow : "+this.state.diceValue);
            return;
        }
        if(this.state.dicePos >= 0 && this.state.dicePos < this.state.sizePiste && this.state.diceValue) {
            var canvas = document.getElementById("canvasPisteDice"+this.state.dicePos);
            var ctx = canvas.getContext("2d");
            ctx.font = "40px serif";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(this.state.diceValue, canvas.width/2, canvas.height*(3/4)); 
        }
    }

    updatePawns(new_pawns) {
        this.setState({pawns: new_pawns});
        this.colorPawns();
    }

    updateSizePiste(new_size) {
        this.setState({sizePiste: new_size});
        this.colorPawns();
        this.clearAllDiceCanvas();
        this.colorDice();
    }

    updateDice(new_dice) {
        this.setState({dicePos: new_dice.pos, diceValue: new_dice.val});
        this.clearAllDiceCanvas();
        this.colorDice();
    }

    componentDidMount() {
        //we draw the pawns and the dice
        this.colorPawns();

        //for now, we do it to avoid writing out of the canvas... maybe we can change it later
        this.colorDice();
    }

    render() {

        const pawnsCanvas = this.state.pawns.map((pawnColor) => 
            <canvas key={"canvasPistePawn"+pawnColor} id={"canvasPistePawn"+pawnColor} width={50} height={50} style={{border: "2px solid white"}}/>
        );

        let pisteCanvas = [];
        for(var i=0; i<this.state.sizePiste; i++) {
            pisteCanvas.push(
                <canvas key={"canvasPisteDice"+i} id={"canvasPisteDice"+i} width={50} height={50} style={{border: "2px solid white"}}/>
            );
        }

        return (
            <div className="gameComponent" id="pisteCerbere">
                {pawnsCanvas} {pisteCanvas}
            </div>
        );
    }
}

class Deck extends React.Component {
    /*
     * psg_cards et action_cards : normal card + idx for server
     */
    constructor(props) {
        super(props);
        this.state = {
            psg_cards: props.psg_cards,
            action_cards: props.action_cards,
            psg_hoverable: false,
            action_hoverable: false,
            show_skip: false,
        }

        //binds function
        this.updatePsgCards = this.updatePsgCards.bind(this);
        this.updateActionCards = this.updateActionCards.bind(this);
        this.updatePsgHoverable = this.updatePsgHoverable.bind(this);
        this.updateActionHoverable = this.updateActionHoverable.bind(this);
        this.updateSkipable = this.updateSkipable.bind(this);

        //binds
        io_socket.on('updatePsgCards', this.updatePsgCards);
        io_socket.on("updateActionCards", this.updateActionCards);
        io_socket.on('updatePsgHoverable', this.updatePsgHoverable);
        io_socket.on('updateActionHoverable', this.updateActionHoverable);
        io_socket.on('updateSkipable', this.updateSkipable);
    }

    updatePsgCards(new_psg_cards) {
        this.setState({psg_cards: new_psg_cards});
    }

    updateActionCards(new_action_cards) {
        this.setState({action_cards: new_action_cards});
    }

    updatePsgHoverable(new_val) {
        console.log("update psg hoverable: "+new_val);
        this.setState({psg_hoverable: new_val});
    }

    updateActionHoverable(new_val) {
        console.log("update action hoverable: " +new_val);
        this.setState({action_hoverable: new_val});
    }

    updateSkipable(new_val) {
        this.setState({show_skip: new_val});
    }

    handleMouseEnterPsg(id) {
        if(!this.state.psg_hoverable) return;
        var divCard = document.getElementById(id);
        if(divCard != undefined) divCard.style.border = "medium solid red";
    }

    handleMouseEnterAction(id) {
        if(!this.state.action_hoverable) return;
        var divCard = document.getElementById(id);
        if(divCard != undefined) divCard.style.border = "medium solid red";
    }

    handleMouseLeavePsg(id) {
        //if(!this.state.psg_hoverable) return;
        var divCard = document.getElementById(id);
        if(divCard != undefined) divCard.style.border = "";
    }

    handleMouseLeaveAction(id) {
        //if(!this.state.action_hoverable) return;
        var divCard = document.getElementById(id);
        if(divCard != undefined) divCard.style.border = "";
    }

    handleClickPsg(idx) {
        if(!this.state.psg_hoverable) return;
        console.log('sending selectedPsgCard');
        io_socket.emit('selectedPsgCard', idx);
    }

    handleClickAction(idx) {
        if(!this.state.action_hoverable) return;
        io_socket.emit('selectedActionCard', idx);
    }

    handleClickSkip() {
        if(!this.state.show_skip) return;
        io_socket.emit('skipAction');
    }

    render() {

        let divsPsg = this.state.psg_cards.map((psg_card) => (
            <div className="card" id={"cardPsg"+psg_card[0].idx} key={"cardPsg"+psg_card[0].idx}>
                {
                    psg_card.map((effect) => (
                        <div className="effect" id={"cardPsgEffect"+effect.idx} key={"cardPsgEffect"+effect.idx} onClick={() => this.handleClickPsg(effect.idx)}
                        onMouseEnter={() => this.handleMouseEnterPsg("cardPsgEffect"+effect.idx)} onMouseLeave={() => this.handleMouseLeavePsg("cardPsgEffect"+effect.idx)}>
                            {effect.idx}
                        </div>
                    ))
                }
            </div>
        ));

        let divsAct = this.state.action_cards.map((act_card) => (
            <div className="card" id={"cardAct"+act_card.effects[0].idx} key={"cardAct"+act_card.effects[0].idx}>
                {act_card.name}
                {
                    act_card.effects.map((effect) => (
                        <div className="effect" id={"cardActEffect"+effect.idx} key={"cardPsgEffect"+effect.idx} onClick={() => this.handleClickAction(effect.idx)}
                        onMouseEnter={() => this.handleMouseEnterAction("cardActEffect"+effect.idx)} onMouseLeave={() => this.handleMouseLeaveAction("cardActEffect"+effect.idx)}>
                            {effect.idx}
                        </div>
                    ))
                }
            </div>
        ));

        let buttonDiv = (this.state.show_skip) ? <div id="skipButtonDiv"><button id="skipbutton" type="button" onClick={() => this.handleClickSkip()}>skip action</button></div>
                         : <div id="skipButtonDiv"></div>;

        return(
            <div className="gameComponent" id="deck">
                {divsPsg}
                {divsAct}
                {buttonDiv}
            </div>
        );
    }
}

class Barks extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            unveiled: false,
            barksData: 3,
            hoverableBarks: [],
            showSeeButton: false,
            showTransposeButton: false,
        }

        //======= bindings
        this.updateBarksData = this.updateBarksData.bind(this);
        this.updateSeeButton = this.updateSeeButton.bind(this);
        this.updateTransposeButton = this.updateTransposeButton.bind(this);
        this.updateHoverableBarks = this.updateHoverableBarks.bind(this);

        io_socket.on('updateBarks', this.updateBarksData);
        io_socket.on('updateSeeButton', this.updateSeeButton);
        io_socket.on('updateTransposeButton', this.updateTransposeButton);
        io_socket.on('updateHoverableBarks', this.updateHoverableBarks);
    }

    updateBarksData(val) {
        this.setState({unveiled: val.unveiled, barksData: val.data});
    }

    updateSeeButton(val) {
        this.setState({showSeeButton: val});
    }

    updateTransposeButton(val) {
        this.setState({showTransposeButton: val});
    }

    updateHoverableBarks(barks) {
        this.setState({hoverableBarks: barks});
    }

    handleMouseEnter(number) {
        if(!(this.state.hoverableBarks.includes(number))) return;
        let divBark = document.getElementById("barkDiv"+number);
        divBark.style.border = "medium solid green";
    }

    handleMouseLeave(number) {
        //if(!(this.state.hoverableBarks.includes(number))) return;
        let divBark = document.getElementById("barkDiv"+number);
        divBark.style.border = "";
    }

    handleClickBark(number) {
        if(!this.state.hoverableBarks.includes(number)) return;
        io_socket.emit("selectedBark", number);
    }

    handleClickShow() {
        if(!this.state.showSeeButton) return;
        io_socket.emit("clickSeeBark");
    }

    handleClickTranspose() {
        if(!this.state.showTransposeButton) return;
        io_socket.emit("clickTransposeBark");
    }


    render() {

        var barksDiv = (this.state.unveiled)?
            [<div id="barkDiv0" key="barkDiv0"><span className="roomBark">Places : {this.state.barksData}</span></div>]
            :
            (function(){
                let res = [];
                for(let i=0; i<this.state.barksData; i++) {
                    res.push(
                        <div id={"barkDiv"+i} key={"barkDiv"+i} onMouseEnter={() => this.handleMouseEnter(i)} onMouseLeave={() => this.handleMouseLeave(i)} onClick={() => this.handleClickBark(i)}>
                            <span className="barkUnknown">
                                {"Bark "+(i+1)}
                            </span>
                        </div>
                    );
                }
                return res;
            }).bind(this)()
        ;



        return (
            <div id="barkArea" className="gameComponent">
                <div id="barksList">
                    {barksDiv}
                </div>
                <div id="barkButtons">
                    {(this.state.showSeeButton)? <div id="barkShowButton"><button type="button" onClick={() => this.handleClickShow()}>Show</button></div> : <div id="barkShowButton"></div>}
                    {(this.state.showTransposeButton)? <div id="barkTransposeButton"><button type="button" onClick={() => this.handleClickTranspose()}>Transpose</button></div> : <div id="barkTransposeButton"></div>}
                </div>
            </div>
        );
    }
}

class MapCells extends React.Component {
    /*
        cells: {
            players: [colors],
            TODO : effets, pilotis, portails, etc
        }
    */
    constructor(props) {
        super(props);
        this.state = {
            cells: [],
            pos_cerbere: -1,
            highlighted: [],
        };
    
        //===== bindings
        this.updateData = this.updateData.bind(this);
        this.updateHighlighted = this.updateHighlighted.bind(this);

        io_socket.on('updateMap', this.updateData);
        io_socket.on('updateMapHighlighted', this.updateHighlighted);
    }

    updateData(new_data) {
        this.setState({cells: new_data.cells, pos_cerbere: new_data.pos_cerbere});
    }

    handleMouseClick(cellNumber) {
        if(!this.state.highlighted.includes(cellNumber)) return;
        io_socket.emit('selectedMapCell', cellNumber);
    }
    colorHightlighted() {
        for(let i=0; i<this.state.cells.length; i++) {
            let divCell = document.getElementById("cellDiv"+i);
            if(divCell == undefined) continue;
            if(this.state.highlighted.includes(i)) {
                divCell.style.border = "medium solid green";
            } else {
                divCell.style.border = "";
            }
        }
    }

    updateHighlighted(new_highlighted) {
        this.setState({highlighted : new_highlighted});
        this.colorHightlighted();
    }

    componentDidMount() {
        this.colorHightlighted();
    }

    render() {

        let cellDivs = this.state.cells.map((function(cell, index) {
            // TODO : améliorer ça, franchement !
            return(<div id={"cellDiv"+index} key={"cellDiv"+index} className="mapCell"
            onClick={() => this.handleMouseClick(index)}>
                {cell.players}{(this.state.pos_cerbere == index)? "CERBERE" : ""}
            </div>);
        }).bind(this));

        return (<div id="gameMap" className="gameComponent">
            {cellDivs}
        </div>);
    }
}

class PendingEffects extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listEffects: {targetEffects: [], generalEffects: []},
            cancelActive: false,
            hoverable: false,
        }
    
        this.updateListEffects = this.updateListEffects.bind(this);
        this.updateCancelActive = this.updateCancelActive.bind(this);
        this.updateHoverable = this.updateHoverable.bind(this);

        io_socket.on('updatePendingEffects', this.updateListEffects);
        io_socket.on('updateCancelActive', this.updateCancelActive);
        io_socket.on('updateHoverablePendingEffects', this.updateHoverable);
    }

    updateListEffects(new_list) {
        this.setState({listEffects: new_list});
    }

    updateCancelActive(new_val) {
        this.setState({cancelActive: new_val});
    }

    updateHoverable(new_val){
        this.setState({hoverable: new_val});
    }

    handleMouseEnter(target, idx) {
        if(!this.state.hoverable) return;
        let effectDiv = document.getElementById('pending'+((target)?'Target':'General')+'Effect'+idx);
        effectDiv.style.border = "medium solid red";
    }

    handleMouseLeave(target, idx) {
        //if(!this.state.hoverable) return;
        let effectDiv = document.getElementById('pending'+((target)?'Target':'General')+'Effect'+idx);
        effectDiv.style.border = "";
    }

    handleEffectClick(target, idx) {
        if(!this.state.hoverable) return;
        io_socket.emit('selectedPendingEffect', {targeted: target, idx: idx});
    }

    handleCancelClick() {
        if(!this.state.cancelActive) return;
        io_socket.emit('cancelActiveEffect');
    }

    render() {
        let listTargetEffectsDiv = this.state.listEffects.targetEffects.map((function(effect,idx){
            return (
                <div key={"pendingTargetEffect"+idx} id={"pendingTargetEffect"+idx} onMouseEnter={()=>this.handleMouseEnter(true, idx)} onMouseLeave={()=>this.handleMouseLeave(true, idx)}
                    onClick={()=>this.handleEffectClick(true, idx)} className="pendingEffect">
                        {"Targeted "+idx}
                </div>
            );
        }).bind(this));

        let listGeneralEffectsDiv = this.state.listEffects.generalEffects.map((function(effect,idx){
            return (
                <div key={"pendingGeneralEffect"+idx} id={"pendingGeneralEffect"+idx} onMouseEnter={()=>this.handleMouseEnter(false, idx)} onMouseLeave={()=>this.handleMouseLeave(false, idx)}
                    onClick={()=>this.handleEffectClick(false, idx)} className="pendingEffect">
                        {"General "+idx}
                </div>
            );
        }).bind(this));

        return (
            <div className="gameComponent" id="pendingEffects">
                <div id="pendginEffectsList">
                    {listTargetEffectsDiv}
                    {listGeneralEffectsDiv}
                </div>
                {(this.state.cancelActive)? <div id="cancelButtonPendingEffects"><button type="button" onClick={() => this.handleCancelClick()}>Annuler</button></div> : <div id="cancelButtonPendingEffects"></div>}
            </div>
        );
    }

}

function playGame() {

    //The React render should be here ultimately
    ReactDOM.render(
        <div id="runningGame">
            <div className="columnLeft" id="gameLeft">
                <Pist pawns={["cyan", "green"]} sizePiste={5} dicePos={2} diceValue={4} />

                <div id="boardArea">
                    <MapCells />
                    <Barks />
                </div>

                <Deck psg_cards={[]} action_cards={[]}/>
                <PendingEffects />
            </div>
            <div className="columnRight" id="gameRight">
                <ListJoueurs joueurs={[{couleur: "white", pseudo: ""}]} />
                <Chat />
            </div>
        </div>,
        document.getElementById('gameArea')
    );

    //console.log(listplayers);
    //listplayers.updatePlayers([{couleur: "red", pseudo: "tif"},{couleur: "yellow", pseudo: "new"}]);

    //io_socket.on('updateListPlayers', listplayers.updatePlayers);
    //io_socket.emit('gameReady');
};