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

// Constellation Network Overlay - Organic star patterns appearing/fading
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
        maxGroups: 3,              // Max groups visible at once
        minNodes: 3,               // Minimum 3 nodes (no 2-node lines)
        maxNodes: 5,
        nodeSpread: 100,           // How spread out nodes are
        groupLifetime: 10000,      // How long a group stays visible (ms)
        fadeInTime: 2000,
        fadeOutTime: 3000,
        spawnInterval: 4000,       // New group every 4 seconds
        lineAnimateDelay: 400      // Delay between each line appearing
    };

    // A single star group (like Ursa Major style - organic spread)
    class StarGroup {
        constructor(x, y, nodeCount) {
            this.nodes = [];
            this.connections = [];
            this.opacity = 0;
            this.targetOpacity = 0;
            this.birthTime = performance.now();
            this.state = 'fadingIn';  // fadingIn, visible, fadingOut, dead
            this.lineRevealProgress = 0;  // 0 to 1, reveals lines one by one

            this.generateNodes(x, y, nodeCount);
            this.generateConnections();
        }

        generateNodes(cx, cy, count) {
            // Organic spread - like real constellations
            // First node
            this.nodes.push({
                x: cx + (Math.random() - 0.5) * 30,
                y: cy + (Math.random() - 0.5) * 30,
                phase: Math.random() * Math.PI * 2
            });

            // Remaining nodes spread out organically
            for (let i = 1; i < count; i++) {
                // Pick a random existing node to branch from
                const parent = this.nodes[Math.floor(Math.random() * this.nodes.length)];
                const angle = Math.random() * Math.PI * 2;
                const dist = config.nodeSpread * (0.5 + Math.random() * 0.8);

                this.nodes.push({
                    x: parent.x + Math.cos(angle) * dist,
                    y: parent.y + Math.sin(angle) * dist,
                    phase: Math.random() * Math.PI * 2
                });
            }
        }

        generateConnections() {
            // Connect nodes organically - not all at once
            // Create a spanning tree first (ensures all connected)
            const connected = [0];
            const unconnected = [];
            for (let i = 1; i < this.nodes.length; i++) unconnected.push(i);

            while (unconnected.length > 0) {
                // Pick random connected and unconnected node
                const fromIdx = connected[Math.floor(Math.random() * connected.length)];
                const toIdx = unconnected.splice(Math.floor(Math.random() * unconnected.length), 1)[0];

                this.connections.push({
                    a: fromIdx,
                    b: toIdx,
                    revealOrder: this.connections.length
                });
                connected.push(toIdx);
            }

            // Maybe add 1 extra connection for triangles (30% chance)
            if (this.nodes.length >= 4 && Math.random() < 0.3) {
                const a = Math.floor(Math.random() * this.nodes.length);
                let b = Math.floor(Math.random() * this.nodes.length);
                while (b === a) b = Math.floor(Math.random() * this.nodes.length);

                // Check not already connected
                const exists = this.connections.some(c =>
                    (c.a === a && c.b === b) || (c.a === b && c.b === a)
                );
                if (!exists) {
                    this.connections.push({ a, b, revealOrder: this.connections.length });
                }
            }
        }

        update(time) {
            const age = time - this.birthTime;

            if (this.state === 'fadingIn') {
                this.targetOpacity = 0.8;
                this.lineRevealProgress = Math.min(1, age / (config.fadeInTime * 1.5));
                if (age > config.fadeInTime) {
                    this.state = 'visible';
                }
            } else if (this.state === 'visible') {
                this.targetOpacity = 0.7 + Math.sin(time * 0.001) * 0.1;
                this.lineRevealProgress = 1;
                if (age > config.groupLifetime - config.fadeOutTime) {
                    this.state = 'fadingOut';
                }
            } else if (this.state === 'fadingOut') {
                this.targetOpacity = 0;
                if (this.opacity < 0.02) {
                    this.state = 'dead';
                }
            }

            // Smooth opacity
            this.opacity += (this.targetOpacity - this.opacity) * 0.05;
        }

        draw(ctx, time) {
            if (this.opacity < 0.01) return;

            const numLinesToShow = Math.floor(this.lineRevealProgress * this.connections.length);

            // Draw connections
            for (let i = 0; i < this.connections.length; i++) {
                const conn = this.connections[i];
                if (conn.revealOrder >= numLinesToShow) continue;

                const nodeA = this.nodes[conn.a];
                const nodeB = this.nodes[conn.b];

                // Line opacity based on reveal progress
                const lineAge = this.lineRevealProgress * this.connections.length - conn.revealOrder;
                const lineFade = Math.min(1, lineAge);
                const lineAlpha = this.opacity * lineFade * 0.5;

                // Glow line
                ctx.beginPath();
                ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${lineAlpha * 0.4})`;
                ctx.lineWidth = 2.5;
                ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`;
                ctx.shadowBlur = 4;
                ctx.moveTo(nodeA.x, nodeA.y);
                ctx.lineTo(nodeB.x, nodeB.y);
                ctx.stroke();

                // Main line
                ctx.beginPath();
                ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${lineAlpha})`;
                ctx.lineWidth = 1;
                ctx.shadowBlur = 0;
                ctx.moveTo(nodeA.x, nodeA.y);
                ctx.lineTo(nodeB.x, nodeB.y);
                ctx.stroke();
            }

            // Draw nodes
            for (const node of this.nodes) {
                const pulse = Math.sin(time * 0.003 + node.phase) * 0.25 + 0.75;
                const nodeAlpha = this.opacity * pulse;

                // Glow
                ctx.beginPath();
                ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${nodeAlpha * 0.3})`;
                ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.6)`;
                ctx.shadowBlur = 8;
                ctx.fill();

                // Core
                ctx.beginPath();
                ctx.arc(node.x, node.y, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${nodeAlpha})`;
                ctx.shadowBlur = 0;
                ctx.fill();

                // Bright center
                ctx.beginPath();
                ctx.arc(node.x, node.y, 1.2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${nodeAlpha * 0.9})`;
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
        // Random position with padding
        const padding = 150;
        const x = padding + Math.random() * (width - padding * 2);
        const y = padding + Math.random() * (height - padding * 2);

        // Random node count 3-5
        const nodeCount = config.minNodes + Math.floor(Math.random() * (config.maxNodes - config.minNodes + 1));

        groups.push(new StarGroup(x, y, nodeCount));
        lastSpawnTime = time;
    }

    function animate(time) {
        ctx.clearRect(0, 0, width, height);

        // Spawn new groups periodically
        const aliveGroups = groups.filter(g => g.state !== 'dead').length;
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
        groups = groups.filter(g => g.state !== 'dead');

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
