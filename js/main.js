// Main JavaScript

// Load shared footer partial
(function () {
    var el = document.getElementById('site-footer');
    if (el) {
        fetch('/partials/footer.html')
            .then(function (r) { return r.text(); })
            .then(function (html) { el.innerHTML = html; });
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
    
    // Header Scroll Effect
    const header = document.querySelector('.header');
    let lastScroll = 0;
    
    if (header) {
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });
    }

    // Scroll to hash on load (e.g. from /journal to /#apps), accounting for fixed header
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target && header) {
            setTimeout(function() {
                window.scrollTo({
                    top: target.offsetTop - header.offsetHeight,
                    behavior: 'auto'
                });
            }, 0);
        }
    }
    
    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const headerHeight = header ? header.offsetHeight : 80;
                    const targetPosition = target.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Lazy Load Images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // Mobile: animate cards on scroll into view
    if ('IntersectionObserver' in window && !window.matchMedia('(hover: hover)').matches) {
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                entry.target.classList.toggle('in-view', entry.isIntersecting);
            });
        }, {
            threshold: 0.3
        });

        document.querySelectorAll('.card, .card--featured').forEach(card => {
            cardObserver.observe(card);
        });
    }

    // Accordion (FAQ)
    const accordionToggles = document.querySelectorAll('.accordion-toggle');
    accordionToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const isActive = content.classList.contains('active');
            
            // Close all accordions
            document.querySelectorAll('.accordion-content').forEach(item => {
                item.classList.remove('active');
            });
            
            // Open clicked accordion if it wasn't active
            if (!isActive) {
                content.classList.add('active');
            }
        });
    });
    
    // Random color for logo on hover/focus
    const logoColors = [
        'rgb(32, 115, 255)',
        'rgb(255, 130, 210)',
        'rgb(82, 208, 250)'
    ];
    const logo = document.querySelector('.logo');
    if (logo) {
        function setLogoColor() {
            logo.style.setProperty('--logo-hover-color', logoColors[Math.floor(Math.random() * logoColors.length)]);
        }
        function clearLogoColor() {
            logo.style.removeProperty('--logo-hover-color');
        }
        logo.addEventListener('mouseenter', setLogoColor);
        logo.addEventListener('focus', setLogoColor);
        logo.addEventListener('mouseleave', clearLogoColor);
        logo.addEventListener('blur', clearLogoColor);
    }

    // Handle image loading errors
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            this.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.style.width = '100%';
            placeholder.style.height = '100%';
            placeholder.style.background = '#0a0a0a';
            placeholder.style.display = 'flex';
            placeholder.style.alignItems = 'center';
            placeholder.style.justifyContent = 'center';
            placeholder.style.color = '#666';
            placeholder.style.fontSize = '0.9rem';
            placeholder.textContent = 'Image not found';
            this.parentElement.appendChild(placeholder);
        });
    });
    
    // Console message
    console.log('%cDen Ree Workroom', 'font-size: 20px; font-weight: bold; color: #4785F4;');
    console.log('%cBuild products that help you stay creative.', 'font-size: 14px; color: #888;');
});
