// Main application controller for Balance Ball

class App {
    constructor() {
        this.game = null;
        this.orientationDisplay = {
            x: document.getElementById('tilt-x'),
            y: document.getElementById('tilt-y')
        };
        
        this.init();
    }
    
    init() {
        Utils.preventDefaultTouch();
        this.bindEvents();
        this.startApp();
    }
    
    bindEvents() {
        // Helper function to add both click and touch events
        const addButtonEvent = (id, handler) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', handler);
                button.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    handler();
                });
            }
        };

        // Menu buttons
        addButtonEvent('start-game-btn', () => {
            this.requestOrientationPermission().then(() => {
                this.startGame();
            }).catch(() => {
                this.showOrientationError();
            });
        });
        
        addButtonEvent('calibrate-btn', () => {
            this.requestOrientationPermission().then(() => {
                this.showCalibration();
            }).catch(() => {
                this.showOrientationError();
            });
        });
        
        addButtonEvent('instructions-btn', () => {
            Utils.showScreen('instructions-screen');
        });
        
        // Calibration buttons
        addButtonEvent('do-calibrate-btn', () => {
            this.calibrateDevice();
        });
        
        addButtonEvent('back-from-calibrate-btn', () => {
            Utils.showScreen('menu-screen');
        });
        
        // Instructions button
        addButtonEvent('back-from-instructions-btn', () => {
            Utils.showScreen('menu-screen');
        });
        
        // Game buttons
        addButtonEvent('pause-btn', () => {
            if (this.game) {
                this.game.pauseGame();
            }
        });
        
        // Pause screen buttons
        addButtonEvent('resume-btn', () => {
            if (this.game) {
                this.game.resumeGame();
            }
        });
        
        addButtonEvent('restart-level-btn', () => {
            if (this.game) {
                this.game.restartLevel();
            }
        });
        
        addButtonEvent('main-menu-btn', () => {
            this.showMenu();
        });
        
        // Win screen buttons
        addButtonEvent('next-level-btn', () => {
            if (this.game) {
                this.game.nextLevel();
            }
        });
        
        addButtonEvent('win-main-menu-btn', () => {
            this.showMenu();
        });
        
        // Game over screen buttons
        addButtonEvent('retry-btn', () => {
            if (this.game) {
                this.game.restartLevel();
            }
        });
        
        addButtonEvent('gameover-main-menu-btn', () => {
            this.showMenu();
        });
        
        // Device orientation for calibration display
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (event) => {
                if (this.orientationDisplay.x && this.orientationDisplay.y) {
                    const gamma = event.gamma || 0;
                    const beta = event.beta || 0;
                    
                    this.orientationDisplay.x.textContent = gamma.toFixed(1);
                    this.orientationDisplay.y.textContent = beta.toFixed(1);
                }
            });
        }
    }
    
    async requestOrientationPermission() {
        try {
            if (typeof DeviceOrientationEvent !== 'undefined' && 
                typeof DeviceOrientationEvent.requestPermission === 'function') {
                // iOS 13+ permission request
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission !== 'granted') {
                    throw new Error('Permission denied');
                }
            }
            
            // Check if device orientation is available
            if (!window.DeviceOrientationEvent) {
                throw new Error('Device orientation not supported');
            }
            
            return true;
        } catch (error) {
            Utils.warn('Device orientation permission error:', error);
            throw error;
        }
    }
    
    showOrientationError() {
        alert('Device orientation is required to play this game. Please enable device orientation in your browser settings and try again.');
    }
    
    startApp() {
        // Show loading screen initially
        Utils.showScreen('loading-screen');
        
        // Initialize game
        setTimeout(() => {
            try {
                this.game = new Game();
                
                // Show menu after initialization
                setTimeout(() => {
                    Utils.showScreen('menu-screen');
                }, 1000);
                
            } catch (error) {
                Utils.error('Failed to initialize game:', error);
                alert('Failed to start the game. Please refresh and try again.');
            }
        }, 500);
    }
    
    async startGame() {
        if (this.game) {
            await this.game.startLevel(this.game.currentLevel);
        }
    }
    
    showMenu() {
        Utils.showScreen('menu-screen');
        
        // Update UI with current game state
        if (this.game) {
            const currentLevelSpan = document.getElementById('current-level');
            if (currentLevelSpan) {
                currentLevelSpan.textContent = this.game.currentLevel;
            }
            
            // Update best time
            const bestTime = Utils.loadData('bestTime', null);
            const bestTimeSpan = document.getElementById('best-time');
            if (bestTimeSpan) {
                bestTimeSpan.textContent = bestTime ? Utils.formatTime(bestTime) : '--:--';
            }
        }
    }
    
    showCalibration() {
        Utils.showScreen('calibration-screen');
    }
    
    calibrateDevice() {
        if (this.game) {
            this.game.calibrateDevice();
            
            // Show success message after calibration
            setTimeout(() => {
                alert('Calibration complete! Your device is now calibrated for optimal gameplay.');
                Utils.showScreen('menu-screen');
            }, 2500);
        }
    }
    
    // Handle page visibility changes
    handleVisibilityChange() {
        if (document.hidden && this.game && this.game.gameState === 'playing') {
            this.game.pauseGame();
        }
    }
    
    // Handle app lifecycle
    setupAppLifecycle() {
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        window.addEventListener('beforeunload', () => {
            if (this.game) {
                this.game.saveGameData();
            }
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Service Worker registration for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then((registration) => {
                Utils.log('Service Worker registered:', registration);
            })
            .catch((error) => {
                Utils.warn('Service Worker registration failed:', error);
            });
    });
}