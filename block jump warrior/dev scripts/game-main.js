import { initPlayer, updatePlayer, player } from './player-logic.js';
import { enemies, spawnEnemy, updateEnemies } from './enemy-logic.js';
import { generateLevel, isLevelComplete, TILE_SIZE, LEVEL_WIDTH, GRID_HEIGHT } from './level-generation.js';
import { checkCollisions } from './collision-detection.js';
import { updateInputState } from './input-handling.js';
import { render, showLevelCompleteScreen, showGameOverScreen } from './rendering.js';

// Game constants
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const SCREENS_PER_LEVEL = 6;
const SCREEN_WIDTH = canvas.width / TILE_SIZE;
const MAX_ENEMIES = 3;
const ENEMY_SPAWN_INTERVAL = 5000;
export const gravity = 0.8;

// Camera
export const camera = {
    x: 0,
    y: 0
};

let lastEnemySpawnTime = 0;
let gameState = 'playing'; // Can be 'playing', 'levelComplete', or 'gameOver'

export function init() {
    console.log('Initializing game...');
    try {
        initPlayer();
        generateLevel();
        spawnEnemy(); // Spawn initial enemy
        gameState = 'playing';
        console.log('Game initialized successfully');
    } catch (error) {
        console.error('Error during game initialization:', error);
        alert('Failed to initialize game. Please check the console for details.');
    }
}

export function gameLoop(timestamp) {
    try {
        update(timestamp);
        render();

        if (gameState === 'playing') {
            requestAnimationFrame(gameLoop);
        } else if (gameState === 'levelComplete') {
            showLevelCompleteScreen();
        } else if (gameState === 'gameOver') {
            showGameOverScreen();
        }
    } catch (error) {
        console.error('Error in game loop:', error);
        alert('An error occurred in the game loop. Please check the console for details.');
    }
}

function update(timestamp) {
    if (gameState !== 'playing') return;

    updateInputState();
    updatePlayer();
    updateCamera();
    checkCollisions();
    
    if (timestamp - lastEnemySpawnTime > ENEMY_SPAWN_INTERVAL) {
        spawnEnemy();
        lastEnemySpawnTime = timestamp;
    }
    
    updateEnemies();

    if (isLevelComplete()) {
        gameState = 'levelComplete';
    }

    if (player.health <= 0) {
        gameState = 'gameOver';
    }
}

function updateCamera() {
    camera.x = Math.max(0, Math.min(player.x - canvas.width / 2, LEVEL_WIDTH * TILE_SIZE - canvas.width));
}

export function resetGame() {
    console.log('Resetting game...');
    player.x = 50;
    player.y = 200;
    player.health = 100;
    enemies.length = 0;
    generateLevel();
    spawnEnemy(); // Spawn initial enemy
    gameState = 'playing';
    requestAnimationFrame(gameLoop);
}

// Event listener for ENTER key to restart or start next level
window.addEventListener('keydown', (e) => {
    if (e.code === 'Enter' && (gameState === 'levelComplete' || gameState === 'gameOver')) {
        resetGame();
    }
});
