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

// Constellation Network Overlay - Organic star patterns with flowing lines
function initConstellation() {
    const canvas = document.getElementById('constellation');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let animationId;

    // Color - cyan/blue glow
    const color = { r: 79, g: 195, b: 247 };

    // Configuration
    const config = {
        maxGroups: 3,
        minNodes: 4,
        maxNodes: 5,
        nodeSpread: 110,
        spawnInterval: 5000,
        lineFadeInTime: 3000,
        lineFadeOutTime: 4000,
        lineStagger: 2000,
        maxBrightLines: 3,
        lineVisibleTime: 4000
    };

    // Helper: calculate angle in degrees between two vectors at a point
    function getAngleAtNode(prevPrev, prev, next) {
        // Vector from prev back to prevPrev
        const v1x = prevPrev.x - prev.x;
        const v1y = prevPrev.y - prev.y;
        // Vector from prev to next
        const v2x = next.x - prev.x;
        const v2y = next.y - prev.y;

        // Dot product and magnitudes
        const dot = v1x * v2x + v1y * v2y;
        const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
        const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);

        if (mag1 === 0 || mag2 === 0) return 180;

        const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
        return Math.acos(cosAngle) * 180 / Math.PI;
    }

    // Check if angle is valid per rules
    function isAngleValid(angleDeg, sharpUsed) {
        // <45: too sharp, not allowed
        if (angleDeg < 45) return { valid: false };
        // 45-85: only 1 allowed per formation
        if (angleDeg >= 45 && angleDeg < 85) {
            if (sharpUsed) return { valid: false };
            return { valid: true, usesSharp: true };
        }
        // 85-95: prohibited (near right angle)
        if (angleDeg >= 85 && angleDeg <= 95) return { valid: false };
        // 95-175: allowed (obtuse)
        if (angleDeg > 95 && angleDeg <= 175) return { valid: true };
        // >175: too straight, not allowed
        return { valid: false };
    }

    // A single star group - CHAIN structure with angle constraints
    class StarGroup {
        constructor(x, y, nodeCount) {
            this.nodes = [];
            this.connections = [];
            this.birthTime = performance.now();
            this.dead = false;

            this.generateChain(x, y, nodeCount);
            this.generateConnections();
        }

        generateChain(cx, cy, count) {
            // First node
            this.nodes.push({
                x: cx,
                y: cy,
                phase: Math.random() * Math.PI * 2,
                opacity: 0
            });

            if (count < 2) return;

            // Second node - any direction
            const firstAngle = Math.random() * Math.PI * 2;
            const firstDist = config.nodeSpread * (0.7 + Math.random() * 0.5);
            this.nodes.push({
                x: cx + Math.cos(firstAngle) * firstDist,
                y: cy + Math.sin(firstAngle) * firstDist,
                phase: Math.random() * Math.PI * 2,
                opacity: 0
            });

            let sharpAngleUsed = false;

            // Build chain: each node connects only to previous
            for (let i = 2; i < count; i++) {
                const prevNode = this.nodes[i - 1];
                const prevPrevNode = this.nodes[i - 2];

                let bestPosition = null;
                let attempts = 0;

                while (!bestPosition && attempts < 100) {
                    attempts++;

                    // Random direction and distance for next node
                    const angle = Math.random() * Math.PI * 2;
                    const dist = config.nodeSpread * (0.7 + Math.random() * 0.5);

                    const candidate = {
                        x: prevNode.x + Math.cos(angle) * dist,
                        y: prevNode.y + Math.sin(angle) * dist
                    };

                    // Calculate angle at prevNode
                    const jointAngle = getAngleAtNode(prevPrevNode, prevNode, candidate);
                    const check = isAngleValid(jointAngle, sharpAngleUsed);

                    if (check.valid) {
                        bestPosition = candidate;
                        if (check.usesSharp) sharpAngleUsed = true;
                    }
                }

                if (bestPosition) {
                    this.nodes.push({
                        x: bestPosition.x,
                        y: bestPosition.y,
                        phase: Math.random() * Math.PI * 2,
                        opacity: 0
                    });
                }
            }
        }

        generateConnections() {
            // Simple chain - connect each node to the next in sequence
            for (let i = 0; i < this.nodes.length - 1; i++) {
                this.connections.push({
                    a: i,
                    b: i + 1,
                    order: i,
                    opacity: 0,
                    state: 'waiting',
                    stateStartTime: 0
                });
            }
        }

        update(time) {
            const age = time - this.birthTime;

            // Count lines in each state
            let brightCount = 0;
            let oldestBrightIdx = -1;
            let oldestBrightTime = Infinity;

            for (let i = 0; i < this.connections.length; i++) {
                const conn = this.connections[i];
                if (conn.state === 'bright') {
                    brightCount++;
                    if (conn.stateStartTime < oldestBrightTime) {
                        oldestBrightTime = conn.stateStartTime;
                        oldestBrightIdx = i;
                    }
                }
            }

            // Update each connection's lifecycle
            for (let i = 0; i < this.connections.length; i++) {
                const conn = this.connections[i];
                const lineStartTime = conn.order * config.lineStagger;

                if (conn.state === 'waiting') {
                    // Start fading in when it's time
                    if (age >= lineStartTime) {
                        conn.state = 'fadingIn';
                        conn.stateStartTime = time;
                    }
                }
                else if (conn.state === 'fadingIn') {
                    // Gradually fade in
                    const fadeProgress = (time - conn.stateStartTime) / config.lineFadeInTime;
                    conn.opacity = Math.min(1, fadeProgress);

                    if (fadeProgress >= 1) {
                        conn.state = 'bright';
                        conn.stateStartTime = time;
                    }
                }
                else if (conn.state === 'bright') {
                    conn.opacity = 1;

                    // Check if this line should start fading
                    const brightDuration = time - conn.stateStartTime;
                    const shouldFade = brightDuration > config.lineVisibleTime ||
                        (brightCount > config.maxBrightLines && i === oldestBrightIdx);

                    if (shouldFade) {
                        conn.state = 'fadingOut';
                        conn.stateStartTime = time;
                    }
                }
                else if (conn.state === 'fadingOut') {
                    // Gradually fade out
                    const fadeProgress = (time - conn.stateStartTime) / config.lineFadeOutTime;
                    conn.opacity = Math.max(0, 1 - fadeProgress);

                    if (fadeProgress >= 1) {
                        conn.state = 'dead';
                        conn.opacity = 0;
                    }
                }
            }

            // Update node opacities based on connected lines
            for (let i = 0; i < this.nodes.length; i++) {
                let maxConnectedOpacity = 0;
                for (const conn of this.connections) {
                    if (conn.a === i || conn.b === i) {
                        maxConnectedOpacity = Math.max(maxConnectedOpacity, conn.opacity);
                    }
                }
                // Smooth transition
                this.nodes[i].opacity += (maxConnectedOpacity - this.nodes[i].opacity) * 0.08;
            }

            // Group is dead when all connections are dead
            const allDead = this.connections.every(c => c.state === 'dead');
            if (allDead) {
                this.dead = true;
            }
        }

        draw(ctx, time) {
            // Draw connections with subtle energy flow
            for (const conn of this.connections) {
                if (conn.opacity < 0.01) continue;

                const nodeA = this.nodes[conn.a];
                const nodeB = this.nodes[conn.b];
                const baseAlpha = conn.opacity * 0.6;

                // Calculate line length and direction
                const dx = nodeB.x - nodeA.x;
                const dy = nodeB.y - nodeA.y;
                const length = Math.sqrt(dx * dx + dy * dy);

                // Draw line in segments for energy flow effect
                const segments = Math.max(8, Math.floor(length / 12));

                // Subtle glow base (static)
                ctx.beginPath();
                ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${baseAlpha * 0.2})`;
                ctx.lineWidth = 1.5;
                ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`;
                ctx.shadowBlur = 3;
                ctx.moveTo(nodeA.x, nodeA.y);
                ctx.lineTo(nodeB.x, nodeB.y);
                ctx.stroke();
                ctx.shadowBlur = 0;

                // Energy flow - draw segments with varying brightness
                for (let i = 0; i < segments; i++) {
                    const t0 = i / segments;
                    const t1 = (i + 1) / segments;

                    const x0 = nodeA.x + dx * t0;
                    const y0 = nodeA.y + dy * t0;
                    const x1 = nodeA.x + dx * t1;
                    const y1 = nodeA.y + dy * t1;

                    // Position along the line
                    const pos = t0 * length;

                    // Main flowing energy wave (moves along the line)
                    const flowWave = Math.sin((pos * 0.04) - (time * 0.003) + conn.order * 1.5) * 0.5 + 0.5;

                    // Secondary wave (slightly different speed, creates interference)
                    const wave2 = Math.sin((pos * 0.07) - (time * 0.005) + conn.order * 2.7) * 0.5 + 0.5;

                    // Slow breathing wave (whole line pulses gently)
                    const breathe = Math.sin(time * 0.001 + conn.order * 0.8) * 0.5 + 0.5;

                    // Atmospheric shimmer
                    const shimmer = 0.9 + Math.sin(time * 0.015 + pos * 0.12 + conn.order * 4) * 0.1;

                    // Combine: base 0.25 + waves up to 0.75 = range 0.25-1.0 (expanded for more visible flow)
                    const energy = 0.25 + (flowWave * 0.4 + wave2 * 0.2 + breathe * 0.15) * shimmer;

                    const segmentAlpha = baseAlpha * energy;

                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${segmentAlpha})`;
                    ctx.lineWidth = 0.6;
                    ctx.moveTo(x0, y0);
                    ctx.lineTo(x1, y1);
                    ctx.stroke();
                }
            }

            // Draw nodes (smaller to match thinner lines)
            for (const node of this.nodes) {
                if (node.opacity < 0.01) continue;

                const pulse = Math.sin(time * 0.003 + node.phase) * 0.2 + 0.8;
                const nodeAlpha = node.opacity * pulse;

                // Glow
                ctx.beginPath();
                ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${nodeAlpha * 0.25})`;
                ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`;
                ctx.shadowBlur = 6;
                ctx.fill();

                // Core
                ctx.beginPath();
                ctx.arc(node.x, node.y, 1.8, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${nodeAlpha * 0.9})`;
                ctx.shadowBlur = 0;
                ctx.fill();

                // Bright center
                ctx.beginPath();
                ctx.arc(node.x, node.y, 0.8, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${nodeAlpha * 0.85})`;
                ctx.fill();
            }
        }
    }

    let groups = [];
    let lastSpawnTime = 0;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        groups = [];
        lastSpawnTime = 0;
    }

    function spawnGroup(time) {
        const padding = 150;
        const x = padding + Math.random() * (width - padding * 2);
        const y = padding + Math.random() * (height - padding * 2);
        const nodeCount = config.minNodes + Math.floor(Math.random() * (config.maxNodes - config.minNodes + 1));

        groups.push(new StarGroup(x, y, nodeCount));
        lastSpawnTime = time;
    }

    function animate(time) {
        ctx.clearRect(0, 0, width, height);

        // Spawn new groups periodically
        const aliveGroups = groups.filter(g => !g.dead).length;
        if (aliveGroups < config.maxGroups && time - lastSpawnTime > config.spawnInterval) {
            spawnGroup(time);
        }

        // Spawn first group immediately
        if (groups.length === 0) {
            spawnGroup(time);
        }

        // Update and draw groups
        groups.forEach(g => {
            g.update(time);
            g.draw(ctx, time);
        });

        // Remove dead groups
        groups = groups.filter(g => !g.dead);

        animationId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate(0);

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
