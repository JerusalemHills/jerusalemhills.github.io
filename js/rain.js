// Create a canvas element for the raindrop animation
const canvas = document.createElement('canvas');
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.pointerEvents = 'none'; // Allows clicks to pass through to the website
canvas.style.zIndex = '9999'; // Ensures the canvas is on top
document.body.appendChild(canvas);

// Set canvas size to match window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Get 2D rendering context
const ctx = canvas.getContext('2d');

// Raindrop properties
const raindrops = [];
const raindropCount = 100; // Number of raindrops
const raindropColor = 'rgba(173, 216, 230, 0.8)'; // Light blue with slight transparency
const maxSpeed = 5;
const maxSize = 10;

// Raindrop class
class Raindrop {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width; // Random x position
        this.y = Math.random() * -canvas.height; // Start above the screen
        this.size = Math.random() * maxSize + 5; // Random size between 5 and 15
        this.speed = Math.random() * maxSpeed + 2; // Random speed between 2 and 7
    }

    update() {
        this.y += this.speed; // Move down
        if (this.y > canvas.height + this.size) {
            this.reset(); // Reset when it falls off the bottom
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2); // Draw circular raindrop
        ctx.fillStyle = raindropColor;
        ctx.fill();
        ctx.closePath();
    }
}

// Initialize raindrops
for (let i = 0; i < raindropCount; i++) {
    raindrops.push(new Raindrop());
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    raindrops.forEach(raindrop => {
        raindrop.update();
        raindrop.draw();
    });
    requestAnimationFrame(animate);
}

// Start animation
animate();