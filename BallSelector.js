
class BallSelector {

    constructor (gameArea) {

        this._gameArea = gameArea;
        this._selected = new Cell ();
    }

    onCellClicked (cell) {

        this._selected.col = cell.col;
        this._selected.row = cell.row;

    }

    isSelected (cell) {

        const res =  (this._selected.col === cell.col && this._selected.row === cell.row);
        return res;
    }
}