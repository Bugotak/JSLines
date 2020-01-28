//Game Area represents the game model

class Cell {

    constructor (col = undefined, row = undefined) {

        this._col       = col;
        this._row       = row;
        this._visited   = false;
        this._pathFrom  = undefined;
        this._ballColor = 0;
    }

    clone () {

        let res = new Cell;
        res.col       = this.col;
        res.row       = this.row;
        res.ballColor = this.ballColor;
        return res;
    }

    get ballColor () {

        return this._ballColor;
    }

    set ballColor (newColor) {

        this._ballColor = newColor;
    }

    sameBall (cell) {

        return (cell != null && !this.isFree && this.ballColor === cell.ballColor);
    }

    reset () {

        this.ballColor = 0;

    }

    putBall (ball) {

        this.ballColor = ball.ballColor;        
    }

    removeBall () {

        this.ballColor = 0;
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

        return (!this.ballColor > 0);
    }

    get pathFrom () {

        return this._pathFrom;
    }

    set pathFrom (cell) {

        this._pathFrom = cell;
    }
 };

class BallDistributor {

    constructor (gameArea, initialCount, nextCount) {

        this._gameArea     = gameArea;
        this._initialCount = initialCount;
        this._nextCount    = nextCount;
        this._nextBalls    = new Array ();
    }

    get nextBalls () {

        return this._nextBalls;
    }

    init () {

        const free_cells = this._gameArea.getRandomFreeCells (this._initialCount);
        for (let cell of free_cells) {

            cell.ballColor = this._gameArea.getRandomColor ();
        }
        this.reserveNextBalls (this._nextCount);
    }

    turn () {

        let balls = this.putNextBalls ();
        this.reserveNextBalls ();
        return balls;
    }

    reserveNextBalls () {

        this._nextBalls.length = 0;
        const free_cells = this._gameArea.getRandomFreeCells (this._nextCount);
        for (let cell of free_cells) {

            let next_ball = cell.clone ();
            next_ball.ballColor = this._gameArea.getRandomColor ();
            this._nextBalls.push (next_ball); 
        }
    }

    putNextBalls () {

        let rest = new Array ();
        let res  = new Array ();
        for (let ball of this._nextBalls) {

            if (this._gameArea.canPutBall (ball)) {
                
                res.push (this._gameArea.putBall (ball));
                
            } else {

                rest.push (ball);
            }
        }

        const free_cells = this._gameArea.getRandomFreeCells (rest.length);

        for (let i in rest) {

            res.push (this._gameArea.putBall (rest [i], free_cells [i]));
        }
        return res;
    }
}

 class GameArea  {

    constructor () {
        this._cols      = 9;
        this._rows      = 9;
        this._typeCount = 7;
        this._minLineLength = 5;

        this._cells     = new Array (this._cols);
        this._nextBalls = new Array ();

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

    cells (col, row) {

        if (this.isInArea (col, row))
            return this._cells [col][row];
        return null;
    }

    canPutBall (ball, ...params) {

        let col = ball.col;
        let row = ball.row;

        if (params.length > 0) {

           col = params [0].col;
           row = params [0].row;
        }

        if (this.isInArea (col, row) && this.cells (col, row).isFree)
            return true;
        return false;
    }

    putBall (ball, ...params) {

        let col = ball.col;
        let row = ball.row;

        if (params.length > 0) {

           col = params [0].col;
           row = params [0].row;
        }
        this.cells (col, row).putBall (ball);
        return this.cells (col, row);
    }

    clearCells (cells) {

        for (let cell of cells) {

            cell.removeBall ();
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

    getRandomFreeCells (count) {

        let free_cells = this.getFreeCells ();

        count = Math.min (count, free_cells.length);
        let res = new Array ();

        for (let i = 0; i < count; ++i) {

            let cell_index  = this.randomInt (0, free_cells.length - 1);
            res.push (free_cells [cell_index]);
            free_cells.splice (cell_index, 1);           
        }    
        return res;
    }

    getRandomColor () {

        return this.randomInt (1, this._typeCount);
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