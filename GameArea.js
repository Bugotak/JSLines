//Game Area represents the game model

class Cell {

    constructor (col = undefined, row = undefined) {

        this._col       = col;
        this._row       = row;
        this._visited   = false;
        this._pathFrom  = undefined;
        this.haveBall   = false;
        this.colorIndex = 0;
    }

    get haveBall () {

        return this._haveBall;
    }

    set haveBall (have) {

        this._haveBall = have;
    }

    get colorIndex () {

        return this._colorIndex;
    }

    set colorIndex (index) {

        this._colorIndex = index;
    }

    sameBall (cell) {

        return (cell != null && this.haveBall === cell.haveBall && this.colorIndex === cell.colorIndex);
    }

    clear () {

        this._haveBall   = false;
        this._colorIndex = 0;
    }

    putBall (ball) {

        this._haveBall   = ball.haveBall;
        this._colorIndex = ball.colorIndex;
    }

    get col () {

        return this._col;        
    }

    get row () {

        return this._row;
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

    set visited (vis) {

        this._visited = vis;
    }

    get isFree () {

        return (!this._haveBall);
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
        this._cols      = 9;
        this._rows      = 9;
        this._typeCount = 7;
        this._minLineLength = 5;

        this._cells = new Array (this._cols);

        for (let col = 0; col < this._cols; ++col) {

            this._cells [col] = new Array (this._rows);
            for (let row = 0; row < this._rows; ++row)
                this._cells [col][row] = new Cell  (col, row);
        }

        this._upcomingCells = new Set ();
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

    clearCells (cells) {

        for (let cell of cells) {

            cell.clear ();
        }
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

                if (this._cells [i][j].isFree)
                    res.push (this._cells [i][j]);
            }
        }
        return res;
    }

    pushUnvisitedFreeCell (col, row, res) {

        const cell = this.cells (col, row);
        if (this.isInArea (col, row) && cell.isFree && !cell.visited) {
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

        let path = new Array ();
        this.resetPaths ();      
        
        let frontier  = new Array ();
        frontier.push (start);
        
        while (frontier.length > 0) {

            let current  = frontier.pop ();
            if (current == end) {
               
                let prev = end;
                while (prev != start) {

                    path.push (prev);
                    prev = prev.pathFrom;
                }
                path.reverse ();
                path.unshift (start);
                break;
            }

            let neibours = this.getFreeUnvisitedNeighbourCells (current);
        
            for (let i in neibours) {

                let next = neibours [i];
                next.visited = true;
                frontier.unshift (next);
                next.pathFrom = current;
            }
        }        
        return path;
    }

    distribute (count) {

        let free_cells = this.getFreeCells ();
        count = Math.min (count, free_cells.length);
        let res = new Array ();

        for (let i = 0; i < count; ++i) {

            let cell_index  = this.randomInt (0, free_cells.length - 1);
            let cell_type   = this.randomInt (1, this._typeCount);
            let cell        = free_cells [cell_index];
            cell.colorIndex = cell_type;
            cell.haveBall   = true;
            free_cells.splice (cell_index, 1);
            res.push (cell);
        }    
        return res;
    }

    distributeWithUpcoming (count) {

        let res = new Array ();

        let not_placed_count = 0;

        for (let cell of this._upcomingCells) {

            if (cell.haveBall)
                ++not_placed_count;
            else {   
                
                cell.haveBall = true;
                res.push (cell);
            }
        }
        res.concat (res, this.distribute (not_placed_count));

        this._upcomingCells.clear ();

        let free_cells = this.getFreeCells ();
        count = Math.min (count, free_cells.length);

        for (let i = 0; i < count; ++i) {

            let cell_index  = this.randomInt (0, free_cells.length - 1);
            let cell_type   = this.randomInt (1, this._typeCount);
            let cell        = free_cells [cell_index];
            cell.colorIndex = cell_type;
            free_cells.splice (cell_index, 1);
            this._upcomingCells.add (cell);
        }    
        return res;


    }

    getColorLines (cell) {

        let res  = new Array ();

        this.getLineInDirection (cell, 1, 0,  res);
        this.getLineInDirection (cell, 0, 1,  res);
        this.getLineInDirection (cell, 1, 1,  res);
        this.getLineInDirection (cell, 1, -1, res);

        if (res.length > 0) {
            res.push (cell);
        }
        return res;
    }    

    getLineInDirection (cell, colInc, rowInc, res) {

        let a = this.getSubLine (cell, colInc,   rowInc);
        let b = this.getSubLine (cell, -colInc, -rowInc);

        if (a.length + b.length + 1 >= this._minLineLength) {
          
            res.push (...a);
            res.push (...b);
        }
    }

    getSubLine (cell, colInc, rowInc) {        
        
        let col = cell.col + colInc;
        let row = cell.row + rowInc;
        let res = new Array ();

        if (!this.isInArea (col, row))
            return res;            
        const val    = cell.value;
        let next_ball = this.cells (col, row);       

        while (cell.sameBall (next_ball) && this.isInArea (col, row)) {

            res.push (this.cells (col, row));
            col += colInc;
            row += rowInc;        
            next_ball = this.cells (col, row);
        }    
        return res;
    }
}