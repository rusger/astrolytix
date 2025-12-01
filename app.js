// Astrolytix - Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for navigation links
    initSmoothScroll();

    // Navbar background on scroll
    initNavbarScroll();

    // Animate elements on scroll
    initScrollAnimations();
});

// Smooth scrolling for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
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

    // Observe feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
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

// Add parallax effect to zodiac wheel
window.addEventListener('scroll', () => {
    const wheel = document.querySelector('.zodiac-wheel');
    if (wheel) {
        const scrolled = window.pageYOffset;
        wheel.style.transform = `translate(-50%, -50%) rotate(${scrolled * 0.1}deg)`;
    }
});
