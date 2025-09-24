// Level configurations for the Balance Ball game

class Levels {
    constructor() {
        this.baseWidth = 400;
        this.baseHeight = 400;
        this.minHoleDistance = 60; // Minimum distance between hole and obstacles
        
        // Difficulty scaling parameters
        this.difficultyTiers = {
            beginner: { levels: 1, obstacles: [0, 1], timeBonus: 10, holeSize: 30 },
            easy: { levels: 5, obstacles: [1, 3], timeBonus: 5, holeSize: 28 },
            normal: { levels: 10, obstacles: [2, 5], timeBonus: 0, holeSize: 25 },
            hard: { levels: 20, obstacles: [3, 7], timeBonus: -5, holeSize: 23 },
            expert: { levels: 50, obstacles: [5, 10], timeBonus: -10, holeSize: 20 },
            master: { levels: Infinity, obstacles: [7, 15], timeBonus: -15, holeSize: 18 }
        };
        
        this.levels = []; // No predefined levels - all generated dynamically
    }

    // Determine difficulty tier based on level number
    getDifficultyTier(levelNumber) {
        if (levelNumber <= 1) return this.difficultyTiers.beginner;
        if (levelNumber <= 5) return this.difficultyTiers.easy;
        if (levelNumber <= 15) return this.difficultyTiers.normal;
        if (levelNumber <= 30) return this.difficultyTiers.hard;
        if (levelNumber <= 75) return this.difficultyTiers.expert;
        return this.difficultyTiers.master;
    }

    // Generate reasonable obstacle dimensions based on difficulty
    generateObstacleDimensions(tier, obstacleType) {
        const complexity = Math.min((tier.obstacles[1] - tier.obstacles[0]) / 10, 1);
        
        if (obstacleType === 'rectangle') {
            // Rectangles get more varied and challenging with difficulty
            const baseWidth = 15 + Math.random() * 25; // 15-40
            const baseHeight = 30 + Math.random() * 80; // 30-110
            
            const variability = 1 + complexity * 0.8; // 1.0 to 1.8 multiplier
            
            return {
                width: Math.max(10, baseWidth * variability),
                height: Math.max(20, baseHeight * variability)
            };
        } else {
            // Circles get slightly larger with difficulty but stay reasonable
            const baseRadius = 12 + Math.random() * 18; // 12-30
            const variability = 1 + complexity * 0.5; // 1.0 to 1.5 multiplier
            
            return {
                radius: Math.max(8, baseRadius * variability)
            };
        }
    }

