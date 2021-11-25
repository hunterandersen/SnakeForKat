import SnakeInfo from './Classes/SnakeInfo.js';
import Square from './Classes/Square.js';

const canvas = document.getElementById('canvas1');
var context = canvas.getContext('2d');
const gridRowLength = 35;
const numSquares = gridRowLength*gridRowLength;
var canvasDimension = floorByNum((window.innerWidth <= window.innerHeight)? (window.innerWidth - (window.innerWidth*.09)) : (window.innerHeight - (window.innerHeight*.09)), gridRowLength);
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
let snakeDirectionCurrent;
let snakeDirectionFuture;
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
    
    snakeDirectionCurrent = 'right';
    snakeDirectionFuture = 'right';
    isGameOver = false;
    then = Date.now();
    speed = 10;
    spawnCounter = 0;
    spawnInterval = 3;
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
    squaresList.forEach((square) =>{
        square.drawSelf();
        if(square.isAnimating()){
            animationSquares.push(square);
        }
    });
    animationSquares.forEach((square) =>{
        square.drawAnimation();
    });
}

//Returns true if the snake is about to hit something that could kill it
function checkCollision(){
    //Where the snake head is going
    snakeDirectionCurrent = snakeDirectionFuture;

    switch(snakeDirectionCurrent){
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
        let nextSquareOccupant = squaresList[nextHeadIndex].getOccupant();

        if((nextSquareOccupant) && nextSquareOccupant !== 'fruit'){
            //console.log(`${squaresList[nextHeadIndex].getOccupant()}`);
            gameOver();
        }else if(squaresList[nextHeadIndex].getOccupant() === 'fruit'){
            scoreFruit(squaresList[nextHeadIndex]);
            moveHead(true);
            spawnFruit();
            if (spawnCounter >= spawnInterval){
                spawnWall();
                spawnCounter = 0;
                spawnInterval = randIntBetween(1, 6);
            }
            else{
                spawnCounter++;
            }
        }else{
            moveHead(false);
        }
    }
    else{
        gameOver();
    }

}

function getFittedFontSize(startFontSize, text, screenWidth, xMargin){
    let desiredSize = startFontSize;
    context.font = `${desiredSize}px serif`;
    while(context.measureText(text).width > screenWidth - (2*xMargin)){
        context.font = `${--desiredSize}px serif`;
    }
    return desiredSize;
}

function gameOver(){
    const margin = canvas.width * .05;
    const yPos = canvas.height * .5;
    const largeFont = getFittedFontSize(300, "Game Over", canvas.width, margin);
    const smallFont = largeFont * .5;

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
    
    scoreLabel.textContent = `Score: ${scoreCount}`;
    highScoreLabel.textContent = `High Score: ${highScore}`;

}

function scoreFruit(fruitSquare){
    scoreCount += fruitSquare.getFruitValue();
    scoreLabel.textContent = `Score: ${scoreCount}`;
}

function spawnFruit(){
    let fruitIndex = randIntBetween(0, numSquares);

    while(squaresList[fruitIndex].getOccupant()){
        fruitIndex = randIntBetween(0, numSquares);
    }

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

    speed+=.5;
    squaresList[fruitIndex].setFruitValue(fruitValue);
    squaresList[fruitIndex].startAnimation('fruitCreation');
}

function spawnWall(){
    let wallIndex = randIntBetween(0, numSquares);

    while(squaresList[wallIndex].getOccupant()){
        wallIndex = randIntBetween(0, numSquares);
    }

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

    //This is what moves the snake's head forward
    squaresList[nextHeadIndex].setOccupant('head');
}

//Get User Movement Input
window.addEventListener('keydown', (event) => {
    const eventCode = event.code;
    switch(eventCode){
        case 'ArrowLeft': 
            event.preventDefault();
            if (snakeDirectionCurrent != 'right'){
                snakeDirectionFuture = 'left';
            }
            break;
        case 'ArrowRight': 
            event.preventDefault();
            if (snakeDirectionCurrent != 'left'){
                snakeDirectionFuture = 'right';
            }
            break;
        case 'ArrowUp' : 
            event.preventDefault();
            if (snakeDirectionCurrent != 'down'){
                snakeDirectionFuture = 'up';
            }
            break;
        case 'ArrowDown' : 
            event.preventDefault();
            if (snakeDirectionCurrent != 'up'){
                snakeDirectionFuture = 'down';
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
    if(isGameOver){
        init();
    }
});

//Utility Functions
function floorByNum(x, floorVal){
    return Math.floor(x/floorVal)*floorVal;
}

function randIntBetween(min, max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random()*(max-min+1)) + min;
}

init();