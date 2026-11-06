// ============================================
// BK Čelákovice — Interactive Scripts
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initLogin();
    initNavbar();
    initMobileNav();
    initScrollAnimations();
    initCursorGlow();
    initActiveNavLink();
    initCopyButtons();
    initLightbox();
    initLoneCards();
});

// ============================================
// Center content of a card left alone in its row
// ============================================

function initLoneCards() {
    const grid = document.querySelector('.info-grid');
    if (!grid) return;

    const update = () => {
        const cols = parseInt(getComputedStyle(grid).getPropertyValue('--cols'), 10) || 1;
        const cards = [...grid.querySelectorAll(':scope > .info-card')];
        // offsetTop ignores the entrance-animation transform
        const rows = new Map();
        cards.forEach(card => {
            const top = card.offsetTop;
            rows.set(top, (rows.get(top) || 0) + 1);
        });
        cards.forEach(card => {
            const alone = cols > 1
                && rows.get(card.offsetTop) === 1
                && !card.classList.contains('card-wide');
            card.classList.toggle('row-alone', alone);
        });
    };

    update();
    new ResizeObserver(update).observe(grid);
}

// ============================================
// Image preview (lightbox)
// ============================================

function initLightbox() {
    const images = document.querySelectorAll('.card-image-below, .parking-img');
    if (!images.length) return;

    const dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    dialog.setAttribute('aria-label', 'Náhled obrázku');

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'lightbox-close';
    closeBtn.setAttribute('aria-label', 'Zavřít náhled');
    closeBtn.textContent = '×';

    const big = document.createElement('img');
    big.className = 'lightbox-img';

    dialog.append(closeBtn, big);
    document.body.appendChild(dialog);

    const close = () => dialog.close();
    closeBtn.addEventListener('click', close);
    // Click anywhere (backdrop or image) closes the preview
    dialog.addEventListener('click', (e) => {
        if (e.target !== closeBtn) close();
    });
    dialog.addEventListener('close', () => {
        document.body.style.overflow = '';
    });

    images.forEach(img => {
        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'lightbox-trigger';
        trigger.setAttribute('aria-label', `Zvětšit obrázek: ${img.alt}`);
        img.replaceWith(trigger);
        trigger.appendChild(img);

        trigger.addEventListener('click', () => {
            big.src = img.currentSrc || img.src;
            big.alt = img.alt;
            document.body.style.overflow = 'hidden';
            dialog.showModal();
            closeBtn.focus();
        });
    });
}

// ============================================
// Copy buttons for phone numbers and e-mails
// ============================================

function initCopyButtons() {
    const links = document.querySelectorAll(
        '.contact-details a.contact-item[href^="tel:"], .contact-details a.contact-item[href^="mailto:"]'
    );

    links.forEach(link => {
        const value = link.textContent.trim();
        const kind = link.href.startsWith('tel:') ? 'číslo' : 'e-mail';

        const row = document.createElement('div');
        row.className = 'contact-row';
        link.replaceWith(row);
        row.appendChild(link);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'copy-btn';
        btn.title = `Kopírovat ${kind}`;
        btn.setAttribute('aria-label', `Kopírovat ${kind} ${value}`);
        btn.innerHTML =
            '<svg class="icon-copy" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>' +
            '<svg class="icon-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
        row.appendChild(btn);

        let timer;
        btn.addEventListener('click', async () => {
            const ok = await copyText(value);
            if (!ok) return;
            btn.classList.add('copied');
            btn.title = 'Zkopírováno';
            clearTimeout(timer);
            timer = setTimeout(() => {
                btn.classList.remove('copied');
                btn.title = `Kopírovat ${kind}`;
            }, 1500);
        });
    });
}

async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        return ok;
    }
}

// ============================================
// Password gate
// ============================================

function initLogin() {
    const overlay = document.getElementById('loginOverlay');
    const form = document.getElementById('loginForm');
    const input = document.getElementById('loginPassword');
    const error = document.getElementById('loginError');
    const HASH = '13837d79e7fe13b66fd202e1a9892a9c6f1114f1defac9e2358b7cf9952d092f';

    if (localStorage.getItem('bk_auth') === HASH) {
        overlay.classList.add('hidden');
        return;
    }

    document.body.style.overflow = 'hidden';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const hash = await sha256(input.value);
        if (hash === HASH) {
            localStorage.setItem('bk_auth', HASH);
            overlay.classList.add('hidden');
            document.body.style.overflow = '';
        } else {
            error.classList.add('show');
            input.value = '';
            input.focus();
            setTimeout(() => error.classList.remove('show'), 2000);
        }
    });
}

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================
// Navbar scroll effect
// ============================================

function initNavbar() {
    const navbar = document.getElementById('navbar');
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                navbar.classList.toggle('scrolled', window.scrollY > 50);
                ticking = false;
            });
            ticking = true;
        }
    });
}

// ============================================
// Mobile navigation
// ============================================

function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    const navbar = document.getElementById('navbar');

    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'navLinks');
    toggle.setAttribute('aria-label', 'Otevřít menu');

    const setOpen = (open) => {
        toggle.classList.toggle('active', open);
        links.classList.toggle('open', open);
        navbar.classList.toggle('menu-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Zavřít menu' : 'Otevřít menu');
        document.body.style.overflow = open ? 'hidden' : '';
    };

    toggle.addEventListener('click', () => setOpen(!links.classList.contains('open')));

    // Close on link click or Escape
    links.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => setOpen(false));
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && links.classList.contains('open')) setOpen(false);
    });
}

// ============================================
// Scroll animations (Intersection Observer)
// ============================================

function initScrollAnimations() {
    const elements = document.querySelectorAll('[data-animate]');

    // Immediately reveal hero elements (inside #hero or .stats-bar)
    elements.forEach(el => {
        if (el.closest('#hero') || el.closest('.hero')) {
            el.classList.add('visible');
        }
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.05,
            rootMargin: '0px 0px -20px 0px'
        }
    );

    elements.forEach(el => {
        if (!el.classList.contains('visible')) {
            observer.observe(el);
        }
    });
}

// ============================================
// Cursor glow effect
// ============================================

function initCursorGlow() {
    const glow = document.getElementById('cursorGlow');
    if (!glow) return;

    // Disable on touch devices
    if ('ontouchstart' in window) {
        glow.style.display = 'none';
        return;
    }

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animate() {
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;
        glow.style.left = glowX + 'px';
        glow.style.top = glowY + 'px';
        requestAnimationFrame(animate);
    }

    animate();
}

// ============================================
// Active nav link on scroll
// ============================================

function initActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.toggle('active',
                            link.getAttribute('href') === `#${id}`
                        );
                    });
                }
            });
        },
        {
            threshold: 0.3,
            rootMargin: '-80px 0px -50% 0px'
        }
    );

    sections.forEach(section => observer.observe(section));
}
