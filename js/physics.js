// Physics engine for the Balance Ball game

class Physics {
    constructor() {
        this.gravity = 0.5;
        this.friction = 0.98;
        this.bounce = 0.7;
        this.maxVelocity = 15;
    }

    // Apply gravity based on device tilt
    applyGravity(ball, tiltX, tiltY) {
        const gravityStrength = this.gravity;
        
        // Convert tilt to acceleration - simulate real gravity
        // When device tilts right (positive tiltX), ball should roll right
        // When device tilts forward/down (positive tiltY), ball should roll down
        ball.acceleration.x = tiltX * gravityStrength;
        ball.acceleration.y = tiltY * gravityStrength;
        
        // Apply acceleration to velocity
        ball.velocity.x += ball.acceleration.x;
        ball.velocity.y += ball.acceleration.y;
        
        // Limit maximum velocity
        ball.velocity.x = Utils.clamp(ball.velocity.x, -this.maxVelocity, this.maxVelocity);
        ball.velocity.y = Utils.clamp(ball.velocity.y, -this.maxVelocity, this.maxVelocity);
        
        // Apply friction
        ball.velocity.x *= this.friction;
        ball.velocity.y *= this.friction;
    }

    // Update ball position
    updatePosition(ball) {
        ball.x += ball.velocity.x;
        ball.y += ball.velocity.y;
    }

    // Handle collision with walls
    handleWallCollisions(ball, canvasWidth, canvasHeight) {
        let collided = false;
        
        // Left wall
        if (ball.x - ball.radius < 0) {
            ball.x = ball.radius;
            ball.velocity.x = -ball.velocity.x * this.bounce;
            collided = true;
        }
        
        // Right wall
        if (ball.x + ball.radius > canvasWidth) {
            ball.x = canvasWidth - ball.radius;
            ball.velocity.x = -ball.velocity.x * this.bounce;
            collided = true;
        }
        
        // Top wall
        if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
            ball.velocity.y = -ball.velocity.y * this.bounce;
            collided = true;
        }
        
        // Bottom wall
        if (ball.y + ball.radius > canvasHeight) {
            ball.y = canvasHeight - ball.radius;
            ball.velocity.y = -ball.velocity.y * this.bounce;
            collided = true;
        }
        
        return collided;
    }

    // Check collision between ball and circular objects (holes, obstacles)
    checkCircleCollision(ball, circle) {
        const distance = Utils.distance(ball.x, ball.y, circle.x, circle.y);
        return distance < (ball.radius + circle.radius);
    }

    // Check collision between ball and rectangular obstacles
    checkRectCollision(ball, rect) {
        // Find closest point on rectangle to ball center
        const closestX = Utils.clamp(ball.x, rect.x, rect.x + rect.width);
        const closestY = Utils.clamp(ball.y, rect.y, rect.y + rect.height);
        
        // Calculate distance from ball center to closest point
        const distance = Utils.distance(ball.x, ball.y, closestX, closestY);
        
        return distance < ball.radius;
    }

    // Handle collision with rectangular obstacles
    handleRectCollision(ball, rect) {
        // Find overlap
        const overlapLeft = (ball.x + ball.radius) - rect.x;
        const overlapRight = (rect.x + rect.width) - (ball.x - ball.radius);
        const overlapTop = (ball.y + ball.radius) - rect.y;
        const overlapBottom = (rect.y + rect.height) - (ball.y - ball.radius);
        
        // Find minimum overlap to determine collision side
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        
        if (minOverlap === overlapLeft) {
            // Hit left side
            ball.x = rect.x - ball.radius;
            ball.velocity.x = -Math.abs(ball.velocity.x) * this.bounce;
        } else if (minOverlap === overlapRight) {
            // Hit right side
            ball.x = rect.x + rect.width + ball.radius;
            ball.velocity.x = Math.abs(ball.velocity.x) * this.bounce;
        } else if (minOverlap === overlapTop) {
            // Hit top side
            ball.y = rect.y - ball.radius;
            ball.velocity.y = -Math.abs(ball.velocity.y) * this.bounce;
        } else if (minOverlap === overlapBottom) {
            // Hit bottom side
            ball.y = rect.y + rect.height + ball.radius;
            ball.velocity.y = Math.abs(ball.velocity.y) * this.bounce;
        }
    }

    // Handle collision with circular obstacles
    handleCircleCollision(ball, obstacle) {
        const dx = ball.x - obstacle.x;
        const dy = ball.y - obstacle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // Normalize collision vector
            const nx = dx / distance;
            const ny = dy / distance;
            
            // Separate the objects
            const overlap = ball.radius + obstacle.radius - distance;
            ball.x += nx * overlap * 0.5;
            ball.y += ny * overlap * 0.5;
            
            // Reflect velocity
            const dotProduct = ball.velocity.x * nx + ball.velocity.y * ny;
            ball.velocity.x -= 2 * dotProduct * nx * this.bounce;
            ball.velocity.y -= 2 * dotProduct * ny * this.bounce;
        }
    }

    // Check if ball has stopped moving (for hole detection)
    isBallStopped(ball, threshold = 0.1) {
        const speed = Math.sqrt(ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y);
        return speed < threshold;
    }

    // Update physics for one frame
    update(ball, obstacles, canvasWidth, canvasHeight, tiltX, tiltY) {
        // Apply gravity based on device tilt
        this.applyGravity(ball, tiltX, tiltY);
        
        // Update position
        this.updatePosition(ball);
        
        // Handle wall collisions
        const wallCollision = this.handleWallCollisions(ball, canvasWidth, canvasHeight);
        
        // Handle obstacle collisions
        let obstacleCollision = false;
        obstacles.forEach(obstacle => {
            if (obstacle.type === 'rectangle' && this.checkRectCollision(ball, obstacle)) {
                this.handleRectCollision(ball, obstacle);
                obstacleCollision = true;
            } else if (obstacle.type === 'circle' && this.checkCircleCollision(ball, obstacle)) {
                this.handleCircleCollision(ball, obstacle);
                obstacleCollision = true;
            }
        });
        
        return {
            wallCollision,
            obstacleCollision
        };
    }
}

// Export for use in other modules
window.Physics = Physics;