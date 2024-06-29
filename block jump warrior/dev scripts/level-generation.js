// Constants for level generation
const CASTLE_WIDTH = 5;
const CASTLE_HEIGHT = 5;

export const TILE_SIZE = 40;
export const GRID_HEIGHT = 10; // Adjust this value based on your canvas height
export const SCREENS_PER_LEVEL = 6;
export const SCREEN_WIDTH = 20; // Adjust this value based on your canvas width
export const LEVEL_WIDTH = SCREEN_WIDTH * SCREENS_PER_LEVEL;

let level = [];

export function generateLevel() {
    // Initialize the level array
    for (let y = 0; y < GRID_HEIGHT; y++) {
        level[y] = new Array(LEVEL_WIDTH).fill(0);
    }

    // Generate ground
    for (let x = 0; x < LEVEL_WIDTH; x++) {
        level[GRID_HEIGHT - 1][x] = 1;
    }

    // Generate platforms
    for (let screen = 0; screen < SCREENS_PER_LEVEL - 1; screen++) {
        const screenStart = screen * SCREEN_WIDTH;
        const screenEnd = (screen + 1) * SCREEN_WIDTH;

        // Generate 2-4 platforms per screen
        const platformCount = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < platformCount; i++) {
            const platformWidth = 3 + Math.floor(Math.random() * 4);
            const platformX = screenStart + Math.floor(Math.random() * (SCREEN_WIDTH - platformWidth));
            const platformY = GRID_HEIGHT - 2 - Math.floor(Math.random() * (GRID_HEIGHT - 4));

            for (let x = platformX; x < platformX + platformWidth; x++) {
                level[platformY][x] = 1;
            }
        }
    }

    // Generate castle
    const castleStart = LEVEL_WIDTH - CASTLE_WIDTH - 1;
    for (let y = GRID_HEIGHT - CASTLE_HEIGHT; y < GRID_HEIGHT; y++) {
        for (let x = castleStart; x < LEVEL_WIDTH; x++) {
            level[y][x] = 2; // Use 2 to represent castle walls
        }
    }

    // Create castle entrance
    level[GRID_HEIGHT - 2][LEVEL_WIDTH - 1] = 3; // Use 3 to represent the castle entrance
    level[GRID_HEIGHT - 3][LEVEL_WIDTH - 1] = 3;
}

export function renderLevel(ctx, camera) {
    const startX = Math.floor(camera.x / TILE_SIZE);
    const endX = Math.min(startX + SCREEN_WIDTH + 1, LEVEL_WIDTH);

    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = startX; x < endX; x++) {
            const tileType = level[y][x];
            if (tileType !== 0) {
                let color;
                switch (tileType) {
                    case 1: color = 'gray'; break;  // Normal platform
                    case 2: color = 'brown'; break; // Castle wall
                    case 3: color = 'black'; break; // Castle entrance
                    default: color = 'purple'; // For debugging unexpected tile types
                }
                ctx.fillStyle = color;
                ctx.fillRect((x - startX) * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

export function getTile(x, y) {
    if (x < 0 || x >= LEVEL_WIDTH || y < 0 || y >= GRID_HEIGHT) {
        return 1; // Treat out-of-bounds as solid tiles
    }
    return level[y][x];
}

export function isLevelComplete(playerX, playerY) {
    // Check if the player has reached the castle entrance
    const playerTileX = Math.floor(playerX / TILE_SIZE);
    const playerTileY = Math.floor(playerY / TILE_SIZE);
    return level[playerTileY][playerTileX] === 3;
}

// Function to get a valid spawn position for enemies
export function getRandomSpawnPosition() {
    let x, y;
    do {
        x = Math.floor(Math.random() * LEVEL_WIDTH);
        y = GRID_HEIGHT - 2; // Start from one tile above the ground
    } while (getTile(x, y) !== 0 || getTile(x, y + 1) === 0);

    return { x: x * TILE_SIZE, y: y * TILE_SIZE };
}

// Function to check if a position is on solid ground
export function isOnGround(x, y) {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    return getTile(tileX, tileY + 1) !== 0;
}

// Function to get the nearest floor below a given position
export function getNearestFloor(x, y) {
    const startTileY = Math.floor(y / TILE_SIZE);
    for (let tileY = startTileY; tileY < GRID_HEIGHT; tileY++) {
        if (getTile(Math.floor(x / TILE_SIZE), tileY) !== 0) {
            return tileY * TILE_SIZE;
        }
    }
    return GRID_HEIGHT * TILE_SIZE; // Return bottom of the level if no floor found
}
