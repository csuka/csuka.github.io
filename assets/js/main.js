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
        navbarlink.setAttribute('aria-current', 'page')
      } else {
        navbarlink.classList.remove('active')
        navbarlink.removeAttribute('aria-current')
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
    const body = select('body')
    body.classList.toggle('mobile-nav-active')
    const icon = this.querySelector('i') || this
    icon.classList.toggle('bx-menu')
    icon.classList.toggle('bx-x')
    const expanded = this.getAttribute('aria-expanded') === 'true'
    this.setAttribute('aria-expanded', String(!expanded))
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
        if (navbarToggle) {
          const icon = navbarToggle.querySelector('i') || navbarToggle
          icon.classList.add('bx-menu')
          icon.classList.remove('bx-x')
          navbarToggle.setAttribute('aria-expanded', 'false')
        }
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
   * Hero type effect (lazy init when visible)
   */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const onVisible = (elOrSelector, cb, options = { rootMargin: '200px 0px', threshold: 0.1 }) => {
    const el = typeof elOrSelector === 'string' ? select(elOrSelector) : elOrSelector
    if (!el) return
    if (!('IntersectionObserver' in window)) { cb(); return }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          cb()
          io.disconnect()
        }
      })
    }, options)
    io.observe(el)
  }

  const typed = select('.typed')
  if (typed) {
    let typed_strings = typed.getAttribute('data-typed-items')
      .split(',').map(s => s.trim())
    if (reduceMotion) {
      typed.textContent = typed_strings[0] || ''
    } else {
      onVisible('#hero', () => {
        if (typeof Typed === 'undefined') return
        new Typed('.typed', {
          strings: typed_strings,
          loop: true,
          typeSpeed: 100,
          backSpeed: 50,
          backDelay: 2000
        })
      })
    }
  }

  /**
   * Skills animation
   */
  let skilsContent = select('.skills-content');
  if (skilsContent) {
    onVisible('.skills-content', () => {
      if (typeof Waypoint === 'undefined') {
        // Fallback: fill bars when visible
        let progress = select('.progress .progress-bar', true)
        progress.forEach((el) => { el.style.width = el.getAttribute('aria-valuenow') + '%' })
        return
      }
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
    })
  }

  // Removed portfolio/GLightbox code paths (no portfolio present)

  /**
   * Testimonials slider
   */
  if (select('.testimonials-slider')) {
    onVisible('#testimonials', () => {
      if (typeof Swiper === 'undefined') return
      new Swiper('.testimonials-slider', {
        speed: 600,
        loop: true,
        autoplay: reduceMotion ? false : { delay: 5000, disableOnInteraction: false },
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
      })
    })
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
  onVisible('#facts', () => { if (typeof PureCounter !== 'undefined') new PureCounter() })

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
          if (navbarToggle) {
            const icon = navbarToggle.querySelector('i') || navbarToggle
            icon.classList.add('bx-menu')
            icon.classList.remove('bx-x')
            navbarToggle.setAttribute('aria-expanded', 'false')
          }
        }
        scrollto(target.hash);
      }
    });
  }

  /**
   * Spin logos via CSS only (no scroll-based changes)
   */
  (function initLogoSpin() {
    const logos = document.querySelectorAll('.section-title .title-with-logo img');
    const allowMotion = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
    if (!logos.length || !allowMotion) return;
    logos.forEach(logo => logo.style.setProperty('--logo-spin-duration', '9s'));
  })();

  /**
   * Make certificate cards fully clickable
   */
  (function makeCertificatesClickable() {
    const cards = document.querySelectorAll('#certificates .icon-box');
    if (!cards.length) return;
    cards.forEach(card => {
      const link = card.querySelector('.title a') || card.querySelector('.description a');
      if (!link) return;
      card.setAttribute('role', 'link');
      card.setAttribute('tabindex', '0');
      const go = () => window.open(link.href, link.target || '_self');
      card.addEventListener('click', (e) => {
        // Avoid double navigation if clicking the anchor directly
        if (e.target.closest('a')) return;
        go();
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          go();
        }
      });
    });
  })();

  /**
   * Resume: show limited items with expandable groups
   */
  (function initResumeGroups() {
    const toggles = document.querySelectorAll('.resume-more');
    if (!toggles.length) return;
    toggles.forEach(t => {
      const showMore = t.closest('.resume-show-more');
      const targetSel = t.getAttribute('data-target');
      const target = document.querySelector(targetSel);
      if (!target) return;

      // Set dynamic count in label if applicable
      const count = target.querySelectorAll('.resume-item').length;
      if (count && !target.classList.contains('show')) {
        if (target.id === 'education-extra') {
          t.textContent = `There are ${count} more! Click here to view…`;
        } else if (target.id === 'experience-extra') {
          t.textContent = `There are ${count} more! Click here to view…`;
        }
      }

      const expand = (e) => {
        if (e) e.preventDefault();
        if (target.classList.contains('show')) return; // already expanded
        target.classList.add('show');
        // Remove the gap marker row entirely so the timeline connects seamlessly
        if (showMore) {
          showMore.remove();
        }
      };

      // Click on text link expands once
      t.addEventListener('click', expand);

      // Click on the bulb also expands once
      if (showMore) {
        const bulb = showMore.querySelector('.timeline-gap');
        if (bulb) bulb.addEventListener('click', expand);
      }
    });
  })();

  /**
   * Brand strip: duplicate track for seamless loop and start animation only when visible
   */
  (function initBrandStrips() {
    const strips = document.querySelectorAll('.brand-strip');
    if (!strips.length) return;
    const allowMotion = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
    strips.forEach(strip => {
      const track = strip.querySelector('.brand-track');
      if (!track) return;

      // Prepare images for lazy loading: move src to data-src and set tiny placeholder
      const placeholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
      track.querySelectorAll('img').forEach(img => {
        if (!img.dataset.src && img.src && !img.src.startsWith('data:')) {
          img.dataset.src = img.src;
          img.src = placeholder;
        }
      });

      // Duplicate full sequence once to ensure seamless looping
      if (!track.dataset.cloned) {
        track.innerHTML = track.innerHTML + track.innerHTML;
        track.dataset.cloned = 'true';
      }

      // Disable CSS animation; use JS for perfect seamless marquee
      track.style.animation = 'none';

      let running = false;
      let offset = 0;
      let lastTs;
      const speed = 80; // px per second

      const halfWidth = () => track.scrollWidth / 2;

      const step = (ts) => {
        if (!allowMotion) return; // honor reduced motion
        if (lastTs == null) lastTs = ts;
        const dt = (ts - lastTs) / 1000;
        lastTs = ts;
        if (running) {
          offset -= speed * dt;
          const w = halfWidth();
          if (offset <= -w) offset += w; // wrap seamlessly at exact boundary
          track.style.transform = `translateX(${offset}px)`;
        }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);

      // Lazy-load images and start scrolling only when visible
      if ('IntersectionObserver' in window) {
        const imgObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const el = entry.target;
              if (el.dataset && el.dataset.src) {
                el.src = el.dataset.src;
                el.onload = () => el.classList.add('is-loaded');
                el.removeAttribute('data-src');
              }
              imgObserver.unobserve(el);
            }
          });
        }, { rootMargin: '200px 0px', threshold: 0.01 });
        track.querySelectorAll('img').forEach(img => imgObserver.observe(img));

        const stripObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => { running = entry.isIntersecting; });
        }, { rootMargin: '0px 0px -5% 0px', threshold: 0.01 });
        stripObserver.observe(strip);
      } else {
        // No IO, load images immediately and run
        track.querySelectorAll('img').forEach(img => {
          if (img.dataset && img.dataset.src) { img.src = img.dataset.src; img.classList.add('is-loaded'); }
        });
        running = true;
      }
    });
  })();

})()
