// @version    v1.0  @file ttt-config.js  @updated 2026-03-14  @session fix-mlg-404-error-aSVYy
/* ===== TTT - ttt-config.js =====
 * Configuración global, utilidades y constantes
 * Clon de imolarte-config.js adaptado para Tessitura Toscana Telerie
 * ============================================ */

'use strict';

// ===== CONFIGURACIÓN GLOBAL =====
const TTT_CONFIG = {
  brand: {
    name: 'TTT by G-Living | Tessitura Toscana Telerie | Est. 2018',
    phone: '+573004257367',
    whatsappBase: 'https://wa.me/',
    website: 'https://g-living.github.io/multiplatform/',
  },

  images: {
    basePath:    'images/',
    placeholder: 'images/products/placeholder.svg',
    productPath: 'images/products/',
  },

  checkout: {
    currency:        'COP',
    currencySymbol:  '$',
    // Cloudflare Worker signature (clonar de imolarte cuando esté listo)
    signatureWorkerUrl: '',
    wompiPublicKey:   '',
    wompiCheckoutUrl: 'https://checkout.wompi.co/p/',
    sheetsUrl: 'https://script.google.com/macros/s/AKfycbyDbEdP5a5AhzhpcVGKCK1iS10uw02cscTMG62pW68fw_5PDOVs1RV8lhBcebr-1mEc/exec',
    checkoutUrl: 'https://g-living.github.io/multiplatform/arte-de-la-mesa/ttt/ttt-checkout.html',
    discountPayFull: 0.03,
    discountInfluencer: 0.05,
    apiToken: 'ttt_tLaO8fenZj_FyP0HCW8N5KdzXZe28rSSYZyUy_j6',
  },

  toast: {
    duration: 3000,
  },

  catalogo: {
    id: 'TTT',
  },

  campania: {
    id: 'TTT-MARZO2026',
    descuentoPct: 0,
    loaded: false,
  },

  cart: {
    storageKey: 'ttt_cart_v1',
    maxQuantity: 99,
  },
};


// ===== UTILIDADES DE FORMATO =====
const Utils = {
  roundCOP(val) {
    if (typeof val !== 'number' || isNaN(val)) return 0;
    if (val === 0) return 0;
    if (val > 0 && val <= 50000) return 0;
    return Math.ceil(val / 1000) * 1000;
  },

  calcPresale(precio) {
    const original = precio;
    const descPct  = TTT_CONFIG.campania.descuentoPct || 0;
    if (!descPct || descPct <= 0) {
      return { original, final: original, descPct: 0, tieneDescuento: false };
    }
    const final = Math.round(original * (1 - descPct / 100) * 100) / 100;
    return { original, final, descPct, tieneDescuento: true };
  },

  formatPrice(price) {
    if (price === null || price === undefined || price === '') return '';
    return TTT_CONFIG.checkout.currencySymbol +
      Number(price).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  },

  formatPriceFull(price) {
    return this.formatPrice(price) + ' EUR';
  },

  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },

  sanitize(str) {
    const div = document.createElement('div');
    div.textContent = String(str ?? '');
    return div.innerHTML;
  },

  truncate(str, maxLen = 60) {
    if (!str) return '';
    return str.length > maxLen ? str.slice(0, maxLen).trimEnd() + '…' : str;
  },

  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  buildWhatsAppUrl(message) {
    const encoded = encodeURIComponent(message);
    return `${TTT_CONFIG.brand.whatsappBase}${TTT_CONFIG.brand.phone}?text=${encoded}`;
  },

  buildWishlistMessage(items) {
    if (!items || items.length === 0) return '';
    const lines = items.map(item => {
      const medidaInfo = item.medida ? ` ${item.medida}` : '';
      return `• ${item.productName}${medidaInfo} × ${item.quantity} → ${Utils.formatPrice(item.precio * item.quantity)}`;
    });
    const total = items.reduce((sum, i) => sum + i.precio * i.quantity, 0);
    return [
      '🧺 *Lista de deseos TTT — Tessitura Toscana Telerie*',
      '',
      ...lines,
      '',
      `*Total estimado: ${Utils.formatPrice(total)} COP*`,
      '',
      'Me interesan estas piezas. ¿Podrían confirmar disponibilidad y condiciones de envío?',
    ].join('\n');
  },

  /** Traduce categoria italiana a español */
  catLabel(cat) {
    const map = {
      'canovacci':      'Paños de cocina',
      'tovaglie':       'Manteles',
      'tovaglioli':     'Servilletas',
      'tovaglietta':    'Individuales',
      'runner':         'Camino de mesa',
      'mezzero':        'Paño decorativo',
      'cuscini':        'Cojines',
      'copripiumino':   'Cubreduvet',
      'set lenzuola':   'Set de sábanas',
      'trapunta estiva':'Acolchado',
      'plaid':          'Manta',
      'tappetino':      'Tapete',
      'lenzuolo sotto': 'Sábana ajustable',
    };
    return map[cat?.toLowerCase()] || cat || '';
  },

  /** Traduce zona italiana a español */
  zonaLabel(zona) {
    const map = {
      'tavola e cucina': 'Mesa y cocina',
      'letto':           'Dormitorio',
    };
    return map[zona?.toLowerCase()] || zona || '';
  },
};


