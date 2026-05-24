/* ====================================
   FRESH BAKED GOODNESS — REDESIGN
   script.js — Premium Interactions
   ==================================== */

(function () {
  'use strict';

  /* ============================================================
     1. SCROLL PROGRESS BAR
  ============================================================ */
  const progressBar = document.getElementById('scrollProgress');
  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = ((scrollTop / docHeight) * 100) + '%';
  }

  /* ============================================================
     2. NAVBAR: scroll class + active link highlight
  ============================================================ */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link:not(.nav-cta)');
  const sections = document.querySelectorAll('section[id], .cta-banner');

  function updateNavbar() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active link
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.id || '';
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
  }

  /* ============================================================
     3. HAMBURGER MOBILE MENU
  ============================================================ */
  const hamburger = document.getElementById('hamburger');
  const navLinksContainer = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinksContainer.classList.toggle('open');
    document.body.style.overflow = navLinksContainer.classList.contains('open') ? 'hidden' : '';
  });

  navLinksContainer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinksContainer.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ============================================================
     4. HERO IMAGE LOAD ANIMATION
  ============================================================ */
  const heroImg = document.getElementById('heroImg');
  if (heroImg) {
    if (heroImg.complete) {
      heroImg.classList.add('loaded');
    } else {
      heroImg.addEventListener('load', () => heroImg.classList.add('loaded'));
    }
  }

  /* ============================================================
     5. SCROLL REVEAL ANIMATIONS (IntersectionObserver)
  ============================================================ */
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-card');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach(el => revealObserver.observe(el));

  /* ============================================================
     6. PARALLAX SCROLLING — hero
  ============================================================ */
  function handleParallax() {
    const hero = document.querySelector('.hero-bg .hero-img');
    if (!hero) return;
    const scroll = window.scrollY;
    hero.style.transform = `scale(1) translateY(${scroll * 0.3}px)`;
  }

  /* ============================================================
     7. TESTIMONIALS CAROUSEL
  ============================================================ */
  const track      = document.getElementById('testimonialsTrack');
  const dotsWrap   = document.getElementById('testiDots');
  const prevBtn    = document.getElementById('testiPrev');
  const nextBtn    = document.getElementById('testiNext');

  if (track) {
    const cards = track.querySelectorAll('.testi-card');
    let current = 0;
    let autoTimer;
    let cardsPerView = getCardsPerView();

    function getCardsPerView() {
      if (window.innerWidth <= 700) return 1;
      if (window.innerWidth <= 900) return 2;
      return 3;
    }

    const totalSlides = Math.ceil(cards.length / cardsPerView);

    // Build dots
    function buildDots() {
      dotsWrap.innerHTML = '';
      for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('button');
        dot.className = 'testi-dot' + (i === current ? ' active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      }
    }

    function goTo(index) {
      current = Math.max(0, Math.min(index, totalSlides - 1));
      const cardWidth = cards[0].offsetWidth + 24; // gap
      track.style.transform = `translateX(-${current * cardsPerView * cardWidth}px)`;
      dotsWrap.querySelectorAll('.testi-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
      resetAuto();
    }

    function next() { goTo(current < totalSlides - 1 ? current + 1 : 0); }
    function prev() { goTo(current > 0 ? current - 1 : totalSlides - 1); }

    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(next, 5000);
    }

    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);

    buildDots();
    resetAuto();

    // Touch/swipe support
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    });

    // Resize
    window.addEventListener('resize', () => {
      const newCPV = getCardsPerView();
      if (newCPV !== cardsPerView) {
        cardsPerView = newCPV;
        current = 0;
        buildDots();
        goTo(0);
      }
    });
  }

  /* ============================================================
     8. ORDER UI — Quantity Controls & Cart
  ============================================================ */
  const cart = {};
  const orderItemsEl  = document.getElementById('orderItems');
  const orderTotalEl  = document.getElementById('orderTotal');
  const totalAmountEl = document.getElementById('totalAmount');
  const whatsappBtn   = document.getElementById('whatsappBtn');

  document.querySelectorAll('.order-product-card').forEach(card => {
    const name     = card.dataset.name;
    const price    = parseInt(card.dataset.price, 10);
    const qtyEl    = card.querySelector('.qty-num');
    const minusBtn = card.querySelector('.qty-btn.minus');
    const plusBtn  = card.querySelector('.qty-btn.plus');

    cart[name] = 0;

    plusBtn.addEventListener('click', () => {
      cart[name]++;
      qtyEl.textContent = cart[name];
      qtyEl.classList.add('bump');
      setTimeout(() => qtyEl.classList.remove('bump'), 200);
      updateCart();
    });

    minusBtn.addEventListener('click', () => {
      if (cart[name] > 0) {
        cart[name]--;
        qtyEl.textContent = cart[name];
        updateCart();
      }
    });
  });

  function updateCart() {
    const entries = Object.entries(cart).filter(([, qty]) => qty > 0);
    const total   = entries.reduce((sum, [name, qty]) => {
      const price = parseInt(
        document.querySelector(`.order-product-card[data-name="${name}"]`).dataset.price, 10
      );
      return sum + price * qty;
    }, 0);

    if (entries.length === 0) {
      orderItemsEl.innerHTML = `
        <div class="order-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9m5-9l2 9"/>
          </svg>
          <p>No items yet.<br/>Add a cake below!</p>
        </div>`;
      orderTotalEl.style.display = 'none';
      if (whatsappBtn) whatsappBtn.style.display = 'none';
    } else {
      let html = '';
      entries.forEach(([name, qty]) => {
        const price = parseInt(
          document.querySelector(`.order-product-card[data-name="${name}"]`).dataset.price, 10
        );
        html += `
          <div class="order-item-row">
            <span>${name} × ${qty}</span>
            <strong>₹${(price * qty).toLocaleString('en-IN')}</strong>
          </div>`;
      });
      orderItemsEl.innerHTML = html;
      orderTotalEl.style.display = 'flex';
      totalAmountEl.textContent = '₹' + total.toLocaleString('en-IN');
      if (whatsappBtn) {
        whatsappBtn.style.display = 'inline-flex';
        // Build WhatsApp message
        let msg = 'Hi! I\'d like to order:\n';
        entries.forEach(([name, qty]) => { msg += `• ${name} × ${qty}\n`; });
        msg += `\nTotal: ₹${total.toLocaleString('en-IN')}`;
        whatsappBtn.href = `https://wa.me/919962104626?text=${encodeURIComponent(msg)}`;
      }
    }
  }

  /* Quick order trigger from bestsellers cards */
  window.openOrder = function (name) {
    document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      const card = document.querySelector(`.order-product-card[data-name="${name}"]`);
      if (card) {
        card.querySelector('.qty-btn.plus').click();
        card.style.outline = '2px solid var(--gold)';
        setTimeout(() => { card.style.outline = ''; }, 1600);
      }
    }, 700);
  };

  /* ============================================================
     9. GALLERY LIGHTBOX
  ============================================================ */
  const lightbox     = document.getElementById('lightbox');
  const lightboxImg  = document.getElementById('lightboxImg');
  const lightboxCap  = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const cap = item.querySelector('.gallery-hover span');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxCap.textContent = cap ? cap.textContent : '';
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ============================================================
     10. SMOOTH SCROLL for anchor links
  ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 80;
      window.scrollTo({
        top: target.offsetTop - offset,
        behavior: 'smooth'
      });
    });
  });

  /* ============================================================
     11. STAGGER CHILDREN inside visible sections
  ============================================================ */
  const staggerParents = document.querySelectorAll('.products-grid, .footer-grid, .sig-features');
  const staggerObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.product-card, .footer-links-col, .sig-feat').forEach((child, i) => {
          child.style.animationDelay = `${i * 0.1}s`;
          child.classList.add('stagger-in');
        });
        staggerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  staggerParents.forEach(p => staggerObserver.observe(p));

  /* ============================================================
     12. NUMBER COUNTER ANIMATION for hero stats
  ============================================================ */
  function animateCounter(el, target, duration, suffix) {
    const start = 0;
    const startTime = performance.now();
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(start + (target - start) * ease);
      el.textContent = value.toLocaleString('en-IN') + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const stats = entry.target.querySelectorAll('.stat-num');
        stats.forEach(stat => {
          const text = stat.textContent;
          const suffix = text.replace(/[\d,]/g, '');
          const num = parseInt(text.replace(/\D/g, ''), 10);
          if (!isNaN(num)) animateCounter(stat, num, 1800, suffix);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) statsObserver.observe(heroStats);

  /* ============================================================
     13. FLOATING WHATSAPP BUTTON — entrance
  ============================================================ */
  const floatingWa = document.querySelector('.floating-whatsapp');
  if (floatingWa) {
    setTimeout(() => {
      floatingWa.style.opacity = '1';
      floatingWa.style.transform = 'scale(1)';
    }, 2000);
    floatingWa.style.opacity = '0';
    floatingWa.style.transform = 'scale(0)';
    floatingWa.style.transition = 'opacity 0.5s, transform 0.5s, box-shadow 0.3s';
  }

  /* ============================================================
     14. CARD HOVER — 3D tilt (subtle)
  ============================================================ */
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      card.style.transform = `translateY(-8px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ============================================================
     15. COMBINED SCROLL HANDLER
  ============================================================ */
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateProgress();
        updateNavbar();
        handleParallax();
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Initial call */
  updateNavbar();
  updateProgress();

})();
