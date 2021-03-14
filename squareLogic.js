"use strict";

var log = console.log;

const localStorage = window.localStorage;

const DIFFICULTY = {
  EASY: 3,
  MEDIUM: 4,
  HARD: 6,
};

let globalDifficulty = null;
var Square = null;

//Binding event handlers for the UI Elements
document.addEventListener("DOMContentLoaded", function () {
  globalDifficulty = DIFFICULTY.MEDIUM;
  Square = new Game(globalDifficulty);
  Square.renderGrid();

  let btns_difficultySelection = document.querySelectorAll(
    ".dificultySection .button"
  );

  btns_difficultySelection.forEach((item) => {
    item.addEventListener("click", (event) => {
      let selectedDifficulty = event.target.id.split("_")[1];

      btns_difficultySelection.forEach((item) => {
        item.classList.remove("active");
      });

      document
        .getElementById("difficulty_" + [selectedDifficulty])
        .classList.add("active");
      Square.reset(selectedDifficulty);
    });
  });

  document.getElementById("startGame").addEventListener("click", (event) => {
    Square.startGame();
  });
});


//Isolated/Encapulated datastructure for Game related logic (conceptual class)
function Game(difficulty) {
  //update the global difficulty everytime its changed
  globalDifficulty = difficulty;
  let gridSize = difficulty * difficulty;

  this.difficulty = difficulty;
  this.timeLeft = 0;

  //maximum time the game is active
  this.maxTime = 12;
  this.gridSize = gridSize;
  this.score = 0;
  this.highScore = 0;

  this.currentGreenSquareIndex = null;
  this.previousGreenSquareIndex = null;
  
  //holds the referance to setInterval incase its needed to be reset
  this.gameLooper = null;

  //resets the state of the game
  this.reset = (difficulty) => {
    log("reset :" + difficulty);
    clearInterval(this.gameLooper);
    gridSize = difficulty * difficulty;
    globalDifficulty = difficulty;

    this.timeLeft = this.maxTime;
    this.gridSize = difficulty * difficulty;
    this.score = 0;
    this.currentGreenSquareIndex = null;
    this.previousGreenSquareIndex = null;
    this.gameLooper = null;

    this.renderGrid();
  };

  this.getHighScore = () => {
    let highScore = localStorage.getItem("highScore");
    if (highScore) {
      return highScore;
    }

    //if no game has been played yet. set the initial high score to 0
    else {
      localStorage.setItem("highScore", 0);
      return 0;
    }
  };

  //update the high score entry in localstorage
  this.setHighScore = (highScore) => {
    localStorage.setItem("highScore", highScore);
  };


  this.getNextGrid = () => {
     let randomIndex = Math.floor(Math.random() * this.gridSize);

    //Make sure a different tile is activated on every run
    if (randomIndex == this.currentGreenSquareIndex) {
      //If new random number is same as green tile re-run the randome number generation
      return this.getNextGrid();
    }

    this.previousGreenSquareIndex = this.currentGreenSquareIndex;
    this.currentGreenSquareIndex = randomIndex;

    //remove highlight/green background form all the tiiles
    if (this.previousGreenSquareIndex != null) {
      document
        .getElementById("gridTile_" + this.previousGreenSquareIndex)
        .classList.remove("active");
    }

    //apply highlight to respective tile 
    document
      .getElementById("gridTile_" + this.currentGreenSquareIndex)
      .classList.add("active");

  };

  this.reduceTimeBy1Sec = () => {
    if (this.timeLeft == 0) {
      document.getElementById("time").innerText = 0;
      this.gameOver();
    } else {
      this.timeLeft = this.timeLeft - 1;
      document.getElementById("time").innerText = this.timeLeft+1;
    }
  };

  this.gameOver = () => {
    if (this.timeLeft == 0) {
      document.getElementById("time").innerText = 0;

      if (confirm("GAME OVER!\nClick OK to restart the game\nClick Cancel to change difficulty")) {
          //reset the game and restart
          this.startGame()
      } else {

        //reset the game without starting it
        this.renderGrid()
      }
    }

  };


  this.startGame = () => {
    clearInterval(this.gameLooper);
    this.reset(globalDifficulty);
    this.renderGrid();


    this.getNextGrid();
    this.reduceTimeBy1Sec();

    this.gameLooper = setInterval(() => {
      this.getNextGrid();
      this.reduceTimeBy1Sec();
    }, 1000);
    document.getElementById("startGame").innerText = "RESET";

    
  };

  this.updateScore = (index, memo) => {
    
    if (
      index == this.currentGreenSquareIndex &&
      this.timeLeft != this.maxTime
    ) {
      this.score = this.score + 1;

      if (this.score > this.getHighScore()) {
        this.setHighScore(this.score);

        this.highScore =this.score
        document.getElementById("highScore").innerText = this.highScore; 
        
      }
    } else if (
      index != this.currentGreenSquareIndex &&
      this.timeLeft != this.maxTime
    ) {
      //if (this.score > 0) {
      this.score = this.score - 1;
      //}
    }
    document.getElementById("score").innerText = this.score;

  };

  this.updateScore_cached = () => {
    let cache = {};
    return (selection) => {
      if (this.timeLeft != this.maxTime) {
        let actual = this.currentGreenSquareIndex;
        if (actual in cache) {
          console.log("Fetching from cache");
          return cache[actual];
        } else {
          console.log("Calculating result");
          cache = {};
          cache[actual] = actual;
          this.updateScore(selection);
          return actual;
        }
      }
    };
  };

  this.handlePlayerClick = (element) => {
    log(element);
  };

  this.renderGrid = () => {
    this.highScore = this.getHighScore()
    document.getElementById("highScore").innerText = this.highScore;    

    document.getElementById("startGame").innerText = "START";
    document.getElementById("score").innerText = 0;
    document.getElementById("time").innerText = 120;

    clearInterval(this.gameLooper);
    this.timeLeft = this.maxTime;

    log('globalDifficulty '+globalDifficulty)
    document
      .getElementById("difficulty_" + [globalDifficulty])
      .classList.add("active");

    let updateScoreCached = this.updateScore_cached();
    let createDiv = (id) => {
      let div = document.createElement("div");
      div.classList.add("cell_" + globalDifficulty);
      div.innerHTML = '<div id="' + id + '" class="tile" data-ratio="square"/>';

      div.addEventListener("click", (event) => {
        if(event.target.className.includes('tile')){
        updateScoreCached(event.target.getAttribute("id").split("_")[1]);
      }
      });

      return div;
    };

    const grid = document.querySelector("#grid");

    document.getElementById("grid").innerHTML = "";

    for (let i = 0; i < this.gridSize; i++) {
      grid.appendChild(createDiv("gridTile_" + i));
    }
  };
}
