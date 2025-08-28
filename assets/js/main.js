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
   * Remove auto-scroll on initial load
   * Browsers will handle deep links (/#section) natively; we avoid forcing a scroll
   */
  // Intentionally disabled smooth-scroll on first load to prevent unwanted jumps

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
   * Spin logos via CSS; adjust duration with scroll
   */
  (function initLogoSpin() {
    const logos = document.querySelectorAll('.section-title .title-with-logo img, #header .profile img');
    const allowMotion = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
    if (!logos.length || !allowMotion) return;

    const BASE_SPEED = 360 / 9; // deg/s (idle ~9s per rotation)
    const MAX_SPEED = 120;       // deg/s cap
    let velocity = 0;            // px per ms
    let lastY = window.scrollY;
    let lastT = performance.now();
    const decay = 0.9;

    const setDuration = (seconds) => {
      const val = (Math.max(3, seconds)).toFixed(2) + 's';
      logos.forEach(logo => logo.style.setProperty('--logo-spin-duration', val));
    };
    setDuration(9);

    window.addEventListener('scroll', () => {
      const now = performance.now();
      const dy = Math.abs(window.scrollY - lastY);
      const dt = Math.max(now - lastT, 1);
      const v = dy / dt;
      velocity = Math.max(velocity, v);
      lastY = window.scrollY;
      lastT = now;
    }, { passive: true });

    const raf = () => {
      velocity *= decay;
      const boost = Math.min(velocity * 80, MAX_SPEED - BASE_SPEED); // deg/s
      const speed = BASE_SPEED + boost;
      const duration = 360 / speed;
      setDuration(duration);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  })();

})()
