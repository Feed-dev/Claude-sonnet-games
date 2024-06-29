// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

console.log("Script started");

let gameState = {
  player: {
    x: 50,
    y: 300,
    width: 20,
    height: 50,
    speed: 5,
    velocityX: 0,
    velocityY: 0,
    jumping: false,
    health: 100,
    attacking: false,
    attackAngle: -Math.PI / 2 + Math.PI / 9,
    attackTimer: 0,
    facingRight: true,
    coins: 0,
    invulnerable: false,
    invulnerabilityTimer: 0,
    blinkTimer: 0,
  },
  enemies: [],
  coins: [],
  gravity: 0.5,
  ground: 0,
  keys: {},
  enemySpawnTimer: 0,
  spawnSide: "left", // We'll start with 'left' so the first spawn after the initial one will be on the left
};

console.log("Game state initialized");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gameState.ground = canvas.height - 50;
  console.log(`Canvas resized to ${canvas.width}x${canvas.height}`);
}

function createEnemy(side) {
  const x = side === "left" ? -30 : canvas.width + 30;
  return {
    x: x,
    y: gameState.ground - 40,
    width: 30,
    height: 40,
    speed: 2,
    direction: side === "left" ? 1 : -1,
    health: 1,
    attacking: false,
    attackAngle: -Math.PI / 2,
    attackTimer: 0,
  };
}

function createCoin(x, y) {
  return {
    x: x,
    y: y,
    width: 15,
    height: 15,
    velocityY: -5 - Math.random() * 5,
    velocityX: (Math.random() - 0.5) * 5,
  };
}

function initGame() {
  resizeCanvas();
  // Spawn only one enemy on the right side
  gameState.enemies.push(createEnemy("right"));
  console.log("Initial enemy created on the right side");
}

function checkCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function checkSwordCollision(player, enemy) {
  const swordLength = 50;
  const swordWidth = 20;
  const swordHitbox = {
    x: player.x + (player.facingRight ? player.width : -swordLength),
    y: player.y,
    width: swordLength,
    height: player.height,
  };

  return checkCollision(swordHitbox, enemy);
}

