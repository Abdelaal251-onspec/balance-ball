// Main game engine for Balance Ball

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.physics = new Physics();
        this.levels = new Levels();
        
        // Game state
        this.gameState = 'menu'; // menu, playing, paused, win, gameover
        this.currentLevel = 1;
        this.timeRemaining = 30;
        this.gameStartTime = 0;
        
        // Device orientation
        this.tiltX = 0;
        this.tiltY = 0;
        this.calibrationX = 0;
        this.calibrationY = 0;
        
        // Game objects
        this.ball = null;
        this.hole = null;
        this.obstacles = [];
        
        // Canvas dimensions
        this.canvasWidth = 0;
        this.canvasHeight = 0;
        
        // Animation
        this.animationId = null;
        this.lastTime = 0;
        
        // Audio
        this.audioContext = Utils.createAudioContext();
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupDeviceOrientation();
        this.bindEvents();
        this.loadSaveData();
        
        // Start game loop
        this.gameLoop = this.gameLoop.bind(this);
        this.startGameLoop();
    }
    
    setupCanvas() {
        const dimensions = Utils.resizeCanvas(this.canvas);
        this.canvasWidth = dimensions.width;
        this.canvasHeight = dimensions.height;
        
        // Handle resize
        window.addEventListener('resize', () => {
            const newDimensions = Utils.resizeCanvas(this.canvas);
            this.canvasWidth = newDimensions.width;
            this.canvasHeight = newDimensions.height;
        });
    }
    
    setupDeviceOrientation() {
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (event) => {
                // Get raw orientation values
                const beta = event.beta || 0;   // Front-to-back tilt (-180 to 180)
                const gamma = event.gamma || 0; // Left-to-right tilt (-90 to 90)
                
                // Apply calibration offset and map to gravity directions
                // Gamma: positive = tilt right, negative = tilt left
                // Beta: positive = tilt forward/down, negative = tilt backward/up
                this.tiltX = (gamma - this.calibrationX) / 45; // More sensitive
                this.tiltY = (beta - this.calibrationY) / 45;  // More sensitive
                
                // Clamp values
                this.tiltX = Utils.clamp(this.tiltX, -1, 1);
                this.tiltY = Utils.clamp(this.tiltY, -1, 1);
            });
        }
    }
    
    bindEvents() {
        // Handle window focus/blur for pausing
        window.addEventListener('blur', () => {
            if (this.gameState === 'playing') {
                this.pauseGame();
            }
        });
    }
    
    loadSaveData() {
        const savedLevel = Utils.loadData('currentLevel', 1);
        const savedBestTime = Utils.loadData('bestTime', null);
        
        this.currentLevel = savedLevel;
        
        // Update UI
        const currentLevelSpan = document.getElementById('current-level');
        const bestTimeSpan = document.getElementById('best-time');
        
        if (currentLevelSpan) {
            currentLevelSpan.textContent = this.currentLevel;
        }
        
        if (bestTimeSpan && savedBestTime) {
            bestTimeSpan.textContent = Utils.formatTime(savedBestTime);
        }
    }
    
    saveGameData() {
        Utils.saveData('currentLevel', this.currentLevel);
    }
    
    showLevelLoading(levelNumber) {
        // Create and show loading overlay
        const gameScreen = document.getElementById('game-screen');
        let loadingOverlay = document.getElementById('level-loading-overlay');
        
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'level-loading-overlay';
            loadingOverlay.className = 'loading-overlay';
            loadingOverlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <h3 id="loading-title">Generating Level ${levelNumber}</h3>
                    <p id="loading-subtitle">Creating obstacles and positioning hole...</p>
                    <div class="loading-progress">
                        <div class="loading-bar"></div>
                    </div>
                </div>
            `;
            gameScreen.appendChild(loadingOverlay);
        } else {
            document.getElementById('loading-title').textContent = `Generating Level ${levelNumber}`;
            document.getElementById('loading-subtitle').textContent = 'Creating obstacles and positioning hole...';
        }
        
        loadingOverlay.style.display = 'flex';
        
        // Animate loading bar
        const loadingBar = loadingOverlay.querySelector('.loading-bar');
        loadingBar.style.width = '0%';
        setTimeout(() => {
            loadingBar.style.width = '100%';
        }, 100);
        
        // Auto-hide after level loads
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 500 + Math.min(levelNumber * 100, 1000));
    }

    showCalibrationLoading() {
        const calibrationScreen = document.getElementById('calibration-screen');
        let loadingOverlay = document.getElementById('calibration-loading-overlay');
        
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'calibration-loading-overlay';
            loadingOverlay.className = 'loading-overlay';
            loadingOverlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <h3>Calibrating Device</h3>
                    <p>Reading device orientation...</p>
                </div>
            `;
            calibrationScreen.appendChild(loadingOverlay);
        }
        
        loadingOverlay.style.display = 'flex';
        
        // Hide after calibration
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 2000);
    }

    calibrateDevice() {
        if (window.DeviceOrientationEvent) {
            // Show calibration loading
            this.showCalibrationLoading();
            
            // Get current orientation as calibration baseline
            const handleCalibration = (event) => {
                this.calibrationX = event.gamma || 0;
                this.calibrationY = event.beta || 0;
                
                Utils.saveData('calibrationX', this.calibrationX);
                Utils.saveData('calibrationY', this.calibrationY);
                
                window.removeEventListener('deviceorientation', handleCalibration);
                
                // Play success sound
                if (this.audioContext) {
                    Utils.playTone(this.audioContext, 800, 0.2);
                }
                
                Utils.vibrate(100);
            };
            
            window.addEventListener('deviceorientation', handleCalibration);
            
            // Load saved calibration if available
            const savedCalX = Utils.loadData('calibrationX', 0);
            const savedCalY = Utils.loadData('calibrationY', 0);
            this.calibrationX = savedCalX;
            this.calibrationY = savedCalY;
        }
    }
    
    async startLevel(levelNumber) {
        // Show loading for level generation
        this.showLevelLoading(levelNumber);
        
        // Simulate level generation time (for complex levels)
        await new Promise(resolve => setTimeout(resolve, 500 + Math.min(levelNumber * 100, 1000)));
        
        this.currentLevel = levelNumber;
        const levelData = this.levels.getLevelData(levelNumber);
        
        if (!levelData) {
            Utils.error('Invalid level:', levelNumber);
            return;
        }
        
        // Scale level for current screen size
        const scaledLevel = this.levels.scaleLevelForScreen(
            levelData, 
            this.canvasWidth, 
            this.canvasHeight
        );
        
        // Initialize game objects
        this.ball = {
            x: scaledLevel.ballStart.x,
            y: scaledLevel.ballStart.y,
            radius: Math.min(this.canvasWidth, this.canvasHeight) * 0.03,
            velocity: { x: 0, y: 0 },
            acceleration: { x: 0, y: 0 }
        };
        
        this.hole = scaledLevel.hole;
        this.obstacles = scaledLevel.obstacles;
        this.timeRemaining = scaledLevel.timeLimit;
        
        // Update UI
        document.getElementById('game-level').textContent = levelNumber;
        document.getElementById('game-timer').textContent = this.timeRemaining;
        
        // Set game state
        this.gameState = 'playing';
        this.gameStartTime = Date.now();
        
        Utils.showScreen('game-screen');
    }
    
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            Utils.showScreen('pause-screen');
        }
    }
    
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            Utils.showScreen('game-screen');
        }
    }
    
    async restartLevel() {
        await this.startLevel(this.currentLevel);
    }
    
    async nextLevel() {
        this.currentLevel++;
        this.saveGameData();
        await this.startLevel(this.currentLevel);
    }
    
    winLevel() {
        const completionTime = 30 - this.timeRemaining;
        
        // Save best time
        const savedBestTime = Utils.loadData('bestTime', null);
        if (!savedBestTime || completionTime < savedBestTime) {
            Utils.saveData('bestTime', completionTime);
        }
        
        // Update UI
        document.getElementById('completion-time').textContent = completionTime.toFixed(1);
        document.getElementById('completed-level').textContent = this.currentLevel;
        
        this.gameState = 'win';
        Utils.showScreen('win-screen');
        
        // Play win sound
        if (this.audioContext) {
            Utils.playTone(this.audioContext, 523, 0.3); // C note
            setTimeout(() => Utils.playTone(this.audioContext, 659, 0.3), 200); // E note
            setTimeout(() => Utils.playTone(this.audioContext, 784, 0.5), 400); // G note
        }
        
        Utils.vibrate([100, 50, 100]);
    }
    
    gameOver() {
        this.gameState = 'gameover';
        Utils.showScreen('gameover-screen');
        
        // Play game over sound
        if (this.audioContext) {
            Utils.playTone(this.audioContext, 200, 0.5, 'sawtooth');
        }
        
        Utils.vibrate(300);
    }
    
    checkWinCondition() {
        if (this.ball && this.hole) {
            const distance = Utils.distance(this.ball.x, this.ball.y, this.hole.x, this.hole.y);
            // Ball is completely inside the hole when distance + ball radius < hole radius
            const completelyInHole = distance + this.ball.radius < this.hole.radius;
            
            // Win when ball is completely in hole and relatively still
            if (completelyInHole && this.physics.isBallStopped(this.ball, 1.0)) {
                this.winLevel();
                return true;
            }
        }
        return false;
    }
    
    updateTimer(deltaTime) {
        if (this.gameState === 'playing') {
            this.timeRemaining -= deltaTime / 1000;
            
            if (this.timeRemaining <= 0) {
                this.timeRemaining = 0;
                this.gameOver();
            }
            
            // Update UI
            document.getElementById('game-timer').textContent = Math.ceil(this.timeRemaining);
        }
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing' || !this.ball) {
            return;
        }
        
        // Update timer
        this.updateTimer(deltaTime);
        
        // Update physics
        const collisions = this.physics.update(
            this.ball,
            this.obstacles,
            this.canvasWidth,
            this.canvasHeight,
            this.tiltX,
            this.tiltY
        );
        
        // Play collision sounds
        if (collisions.wallCollision || collisions.obstacleCollision) {
            if (this.audioContext) {
                Utils.playTone(this.audioContext, 300, 0.1);
            }
            Utils.vibrate(30);
        }
        
        // Check win condition
        this.checkWinCondition();
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#34495e';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        if (this.gameState === 'playing' || this.gameState === 'paused') {
            // Draw obstacles first (background layer)
            this.obstacles.forEach(obstacle => {
                this.ctx.fillStyle = '#7f8c8d';
                
                if (obstacle.type === 'rectangle') {
                    this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                    
                    // Add border
                    this.ctx.strokeStyle = '#5d6d6e';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                } else if (obstacle.type === 'circle') {
                    this.ctx.beginPath();
                    this.ctx.arc(obstacle.x, obstacle.y, obstacle.radius, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Add border
                    this.ctx.strokeStyle = '#5d6d6e';
                    this.ctx.lineWidth = 2;
                    this.ctx.stroke();
                }
            });
            
            // Draw hole on top of obstacles (middle layer)
            if (this.hole) {
                // Check if ball is near or in hole for visual feedback
                let holeColor = '#2c3e50';
                let holeBorderColor = '#1a252f';
                let glowColor = 'rgba(52, 152, 219, 0.3)';
                
                if (this.ball) {
                    const distance = Utils.distance(this.ball.x, this.ball.y, this.hole.x, this.hole.y);
                    const completelyInHole = distance + this.ball.radius < this.hole.radius;
                    const nearHole = distance < this.hole.radius + this.ball.radius * 2;
                    
                    if (completelyInHole) {
                        // Ball is in hole - green indicator
                        holeColor = '#27ae60';
                        holeBorderColor = '#229954';
                        glowColor = 'rgba(39, 174, 96, 0.5)';
                    } else if (nearHole) {
                        // Ball is near hole - yellow indicator
                        holeColor = '#f39c12';
                        holeBorderColor = '#e67e22';
                        glowColor = 'rgba(243, 156, 18, 0.5)';
                    }
                }
                
                // Draw hole glow/shadow for better visibility
                this.ctx.fillStyle = glowColor;
                this.ctx.beginPath();
                this.ctx.arc(this.hole.x, this.hole.y, this.hole.radius + 5, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw main hole
                this.ctx.fillStyle = holeColor;
                this.ctx.beginPath();
                this.ctx.arc(this.hole.x, this.hole.y, this.hole.radius, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Hole border (thicker for better visibility)
                this.ctx.strokeStyle = holeBorderColor;
                this.ctx.lineWidth = 4;
                this.ctx.stroke();
                
                // Inner shadow for depth effect
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                this.ctx.beginPath();
                this.ctx.arc(this.hole.x, this.hole.y, this.hole.radius - 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Draw ball
            if (this.ball) {
                // Ball shadow
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                this.ctx.beginPath();
                this.ctx.arc(this.ball.x + 2, this.ball.y + 2, this.ball.radius, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Ball body
                const gradient = this.ctx.createRadialGradient(
                    this.ball.x - this.ball.radius * 0.3,
                    this.ball.y - this.ball.radius * 0.3,
                    0,
                    this.ball.x,
                    this.ball.y,
                    this.ball.radius
                );
                gradient.addColorStop(0, '#3498db');
                gradient.addColorStop(1, '#2980b9');
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Ball highlight
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                this.ctx.beginPath();
                this.ctx.arc(
                    this.ball.x - this.ball.radius * 0.4,
                    this.ball.y - this.ball.radius * 0.4,
                    this.ball.radius * 0.3,
                    0, Math.PI * 2
                );
                this.ctx.fill();
            }
            
            // Draw pause overlay
            if (this.gameState === 'paused') {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
                
                this.ctx.fillStyle = 'white';
                this.ctx.font = '48px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('PAUSED', this.canvasWidth / 2, this.canvasHeight / 2);
            }
        }
    }
    
    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        this.animationId = Utils.requestAnimationFrame(this.gameLoop);
    }
    
    startGameLoop() {
        this.lastTime = performance.now();
        this.animationId = Utils.requestAnimationFrame(this.gameLoop);
    }
    
    stopGameLoop() {
        if (this.animationId) {
            Utils.cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}

// Export for use in other modules
window.Game = Game;