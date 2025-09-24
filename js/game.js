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
        this.gameTime = 0; // Game timer always starts from 0 and counts up
        this.timeLimit = 30; // Time limit for the level
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
        
        // Red border settings
        this.borderWidth = 15; // Width of the red death border
        
        // Axis inversion mechanics
        this.axisInverted = false;
        this.inversionActive = false;
        this.inversionStartTime = 0;
        this.inversionDuration = 3000; // 3 seconds in milliseconds
        this.inversionTriggered = false; // Only happens once per level
        
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
        // Get difficulty info for display
        const difficultyInfo = this.levels.getLevelDifficultyInfo(levelNumber);
        
        // Use the existing loading overlay from HTML
        const loadingOverlay = document.getElementById('loading-overlay');
        const difficultyName = document.getElementById('difficulty-name');
        
        if (loadingOverlay && difficultyName) {
            difficultyName.textContent = difficultyInfo.name;
            loadingOverlay.style.display = 'flex';
        }
        
        // Auto-hide after level loads
        const loadingTime = 1000; // 1 second loading display
        setTimeout(() => {
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
        }, loadingTime);
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
        this.gameTime = 0; // Always start from zero
        this.timeLimit = scaledLevel.timeLimit; // Set the time limit for this level
        
        // Update UI
        document.getElementById('game-level').textContent = levelNumber;
        document.getElementById('game-timer').textContent = this.timeLimit;
        
        // Reset inversion state for new level
        this.axisInverted = false;
        this.inversionActive = false;
        this.inversionTriggered = false;
        this.inversionStartTime = 0;
        
        // Set game state
        this.gameState = 'playing';
        this.gameStartTime = Date.now();
        
        Utils.showScreen('game-screen');
        
        // Show tilt message initially, then hide after 3 seconds
        this.showTiltMessage();
    }
    
    showTiltMessage() {
        const tiltInfo = document.querySelector('.tilt-info');
        if (tiltInfo) {
            tiltInfo.style.display = 'block';
            tiltInfo.style.opacity = '1';
            tiltInfo.style.cursor = 'pointer';
            
            // Hide when clicked
            const hideMessage = () => {
                tiltInfo.style.transition = 'opacity 0.5s ease-out';
                tiltInfo.style.opacity = '0';
                
                // Completely hide after fade
                setTimeout(() => {
                    tiltInfo.style.display = 'none';
                }, 500);
                
                // Remove event listener after hiding
                tiltInfo.removeEventListener('click', hideMessage);
                tiltInfo.removeEventListener('touchend', hideMessage);
            };
            
            // Add click/touch event listeners
            tiltInfo.addEventListener('click', hideMessage);
            tiltInfo.addEventListener('touchend', hideMessage);
            
            // Also hide after 3 seconds with fade animation (auto-hide)
            setTimeout(() => {
                // Only hide if still visible (not manually hidden)
                if (tiltInfo.style.opacity !== '0') {
                    hideMessage();
                }
            }, 3000);
        }
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
        const completionTime = this.gameTime; // Use actual elapsed time
        
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
    
    checkBorderCollision() {
        if (!this.ball) return false;
        
        const ballRadius = this.ball.radius;
        const borderWidth = this.borderWidth;
        
        // Check if ball touches red border areas
        if (this.ball.x - ballRadius <= borderWidth || // Left border
            this.ball.x + ballRadius >= this.canvasWidth - borderWidth || // Right border  
            this.ball.y - ballRadius <= borderWidth || // Top border
            this.ball.y + ballRadius >= this.canvasHeight - borderWidth) { // Bottom border
            return true;
        }
        
        return false;
    }
    
    updateAxisInversion() {
        // Trigger axis inversion once per level (not in first second)
        if (!this.inversionTriggered && this.gameTime > 1.0) {
            // Random chance to trigger inversion (20% chance per second after first second)
            const inversionChance = 0.003; // Per frame chance
            if (Math.random() < inversionChance) {
                this.triggerAxisInversion();
            }
        }
        
        // Handle active inversion duration
        if (this.inversionActive) {
            const elapsed = Date.now() - this.inversionStartTime;
            if (elapsed >= this.inversionDuration) {
                this.endAxisInversion();
            }
        }
    }
    
    triggerAxisInversion() {
        this.inversionTriggered = true;
        this.inversionActive = true;
        this.axisInverted = true;
        this.inversionStartTime = Date.now();
        
        // Visual feedback - could add screen flash or UI indicator
        console.log('Axis inversion activated!');
        
        // Play special sound for inversion
        if (this.audioContext) {
            Utils.playTone(this.audioContext, 400, 0.2);
            setTimeout(() => Utils.playTone(this.audioContext, 600, 0.2), 100);
        }
    }
    
    endAxisInversion() {
        this.inversionActive = false;
        this.axisInverted = false;
        
        console.log('Axis inversion ended');
        
        // Play sound to indicate inversion ended
        if (this.audioContext) {
            Utils.playTone(this.audioContext, 600, 0.2);
            setTimeout(() => Utils.playTone(this.audioContext, 400, 0.2), 100);
        }
    }
    
    updateTimer(deltaTime) {
        if (this.gameState === 'playing') {
            // Game time always counts up from 0, never goes negative
            this.gameTime = Math.max(0, this.gameTime + deltaTime / 1000);
            
            // Check if time limit exceeded
            if (this.gameTime >= this.timeLimit) {
                this.gameTime = this.timeLimit; // Prevent exceeding time limit
                this.gameOver();
            }
            
            // Update UI - show remaining time (time limit - current time)
            const remainingTime = Math.max(0, this.timeLimit - this.gameTime);
            document.getElementById('game-timer').textContent = Math.ceil(remainingTime);
        }
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing' || !this.ball) {
            return;
        }
        
        // Update timer
        this.updateTimer(deltaTime);
        
        // Apply axis inversion if active
        let effectiveTiltX = this.tiltX;
        let effectiveTiltY = this.tiltY;
        
        if (this.axisInverted) {
            effectiveTiltX = -this.tiltX;
            effectiveTiltY = -this.tiltY;
        }
        
        // Update physics
        const collisions = this.physics.update(
            this.ball,
            this.obstacles,
            this.canvasWidth,
            this.canvasHeight,
            effectiveTiltX,
            effectiveTiltY
        );
        
        // Check border collision (red death border)
        if (this.checkBorderCollision()) {
            this.gameOver();
            return;
        }
        
        // Play collision sounds
        if (collisions.wallCollision || collisions.obstacleCollision) {
            if (this.audioContext) {
                Utils.playTone(this.audioContext, 300, 0.1);
            }
            Utils.vibrate(30);
        }
        
        // Handle axis inversion timing
        this.updateAxisInversion();
        
        // Check win condition
        this.checkWinCondition();
    }
    
    render() {
        // Apply color inversion filter if active
        if (this.axisInverted) {
            this.ctx.filter = 'invert(1) hue-rotate(180deg)';
        } else {
            this.ctx.filter = 'none';
        }
        
        // Clear canvas with background color
        this.ctx.fillStyle = '#34495e';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Draw red death border (drawn first as base layer)
        this.ctx.fillStyle = '#e74c3c'; // Red color for danger
        // Top border
        this.ctx.fillRect(0, 0, this.canvasWidth, this.borderWidth);
        // Bottom border  
        this.ctx.fillRect(0, this.canvasHeight - this.borderWidth, this.canvasWidth, this.borderWidth);
        // Left border
        this.ctx.fillRect(0, 0, this.borderWidth, this.canvasHeight);
        // Right border
        this.ctx.fillRect(this.canvasWidth - this.borderWidth, 0, this.borderWidth, this.canvasHeight);
        
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
            
            // Draw axis inversion indicator
            if (this.axisInverted) {
                // Flashing red border to indicate inversion
                const flashAlpha = 0.3 + 0.3 * Math.sin(Date.now() / 200);
                this.ctx.fillStyle = `rgba(231, 76, 60, ${flashAlpha})`;
                this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
                
                // Text indicator
                this.ctx.fillStyle = 'white';
                this.ctx.font = '24px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.strokeStyle = 'black';
                this.ctx.lineWidth = 2;
                this.ctx.strokeText('AXIS INVERTED!', this.canvasWidth / 2, 50);
                this.ctx.fillText('AXIS INVERTED!', this.canvasWidth / 2, 50);
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