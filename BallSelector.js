
class BallSelector {

    constructor (gameArea) {

        this._gameArea = gameArea;
        this._selected = new Cell ();
    }

    onCellClicked (cell) {

        if (!this._gameArea.isCellFree (cell)) {
            this._selected.col = cell.col;
            this._selected.row = cell.row;
        } else if (this.haveSelected ()) {

            this._gameArea.getPath (this._selected, cell);
        }


    }

    isSelected (cell) {

        const res =  (this._selected.col === cell.col && this._selected.row === cell.row);
        return res;
    }

    haveSelected () {

        const res =  (this._selected.col != undefined && this._selected.row != undefined);
        return res;
    }

    reset () {

        this._selected._col = undefined;
        this._selected._row = undefined;
    }
}