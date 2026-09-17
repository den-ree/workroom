// Main JavaScript

// Inject shared footer
(function () {
    var el = document.getElementById('site-footer');
    if (!el) return;
    el.innerHTML = [
        '<div class="footer-container">',
        '    <div class="social-links">',
        '        <a href="https://instagram.com/den_ree" target="_blank" rel="noopener noreferrer">Instagram</a>',
        '        <a href="https://youtube.com/@den_ree" target="_blank" rel="noopener noreferrer">YouTube</a>',
        '        <a href="https://soundcloud.com/den-ree" target="_blank" rel="noopener noreferrer">SoundCloud</a>',
        '        <a href="https://github.com/denree" target="_blank" rel="noopener noreferrer">GitHub</a>',
        '        <a href="https://linkedin.com/in/denree" target="_blank" rel="noopener noreferrer">LinkedIn</a>',
        '        <a href="https://denree.bandcamp.com/" target="_blank" rel="noopener noreferrer">Bandcamp</a>',
        '    </div>',
        '    <p class="footer-copyright">&copy; 2026 Den Ree</p>',
        '    <p class="footer-credits">Font: Karrik by Jean-Baptiste Morizot, Lucas Le Bihan by <a href="https://velvetyne.fr" target="_blank" rel="noopener noreferrer">velvetyne.fr</a>.</p>',
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
    
    // Latching keys: pressing the lit key releases it and returns home
    document.querySelectorAll('.nav-link.active').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            link.classList.remove('active');
            setTimeout(function() {
                window.location.href = '/';
            }, 120);
        });
    });

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

    // Scroll to hash on load (e.g. from /journal to /#software), accounting for fixed header
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
            
            document.querySelectorAll('.accordion-content').forEach(item => {
                item.classList.remove('active');
            });
            
            if (!isActive) {
                content.classList.add('active');
            }
        });
    });

    // @den_ree logo → socials menu
    const logoColors = [
        'rgb(32, 115, 255)',
        'rgb(255, 130, 210)',
        'rgb(82, 208, 250)'
    ];
    const logo = document.querySelector('.logo');
    if (logo) {
        const wrap = document.createElement('div');
        wrap.className = 'logo-menu';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'logo';
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-haspopup', 'true');
        btn.setAttribute('aria-label', '@den_ree socials');
        btn.textContent = logo.textContent.trim() || '@den_ree';

        const panel = document.createElement('div');
        panel.className = 'logo-menu__panel';
        panel.setAttribute('role', 'menu');
        panel.innerHTML = [
            '<a href="/" role="menuitem"><span class="logo-menu__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg></span>Home</a>',
            '<a href="https://instagram.com/den_ree" target="_blank" rel="noopener noreferrer" role="menuitem"><span class="logo-menu__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></span>Instagram</a>',
            '<a href="https://youtube.com/@den_ree" target="_blank" rel="noopener noreferrer" role="menuitem"><span class="logo-menu__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></span>YouTube</a>',
            '<a href="https://soundcloud.com/den-ree" target="_blank" rel="noopener noreferrer" role="menuitem"><span class="logo-menu__icon logo-menu__icon--img" aria-hidden="true"><img src="/assets/soundcloud-logo.png" alt=""></span>SoundCloud</a>',
            '<a href="https://open.spotify.com/artist/2FMhsq7kGfJFLoASM392X4" target="_blank" rel="noopener noreferrer" role="menuitem"><span class="logo-menu__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg></span>Spotify</a>',
            '<a href="https://denree.bandcamp.com/" target="_blank" rel="noopener noreferrer" role="menuitem"><span class="logo-menu__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M0 8.5h8.7l-3.5 7H24l-3.5-7H0z"/></svg></span>Bandcamp</a>',
            '<a href="https://github.com/denree" target="_blank" rel="noopener noreferrer" role="menuitem"><span class="logo-menu__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></span>GitHub</a>',
            '<a href="https://linkedin.com/in/denree" target="_blank" rel="noopener noreferrer" role="menuitem"><span class="logo-menu__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></span>LinkedIn</a>',
            '<a href="mailto:contact@denree.nl" role="menuitem"><span class="logo-menu__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>Email</a>'
        ].join('');

        // Keypad key: icon above a small engraved label
        Array.prototype.forEach.call(panel.querySelectorAll('a'), function (a) {
            const text = a.lastChild;
            if (text && text.nodeType === 3) {
                const label = document.createElement('span');
                label.className = 'logo-menu__label';
                label.textContent = text.textContent.trim();
                a.replaceChild(label, text);
            }
        });

        logo.replaceWith(wrap);
        wrap.appendChild(btn);
        wrap.appendChild(panel);

        function setLogoColor() {
            btn.style.setProperty('--logo-hover-color', logoColors[Math.floor(Math.random() * logoColors.length)]);
        }
        function clearLogoColor() {
            if (!wrap.classList.contains('is-open')) {
                btn.style.removeProperty('--logo-hover-color');
            }
        }
        function openMenu() {
            wrap.classList.add('is-open');
            btn.setAttribute('aria-expanded', 'true');
            setLogoColor();
        }
        function closeMenu() {
            wrap.classList.remove('is-open');
            btn.setAttribute('aria-expanded', 'false');
            btn.style.removeProperty('--logo-hover-color');
        }
        function toggleMenu() {
            if (wrap.classList.contains('is-open')) closeMenu();
            else openMenu();
        }

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });
        btn.addEventListener('mouseenter', setLogoColor);
        btn.addEventListener('focus', setLogoColor);
        btn.addEventListener('mouseleave', clearLogoColor);
        btn.addEventListener('blur', clearLogoColor);

        document.addEventListener('click', function (e) {
            if (!wrap.contains(e.target)) closeMenu();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeMenu();
        });
    }

    // Handle image loading errors
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            this.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.style.width = '100%';
            placeholder.style.height = '100%';
            placeholder.style.background = '#e8e8e4';
            placeholder.style.display = 'flex';
            placeholder.style.alignItems = 'center';
            placeholder.style.justifyContent = 'center';
            placeholder.style.color = '#666';
            placeholder.style.fontSize = '0.9rem';
            placeholder.textContent = 'Image not found';
            this.parentElement.appendChild(placeholder);
        });
    });
});
