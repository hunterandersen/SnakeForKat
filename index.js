//Including the custom classes
import SnakeInfo from './Classes/SnakeInfo.js';
import Square from './Classes/Square.js';

const canvas = document.getElementById('canvas1');
const context = canvas.getContext('2d');
const gridRowLength = 35; //sets the number of squares in each row for the game
const numSquares = gridRowLength*gridRowLength;

//desiredDimension is 90% of the smaller dimension (width or height);
const desiredDimension = (window.innerWidth <= window.innerHeight)? (window.innerWidth - (window.innerWidth*.09)) : (window.innerHeight - (window.innerHeight*.09));
//canvasDimension is the width and height in pixels for our snake game canvas
let canvasDimension = floorByNum(desiredDimension, gridRowLength);//This operation makes sure that the game squares will perfectly fit the canvas size
canvas.width = canvasDimension;
canvas.height = canvasDimension;
const newGameButton = document.getElementById('newGameButton');
const scoreLabel = document.createElement('label');
scoreLabel.className = 'scoreLabel';
const highScoreLabel = document.createElement('label');
highScoreLabel.className = 'scoreLabel';
const gameInfoArea = document.getElementById('gameInfoArea');
gameInfoArea.appendChild(scoreLabel);
gameInfoArea.appendChild(highScoreLabel);

let squaresList = [];
let snakeList;
let snakeDirection;
let previousDirection;
let oldHeadIndex;
let nextHeadIndex;
let isGameOver;
let then;
let now;
let speed;
let spawnCounter;
let spawnInterval;
let scoreCount;
let highScore = 0;

window.onresize = () =>{
    canvasDimension = floorByNum((window.innerWidth <= window.innerHeight)? (window.innerWidth - (window.innerWidth*.09)) : (window.innerHeight - (window.innerHeight*.09)), gridRowLength);
    canvas.width = canvasDimension;
    canvas.height = canvasDimension;
    
    for(let i = 0; i < gridRowLength; i++){
        for(let j = 0; j < gridRowLength; j++){
            squaresList[(i*gridRowLength)+j].resize(j*(canvasDimension/gridRowLength), i*(canvasDimension/gridRowLength), (canvasDimension/gridRowLength));
        }
    }

}

function init() {
    squaresList = [];
    for(let i = 0; i < gridRowLength; i++){
        for(let j = 0; j < gridRowLength; j++){
            squaresList.push(new Square(j*(canvasDimension/gridRowLength), i*(canvasDimension/gridRowLength), (canvasDimension/gridRowLength), null, context));
        }
    }
    
    snakeDirection = 'right';
    previousDirection = 'right';
    isGameOver = false;
    then = Date.now();
    speed = 10;
    spawnCounter = 0;
    spawnInterval = 3; //This ensures that the player can always eat three fruit before any deadly walls spawn
    scoreCount = 0;
    scoreLabel.textContent = `Score: ${scoreCount}`;

    snakeList = [new SnakeInfo(gridRowLength+1, 'head')];
    snakeList.forEach( (snake)=>{
        squaresList[snake.getIndex()].setOccupant(snake.getOccupant());
    });

    spawnFruit();
    drawAll();
    update();
}

function update(){
    now = Date.now();
    let deltaTime = now - then;
    if(deltaTime > (1000 / speed)){
        then = Date.now();
        updateHeadIndex();
        checkCollision();
        if(!isGameOver){
            drawAll();
        }
    }
    if (!isGameOver){
        requestAnimationFrame(update);
    }
}

function updateHeadIndex(){
    //Where the head is RIGHT NOW
    oldHeadIndex = snakeList[snakeList.length-1].getIndex();
}

function drawAll(){
    let animationSquares = [];

    //Draw each square
    squaresList.forEach((square) =>{
        square.drawSelf();
        if(square.isAnimating()){
            //If the square has an animation to play, add it to this array
            animationSquares.push(square);
        }
    });
    //Draw the animation for each animating square as determined above
    animationSquares.forEach((square) =>{
        square.drawAnimation();
    });
}

