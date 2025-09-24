// Utility functions for the Balance Ball game

class Utils {
    // Math utilities
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    static distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    static radToDeg(rad) {
        return rad * (180 / Math.PI);
    }

    static degToRad(deg) {
        return deg * (Math.PI / 180);
    }

    // Screen management
    static showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
        }
    }

    // Local storage utilities
    static saveData(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('Could not save data:', e);
        }
    }

    static loadData(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.warn('Could not load data:', e);
            return defaultValue;
        }
    }

    // Time formatting
    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Device orientation utilities
    static requestDeviceOrientation() {
        return new Promise((resolve, reject) => {
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                // iOS 13+ permission request
                DeviceOrientationEvent.requestPermission()
                    .then(response => {
                        if (response === 'granted') {
                            resolve(true);
                        } else {
                            reject('Permission denied');
                        }
                    })
                    .catch(reject);
            } else if (window.DeviceOrientationEvent) {
                // Other devices that support device orientation
                resolve(true);
            } else {
                reject('Device orientation not supported');
            }
        });
    }

    // Touch/click event utilities
    static addTouchEventListener(element, eventType, handler) {
        element.addEventListener(eventType, handler, { passive: false });
        
        // Also add mouse events for desktop testing
        if (eventType === 'touchstart') {
            element.addEventListener('mousedown', handler);
        } else if (eventType === 'touchend') {
            element.addEventListener('mouseup', handler);
        } else if (eventType === 'touchmove') {
            element.addEventListener('mousemove', handler);
        }
    }

    // Prevent default touch behaviors
    static preventDefaultTouch() {
        // Only prevent touch events on the game canvas and body, not on buttons
        document.addEventListener('touchstart', (e) => {
            const target = e.target;
            // Allow touches on buttons, inputs, and interactive elements
            if (target.tagName === 'BUTTON' || 
                target.tagName === 'INPUT' || 
                target.tagName === 'A' ||
                target.classList.contains('btn') ||
                target.closest('.btn') ||
                target.closest('button')) {
                return; // Don't prevent default for interactive elements
            }
            
            // Prevent default for body and canvas to avoid scrolling
            if (target === document.body || target.tagName === 'CANVAS') {
                e.preventDefault();
            }
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            const target = e.target;
            // Only prevent scrolling on body and canvas
            if (target === document.body || target.tagName === 'CANVAS' || target.closest('#game-screen')) {
                e.preventDefault();
            }
        }, { passive: false });

        // Don't prevent touchend at all - let buttons work normally
    }

    // Canvas utilities
    static resizeCanvas(canvas, container = null) {
        const rect = container ? container.getBoundingClientRect() : {
            width: window.innerWidth,
            height: window.innerHeight - 60 // Account for HUD
        };
        
        const dpr = window.devicePixelRatio || 1;
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        
        return {
            width: rect.width,
            height: rect.height,
            dpr: dpr
        };
    }

    // Vibration utility (if supported)
    static vibrate(pattern = 50) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    // Audio context utilities
    static createAudioContext() {
        try {
            return new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
            return null;
        }
    }

    // Simple sound effects using Web Audio API
    static playTone(audioContext, frequency, duration, type = 'sine') {
        if (!audioContext) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }

    // Performance utilities
    static requestAnimationFrame(callback) {
        return window.requestAnimationFrame(callback);
    }

    static cancelAnimationFrame(id) {
        return window.cancelAnimationFrame(id);
    }

    // Debug utilities
    static log(message, ...args) {
        if (window.DEBUG) {
            console.log(`[BalanceBall] ${message}`, ...args);
        }
    }

    static warn(message, ...args) {
        console.warn(`[BalanceBall] ${message}`, ...args);
    }

    static error(message, ...args) {
        console.error(`[BalanceBall] ${message}`, ...args);
    }
}

// Export for use in other modules
window.Utils = Utils;