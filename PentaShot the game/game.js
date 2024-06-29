// Game variables
let canvas, ctx;
let player, targets, bullets, coins, powerUps;
let score, highScore;
let keys = {};
let lastTargetSpawn = 0;
let targetSpawnInterval = 1000; // Spawn a new target every 1000ms
let gameState = "playing"; // 'playing' or 'gameOver'

// Shot types
const shotTypes = [
  { name: "Single", bulletCount: 1 },
  { name: "Double", bulletCount: 2 },
  { name: "Triple", bulletCount: 3 },
  { name: "Quad", bulletCount: 4 },
  { name: "Penta", bulletCount: 5 },
];

// Target types
const targetTypes = [
  {
    name: "Basic",
    color: "green",
    health: 1,
    points: 100,
    speed: 2,
    spawnChance: 0.7,
  },
  {
    name: "Armored",
    color: "gray",
    health: 3,
    points: 250,
    speed: 1,
    spawnChance: 0.2,
  },
  {
    name: "Speedy",
    color: "red",
    health: 1,
    points: 150,
    speed: 4,
    spawnChance: 0.1,
  },
];

// Game initialization
function init() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");

  player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 32,
    height: 32,
    speed: 5,
    cooldown: 0,
    currentShot: shotTypes[0],
    lives: 3,
  };

  targets = [];
  bullets = [];
  coins = [];
  powerUps = [];
  score = 0;
  highScore = localStorage.getItem("highScore") || 0;

  // Set up event listeners for keyboard input
  window.addEventListener("keydown", function (e) {
    keys[e.code] = true;
    if (e.code === "KeyR" && gameState === "gameOver") restartGame();
  });
  window.addEventListener("keyup", function (e) {
    keys[e.code] = false;
  });

  // Start the game loop
  lastTargetSpawn = Date.now();
  gameLoop();
}

// Game loop
function gameLoop() {
  if (gameState === "playing") {
    update();
  }
  render();
  requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
  handleInput();
  updatePlayer();
  updateBullets();
  updateTargets();
  updateCoins();
  updatePowerUps();
  checkCollisions();
  spawnTargets();
  spawnPowerUps();
}

// Render game objects
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawBullets();
  drawTargets();
  drawCoins();
  drawPowerUps();
  drawUI();
  if (gameState === "gameOver") {
    drawGameOver();
  }
}

// Handle keyboard input
function handleInput() {
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;
  if (keys["Space"] && player.cooldown <= 0) shoot();
}

// Update player position and state
function updatePlayer() {
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
  if (player.cooldown > 0) player.cooldown--;
}

// Shoot bullets
function shoot() {
  let bulletCount = player.currentShot.bulletCount;
  let spreadAngle = Math.PI / 6; // 30 degrees spread

  for (let i = 0; i < bulletCount; i++) {
    let angle = (i - (bulletCount - 1) / 2) * (spreadAngle / (bulletCount - 1));
    let speedX = Math.sin(angle) * 10;
    let speedY = -Math.cos(angle) * 10;

    bullets.push({
      x: player.x + player.width / 2,
      y: player.y,
      width: 4,
      height: 10,
      speedX: speedX,
      speedY: speedY,
      damage: 1,
    });
  }

  player.cooldown = 10;
}

// Update bullets
function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].x += bullets[i].speedX;
    bullets[i].y += bullets[i].speedY;
    if (
      bullets[i].y + bullets[i].height < 0 ||
      bullets[i].x < 0 ||
      bullets[i].x > canvas.width
    ) {
      bullets.splice(i, 1);
    }
  }
}

// Spawn new targets
function spawnTargets() {
  let now = Date.now();
  if (now - lastTargetSpawn > targetSpawnInterval) {
    let targetType = chooseTargetType();
    targets.push({
      x: Math.random() * (canvas.width - 30),
      y: 0,
      width: 30,
      height: 30,
      speed: targetType.speed,
      health: targetType.health,
      points: targetType.points,
      color: targetType.color,
    });
    lastTargetSpawn = now;
  }
}

// Choose a target type based on spawn chances
function chooseTargetType() {
  let rand = Math.random();
  let cumulativeChance = 0;
  for (let type of targetTypes) {
    cumulativeChance += type.spawnChance;
    if (rand <= cumulativeChance) {
      return type;
    }
  }
  return targetTypes[0]; // Fallback to basic type
}

// Update targets
function updateTargets() {
  for (let i = targets.length - 1; i >= 0; i--) {
    targets[i].y += targets[i].speed;
    if (targets[i].y > canvas.height) {
      targets.splice(i, 1);
    }
  }
}

