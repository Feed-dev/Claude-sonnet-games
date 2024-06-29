import { gravity } from './game-main.js';
import { TILE_SIZE, LEVEL_WIDTH, GRID_HEIGHT } from './level-generation.js';
import { isMoveLeft, isMoveRight, isJump, isAttack } from './input-handling.js';

export let player;

export function initPlayer() {
    player = {
        x: 50,
        y: 200,
        width: 30,
        height: 50,
        speed: 5,
        velX: 0,
        velY: 0,
        jumpForce: -15,
        isJumping: false,
        health: 100,
        maxHealth: 100,
        isAttacking: false,
        attackCooldown: 0,
        attackDuration: 10,
        attackDamage: 20,
        facingRight: true,
        state: 'idle', // Can be 'idle', 'running', 'jumping', 'attacking'
        frameCount: 0,
        invincibilityFrames: 0,
        score: 0
    };
}

export function updatePlayer() {
    player.frameCount++;
    
    // Horizontal movement
    player.velX = 0;
    if (isMoveLeft()) {
        player.velX = -player.speed;
        player.facingRight = false;
        player.state = 'running';
    } else if (isMoveRight()) {
        player.velX = player.speed;
        player.facingRight = true;
        player.state = 'running';
    } else {
        player.state = 'idle';
    }
    
    // Jumping
    if (isJump() && !player.isJumping) {
        player.velY = player.jumpForce;
        player.isJumping = true;
        player.state = 'jumping';
        playSound('jump');
    }

    // Attacking
    if (isAttack() && !player.isAttacking && player.attackCooldown === 0) {
        player.isAttacking = true;
        player.attackCooldown = 30;
        player.state = 'attacking';
        createAttackEffect(player.x + (player.facingRight ? player.width : 0), player.y + player.height / 2);
        playSound('attack');
    }

    if (player.attackCooldown > 0) player.attackCooldown--;
    if (player.isAttacking) {
        player.attackDuration--;
        if (player.attackDuration <= 0) {
            player.isAttacking = false;
            player.attackDuration = 10;
        }
    }

    // Apply gravity
    player.velY += gravity;

    // Update position
    player.x += player.velX;
    player.y += player.velY;

    // Boundary checks
    player.x = Math.max(0, Math.min(player.x, LEVEL_WIDTH * TILE_SIZE - player.width));
    
    // Invincibility frames
    if (player.invincibilityFrames > 0) {
        player.invincibilityFrames--;
    }

    // Health regeneration (slow)
    if (player.frameCount % 60 === 0 && player.health < player.maxHealth) {
        player.health = Math.min(player.health + 1, player.maxHealth);
    }
}

export function damagePlayer(amount) {
    if (player.invincibilityFrames === 0) {
        player.health -= amount;
        player.invincibilityFrames = 60; // 1 second of invincibility
        createDamageEffect(player.x + player.width / 2, player.y + player.height / 2);
        playSound('hurt');
        
        if (player.health <= 0) {
            gameOver();
        }
    }
}

export function healPlayer(amount) {
    player.health = Math.min(player.health + amount, player.maxHealth);
    createHealEffect(player.x + player.width / 2, player.y + player.height / 2);
    playSound('heal');
}

export function getPlayerAttackBox() {
    if (player.facingRight) {
        return {
            x: player.x + player.width,
            y: player.y,
            width: 40,
            height: player.height
        };
    } else {
        return {
            x: player.x - 40,
            y: player.y,
            width: 40,
            height: player.height
        };
    }
}

export function addScore(points) {
    player.score += points;
}

// These functions should be defined elsewhere (e.g., in a sounds.js file)
function playSound(soundName) {
    // Play the specified sound
    console.log(`Playing sound: ${soundName}`);
}

function createAttackEffect(x, y) {
    // Create visual effect for attack (defined in rendering.js)
    console.log(`Creating attack effect at (${x}, ${y})`);
}

function createDamageEffect(x, y) {
    // Create visual effect for taking damage (defined in rendering.js)
    console.log(`Creating damage effect at (${x}, ${y})`);
}

function createHealEffect(x, y) {
    // Create visual effect for healing (defined in rendering.js)
    console.log(`Creating heal effect at (${x}, ${y})`);
}

function gameOver() {
    // Handle game over state (defined in game-main.js)
    console.log('Game Over');
}
