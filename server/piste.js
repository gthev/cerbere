var Piste = function(max_size, nr_unused) {

    if(nr_unused >= max_size) return undefined;

    var self = {

        //init props:
        init_props: {max_size: max_size, nr_unused: nr_unused},

        //these parameters shouldn't be touched directly during the game
        max_size: max_size,    //independently of the number of players (total and dead)
        actual_size: max_size - nr_unused,
        dice: {
            min: 3,
            current: 3, //current number on the dice
            max: 8,
            position: 0, //current position on the slope. Should be between 0 and actual_size - 1
        },
    }

    // *******************************************************
    // all those functions return true if ok, false if problem
    self.checkAugmentDice = function(number) {
        return (self.dice.current + number <= self.dice.max);
    }

    self.checkReduceDice = function(number) {
        return (self.dice.current - number >= self.dice.min);
    }

    self.augmentDice = function() {
        if(!self.checkAugmentDice(1)) return false;
        self.dice.current += 1;
        return true;
    }

    self.reduceDice = function() {
        if(!self.checkReduceDice(1)) return false;
        self.dice.current -= 1;
        return true;
    }

    self.checkBackDice = function(number) {
        return (self.dice.position >= number);
    }

    self.backDice = function() {
        if(!self.checkBackDice(1)) return false;
        self.dice.position -= 1;
        return true;
    }

    self.resetDice = function() {
        self.dice.current = self.dice.min;
    }

    // *********************************************************************
    // except this one, because it returns whether we activate a hunt or not
    // and because it cannot fail.
    self.advanceDice = function() {
        if(self.dice.position < self.actual_size - 1) {
            //no problem, we just move it forward
            self.dice.position += 1;
            return undefined;
        } else {
            self.dice.position = 0;
            return self.dice.current;
        }
    }

    // **********************************************************************
    // change constants
    
    // when a player dies

    self.reduceSlopeSize = function() {
        if(self.actual_size > 1) {
            self.actual_size -= 1;
        }
    }

    return self;
}

var getCopyPiste = function(piste) {
    var new_piste = Piste(piste.init_props.max_size, piste.init_props.nr_unused);
    new_piste.max_size = piste.max_size;
    new_piste.actual_size = piste.actual_size;
    let old_dice = piste.dice;
    new_piste.dice = {
        min: old_dice.min,
        max: old_dice.max,
        current: old_dice.current,
        position: old_dice.position,
    };

    return new_piste;
}


// **********************
// *      EXPORTS       *
// **********************

exports.newPiste = Piste;
exports.copyPiste = getCopyPiste;