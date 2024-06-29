import { camera, gravity } from './game-main.js';
import { player } from './player-logic.js';
import { enemies } from './enemy-logic.js';
import { TILE_SIZE, LEVEL_WIDTH, GRID_HEIGHT, renderLevel } from './level-generation.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Main render function
export function render() {
    // Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save the current context state
    ctx.save();

    // Translate the context to simulate camera movement
    ctx.translate(-camera.x, 0);

    // Render background (parallax effect)
    renderBackground();

    // Render game elements
    renderLevel();
    renderPlayer();
    renderEnemies();
    updateAndRenderParticles();

    // Restore the context state
    ctx.restore();

    // Render UI elements (these should not be affected by camera translation)
    renderUI();
}

// Render background with parallax effect
function renderBackground() {
    const backgroundImage = new Image();
    backgroundImage.src = 'path/to/your/background.png'; // Replace with actual path
    
    // Slower scrolling for background to create parallax
    const parallaxFactor = 0.5;
    const backgroundX = -camera.x * parallaxFactor;
    
    ctx.drawImage(backgroundImage, backgroundX, 0, canvas.width, canvas.height);
    // Draw a second image to cover the whole screen when scrolling
    ctx.drawImage(backgroundImage, backgroundX + canvas.width, 0, canvas.width, canvas.height);
}

// Render player with animation
function renderPlayer() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x - camera.x, player.y, player.width, player.height);
    
    // Render player's sword when attacking
    if (player.isAttacking) {
        ctx.fillStyle = 'yellow';
        if (player.facingRight) {
            ctx.fillRect(player.x + player.width - camera.x, player.y + 10, 40, 30);
        } else {
            ctx.fillRect(player.x - 40 - camera.x, player.y + 10, 40, 30);
        }
    }
    
    // Render player's health bar
    renderHealthBar(player.x - camera.x, player.y - 20, player.width, 5, player.maxHealth, player.health);
}

// Render enemies
function renderEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = 'red';
        ctx.fillRect(enemy.x - camera.x, enemy.y, enemy.width, enemy.height);
        
        // Render enemy's attack
        if (enemy.isAttacking) {
            ctx.fillStyle = 'orange';
            if (enemy.facingRight) {
                ctx.fillRect(enemy.x + enemy.width - camera.x, enemy.y + 10, 20, 30);
            } else {
                ctx.fillRect(enemy.x - 20 - camera.x, enemy.y + 10, 20, 30);
            }
        }
        
        // Render enemy's health bar
        renderHealthBar(enemy.x - camera.x, enemy.y - 10, enemy.width, 5, enemy.maxHealth, enemy.health);
    });
}

// Render UI
function renderUI() {
    // Render player health
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Health: ${player.health}`, 10, 30);
    
    // Render enemy count
    ctx.fillText(`Enemies: ${enemies.length}`, 10, 60);
    
    // Render level progress
    const progress = (player.x / (LEVEL_WIDTH * TILE_SIZE)) * 100;
    ctx.fillText(`Progress: ${progress.toFixed(1)}%`, 10, 90);
    
    // Render mini-map
    renderMiniMap();
}

// Render mini-map
function renderMiniMap() {
    const mapWidth = 150;
    const mapHeight = 50;
    const mapX = canvas.width - mapWidth - 10;
    const mapY = 10;
    
    // Draw map background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(mapX, mapY, mapWidth, mapHeight);
    
    // Draw player position on map
    const playerMapX = mapX + (player.x / (LEVEL_WIDTH * TILE_SIZE)) * mapWidth;
    ctx.fillStyle = 'blue';
    ctx.fillRect(playerMapX, mapY + mapHeight / 2, 4, 4);
    
    // Draw castle position on map
    const castleMapX = mapX + mapWidth - 5;
    ctx.fillStyle = 'gray';
    ctx.fillRect(castleMapX, mapY, 5, mapHeight);
}

// Helper function to render text with an outline
function renderTextWithOutline(text, x, y, fillStyle, strokeStyle) {
    ctx.font = '20px Arial';
    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = 3;
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
}

// Helper function to render a health bar
function renderHealthBar(x, y, width, height, maxHealth, currentHealth) {
    const healthPercentage = currentHealth / maxHealth;
    ctx.fillStyle = 'red';
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = 'green';
    ctx.fillRect(x, y, width * healthPercentage, height);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(x, y, width, height);
}

// Particle system for effects
let particles = [];

function createParticle(x, y, color, lifespan = 30) {
    return {
        x, y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 2) * 3,
        color,
        lifespan
    };
}

function updateAndRenderParticles() {
    particles = particles.filter(p => p.lifespan > 0);
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += gravity * 0.1; // Apply a small amount of gravity to particles
        p.lifespan--;
        
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - camera.x, p.y, 3, 3);
    });
}

// Function to create attack effect
export function createAttackEffect(x, y) {
    for (let i = 0; i < 20; i++) {
        particles.push(createParticle(x, y, 'yellow'));
    }
}

// Function to create damage effect
export function createDamageEffect(x, y) {
    for (let i = 0; i < 15; i++) {
        particles.push(createParticle(x, y, 'red'));
    }
}

// Function to create heal effect
export function createHealEffect(x, y) {
    for (let i = 0; i < 15; i++) {
        particles.push(createParticle(x, y, 'green'));
    }
}

export function showLevelCompleteScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Level Complete!', canvas.width / 2, canvas.height / 2);
    ctx.font = '20px Arial';
    ctx.fillText('Press ENTER to start next level', canvas.width / 2, canvas.height / 2 + 40);
}

export function showGameOverScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
    ctx.font = '20px Arial';
    ctx.fillText('Press ENTER to restart', canvas.width / 2, canvas.height / 2 + 40);
}
