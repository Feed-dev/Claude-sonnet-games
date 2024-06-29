import { player, damagePlayer, getPlayerAttackBox } from './player-logic.js';
import { enemies, getEnemyAttackBoxes } from './enemy-logic.js';
import { getTile, TILE_SIZE, LEVEL_WIDTH, GRID_HEIGHT } from './level-generation.js';

const COLLISION_PADDING = 1; // Small padding to prevent getting stuck in walls

export function checkCollisions() {
    checkPlayerLevelCollisions();
    checkEnemyLevelCollisions();
    checkPlayerEnemyCollisions();
    checkProjectileCollisions();
}

function checkPlayerLevelCollisions() {
    const left = Math.floor(player.x / TILE_SIZE);
    const right = Math.floor((player.x + player.width) / TILE_SIZE);
    const top = Math.floor(player.y / TILE_SIZE);
    const bottom = Math.floor((player.y + player.height) / TILE_SIZE);

    player.isJumping = true;

    for (let y = top; y <= bottom; y++) {
        for (let x = left; x <= right; x++) {
            if (getTile(x, y) === 1) {
                const tileTop = y * TILE_SIZE;
                const tileBottom = tileTop + TILE_SIZE;
                const tileLeft = x * TILE_SIZE;
                const tileRight = tileLeft + TILE_SIZE;

                // Bottom collision (landing)
                if (player.velY > 0 && player.y + player.height > tileTop && player.y < tileTop) {
                    player.y = tileTop - player.height - COLLISION_PADDING;
                    player.velY = 0;
                    player.isJumping = false;
                }
                // Top collision (hitting head)
                else if (player.velY < 0 && player.y < tileBottom && player.y + player.height > tileBottom) {
                    player.y = tileBottom + COLLISION_PADDING;
                    player.velY = 0;
                }
                // Left collision
                if (player.velX < 0 && player.x < tileRight && player.x + player.width > tileRight) {
                    player.x = tileRight + COLLISION_PADDING;
                }
                // Right collision
                else if (player.velX > 0 && player.x + player.width > tileLeft && player.x < tileLeft) {
                    player.x = tileLeft - player.width - COLLISION_PADDING;
                }
            }
        }
    }

    // Check for level boundaries
    player.x = Math.max(0, Math.min(player.x, LEVEL_WIDTH * TILE_SIZE - player.width));
    if (player.y > GRID_HEIGHT * TILE_SIZE) {
        damagePlayer(player.health); // Player falls off the level
    }
}

function checkEnemyLevelCollisions() {
    enemies.forEach(enemy => {
        const left = Math.floor(enemy.x / TILE_SIZE);
        const right = Math.floor((enemy.x + enemy.width) / TILE_SIZE);
        const top = Math.floor(enemy.y / TILE_SIZE);
        const bottom = Math.floor((enemy.y + enemy.height) / TILE_SIZE);

        for (let y = top; y <= bottom; y++) {
            for (let x = left; x <= right; x++) {
                if (getTile(x, y) === 1) {
                    const tileTop = y * TILE_SIZE;
                    const tileBottom = tileTop + TILE_SIZE;
                    const tileLeft = x * TILE_SIZE;
                    const tileRight = tileLeft + TILE_SIZE;

                    // Bottom collision (landing)
                    if (enemy.velY > 0 && enemy.y + enemy.height > tileTop && enemy.y < tileTop) {
                        enemy.y = tileTop - enemy.height - COLLISION_PADDING;
                        enemy.velY = 0;
                    }
                    // Top collision
                    else if (enemy.velY < 0 && enemy.y < tileBottom && enemy.y + enemy.height > tileBottom) {
                        enemy.y = tileBottom + COLLISION_PADDING;
                        enemy.velY = 0;
                    }
                    // Left/Right collision
                    if (enemy.x < tileRight && enemy.x + enemy.width > tileLeft) {
                        enemy.velX = -enemy.velX;
                        enemy.facingRight = !enemy.facingRight;
                    }
                }
            }
        }

        // Check for level boundaries
        enemy.x = Math.max(0, Math.min(enemy.x, LEVEL_WIDTH * TILE_SIZE - enemy.width));
        if (enemy.y > GRID_HEIGHT * TILE_SIZE) {
            enemy.health = 0; // Enemy falls off the level
        }
    });
}

function checkPlayerEnemyCollisions() {
    const playerAttackBox = getPlayerAttackBox();

    enemies.forEach(enemy => {
        // Check for player attack hit
        if (player.isAttacking && boxCollision(playerAttackBox, enemy)) {
            enemy.takeDamage(player.attackDamage);
        }

        // Check for enemy body collision (when player is not attacking)
        if (!player.isAttacking && boxCollision(player, enemy)) {
            damagePlayer(10); // Player takes damage when touching enemy
            pushBack(player, enemy);
        }
    });

    // Check for enemy attacks hitting player
    getEnemyAttackBoxes().forEach(attackBox => {
        if (boxCollision(attackBox, player)) {
            damagePlayer(attackBox.damage);
        }
    });
}

function checkProjectileCollisions() {
    // Implement projectile collision logic here if you have projectiles in your game
    console.log('Projectile collisions not implemented yet');
}

function boxCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function pushBack(entity1, entity2) {
    const pushForce = 5;
    const dx = entity1.x - entity2.x;
    const dy = entity1.y - entity2.y;
    const angle = Math.atan2(dy, dx);
    
    entity1.x += Math.cos(angle) * pushForce;
    entity1.y += Math.sin(angle) * pushForce;
}

export function pointInBox(x, y, box) {
    return x >= box.x && x <= box.x + box.width &&
           y >= box.y && y <= box.y + box.height;
}
