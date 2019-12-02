
class BallSelector {

    constructor (gameArea) {

        this._gameArea = gameArea;
        this._selected = undefined;
    }

    onCellClicked (cell) {

        if (!cell.isFree ()) {
         
            this._selected = cell;

        } else if (this.haveSelected ()) {

            this._gameArea.getPath (this._selected, cell);
            
        } else {

            this._selected = undefined;
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
}