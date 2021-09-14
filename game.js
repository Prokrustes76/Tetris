var cvs = document.getElementById("canvas");
var ctx = cvs.getContext("2d");

let farben = ['#CCC','red','yellow','blue','cyan','green','brown','orange','black','white'];
let score  = 0, level = 1, round = 1;
let board = [];
let hugeList = [];
let currStone;
let nextStone;
let timer = 0;
let running = true;
let timeBetween = 45;
let explosionTimer = -200;
let levelTimer = -200;
let lastScore;
var explosion = new Image();
explosion.src = src="img/Explosion.png"
var success  = new Audio("sounds/success.wav");
var moved    = new Audio("sounds/move.wav");
var nxtlvl   = new Audio("sounds/nxtlvl.wav");
var crash    = new Audio("sounds/crash.mp3");
var bumm     = new Audio("sounds/bumm.wav");

class Stone{
  
  constructor(nr){
    this.typ    = nr;
    this.x      = 4;
    this.y      = 0;
    this.farbe  = farben[nr];
    this.form   = [];
    this.extraX = 8.8;
    if (nr == 6) this.extraX += 0.5;
    if (nr == 7) this.extraX -= 0.5; 
    
    if(nr == 1) this.form = [[1,1,1],[0,1,0],[0,0,0]];
    if(nr == 2) this.form = [[1,1,1],[1,0,0],[0,0,0]];
    if(nr == 3) this.form = [[1,1,1],[0,0,1],[0,0,0]];
    if(nr == 4) this.form = [[1,1,0],[0,1,1],[0,0,0]];
    if(nr == 5) this.form = [[0,1,1],[1,1,0],[0,0,0]];
    if(nr == 6) this.form = [[1,1],[1,1]];
    if(nr == 7) this.form = [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]];
  }

  show(extraX, extraY){
    for (let i = 0; i < this.form.length; i++){
      for (let j = 0; j < this.form.length; j++){
        if (this.form[i][j] == 1){
          ctx.fillStyle = farben[this.typ];
          ctx.fillRect((this.x+j-1+extraX)*30,(this.y+i+extraY)*30,30,30);
          ctx.strokeStyle = 'black';
          ctx.strokeRect((this.x+j-1+extraX)*30,(this.y+i+extraY)*30,30,30);
        }
      }
    }
  }

  rotate(){
    let copy = new Stone(this.typ);
    copy.y = this.y;
    copy.x = this.x;
    for (let i = 0; i < this.form.length; i++)
      for (let j = 0; j < this.form.length; j++)
        copy.form[i][j] = this.form[this.form.length-1-j][i];  
 
    if (!copy.collision(0,0)) currStone = copy;
  }

  drop(){
    this.y++;
  }

  stay(){
    for (let i = 0; i < this.form.length; i++)
      for (let j = 0; j < this.form.length; j++)
        if (this.form[i][j] == 1)
          board[this.y+i][this.x+j] = this.typ;
    bumm.play();
    checkSink();
    round++; 
    if (round % 20 == 0){
      nxtlvl.play();
      level++;
      levelTimer = timer;
      timeBetween *= 0.9;
    }
    newPiece();
  }

  gravity(){
    if (!this.collision(0,1)) this.drop();
    else this.stay(); 
  }

  collision(extraX,extraY){
    for (let i = 0; i < this.form.length; i++)
      for (let j = 0; j < this.form.length; j++){
	if (i+this.y+extraY > 20) continue;
        if (board[i+this.y+extraY][j+this.x+extraX] != 0 && this.form[i][j] == 1) 
          return true;
      }
    return false;
  }
}

function move(){
    if (event.keyCode == 37 && !currStone.collision(-1,0)){
      currStone.x--; moved.play();
    }
    if (event.keyCode == 39 && !currStone.collision( 1,0)){ 
      currStone.x++; moved.play();
    }
    if (event.keyCode == 40 && !currStone.collision( 0,1)){
      currStone.y++; moved.play();
      timer -= timer % Math.floor(timeBetween)
    }
    if (event.keyCode == 38){
      currStone.rotate(); moved.play();
    }
}

function newPiece(){
  currStone = nextStone;
  nextStone = new Stone(hugeList[Math.floor(round/7)][round%7]);  
  if (round % 13 == 0) makeHugeList();
  checkLoss();
}

function checkSink(){
  let linesCleared = 0;
  for (let i = 0; i < 20; i++){
    if (checkLineIsFull(i)){
      linesCleared++;
      board.splice(i,1);
      board.unshift([1,0,0,0,0,0,0,0,0,0,0,1]);
    }
  }
  if (linesCleared > 0) scored(linesCleared);
}

function scored (lines){
  success.play();
  lastScore =  100*Math.pow(2,lines-1)*level;
  score += lastScore;
  explosionTimer = timer;
}

function checkLineIsFull(nr){
  for (let i = 1; i < 11; i++)
    if (board[nr][i] == 0) return false;
  return true;
}

function checkLoss(){
  if (currStone.collision(0,0)){
    crash.play();
    setTimeout(function(){location.reload();},3000);
    running = false;
  }
}

function showBackground(){
  ctx.fillStyle = '#666';
  ctx.fillRect(300,0,200,600);
}

function showText(){
  ctx.font = "30px Times Roman";
  for (let i = 0; i < 3; i +=2){
    ctx.fillStyle = farben[i/2+8];

    ctx.fillText("Next piece:",330-i,50-i);

    ctx.fillText("Score :",330-i,290-i);
    ctx.fillText(score, 330-i, 325-i);

    if (!nxtlvl.paused && i == 2)
      ctx.fillStyle = farben[Math.floor(Math.random()*7)+1]
    ctx.fillText("Level :",330-i,390-i);
    ctx.fillText(level, 330-i,425-i);
  }
}

function showBoard(){
  for (let i = 0; i < 20; i++)
    for (let j = 1; j < 11; j++){
      ctx.fillStyle = farben[board[i][j]];
      ctx.fillRect((j-1)*30,i*30,30,30);
      ctx.strokeRect((j-1)*30,i*30,30,30);
    }
}

function checkExplosion(){
  if (timer - explosionTimer <= 120){
  ctx.drawImage(explosion,308,425,180,160);
  ctx.fillStyle = 'black';
  ctx.font = "30px Comic Sans MS";
  ctx.textAlign = "center";
  ctx.fillText(lastScore,395,515);
  ctx.textAlign = "left";
  }
}

function makeHugeList(){
  for (let i = 0; i < 2; i++){
    let miniList = [1,2,3,4,5,6,7];
    for (let i = 0; i < 20; i++){
      miniList.unshift(miniList.splice(Math.floor(Math.random()*7),1));
    }
    hugeList.push(miniList);
  }
}


// -----------------------------------------------------------


for (let i = 0; i < 20; i++)
  board.push([1,0,0,0,0,0,0,0,0,0,0,1]);
board[20] =  [1,1,1,1,1,1,1,1,1,1,1,1];
makeHugeList();
nextStone = new Stone(hugeList[0][0]);
newPiece();

document.addEventListener("keydown",move)


// -----------------------------------------------------------

function gameLoop(){
  let timeToDrop = Math.round(timeBetween);
  if (timer % timeToDrop == timeToDrop-1)
      currStone.gravity();
  timer++;

  function draw(){
    showBackground();
    showText();
    showBoard();
    currStone.show(0,0);
    nextStone.show(nextStone.extraX,2.5);
    checkExplosion();
    if (running) requestAnimationFrame(gameLoop);
  }
  draw();
}

gameLoop();