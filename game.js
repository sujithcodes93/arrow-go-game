const levels = [
  {
    name: "Sunrise Sprint",
    theme: ["#ff7e5f", "#feb47b", "#f7d794"],
    map: [
      "#########",
      "#S..#...#",
      "#.##.#G.#",
      "#....#..#",
      "#.##.#..#",
      "#..*....#",
      "#.##.#..#",
      "#..E....#",
      "#########"
    ]
  },
  {
    name: "Neon Bloom",
    theme: ["#00c6ff", "#0072ff", "#ff6a88"],
    map: [
      "#########",
      "#S#..E*#",
      "#.#.##..#",
      "#.#....G#",
      "#.#.##..#",
      "#...#..E#",
      "#.###.#.#",
      "#.....#.#",
      "#########"
    ]
  },
  {
    name: "Aurora Maze",
    theme: ["#7f7fd5", "#86a8e7", "#91e0b2"],
    map: [
      "#########",
      "#S..#E..#",
      "#.##.#..#",
      "#...#.#G#",
      "###.#.#.#",
      "#.*..E#.#",
      "#.#.##...#",
      "#.......##",
      "#########"
    ]
  }
];

const boardEl = document.getElementById("board");
const levelBadgeEl = document.getElementById("level-badge");
const levelNameEl = document.getElementById("level-name");
const goalStatusEl = document.getElementById("goal-status");
const messageEl = document.getElementById("message");
const restartBtn = document.getElementById("restart-btn");
const nextBtn = document.getElementById("next-btn");

const game = {
  levelIndex: 0,
  rows: 0,
  cols: 0,
  grid: [],
  player: { x: 0, y: 0 },
  gemsTotal: 0,
  gemsCollected: 0,
  lastDirection: "right",
  levelComplete: false,
  goal: { x: 0, y: 0 },
  enemies: [],
  enemyTimer: null
};

function setTheme(level) {
  document.documentElement.style.setProperty("--bg-1", level.theme[0]);
  document.documentElement.style.setProperty("--bg-2", level.theme[1]);
  document.documentElement.style.setProperty("--bg-3", level.theme[2]);
}

function isWalkable(x, y) {
  if (x < 0 || y < 0 || y >= game.rows || x >= game.cols) {
    return false;
  }
  return game.grid[y][x] !== "#";
}

function checkCollision(x, y) {
  return game.enemies.some((enemy) => enemy.x === x && enemy.y === y);
}

function getNextEnemyMove(enemy) {
  const dx = game.player.x - enemy.x;
  const dy = game.player.y - enemy.y;
  const steps = [];

  if (Math.abs(dx) >= Math.abs(dy)) {
    if (dx !== 0) {
      steps.push({ x: enemy.x + Math.sign(dx), y: enemy.y, direction: Math.sign(dx) > 0 ? "right" : "left" });
    }
    if (dy !== 0) {
      steps.push({ x: enemy.x, y: enemy.y + Math.sign(dy), direction: Math.sign(dy) > 0 ? "down" : "up" });
    }
  } else {
    if (dy !== 0) {
      steps.push({ x: enemy.x, y: enemy.y + Math.sign(dy), direction: Math.sign(dy) > 0 ? "down" : "up" });
    }
    if (dx !== 0) {
      steps.push({ x: enemy.x + Math.sign(dx), y: enemy.y, direction: Math.sign(dx) > 0 ? "right" : "left" });
    }
  }

  for (const step of steps) {
    if (isWalkable(step.x, step.y)) {
      const occupied = game.enemies.some((other) => other !== enemy && other.x === step.x && other.y === step.y);
      if (!occupied) {
        return step;
      }
    }
  }

  return null;
}

function moveEnemies() {
  if (game.levelComplete) {
    return;
  }

  for (const enemy of game.enemies) {
    if (enemy.x === game.player.x && enemy.y === game.player.y) {
      messageEl.textContent = "Caught by a hunter arrow!";
      setTimeout(() => loadLevel(game.levelIndex), 700);
      return;
    }

    const move = getNextEnemyMove(enemy);
    if (!move) {
      continue;
    }

    enemy.x = move.x;
    enemy.y = move.y;
    enemy.direction = move.direction;

    if (enemy.x === game.player.x && enemy.y === game.player.y) {
      messageEl.textContent = "Caught by a hunter arrow!";
      setTimeout(() => loadLevel(game.levelIndex), 700);
      return;
    }
  }

  renderBoard();
}

