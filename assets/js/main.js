(function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    let position = window.scrollY + 200
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return
      let section = select(navbarlink.hash)
      if (!section) return
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active')
      } else {
        navbarlink.classList.remove('active')
      }
    })
  }
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let elementPos = select(el).offsetTop
    window.scrollTo({
      top: elementPos,
      behavior: 'smooth'
    })
  }

  /**
   * Slower, eased scroll for featured links
   */
  const scrolltoSlow = (el, duration = 900) => {
    const target = select(el)
    if (!target) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return scrollto(el)
    }
    const startY = window.scrollY
    const targetY = target.offsetTop
    const diff = targetY - startY
    let start
    const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    const step = (ts) => {
      if (start === undefined) start = ts
      const elapsed = ts - start
      const progress = Math.min(elapsed / duration, 1)
      window.scrollTo(0, startY + diff * easeInOutCubic(progress))
      if (elapsed < duration) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('body').classList.toggle('mobile-nav-active')
    this.classList.toggle('bi-list')
    this.classList.toggle('bi-x')
  })

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault()

      let body = select('body')
      if (body.classList.contains('mobile-nav-active')) {
        body.classList.remove('mobile-nav-active')
        let navbarToggle = select('.mobile-nav-toggle')
        navbarToggle.classList.toggle('bi-list')
        navbarToggle.classList.toggle('bi-x')
      }
      if (this.dataset && this.dataset.slowScroll === 'true') {
        scrolltoSlow(this.hash, 900)
      } else {
        scrollto(this.hash)
      }
    }
  }, true)

  /**
   * Scroll with ofset on page load with hash links in the url
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash)
      }
    }
  });

  /**
   * Hero type effect
   */
  const typed = select('.typed')
  if (typed) {
    let typed_strings = typed.getAttribute('data-typed-items')
    typed_strings = typed_strings.split(',')
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  /**
   * Skills animation
   */
  let skilsContent = select('.skills-content');
  if (skilsContent) {
    new Waypoint({
      element: skilsContent,
      offset: '80%',
      handler: function(direction) {
        let progress = select('.progress .progress-bar', true);
        progress.forEach((el) => {
          el.style.width = el.getAttribute('aria-valuenow') + '%'
        });
      }
    })
  }

  /**
   * Porfolio isotope and filter
   */
  window.addEventListener('load', () => {
    let portfolioContainer = select('.portfolio-container');
    if (portfolioContainer && typeof Isotope !== 'undefined') {
      let portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: '.portfolio-item'
      });

      let portfolioFilters = select('#portfolio-flters li', true);

      on('click', '#portfolio-flters li', function(e) {
        e.preventDefault();
        portfolioFilters.forEach(function(el) {
          el.classList.remove('filter-active');
        });
        this.classList.add('filter-active');

        portfolioIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        portfolioIsotope.on('arrangeComplete', function() {
          AOS.refresh()
        });
      }, true);
    }

  });

  /**
   * Initiate portfolio lightbox 
   */
  let portfolioLightbox;
  if (typeof GLightbox !== 'undefined' && document.querySelector('.portfolio-lightbox')) {
    portfolioLightbox = GLightbox({
      selector: '.portfolio-lightbox'
    });
  }

  /**
   * Portfolio details slider
   */
  if (select('.portfolio-details-slider')) {
    new Swiper('.portfolio-details-slider', {
      speed: 400,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      },
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true
      }
    });
  }

  /**
   * Testimonials slider
   */
  if (select('.testimonials-slider')) {
    new Swiper('.testimonials-slider', {
      speed: 600,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      },
      slidesPerView: 'auto',
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true
      },
      breakpoints: {
        320: {
          slidesPerView: 1,
          spaceBetween: 20
        },

        1200: {
          slidesPerView: 3,
          spaceBetween: 20
        }
      }
    });
  }

  /**
   * Animation on scroll
   */
  window.addEventListener('load', () => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
  });

  /**
   * Initiate Pure Counter 
   */
  new PureCounter();

let readMoreTextElements = document.querySelectorAll('.resume-item > span');

