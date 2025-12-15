// Astrolytix - Realistic Starfield & Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Initialize starfield
    initStarfield();

    // Initialize constellation network overlay
    initConstellation();

    // Smooth scroll for navigation links
    initSmoothScroll();

    // Navbar background on scroll
    initNavbarScroll();

    // Animate elements on scroll
    initScrollAnimations();

    // Initialize image carousels
    initCarousels();

    // Initialize feature detail visibility
    initFeatureDetailAnimations();
});

// Realistic Canvas Starfield
function initStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [];
    let shootingStars = [];
    let animationId;

    // Sky cycle settings - more dramatic transitions
    const skyPhases = [
        { name: 'deepNight', duration: 8000, starVisibility: 1.0,
          colors: { top: { r: 5, g: 5, b: 15 }, bottom: { r: 15, g: 15, b: 35 } } },
        { name: 'night', duration: 6000, starVisibility: 1.0,
          colors: { top: { r: 15, g: 10, b: 35 }, bottom: { r: 30, g: 25, b: 55 } } },
        { name: 'violet', duration: 6000, starVisibility: 0.8,
          colors: { top: { r: 40, g: 20, b: 70 }, bottom: { r: 70, g: 40, b: 100 } } },
        { name: 'purple', duration: 5000, starVisibility: 0.6,
          colors: { top: { r: 60, g: 30, b: 90 }, bottom: { r: 90, g: 50, b: 120 } } },
        { name: 'preDawn', duration: 5000, starVisibility: 0.4,
          colors: { top: { r: 40, g: 50, b: 100 }, bottom: { r: 70, g: 80, b: 130 } } },
        { name: 'dawn', duration: 6000, starVisibility: 0.15,
          colors: { top: { r: 50, g: 70, b: 120 }, bottom: { r: 100, g: 120, b: 160 } } },
        { name: 'preDawn', duration: 5000, starVisibility: 0.4,
          colors: { top: { r: 40, g: 50, b: 100 }, bottom: { r: 70, g: 80, b: 130 } } },
        { name: 'purple', duration: 5000, starVisibility: 0.6,
          colors: { top: { r: 60, g: 30, b: 90 }, bottom: { r: 90, g: 50, b: 120 } } },
        { name: 'violet', duration: 6000, starVisibility: 0.8,
          colors: { top: { r: 40, g: 20, b: 70 }, bottom: { r: 70, g: 40, b: 100 } } },
        { name: 'night', duration: 6000, starVisibility: 1.0,
          colors: { top: { r: 15, g: 10, b: 35 }, bottom: { r: 30, g: 25, b: 55 } } },
    ];

    let skyTime = 0;
    let currentPhaseIndex = 0;
    let phaseProgress = 0;

    // Star colors for realism (slight color variations)
    const starColors = [
        { r: 255, g: 255, b: 255 },  // Pure white
        { r: 255, g: 250, b: 240 },  // Warm white
        { r: 240, g: 248, b: 255 },  // Cool white (blue tint)
        { r: 255, g: 255, b: 224 },  // Light yellow
        { r: 255, g: 240, b: 230 },  // Slight orange
        { r: 230, g: 240, b: 255 },  // Blue-ish
    ];

    // Resize canvas to fill window
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        createStars();
    }

    // Create star field
    function createStars() {
        stars = [];
        // Calculate star density based on screen size
        const area = width * height;
        const starCount = Math.floor(area / 2500); // ~1 star per 2500px²

        for (let i = 0; i < starCount; i++) {
            stars.push(createStar());
        }
    }

    // Create individual star
    function createStar() {
        const color = starColors[Math.floor(Math.random() * starColors.length)];
        // Most stars are small, few are bright
        const sizeRand = Math.random();
        let size;
        if (sizeRand < 0.7) {
            size = Math.random() * 0.8 + 0.3; // Small stars (0.3-1.1)
        } else if (sizeRand < 0.95) {
            size = Math.random() * 1 + 1; // Medium stars (1-2)
        } else {
            size = Math.random() * 1.5 + 2; // Bright stars (2-3.5)
        }

        return {
            x: Math.random() * width,
            y: Math.random() * height,
            size: size,
            baseSize: size,
            color: color,
            alpha: Math.random() * 0.5 + 0.5,
            baseAlpha: Math.random() * 0.5 + 0.5,
            twinkleSpeed: Math.random() * 0.003 + 0.001,
            twinkleOffset: Math.random() * Math.PI * 2,
            // Some stars have glow
            hasGlow: size > 1.5 && Math.random() > 0.5
        };
    }

    // Create shooting star
    function createShootingStar() {
        // Random starting edge (top or sides)
        let startX, startY, angle;
        const edge = Math.random();

        if (edge < 0.6) {
            // Start from top
            startX = Math.random() * width;
            startY = -10;
            angle = Math.PI / 2 + (Math.random() - 0.5) * 1.2; // Downward with variation
        } else if (edge < 0.8) {
            // Start from left
            startX = -10;
            startY = Math.random() * (height * 0.4);
            angle = Math.random() * 0.8 + 0.2; // Rightward-down
        } else {
            // Start from right
            startX = width + 10;
            startY = Math.random() * (height * 0.4);
            angle = Math.PI - (Math.random() * 0.8 + 0.2); // Leftward-down
        }

        return {
            x: startX,
            y: startY,
            startX: startX,
            startY: startY,
            length: Math.random() * 120 + 80,
            speed: Math.random() * 20 + 5, // Wider speed range (5-25)
            angle: angle,
            alpha: 1,
            active: true
        };
    }

    // Get current sky state with smooth interpolation
    function getSkyState(deltaTime) {
        // Clamp deltaTime to avoid huge jumps
        const clampedDelta = Math.min(deltaTime, 100);

        const currentPhase = skyPhases[currentPhaseIndex];
        phaseProgress += clampedDelta / currentPhase.duration;

        // Handle phase transition smoothly
        while (phaseProgress >= 1) {
            phaseProgress -= 1;
            currentPhaseIndex = (currentPhaseIndex + 1) % skyPhases.length;
        }

        const nextPhaseIndex = (currentPhaseIndex + 1) % skyPhases.length;
        const currentPh = skyPhases[currentPhaseIndex];
        const nextPhase = skyPhases[nextPhaseIndex];

        // Linear interpolation (no easing jump)
        const t = phaseProgress;

        // Interpolate colors
        const topColor = {
            r: Math.round(currentPh.colors.top.r + (nextPhase.colors.top.r - currentPh.colors.top.r) * t),
            g: Math.round(currentPh.colors.top.g + (nextPhase.colors.top.g - currentPh.colors.top.g) * t),
            b: Math.round(currentPh.colors.top.b + (nextPhase.colors.top.b - currentPh.colors.top.b) * t)
        };
        const bottomColor = {
            r: Math.round(currentPh.colors.bottom.r + (nextPhase.colors.bottom.r - currentPh.colors.bottom.r) * t),
            g: Math.round(currentPh.colors.bottom.g + (nextPhase.colors.bottom.g - currentPh.colors.bottom.g) * t),
            b: Math.round(currentPh.colors.bottom.b + (nextPhase.colors.bottom.b - currentPh.colors.bottom.b) * t)
        };

        const starVisibility = currentPh.starVisibility + (nextPhase.starVisibility - currentPh.starVisibility) * t;

        return { topColor, bottomColor, starVisibility };
    }

    // Draw sky gradient
    function drawSky(skyState) {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, `rgb(${skyState.topColor.r}, ${skyState.topColor.g}, ${skyState.topColor.b})`);
        gradient.addColorStop(1, `rgb(${skyState.bottomColor.r}, ${skyState.bottomColor.g}, ${skyState.bottomColor.b})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    // Draw a single star
    function drawStar(star, time, starVisibility) {
        // Calculate twinkle
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
        const alpha = (star.baseAlpha + twinkle * 0.3) * starVisibility;
        const size = star.baseSize + twinkle * 0.2;

        // Skip very dim stars during dawn
        if (alpha < 0.1) return;

        ctx.beginPath();

        // Draw glow for bright stars
        if (star.hasGlow) {
            const gradient = ctx.createRadialGradient(
                star.x, star.y, 0,
                star.x, star.y, size * 4
            );
            gradient.addColorStop(0, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${alpha * 0.3})`);
            gradient.addColorStop(0.5, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${alpha * 0.1})`);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.arc(star.x, star.y, size * 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
        }

        // Draw star core
        ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${alpha})`;
        ctx.fill();

        // Draw cross flare for very bright stars
        if (star.baseSize > 2) {
            ctx.strokeStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${alpha * 0.4})`;
            ctx.lineWidth = 0.5;
            const flareSize = size * 3;

            ctx.beginPath();
            ctx.moveTo(star.x - flareSize, star.y);
            ctx.lineTo(star.x + flareSize, star.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(star.x, star.y - flareSize);
            ctx.lineTo(star.x, star.y + flareSize);
            ctx.stroke();
        }
    }

    // Draw shooting star
    function drawShootingStar(star) {
        if (!star.active) return;

        const tailX = star.x - Math.cos(star.angle) * star.length;
        const tailY = star.y - Math.sin(star.angle) * star.length;

        const gradient = ctx.createLinearGradient(tailX, tailY, star.x, star.y);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.7, `rgba(255, 255, 255, ${star.alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${star.alpha})`);

        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(star.x, star.y);
        ctx.stroke();

        // Bright head
        ctx.beginPath();
        ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();
    }

    // Update shooting star position
    function updateShootingStar(star) {
        if (!star.active) return;

        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;

        // Fade out as it travels
        const distance = Math.sqrt(
            Math.pow(star.x - star.startX, 2) +
            Math.pow(star.y - star.startY, 2)
        );

        if (distance > 300) {
            star.alpha -= 0.05;
        }

        // Deactivate when faded or off screen
        if (star.alpha <= 0 || star.x > width + 100 || star.y > height + 100) {
            star.active = false;
        }
    }

    // Main animation loop
    let lastShootingStarTime = 0;
    let lastFrameTime = 0;

    function animate(time) {
        const deltaTime = lastFrameTime ? time - lastFrameTime : 16;
        lastFrameTime = time;

        // Get current sky state and draw sky
        const skyState = getSkyState(deltaTime);
        drawSky(skyState);

        // Draw all stars with current visibility
        stars.forEach(star => drawStar(star, time, skyState.starVisibility));

        // Handle shooting stars
        // Spawn new shooting star occasionally (every 3-8 seconds)
        if (time - lastShootingStarTime > (Math.random() * 5000 + 3000)) {
            if (Math.random() > 0.3) { // 70% chance
                shootingStars.push(createShootingStar());
                lastShootingStarTime = time;
            }
        }

        // Update and draw shooting stars
        shootingStars.forEach(star => {
            updateShootingStar(star);
            drawShootingStar(star);
        });

        // Clean up inactive shooting stars
        shootingStars = shootingStars.filter(star => star.active);

        animationId = requestAnimationFrame(animate);
    }

    // Handle resize
    window.addEventListener('resize', () => {
        resize();
    });

    // Initialize
    resize();
    animate(0);

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(animationId);
    });
}

// Constellation Network Overlay - Flowing energy between star patterns
function initConstellation() {
    const canvas = document.getElementById('constellation');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let animationId;

    // Color theme - cyan/blue energy
    const colors = {
        node: { r: 79, g: 195, b: 247 },
        line: { r: 41, g: 182, b: 246 },
        energy: { r: 120, g: 220, b: 255 }
    };

    // Configuration
    const config = {
        constellationCount: 5,          // Total constellation patterns on screen
        activeDuration: 12000,          // How long each constellation stays active (ms)
        transitionDuration: 2000,       // Energy flow transition time (ms)
        minNodes: 4,
        maxNodes: 6,
        spread: 140                     // Node spread within constellation
    };

    // Constellation class
    class Constellation {
        constructor(centerX, centerY, nodeCount) {
            this.centerX = centerX;
            this.centerY = centerY;
            this.nodes = [];
            this.connections = [];
            this.activity = 0;          // 0 = dormant, 1 = fully active
            this.targetActivity = 0;
            this.energyPhase = 0;       // For flowing energy animation along lines

            this.generateNodes(nodeCount);
            this.generateConnections();
        }

        generateNodes(count) {
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
                const distance = config.spread * (0.4 + Math.random() * 0.6);
                this.nodes.push({
                    x: this.centerX + Math.cos(angle) * distance,
                    y: this.centerY + Math.sin(angle) * distance,
                    phase: Math.random() * Math.PI * 2
                });
            }
        }

        generateConnections() {
            const n = this.nodes.length;
            // Create chain
            for (let i = 0; i < n - 1; i++) {
                this.connections.push({ a: i, b: i + 1, energyPos: 0 });
            }
            // Add cross connections for interesting shapes
            if (n >= 4) {
                this.connections.push({ a: 0, b: Math.floor(n / 2), energyPos: 0 });
            }
            if (n >= 5) {
                this.connections.push({ a: 1, b: n - 1, energyPos: 0 });
            }
        }

        update(deltaTime, isActive) {
            // Update activity level
            this.targetActivity = isActive ? 1 : 0;
            const lerpSpeed = isActive ? 0.03 : 0.015;
            this.activity += (this.targetActivity - this.activity) * lerpSpeed;

            // Update energy flow along connections when active
            if (this.activity > 0.1) {
                this.energyPhase += deltaTime * 0.002;
                this.connections.forEach((conn, idx) => {
                    conn.energyPos = (this.energyPhase + idx * 0.3) % 1;
                });
            }
        }

        draw(ctx, time) {
            if (this.activity < 0.02) return;

            const pulse = Math.sin(time * 0.003) * 0.2 + 0.8;
            const alpha = this.activity * pulse;

            // Draw connections with flowing energy
            for (const conn of this.connections) {
                const nodeA = this.nodes[conn.a];
                const nodeB = this.nodes[conn.b];

                // Base line (dim)
                ctx.beginPath();
                ctx.strokeStyle = `rgba(${colors.line.r}, ${colors.line.g}, ${colors.line.b}, ${alpha * 0.3})`;
                ctx.lineWidth = 1;
                ctx.moveTo(nodeA.x, nodeA.y);
                ctx.lineTo(nodeB.x, nodeB.y);
                ctx.stroke();

                // Flowing energy pulse along the line
                if (this.activity > 0.3) {
                    const energyAlpha = alpha * 0.8;
                    const ex = nodeA.x + (nodeB.x - nodeA.x) * conn.energyPos;
                    const ey = nodeA.y + (nodeB.y - nodeA.y) * conn.energyPos;

                    // Energy glow traveling along line
                    const gradient = ctx.createRadialGradient(ex, ey, 0, ex, ey, 25);
                    gradient.addColorStop(0, `rgba(${colors.energy.r}, ${colors.energy.g}, ${colors.energy.b}, ${energyAlpha})`);
                    gradient.addColorStop(0.5, `rgba(${colors.line.r}, ${colors.line.g}, ${colors.line.b}, ${energyAlpha * 0.4})`);
                    gradient.addColorStop(1, 'transparent');

                    ctx.beginPath();
                    ctx.fillStyle = gradient;
                    ctx.arc(ex, ey, 25, 0, Math.PI * 2);
                    ctx.fill();

                    // Bright line segment near energy point
                    const segStart = Math.max(0, conn.energyPos - 0.15);
                    const segEnd = Math.min(1, conn.energyPos + 0.15);
                    const sx = nodeA.x + (nodeB.x - nodeA.x) * segStart;
                    const sy = nodeA.y + (nodeB.y - nodeA.y) * segStart;
                    const endX = nodeA.x + (nodeB.x - nodeA.x) * segEnd;
                    const endY = nodeA.y + (nodeB.y - nodeA.y) * segEnd;

                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(${colors.energy.r}, ${colors.energy.g}, ${colors.energy.b}, ${energyAlpha})`;
                    ctx.lineWidth = 2;
                    ctx.shadowColor = `rgba(${colors.energy.r}, ${colors.energy.g}, ${colors.energy.b}, 0.8)`;
                    ctx.shadowBlur = 8;
                    ctx.moveTo(sx, sy);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }
            }

            // Draw nodes
            for (const node of this.nodes) {
                const nodePulse = Math.sin(time * 0.004 + node.phase) * 0.3 + 0.7;
                const nodeAlpha = alpha * nodePulse;

                // Outer glow
                ctx.beginPath();
                ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${colors.node.r}, ${colors.node.g}, ${colors.node.b}, ${nodeAlpha * 0.25})`;
                ctx.shadowColor = `rgba(${colors.node.r}, ${colors.node.g}, ${colors.node.b}, 0.5)`;
                ctx.shadowBlur = 12;
                ctx.fill();

                // Core
                ctx.beginPath();
                ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${colors.node.r}, ${colors.node.g}, ${colors.node.b}, ${nodeAlpha})`;
                ctx.shadowBlur = 0;
                ctx.fill();

                // Bright center
                ctx.beginPath();
                ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${nodeAlpha * 0.9})`;
                ctx.fill();
            }
        }
    }

    let constellations = [];
    let activeIndex = 0;
    let lastSwitchTime = 0;
    let energyTrail = null;  // For drawing energy flow between constellations

    // Resize and initialize
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initConstellations();
    }

    function initConstellations() {
        constellations = [];

        // Distribute constellations across screen
        const positions = [
            { x: width * 0.2, y: height * 0.25 },
            { x: width * 0.75, y: height * 0.2 },
            { x: width * 0.5, y: height * 0.5 },
            { x: width * 0.15, y: height * 0.7 },
            { x: width * 0.8, y: height * 0.75 }
        ];

        for (let i = 0; i < config.constellationCount; i++) {
            const pos = positions[i];
            // Add some randomness
            const cx = pos.x + (Math.random() - 0.5) * 100;
            const cy = pos.y + (Math.random() - 0.5) * 80;
            const nodeCount = config.minNodes + Math.floor(Math.random() * (config.maxNodes - config.minNodes + 1));
            constellations.push(new Constellation(cx, cy, nodeCount));
        }

        // Start first constellation as active
        activeIndex = 0;
        lastSwitchTime = performance.now();
    }

    // Draw energy trail between constellations during transition
    function drawEnergyTrail(ctx, fromConst, toConst, progress) {
        if (!fromConst || !toConst || progress <= 0 || progress >= 1) return;

        const fromX = fromConst.centerX;
        const fromY = fromConst.centerY;
        const toX = toConst.centerX;
        const toY = toConst.centerY;

        // Energy position along the path
        const ex = fromX + (toX - fromX) * progress;
        const ey = fromY + (toY - fromY) * progress;

        // Draw fading trail
        const trailGradient = ctx.createLinearGradient(fromX, fromY, ex, ey);
        trailGradient.addColorStop(0, 'transparent');
        trailGradient.addColorStop(0.7, `rgba(${colors.energy.r}, ${colors.energy.g}, ${colors.energy.b}, 0.15)`);
        trailGradient.addColorStop(1, `rgba(${colors.energy.r}, ${colors.energy.g}, ${colors.energy.b}, 0.4)`);

        ctx.beginPath();
        ctx.strokeStyle = trailGradient;
        ctx.lineWidth = 2;
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        // Energy ball
        const gradient = ctx.createRadialGradient(ex, ey, 0, ex, ey, 30);
        gradient.addColorStop(0, `rgba(255, 255, 255, 0.9)`);
        gradient.addColorStop(0.2, `rgba(${colors.energy.r}, ${colors.energy.g}, ${colors.energy.b}, 0.8)`);
        gradient.addColorStop(0.6, `rgba(${colors.line.r}, ${colors.line.g}, ${colors.line.b}, 0.3)`);
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(ex, ey, 30, 0, Math.PI * 2);
        ctx.fill();
    }

    let lastTime = 0;
    let transitionProgress = 0;
    let isTransitioning = false;
    let prevActiveIndex = -1;

    function animate(time) {
        const deltaTime = lastTime ? time - lastTime : 16;
        lastTime = time;

        ctx.clearRect(0, 0, width, height);

        // Check if it's time to switch active constellation
        const timeSinceSwitch = time - lastSwitchTime;

        if (timeSinceSwitch > config.activeDuration && !isTransitioning) {
            // Start transition to next constellation
            isTransitioning = true;
            transitionProgress = 0;
            prevActiveIndex = activeIndex;
            activeIndex = (activeIndex + 1) % constellations.length;
        }

        // Handle transition
        if (isTransitioning) {
            transitionProgress += deltaTime / config.transitionDuration;
            if (transitionProgress >= 1) {
                transitionProgress = 0;
                isTransitioning = false;
                lastSwitchTime = time;
                prevActiveIndex = -1;
            }
        }

        // Update all constellations
        constellations.forEach((c, i) => {
            const isActive = (i === activeIndex && !isTransitioning) ||
                           (i === activeIndex && isTransitioning && transitionProgress > 0.5);
            c.update(deltaTime, isActive);
        });

        // Draw all constellations
        constellations.forEach(c => c.draw(ctx, time));

        // Draw energy trail during transition
        if (isTransitioning && prevActiveIndex >= 0) {
            drawEnergyTrail(
                ctx,
                constellations[prevActiveIndex],
                constellations[activeIndex],
                transitionProgress
            );
        }

        animationId = requestAnimationFrame(animate);
    }

    // Handle resize
    window.addEventListener('resize', resize);

    // Initialize
    resize();
    animate(0);

    // Cleanup
    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(animationId);
    });
}

// Smooth scrolling for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80; // Account for fixed header
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Navbar background changes on scroll
function initNavbarScroll() {
    const header = document.querySelector('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.style.background = 'rgba(15, 12, 41, 0.98)';
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        } else {
            header.style.background = 'rgba(15, 12, 41, 0.9)';
            header.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });
}

// Animate elements when they come into view
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe feature tiles
    document.querySelectorAll('.feature-tile').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.05}s, transform 0.6s ease ${index * 0.05}s`;
        observer.observe(card);
    });

    // Add animation class styles
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