//Returns true if the snake is about to hit something that could kill it
function checkCollision(){
    //Where the snake head is going
    previousDirection = snakeDirection;

    //find the square that the snake is trying to move to. 
    //This isn't as simple as current square +1 due to the way the grid of squares is laid out.
    //Vertical movement jumps by whatever the length of the row is
    switch(snakeDirection){
        case 'up': nextHeadIndex = oldHeadIndex-gridRowLength;
            break;
        case 'down': nextHeadIndex = oldHeadIndex+gridRowLength;
            break;
        case 'left': nextHeadIndex = oldHeadIndex-1;
            break;
        case 'right': nextHeadIndex = oldHeadIndex+1;
            break;
    }

    let outOfBounds = false;
    if(nextHeadIndex < 0){
        //Out of bounds TOP
        outOfBounds = true;
    }else if (nextHeadIndex >= numSquares){
        //Out of bounds BOTTOM
        outOfBounds = true;
    }else if ((nextHeadIndex == oldHeadIndex+1) && ((oldHeadIndex+1)%gridRowLength)==0){
        //Out of bounds RIGHT
        outOfBounds = true;
    }else if((nextHeadIndex == oldHeadIndex-1) && ((oldHeadIndex)%gridRowLength)==0){
        //Out of bounds LEFT
        outOfBounds = true;
    }

    if(!outOfBounds){
        //Check what is in the next square
        let nextSquareOccupant = squaresList[nextHeadIndex].getOccupant();

        if((nextSquareOccupant) && nextSquareOccupant !== 'fruit'){
            //if they hit a wall, game over
            gameOver();
        }else if(squaresList[nextHeadIndex].getOccupant() === 'fruit'){
            //if they ate a fruit, update the score, grow the tail, move the player, and spawn a new fruit/wall
            scoreFruit(squaresList[nextHeadIndex]);
            moveHead(true);
            spawnFruit();
            if (spawnCounter >= spawnInterval){
                spawnWall();
                spawnCounter = -1;
                spawnInterval = randIntBetween(1, 6);
            }
            spawnCounter++;
        }else{
            moveHead(false);//Move the player without growing the tail
        }
    }
    else{
        //if the player hit the edge of the screen, game over
        gameOver();
    }

}

//returns the correct pixel size for the given text message, area, and margin
function getFittedFontSize(startFontSize, text, screenWidth, xMargin){
    let desiredSize = startFontSize;
    context.font = `${desiredSize}px serif`;
    while(context.measureText(text).width > screenWidth - (2*xMargin)){
        context.font = `${--desiredSize}px serif`;
    }
    return desiredSize;
}

function gameOver(){
    //set the font size to fit the canvas size
    const margin = canvas.width * .05;
    const yPos = canvas.height * .5;
    const largeFont = getFittedFontSize(300, "Game Over", canvas.width, margin);
    const smallFont = largeFont * .5;

    //draw the Game Over and Score messages
    context.fillStyle = 'red';
    context.font = `${largeFont}px serif`;
    context.fillText('Game Over', margin, yPos);
    context.strokeStyle = 'white';
    context.strokeText('Game Over', margin, yPos);
    context.fillStyle = 'blue';
    context.font = `${largeFont*.5}px sans-serif`;
    context.fillText(`Score: ${scoreCount}`, margin, yPos + smallFont);
    context.strokeStyle = 'white';
    context.strokeText(`Score: ${scoreCount}`, margin, yPos + smallFont);
    isGameOver = true;

    if(highScore < scoreCount){
        highScore = scoreCount;
    }
    
    //update the scores on the sideboard
    scoreLabel.textContent = `Score: ${scoreCount}`;
    highScoreLabel.textContent = `High Score: ${highScore}`;
}