function loadLevel(index) {
  const level = levels[index % levels.length];
  game.levelIndex = index % levels.length;
  game.levelComplete = false;
  game.grid = level.map.map((row) => row.split(""));
  game.rows = game.grid.length;
  game.cols = game.grid[0].length;
  game.gemsTotal = 0;
  game.gemsCollected = 0;
  game.lastDirection = "right";
  game.enemies = [];
  nextBtn.textContent = "Next level";

  for (let y = 0; y < game.rows; y += 1) {
    for (let x = 0; x < game.cols; x += 1) {
      const tile = game.grid[y][x];
      if (tile === "S") {
        game.player.x = x;
        game.player.y = y;
        game.grid[y][x] = ".";
      } else if (tile === "G") {
        game.goal = { x, y };
      } else if (tile === "*") {
        game.gemsTotal += 1;
      } else if (tile === "E") {
        game.enemies.push({ x, y, direction: "right" });
        game.grid[y][x] = ".";
      }
    }
  }

  clearInterval(game.enemyTimer);
  game.enemyTimer = setInterval(moveEnemies, 650);

  setTheme(level);
  levelBadgeEl.textContent = `Level ${game.levelIndex + 1}`;
  levelNameEl.textContent = level.name;
  goalStatusEl.textContent = `${game.gemsCollected} / ${game.gemsTotal}`;
  messageEl.textContent = "Use the arrow keys to move.";
  renderBoard();
}

function renderBoard() {
  boardEl.style.gridTemplateColumns = `repeat(${game.cols}, minmax(0, 1fr))`;
  boardEl.innerHTML = "";

  for (let y = 0; y < game.rows; y += 1) {
    for (let x = 0; x < game.cols; x += 1) {
      const tile = game.grid[y][x];
      const cell = document.createElement("div");
      cell.classList.add("cell");

      if (tile === "#") {
        cell.classList.add("wall");
      }
      if (tile === "G") {
        cell.classList.add("goal");
      }
      if (tile === "*") {
        cell.classList.add("gem");
      }

      const enemy = game.enemies.find((item) => item.x === x && item.y === y);
      if (enemy) {
        cell.classList.add("enemy");
        cell.classList.add(`enemy-${enemy.direction}`);
      }

      if (x === game.player.x && y === game.player.y) {
        cell.classList.add("player");
        cell.classList.add(`arrow-${game.lastDirection}`);
      }

      boardEl.appendChild(cell);
    }
  }

  goalStatusEl.textContent = `${game.gemsCollected} / ${game.gemsTotal}`;
}

function step(dx, dy, direction) {
  if (game.levelComplete) {
    return;
  }

  const nextX = game.player.x + dx;
  const nextY = game.player.y + dy;

  if (nextX < 0 || nextY < 0 || nextY >= game.rows || nextX >= game.cols) {
    return;
  }

  const nextTile = game.grid[nextY][nextX];

  if (nextTile === "#") {
    return;
  }

  if (checkCollision(nextX, nextY)) {
    messageEl.textContent = "Caught by a hunter arrow!";
    setTimeout(() => loadLevel(game.levelIndex), 700);
    return;
  }

  game.player.x = nextX;
  game.player.y = nextY;
  game.lastDirection = direction;

  if (nextTile === "*") {
    game.gemsCollected += 1;
    game.grid[nextY][nextX] = ".";
    messageEl.textContent = "Gem found! Keep going.";
  } else if (nextTile === "G") {
    messageEl.textContent = "Goal reached!";
  } else {
    messageEl.textContent = "Use the arrow keys to move.";
  }

  if (nextX === game.goal.x && nextY === game.goal.y && game.gemsCollected === game.gemsTotal) {
    game.levelComplete = true;
    messageEl.textContent = "Level cleared!";
    nextBtn.textContent = game.levelIndex === levels.length - 1 ? "Play again" : "Next level";
  }

  renderBoard();
}

function handleKeydown(event) {
  const movement = {
    ArrowUp: [0, -1, "up"],
    ArrowDown: [0, 1, "down"],
    ArrowLeft: [-1, 0, "left"],
    ArrowRight: [1, 0, "right"],
    w: [0, -1, "up"],
    s: [0, 1, "down"],
    a: [-1, 0, "left"],
    d: [1, 0, "right"]
  };

  const move = movement[event.key];
  if (!move) {
    return;
  }

  event.preventDefault();
  const [dx, dy, direction] = move;
  step(dx, dy, direction);
}

restartBtn.addEventListener("click", () => {
  loadLevel(game.levelIndex);
});

nextBtn.addEventListener("click", () => {
  if (game.levelComplete) {
    loadLevel(game.levelIndex + 1);
    return;
  }

  loadLevel(game.levelIndex);
});

window.addEventListener("keydown", handleKeydown);

loadLevel(0);
