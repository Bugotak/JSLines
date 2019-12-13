

function delay (ms) {
    return new Promise (resolve => setTimeout (resolve, ms));
}

class MoveAnimation {

    constructor (gameArea, onSingleStep) {

        this._gameArea     = gameArea;
        this._delay        = 50;
        this._onSingleStep = onSingleStep;
        this._isRunning    = false;
    }

    async singleStep () {
        
        await delay (this._delay);

        this._to = this._path.shift ();
        this._to.value = this._from.value;
        this._from.clearValue ();        

        this._onSingleStep ();

        this._from = this._to;        
    }

    async run (path) {

        this._isRunning = true;
        this._path  = path;
        this._from  = this._path.shift ();

        while (this._path.length > 0) {
            
            await this.singleStep ();       
        } 
        this._isRunning = false;
    }

    get isRunning () {

        return this._isRunning;
    }
}

class LineDestroyAnimation {

    constructor (gameArea, onSingleStep) {

        this._gameArea = gameArea;  
        this._delay        = 50;
        this._onSingleStep = onSingleStep;
        this._isRunning    = false;      
    }

    async singleStep () {
      
        await delay (this._delay);

        let ball = this._lines.shift ();
        ball.clearValue ();        
        this._onSingleStep ();
    }

    async run (lines) {

        this._isRunning = true;
        this._lines = lines;
        while (this._lines.length > 0)
            await this.singleStep ();
        this._isRunning = false;
    }

    get isRunning () {

        return this._isRunning;
    }
}

class BallSelector {

    constructor (gameArea, presenter) {

        this._gameArea  = gameArea;
        this._presenter = presenter;
        this._moveAnimation    = new MoveAnimation        (this._gameArea, this.onMoveStep.bind    (this));  
        this._destroyAnimation = new LineDestroyAnimation (this._gameArea, this.onDestroyStep.bind (this));           
        this._selected  = undefined;
    }

    isAnimationRunning () {

        return (this._moveAnimation.isRunning || this._destroyAnimation.isRunning);
    }

    onCellClicked (cell) {

        if (this.isAnimationRunning ())
            return;

        if (!cell.isFree ()) {
         
            this._selected = cell;
            this._presenter.draw ();

        } else if (this.haveSelected ()) {

            this.moveBallTo (cell);                          

        } else {

            this._selected = undefined;
            this._presenter.draw ();
        }
    }

    isSelected (cell) {

        const res =  (this._selected == cell);
        return res;
    }

    haveSelected () {

        const res =  (this._selected != undefined);
        return res;
    }

    reset () {

        this._selected =  undefined;        
    }

    async moveBallTo (cell) {

        let path = this._gameArea.getPath (this._selected, cell); 
        await this._moveAnimation.run (path);  
        let lines = this._gameArea.getColorLines (cell);
        await this._destroyAnimation.run (lines);
        let new_balls = this._gameArea.distribute (3);     

        this._presenter.draw ();

        for (let ball of new_balls) {

            lines = this._gameArea.getColorLines (ball);
            await this._destroyAnimation.run (lines);    
        }  
        this._presenter.draw (); 
        this.reset ();
    }

    onMoveStep () {

        this._presenter.draw ();
    }

    deleteColorLines (cell) {

        let lines = this._gameArea.getColorLines (cell);
        this._destroyAnimation.run (lines);
    }
   
    onDestroyStep () {

        this._presenter.draw ();
    }
}