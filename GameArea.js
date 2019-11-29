//Game Area represents the game model

class GameArea  {

    constructor () {
        this._cols      = 10;
        this._rows      = 10;
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


    isCellFree (col, row) {

        return (this._cells [col][row] == 0);
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