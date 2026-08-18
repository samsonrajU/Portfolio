/* =========================================================
   Portfolio interactions
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

    /* ---------- Footer year ---------- */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- Hero image fallback ----------
       Shows a placeholder card if assets/profile.jpg is missing. */
    const profileImage = document.getElementById('profileImage');
    const imageFallback = document.getElementById('imageFallback');

    const showFallback = () => {
        if (profileImage) profileImage.style.display = 'none';
        if (imageFallback) imageFallback.style.display = 'grid';
    };
    const hideFallback = () => {
        if (imageFallback) imageFallback.style.display = 'none';
    };

    if (profileImage) {
        profileImage.addEventListener('error', showFallback);
        profileImage.addEventListener('load', hideFallback);
        // Handle images that failed before this script ran
        if (profileImage.complete) {
            profileImage.naturalWidth === 0 ? showFallback() : hideFallback();
        }
    }

    /* ---------- Navbar background on scroll ---------- */
    const navbar = document.getElementById('navbar');
    const onScrollNavbar = () => {
        if (!navbar) return;
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    };
    onScrollNavbar();

    /* ---------- Keep --nav-height in sync with the real navbar height ----------
       Prevents the hero (and anchor scrolling) from ever overlapping the header,
       regardless of screen size, font scaling, or the logo wrapping. */
    const syncNavHeight = () => {
        if (!navbar) return;
        document.documentElement.style.setProperty('--nav-height', `${navbar.offsetHeight}px`);
    };
    syncNavHeight();
    window.addEventListener('resize', syncNavHeight);
    window.addEventListener('orientationchange', syncNavHeight);
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(syncNavHeight).catch(() => {});
    }

    /* ---------- Mobile menu ---------- */
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navOverlay = document.getElementById('navOverlay');

    const closeMenu = () => {
        if (!hamburger || !navMenu) return;
        hamburger.classList.remove('open');
        navMenu.classList.remove('open');
        if (navOverlay) navOverlay.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            hamburger.classList.toggle('open', isOpen);
            if (navOverlay) navOverlay.classList.toggle('open', isOpen);
            hamburger.setAttribute('aria-expanded', String(isOpen));
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        if (navOverlay) {
            navOverlay.addEventListener('click', closeMenu);
        }

        // Close when clicking outside the panel
        document.addEventListener('click', (e) => {
            if (!navMenu.classList.contains('open')) return;
            if (navMenu.contains(e.target) || hamburger.contains(e.target)) return;
            closeMenu();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });

        // Close the drawer automatically if the viewport grows back to desktop size
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) closeMenu();
        });
    }

    /* ---------- Scroll spy for nav links ---------- */
    const sections = Array.from(document.querySelectorAll('section[id]'));
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));

    const onScrollSpy = () => {
        const offset = window.scrollY + window.innerHeight * 0.28;
        let currentId = sections.length ? sections[0].id : null;

        sections.forEach(section => {
            if (section.offsetTop <= offset) currentId = section.id;
        });

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
        });
    };

    /* ---------- Throttled scroll handling ---------- */
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
            onScrollNavbar();
            onScrollSpy();
            ticking = false;
        });
    }, { passive: true });

    onScrollSpy();

    /* ---------- Scroll reveal animations ---------- */
    const revealItems = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (!entry.isIntersecting) return;
                // Slight stagger for items entering together
                entry.target.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

        revealItems.forEach(item => observer.observe(item));
    } else {
        revealItems.forEach(item => item.classList.add('visible'));
    }

    /* ---------- Experience: view more / less ---------- */
    const viewMoreBtn = document.getElementById('viewMoreBtn');
    const moreExperience = document.getElementById('moreExperience');
    const viewMoreLabel = document.getElementById('viewMoreLabel');

    if (viewMoreBtn && moreExperience) {
        viewMoreBtn.addEventListener('click', () => {
            const isExpanded = moreExperience.classList.toggle('expanded');

            moreExperience.style.maxHeight = isExpanded
                ? `${moreExperience.scrollHeight + 40}px`
                : '0px';

            viewMoreBtn.classList.toggle('expanded', isExpanded);
            viewMoreBtn.setAttribute('aria-expanded', String(isExpanded));
            if (viewMoreLabel) {
                viewMoreLabel.textContent = isExpanded ? 'Show Less' : 'View More Experience';
            }

            // Reveal any hidden animated items inside
            if (isExpanded) {
                moreExperience.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
            }
        });

        // Keep height accurate on resize while open
        window.addEventListener('resize', () => {
            if (moreExperience.classList.contains('expanded')) {
                moreExperience.style.maxHeight = `${moreExperience.scrollHeight + 40}px`;
            }
        });
    }

    /* ---------- Contact form ---------- */
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = contactForm.querySelector('#name').value.trim();
            const email = contactForm.querySelector('#email').value.trim();
            const message = contactForm.querySelector('#message').value.trim();
            const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

            if (!name || !email || !message) {
                if (formStatus) formStatus.textContent = 'Please fill in every field.';
                return;
            }
            if (!emailValid) {
                if (formStatus) formStatus.textContent = 'Please enter a valid email address.';
                return;
            }

            // No backend: hand off to the user's mail client
            const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
            const body = encodeURIComponent(`${message}\n\n—\n${name}\n${email}`);
            window.location.href = `mailto:samsonrajubbani@gmail.com?subject=${subject}&body=${body}`;

            if (formStatus) formStatus.textContent = 'Opening your email client…';
            contactForm.reset();
        });
    }

    /* ---------- Smooth anchor scrolling with navbar offset ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const navHeight = navbar ? navbar.offsetHeight : 0;
            const top = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

});
