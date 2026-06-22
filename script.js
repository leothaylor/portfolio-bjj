(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* Header + mobile nav                                                 */
  /* ------------------------------------------------------------------ */
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const navToggle = document.querySelector("[data-nav-toggle]");

  function syncHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }

  function closeNav() {
    if (!nav || !navToggle) return;
    document.body.classList.remove("nav-open");
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      document.body.classList.toggle("nav-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        closeNav();
      }
    });
  }

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNav();
    }
  });

  /* ------------------------------------------------------------------ */
  /* Capability detection                                                */
  /* ------------------------------------------------------------------ */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  const isSmall = window.innerWidth < 768;

  const hasGsap = typeof window.gsap !== "undefined";
  const hasScrollTrigger = hasGsap && typeof window.ScrollTrigger !== "undefined";

  if (hasScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ------------------------------------------------------------------ */
  /* (2) Scroll — native everywhere.                                     */
  /* We use the browser's own (compositor-driven) scroll on every        */
  /* device. It stays fluid even when the main thread is busy painting,  */
  /* which JS smooth-scroll (Lenis) cannot guarantee. ScrollTrigger      */
  /* drives all the movement effects on top of this native scroll.       */
  /* ------------------------------------------------------------------ */

  /* ------------------------------------------------------------------ */
  /* Anchor navigation — native smooth scroll                            */
  /* ------------------------------------------------------------------ */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const id = link.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;

        event.preventDefault();
        const offset = (header ? header.offsetHeight : 0) + 14;
        const y = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
        closeNav();
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* (3) Hero parallax                                                   */
  /* ------------------------------------------------------------------ */
  function initParallax() {
    if (!hasScrollTrigger || reduceMotion) return;
    const img = document.querySelector(".hero-media img");
    if (!img) return;

    gsap.to(img, {
      yPercent: 14,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /* (4) Scroll reveal per section                                       */
  /* ------------------------------------------------------------------ */
  function initReveal() {
    if (!hasScrollTrigger || reduceMotion) return;

    gsap.utils.toArray("main .section").forEach((section) => {
      if (section.id === "inicio") return; // hero gets its own intro

      const targets = section.querySelectorAll(
        ".section-label, .section-divider, h2, h3, p, " +
          ".method-row, .video-slot, .round-button, .contact-actions, .hero-actions"
      );
      if (!targets.length) return;

      gsap.set(targets, { opacity: 0, y: 34 });
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.07,
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
        },
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* (6) Counter-movement marquee — two rows, opposite directions       */
  /* ------------------------------------------------------------------ */
  function initMarquee() {
    const marquee = document.querySelector("[data-marquee]");
    if (!marquee) return;

    // The counter-movement runs on every device (light thumbnails keep it
    // smooth on mobile too). Only fall back to a static row when motion is
    // reduced or GSAP/ScrollTrigger is unavailable.
    if (!hasScrollTrigger || reduceMotion) {
      marquee.querySelectorAll(".marquee-row").forEach((row) => {
        row.style.overflowX = "auto";
      });
      return;
    }

    const rows = marquee.querySelectorAll("[data-marquee-row]");
    rows.forEach((row) => {
      const track = row.querySelector("[data-marquee-track]");
      if (!track) return;

      const dir = row.getAttribute("data-marquee-row") === "right" ? 1 : -1;

      // Distance the track can travel without exposing an edge. Computed as a
      // function so ScrollTrigger re-evaluates it on every refresh() — the
      // first measurement happens behind the preloader (row width still 0),
      // and refresh() after the reveal corrects it.
      const travel = () =>
        Math.min(Math.max(track.scrollWidth - row.clientWidth, 0), row.clientWidth * 0.5);

      gsap.fromTo(
        track,
        { x: () => (dir < 0 ? 0 : -travel()) },
        {
          x: () => (dir < 0 ? -travel() : 0),
          ease: "none",
          scrollTrigger: {
            trigger: marquee,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    });
  }

  /* ------------------------------------------------------------------ */
  /* (7) Footer reveal (pairs with the CSS curved top edge)              */
  /* ------------------------------------------------------------------ */
  function initFooterReveal() {
    if (!hasScrollTrigger || reduceMotion) return;
    const footer = document.querySelector(".site-footer");
    if (!footer || !footer.children.length) return;

    gsap.set(footer.children, { opacity: 0, y: 20 });
    gsap.to(footer.children, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.1,
      scrollTrigger: {
        trigger: footer,
        start: "top 92%",
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /* (5) Magnetic CTA buttons — desktop only                            */
  /* ------------------------------------------------------------------ */
  function initMagnetic() {
    if (!hasGsap || reduceMotion || isTouch || isSmall) return;

    const els = Array.prototype.slice.call(document.querySelectorAll("[data-magnetic]"));
    if (!els.length) return;

    const magnets = els.map((el) => ({
      el,
      xTo: gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" }),
      yTo: gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" }),
    }));

    const pad = 75; // radius of influence around each button
    let mx = -9999;
    let my = -9999;
    let ticking = false;

    function update() {
      ticking = false;
      magnets.forEach((m) => {
        const r = m.el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const radius = Math.max(r.width, r.height) / 2 + pad;
        const dx = mx - cx;
        const dy = my - cy;
        const dist = Math.hypot(dx, dy);

        if (dist < radius) {
          const pull = (1 - dist / radius) * 0.4;
          m.xTo(dx * pull);
          m.yTo(dy * pull);
        } else {
          m.xTo(0);
          m.yTo(0);
        }
      });
    }

    window.addEventListener(
      "pointermove",
      (event) => {
        mx = event.clientX;
        my = event.clientY;
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
  }

  /* ------------------------------------------------------------------ */
  /* Hero intro (after the preloader dissolves)                          */
  /* ------------------------------------------------------------------ */
  function heroIntro() {
    if (!hasGsap || reduceMotion) return;
    const items = document.querySelectorAll(".hero-copy > *, .hero-badge");
    if (!items.length) return;
    gsap.from(items, {
      y: 28,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.08,
    });
  }

  /* ------------------------------------------------------------------ */
  /* (1) Preloader with greeting cycle                                   */
  /* ------------------------------------------------------------------ */
  function runPreloader(onDone) {
    const pre = document.querySelector("[data-preloader]");
    const textEl = pre ? pre.querySelector("[data-preloader-text]") : null;
    const words = ["Oss", "Olá", "Hello"];

    if (!pre || !textEl) {
      onDone();
      return;
    }

    document.body.classList.add("is-loading");

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.clearTimeout(failsafe);
      pre.classList.add("is-hidden");
      document.body.classList.remove("is-loading");
      onDone();
    };

    // Timer-based failsafe: guarantees scroll unlocks even if the rAF-driven
    // timeline is throttled or GSAP stalls (timers are not rAF-throttled).
    const failsafe = window.setTimeout(finish, 6000);

    // Reduced motion or no GSAP: show one greeting briefly, then reveal.
    if (reduceMotion || !hasGsap) {
      textEl.textContent = words[0];
      window.setTimeout(finish, reduceMotion ? 500 : 900);
      return;
    }

    const tl = gsap.timeline({ onComplete: finish });
    words.forEach((word, i) => {
      if (i > 0) {
        tl.to(
          textEl,
          { duration: 0.22, opacity: 0, y: -14, ease: "power1.in" },
          "+=0.55"
        );
      }
      tl.add(() => {
        textEl.textContent = word;
      });
      tl.fromTo(
        textEl,
        { opacity: 0, y: 14 },
        { duration: 0.3, opacity: 1, y: 0, ease: "power1.out" },
        i === 0 ? 0 : undefined
      );
    });
    tl.to({}, { duration: 0.5 }); // brief hold on the last greeting
  }

  /* ------------------------------------------------------------------ */
  /* Boot                                                                */
  /* ------------------------------------------------------------------ */
  function boot() {
    initAnchors();
    initParallax();
    initReveal();
    initMarquee();
    initFooterReveal();
    initMagnetic();

    // Scroll stays frozen behind the preloader via body.is-loading (CSS).
    runPreloader(() => {
      heroIntro();
      if (hasScrollTrigger) ScrollTrigger.refresh();
    });
  }

  boot();
})();
