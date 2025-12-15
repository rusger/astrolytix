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

// Constellation Network Overlay - Connected nodes with glowing lines
function initConstellation() {
    const canvas = document.getElementById('constellation');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let nodes = [];
    let animationId;

    // Section-specific constellation themes (different "constellations" per section)
    const constellationThemes = [
        { // Hero section - Cosmic blue/cyan
            nodeColor: { r: 79, g: 195, b: 247 },
            lineColor: { r: 41, g: 182, b: 246 }
        },
        { // Features section - Purple/violet
            nodeColor: { r: 167, g: 139, b: 250 },
            lineColor: { r: 139, g: 92, b: 246 }
        },
        { // About section - Gold/amber
            nodeColor: { r: 251, g: 191, b: 36 },
            lineColor: { r: 245, g: 158, b: 11 }
        },
        { // Feature details - Teal/emerald
            nodeColor: { r: 52, g: 211, b: 153 },
            lineColor: { r: 16, g: 185, b: 129 }
        },
        { // Contact/Footer - Rose/pink
            nodeColor: { r: 244, g: 114, b: 182 },
            lineColor: { r: 236, g: 72, b: 153 }
        }
    ];

    // Current interpolated colors (smooth transition between themes)
    let currentColors = {
        nodeColor: { ...constellationThemes[0].nodeColor },
        lineColor: { ...constellationThemes[0].lineColor }
    };

    // Configuration
    const config = {
        constellationCount: 8,  // Number of constellation groups
        minNodesPerConstellation: 3,
        maxNodesPerConstellation: 6,
        constellationSpread: 120,  // How spread out nodes are within a constellation
        pulseSpeed: 3000,
        lifecycleSpeed: 8000
    };

    // Constellation group class
    class Constellation {
        constructor(centerX, centerY, nodeCount) {
            this.nodes = [];
            this.connections = [];
            this.opacity = Math.random() * 0.5 + 0.3;
            this.targetOpacity = Math.random() * 0.5 + 0.5;
            this.pulsePhase = Math.random() * Math.PI * 2;

            // Create nodes in a constellation pattern
            this.generateNodes(centerX, centerY, nodeCount);
            this.generateConnections();
        }

        generateNodes(centerX, centerY, count) {
            // First node at center (slightly offset)
            const offsetX = (Math.random() - 0.5) * 40;
            const offsetY = (Math.random() - 0.5) * 40;

            for (let i = 0; i < count; i++) {
                // Distribute nodes in a rough pattern around center
                const angle = (i / count) * Math.PI * 2 + Math.random() * 0.8;
                const distance = config.constellationSpread * (0.3 + Math.random() * 0.7);

                this.nodes.push({
                    x: centerX + offsetX + Math.cos(angle) * distance,
                    y: centerY + offsetY + Math.sin(angle) * distance,
                    pulseOffset: Math.random() * Math.PI * 2
                });
            }
        }

        generateConnections() {
            // Create a connected path through all nodes (ensures connectivity)
            const nodeCount = this.nodes.length;

            // Connect in a chain first
            for (let i = 0; i < nodeCount - 1; i++) {
                this.connections.push([i, i + 1]);
            }

            // Add 1-2 extra connections for more interesting shapes
            const extraConnections = Math.floor(Math.random() * 2) + 1;
            for (let e = 0; e < extraConnections; e++) {
                const a = Math.floor(Math.random() * nodeCount);
                let b = Math.floor(Math.random() * nodeCount);
                // Ensure different nodes and not already connected adjacently
                while (b === a || Math.abs(b - a) === 1) {
                    b = Math.floor(Math.random() * nodeCount);
                }
                // Check if connection already exists
                const exists = this.connections.some(c =>
                    (c[0] === a && c[1] === b) || (c[0] === b && c[1] === a)
                );
                if (!exists) {
                    this.connections.push([a, b]);
                }
            }
        }
    }

    let constellations = [];

    // Resize canvas
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initConstellations();
    }

    // Initialize constellation groups
    function initConstellations() {
        constellations = [];

        // Create grid-like distribution to avoid overlap
        const cols = 3;
        const rows = Math.ceil(config.constellationCount / cols);
        const cellWidth = width / cols;
        const cellHeight = height / rows;

        for (let i = 0; i < config.constellationCount; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);

            // Random position within cell (with padding)
            const padding = 60;
            const centerX = cellWidth * col + padding + Math.random() * (cellWidth - padding * 2);
            const centerY = cellHeight * row + padding + Math.random() * (cellHeight - padding * 2);

            // Random node count between 3-6
            const nodeCount = config.minNodesPerConstellation +
                Math.floor(Math.random() * (config.maxNodesPerConstellation - config.minNodesPerConstellation + 1));

            constellations.push(new Constellation(centerX, centerY, nodeCount));
        }
    }

    // Update constellation lifecycle (fading in/out)
    function updateConstellationLifecycle() {
        constellations.forEach(constellation => {
            // Randomly toggle target opacity
            if (Math.random() < 0.003) {
                if (constellation.targetOpacity > 0.5) {
                    constellation.targetOpacity = 0.2 + Math.random() * 0.2;
                } else {
                    constellation.targetOpacity = 0.6 + Math.random() * 0.4;
                }
            }
            // Smoothly interpolate opacity
            constellation.opacity += (constellation.targetOpacity - constellation.opacity) * 0.015;
        });
    }

    // Get current theme based on scroll position
    function updateThemeFromScroll() {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = Math.min(scrollY / docHeight, 1);

        // Map scroll progress to theme index with smooth transitions
        const themeCount = constellationThemes.length;
        const themeFloat = scrollProgress * (themeCount - 1);
        const themeIndex = Math.floor(themeFloat);
        const themeFraction = themeFloat - themeIndex;

        // Get current and next themes
        const current = constellationThemes[Math.min(themeIndex, themeCount - 1)];
        const next = constellationThemes[Math.min(themeIndex + 1, themeCount - 1)];

        // Interpolate colors smoothly
        const targetColors = {
            nodeColor: {
                r: current.nodeColor.r + (next.nodeColor.r - current.nodeColor.r) * themeFraction,
                g: current.nodeColor.g + (next.nodeColor.g - current.nodeColor.g) * themeFraction,
                b: current.nodeColor.b + (next.nodeColor.b - current.nodeColor.b) * themeFraction
            },
            lineColor: {
                r: current.lineColor.r + (next.lineColor.r - current.lineColor.r) * themeFraction,
                g: current.lineColor.g + (next.lineColor.g - current.lineColor.g) * themeFraction,
                b: current.lineColor.b + (next.lineColor.b - current.lineColor.b) * themeFraction
            }
        };

        // Smooth lerp towards target (for extra smoothness)
        const lerpSpeed = 0.1;
        currentColors.nodeColor.r += (targetColors.nodeColor.r - currentColors.nodeColor.r) * lerpSpeed;
        currentColors.nodeColor.g += (targetColors.nodeColor.g - currentColors.nodeColor.g) * lerpSpeed;
        currentColors.nodeColor.b += (targetColors.nodeColor.b - currentColors.nodeColor.b) * lerpSpeed;
        currentColors.lineColor.r += (targetColors.lineColor.r - currentColors.lineColor.r) * lerpSpeed;
        currentColors.lineColor.g += (targetColors.lineColor.g - currentColors.lineColor.g) * lerpSpeed;
        currentColors.lineColor.b += (targetColors.lineColor.b - currentColors.lineColor.b) * lerpSpeed;
    }

    // Draw the constellations
    function draw(time) {
        ctx.clearRect(0, 0, width, height);

        // Update colors based on scroll
        updateThemeFromScroll();

        const animationValue = (time % config.pulseSpeed) / config.pulseSpeed;
        const { nodeColor, lineColor } = currentColors;

        // Draw each constellation group
        for (const constellation of constellations) {
            if (constellation.opacity < 0.05) continue;

            const basePulse = Math.sin(animationValue * Math.PI * 2 + constellation.pulsePhase) * 0.3 + 0.7;
            const baseOpacity = constellation.opacity * basePulse;

            // Draw connections first (behind nodes)
            for (const [aIdx, bIdx] of constellation.connections) {
                const nodeA = constellation.nodes[aIdx];
                const nodeB = constellation.nodes[bIdx];

                const lineOpacity = baseOpacity * 0.7;

                // Draw glow line
                ctx.beginPath();
                ctx.strokeStyle = `rgba(${Math.round(lineColor.r)}, ${Math.round(lineColor.g)}, ${Math.round(lineColor.b)}, ${lineOpacity * 0.35})`;
                ctx.lineWidth = 3;
                ctx.shadowColor = `rgba(${Math.round(lineColor.r)}, ${Math.round(lineColor.g)}, ${Math.round(lineColor.b)}, 0.5)`;
                ctx.shadowBlur = 6;
                ctx.moveTo(nodeA.x, nodeA.y);
                ctx.lineTo(nodeB.x, nodeB.y);
                ctx.stroke();

                // Draw main line
                ctx.beginPath();
                ctx.strokeStyle = `rgba(${Math.round(lineColor.r)}, ${Math.round(lineColor.g)}, ${Math.round(lineColor.b)}, ${lineOpacity})`;
                ctx.lineWidth = 1.2;
                ctx.shadowBlur = 0;
                ctx.moveTo(nodeA.x, nodeA.y);
                ctx.lineTo(nodeB.x, nodeB.y);
                ctx.stroke();
            }

            // Draw nodes
            for (const node of constellation.nodes) {
                const nodePulse = Math.sin(animationValue * Math.PI * 2 + node.pulseOffset) * 0.2 + 0.8;
                const nodeOpacity = baseOpacity * nodePulse;

                // Node glow
                ctx.beginPath();
                ctx.arc(node.x, node.y, 7, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${Math.round(nodeColor.r)}, ${Math.round(nodeColor.g)}, ${Math.round(nodeColor.b)}, ${nodeOpacity * 0.4})`;
                ctx.shadowColor = `rgba(${Math.round(nodeColor.r)}, ${Math.round(nodeColor.g)}, ${Math.round(nodeColor.b)}, 0.6)`;
                ctx.shadowBlur = 10;
                ctx.fill();

                // Node core
                ctx.beginPath();
                ctx.arc(node.x, node.y, 3.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${Math.round(nodeColor.r)}, ${Math.round(nodeColor.g)}, ${Math.round(nodeColor.b)}, ${nodeOpacity})`;
                ctx.shadowBlur = 0;
                ctx.fill();

                // Bright center
                ctx.beginPath();
                ctx.arc(node.x, node.y, 1.8, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${nodeOpacity * 0.85})`;
                ctx.fill();
            }
        }
    }

    // Animation loop
    function animate(time) {
        updateConstellationLifecycle();
        draw(time);
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
