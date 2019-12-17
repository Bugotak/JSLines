

function delay (ms) {
    return new Promise (resolve => setTimeout (resolve, ms));
}

class BallSelector {

    constructor (gameArea, presenter) {

        this._gameArea  = gameArea;
        this._presenter = presenter;
        this._moveAnimation    = new MoveAnimation        (this._gameArea, this.onMoveStep.bind    (this));  
        this._selected  = undefined;
    }

    isAnimationRunning () {

        return (this._moveAnimation.isRunning);
    }

    onCellClicked (cell) {

        if (this.isAnimationRunning ())
            return;

        if (!cell.isFree ()) {
         
            this._selected = cell;
            this._presenter.animateSelected (this._selected);

        } else if (this.haveSelected ()) {

            this.moveBallTo (cell);                          

        } else {

            this._selected = undefined;
            this._presenter.stopAnimateSelected ();
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
        this._presenter.stopAnimateSelected ();
    }

    async moveBallTo (cell) {

        let path = this._gameArea.getPath (this._selected, cell); 
        if (path.length === 0)
            return;

        this._presenter.stopAnimateSelected ();

        let end_cell = path [path.length - 1];

        await this._presenter.animateMove (path);  
                
        end_cell.value = this._selected.value;
        this._selected.clearValue ();

        console.log ("move Finished");
        let lines = this._gameArea.getColorLines (cell);
        if (lines.length === 0) {

            await this.distributeBalls (3);         

        } else {

            await this._presenter.animateDestroy (lines);
            this._gameArea.clearCells (lines);
        }
        this.reset ();       
    }

    async distributeBalls (count) {

        let cells = this._gameArea.distribute (count);
        for (let cell of cells) {

            if (!cell.isFree ()) {

                let lines = this._gameArea.getColorLines (cell);
                if (lines.length > 0) {

                    await this._presenter.animateDestroy (lines);
                    this._gameArea.clearCells (lines);        
                }
            }
        }
        this._presenter.draw ();
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