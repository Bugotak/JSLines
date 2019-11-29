//main game file


let gameArea  = new GameArea ();
let presenter = new Presenter ("jslines", gameArea);

gameArea.distribute (5);
presenter.draw ();

console.log (gameArea.cols   ());
console.log (presenter.width ());
console.log (presenter._width);