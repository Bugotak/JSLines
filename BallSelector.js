
class BallSelector {

    constructor (gameArea, presenter) {

        this._gameArea  = gameArea;
        this._presenter = presenter;
        this._selected  = undefined;
    }

     onCellClicked (cell) {

         if (!cell.isFree) {
         
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

        await this._presenter.animateMove (path);  
                
        cell.putBall (this._selected);
        this._selected.clear ();

        console.log ("move Finished");
        let lines = this._gameArea.getColorLines (cell);
        if (lines.length === 0) {

            await this.distributeBalls (3);                  
        } else {

            await this._presenter.animateDestroy (lines);
            this._gameArea.clearCells (lines);
        }       
        this.reset ();       
        this._presenter.draw (); 
    }

    async distributeBalls (count) {

        let cells = this._gameArea.distributeWithUpcoming (count);
        for (let cell of cells) {

            if (!cell.isFree) {

                let lines = this._gameArea.getColorLines (cell);
                if (lines.length > 0) {

                    await this._presenter.animateDestroy (lines);
                    this._gameArea.clearCells (lines);        
                }
            }
        }       
    }
    
    deleteColorLines (cell) {

        let lines = this._gameArea.getColorLines (cell);
        this._destroyAnimation.run (lines);
    }   
}