function update() {
  // Player movement
  if (gameState.keys.KeyA) {
    gameState.player.velocityX = -gameState.player.speed;
    gameState.player.facingRight = false;
  } else if (gameState.keys.KeyD) {
    gameState.player.velocityX = gameState.player.speed;
    gameState.player.facingRight = true;
  } else {
    gameState.player.velocityX *= 0.8;
  }

  gameState.player.x += gameState.player.velocityX;
  gameState.player.velocityY += gameState.gravity;
  gameState.player.y += gameState.player.velocityY;

  // Ground collision
  if (gameState.player.y + gameState.player.height > gameState.ground) {
    gameState.player.y = gameState.ground - gameState.player.height;
    gameState.player.velocityY = 0;
    gameState.player.jumping = false;
  }

  // Screen boundaries
  if (gameState.player.x < 0) gameState.player.x = 0;
  if (gameState.player.x + gameState.player.width > canvas.width) {
    gameState.player.x = canvas.width - gameState.player.width;
  }

  // Sword attack
  if (gameState.player.attacking) {
    if (gameState.player.attackAngle < 0) {
      gameState.player.attackAngle += 0.3;
      if (gameState.player.attackAngle >= 0) {
        gameState.player.attackAngle = 0;
        gameState.player.attackTimer = 20; // 1/3 second at 60 FPS
      }
    } else if (gameState.player.attackTimer > 0) {
      gameState.player.attackTimer--;
      if (gameState.player.attackTimer === 0) {
        gameState.player.attacking = false;
        gameState.player.attackAngle = -Math.PI / 2 + Math.PI / 9;
      }
    }
  }

  // Invulnerability timer
  if (gameState.player.invulnerable) {
    gameState.player.invulnerabilityTimer--;
    if (gameState.player.invulnerabilityTimer <= 0) {
      gameState.player.invulnerable = false;
    }
    // Blinking effect
    gameState.player.blinkTimer = (gameState.player.blinkTimer + 1) % 10;
  }

  // Enemy spawning
  gameState.enemySpawnTimer++;
  if (gameState.enemySpawnTimer >= 360 && gameState.enemies.length < 5) {
    // 6 seconds at 60 FPS
    gameState.enemies.push(createEnemy(gameState.spawnSide));
    gameState.spawnSide = gameState.spawnSide === "left" ? "right" : "left";
    gameState.enemySpawnTimer = 0;
    console.log(`New enemy spawned from the ${gameState.spawnSide} side`);
  }

  // Enemy update and collision
  gameState.enemies = gameState.enemies.filter((enemy) => {
    enemy.x += enemy.speed * enemy.direction;

    // Reverse direction if enemy goes off screen
    if (enemy.x + enemy.width < 0) {
      enemy.x = 0;
      enemy.direction = 1;
    } else if (enemy.x > canvas.width) {
      enemy.x = canvas.width - enemy.width;
      enemy.direction = -1;
    }

    // Enemy attack logic
    if (!enemy.attacking && Math.random() < 0.005) {
      // 0.5% chance to start attack each frame
      enemy.attacking = true;
      enemy.attackAngle = -Math.PI / 2 + Math.PI / 9;
    }

    if (enemy.attacking) {
      if (enemy.attackAngle < 0) {
        enemy.attackAngle += 0.3;
        if (enemy.attackAngle >= 0) {
          enemy.attackAngle = 0;
          enemy.attackTimer = 20; // 1/3 second at 60 FPS
        }
      } else if (enemy.attackTimer > 0) {
        enemy.attackTimer--;
        if (enemy.attackTimer === 0) {
          enemy.attacking = false;
          enemy.attackAngle = -Math.PI / 2 + Math.PI / 9;
        }
      }
    }

    // Player-Enemy collision
    if (
      !gameState.player.invulnerable &&
      checkCollision(gameState.player, enemy)
    ) {
      gameState.player.health -= 5; // 5% damage
      gameState.player.velocityX += enemy.direction * 10; // Knockback
      gameState.player.invulnerable = true;
      gameState.player.invulnerabilityTimer = 60; // 1 second at 60 FPS
      gameState.player.blinkTimer = 0;
      if (gameState.player.health <= 0) {
        console.log("Game Over");
        // Implement game over logic here
      }
    }

    // Sword-Enemy collision
    if (
      gameState.player.attacking &&
      checkSwordCollision(gameState.player, enemy)
    ) {
      // Drop 1 to 3 coins
      const coinCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < coinCount; i++) {
        gameState.coins.push(
          createCoin(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2)
        );
      }
      return false; // Remove enemy
    }

    return true;
  });

  // Coin update and collection
  gameState.coins = gameState.coins.filter((coin) => {
    coin.velocityY += gameState.gravity * 0.5;
    coin.y += coin.velocityY;
    coin.x += coin.velocityX;

    // Coin ground collision
    if (coin.y + coin.height > gameState.ground) {
      coin.y = gameState.ground - coin.height;
      coin.velocityY = 0;
      coin.velocityX *= 0.8; // Friction
    }

    // Coin collection
    if (checkCollision(gameState.player, coin)) {
      gameState.player.coins++;
      return false; // Remove collected coin
    }
    return true;
  });
}