// Update coins
function updateCoins() {
  for (let i = coins.length - 1; i >= 0; i--) {
    coins[i].y += coins[i].speed;
    if (coins[i].y > canvas.height) {
      coins.splice(i, 1);
    }
  }
}

// Spawn power-ups
function spawnPowerUps() {
  if (Math.random() < 0.002) {
    // Adjust this value to change spawn frequency
    powerUps.push({
      x: Math.random() * (canvas.width - 20),
      y: 0,
      width: 20,
      height: 20,
      speed: 1,
      type: "shotUpgrade",
    });
  }
}

// Update power-ups
function updatePowerUps() {
  for (let i = powerUps.length - 1; i >= 0; i--) {
    powerUps[i].y += powerUps[i].speed;
    if (powerUps[i].y > canvas.height) {
      powerUps.splice(i, 1);
    }
  }
}

// Check for collisions
function checkCollisions() {
  // Check bullet-target collisions
  for (let i = bullets.length - 1; i >= 0; i--) {
    for (let j = targets.length - 1; j >= 0; j--) {
      if (collision(bullets[i], targets[j])) {
        // Remove the bullet
        bullets.splice(i, 1);

        // Damage the target
        targets[j].health -= 1;
        if (targets[j].health <= 0) {
          // Remove the target
          let destroyedTarget = targets.splice(j, 1)[0];

          // Increase score
          score += destroyedTarget.points;

          // Generate coins
          generateCoins(destroyedTarget.x, destroyedTarget.y);
        }

        break;
      }
    }
  }

  // Check player-target collisions
  for (let i = targets.length - 1; i >= 0; i--) {
    if (collision(player, targets[i])) {
      targets.splice(i, 1);
      player.lives--;
      if (player.lives <= 0) {
        gameOver();
      }
    }
  }

  // Check player-coin collisions
  for (let i = coins.length - 1; i >= 0; i--) {
    if (collision(player, coins[i])) {
      // Collect the coin
      coins.splice(i, 1);
      score += 10;
    }
  }

  // Check player-powerUp collisions
  for (let i = powerUps.length - 1; i >= 0; i--) {
    if (collision(player, powerUps[i])) {
      // Collect the power-up
      powerUps.splice(i, 1);
      upgradeShotType();
    }
  }
}

// Upgrade shot type
function upgradeShotType() {
  let currentIndex = shotTypes.indexOf(player.currentShot);
  if (currentIndex < shotTypes.length - 1) {
    player.currentShot = shotTypes[currentIndex + 1];
  }
}

// Helper function to check collision between two rectangles
function collision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

// Generate coins at the given position
function generateCoins(x, y) {
  for (let i = 0; i < 3; i++) {
    coins.push({
      x: x + Math.random() * 30,
      y: y,
      width: 10,
      height: 10,
      speed: 2 + Math.random() * 2,
    });
  }
}

// Game over
function gameOver() {
  gameState = "gameOver";
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }
}

// Draw game over screen
function drawGameOver() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "40px Arial";
  ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2 - 40);

  ctx.font = "20px Arial";
  ctx.fillText(
    `Score: ${score}`,
    canvas.width / 2 - 50,
    canvas.height / 2 + 10
  );
  ctx.fillText(
    `High Score: ${highScore}`,
    canvas.width / 2 - 70,
    canvas.height / 2 + 40
  );
  ctx.fillText(
    "Press R to restart",
    canvas.width / 2 - 80,
    canvas.height / 2 + 80
  );
}

// Restart game
function restartGame() {
  player.lives = 3;
  player.currentShot = shotTypes[0];
  targets = [];
  bullets = [];
  coins = [];
  powerUps = [];
  score = 0;
  gameState = "playing";
}

// Draw player
function drawPlayer() {
  ctx.fillStyle = "blue";
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Draw bullets
function drawBullets() {
  ctx.fillStyle = "red";
  bullets.forEach((bullet) => {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });
}

// Draw targets
function drawTargets() {
  targets.forEach((target) => {
    ctx.fillStyle = target.color;
    ctx.fillRect(target.x, target.y, target.width, target.height);
  });
}

// Draw coins
function drawCoins() {
  ctx.fillStyle = "yellow";
  coins.forEach((coin) => {
    ctx.beginPath();
    ctx.arc(
      coin.x + coin.width / 2,
      coin.y + coin.height / 2,
      coin.width / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });
}

// Draw power-ups
function drawPowerUps() {
  ctx.fillStyle = "purple";
  powerUps.forEach((powerUp) => {
    ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
  });
}

// Draw UI (score, lives)
function drawUI() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 10, 30);
  ctx.fillText(`Lives: ${player.lives}`, 10, 60);
  ctx.fillText(`Shot: ${player.currentShot.name}`, 10, canvas.height - 10);
}

// Start the game
window.onload = init;
