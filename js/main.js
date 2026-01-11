// Portfolio Website JavaScript
// Handles smooth scrolling, interactive elements, and animations

/* ===================================
   Smooth Scrolling for Navigation
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('.nav__link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Only handle internal links
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerOffset = 100;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    /* ===================================
       Work Card Interactions
       =================================== */

    const workCards = document.querySelectorAll('.work-card');
    
    workCards.forEach(card => {
        card.addEventListener('click', function() {
            // Add click handler - could open modal or navigate to project page
            console.log('Project card clicked:', this.querySelector('.work-card__title').textContent);
            
            // Add a subtle animation on click
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });

    /* ===================================
       Spotlight Card Interaction
       =================================== */

    const spotlightCard = document.querySelector('.spotlight__card');
    
    if (spotlightCard) {
        spotlightCard.addEventListener('click', function(e) {
            // Only trigger if not clicking on the button
            if (!e.target.closest('.btn')) {
                console.log('Spotlight project clicked');
            }
        });
    }

    /* ===================================
       Button Interactions
       =================================== */

    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Handle internal links
            if (href && href.startsWith('#')) {
                e.preventDefault();
                console.log('Button clicked:', this.textContent);
                
                // Add visual feedback
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            }
        });
    });

    /* ===================================
       Scroll Animations - Fade in on scroll
       =================================== */

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const fadeInObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Apply fade-in effect to cards and sections
    const animatedElements = document.querySelectorAll('.work-card, .what-done__item, .spotlight__card');
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        fadeInObserver.observe(element);
    });

    /* ===================================
       Active Navigation State
       =================================== */

    const sections = document.querySelectorAll('section[id]');
    
    function updateActiveNav() {
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 150;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelectorAll('.nav__link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);

    /* ===================================
       Header Scroll Effect
       =================================== */

    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.style.boxShadow = '0 2px 20px rgba(47, 39, 22, 0.08)';
        } else {
            header.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });

    /* ===================================
       Horizontal Scroll for Work Grid (Optional)
       =================================== */

    const workGrid = document.querySelector('.work-grid');
    
    if (workGrid) {
        let isDown = false;
        let startX;
        let scrollLeft;

        // Optional: Enable horizontal drag scrolling on touch devices
        if ('ontouchstart' in window) {
            workGrid.style.overflowX = 'auto';
            workGrid.style.scrollSnapType = 'x mandatory';
            
            workCards.forEach(card => {
                card.style.scrollSnapAlign = 'start';
            });
        }
    }

    /* ===================================
       Form Handling (for future contact form)
       =================================== */

    // Placeholder for future contact form functionality
    function handleContactForm(formData) {
        console.log('Contact form submitted:', formData);
        // Add AJAX submission logic here
    }

    /* ===================================
       Image Lazy Loading Fallback
       =================================== */

    // Modern browsers support loading="lazy" natively
    // This is a fallback for older browsers
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });

        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }

    /* ===================================
       Keyboard Navigation Enhancement
       =================================== */

    // Add keyboard navigation for work cards
    workCards.forEach((card, index) => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'article');
        
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
            
            // Arrow key navigation
            if (e.key === 'ArrowRight' && workCards[index + 1]) {
                workCards[index + 1].focus();
            }
            if (e.key === 'ArrowLeft' && workCards[index - 1]) {
                workCards[index - 1].focus();
            }
        });
    });

    /* ===================================
       Performance Optimization
       =================================== */

    // Debounce scroll events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Apply debounce to scroll handlers
    const debouncedScrollHandler = debounce(updateActiveNav, 100);
    window.addEventListener('scroll', debouncedScrollHandler);

    /* ===================================
       Console Welcome Message
       =================================== */

    console.log('%c Welcome to my Portfolio! ', 'background: #2f2716; color: #e2dbd3; font-size: 16px; padding: 10px; border-radius: 4px;');
    console.log('%c Looking for something? Feel free to reach out! ', 'color: #6f6a5e; font-size: 12px;');

    /* ===================================
       Accessibility: Announce page changes
       =================================== */

    // Create a live region for screen readers
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    document.body.appendChild(liveRegion);

    // Announce section changes to screen readers
    sections.forEach(section => {
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionLabel = entry.target.querySelector('.section-label');
                    if (sectionLabel) {
                        liveRegion.textContent = `Now viewing: ${sectionLabel.textContent}`;
                    }
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(section);
    });

    // Log initialization complete
    console.log('Portfolio initialized successfully');
});

/* ===================================
   Page Visibility API - Pause animations when tab is not visible
   =================================== */

document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Pause any animations or auto-playing content
        console.log('Page hidden - pausing animations');
    } else {
        // Resume animations
        console.log('Page visible - resuming animations');
    }
});

/* ===================================
   Export functions for testing (if needed)
   =================================== */

// Uncomment if using modules
// export { handleContactForm, debounce };
