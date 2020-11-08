var Piste = function(max_size, nr_unused) {

    if(nr_unsued >= max_size) return undefined;

    var self = {
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
    self.checkAugmentDice = function() {
        return (this.dice.current < this.dice.max);
    }

    self.checkReduceDice = function() {
        return (this.dice.current > this.dice.min);
    }

    self.augmentDice = function() {
        if(!this.checkAugmentDice()) return false;
        this.dice.current += 1;
        return true;
    }

    self.reduceDice = function() {
        if(!this.checkReduceDice()) return false;
        this.dice.current -= 1;
        return true;
    }

    self.checkBackDice = function() {
        return (this.position > 0);
    }

    self.backDice = function() {
        if(!this.checkBackDice()) return false;
        this.dice.position -= 1;
        return true;
    }

    self.resetDice = function() {
        this.dice.current = this.dice.min;
    }

    // *********************************************************************
    // except this one, because it returns whether we activate a hunt or not
    // and because it cannot fail.
    self.advanceDice = function() {
        if(this.dice.position < this.actual_size - 1) {
            //no problem, we just move it forward
            this.dice.position += 1;
            return undefined;
        } else {
            this.dice.position = 0;
            return this.dice.current;
        }
    }

    // **********************************************************************
    // change constants
    
    // when a player dies

    self.reduceSlopeSize = function() {
        if(this.actual_size > 1) {
            this.actual_size -= 1;
        }
    }

    return self;
}


// **********************
// *      EXPORTS       *
// **********************

exports.newPiste = Piste();