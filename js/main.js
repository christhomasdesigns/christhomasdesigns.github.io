// Portfolio Website JavaScript
// Handles smooth scrolling, interactive elements, and animations

/* ===================================
   Fixed Video Background
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
    const backgroundVideo = document.querySelector('.video-background__video');
    
    if (backgroundVideo) {
        // Ensure video plays on load (some browsers may block autoplay)
        backgroundVideo.play().catch(error => {
            console.log('Background video autoplay was prevented:', error);
        });

        // Pause video when page is hidden to save resources
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                backgroundVideo.pause();
            } else {
                backgroundVideo.play().catch(error => {
                    console.log('Background video play failed:', error);
                });
            }
        });

        // Ensure video is always playing when in view
        window.addEventListener('focus', function() {
            if (backgroundVideo.paused) {
                backgroundVideo.play().catch(error => {
                    console.log('Background video play failed:', error);
                });
            }
        });
    }

    /* ===================================
       Smooth Scrolling for Navigation
       =================================== */

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
       Work Carousel Interactions & Scroll Jacking
       =================================== */

    const workCarouselCards = document.querySelectorAll('.work-carousel__card');
    const allWorkCarousels = document.querySelectorAll('.work-carousel');
    const workCarousel = document.querySelector('.all-work .work-carousel');
    const allWorkSection = document.querySelector('.all-work');
    
    // Click handler for carousel cards
    workCarouselCards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('.work-carousel__title')?.textContent;
            const projectLink = this.getAttribute('data-project-link');
            
            console.log('Project card clicked:', title);
            
            // Add a subtle animation on click
            this.style.transform = 'scale(0.98) translateY(-8px)';
            setTimeout(() => {
                this.style.transform = '';
                
                // Navigate to project page if link exists
                if (projectLink) {
                    window.location.href = projectLink;
                }
            }, 150);
        });
        
        // Add pointer cursor for cards with links
        if (card.getAttribute('data-project-link')) {
            card.style.cursor = 'pointer';
        }
    });

    // Add drag functionality to ALL carousels
    allWorkCarousels.forEach(carousel => {
        let isDown = false;
        let startX;
        let scrollLeft;

        carousel.addEventListener('mousedown', (e) => {
            // Don't interfere with card hover effects
            if (!e.target.closest('.work-carousel__card')) return;
            
            isDown = true;
            carousel.style.cursor = 'grabbing';
            startX = e.pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
        });

        carousel.addEventListener('mouseleave', () => {
            isDown = false;
            carousel.style.cursor = 'default';
        });

        carousel.addEventListener('mouseup', () => {
            isDown = false;
            carousel.style.cursor = 'default';
        });

        carousel.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - carousel.offsetLeft;
            const walk = (x - startX) * 2; // Scroll speed multiplier
            carousel.scrollLeft = scrollLeft - walk;
        });
    });

    // Scroll Jacking: Lock vertical scroll until carousel is fully scrolled (ONLY for homepage)
    if (workCarousel && allWorkSection) {
        let isInCarouselSection = false;
        let hasScrolledToEnd = false;

        // Check if carousel is at the end
        function isCarouselAtEnd() {
            const scrollWidth = workCarousel.scrollWidth;
            const clientWidth = workCarousel.clientWidth;
            const scrollLeft = workCarousel.scrollLeft;
            // Add small threshold (10px) to account for sub-pixel rendering
            return scrollLeft + clientWidth >= scrollWidth - 10;
        }

        // Check if carousel is at the start
        function isCarouselAtStart() {
            return workCarousel.scrollLeft <= 10;
        }

        // Check if section is centered in viewport
        function isSectionCentered() {
            const rect = allWorkSection.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const sectionCenter = rect.top + (rect.height / 2);
            const viewportCenter = viewportHeight / 2;
            
            // Allow some tolerance (20% of viewport height)
            const tolerance = viewportHeight * 0.2;
            return Math.abs(sectionCenter - viewportCenter) < tolerance;
        }

        // Update visual indicator
        function updateScrollIndicator() {
            if (isCarouselAtEnd()) {
                workCarousel.classList.add('scrolled-to-end');
            } else {
                workCarousel.classList.remove('scrolled-to-end');
            }
        }

        // Detect when user enters/exits the All Work section
        // Use rootMargin to trigger when section is approaching center
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Check if section is actually centered
                    if (isSectionCentered()) {
                        isInCarouselSection = true;
                        hasScrolledToEnd = false;
                        updateScrollIndicator();
                        console.log('All Work section centered - scroll jacking enabled');
                    }
                } else {
                    isInCarouselSection = false;
                    hasScrolledToEnd = false;
                    console.log('Left All Work section - normal scroll restored');
                }
            });
        }, { 
            threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
            rootMargin: '-25% 0px -25% 0px' // Center detection zone
        });

        sectionObserver.observe(allWorkSection);

        // Track carousel scroll position
        workCarousel.addEventListener('scroll', () => {
            updateScrollIndicator();
            if (isCarouselAtEnd()) {
                hasScrolledToEnd = true;
            }
        });

        // Hijack scroll events when in carousel section
        let scrollTimeout;
        window.addEventListener('wheel', function(e) {
            // Double check if section is centered before hijacking
            if (!isInCarouselSection || !isSectionCentered()) {
                // If we were in the section but it's no longer centered, disable hijacking
                if (isInCarouselSection && !isSectionCentered()) {
                    isInCarouselSection = false;
                    hasScrolledToEnd = false;
                }
                return;
            }

            const scrollingDown = e.deltaY > 0;
            const scrollingUp = e.deltaY < 0;

            // If scrolling down and haven't reached the end of carousel, prevent page scroll
            if (scrollingDown && !hasScrolledToEnd) {
                e.preventDefault();
                workCarousel.scrollLeft += e.deltaY;
                
                // Clear any existing timeout
                clearTimeout(scrollTimeout);
                
                // Check if we've reached the end after scrolling
                scrollTimeout = setTimeout(() => {
                    if (isCarouselAtEnd()) {
                        hasScrolledToEnd = true;
                        updateScrollIndicator();
                        console.log('Carousel end reached - vertical scroll enabled');
                    }
                }, 100);
            }
            // If scrolling up and at the start of carousel, allow scrolling up past the section
            else if (scrollingUp && isCarouselAtStart()) {
                // Allow normal scroll behavior
                return;
            }
            // If scrolling up while in the middle of carousel, scroll carousel left
            else if (scrollingUp && !isCarouselAtStart()) {
                e.preventDefault();
                workCarousel.scrollLeft += e.deltaY;
                hasScrolledToEnd = false; // Reset the flag when scrolling back
                updateScrollIndicator();
            }
        }, { passive: false });

        // Also check centering on scroll to enable/disable scroll jacking dynamically
        let rafId = null;
        window.addEventListener('scroll', function() {
            if (rafId) return;
            
            rafId = requestAnimationFrame(() => {
                const rect = allWorkSection.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                
                if (isVisible && isSectionCentered() && !isInCarouselSection) {
                    isInCarouselSection = true;
                    hasScrolledToEnd = false;
                    console.log('Section centered via scroll - scroll jacking enabled');
                } else if (isInCarouselSection && (!isVisible || !isSectionCentered())) {
                    isInCarouselSection = false;
                    hasScrolledToEnd = false;
                    console.log('Section no longer centered - scroll jacking disabled');
                }
                
                rafId = null;
            });
        });

        // Initialize indicator on page load
        updateScrollIndicator();
    }

    /* ===================================
       Old Work Card Interactions (kept for compatibility)
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
       Spotlight Video Interaction
       =================================== */

    const spotlightVideo = document.querySelector('.spotlight__video');
    
    if (spotlightVideo) {
        // Ensure video plays on load (some browsers may block autoplay)
        spotlightVideo.play().catch(error => {
            console.log('Video autoplay was prevented:', error);
        });

        // Pause/play video when clicking on it
        spotlightVideo.addEventListener('click', function() {
            if (this.paused) {
                this.play();
                console.log('Spotlight video playing');
            } else {
                this.pause();
                console.log('Spotlight video paused');
            }
        });

        // Optional: Pause video when it's out of view to save resources
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    spotlightVideo.play().catch(error => {
                        console.log('Video play failed:', error);
                    });
                } else {
                    spotlightVideo.pause();
                }
            });
        }, { threshold: 0.5 });

        videoObserver.observe(spotlightVideo);
    }

    /* ===================================
       Spotlight Card Interaction (backwards compatibility)
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
    const animatedElements = document.querySelectorAll('.work-card, .work-carousel__card, .what-done__item, .spotlight__card');
    
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

    // Add keyboard navigation for carousel cards
    workCarouselCards.forEach((card, index) => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'article');
        
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
            
            // Arrow key navigation with scrolling
            if (e.key === 'ArrowRight' && workCarouselCards[index + 1]) {
                workCarouselCards[index + 1].focus();
                workCarouselCards[index + 1].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
            if (e.key === 'ArrowLeft' && workCarouselCards[index - 1]) {
                workCarouselCards[index - 1].focus();
                workCarouselCards[index - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        });
    });

    // Add keyboard navigation for old work cards (backwards compatibility)
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

    /* ===================================
       Project Gallery Horizontal Scroll with Mouse Wheel
       =================================== */

    const projectGalleryCarousel = document.querySelector('.project-gallery__carousel');
    const projectGalleryTrack = document.querySelector('.project-gallery__track');
    
    if (projectGalleryCarousel && projectGalleryTrack) {
        // Check if carousel is at the end
        function isCarouselAtEnd() {
            const scrollWidth = projectGalleryCarousel.scrollWidth;
            const clientWidth = projectGalleryCarousel.clientWidth;
            const scrollLeft = projectGalleryCarousel.scrollLeft;
            return scrollLeft + clientWidth >= scrollWidth - 10;
        }

        // Check if carousel is at the start
        function isCarouselAtStart() {
            return projectGalleryCarousel.scrollLeft <= 10;
        }

        // Mouse wheel scrolling with smart release
        projectGalleryCarousel.addEventListener('wheel', function(e) {
            const scrollingDown = e.deltaY > 0;
            const scrollingUp = e.deltaY < 0;

            // If scrolling down/right and not at end, hijack scroll
            if (scrollingDown && !isCarouselAtEnd()) {
                e.preventDefault();
                this.scrollLeft += e.deltaY;
            }
            // If scrolling up/left and not at start, hijack scroll
            else if (scrollingUp && !isCarouselAtStart()) {
                e.preventDefault();
                this.scrollLeft += e.deltaY;
            }
            // Otherwise, allow normal page scroll
        }, { passive: false });

        // Click to enlarge gallery images
        const galleryCards = document.querySelectorAll('.project-gallery__card');
        let lightbox = null;

        function createLightbox() {
            if (!lightbox) {
                lightbox = document.createElement('div');
                lightbox.className = 'gallery-lightbox';
                lightbox.innerHTML = `
                    <button class="gallery-lightbox__close" aria-label="Close lightbox">&times;</button>
                    <div class="gallery-lightbox__content"></div>
                `;
                document.body.appendChild(lightbox);

                // Close on click outside or close button
                lightbox.addEventListener('click', (e) => {
                    if (e.target === lightbox || e.target.classList.contains('gallery-lightbox__close')) {
                        closeLightbox();
                    }
                });

                // Close on ESC key
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                        closeLightbox();
                    }
                });
            }
            return lightbox;
        }

        function openLightbox(element) {
            const lb = createLightbox();
            const content = lb.querySelector('.gallery-lightbox__content');
            content.innerHTML = '';

            if (element.tagName === 'IMG') {
                const img = document.createElement('img');
                img.src = element.src;
                img.alt = element.alt;
                img.className = 'gallery-lightbox__image';
                content.appendChild(img);
            } else if (element.tagName === 'VIDEO') {
                const video = document.createElement('video');
                video.src = element.src;
                video.controls = true;
                video.autoplay = true;
                video.loop = element.loop;
                video.className = 'gallery-lightbox__video';
                content.appendChild(video);
            }

            lb.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            if (lightbox) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        }

        galleryCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const img = card.querySelector('img');
                const video = card.querySelector('video');
                
                if (img) {
                    openLightbox(img);
                } else if (video) {
                    openLightbox(video);
                }
            });
        });

        // Click to enlarge spotlight grid images
        const spotlightGridItems = document.querySelectorAll('.project-spotlight__grid-item');
        spotlightGridItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const img = item.querySelector('img');
                const video = item.querySelector('video');
                
                if (img) {
                    openLightbox(img);
                } else if (video) {
                    openLightbox(video);
                }
            });
        });
    }

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
