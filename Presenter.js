class Presenter {

    constructor (canvasID, gameArea) {

        this._lineWidth  = 1;

        this._gridColor  = "#000000";
        this._bgColor    = "#FFFFFF";
        this._ballColors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF", "#FF00FF"];

        this._canvas  = document.getElementById (canvasID);
        this._context = this._canvas.getContext ("2d");

        this._width = this._canvas.width;
        this._height = this._canvas.height;

        this._gameArea = gameArea;  
        
        this._cellWidth  = this._width  / this._gameArea.cols ();
        this._cellHeight = this._height / this._gameArea.rows ();
        this._ballRadius = (Math.min (this._cellWidth, this._cellHeight) / 2) * 0.8;

        this._gameArea.distribute (5);

        this._canvas.addEventListener ("click", this.onCanvasClick.bind (this));
    }
    

    width () {

        return this._width;        
    }

    height () {

         return this._height;
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

                const val = this._gameArea.cell (i, j);
                if (val > 0) {

                    const x = i * this._cellWidth  + this._cellWidth  / 2;
                    const y = j * this._cellHeight + this._cellHeight / 2;

                    this._context.beginPath ();
                    this._context.strokeStyle = this._ballColors [val - 1];
                    this._context.lineWidth   = 1;
                    this._context.arc (x, y, this._ballRadius, 0, 2 * Math.PI);
                    this._context.fillStyle   = this._ballColors [val - 1];
                    this._context.fill ();
                }
            }
        }
    }

    
    draw () {
    
        this.clearImage ();
        this.drawFrame  ();
        this.drawGrid   ();
        this.drawBalls  ();
    }

    onCanvasClick () {

        this._gameArea.distribute (5);
        this.draw ();
    }
    
}