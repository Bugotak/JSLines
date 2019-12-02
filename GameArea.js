//Game Area represents the game model

class Cell {

    constructor (col = undefined, row = undefined) {

        this._col      = col;
        this._row      = row;
        this._value    = 0;
        this._visited  = false;
        this._pathFrom = undefined;
    }

    get col () {

        return this._col;        
    }

    get row () {

        return this._row;
    }

    get value () {

        return this._value;
    }

    get visited () {

        return this._visited;
    }

    set col (cellCol) {

        this._col = cellCol;
    }

    set row (cellRow) {

        this._row = cellRow;
    }

    set value (val) {

        this._value = val;
    }

    set visited (vis) {

        this._visited = vis;
    }

    isFree () {

        return (this._value === 0);
    }

    get pathFrom () {

        return this._pathFrom;
    }

    set pathFrom (cell) {

        this._pathFrom = cell;
    }
 };
class GameArea  {

    constructor () {
        this._cols      = 3;
        this._rows      = 3;
        this._typeCount = 5;

        this._cells = new Array (this._cols);

        for (let col = 0; col < this._cols; ++col) {

            this._cells [col] = new Array (this._rows);
            for (let row = 0; row < this._rows; ++row)
                this._cells [col][row] = new Cell  (col, row);
        }

    };

    cols () {

        return this._cols;
    }

    rows () {

        return this._rows;
    }

    cellValue (col, row) {

        if (col >= 0 && col < this._cols && row >= 0 && row < this._rows)
            return this._cells [col][row].value;
        return undefined;
    }

    cells (col, row) {

        if (this.isInArea (col, row))
            return this._cells [col][row];
        return null;
    }

    randomInt (minVal, maxVal) {

        return minVal + Math.floor(Math.random() * (maxVal - minVal + 1));
    }


    isInArea (col, row) {

        return (col >= 0 && col < this._cols && row >= 0 && row < this._rows);
    }

    getFreeCells () {

        let res = new Array ();
        for (let i = 0; i < this._cols; ++i) {

            for (let j = 0; j < this._rows; ++j) {

                if (this._cells [i][j].isFree ())
                    res.push (this._cells [i][j]);
            }
        }
        return res;
    }

    pushUnvisitedFreeCell (col, row, res) {

        const cell = this.cells (col, row);
        if (this.isInArea (col, row) && cell.isFree () && !cell.visited) {
            res.push (cell);
        }
    }

    getFreeUnvisitedNeighbourCells (cell) {

        let res = new Array ();
        let {col, row} = cell;
        this.pushUnvisitedFreeCell (col, row - 1, res);
        this.pushUnvisitedFreeCell (col, row + 1, res);
        this.pushUnvisitedFreeCell (col - 1, row, res);
        this.pushUnvisitedFreeCell (col + 1, row, res);
        return res;
    }

    resetPaths () {

        for (let col = 0; col < this._cols; ++col) {

            for (let row = 0; row < this._rows; ++row) {

                this.cells (col, row).visited  = false;
                this.cells (col, row).pathFrom = null;
            }
        }
    }

    getPath (start, end) {

        this.resetPaths ();      
        
        let frontier  = new Array ();
        frontier.push (start);
        
        while (frontier.length > 0) {

            let current  = frontier.pop ();
            if (current == end) {

                let path = new Array ();
                let prev = end;
                while (prev != start) {

                    path.push (prev);
                    prev = prev.pathFrom;
                }
                path.reverse ();
                console.log (path);
                return path;
            }

            let neibours = this.getFreeUnvisitedNeighbourCells (current);
        
            for (let i in neibours) {

                let next = neibours [i];
                next.visited = true;
                frontier.unshift (next);
                next.pathFrom = current;
            }
        }        
        return undefined;
    }

    moveBall (start, end) {

        const path = getPath (start, end);
        const val  = start.value;
        for (let i in path) {

            
        }
    }

    distribute (count) {

        let free_cells = this.getFreeCells ();
        count = Math.min (count, free_cells.length);
        for (let i = 0; i < count; ++i) {

            let cell_index = this.randomInt (0, free_cells.length - 1);
            let cell_type  = this.randomInt (1, this._typeCount);
            free_cells [cell_index].value = cell_type;
            free_cells.splice (cell_index, 1);
        }    
    }
}