    // Generate a safe random position that doesn't overlap with existing objects
    generateSafePosition(existingObjects, objectRadius, margin = 25, tier = null) {
        let attempts = 0;
        const maxAttempts = 150; // More attempts for better placement
        
        // Adjust margins based on difficulty - tighter spaces for harder levels
        const difficultyMargin = tier ? Math.max(20, margin - (tier.obstacles[1] - tier.obstacles[0]) * 2) : margin;
        
        while (attempts < maxAttempts) {
            const x = Math.random() * (this.baseWidth - 2 * difficultyMargin - 2 * objectRadius) + difficultyMargin + objectRadius;
            const y = Math.random() * (this.baseHeight - 2 * difficultyMargin - 2 * objectRadius) + difficultyMargin + objectRadius;
            
            let safe = true;
            for (const obj of existingObjects) {
                const distance = Math.sqrt((x - obj.x) ** 2 + (y - obj.y) ** 2);
                let requiredDistance;
                
                if (obj.radius) {
                    // For circular objects, use radius + margin
                    requiredDistance = objectRadius + obj.radius + difficultyMargin;
                } else {
                    // For rectangular objects, use diagonal distance to ensure no intersection
                    const objRadius = Math.sqrt((obj.width || 0) ** 2 + (obj.height || 0) ** 2) / 2;
                    requiredDistance = objectRadius + objRadius + difficultyMargin;
                }
                
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
        
        // Intelligent fallback based on difficulty
        const fallbackPositions = [
            { x: this.baseWidth * 0.85, y: this.baseHeight * 0.85 }, // Bottom right
            { x: this.baseWidth * 0.15, y: this.baseHeight * 0.85 }, // Bottom left  
            { x: this.baseWidth * 0.85, y: this.baseHeight * 0.15 }, // Top right
            { x: this.baseWidth * 0.15, y: this.baseHeight * 0.15 }, // Top left
            { x: this.baseWidth * 0.5, y: this.baseHeight * 0.85 },  // Bottom center
            { x: this.baseWidth * 0.85, y: this.baseHeight * 0.5 },  // Right center
        ];
        
        return fallbackPositions[Math.floor(Math.random() * fallbackPositions.length)];
    }

    // Check if there's a clear path between two points using simple line-of-sight
    hasPathToHole(ballStart, hole, obstacles, ballRadius = 20) {
        const steps = 50; // Number of points to check along the path
        const dx = (hole.x - ballStart.x) / steps;
        const dy = (hole.y - ballStart.y) / steps;
        
        for (let i = 0; i <= steps; i++) {
            const x = ballStart.x + dx * i;
            const y = ballStart.y + dy * i;
            
            // Check collision with each obstacle
            for (const obstacle of obstacles) {
                if (this.pointCollidesWithObstacle({ x, y, radius: ballRadius }, obstacle)) {
                    return false;
                }
            }
        }
        return true;
    }

    // Check if a point collides with an obstacle
    pointCollidesWithObstacle(point, obstacle) {
        if (obstacle.type === 'circle') {
            const distance = Math.sqrt((point.x - obstacle.x) ** 2 + (point.y - obstacle.y) ** 2);
            return distance < (point.radius + obstacle.radius);
        } else if (obstacle.type === 'rectangle') {
            // Check if circle intersects with rectangle
            const closestX = Math.max(obstacle.x, Math.min(point.x, obstacle.x + obstacle.width));
            const closestY = Math.max(obstacle.y, Math.min(point.y, obstacle.y + obstacle.height));
            const distance = Math.sqrt((point.x - closestX) ** 2 + (point.y - closestY) ** 2);
            return distance < point.radius;
        }
        return false;
    }

    // Generate infinite random levels with progressive difficulty
    generateLevel(levelNumber, forceObstacleCount = null) {
        const tier = this.getDifficultyTier(levelNumber);
        
        // Calculate dynamic parameters (use forced count for recursion or random within tier)
        const numObstacles = forceObstacleCount !== null ? forceObstacleCount : Math.floor(
            tier.obstacles[0] + Math.random() * (tier.obstacles[1] - tier.obstacles[0] + 1)
        );
        
        const baseTimeLimit = 30;
        const timeLimit = Math.max(15, baseTimeLimit + tier.timeBonus);
        
        const holeRadius = tier.holeSize;
        const objects = []; // Track all objects to avoid overlaps
        
        // Generate ball start position - vary based on difficulty
        let ballStart;
        if (levelNumber === 1) {
            // Always start in same corner for first level
            ballStart = { x: 50, y: 50 };
        } else if (levelNumber <= 5) {
            // Early levels start in corners
            const corners = [
                { x: 50, y: 50 },
                { x: this.baseWidth - 50, y: 50 },
                { x: 50, y: this.baseHeight - 50 }
            ];
            ballStart = corners[Math.floor(Math.random() * corners.length)];
        } else {
            // Advanced levels can start anywhere along edges
            const edge = Math.floor(Math.random() * 4);
            switch (edge) {
                case 0: // Top edge
                    ballStart = { x: 50 + Math.random() * (this.baseWidth - 100), y: 50 };
                    break;
                case 1: // Right edge
                    ballStart = { x: this.baseWidth - 50, y: 50 + Math.random() * (this.baseHeight - 100) };
                    break;
                case 2: // Bottom edge
                    ballStart = { x: 50 + Math.random() * (this.baseWidth - 100), y: this.baseHeight - 50 };
                    break;
                case 3: // Left edge
                    ballStart = { x: 50, y: 50 + Math.random() * (this.baseHeight - 100) };
                    break;
            }
        }
        
        objects.push({ ...ballStart, radius: 20 }); // Account for ball size
        
        // Generate obstacles with reasonable positioning
        const obstacles = [];
        for (let i = 0; i < numObstacles; i++) {
            const obstacleType = Math.random() < 0.65 ? 'rectangle' : 'circle';
            const dimensions = this.generateObstacleDimensions(tier, obstacleType);
            
            if (obstacleType === 'rectangle') {
                const pos = this.generateSafePosition(
                    objects, 
                    Math.max(dimensions.width, dimensions.height) / 2, 
                    25,
                    tier
                );
                
                const obstacle = {
                    type: 'rectangle',
                    x: pos.x - dimensions.width / 2,
                    y: pos.y - dimensions.height / 2,
                    width: dimensions.width,
                    height: dimensions.height
                };
                
                obstacles.push(obstacle);
                objects.push({ 
                    x: pos.x, 
                    y: pos.y, 
                    width: dimensions.width, 
                    height: dimensions.height 
                });
            } else {
                const pos = this.generateSafePosition(objects, dimensions.radius, 25, tier);
                
                const obstacle = {
                    type: 'circle',
                    x: pos.x,
                    y: pos.y,
                    radius: dimensions.radius
                };
                
                obstacles.push(obstacle);
                objects.push({ x: pos.x, y: pos.y, radius: dimensions.radius });
            }
        }
        
        // Generate hole position with guaranteed safe distance from all obstacles
        let holeAttempts = 0;
        let finalHolePos = null;
        const maxHoleAttempts = 100;
        
        while (holeAttempts < maxHoleAttempts && !finalHolePos) {
            // Generate potential hole position with increased margin
            const holeMargin = Math.max(this.minHoleDistance, holeRadius + 35);
            const tempHolePos = this.generateSafePosition(objects, holeRadius, holeMargin, tier);
            
            // Verify hole doesn't intersect with any obstacle (additional safety check)
            let holeIsSafe = true;
            for (const obstacle of obstacles) {
                let distance;
                if (obstacle.type === 'circle') {
                    distance = Math.sqrt((tempHolePos.x - obstacle.x) ** 2 + (tempHolePos.y - obstacle.y) ** 2);
                    if (distance < (holeRadius + obstacle.radius + 25)) { // Extra margin for hole
                        holeIsSafe = false;
                        break;
                    }
                } else if (obstacle.type === 'rectangle') {
                    // Check distance from hole center to closest point on rectangle
                    const closestX = Math.max(obstacle.x, Math.min(tempHolePos.x, obstacle.x + obstacle.width));
                    const closestY = Math.max(obstacle.y, Math.min(tempHolePos.y, obstacle.y + obstacle.height));
                    distance = Math.sqrt((tempHolePos.x - closestX) ** 2 + (tempHolePos.y - closestY) ** 2);
                    if (distance < (holeRadius + 25)) { // Extra margin for hole
                        holeIsSafe = false;
                        break;
                    }
                }
            }
            
            // Check if there's a clear path from ball start to hole
            if (holeIsSafe && this.hasPathToHole(ballStart, tempHolePos, obstacles)) {
                finalHolePos = tempHolePos;
                break;
            }
            
            holeAttempts++;
        }
        
        // If no suitable hole position found, regenerate level with fewer obstacles
        if (!finalHolePos) {
            if (numObstacles > 0) {
                // Retry with one less obstacle
                return this.generateLevel(levelNumber, numObstacles - 1);
            } else {
                // Fallback: place hole in corner opposite to ball
                const corners = [
                    { x: this.baseWidth * 0.15, y: this.baseHeight * 0.15 },
                    { x: this.baseWidth * 0.85, y: this.baseHeight * 0.15 },
                    { x: this.baseWidth * 0.15, y: this.baseHeight * 0.85 },
                    { x: this.baseWidth * 0.85, y: this.baseHeight * 0.85 }
                ];
                
                // Find corner farthest from ball start
                let farthestCorner = corners[0];
                let maxDistance = 0;
                for (const corner of corners) {
                    const distance = Math.sqrt((ballStart.x - corner.x) ** 2 + (ballStart.y - corner.y) ** 2);
                    if (distance > maxDistance) {
                        maxDistance = distance;
                        farthestCorner = corner;
                    }
                }
                finalHolePos = farthestCorner;
            }
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
            obstacles: obstacles,
            tier: tier
        };
    }

    // All levels are now generated dynamically - no predefined levels needed
    getLevelData(levelNumber) {
        if (levelNumber <= 0) {
            return null;
        }
        
        // Generate each level dynamically with progressive difficulty
        return this.generateLevel(levelNumber);
    }

    // Get difficulty information for UI display
    getLevelDifficultyInfo(levelNumber) {
        const tier = this.getDifficultyTier(levelNumber);
        let difficultyName = '';
        
        if (levelNumber <= 1) difficultyName = 'Tutorial';
        else if (levelNumber <= 5) difficultyName = 'Easy';
        else if (levelNumber <= 15) difficultyName = 'Normal';
        else if (levelNumber <= 30) difficultyName = 'Hard';
        else if (levelNumber <= 75) difficultyName = 'Expert';
        else difficultyName = 'Master';
        
        return {
            name: difficultyName,
            obstacleRange: tier.obstacles,
            holeSize: tier.holeSize,
            timeBonus: tier.timeBonus
        };
    }

    // Infinite levels - always return true
    getTotalLevels() {
        return Infinity;
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