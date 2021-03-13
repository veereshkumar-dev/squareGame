"use strict";

var log = console.log;

const localStorage = window.localStorage;

const DIFFICULTY = {
  EASY: 2,
  MEDIUM: 3,
  HARD: 4,
};

let globalDifficulty = null;
var Square = null;

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

function Game(difficulty) {
  globalDifficulty = difficulty;
  let gridSize = difficulty * difficulty;

  this.difficulty = difficulty;
  this.timeLeft = 3;
  this.maxTime = 12;
  this.gridSize = gridSize;
  this.score = 0;
  this.highScore = 0;
  this.currentGreenSquareIndex = null;
  this.previousGreenSquareIndex = null;
  this.gameLooper = null;

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

    //First run when highScore is not present in localStorage
    else {
      localStorage.setItem("highScore", 0);
      return 0;
    }
  };

  this.setHighScore = (highScore) => {
    localStorage.setItem("highScore", highScore);
  };

  this.getNextGrid = () => {
    if (this.timeLeft == 121) {
      this.reduceTimeBy1Sec();
      return;
    }

    if (this.timeLeft == 0) {
      return;
    }

    let randomIndex = Math.floor(Math.random() * this.gridSize);

    //Make sure a different tile is activated on every run
    if (randomIndex == this.currentGreenSquareIndex) {
      return this.getNextGrid();
    }

    this.previousGreenSquareIndex = this.currentGreenSquareIndex;
    this.currentGreenSquareIndex = randomIndex;

    //log(this.previousGreenSquareIndex);
    if (this.previousGreenSquareIndex != null) {
      document
        .getElementById("gridTile_" + this.previousGreenSquareIndex)
        .classList.remove("active");
    }
    document
      .getElementById("gridTile_" + this.currentGreenSquareIndex)
      .classList.add("active");

    grid[randomIndex] = 1;
    return grid;
  };

  this.reduceTimeBy1Sec = () => {
    if (this.timeLeft == 0) {
      document.getElementById("time").innerText = 0;
      this.stopGame();
    } else {
      this.timeLeft = this.timeLeft - 1;
      document.getElementById("time").innerText = this.timeLeft+1;
    }
  };

  this.stopGame = () => {
    if (this.timeLeft == 0) {
      document.getElementById("time").innerText = 0;

      if (confirm("GAME OVER! DO you want to restart the game?")) {
             this.startGame()
      } else {
        this.renderGrid()
      }
    }

    // clearInterval(this.gameLooper);

    // document.getElementById("startGame").innerText = "START";
//    this.renderGrid();
  };

  this.startGame = () => {
    clearInterval(this.gameLooper);
    this.reset(globalDifficulty);
    this.renderGrid();


    let grid = this.getNextGrid();
    this.reduceTimeBy1Sec();
    this.gameLooper = setInterval(() => {
      let grid = this.getNextGrid();
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
