var cacheImg = {};
var listIcons = ["advance dice", "all other players", "augment dice", "back dice", "bark", "cerbere", "collect actions", "discard", "hunt", "other adventurer", "other cerbere", 
                        "reduce dice", "self", "step back", "step forward", "draw survival", "draw treason",
                        "unveil", "activator", "portal", "bridge", "piloti"];

var displayAddDataEffects = ["step back", "step forward", "draw survival", "draw treason", "discard", "advance dice", "back dice", "augment dice", "reduce dice"];

var block = 40;
var background_color = "#c4cd98";
var background_map_specifics = "#b0bdff";

for(let i=0; i<listIcons.length; i++) {
    let iconName = listIcons[i];
    cacheImg[iconName] = document.getElementById("img "+iconName);
}

//============================
// draw map

function drawMapSpecifics(idCanvas, specifics) {
    let canvas = document.getElementById(idCanvas);
    if(canvas == undefined) {
        console.log("Warning : drawMapSpecifics failed, id unknown: "+idCanvas);
        return;
    }
    let ctx = canvas.getContext("2d");
    if(cacheImg[specifics] != undefined) {
        canvas.width = block;
        canvas.height = block;
        ctx.drawImage(cacheImg[specifics], 0, 0, block, block);
    } else {
        console.log("Warning : drawMapSpecifics failed, unknow specifics: "+specifics);
        return;
    }
}

function drawPawn(idxCanvas, color) {
        
    let canvas = document.getElementById(idxCanvas)
    if(canvas == undefined) return;

    canvas.width = 20; canvas.height = 20;

    let context = canvas.getContext("2d");

    context.beginPath();
    context.fillStyle=color;
    context.arc(10, 10, 10, 0, 2 * Math.PI);
    context.fill();
}

function drawCerbereHandle(idxCanvas) {
    let canvasCerbere = document.getElementById(idxCanvas);
    if(canvasCerbere == undefined) return;

    let context = canvasCerbere.getContext("2d");
    canvasCerbere.width = 30; canvasCerbere.height = 30;

    context.drawImage(cacheImg["cerbere"], 0, 0, 30, 30);
}

//=============================================
// draw effects

// doesn't change size of canvas
function _drawSubEffect(ctx, subEffect, offsetWidthBlock) {
    if(subEffect.target == undefined) {

        if(cacheImg[subEffect.effect] != undefined) {

            ctx.drawImage(cacheImg[subEffect.effect], offsetWidthBlock * block, 0, block, block);
        }
        if(displayAddDataEffects.includes(subEffect.effect)) {
            ctx.font = "30px serif";
            ctx.fillStyle = "white";
            ctx.textAlign = "left";
            ctx.fillText(subEffect.addData, offsetWidthBlock * block + block*0, block*0.5);
        }

    } else {

        if(cacheImg[subEffect.target] != undefined) {
            ctx.drawImage(cacheImg[subEffect.target], offsetWidthBlock * block, 0, block, block);
        }
        if(cacheImg[subEffect.effect] != undefined) {
            ctx.drawImage(cacheImg[subEffect.effect], offsetWidthBlock * block + 0.3*block,0.3*block,block*0.7,block*0.7);
        }

        if(displayAddDataEffects.includes(subEffect.effect)) {
            ctx.font = "30px serif";
            ctx.fillStyle = "white";
            ctx.textAlign = "left";
            ctx.fillText(subEffect.addData, offsetWidthBlock * block + block*0, block*0.5);
        }

    }
}

// changes the size of canvas
function drawSubEffect(idCanvas, subEffect) {
    let canvas = document.getElementById(idCanvas);
    if(canvas == undefined) {
        console.log("Warning drawSubEffect: canvas id unknown: "+idCanvas);
        return;
    }

    let ctx = canvas.getContext('2d');

    canvas.width = block;
    canvas.height = block;

    ctx.fillStyle = background_color;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    _drawSubEffect(ctx, subEffect, 0);
}


// ok so we ask for a list of [subeffects], and the ids of canvas associated
function drawListEffect(idsCanvas, listEffects) {
    let widthBlock = 1;
    for(let i=0; i<listEffects.length; i++) {
        if(listEffects[i].length > widthBlock) widthBlock = listEffects[i].length;
    }

    let ls_canvas = idsCanvas.map((id)=>(document.getElementById(id)));
    if(ls_canvas.includes(undefined)) {
        console.log("drawListEffect: undefined found in canvas exiting");
        return;
    }
    let ls_ctx = ls_canvas.map((canvas)=>(canvas.getContext("2d")));

    ls_canvas.forEach(function(canvas){
        canvas.width = widthBlock * block;
        canvas.height = block;
    });

    ls_ctx.forEach(function(ctx, idx){
        ctx.fillStyle = background_color;
        ctx.fillRect(0,0,ls_canvas[idx].width,ls_canvas[idx].height);

        listEffects[idx].forEach(function(subEffect, internIdx){
            _drawSubEffect(ctx, subEffect, internIdx);
        });
    });
}