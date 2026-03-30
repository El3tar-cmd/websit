/**
 * main.js — Bold Creatives interactions
 * Navigation, Modal, Accordion, Slider, Scroll Animations, Cursor
 */

// ============================================================
// PAGE TRANSITION (Grid Squares)
// ============================================================
function initPageTransition() {
  const overlay = document.querySelector('.page-transition');
  if (!overlay) return;
  
  // Calculate grid dimensions dynamic as in reference
  const size = window.innerWidth < 768 ? 45 : 80;
  const cols = Math.ceil(window.innerWidth / size);
  const rows = Math.ceil(window.innerHeight / size);
  
  overlay.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  overlay.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  
  // Clean up and rebuild tiles
  overlay.innerHTML = '';
  const totalTiles = cols * rows;

  for (let i = 0; i < totalTiles; i++) {
    const tile = document.createElement('div');
    tile.classList.add('transition-tile');
    
    // Exact random delay as in reference
    tile.style.transitionDelay = `${Math.random() * 0.4}s`;
    
    overlay.appendChild(tile);
  }

  // Initial reveal (Page Load)
  requestAnimationFrame(() => {
    overlay.classList.add('loaded');
    setTimeout(() => {
      overlay.style.pointerEvents = 'none';
      overlay.classList.remove('active'); 
    }, 1600); // Increased for slower fade
  });
}

// ============================================================
// NAVIGATION (With Grid Trigger)
// ============================================================
function navigateTo(url) {
  const overlay = document.querySelector('.page-transition');
  if (!overlay) {
    window.location.href = url;
    return;
  }

  overlay.style.pointerEvents = 'all';
  overlay.classList.remove('loaded');
  overlay.classList.add('active');

  // Random delays as in reference
  const tiles = overlay.querySelectorAll('.transition-tile');
  tiles.forEach((tile) => {
    tile.style.transitionDelay = `${Math.random() * 0.4}s`;
  });

  setTimeout(() => {
    window.location.href = url;
  }, 1400); // Increased wait for slower transition
}

// ============================================================
// CUSTOM CURSOR
// ============================================================
function initCursor() {
  const cursor = document.querySelector('.cursor');
  if (!cursor || window.matchMedia('(pointer: coarse)').matches) {
    if (cursor) cursor.style.display = 'none';
    return;
  }
  let mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });

  document.querySelectorAll('a, button, .work-card, .work-grid-card, .accordion__header, .nav__item, .news-card, .service-row').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });

  function loop() {
    cx += (mx - cx) * 0.14;
    cy += (my - cy) * 0.14;
    cursor.style.left = cx + 'px';
    cursor.style.top = cy + 'px';
    requestAnimationFrame(loop);
  }
  loop();
}

// ============================================================
// NAVIGATION
// ============================================================
function initNav() {
  const pages = {
    'home': 'index.html',
    'who': 'who-we-are.html',
    'what': 'what-we-do.html',
    'work': 'our-work.html',
    'news': 'news.html'
  };

  // Handle ALL [data-page] elements (nav, mobile menu, buttons, links)
  const items = document.querySelectorAll('[data-page]');
  items.forEach(item => {
    item.addEventListener('click', () => {
      const page = item.getAttribute('data-page');
      if (item.classList.contains('active')) return;
      navigateTo(pages[page] || 'index.html');
    });
  });

  const ham = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (ham && mobileMenu) {
    ham.addEventListener('click', () => {
      ham.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
  }
}

// ============================================================
// CONTACT MODAL
// ============================================================
function initModal() {
  const overlay = document.querySelector('.modal-overlay');
  if (!overlay) return;
  const backdrop = overlay.querySelector('.modal-backdrop');
  const closeBtn = overlay.querySelector('.modal__close');
  const triggers = document.querySelectorAll('[data-modal="contact"]');
  const tabs = overlay.querySelectorAll('.modal__tab');

  function open() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  triggers.forEach(t => t.addEventListener('click', open));
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (backdrop) backdrop.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const title = overlay.querySelector('.modal__title');
      const map = {
        'work': "Let's work together.",
        'talk': "Talk to us;\nwe're all ears.",
        'join': "Join our team."
      };
      if (title) title.textContent = map[tab.dataset.tab] || "Talk to us;\nwe're all ears.";
    });
  });
}

