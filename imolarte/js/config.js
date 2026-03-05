/* ===== IMOLARTE V2 - config.js ===== */
/* Configuración global, utilidades y constantes */

'use strict';

// ===== CONFIGURACIÓN GLOBAL =====
const IMOLARTE_CONFIG = {
  // Marca
  brand: {
    name: 'IMOLARTE by Helena Caballero',
    phone: '+573004257367',
    whatsappBase: 'https://wa.me/',
    website: 'https://www.helenacaballero.com',
  },

  // Imágenes
  images: {
    basePath: 'images/',
    placeholder: 'images/placeholder.jpg',
    comodinPath: 'images/comodines/',
    productPath: 'images/products/',
  },

  // Checkout
  checkout: {
    currency: 'COP',
    currencySymbol: '$',
    wompiPublicKey: 'pub_test_rT7K8rzYnk2Ec8Lv25tRL3JIof6b6Lwp',
    wompiCheckoutUrl: 'https://checkout.wompi.co/p/',
    signatureWorkerUrl: 'https://imolarte-signature-generator.filippo-massara2016.workers.dev',
    sheetsUrl: 'https://script.google.com/macros/s/AKfycbyCBndiUkqtVFIXXudzjuP-gXNlze4glEcXkyZiM1cGaY7E2RaWTlAG1k7z1USA7_ZG/exec',
    checkoutUrl: 'https://g-living.github.io/multiplatform/imolarte/checkout.html',
    discountPayFull: 0.03,
  },

  // Toast
  toast: {
    duration: 3000,
  },

  // Cart
  // Campaña activa — actualizar por catálogo/temporada
  campania: {
    id: 'IMOLARTE-PRESALE-MARZO2026',
  },

  cart: {
    storageKey: 'imolarte_cart_v2',
    maxQuantity: 99,
  },
};


// ===== UTILIDADES DE FORMATO =====
const Utils = {
  /**
   * Formatea número como precio colombiano
   * @param {number} price
   * @returns {string} "$1.250.000"
   */
  formatPrice(price) {
    if (!price && price !== 0) return '';
    return IMOLARTE_CONFIG.checkout.currencySymbol +
      Number(price).toLocaleString('es-CO', { maximumFractionDigits: 0 });
  },

  /**
   * Formatea precio en texto legible con COP
   * @param {number} price
   * @returns {string} "$1.250.000 COP"
   */
  formatPriceFull(price) {
    return this.formatPrice(price) + ' COP';
  },

  /**
   * Genera ID único simple
   * @returns {string}
   */
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },

  /**
   * Sanitiza texto para uso seguro en HTML
   * @param {string} str
   * @returns {string}
   */
  sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Trunca texto a longitud máxima
   * @param {string} str
   * @param {number} maxLen
   * @returns {string}
   */
  truncate(str, maxLen = 60) {
    if (!str) return '';
    return str.length > maxLen ? str.slice(0, maxLen).trimEnd() + '…' : str;
  },

  /**
   * Debounce genérico
   * @param {Function} fn
   * @param {number} delay
   * @returns {Function}
   */
  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  /**
   * Genera URL de WhatsApp con mensaje prellenado
   * @param {string} message
   * @returns {string}
   */
  buildWhatsAppUrl(message) {
    const encoded = encodeURIComponent(message);
    return `${IMOLARTE_CONFIG.brand.whatsappBase}${IMOLARTE_CONFIG.brand.phone}?text=${encoded}`;
  },

  /**
   * Construye texto de wishlist para WhatsApp
   * @param {Array} items - array de objetos cart
   * @returns {string}
   */
  buildWishlistMessage(items) {
    if (!items || items.length === 0) return '';
    const lines = items.map(item => {
      const variantInfo = item.variant
        ? ` - ${item.variant.name}${item.variant.size ? ' / ' + item.variant.size : ''}`
        : '';
      return `• ${item.productName}${variantInfo} × ${item.quantity} → ${Utils.formatPrice(item.price * item.quantity)}`;
    });
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return [
      '🏺 *Lista de deseos IMOLARTE*',
      '',
      ...lines,
      '',
      `*Total estimado: ${Utils.formatPrice(total)} COP*`,
      '',
      'Me interesan estas piezas. ¿Podrían confirmar disponibilidad y condiciones de envío?',
    ].join('\n');
  },
};


// ===== GESTIÓN DE IMÁGENES =====
const ImageManager = {
  /**
   * Retorna URL de imagen con fallback a placeholder
   * @param {string} src
   * @param {HTMLImageElement} [imgEl]
   */
  withFallback(src, imgEl) {
    const placeholder = IMOLARTE_CONFIG.images.placeholder;
    if (imgEl) {
      imgEl.onerror = () => {
        imgEl.onerror = null;
        imgEl.src = placeholder;
      };
      imgEl.src = src || placeholder;
    }
    return src || placeholder;
  },

  /**
   * Resuelve ruta de imagen de producto
   * @param {string} filename
   * @returns {string}
   */
  productSrc(filename) {
    if (!filename) return IMOLARTE_CONFIG.images.placeholder;
    if (filename.startsWith('http') || filename.startsWith('/')) return filename;
    // Si ya contiene el path completo (generado desde CSV), usarlo directo
    if (filename.startsWith('images/')) return filename;
    return IMOLARTE_CONFIG.images.productPath + filename;
  },

  /**
   * Resuelve ruta de comodín
   * @param {string} filename
   * @returns {string}
   */
  comodinSrc(filename) {
    if (!filename) return IMOLARTE_CONFIG.images.placeholder;
    if (filename.startsWith('http') || filename.startsWith('/')) return filename;
    return IMOLARTE_CONFIG.images.comodinPath + filename;
  },
};


// ===== ACCESIBILIDAD =====
const A11y = {
  /**
   * Trampa de foco dentro de un elemento modal
   * @param {HTMLElement} container
   * @returns {Function} cleanup
   */
  trapFocus(container) {
    const focusable = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return () => {};

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handler = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    container.addEventListener('keydown', handler);
    first.focus();

    return () => container.removeEventListener('keydown', handler);
  },
};


// ===== LOGGER (dev only) =====
const Logger = {
  _dev: true, // Debug activo — desactivar en producción final
  log(...args) { if (this._dev) console.log('[IMOLARTE]', ...args); },
  warn(...args) { if (this._dev) console.warn('[IMOLARTE]', ...args); },
  error(...args) { console.error('[IMOLARTE]', ...args); },
};

// ===== EXPORTAR AL SCOPE GLOBAL =====
window.IMOLARTE_CONFIG = IMOLARTE_CONFIG;
window.Utils = Utils;
window.ImageManager = ImageManager;
window.A11y = A11y;
window.Logger = Logger;

Logger.log('config.js cargado ✓');


// ===== TOAST =====
// Definido en config.js para estar disponible antes que cart.js y modal.js
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

    const dur = duration ?? IMOLARTE_CONFIG.toast.duration;
    _hideTimer = setTimeout(() => hide(), dur);
  }

  function hide() {
    const { el } = _getEls();
    if (!el) return;
    el.classList.add('hide');
    setTimeout(() => {
      el.style.display = 'none';
      el.classList.remove('hide');
    }, 400);
  }

  return { show, hide };
})();

window.Toast = Toast;
Logger.log('Toast cargado ✓');
