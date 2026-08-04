(function initLtTracking() {
  "use strict";

  const CONFIG = Object.freeze({
    consentKey: "lt_tracking_consent_v1",
    attributionKey: "lt_attribution_v1",
    ga4Id: "G-901CW6RW4H",
    clarityId: "xs3yejldmx",
    metaPixelId: "941784835609445",
    privacyUrl: "./privacidade.html",
    attributionMaxLength: 160
  });

  const ATTRIBUTION_KEYS = Object.freeze([
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "utm_id",
    "campaign_id",
    "adset_id",
    "ad_id",
    "placement",
    "site_source"
  ]);

  const TRACKING_MAP = Object.freeze({
    whatsapp_hero: Object.freeze({
      ga4Event: "click_whatsapp",
      metaEvent: "Contact",
      metaMode: "track",
      parameters: Object.freeze({
        element_location: "hero",
        element_label: "WhatsApp"
      })
    }),
    whatsapp_contact: Object.freeze({
      ga4Event: "click_whatsapp",
      metaEvent: "Contact",
      metaMode: "track",
      parameters: Object.freeze({
        element_location: "contact",
        element_label: "WhatsApp"
      })
    }),
    form_hero: Object.freeze({
      ga4Event: "click_form",
      metaEvent: "FormOpen",
      metaMode: "trackCustom",
      parameters: Object.freeze({
        element_location: "hero",
        element_label: "Solicitar aula experimental"
      })
    }),
    form_location: Object.freeze({
      ga4Event: "click_form",
      metaEvent: "FormOpen",
      metaMode: "trackCustom",
      parameters: Object.freeze({
        element_location: "location",
        element_label: "Solicitar aula experimental"
      })
    }),
    route_location: Object.freeze({
      ga4Event: "click_route",
      parameters: Object.freeze({
        element_location: "location",
        element_label: "Abrir rota"
      })
    }),
    instagram_hero: Object.freeze({
      ga4Event: "click_instagram",
      parameters: Object.freeze({
        element_location: "hero",
        element_label: "Instagram"
      })
    }),
    instagram_contact: Object.freeze({
      ga4Event: "click_instagram",
      parameters: Object.freeze({
        element_location: "contact",
        element_label: "Instagram"
      })
    }),
    photo_introducao: Object.freeze({
      ga4Event: "open_photo",
      parameters: Object.freeze({
        element_location: "primeira_aula",
        element_label: "Ampliar foto",
        photo_name: "introducao"
      })
    }),
    photo_retomada: Object.freeze({
      ga4Event: "open_photo",
      parameters: Object.freeze({
        element_location: "primeira_aula",
        element_label: "Ampliar foto",
        photo_name: "retomada"
      })
    }),
    photo_orientacao: Object.freeze({
      ga4Event: "open_photo",
      parameters: Object.freeze({
        element_location: "primeira_aula",
        element_label: "Ampliar foto",
        photo_name: "orientacao"
      })
    })
  });

  let activeConsent = readConsent();
  const attribution = captureAttribution();

  function safeStorage(storage, operation, key, value) {
    try {
      if (operation === "get") return storage.getItem(key);
      storage.setItem(key, value);
    } catch (_error) {
      return null;
    }
    return null;
  }

  function sanitizeValue(value) {
    if (typeof value !== "string") return "";
    return value
      .replace(/[\u0000-\u001F\u007F]/g, "")
      .replace(/[<>"'`]/g, "")
      .trim()
      .slice(0, CONFIG.attributionMaxLength);
  }

  function parseJson(value) {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch (_error) {
      return null;
    }
  }

  function normalizeConsent(value) {
    if (!value || value.version !== 1) return null;
    return Object.freeze({
      version: 1,
      necessary: true,
      analytics: value.analytics === true,
      marketing: value.marketing === true,
      updatedAt: sanitizeValue(value.updatedAt)
    });
  }

  function readConsent() {
    return normalizeConsent(
      parseJson(safeStorage(window.localStorage, "get", CONFIG.consentKey))
    );
  }

  function captureAttribution() {
    const stored = parseJson(
      safeStorage(window.sessionStorage, "get", CONFIG.attributionKey)
    );
    const captured = {};
    const params = new URLSearchParams(window.location.search);

    ATTRIBUTION_KEYS.forEach((key) => {
      const value = sanitizeValue(params.get(key));
      if (value) captured[key] = value;
    });

    const merged = { ...(stored || {}), ...captured };
    const clean = {};
    ATTRIBUTION_KEYS.forEach((key) => {
      const value = sanitizeValue(merged[key]);
      if (value) clean[key] = value;
    });

    safeStorage(
      window.sessionStorage,
      "set",
      CONFIG.attributionKey,
      JSON.stringify(clean)
    );
    return Object.freeze(clean);
  }

  function appendScript(id, src, onLoad) {
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.async = true;
    script.src = src;
    if (typeof onLoad === "function") script.addEventListener("load", onLoad);
    document.head.appendChild(script);
  }

  function loadAnalytics() {
    if (window.__ltAnalyticsInitialized) return;
    window.__ltAnalyticsInitialized = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", CONFIG.ga4Id, {
      debug_mode: new URLSearchParams(window.location.search).get("tracking_debug") === "1"
    });
    appendScript(
      "lt-ga4-script",
      `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(CONFIG.ga4Id)}`
    );

    window.clarity = window.clarity || function clarity() {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };
    Object.entries(attribution).forEach(([key, value]) => {
      window.clarity("set", key, value);
    });
    appendScript(
      "lt-clarity-script",
      `https://www.clarity.ms/tag/${encodeURIComponent(CONFIG.clarityId)}`
    );
  }

  function loadMetaPixel() {
    if (window.__ltMetaInitialized) return;
    window.__ltMetaInitialized = true;

    const fbq = function fbq() {
      if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
      else fbq.queue.push(arguments);
    };
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = window.fbq || fbq;
    window._fbq = window._fbq || window.fbq;

    appendScript("lt-meta-pixel-script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", CONFIG.metaPixelId);
    window.fbq("track", "PageView");
    window.fbq("track", "ViewContent", {
      content_name: "Aula experimental de jiu-jítsu — Studio Trion",
      content_category: "Captação de alunos BJJ",
      content_type: "landing_page",
      ...attribution
    });
  }

  function applyConsent() {
    if (!activeConsent) return;
    if (activeConsent.analytics) loadAnalytics();
    if (activeConsent.marketing) loadMetaPixel();
  }

  function saveConsent(analytics, marketing) {
    const previous = activeConsent;
    activeConsent = Object.freeze({
      version: 1,
      necessary: true,
      analytics: analytics === true,
      marketing: marketing === true,
      updatedAt: new Date().toISOString()
    });
    safeStorage(
      window.localStorage,
      "set",
      CONFIG.consentKey,
      JSON.stringify(activeConsent)
    );

    const revoked =
      previous &&
      ((previous.analytics && !activeConsent.analytics) ||
        (previous.marketing && !activeConsent.marketing));

    if (revoked) {
      window.location.reload();
      return;
    }

    applyConsent();
    syncConsentUi();
  }

  function buildEventParameters(element, config) {
    const parameters = { ...config.parameters, ...attribution };
    if (element instanceof HTMLAnchorElement && element.href) {
      parameters.link_url = sanitizeValue(element.href);
    }
    return parameters;
  }

  function handleTrackedClick(event) {
    const element =
      event.target instanceof Element
        ? event.target.closest("[data-track]")
        : null;
    if (!element) return;

    const trackingName = element.getAttribute("data-track");
    const config = trackingName ? TRACKING_MAP[trackingName] : null;
    if (!config) return;

    const parameters = buildEventParameters(element, config);
    if (activeConsent && activeConsent.analytics) {
      if (typeof window.gtag === "function") {
        window.gtag("event", config.ga4Event, parameters);
      }
      if (typeof window.clarity === "function") {
        window.clarity("event", trackingName);
        Object.entries(attribution).forEach(([key, value]) => {
          window.clarity("set", key, value);
        });
      }
    }

    if (
      activeConsent &&
      activeConsent.marketing &&
      config.metaEvent &&
      typeof window.fbq === "function"
    ) {
      window.fbq(config.metaMode, config.metaEvent, parameters);
    }
  }

  function consentMarkup() {
    return `
      <section class="lt-consent" data-consent-banner hidden aria-label="Preferências de privacidade">
        <div class="lt-consent__copy">
          <strong>Privacidade e medição</strong>
          <p>Usamos cookies e tecnologias semelhantes para analytics e marketing somente com sua escolha. Os recursos necessários continuam ativos.</p>
          <a href="${CONFIG.privacyUrl}">Aviso de privacidade</a>
        </div>
        <div class="lt-consent__actions">
          <button type="button" data-consent-reject>Recusar não essenciais</button>
          <button type="button" data-consent-customize>Personalizar</button>
          <button type="button" class="is-primary" data-consent-accept>Aceitar todos</button>
        </div>
      </section>
      <button class="lt-consent-reopen" type="button" data-consent-reopen>Preferências de cookies</button>
      <div class="lt-consent-modal" data-consent-modal hidden>
        <div class="lt-consent-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="lt-consent-title">
          <h2 id="lt-consent-title">Preferências de cookies</h2>
          <p>Você pode alterar estas opções quando quiser. Ao revogar uma categoria já ativa, a página será recarregada.</p>
          <label><input type="checkbox" checked disabled /> Necessários <small>Sempre ativos para guardar sua escolha e manter o site funcionando.</small></label>
          <label><input type="checkbox" data-consent-analytics /> Analytics <small>Google Analytics 4 e Microsoft Clarity.</small></label>
          <label><input type="checkbox" data-consent-marketing /> Marketing <small>Meta Pixel para PageView, ViewContent e cliques de intenção.</small></label>
          <div class="lt-consent-modal__actions">
            <button type="button" data-consent-close>Cancelar</button>
            <button type="button" class="is-primary" data-consent-save>Salvar preferências</button>
          </div>
        </div>
      </div>`;
  }

  function syncConsentUi() {
    const banner = document.querySelector("[data-consent-banner]");
    const analytics = document.querySelector("[data-consent-analytics]");
    const marketing = document.querySelector("[data-consent-marketing]");
    if (banner) banner.hidden = Boolean(activeConsent);
    if (analytics) analytics.checked = Boolean(activeConsent && activeConsent.analytics);
    if (marketing) marketing.checked = Boolean(activeConsent && activeConsent.marketing);
  }

  function openPreferences() {
    syncConsentUi();
    const modal = document.querySelector("[data-consent-modal]");
    if (modal) modal.hidden = false;
  }

  function closePreferences() {
    const modal = document.querySelector("[data-consent-modal]");
    if (modal) modal.hidden = true;
  }

  function initConsentUi() {
    document.body.insertAdjacentHTML("beforeend", consentMarkup());
    syncConsentUi();

    document.querySelector("[data-consent-accept]").addEventListener("click", () => {
      saveConsent(true, true);
    });
    document.querySelector("[data-consent-reject]").addEventListener("click", () => {
      saveConsent(false, false);
    });
    document.querySelector("[data-consent-customize]").addEventListener("click", openPreferences);
    document.querySelector("[data-consent-reopen]").addEventListener("click", openPreferences);
    document.querySelector("[data-consent-close]").addEventListener("click", closePreferences);
    document.querySelector("[data-consent-save]").addEventListener("click", () => {
      const analytics = document.querySelector("[data-consent-analytics]").checked;
      const marketing = document.querySelector("[data-consent-marketing]").checked;
      closePreferences();
      saveConsent(analytics, marketing);
    });
    document.querySelector("[data-consent-modal]").addEventListener("click", (event) => {
      if (event.target === event.currentTarget) closePreferences();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closePreferences();
    });
  }

  window.LTTracking = Object.freeze({
    attributionKeys: ATTRIBUTION_KEYS,
    ga4Id: CONFIG.ga4Id,
    clarityId: CONFIG.clarityId,
    metaPixelId: CONFIG.metaPixelId,
    getAttribution: () => ({ ...attribution }),
    getConsent: () => (activeConsent ? { ...activeConsent } : null)
  });

  document.addEventListener("click", handleTrackedClick);
  applyConsent();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initConsentUi, { once: true });
  } else {
    initConsentUi();
  }
})();
