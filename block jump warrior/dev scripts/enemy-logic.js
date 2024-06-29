import { gravity, camera } from './game-main.js';
import { TILE_SIZE, LEVEL_WIDTH, GRID_HEIGHT, getTile } from './level-generation.js';
import { player } from './player-logic.js';

export let enemies = [];

class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 30;
        this.height = 50;
        this.speed = 2;
        this.velX = -this.speed;
        this.velY = 0;
        this.health = 60;
        this.maxHealth = 60;
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.attackDuration = 20;
        this.attackDamage = 10;
        this.facingRight = false;
        this.state = 'idle';
        this.frameCount = 0;
        this.detectionRange = 200;
        this.attackRange = 50;

        // Adjust properties based on enemy type
        if (this.type === 'fast') {
            this.speed = 3;
            this.health = this.maxHealth = 40;
            this.attackDamage = 5;
        } else if (this.type === 'heavy') {
            this.speed = 1;
            this.health = this.maxHealth = 100;
            this.attackDamage = 20;
            this.width = 40;
            this.height = 60;
        }
    }

    update() {
        this.frameCount++;

        const distanceToPlayer = Math.abs(this.x - player.x);

        if (distanceToPlayer <= this.detectionRange) {
            // Move towards player
            this.velX = player.x < this.x ? -this.speed : this.speed;
            this.facingRight = this.velX > 0;
            this.state = 'chasing';

            if (distanceToPlayer <= this.attackRange) {
                this.attack();
            }
        } else {
            // Patrol behavior
            if (this.frameCount % 120 === 0) {  // Change direction every 2 seconds
                this.velX = -this.velX;
                this.facingRight = this.velX > 0;
            }
            this.state = 'patrolling';
        }

        // Update position
        this.x += this.velX;
        
        // Apply gravity
        this.velY += gravity;
        this.y += this.velY;

        // Update attack state
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }
        if (this.isAttacking) {
            this.attackDuration--;
            if (this.attackDuration <= 0) {
                this.isAttacking = false;
                this.attackDuration = 20;
            }
        }

        // Boundary checks
        this.x = Math.max(0, Math.min(this.x, LEVEL_WIDTH * TILE_SIZE - this.width));
    }

    attack() {
        if (!this.isAttacking && this.attackCooldown === 0) {
            this.isAttacking = true;
            this.attackCooldown = 60;
            this.state = 'attacking';
            createAttackEffect(this.x + (this.facingRight ? this.width : 0), this.y + this.height / 2);
            playSound('enemyAttack');
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        createDamageEffect(this.x + this.width / 2, this.y + this.height / 2);
        playSound('enemyHurt');

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        enemies = enemies.filter(e => e !== this);
        createDeathEffect(this.x + this.width / 2, this.y + this.height / 2);
        playSound('enemyDeath');
        addScore(this.type === 'heavy' ? 20 : 10);
    }
}

export function spawnEnemy() {
    if (enemies.length < MAX_ENEMIES) {
        let x = Math.random() * LEVEL_WIDTH * TILE_SIZE;
        let y = 0;
        for (let i = 0; i < GRID_HEIGHT; i++) {
            if (getTile(Math.floor(x / TILE_SIZE), i) === 1) {
                y = i * TILE_SIZE - TILE_SIZE;
                break;
            }
        }
        const type = Math.random() < 0.7 ? 'normal' : (Math.random() < 0.5 ? 'fast' : 'heavy');
        enemies.push(new Enemy(x, y, type));
    }
}

export function updateEnemies() {
    enemies.forEach(enemy => enemy.update());
}

export function getEnemyAttackBoxes() {
    return enemies.filter(e => e.isAttacking).map(e => {
        return {
            x: e.facingRight ? e.x + e.width : e.x - 20,
            y: e.y,
            width: 20,
            height: e.height,
            damage: e.attackDamage
        };
    });
}

// These functions should be defined elsewhere (e.g., in a sounds.js file)
function playSound(soundName) {
    // Play the specified sound
    console.log(`Playing sound: ${soundName}`);
}

function createAttackEffect(x, y) {
    // Create visual effect for attack (defined in rendering.js)
    console.log(`Creating enemy attack effect at (${x}, ${y})`);
}

function createDamageEffect(x, y) {
    // Create visual effect for taking damage (defined in rendering.js)
    console.log(`Creating enemy damage effect at (${x}, ${y})`);
}

function createDeathEffect(x, y) {
    // Create visual effect for enemy death (defined in rendering.js)
    console.log(`Creating enemy death effect at (${x}, ${y})`);
}

function addScore(points) {
    // Add points to the player's score (defined in player-logic.js)
    console.log(`Adding ${points} to score`);
}

// Constants
const MAX_ENEMIES = 3; // This should match the value in game-main.js
