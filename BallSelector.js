

class MoveAnimation {

    constructor (gameArea, onSingleStep, onFinish) {

        this._gameArea     = gameArea;
        this._delay        = 50;
        this._onSingleStep = onSingleStep;
        this._onFinish     = onFinish;
        this._isRunning    = false;
    }

    singleStep () {

        if (this._path.length == 0) {
            
            clearTimeout  ();
            this._isRunning = false;
            this._onFinish (this._to);
            return;
        }
        
        this._to = this._path.shift ();
        this._from.clearValue ();        
        this._to.value = this._value;

        this._onSingleStep ();

        this._from = this._to;        
        setTimeout (this.singleStep.bind (this), this._delay)
    }

    run (start, path) {

        if (path.length == 0)
            return;
        this._isRunning = true;
        this._path  = path;
        this._from  = start;
        this._value = start.value;
        setTimeout (this.singleStep.bind (this), this._delay);
    }

    get isRunning () {

        return this._isRunning;
    }
}

class BallSelector {

    constructor (gameArea, presenter) {

        this._gameArea  = gameArea;
        this._presenter = presenter;
        this._moveAnimation = new MoveAnimation (this._gameArea, this.onMoveStep.bind (this), this.onMoveFinish.bind (this));            
        this._selected  = undefined;
    }

    onCellClicked (cell) {

        if (this._moveAnimation.isRunning)
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

        this._selected._col = undefined;
        this._selected._row = undefined;
    }

    moveBallTo (cell) {

        let path = this._gameArea.getPath (this._selected, cell);
        this._moveAnimation.run (this._selected, path);        
    }

    onMoveStep () {

        this._presenter.draw ();
    }

    onMoveFinish (cell) {

        let lines = this._gameArea.getColorLines (cell);
        console.log (lines);
        this._gameArea.distribute (5);
        this._presenter.draw ();
    }
}