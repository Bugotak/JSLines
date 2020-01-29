//main game file


class JSLines {

    constructor () {

        this._initialCount   = 5;
        this._nextBallsCount = 3;

        this._gridCols    = 9;
        this._grisRows    = 9;
        this._colorsCount = 7;

        this._gameArea  = new GameArea (this._gridCols, this._grisRows, this._colorsCount);
        this._presenter = new Presenter ("jslines", this._gameArea);
        this._presenter.canvas.addEventListener ("click", this.onCanvasClick.bind (this));
        this._ballsDistributor = new BallDistributor (this._gameArea, this._initialCount, this._nextBallsCount);

        this._selectedBall = null;
    }

    run () {

        this._ballsDistributor.init ();
        this._presenter.draw ();
        this._presenter.drawNextBalls (this._ballsDistributor.nextBalls);

    }

    onCanvasClick (event) {

        if (this._presenter.isAnimationRunning)
            return;

        const cell = this._presenter.getCellAt (event.layerX, event.layerY);
        this.onCellClicked (cell);    
    }

    onCellClicked (cell) {

        if (!cell.isFree) {
        
           this._selectedBall = cell;
           this._presenter.animateSelected (this._selectedBall);

        } else if (this.haveSelected ()) {

            this.turn (cell);                          

        } else {

           this._selectedBall = null;
           this._presenter.stopAnimateSelected ();
        }
    }

    haveSelected () {

        return this._selectedBall != null;
    }

    async turn (cell) {

        const res = await this.moveSelectedTo (cell);
        if (!res)
            return;

        this._presenter.stopAnimateSelected ();
        this._selectedBall = null;

        let have_line = await this.checkForLines ([cell]);

        if (!have_line) {

            const new_balls = await this.distributeBalls ();
            if (this._ballsDistributor.nextBalls.length === 0) {

                this.restart ();
                return;
            }
            await this.checkForLines (new_balls);                                        
        }
        this._presenter.drawNextBalls   (this._ballsDistributor.nextBalls);
    }

    async moveSelectedTo (cell) {

        const path = this._gameArea.getPath (this._selectedBall, cell); 
        if (path.length === 0)
            return false;
        
        this._presenter.stopAnimateSelected ();

        await this._presenter.animateMove (path);                  
        cell.putBall (this._selectedBall);
        this._selectedBall.removeBall ();

        return true;
    }

    async distributeBalls () {

        const new_balls = this._ballsDistributor.turn ();
        await this._presenter.animateNewBalls (new_balls);
        this._presenter.drawNextBalls   (this._ballsDistributor.nextBalls);
        return new_balls;
    }

    async checkForLines (balls) {
       
        let balls_to_destroy = new Set ();
        for (let ball of balls) {

            let line = this._gameArea.getColorLines (ball); 
            line.forEach ((val) => {balls_to_destroy.add (val)})            
        }
        if (balls_to_destroy.size > 0) {

            console.log (balls_to_destroy.size);
            await this._presenter.animateDestroy (Array.from (balls_to_destroy));
            this._gameArea.clearCells (Array.from (balls_to_destroy));
            return true;
        }        
        return false;
    }

    restart () {

        this._gameArea.reset ();
        this.run ();
    }
}

const js_lines = new JSLines;
js_lines.run ();