// Astrolytix - Realistic Starfield & Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Initialize procedural flickering stars layer
    initProceduralStars();

    // Initialize constellation network overlay (parallax stars handled by CSS)
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

// Procedural flickering stars - third parallax layer
function initProceduralStars() {
    const canvas = document.getElementById('procedural-stars');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [];
    let animationId;
    let targetStarCount = 0;

    // Movement speed: middle between far (120s) and near (240s) = ~180s per 2 screens = 90s per screen
    const scrollSpeed = 0.35; // pixels per frame

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;

        // Low to low-moderate density: ~1 star per 8000px²
        const area = width * height;
        targetStarCount = Math.floor(area / 8000);

        // Initialize stars if empty
        if (stars.length === 0) {
            for (let i = 0; i < targetStarCount; i++) {
                stars.push(createStar(true));
            }
        }
    }

    function createStar(initialSpawn = false) {
        return {
            x: initialSpawn ? Math.random() * width : width + Math.random() * 100,
            y: Math.random() * height,
            size: Math.random() * 1.5 + 0.5,
            maxAlpha: Math.random() * 0.4 + 0.3,
            flickerSpeed: Math.random() * 0.002 + 0.001, // 10x slower flicker
            flickerOffset: Math.random() * Math.PI * 2,
            color: {
                r: 220 + Math.floor(Math.random() * 35),
                g: 220 + Math.floor(Math.random() * 35),
                b: 230 + Math.floor(Math.random() * 25)
            },
            // Lifecycle: fade in, live, fade out, dead
            state: 'fadeIn',
            opacity: 0,
            lifeTime: 8000 + Math.random() * 12000, // 8-20 seconds alive
            birthTime: performance.now(),
            fadeInDuration: 2000 + Math.random() * 2000,
            fadeOutDuration: 2000 + Math.random() * 2000
        };
    }

    function animate(time) {
        ctx.clearRect(0, 0, width, height);

        let aliveCount = 0;

        for (let i = stars.length - 1; i >= 0; i--) {
            const star = stars[i];
            const age = time - star.birthTime;

            // Move star left
            star.x -= scrollSpeed;

            // Update lifecycle
            if (star.state === 'fadeIn') {
                star.opacity = Math.min(1, age / star.fadeInDuration);
                if (age >= star.fadeInDuration) {
                    star.state = 'alive';
                }
            } else if (star.state === 'alive') {
                star.opacity = 1;
                if (age >= star.fadeInDuration + star.lifeTime) {
                    star.state = 'fadeOut';
                    star.fadeOutStart = time;
                }
            } else if (star.state === 'fadeOut') {
                const fadeAge = time - star.fadeOutStart;
                star.opacity = Math.max(0, 1 - fadeAge / star.fadeOutDuration);
                if (star.opacity <= 0) {
                    star.state = 'dead';
                }
            }

            // Remove dead stars or stars that scrolled off screen
            if (star.state === 'dead' || star.x < -20) {
                stars.splice(i, 1);
                continue;
            }

            aliveCount++;

            // Only draw if on screen
            if (star.x > width + 10) continue;

            // Flickering effect (10x slower)
            const flicker = Math.sin(time * star.flickerSpeed + star.flickerOffset);
            const flickerAlpha = 0.6 + flicker * 0.4; // Subtle flicker range
            const alpha = star.maxAlpha * star.opacity * flickerAlpha;

            if (alpha < 0.05) continue;

            // Draw star
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${alpha})`;
            ctx.fill();

            // Subtle glow for larger stars
            if (star.size > 1.2) {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size * 2.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${alpha * 0.2})`;
                ctx.fill();
            }
        }

        // Spawn new stars to maintain count
        while (stars.length < targetStarCount) {
            stars.push(createStar(false));
        }

        animationId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate(performance.now());

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
