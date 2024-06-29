const keys = {};
let gamepad = null;
let touchControls = {};

function setupInputHandlers() {
    // Keyboard event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Gamepad event listeners
    window.addEventListener("gamepadconnected", connectGamepad);
    window.addEventListener("gamepaddisconnected", disconnectGamepad);

    // Touch event listeners (for mobile devices)
    if ('ontouchstart' in window) {
        setupTouchControls();
    }
}

function handleKeyDown(e) {
    keys[e.code] = true;
    
    // Prevent default action for game controls to avoid page scrolling
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyX'].includes(e.code)) {
        e.preventDefault();
    }
}

function handleKeyUp(e) {
    keys[e.code] = false;
}

function connectGamepad(e) {
    gamepad = e.gamepad;
    console.log("Gamepad connected:", gamepad.id);
}

function disconnectGamepad(e) {
    gamepad = null;
    console.log("Gamepad disconnected");
}

function setupTouchControls() {
    const touchArea = document.createElement('div');
    touchArea.id = 'touchControls';
    touchArea.style.position = 'absolute';
    touchArea.style.bottom = '10px';
    touchArea.style.left = '10px';
    touchArea.style.right = '10px';
    touchArea.style.height = '100px';
    document.body.appendChild(touchArea);

    const buttons = [
        { id: 'left', text: '←', x: '10%' },
        { id: 'right', text: '→', x: '30%' },
        { id: 'jump', text: 'Jump', x: '70%' },
        { id: 'attack', text: 'Attack', x: '90%' }
    ];

    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.id = btn.id;
        button.textContent = btn.text;
        button.style.position = 'absolute';
        button.style.left = btn.x;
        button.style.bottom = '10px';
        touchArea.appendChild(button);

        button.addEventListener('touchstart', () => { touchControls[btn.id] = true; });
        button.addEventListener('touchend', () => { touchControls[btn.id] = false; });
    });
}

export function updateInputState() {
    if (gamepad) {
        gamepad = navigator.getGamepads()[gamepad.index];
    }
}

function isKeyDown(keyCode) {
    return keys[keyCode] === true;
}

function isKeyUp(keyCode) {
    return keys[keyCode] === false || keys[keyCode] === undefined;
}

function isButtonPressed(button) {
    if (gamepad) {
        return gamepad.buttons[button].pressed;
    }
    return false;
}

function getAxisValue(axis) {
    if (gamepad) {
        return gamepad.axes[axis];
    }
    return 0;
}

export function isMoveLeft() {
    return isKeyDown('ArrowLeft') || isButtonPressed(14) || (gamepad && getAxisValue(0) < -0.5) || touchControls.left;
}

export function isMoveRight() {
    return isKeyDown('ArrowRight') || isButtonPressed(15) || (gamepad && getAxisValue(0) > 0.5) || touchControls.right;
}

export function isJump() {
    return isKeyDown('Space') || isButtonPressed(0) || touchControls.jump;
}

export function isAttack() {
    return isKeyDown('KeyX') || isButtonPressed(2) || touchControls.attack;
}

export function isPaused() {
    return isKeyDown('Escape') || isButtonPressed(9);
}

// Call this function to set up input handlers
setupInputHandlers();
