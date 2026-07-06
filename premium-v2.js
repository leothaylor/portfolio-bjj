/* =====================================================================
   Leo Thaylor — Premium V2
   Scroll NATIVO (sem Lenis, por decisão de performance) + GSAP ScrollTrigger.
   ===================================================================== */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isSmall = window.innerWidth < 760;

  const hasGsap = typeof window.gsap !== "undefined";
  const hasST = hasGsap && typeof window.ScrollTrigger !== "undefined";
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.prototype.slice.call(ctx.querySelectorAll(s));

  /* --- Prepara reveal por linhas (mascara <br> -> linhas animadas) --- */
  function buildLineReveals() {
    $$("[data-reveal-lines]").forEach((el) => {
      const html = el.innerHTML.split(/<br\s*\/?>/i);
      el.innerHTML = html
        .map((part) => `<span class="rl-line"><span>${part.trim()}</span></span>`)
        .join("");
    });
  }

  /* ------------------------------------------------------------------ */
  /* Header + menu móvel                                                 */
  /* ------------------------------------------------------------------ */
  function initHeader() {
    const header = $("[data-header]");
    const burger = $("[data-burger]");
    const menu = $("[data-menu]");
    if (header) {
      const sync = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
      sync();
      window.addEventListener("scroll", sync, { passive: true });
    }
    const closeMenu = () => {
      if (!menu) return;
      menu.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      if (burger) burger.setAttribute("aria-expanded", "false");
    };
    if (burger && menu) {
      burger.addEventListener("click", () => {
        const open = menu.classList.toggle("is-open");
        document.body.classList.toggle("menu-open", open);
        burger.setAttribute("aria-expanded", String(open));
      });
      menu.addEventListener("click", (e) => {
        if (e.target.tagName === "A") closeMenu();
      });
    }
    window.addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());
  }

  /* ------------------------------------------------------------------ */
  /* Âncoras com offset do header                                        */
  /* ------------------------------------------------------------------ */
  function initAnchors() {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const id = link.getAttribute("href");
        if (!id || id === "#") return;
        const t = $(id);
        if (!t) return;
        e.preventDefault();
        const y = t.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Cursor customizado + magnético                                      */
  /* ------------------------------------------------------------------ */
  function initCursor() {
    if (!finePointer || !hasGsap) return;
    const cur = $("[data-cursor]");
    if (!cur) return;
    cur.classList.add("is-active");
    const xTo = gsap.quickTo(cur, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(cur, "y", { duration: 0.35, ease: "power3" });
    window.addEventListener("pointermove", (e) => { xTo(e.clientX); yTo(e.clientY); }, { passive: true });
    $$("[data-cursor-target]").forEach((el) => {
      el.addEventListener("pointerenter", () => cur.classList.add("is-hover"));
      el.addEventListener("pointerleave", () => cur.classList.remove("is-hover"));
    });
  }

  function initMagnetic() {
    if (!finePointer || !hasGsap || reduceMotion) return;
    $$("[data-magnetic]").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.35);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Reveals no scroll                                                   */
  /* ------------------------------------------------------------------ */
  function initReveals() {
    const items = $$("[data-reveal], [data-reveal-lines]");
    if (reduceMotion || !hasST) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }
    items.forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 86%",
        once: true,
        onEnter: () => el.classList.add("is-in"),
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Parallax (hero portrait + quote bg)                                 */
  /* ------------------------------------------------------------------ */
  function initParallax() {
    if (reduceMotion || !hasST) return;
    const portrait = $("[data-hero-portrait] img");
    if (portrait) {
      gsap.fromTo(portrait, { yPercent: -8 }, {
        yPercent: 8, ease: "none",
        scrollTrigger: { trigger: ".pv2-hero", start: "top top", end: "bottom top", scrub: true },
      });
    }
    const quoteImg = $(".pv2-quote-media img");
    if (quoteImg) {
      gsap.fromTo(quoteImg, { yPercent: -12 }, {
        yPercent: 12, ease: "none",
        scrollTrigger: { trigger: ".pv2-quote", start: "top bottom", end: "bottom top", scrub: true },
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Ticker contínuo                                                     */
  /* ------------------------------------------------------------------ */
  function initTicker() {
    const track = $("[data-ticker]");
    if (!track || !hasGsap || reduceMotion) return;
    gsap.to(track, { xPercent: -25, duration: 24, ease: "none", repeat: -1 });
  }

  /* ------------------------------------------------------------------ */
  /* Método — storytelling sticky (passo ativo + contador)              */
  /* ------------------------------------------------------------------ */
  function initMethod() {
    if (!hasST) return;
    const steps = $$(".pv2-step");
    const count = $("[data-method-count]");
    if (!steps.length) return;
    const setActive = (i) => {
      steps.forEach((s, k) => s.classList.toggle("is-active", k === i));
      if (count) count.textContent = String(i + 1).padStart(2, "0");
    };
    setActive(0);
    steps.forEach((step, i) => {
      ScrollTrigger.create({
        trigger: step,
        start: "top 60%",
        end: "bottom 60%",
        onToggle: (self) => { if (self.isActive) setActive(i); },
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Momentos — galeria horizontal pinada                                */
  /* ------------------------------------------------------------------ */
  function initGallery() {
    const gallery = $("[data-gallery]");
    const track = $("[data-gallery-track]");
    if (!gallery || !track) return;

    // Fallback: swipe horizontal nativo em touch / telas pequenas / reduced.
    if (!hasST || reduceMotion || isSmall) {
      gallery.style.overflowX = "auto";
      gallery.style.scrollSnapType = "x proximity";
      $$(".pv2-gtile", gallery).forEach((t) => (t.style.scrollSnapAlign = "center"));
      return;
    }

    const amount = () => Math.max(track.scrollWidth - window.innerWidth + 40, 0);
    gsap.to(track, {
      x: () => -amount(),
      ease: "none",
      scrollTrigger: {
        trigger: gallery,
        start: "top top",
        end: () => "+=" + amount(),
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /* Intro do hero                                                       */
  /* ------------------------------------------------------------------ */
  function heroIntro() {
    if (!hasGsap || reduceMotion) {
      $$("[data-hero], .pv2-hero h1 .line > span").forEach((el) => (el.style.opacity = 1, el.style.transform = "none"));
      return;
    }
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".pv2-hero h1 .line > span", { yPercent: 110, duration: 1, stagger: 0.1 })
      .to("[data-hero]", { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, clearProps: "transform" }, "-=0.7")
      .from("[data-hero-portrait]", { opacity: 0, scale: 1.04, duration: 1.1 }, "-=1.1");
  }

  /* ------------------------------------------------------------------ */
  /* Loader                                                              */
  /* ------------------------------------------------------------------ */
  function runLoader(done) {
    const loader = $("[data-loader]");
    const bar = $("[data-loader-bar]");
    if (!loader || reduceMotion || !hasGsap) {
      if (loader) loader.classList.add("is-done");
      document.body.classList.remove("is-loading");
      done();
      return;
    }
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(failsafe);
      loader.classList.add("is-done");
      document.body.classList.remove("is-loading");
      done();
    };
    // Failsafe por timer (não sofre throttle de rAF): garante que o site abre.
    const failsafe = window.setTimeout(finish, 3000);

    const tl = gsap.timeline({ onComplete: finish });
    tl.to(bar, { width: "100%", duration: 1.1, ease: "power2.inOut" })
      .to({}, { duration: 0.25 });
  }

  /* ------------------------------------------------------------------ */
  /* Boot                                                                */
  /* ------------------------------------------------------------------ */
  function boot() {
    buildLineReveals();
    initHeader();
    initAnchors();
    initCursor();
    initMagnetic();
    initReveals();
    initParallax();
    initTicker();
    initMethod();
    initGallery();

    runLoader(() => {
      heroIntro();
      if (hasST) ScrollTrigger.refresh();
    });
  }

  boot();
})();
