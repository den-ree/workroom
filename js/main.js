// Main JavaScript

// Inject shared footer
(function () {
    var el = document.getElementById('site-footer');
    if (!el) return;
    el.innerHTML = [
        '<div class="footer-container">',
        '    <div class="footer-bio"><p>Exploring the creative potentials of code.</p></div>',
        '    <nav class="footer-nav"><ul>',
        '        <li><a href="/#apps">Apps</a></li>',
        '        <li><a href="/#music">Music</a></li>',
        '        <li><a href="/journal">Journal</a></li>',
        '        <li><a href="/contact">Contact</a></li>',
        '    </ul></nav>',
        '    <div class="social-links">',
        '        <a href="https://instagram.com/den_ree" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>',
        '        <a href="https://youtube.com/@den_ree" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>',
        '        <a href="https://soundcloud.com/den-ree" target="_blank" rel="noopener noreferrer" aria-label="SoundCloud"><img src="/assets/soundcloud-logo.png" alt="SoundCloud" width="24" height="24"></a>',
        '        <a href="https://github.com/denree" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>',
        '        <a href="https://linkedin.com/in/denree" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>',
        '        <a href="https://denree.bandcamp.com/" target="_blank" rel="noopener noreferrer" aria-label="Bandcamp"><svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M0 8.5h8.7l-3.5 7H24l-3.5-7H0z"/></svg></a>',
        '    </div>',
        '    <p class="footer-copyright">&copy; 2026 Den Ree. All rights reserved.</p>',
        '    <p class="footer-credits">Font: Karrik by Jean-Baptiste Morizot, Lucas Le Bihan. Distributed by <a href="https://velvetyne.fr" target="_blank" rel="noopener noreferrer">velvetyne.fr</a>.</p>',
        '</div>'
    ].join('\n');
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
