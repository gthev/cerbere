var debugActivated = 0;

var setDebug = function(new_val) {debugActivated = new_val;}

var showDebug = function(message) {
    if(debugActivated) {
        console.log(message);
    }
}

exports.setDebug = setDebug;
exports.showDebug = showDebug;