function draw() {
  ctx.fillStyle = "#333";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw player (with blinking effect when invulnerable)
  if (!gameState.player.invulnerable || gameState.player.blinkTimer < 5) {
    // Head
    ctx.fillStyle = "#D2B48C"; // Tanned skin color
    ctx.beginPath();
    ctx.arc(
      gameState.player.x + gameState.player.width / 2,
      gameState.player.y - 10,
      15,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Body
    ctx.fillStyle = "#BDB76B"; // Khaki green
    ctx.fillRect(
      gameState.player.x,
      gameState.player.y,
      gameState.player.width,
      gameState.player.height * 0.6
    );

    // Pants
    ctx.fillStyle = "#5D4037"; // Darker brown
    ctx.fillRect(
      gameState.player.x,
      gameState.player.y + gameState.player.height * 0.6,
      gameState.player.width,
      gameState.player.height * 0.4
    );
  }

  // Draw sword
  ctx.strokeStyle = "rgb(170, 190, 210)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(
    gameState.player.x +
      (gameState.player.facingRight ? gameState.player.width : 0),
    gameState.player.y + gameState.player.height / 2
  );
  ctx.lineTo(
    gameState.player.x +
      (gameState.player.facingRight ? gameState.player.width : 0) +
      Math.cos(gameState.player.attackAngle) *
        50 *
        (gameState.player.facingRight ? 1 : -1),
    gameState.player.y +
      gameState.player.height / 2 +
      Math.sin(gameState.player.attackAngle) * 50
  );
  ctx.stroke();

  // Draw enemies (crocodiles)
  gameState.enemies.forEach((enemy) => {
    // Body
    ctx.fillStyle = "#2ecc71"; // Crocodile green
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

    // Head
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.width / 2, enemy.y - 5, 12, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.width / 2 - 5, enemy.y - 7, 3, 0, Math.PI * 2);
    ctx.arc(enemy.x + enemy.width / 2 + 5, enemy.y - 7, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.width / 2 - 5, enemy.y - 7, 1.5, 0, Math.PI * 2);
    ctx.arc(enemy.x + enemy.width / 2 + 5, enemy.y - 7, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Triangular ears
    ctx.fillStyle = "#27ae60"; // Darker green for ears
    ctx.beginPath();
    ctx.moveTo(enemy.x + enemy.width / 2 - 12, enemy.y - 5);
    ctx.lineTo(enemy.x + enemy.width / 2 - 20, enemy.y - 15);
    ctx.lineTo(enemy.x + enemy.width / 2 - 4, enemy.y - 15);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(enemy.x + enemy.width / 2 + 12, enemy.y - 5);
    ctx.lineTo(enemy.x + enemy.width / 2 + 20, enemy.y - 15);
    ctx.lineTo(enemy.x + enemy.width / 2 + 4, enemy.y - 15);
    ctx.fill();

    // Spikes
    ctx.fillStyle = "#27ae60"; // Darker green for spikes
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(enemy.x + enemy.width * (0.2 + i * 0.3), enemy.y);
      ctx.lineTo(enemy.x + enemy.width * (0.3 + i * 0.3), enemy.y - 10);
      ctx.lineTo(enemy.x + enemy.width * (0.4 + i * 0.3), enemy.y);
      ctx.fill();
    }

    // Draw dagger
    ctx.strokeStyle = "rgb(170, 190, 210)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(
      enemy.x + (enemy.direction > 0 ? enemy.width : 0),
      enemy.y + enemy.height / 2
    );
    ctx.lineTo(
      enemy.x +
        (enemy.direction > 0 ? enemy.width : 0) +
        Math.cos(enemy.attackAngle) * 30 * enemy.direction,
      enemy.y + enemy.height / 2 + Math.sin(enemy.attackAngle) * 30
    );
    ctx.stroke();
  });

  // Draw coins
  ctx.fillStyle = "gold";
  gameState.coins.forEach((coin) => {
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

  // Draw health bar
  ctx.fillStyle = "red";
  ctx.fillRect(10, 10, gameState.player.health * 2, 20);
  ctx.strokeStyle = "white";
  ctx.strokeRect(10, 10, 200, 20);

  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText(`${gameState.player.health}%`, 220, 27);

  // Draw coin count
  ctx.fillStyle = "gold";
  ctx.font = "20px Arial";
  ctx.fillText(`Coins: ${gameState.player.coins}`, canvas.width - 120, 30);

  // Draw ground
  ctx.fillStyle = "#555";
  ctx.fillRect(
    0,
    gameState.ground,
    canvas.width,
    canvas.height - gameState.ground
  );
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Event Listeners
window.addEventListener("resize", resizeCanvas);

document.addEventListener("keydown", (e) => {
  gameState.keys[e.code] = true;
  if (e.code === "Space" && !gameState.player.jumping) {
    gameState.player.jumping = true;
    gameState.player.velocityY = -12;
  }
  if (e.code === "KeyK" && !gameState.player.attacking) {
    gameState.player.attacking = true;
    gameState.player.attackAngle = -Math.PI / 2 + Math.PI / 9;
  }
});

document.addEventListener("keyup", (e) => {
  gameState.keys[e.code] = false;
});

// Initialize and start the game
console.log("Initializing game");
initGame();
console.log("Starting game loop");
gameLoop();

console.log("Script finished loading");