// ===== GESTIÓN DE IMÁGENES =====
const ImageManager = {
  withFallback(src, imgEl) {
    const placeholder = TTT_CONFIG.images.placeholder;
    if (imgEl) {
      imgEl.onerror = () => {
        imgEl.onerror = null;
        imgEl.src = placeholder;
      };
      imgEl.src = src || placeholder;
    }
    return src || placeholder;
  },

  productSrc(filename) {
    if (!filename) return TTT_CONFIG.images.placeholder;
    if (filename.startsWith('http') || filename.startsWith('/')) return filename;
    if (filename.startsWith('images/')) return filename;
    return TTT_CONFIG.images.productPath + filename;
  },
};


// ===== ACCESIBILIDAD =====
const A11y = {
  trapFocus(container) {
    const focusable = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return () => {};
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    const handler = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    container.addEventListener('keydown', handler);
    first.focus();
    return () => container.removeEventListener('keydown', handler);
  },
};


// ===== LOGGER =====
const Logger = {
  _dev: true,
  log(...args)   { if (this._dev) console.log('[TTT]', ...args); },
  warn(...args)  { if (this._dev) console.warn('[TTT]', ...args); },
  error(...args) { console.error('[TTT]', ...args); },
};


// ===== TOAST =====
const Toast = (() => {
  let _hideTimer = null;
  let _el = null;
  let _msgEl = null;
  let _iconEl = null;

  function _getEls() {
    if (!_el) {
      _el    = document.getElementById('toast');
      _msgEl = document.getElementById('toastMessage');
      _iconEl = _el?.querySelector('.toast-icon');
    }
    return { el: _el, msg: _msgEl, icon: _iconEl };
  }

  function show(message, type = 'success', duration = null) {
    const { el, msg, icon } = _getEls();
    if (!el || !msg) return;
    if (_hideTimer) clearTimeout(_hideTimer);
    el.classList.remove('hide');
    const colorMap = {
      success: 'var(--color-success)',
      error:   'var(--color-error)',
      info:    'var(--color-info)',
      warning: 'var(--color-warning)',
    };
    el.style.borderLeftColor = colorMap[type] || colorMap.success;
    if (icon) icon.style.color = colorMap[type] || colorMap.success;
    if (icon) {
      const icons = {
        success: '<polyline points="20 6 9 17 4 12"/>',
        error:   '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
        info:    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1"/>',
        warning: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="1"/>',
      };
      icon.innerHTML = icons[type] || icons.success;
    }
    msg.textContent = message;
    el.style.display = 'flex';
    void el.offsetWidth;
    const dur = duration ?? TTT_CONFIG.toast.duration;
    _hideTimer = setTimeout(() => hide(), dur);
  }

  function hide() {
    const { el } = _getEls();
    if (!el) return;
    el.classList.add('hide');
    setTimeout(() => { el.style.display = 'none'; el.classList.remove('hide'); }, 400);
  }

  return { show, hide };
})();


// ===== CAMPAÑA =====
const Campania = (() => {
  let _callbacks = [];

  function onReady(fn) {
    if (TTT_CONFIG.campania.loaded) { fn(); return; }
    _callbacks.push(fn);
  }

  function descuentoPct() { return TTT_CONFIG.campania.descuentoPct || 0; }
  function activa()       { return descuentoPct() > 0; }

  async function cargar() {
    try {
      const url = TTT_CONFIG.checkout.sheetsUrl + '?action=getCampanias';
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const data = await resp.json();
      if (data.ok && Array.isArray(data.campanias)) {
        const match = data.campanias.find(c => c['Campaña_ID'] === TTT_CONFIG.campania.id);
        if (match && Number(match['Descuento_Pct']) > 0) {
          TTT_CONFIG.campania.descuentoPct = Number(match['Descuento_Pct']);
        }
      }
    } catch(e) {
      Logger.warn('Campania: no se pudo cargar', e.message);
    } finally {
      TTT_CONFIG.campania.loaded = true;
      _callbacks.forEach(fn => { try { fn(); } catch(e) { Logger.warn('Campania callback error', e); } });
      _callbacks = [];
    }
  }

  return { cargar, onReady, descuentoPct, activa };
})();


// ===== EXPORTAR =====
window.TTT_CONFIG    = TTT_CONFIG;
window.Utils         = Utils;
window.ImageManager  = ImageManager;
window.A11y          = A11y;
window.Logger        = Logger;
window.Toast         = Toast;
window.Campania      = Campania;

Logger.log('ttt-config.js cargado ✓');
