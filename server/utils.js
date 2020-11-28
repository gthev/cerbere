//completely copy-pasted from javascript.info
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

var min_length = 7;
var max_length = 15;

function gen_passwd() {
    var length = min_length + Math.floor(Math.random() * (max_length - min_length));
    return makeid(length);
}

function copyEffect(effect) {
    let new_effect = {targetEffects: [], generalEffects: []};
    console.log(effect);
    new_effect.targetEffects = effect.targetEffects.map((subeffect) => (
        {
            target: subeffect.target,
            effect: subeffect.effect,
            addData: subeffect.addData,
        }
    ));

    new_effect.generalEffects = effect.generalEffects.map((subeffect) => (
        {
            effect: subeffect.effect,
            addData: subeffect.addData,
        }
    ));

    return new_effect;
}

function rangeArray(number) {
    var res = [];
    if(number <= 0) return res;
    for(let i=0; i<number; i++) {
        res.push(i);
    }

    return res;
}

exports.gen_passwd = gen_passwd;
exports.copyEffect = copyEffect;
exports.shuffle = shuffle;
exports.rangeArray = rangeArray;