// Toggle read-more blocks without console noise in production
readMoreTextElements.forEach(element => {
  element.addEventListener('click', () => {
    element.closest('.resume-item').querySelector('.read-more-text').classList.toggle('show');
  });
});

  /**
   * Auto-update footer year
   */
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /**
   * Subtle parallax for hero content (mouse-based)
   */
  const hero = select('#hero');
  const heroContainer = select('#hero .hero-container');
  const allowParallax = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  if (hero && heroContainer && allowParallax) {
    const handleMove = (e) => {
      const rect = hero.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;  // -0.5 .. 0.5
      const dy = (e.clientY - cy) / rect.height; // -0.5 .. 0.5
      const max = 8; // px
      heroContainer.style.transform = `translate3d(${(-dx * max).toFixed(2)}px, ${(-dy * max).toFixed(2)}px, 0)`;
    };
    hero.addEventListener('mousemove', handleMove);
    hero.addEventListener('mouseleave', () => {
      heroContainer.style.transform = 'translate3d(0,0,0)';
    });
  }

  /**
   * Lightweight page search (by sections)
   */
  const searchInput = document.getElementById('search-input');
  const resultsList = document.getElementById('search-results');
  if (searchInput && resultsList) {
    const sections = [...document.querySelectorAll('main section[id]')];
    const index = sections.map(sec => {
      const titleEl = sec.querySelector('.section-title h2') || sec.querySelector('h2') || sec.querySelector('h3');
      const title = titleEl ? titleEl.textContent.trim() : sec.id;
      const text = sec.textContent.replace(/\s+/g, ' ').trim();
      return { id: sec.id, title, text };
    });

    const renderResults = (items) => {
      resultsList.innerHTML = '';
      items.slice(0, 10).forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${item.id}`;
        a.className = 'scrollto';
        a.textContent = `${item.title}`;
        li.appendChild(a);
        resultsList.appendChild(li);
      });
      if (!items.length && searchInput.value.trim().length) {
        const li = document.createElement('li');
        li.textContent = 'No matches';
        resultsList.appendChild(li);
      }
    };

    const doSearch = (q) => {
      const query = q.toLowerCase().trim();
      if (!query) {
        resultsList.innerHTML = '';
        return;
      }
      const results = index.filter(item =>
        item.title.toLowerCase().includes(query) || item.text.toLowerCase().includes(query)
      );
      renderResults(results);
    };

    searchInput.addEventListener('input', (e) => doSearch(e.target.value));

    // Delegate scrolling behavior for dynamically created links
    resultsList.addEventListener('click', (e) => {
      const target = e.target.closest('a');
      if (target && target.hash) {
        e.preventDefault();
        const body = select('body');
        if (body.classList.contains('mobile-nav-active')) {
          body.classList.remove('mobile-nav-active')
          const navbarToggle = select('.mobile-nav-toggle')
          navbarToggle.classList.toggle('bi-list')
          navbarToggle.classList.toggle('bi-x')
        }
        scrollto(target.hash);
      }
    });
  }

  /**
   * Spin logo with base speed; increase speed gently while scrolling
   * - JS-driven rotation ensures consistent clockwise direction
   */
  (function initLogoSpin() {
    const logos = select('.section-title .title-with-logo img', true);
    const allowMotion = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
    if (!logos || !logos.length || !allowMotion) return;

    // Per-logo state
    const states = logos.map(() => ({ angle: 0 }));

    // Base angular velocity (deg/s) and scroll boost
    const BASE = 360 / 24; // 15 deg/s for a ~24s rotation (faster idle)
    let lastY = window.scrollY;
    let lastT = performance.now();
    let velocity = 0;           // px per ms (smoothed)
    const decay = 0.88;         // smoothing factor per frame (slightly stickier)
    const MAX_SPEED = 72;       // deg/s cap (a bit faster on scroll)

    const raf = (now) => {
      const dtMs = now - lastT;
      const dt = Math.max(dtMs, 0.1);
      const dy = Math.abs(window.scrollY - lastY);
      const v = dy / dt;             // px/ms
      velocity = Math.max(velocity * decay, v);

      // Slightly stronger boost from scroll activity; clamp to MAX_SPEED
      const boost = Math.min(velocity * 50, MAX_SPEED - BASE); // deg/s
      const speed = BASE + boost; // deg/s
      const delta = speed * (dt / 1000);

      states.forEach((s, idx) => {
        s.angle = (s.angle + delta) % 360;
        logos[idx].style.transform = `rotate(${s.angle.toFixed(2)}deg)`;
      });

      lastY = window.scrollY;
      lastT = now;
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  })();

})()
