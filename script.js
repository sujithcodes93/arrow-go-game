const board = document.getElementById('game-board');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const messageEl = document.getElementById('message');
const startBtn = document.getElementById('start-btn');
const arrowButtons = document.querySelectorAll('.arrow-btn');

const gridSize = 8;
const startingTime = 30;
const obstacles = [
  { x: 1, y: 1 },
  { x: 2, y: 3 },
  { x: 4, y: 1 },
  { x: 5, y: 4 },
  { x: 3, y: 6 },
  { x: 6, y: 6 },
  { x: 1, y: 5 },
  { x: 6, y: 2 },
];

const cells = [];
let player = { x: 0, y: 0 };
let target = { x: 7, y: 7 };
let score = 0;
let timeLeft = startingTime;
let gameRunning = false;
let timerId = null;

function buildBoard() {
  board.innerHTML = '';
  cells.length = 0;

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.setAttribute('role', 'gridcell');
      cell.dataset.x = String(x);
      cell.dataset.y = String(y);
      board.appendChild(cell);
      cells.push(cell);
    }
  }
}

function isObstacle(x, y) {
  return obstacles.some((obstacle) => obstacle.x === x && obstacle.y === y);
}

function randomTargetPosition() {
  let nextTarget = { x: 0, y: 0 };
  do {
    nextTarget = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (
    (nextTarget.x === player.x && nextTarget.y === player.y) ||
    isObstacle(nextTarget.x, nextTarget.y)
  );

  return nextTarget;
}

function updateScoreboard() {
  scoreEl.textContent = String(score);
  timeEl.textContent = String(timeLeft);
}

function renderBoard() {
  for (const cell of cells) {
    const x = Number(cell.dataset.x);
    const y = Number(cell.dataset.y);
    cell.classList.remove('player', 'target', 'obstacle');

    if (isObstacle(x, y)) {
      cell.classList.add('obstacle');
    }

    if (x === player.x && y === player.y) {
      cell.classList.add('player');
    }

    if (x === target.x && y === target.y) {
      cell.classList.add('target');
    }
  }
}

function finishGame(won) {
  gameRunning = false;
  clearInterval(timerId);

  if (won) {
    messageEl.textContent = 'You win! Great job! Press Start Game to play again.';
  } else {
    messageEl.textContent = 'Time is up! Press Start Game to try again.';
  }
}

function movePlayer(direction) {
  if (!gameRunning) return;

  let nextX = player.x;
  let nextY = player.y;

  if (direction === 'up') nextY -= 1;
  if (direction === 'down') nextY += 1;
  if (direction === 'left') nextX -= 1;
  if (direction === 'right') nextX += 1;

  if (nextX < 0 || nextX >= gridSize || nextY < 0 || nextY >= gridSize) {
    messageEl.textContent = 'You cannot move outside the board.';
    return;
  }

  if (isObstacle(nextX, nextY)) {
    messageEl.textContent = 'You hit a wall! Try a different path.';
    return;
  }

  player.x = nextX;
  player.y = nextY;

  if (player.x === target.x && player.y === target.y) {
    score += 1;
    target = randomTargetPosition();
    messageEl.textContent = 'Nice! You collected the star.';
  }

  updateScoreboard();
  renderBoard();

  if (score >= 5) {
    finishGame(true);
  }
}

function startGame() {
  player = { x: 0, y: 0 };
  score = 0;
  timeLeft = startingTime;
  target = randomTargetPosition();
  gameRunning = true;
  updateScoreboard();
  renderBoard();
  messageEl.textContent = 'Collect 5 stars before the timer runs out!';

  clearInterval(timerId);
  timerId = setInterval(() => {
    timeLeft -= 1;
    updateScoreboard();

    if (timeLeft <= 0) {
      finishGame(false);
    }
  }, 1000);
}

startBtn.addEventListener('click', startGame);

arrowButtons.forEach((button) => {
  button.addEventListener('click', () => movePlayer(button.dataset.dir));
});

document.addEventListener('keydown', (event) => {
  const keyMap = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
  };

  const direction = keyMap[event.key];
  if (direction) {
    event.preventDefault();
    movePlayer(direction);
  }
});

buildBoard();
updateScoreboard();
renderBoard();