function scoreFruit(fruitSquare){
    scoreCount += fruitSquare.getFruitValue();
    scoreLabel.textContent = `Score: ${scoreCount}`;
}

function spawnFruit(){
    let fruitIndex = randIntBetween(0, numSquares);

    //find an empty square to spawn the fruit in
    while(squaresList[fruitIndex].getOccupant()){
        fruitIndex = randIntBetween(0, numSquares);
    }

    //Use a random number to simulate the odds in order to determine which fruit will spawn
    let fruitValue = 1;
    let odds = randIntBetween(1, 100);
    if(odds < 70){
        fruitValue = 1;
    }else if (odds >= 70 && odds < 90){
        fruitValue = 2;
    }else if (odds >= 90 && odds < 98){
        fruitValue = 3;
    }else if (odds >=98){
        fruitValue = 4;
    }

    //increase the game speed
    speed+=.5;

    //Actually place the fruit and begin the animation that plays when a new fruit is generated
    squaresList[fruitIndex].setFruitValue(fruitValue);
    squaresList[fruitIndex].startAnimation('fruitCreation');
}

function spawnWall(){
    let wallIndex = randIntBetween(0, numSquares);

    //find an empty square to spawn a wall in
    while(squaresList[wallIndex].getOccupant()){
        wallIndex = randIntBetween(0, numSquares);
    }

    //Actually place the wall in the world
    squaresList[wallIndex].setOccupant('wall');
}

function moveHead(isGrowing){
    //Setting current head spot to be a tail
    squaresList[oldHeadIndex].setOccupant('tail');

    snakeList.push(new SnakeInfo(nextHeadIndex, 'head'));
    if(!isGrowing){
        //If the snake isn't getting longer, then chop off the end of the tail
        //This is the second half of making it appear to move forward
        squaresList[snakeList[0].getIndex()].setOccupant(null);
        snakeList.shift();
    }
    else{
        squaresList[nextHeadIndex].startAnimation('fruitConsumed');
    }

    //This is what moves the snake's head move forward
    squaresList[nextHeadIndex].setOccupant('head');
}

//Get User Movement Input
window.addEventListener('keydown', (event) => {
    const eventCode = event.code;
    //We need the previous direction checks because rapid user input can 'trick' the snake into trying to move backwards into its own tail.
    //This causes the player to lose the game. I would like to prevent the user from losing in this way, and instead ignore the self-destructive inputs
    switch(eventCode){
        case 'ArrowLeft': 
            event.preventDefault();
            if (snakeDirection != 'right' && previousDirection != 'right'){
                snakeDirection = 'left';
            }
            break;
        case 'ArrowRight': 
            event.preventDefault();
            if (snakeDirection != 'left' && previousDirection != 'left'){
                snakeDirection = 'right';
            }
            break;
        case 'ArrowUp' : 
            event.preventDefault();
            if (snakeDirection != 'down' && previousDirection != 'down'){
                snakeDirection = 'up';
            }
            break;
        case 'ArrowDown' : 
            event.preventDefault();
            if (snakeDirection != 'up' && previousDirection != 'up'){
                snakeDirection = 'down';
            }
            break;
        case 'Space' :
            event.preventDefault();
            if(isGameOver){
                init();
            }
    }

});

newGameButton.addEventListener('click', (ev)=>{
    //Simply starts a new game when the user clicks the button. But not if there is an ongoing game.
    if(isGameOver){
        init();
    }
});

//Begin the game once the script has finished loading
init();

//----Utility Functions----
function floorByNum(x, floorVal){
    //returns the largest integer multiple of the floorVal that can fit into x;
    //example: let x = 100. let floorVal = 22
    //the function would return the value of 88
    //In other words, we can't let the value go over x, but we want it as close as possible to x while still being an integer multiple of floorVal
    return Math.floor(x/floorVal)*floorVal;
}

//return an integer value between the min and maximum values
function randIntBetween(min, max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random()*(max-min+1)) + min;
}