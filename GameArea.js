//Game Area represents the game model

class Cell {

    constructor (col = undefined, row = undefined) {

        this._col = col;
        this._row = row;
    }

    get col () {

        return this._col;        
    }

    get row () {

        return this._row;
    }

    set col (cellCol) {

        this._col = cellCol;
    }

    set row (cellRow) {

        this._row = cellRow;
    }
 };
class GameArea  {

    constructor () {
        this._cols      = 3;
        this._rows      = 3;
        this._typeCount = 5;

        this._cells = new Array (this._cols);

        for (let i = 0; i < this._cols; ++i) {

            this._cells [i] = new Array (this._rows);
            this._cells [i].fill (0);
        }

    };

    cols () {

        return this._cols;
    }

    rows () {

        return this._rows;
    }

    cell (col, row) {

        if (col >= 0 && col < this._cols && row >= 0 && row < this._rows)
            return this._cells [col][row];
        return undefined;
    }

    randomInt (minVal, maxVal) {

        return minVal + Math.floor(Math.random() * (maxVal - minVal + 1));
    }


    isCellFree (cell) {

        return (this._cells [cell.col][cell.row] === 0);
    }

    isInArea (cell) {

        return (cell.col >= 0 && cell.col < this._cols && cell.row >= 0 && cell.row < this._rows);
    }

    getFreeCells () {

        let res = new Array ();
        for (let i = 0; i < this._cols; ++i) {

            for (let j = 0; j < this._rows; ++j) {

                if (this._cells [i][j] === 0)
                    res.push ({"col": i, "row" : j});
            }
        }
        return res;

    }

    getFreeNeighbourCells (cell) {

        let res = new Array ();

        for (let col = cell.col - 1; col <= cell.col + 1; ++col) {
            for (let row = cell.row - 1; row <= cell.row + 1; ++row) {

                if (col === cell.col && row === cell.row) 
                    continue;
                const neighbour_cell = new Cell (col, row);
                if (this.isInArea (neighbour_cell) && this.isCellFree (neighbour_cell)) {

                    res.push (neighbour_cell);
                }
                
            }
        }
        return res;
    }

    getPath (start, end) {

        let frontier  = new Array ();
        let came_from = new WeakMap ();

        frontier.push (start);
        came_from [start] = undefined;
        while (frontier.length > 0) {

            let current  = frontier.pop ();
            let neibours = this.getFreeNeighbourCells (current);
            for (let i in neibours) {

                let next = neibours [i];
                if (!came_from.has (next)) {
                    frontier.unshift (next);
                    came_from [next] = current;
                }

            }
        }
        console.log (came_from);
        return came_from;
    }

    distribute (count) {

        let free_cells = this.getFreeCells ();
        count = Math.min (count, free_cells.length);
        for (let i = 0; i < count; ++i) {

            let cell_index = this.randomInt (0, free_cells.length - 1);
            let cell_type  = this.randomInt (1, this._typeCount);
            this._cells [free_cells [cell_index].col][free_cells [cell_index].row] = cell_type;
            free_cells.splice (cell_index, 1);
        }    
    }
}