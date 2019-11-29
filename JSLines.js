//main game file


let gameArea  = new GameArea ();
let presenter = new Presenter ("jslines", gameArea);

presenter.draw ();

console.log (gameArea.cols   ());
console.log (presenter.width ());
console.log (presenter._width);