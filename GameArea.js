//Game Area represents the game model

class GameArea  {

    constructor () {
        this._cols = 10;
        this._rows = 10;
    };

    cols () {

        return this._cols;
    }

    rows () {

        return this._rows;
    }
}