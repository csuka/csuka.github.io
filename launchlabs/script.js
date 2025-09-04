// Scroll-based animations
document.addEventListener('DOMContentLoaded', () => {
    // Allow skipping staged intro reveals
    const skipButton = document.querySelector('.skip-button');
    const root = document.documentElement;
    let skipTriggered = false;

    // Add fade-in class to sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        if (!section.classList.contains('hero')) {
            section.classList.add('fade-in');
        }
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // After hero animation completes (including tagline reveal), reset reveal-delay so scrolled sections appear immediately
    // sequence-duration is 9s, plus 0.6s for the reveal animation, plus a small buffer
    const sequenceDuration = 9000;
    const revealAnimationDuration = 600;
    setTimeout(() => {
        if (!skipTriggered) {
            // Remove transition-delay from fade-in sections directly instead of changing global variable
            document.querySelectorAll('.fade-in').forEach(el => {
                el.style.transitionDelay = '0s';
            });
        }
    }, sequenceDuration + revealAnimationDuration + 100);

    if (skipButton) {
        skipButton.addEventListener('click', () => {
            skipTriggered = true;
            root.style.setProperty('--step-delay', '0s');
            root.style.setProperty('--sequence-duration', '0s');
            root.style.setProperty('--reveal-delay', '0s');

            document.body.classList.add('skip-mode');
            skipButton.remove();

            observer.disconnect();
            document.querySelectorAll('section').forEach(section => {
                if (!section.classList.contains('hero')) {
                    section.classList.remove('fade-in');
                    section.style.opacity = '0';
                    section.style.transform = 'translateY(30px)';
                    section.style.animation = 'none';
                    section.offsetHeight;
                    section.style.animation = '';
                    section.classList.add('skip-reveal-section');
                }
            });

            const actions = document.querySelector('.hero-actions');
            const tagline = document.querySelector('.hero-tagline');
            if (actions) {
                actions.style.opacity = '0';
                actions.style.transform = 'translateY(10px)';
                actions.style.animation = 'none';
                actions.offsetHeight;
                actions.style.animation = '';
                actions.classList.add('skip-reveal');
            }
            if (tagline) {
                tagline.style.opacity = '0';
                tagline.style.transform = 'translateY(10px)';
                tagline.style.animation = 'none';
                tagline.offsetHeight;
                tagline.style.animation = '';
                tagline.classList.add('skip-reveal');
            }
        });
    }

    // Parallax effect on hero visual (desktop only)
    const heroVisual = document.querySelector('.hero-visual');

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const isMobile = window.innerWidth <= 768;

        // Skip parallax entirely on mobile
        if (isMobile) return;

        if (heroVisual && scrolled < window.innerHeight) {
            heroVisual.style.transform = `translateY(${scrolled * 0.12}px)`;
            heroVisual.style.opacity = 1 - (scrolled / (window.innerHeight * 1.5));
        }
    });

    // Subtle hover lift on service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.08}s`;
    });

    // Smooth scroll for anchor links
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

    // Header background on scroll
    const header = document.querySelector('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.style.background = 'rgba(7, 8, 9, 0.92)';
        } else {
            header.style.background = 'rgba(7, 8, 9, 0.75)';
        }

        lastScroll = currentScroll;
    });

    // Cursor glow removed for now
});