// ============================================================
// ACCORDION (Homepage Services)
// ============================================================
function initAccordion() {
  const items = document.querySelectorAll('.accordion__item');
  if (!items.length) return;

  items.forEach(item => {
    const header = item.querySelector('.accordion__header');
    if (!header) return;
    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      items.forEach(i => i.classList.remove('open'));
      // Toggle clicked
      if (!isOpen) item.classList.add('open');
    });
  });
}

// ============================================================
// SERVICE TOGGLES (Show More/Less)
// ============================================================
function initServiceToggles() {
  const toggles = document.querySelectorAll('[data-action="toggle-service"]');
  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.service-row');
      if (!row) return;

      const isOpen = row.classList.contains('open');
      
      // Close others if you want a true accordion (optional)
      // document.querySelectorAll('.service-row').forEach(r => r.classList.remove('open'));
      
      if (isOpen) {
        row.classList.remove('open');
        btn.innerHTML = 'Show more <span class="arrow">↓</span>';
      } else {
        row.classList.add('open');
        btn.innerHTML = 'Show less <span class="arrow">↑</span>';
      }
    });
  });
}

// ============================================================
// WORK SLIDER
// ============================================================
function initSlider() {
  const slider = document.querySelector('.work-slider');
  const prevBtn = document.querySelector('.slider-btn--prev');
  const nextBtn = document.querySelector('.slider-btn--next');
  if (!slider) return;

  let idx = 0;
  const cards = slider.querySelectorAll('.work-card');
  const total = cards.length;

  function getVisible() {
    const w = window.innerWidth;
    return w > 1100 ? 3 : w > 768 ? 2 : 1;
  }

  function getOffset() {
    if (cards.length === 0) return 0;
    const card = cards[0];
    return card.offsetWidth + 20; 
  }

  function update() {
    const maxIdx = Math.max(0, total - getVisible());
    idx = Math.min(idx, maxIdx);
    slider.style.transform = `translateX(-${idx * getOffset()}px)`;
    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) nextBtn.disabled = idx >= maxIdx;
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { if (idx > 0) { idx--; update(); } });
  if (nextBtn) nextBtn.addEventListener('click', () => { if (idx < total - getVisible()) { idx++; update(); } });

  let touchStartX = 0;
  slider.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && idx < total - getVisible()) { idx++; update(); }
      else if (diff < 0 && idx > 0) { idx--; update(); }
    }
  });

  window.addEventListener('resize', update);
  update();
}

// ============================================================
// SCROLL ANIMATIONS
// ============================================================
function initScrollAnimations() {
  const els = document.querySelectorAll('.fade-up, .fade-in, .stagger');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  els.forEach(el => observer.observe(el));
}

// ============================================================
// WORK FILTERS
// ============================================================
function initFilters() {
  const btns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.work-grid-card');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      cards.forEach(card => {
        const cat = card.getAttribute('data-category') || 'all';
        const show = filter === 'all' || cat === filter;
        card.style.opacity = show ? '1' : '0.2';
        card.style.pointerEvents = show ? 'auto' : 'none';
        card.style.transition = 'opacity 0.3s ease';
      });
    });
  });
}

// ============================================================
// LOGO NAV
// ============================================================
function initLogoNav() {
  const logo = document.querySelector('.nav__logo');
  if (logo) {
    logo.addEventListener('click', () => {
      navigateTo('index.html');
    });
  }
}

// ============================================================
// INIT ON DOM READY
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initPageTransition();
  initCursor();
  initNav();
  initModal();
  initAccordion();
  initServiceToggles();
  initSlider();
  initScrollAnimations();
  initFilters();
  initLogoNav();

  if (window.DitherEngine) {
    window.DitherEngine.initHeroCanvas();
    window.DitherEngine.initBannerCanvas('banner-canvas');
    window.DitherEngine.initEyesCanvas();
  }
});
