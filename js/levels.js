// Level configurations for the Balance Ball game

class Levels {
    constructor() {
        this.baseWidth = 400;
        this.baseHeight = 400;
        this.minHoleDistance = 80; // Minimum distance between hole and obstacles
        this.levels = [];
    }

    // Generate a safe random position that doesn't overlap with existing objects
    generateSafePosition(existingObjects, objectRadius, margin = 20) {
        let attempts = 0;
        const maxAttempts = 50;
        
        while (attempts < maxAttempts) {
            const x = Math.random() * (this.baseWidth - 2 * margin - 2 * objectRadius) + margin + objectRadius;
            const y = Math.random() * (this.baseHeight - 2 * margin - 2 * objectRadius) + margin + objectRadius;
            
            let safe = true;
            for (const obj of existingObjects) {
                const distance = Math.sqrt((x - obj.x) ** 2 + (y - obj.y) ** 2);
                const requiredDistance = objectRadius + (obj.radius || Math.max(obj.width || 0, obj.height || 0) / 2) + margin;
                
                if (distance < requiredDistance) {
                    safe = false;
                    break;
                }
            }
            
            if (safe) {
                return { x, y };
            }
            attempts++;
        }
        
        // Fallback to corners if no safe position found
        const corners = [
            { x: 50, y: 50 },
            { x: this.baseWidth - 50, y: 50 },
            { x: 50, y: this.baseHeight - 50 },
            { x: this.baseWidth - 50, y: this.baseHeight - 50 }
        ];
        return corners[Math.floor(Math.random() * corners.length)];
    }

    // Generate random level with guaranteed hole visibility
    generateRandomLevel(levelNumber, numObstacles, movingHole = false) {
        const baseTimeLimit = 30;
        const timeIncrease = Math.floor((levelNumber - 1) / 3) * 5;
        const timeLimit = Math.min(baseTimeLimit + timeIncrease, 60);
        
        const objects = []; // Track all objects to avoid overlaps
        
        // Generate ball start position (always in a corner for consistency)
        const ballStart = { x: 50, y: 50 };
        objects.push({ ...ballStart, radius: 20 }); // Account for ball size
        
        // Generate obstacles first
        const obstacles = [];
        for (let i = 0; i < numObstacles; i++) {
            const obstacleType = Math.random() < 0.6 ? 'rectangle' : 'circle';
            
            if (obstacleType === 'rectangle') {
                const width = Math.random() * 60 + 20; // 20-80 width
                const height = Math.random() * 120 + 40; // 40-160 height
                const pos = this.generateSafePosition(objects, Math.max(width, height) / 2, 30);
                
                const obstacle = {
                    type: 'rectangle',
                    x: pos.x - width / 2,
                    y: pos.y - height / 2,
                    width: width,
                    height: height
                };
                
                obstacles.push(obstacle);
                objects.push({ x: pos.x, y: pos.y, width: width, height: height });
            } else {
                const radius = Math.random() * 25 + 15; // 15-40 radius
                const pos = this.generateSafePosition(objects, radius, 30);
                
                const obstacle = {
                    type: 'circle',
                    x: pos.x,
                    y: pos.y,
                    radius: radius
                };
                
                obstacles.push(obstacle);
                objects.push({ x: pos.x, y: pos.y, radius: radius });
            }
        }
        
        // Generate hole position with extra safety margin
        const holeRadius = 25;
        const holePos = this.generateSafePosition(objects, holeRadius, this.minHoleDistance);
        
        // Add slight random movement to hole position for complexity
        let finalHolePos = holePos;
        if (movingHole && levelNumber > 5) {
            const variance = Math.min(20, levelNumber * 2);
            finalHolePos = {
                x: holePos.x + (Math.random() - 0.5) * variance,
                y: holePos.y + (Math.random() - 0.5) * variance
            };
            
            // Ensure hole stays in bounds
            finalHolePos.x = Math.max(holeRadius + 20, Math.min(this.baseWidth - holeRadius - 20, finalHolePos.x));
            finalHolePos.y = Math.max(holeRadius + 20, Math.min(this.baseHeight - holeRadius - 20, finalHolePos.y));
        }

        return {
            level: levelNumber,
            timeLimit: timeLimit,
            ballStart: ballStart,
            hole: { 
                x: finalHolePos.x, 
                y: finalHolePos.y, 
                radius: holeRadius 
            },
            obstacles: obstacles
        };
    }

    generateLevels() {
        return [
            // Level 1 - Simple introduction (no obstacles)
            this.generateRandomLevel(1, 0, false),

            // Level 2 - Single obstacle
            this.generateRandomLevel(2, 1, false),

            // Level 3-5 - Moderate complexity
            this.generateRandomLevel(3, 2, false),
            this.generateRandomLevel(4, 3, false),
            this.generateRandomLevel(5, 3, true),  // Start moving hole

            // Level 6-10 - Advanced levels with moving holes
            this.generateRandomLevel(6, 4, true),
            this.generateRandomLevel(7, 4, true),
            this.generateRandomLevel(8, 5, true),
            this.generateRandomLevel(9, 5, true),
            this.generateRandomLevel(10, 6, true)
        ];
    }

    getLevel(levelNumber) {
        if (levelNumber <= 0 || levelNumber > this.levels.length) {
            return null;
        }
        return JSON.parse(JSON.stringify(this.levels[levelNumber - 1])); // Deep copy
    }

    getTotalLevels() {
        return this.levels.length;
    }

    // Procedurally generate levels beyond the predefined ones
    generateProceduralLevel(levelNumber) {
        const numObstacles = Math.min(6 + Math.floor((levelNumber - 10) / 2), 15);
        return this.generateRandomLevel(levelNumber, numObstacles, true);
    }

    // Get level data, including procedurally generated levels
    getLevelData(levelNumber) {
        if (levelNumber <= this.levels.length) {
            return this.getLevel(levelNumber);
        } else {
            // Generate procedural level for levels beyond predefined ones
            return this.generateProceduralLevel(levelNumber);
        }
    }

    // Scale level for different screen sizes
    scaleLevelForScreen(levelData, canvasWidth, canvasHeight) {
        const scaleX = canvasWidth / 400;  // Base design width
        const scaleY = canvasHeight / 400; // Base design height
        const scale = Math.min(scaleX, scaleY);
        
        // Scale ball start position
        levelData.ballStart.x *= scale;
        levelData.ballStart.y *= scale;
        
        // Scale hole
        levelData.hole.x *= scale;
        levelData.hole.y *= scale;
        levelData.hole.radius *= scale;
        
        // Scale obstacles
        levelData.obstacles.forEach(obstacle => {
            obstacle.x *= scale;
            obstacle.y *= scale;
            
            if (obstacle.type === 'rectangle') {
                obstacle.width *= scale;
                obstacle.height *= scale;
            } else if (obstacle.type === 'circle') {
                obstacle.radius *= scale;
            }
        });
        
        return levelData;
    }
}

// Export for use in other modules
window.Levels = Levels;