// Initialize feature detail section animations
function initFeatureDetailAnimations() {
    const sections = document.querySelectorAll('.feature-detail');

    // Add animate-ready class after a small delay so sections are visible by default if JS fails
    setTimeout(() => {
        sections.forEach(section => {
            section.classList.add('animate-ready');
        });
    }, 100);

    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
}

// Initialize image carousels in phone mockups
function initCarousels() {
    const carousels = document.querySelectorAll('.screen-carousel');

    carousels.forEach(carousel => {
        const imagesAttr = carousel.dataset.images;
        if (!imagesAttr) return;

        const imageNames = imagesAttr.split(',');
        if (imageNames.length <= 1) return;

        // Create all images
        const images = [];
        imageNames.forEach((name, index) => {
            if (index === 0) {
                // First image already exists
                const existingImg = carousel.querySelector('.carousel-image');
                if (existingImg) {
                    images.push(existingImg);
                }
            } else {
                const img = document.createElement('img');
                img.src = `pics4site/${name.trim()}`;
                img.alt = 'App Screenshot';
                img.className = 'carousel-image';
                carousel.appendChild(img);
                images.push(img);
            }
        });

        // Create indicators
        if (images.length > 1) {
            const indicatorsContainer = document.createElement('div');
            indicatorsContainer.className = 'carousel-indicators';

            images.forEach((_, index) => {
                const indicator = document.createElement('div');
                indicator.className = 'carousel-indicator' + (index === 0 ? ' active' : '');
                indicator.addEventListener('click', () => {
                    goToSlide(index);
                });
                indicatorsContainer.appendChild(indicator);
            });

            carousel.appendChild(indicatorsContainer);

            // Auto-rotate carousel
            let currentIndex = 0;
            const indicators = indicatorsContainer.querySelectorAll('.carousel-indicator');

            function goToSlide(index) {
                images[currentIndex].classList.remove('active');
                indicators[currentIndex].classList.remove('active');
                currentIndex = index;
                images[currentIndex].classList.add('active');
                indicators[currentIndex].classList.add('active');
            }

            function nextSlide() {
                const nextIndex = (currentIndex + 1) % images.length;
                goToSlide(nextIndex);
            }

            // Start auto-rotation with random offset to prevent all carousels from being in sync
            const randomDelay = Math.random() * 2000;
            setTimeout(() => {
                setInterval(nextSlide, 4000);
            }, randomDelay);
        }
    });
}
