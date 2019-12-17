


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
        
        if (cell == null) {

            stop ();
            return;
        }

        if (cell == this._cell) {
   
            return;
        }

        if (this._cell != null) {

            this._presenter.clearCell  (this._cell);
            this._presenter.drawBallAt (this._cell);
        }
        stop ();
        this._cell = cell;

        let rect   = this._presenter.getCellRect (this._cell);
               
        this._maxShift = rect.height / 2 - this._presenter.ballRadius - 1;
        clearInterval (this._timer);
        this._timer    = setInterval (this.stepShift.bind (this), 100);
    }

    stop () {

        clearInterval (this._timer);
        this._cell = null;
        this.shift = 0;
        this._maxShift  = 0;
        this._shiftInc  = 1;
       
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


class DestroyAnimation {

    constructor (presenter) {

        this._presenter = presenter;
        this._isRunning = false;
    }

    async run (cells) {

        this._isRunning = true;
        const promises = cells.map (this.animateBall.bind (this));
        await Promise.all (promises);
        this._isRunning = false;
    }

    async animateBall (cell) {

        let r = this._presenter.ballRadius;
        
        while (r >= 0) {
            r -= 1;
            this._presenter.clearCell  (cell);
            this._presenter.drawBallAt (cell, 0, 0, r);
            await delay (5);
        }        
    }

    get isRunning () {

        return this._isRunning;
    }
}


class MoveAnimation {

    constructor (presenter) {

        this._presenter    = presenter;
        this._delay        = 50;
        this._isRunning    = false;
        this._startCell    = null;
        this._totalDx      = 0;
        this._totalDy      = 0;
    }

    async run (path) {

        if (path.length <= 1)
            return;
        this._path = path;
        this._isRunning = true;
        this._startCell = this._path.shift ();
        
        let from = this._startCell;

        do {                
        
            let to   = this._path.shift ();
            await this.moveBetween (from, to);
            from = to;

        } while (this._path.length > 0)

        this._startCell    = null;
        this._totalDx      = 0;
        this._totalDy      = 0;
        this._isRunning = false;
    }

    async moveBetween (from, to) {

        let from_rect = this._presenter.getCellRect (from);
        let to_rect   = this._presenter.getCellRect (to);

        this._totalDx += (to_rect.x0 - from_rect.x0);
        this._totalDy += (to_rect.y0 - from_rect.y0);
        
        this._presenter.clearCell  (from);
        this._presenter.drawBallAt (this._startCell, this._totalDx, this._totalDy);
        await delay (this._delay);
    } 

    get isRunning () {

        return this._isRunning;
    }
}


class Presenter {

    constructor (canvasID, gameArea) {

        this._ballSelector      = new BallSelector  (gameArea, this);
        this._selectedAnimation = new SelectedAnimation (this); 
        this._destroyAnimation  = new DestroyAnimation  (this);
        this._moveAnimation     = new MoveAnimation     (this);
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

    drawBallAt (cell, ...params) {
      
        let x = this._cellWidth  * (cell.col + 0.5);
        let y = this._cellHeight * (cell.row + 0.5);
        let r = this._ballRadius;

        if (params.length >= 2) {

            x += params [0];
            y += params [1];
        }

        if (params.length >= 3) {

            r = params [2];
        }

        if (r < 0)
            r = 0;

        this._context.beginPath ();
        this._context.arc (x, y, r, 0, 2 * Math.PI);
        this._context.fillStyle = this._ballColors [cell.value - 1];
        this._context.fill ();

        // let grad = this._context.createRadialGradient (x + 20, y - 20, 0, x + 20, y - 20, 20);
        // grad.addColorStop (0, this._bgColor);
        // grad.addColorStop (1, this._ballColors [cell.value - 1]);
        // this._context.fillStyle = grad;
        // this._context.arc (x + 20, y - 20, 20, 0, 2 * Math.PI);
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

        if (this.isAnimationRunning)
            return;

        const cell = this.getCellAt (event.layerX, event.layerY);
        this._ballSelector.onCellClicked (cell);    
    }

    get isAnimationRunning () {

        return this._destroyAnimation.isRunning;
    }

    animateSelected (cell) {

        this._selectedAnimation.run (cell);
    }    

    stopAnimateSelected () {

        this._selectedAnimation.stop ();
    }    

    async animateDestroy (lines) {

        await this._destroyAnimation.run (lines);
    }

    async animateMove (path) {

        await this._moveAnimation.run (path);
    }
}