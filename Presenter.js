


function delay (ms) {
    return new Promise (resolve => setTimeout (resolve, ms));
}

class SelectedAnimation {

    constructor (presenter) {

        this._presenter = presenter;
        this._cell      = null;
        this._delay     = 10;
        this._timer     = null;
        this._shift     = 0;
        this._maxShift  = 0;
        this._shiftInc  = 1;
    }    

    run (cell) {

        if (cell != this._cell)
            this.stop ();

        if (cell == null)
            return;

        this._cell = cell;

        let rect   = this._presenter.getCellRect (this._cell);
               
        this._maxShift = rect.height / 2 - this._presenter.ballRadius;
        this._timer    = setInterval (this.stepShift.bind (this), 50);
    }

    stop () {

        this._cell = null;
        this.shift = 0;
        this._maxShift  = 0;
        this._shiftInc  = 1;
        clearInterval (this._timer);
    }

    stepShift () {

        this._shift += this._shiftInc;
        this._presenter.clearCell  (this._cell);
        this._presenter.drawBallAt (this._cell, 0, this._shift);

        if (this._shift >= this._maxShift) {

            this._shiftInc = -1;
        }
        if (this._shift <= 0) {

            this._shiftInc = 1;
        }
    }
}


class Presenter {

    constructor (canvasID, gameArea) {

        this._ballSelector      = new BallSelector  (gameArea, this);
        this._selectedAnimation = new SelectedAnimation (this); 
        this._lineWidth  = 1;

        this._gridColor  = "#000000";
        this._bgColor    = "#FFFFFF";
        this._ballColors = ["#800000", "#008000", "#000080", "#808000", "#008080", "#800080", "#4065BB"];

        this._canvas  = document.getElementById (canvasID);
        this._context = this._canvas.getContext ("2d");

        this._width = this._canvas.width;
        this._height = this._canvas.height;

        this._gameArea = gameArea;  
        
        this._cellWidth  = this._width  / this._gameArea.cols ();
        this._cellHeight = this._height / this._gameArea.rows ();
        this._ballRadius = (Math.min (this._cellWidth, this._cellHeight) / 2) * 0.8;

        this._gameArea.distribute (1);

        this._canvas.addEventListener ("click", this.onCanvasClick.bind (this));
        this._gameArea.onDrawCallback = this.draw.bind (this);
    }
    

    get width () {

        return this._width;        
    }

    get height () {

         return this._height;
    }

    get ballRadius () {

        return this._ballRadius;
    }

    clearImage () {

        this._context.fillStyle = this._bgColor;
        this._context.clearRect (0, 0, this._width, this._height);
    }

    drawFrame () {

        this._context.strokeStyle = this._gridColor;
        this._context.lineWidth   = this._lineWidth;        
        this._context.strokeRect (0, 0, this._width, this._height);
    }

    drawGrid () {

        this._context.strokeStyle = this._gridColor;
        this._context.lineWidth   = this._lineWidth;       
        this._context.beginPath ();

        for (let i = 1; i < this._gameArea.cols (); ++i) {
         
            const x = i * this._cellWidth;
            this._context.moveTo (x, 0);
            this._context.lineTo (x, this._height);
        }

        for (let i = 1; i < this._gameArea.rows (); ++i) {

            const y = i * this._cellHeight;
            this._context.moveTo (0, y);
            this._context.lineTo (this._width, y);
        }
        this._context.stroke ();
    }

    drawBalls () {

        for (let i = 0; i < this._gameArea.cols (); ++i) {

            for (let j = 0; j < this._gameArea.rows (); ++j) {               

                const cell = this._gameArea.cells (i, j);
                if (cell.value > 0 && !this._ballSelector.isSelected (cell)) {

                    this.drawBallAt (cell);
                }
            }
        }
    }

    drawBallAt (cell, ...shift) {
      
        let x = this._cellWidth  * (cell.col + 0.5);
        let y = this._cellHeight * (cell.row + 0.5);
        if (shift.length >= 2) {

            x += shift [0];
            y += shift [1];
        }

        this._context.strokeStyle = this._ballColors [cell.value - 1];
        this._context.lineWidth   = 1;

        this._context.beginPath ();
        this._context.arc (x, y, this._ballRadius, 0, 2 * Math.PI);
        this._context.fillStyle   = this._ballColors [cell.value - 1];
        this._context.fill ();
    } 

    clearCell (cell) {

        let rect = this.getCellRect (cell);
        this._context.fillStyle = this._bgColor;
        this._context.clearRect (rect.x0, rect.y0, rect.width, rect.height);
    }

    getCellAt (x, y) {

        let col = Math.floor (x / this._cellWidth);
        let row = Math.floor (y / this._cellHeight);

        return this._gameArea.cells (col, row);
    }

    getCellRect (cell) {

        return { x0     : cell.col * this._cellWidth  + this._lineWidth,
                 y0     : cell.row * this._cellHeight + this._lineWidth,
                 width  : this._cellWidth  - 2 * this._lineWidth,
                 height : this._cellHeight - 2 * this._lineWidth};
    }
    
    draw () {
    
        this.clearImage ();
        this.drawFrame  ();
        this.drawGrid   ();
        this.drawBalls  ();
    }

    onCanvasClick (event) {

        console.log (event);
        const cell = this.getCellAt (event.layerX, event.layerY);
        this._ballSelector.onCellClicked (cell);    
    }

    animateSelected (cell) {

        this._selectedAnimation.run (cell);
    }    

    stopAnimateSelected () {

        this._selectedAnimation.stop ();
    }    
}