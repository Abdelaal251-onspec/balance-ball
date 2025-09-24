// Level configurations for the Balance Ball game

class Levels {
    constructor() {
        this.levels = this.generateLevels();
    }

    generateLevels() {
        return [
            // Level 1 - Simple introduction
            {
                level: 1,
                timeLimit: 30,
                ballStart: { x: 50, y: 50 },
                hole: { x: 350, y: 250, radius: 25 },
                obstacles: []
            },

            // Level 2 - Single wall obstacle
            {
                level: 2,
                timeLimit: 30,
                ballStart: { x: 50, y: 50 },
                hole: { x: 350, y: 350 },
                obstacles: [
                    { type: 'rectangle', x: 150, y: 150, width: 20, height: 200 }
                ]
            },

            // Level 3 - Circular obstacle
            {
                level: 3,
                timeLimit: 30,
                ballStart: { x: 50, y: 50 },
                hole: { x: 350, y: 50 },
                obstacles: [
                    { type: 'circle', x: 200, y: 150, radius: 40 }
                ]
            },

            // Level 4 - Multiple walls forming a maze
            {
                level: 4,
                timeLimit: 35,
                ballStart: { x: 50, y: 50 },
                hole: { x: 350, y: 350 },
                obstacles: [
                    { type: 'rectangle', x: 100, y: 100, width: 200, height: 20 },
                    { type: 'rectangle', x: 280, y: 120, width: 20, height: 150 },
                    { type: 'rectangle', x: 150, y: 250, width: 150, height: 20 }
                ]
            },

            // Level 5 - Mixed obstacles
            {
                level: 5,
                timeLimit: 35,
                ballStart: { x: 50, y: 300 },
                hole: { x: 350, y: 50 },
                obstacles: [
                    { type: 'circle', x: 150, y: 200, radius: 30 },
                    { type: 'rectangle', x: 200, y: 100, width: 20, height: 100 },
                    { type: 'circle', x: 300, y: 250, radius: 25 }
                ]
            },

            // Level 6 - Narrow passages
            {
                level: 6,
                timeLimit: 40,
                ballStart: { x: 50, y: 200 },
                hole: { x: 350, y: 200 },
                obstacles: [
                    { type: 'rectangle', x: 150, y: 0, width: 20, height: 150 },
                    { type: 'rectangle', x: 150, y: 250, width: 20, height: 150 },
                    { type: 'rectangle', x: 250, y: 0, width: 20, height: 120 },
                    { type: 'rectangle', x: 250, y: 280, width: 20, height: 120 }
                ]
            },

            // Level 7 - Bouncing challenge
            {
                level: 7,
                timeLimit: 40,
                ballStart: { x: 50, y: 50 },
                hole: { x: 50, y: 350 },
                obstacles: [
                    { type: 'circle', x: 100, y: 150, radius: 20 },
                    { type: 'circle', x: 150, y: 200, radius: 20 },
                    { type: 'circle', x: 100, y: 250, radius: 20 },
                    { type: 'rectangle', x: 200, y: 100, width: 150, height: 20 },
                    { type: 'rectangle', x: 200, y: 280, width: 150, height: 20 }
                ]
            },

            // Level 8 - Complex maze
            {
                level: 8,
                timeLimit: 45,
                ballStart: { x: 50, y: 50 },
                hole: { x: 350, y: 350 },
                obstacles: [
                    { type: 'rectangle', x: 100, y: 0, width: 20, height: 100 },
                    { type: 'rectangle', x: 120, y: 80, width: 100, height: 20 },
                    { type: 'rectangle', x: 200, y: 100, width: 20, height: 80 },
                    { type: 'rectangle', x: 80, y: 180, width: 140, height: 20 },
                    { type: 'rectangle', x: 80, y: 200, width: 20, height: 80 },
                    { type: 'rectangle', x: 100, y: 260, width: 120, height: 20 },
                    { type: 'rectangle', x: 200, y: 280, width: 20, height: 100 },
                    { type: 'rectangle', x: 220, y: 320, width: 100, height: 20 }
                ]
            },

            // Level 9 - Circular maze
            {
                level: 9,
                timeLimit: 45,
                ballStart: { x: 200, y: 50 },
                hole: { x: 200, y: 200 },
                obstacles: [
                    { type: 'circle', x: 200, y: 150, radius: 60 },
                    { type: 'circle', x: 200, y: 250, radius: 40 },
                    { type: 'rectangle', x: 150, y: 120, width: 100, height: 15 },
                    { type: 'rectangle', x: 150, y: 265, width: 100, height: 15 }
                ]
            },

            // Level 10 - Final challenge
            {
                level: 10,
                timeLimit: 50,
                ballStart: { x: 50, y: 50 },
                hole: { x: 350, y: 350 },
                obstacles: [
                    { type: 'rectangle', x: 100, y: 0, width: 15, height: 120 },
                    { type: 'rectangle', x: 115, y: 105, width: 100, height: 15 },
                    { type: 'circle', x: 170, y: 150, radius: 25 },
                    { type: 'rectangle', x: 200, y: 180, width: 15, height: 100 },
                    { type: 'rectangle', x: 80, y: 200, width: 120, height: 15 },
                    { type: 'circle', x: 120, y: 250, radius: 20 },
                    { type: 'rectangle', x: 160, y: 280, width: 80, height: 15 },
                    { type: 'rectangle', x: 240, y: 295, width: 15, height: 85 },
                    { type: 'circle', x: 300, y: 320, radius: 18 },
                    { type: 'rectangle', x: 280, y: 250, width: 80, height: 15 }
                ]
            }
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
        const baseTimeLimit = 30;
        const timeIncrease = Math.floor((levelNumber - 10) / 2) * 5;
        const timeLimit = Math.min(baseTimeLimit + timeIncrease, 60);
        
        const numObstacles = Math.min(3 + Math.floor((levelNumber - 10) / 2), 12);
        const obstacles = [];
        
        // Generate random obstacles
        for (let i = 0; i < numObstacles; i++) {
            const obstacleType = Math.random() < 0.6 ? 'rectangle' : 'circle';
            
            if (obstacleType === 'rectangle') {
                obstacles.push({
                    type: 'rectangle',
                    x: Math.random() * 300 + 50,
                    y: Math.random() * 300 + 50,
                    width: Math.random() * 80 + 20,
                    height: Math.random() * 80 + 20
                });
            } else {
                obstacles.push({
                    type: 'circle',
                    x: Math.random() * 300 + 100,
                    y: Math.random() * 300 + 100,
                    radius: Math.random() * 30 + 15
                });
            }
        }
        
        return {
            level: levelNumber,
            timeLimit: timeLimit,
            ballStart: { 
                x: Math.random() * 100 + 50, 
                y: Math.random() * 100 + 50 
            },
            hole: { 
                x: Math.random() * 100 + 300, 
                y: Math.random() * 100 + 300, 
                radius: 25 
            },
            obstacles: obstacles
        };
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