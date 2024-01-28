import shapes from "./tetriminos";

const gameGrid = document.querySelector(".game-grid");
const startButton = document.querySelector(".start");
const stopButton = document.querySelector(".stop");
const scoreBoard = document.querySelector(".score");
const gameOver = document.querySelector(".game-over");

const gridHeight = 20;
const gridWidth = 9;

let grid = new Array(gridHeight)
  .fill(null)
  .map(() => new Array(gridWidth).fill(0));

let animate;
let score = 0;

window.onload = () => {
  grid.forEach((row, rowId) => {
    gameGrid.innerHTML += `
     <div class="row">
       ${row
         .map((_, colId) => `<div class="cell" id=${rowId}-${colId}></div>`)
         .join("")}
     </div>
  `;
  });
};

let variant = Math.floor(Math.random() * shapes.length);
let shape = shapes[variant].main;

let rowIncrement = 0;
let colStart = Math.floor(Math.random() * (gridWidth - shape[0].length + 1));

let stateGrid = grid;
let subVariant = 0;
let restart = false;

let collisionGrid;

const cue = () => {
  collisionGrid = grid;
  if (rowIncrement > grid.length - shape.length) {
    rebirth();
    return;
  }
  const tempGrid = new Array(gridHeight)
    .fill(null)
    .map(() => new Array(gridWidth).fill(0));
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      if (stateGrid[i][j]) tempGrid[i][j] = stateGrid[i][j];
    }
  }
  grid = tempGrid;
  for (let num of grid[0]) {
    if (num) {
      console.log("game over");
      clearInterval(animate);
      gameOver.innerHTML = `<h1>Game Over. Your score was ${score}</h1>`
      gameOver.style.display = "block";
      return;
    }
  }
  shape.forEach((bitRow, i) => {
    for (let k = 0; k < bitRow.length; k++) {
      if (bitRow[k]) {
        if (i + rowIncrement >= grid.length || k + colStart >= grid[0].length)
          return;
        if (grid[i + rowIncrement][k + colStart]) {
          restart = true;
          return;
        }
        grid[i + rowIncrement][k + colStart] = variant + 1;
      }
    }
  });
  if (restart) {
    rebirth();
    restart = false;
    return;
  }
  flipBit();
  rowIncrement += 1;
};

const flipBit = () => {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => {
    const [x, y] = cell.getAttribute("id").split("-");
    if (grid[x][y] == 1) cell.style.backgroundColor = "#fc0373";
    else if (grid[x][y] == 2) cell.style.backgroundColor = "#03adfc";
    else if (grid[x][y] == 3) cell.style.backgroundColor = "#04bf0a";
    else cell.style.backgroundColor = "";
  });
};

document.addEventListener("keydown", (e) => {
  e.preventDefault();
  switch (e.key) {
    case "ArrowRight":
      colStart += 1;
      break;
    case "ArrowLeft":
      colStart -= 1;
      break;
    case "ArrowUp":
      shape = shapes[variant].variants[subVariant];
      subVariant = (subVariant + 1) % shapes[variant].variants.length;
      break;
    case "ArrowDown":
      if (rowIncrement >= grid.length) return;
      rowIncrement += 1;
      break;
  }
});

startButton.addEventListener("click", () => {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
  if (animate) return;
  animate = setInterval(() => cue(), 500);
});

stopButton.addEventListener("click", () => {
  if (animate) clearInterval(animate);
  animate = false;
});

const checkLayer = () => {
  for (let i = 0; i < collisionGrid.length; i++) {
    if (!collisionGrid[i].includes(0)) {
      // console.log("full row", i);
      collisionGrid[i] = collisionGrid[i].map((bit) => (bit = 0));
      sediment(i);
      return;
    }
  }
};

const sediment = (rowNum) => {
  let a = JSON.parse(JSON.stringify(collisionGrid));
  for (let i = 0; i < rowNum; i++) {
    for (let j = 0; j < collisionGrid[0].length; j++) {
      a[i + 1][j] = collisionGrid[i][j];
    }
  }
  grid = a;
  collisionGrid = a;
  score++;
  scoreBoard.innerText = score;
};

const rebirth = () => {
  checkLayer();
  stateGrid = collisionGrid;
  variant = Math.floor(Math.random() * shapes.length);
  shape = shapes[variant].main;
  colStart = Math.floor(Math.random() * (gridWidth - shape[0].length + 1));
  rowIncrement = 0;
};
