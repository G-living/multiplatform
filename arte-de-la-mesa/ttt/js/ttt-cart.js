// @version    v1.0  @file ttt-cart.js  @updated 2026-03-14  @session fix-mlg-404-error-aSVYy
/* ===== TTT - ttt-cart.js =====
 * Carrito con persistencia LocalStorage
 * Item: { uid, productSku, productName, medida, sku, precio, quantity, imagen }
 * ============================================ */

'use strict';

const Cart = (() => {

  let _items = [];

  // -------------------------------------------------------
  // PERSISTENCIA
  // -------------------------------------------------------
  function _load() {
    try {
      const raw = localStorage.getItem(TTT_CONFIG.cart.storageKey);
      _items = raw ? (JSON.parse(raw) || []) : [];
      if (!Array.isArray(_items)) _items = [];
    } catch { _items = []; }
    _syncBadge();
  }

  function _save() {
    try { localStorage.setItem(TTT_CONFIG.cart.storageKey, JSON.stringify(_items)); }
    catch(e) { Logger.warn('ttt-cart.js: localStorage error', e); }
    _syncBadge();
  }

  // -------------------------------------------------------
  // BADGE
  // -------------------------------------------------------
  function _syncBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    const total = _items.reduce((s, i) => s + (i.quantity || 0), 0);
    badge.textContent   = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
    badge.classList.remove('badge-pulse');
    void badge.offsetWidth;
    if (total > 0) badge.classList.add('badge-pulse');
  }

  // -------------------------------------------------------
  // OPERACIONES
  // -------------------------------------------------------
  function addItem(item) {
    // Clave única: productSku + sku medida
    const key = `${item.productSku}::${item.sku}`;
    const existing = _items.find(i => `${i.productSku}::${i.sku}` === key);

    if (existing) {
      existing.quantity = Math.min(
        existing.quantity + (item.quantity || 1),
        TTT_CONFIG.cart.maxQuantity
      );
    } else {
      _items.push({
        uid:         Utils.uid(),
        productSku:  item.productSku  || '',
        productName: item.productName || '',
        medida:      item.medida      || '',
        sku:         item.sku         || '',
        precio:      item.precio      || 0,
        quantity:    item.quantity    || 1,
        imagen:      item.imagen      || TTT_CONFIG.images.placeholder,
      });
    }
    _save();
    _resetInactivityTimer();
    Logger.log('ttt-cart.js: ítem agregado', item.sku);
  }

  function removeItem(uid) {
    _items = _items.filter(i => i.uid !== uid);
    _save();
    _resetInactivityTimer();
  }

  function updateQuantity(uid, qty) {
    const item = _items.find(i => i.uid === uid);
    if (!item) return;
    const q = parseInt(qty, 10);
    if (q <= 0) removeItem(uid);
    else { item.quantity = Math.min(q, TTT_CONFIG.cart.maxQuantity); _save(); }
    _resetInactivityTimer();
  }

  function clear()      { _items = []; _save(); _stopInactivityTimer(); }
  function getItems()   { return _items.map(i => ({ ...i })); }
  function getTotal()   { return _items.reduce((s, i) => s + i.precio * i.quantity, 0); }
  function getCount()   { return _items.reduce((s, i) => s + i.quantity, 0); }

  // -------------------------------------------------------
  // RENDER MODAL CARRITO
  // -------------------------------------------------------
  function renderCart() {
    const itemsEl  = document.getElementById('cartItems');
    const emptyEl  = document.getElementById('cartEmpty');
    const footerEl = document.getElementById('cartFooter');
    const totalEl  = document.getElementById('cartTotalAmount');

    if (!itemsEl) return;

    const items = getItems();

    if (items.length === 0) {
      itemsEl.innerHTML   = '';
      itemsEl.style.display  = 'none';
      if (emptyEl)  emptyEl.style.display  = 'flex';
      if (footerEl) footerEl.style.display = 'none';
      return;
    }

    if (emptyEl)  emptyEl.style.display  = 'none';
    if (footerEl) footerEl.style.display = '';
    itemsEl.style.display = '';

    itemsEl.innerHTML = items.map(item => `
      <div class="ttt-cart-item" data-uid="${Utils.sanitize(item.uid)}">
        <div class="ttt-cart-item-img-wrap">
          <img class="ttt-cart-item-img"
            src="${Utils.sanitize(item.imagen)}"
            alt="${Utils.sanitize(item.medida)}"
            loading="lazy"
            onerror="this.onerror=null;this.src='${TTT_CONFIG.images.placeholder}'"
          >
        </div>
        <div class="ttt-cart-item-info">
          <p class="ttt-cart-item-name">${Utils.sanitize(item.productName)}</p>
          <span class="ttt-cart-item-medida">${Utils.sanitize(item.medida)}</span>
          <span class="ttt-cart-item-sku">${Utils.sanitize(item.sku)}</span>
          <p class="ttt-cart-item-unit">${Utils.formatPrice(item.precio)} / ud</p>
        </div>
        <div class="ttt-cart-item-controls">
          <div class="ttt-cart-qty-selector">
            <button class="ttt-cart-qty-btn" data-action="dec" data-uid="${Utils.sanitize(item.uid)}" aria-label="Reducir">−</button>
            <input class="ttt-cart-qty-input" type="number" min="1" max="${TTT_CONFIG.cart.maxQuantity}"
              value="${item.quantity}" data-uid="${Utils.sanitize(item.uid)}" aria-label="Cantidad">
            <button class="ttt-cart-qty-btn" data-action="inc" data-uid="${Utils.sanitize(item.uid)}" aria-label="Aumentar">+</button>
          </div>
          <p class="ttt-cart-item-total">${Utils.formatPrice(item.precio * item.quantity)}</p>
          <button class="ttt-cart-item-remove" data-uid="${Utils.sanitize(item.uid)}" aria-label="Eliminar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </div>
    `).join('');

    if (totalEl) totalEl.textContent = Utils.formatPriceFull(getTotal());

    _bindCartEvents(itemsEl);
  }

  function _bindCartEvents(container) {
    const fresh = container.cloneNode(true);
    container.parentNode.replaceChild(fresh, container);

    fresh.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (btn) {
        const uid  = btn.dataset.uid;
        const item = _items.find(i => i.uid === uid);
        if (!item) return;
        updateQuantity(uid, item.quantity + (btn.dataset.action === 'inc' ? 1 : -1));
        renderCart();
        return;
      }
      const removeBtn = e.target.closest('.ttt-cart-item-remove');
      if (removeBtn) {
        const uid  = removeBtn.dataset.uid;
        const item = _items.find(i => i.uid === uid);
        removeItem(uid);
        Toast.show(`"${Utils.truncate(item?.productName || 'Artículo', 30)}" eliminado ✓`, 'info');
        renderCart();
      }
    });

    fresh.addEventListener('change', (e) => {
      const input = e.target.closest('.ttt-cart-qty-input');
      if (!input) return;
      updateQuantity(input.dataset.uid, parseInt(input.value, 10));
      renderCart();
    });
  }

  // -------------------------------------------------------
  // INACTIVIDAD (10 min warn → 12 min clear)
  // -------------------------------------------------------
  const WARN_MS  = 10 * 60 * 1000;
  const CLEAR_MS = 12 * 60 * 1000;
  let _timerWarn = null, _timerClear = null;

  function _resetInactivityTimer() {
    clearTimeout(_timerWarn); clearTimeout(_timerClear);
    if (_items.length === 0) return;
    _timerWarn  = setTimeout(() => {
      if (_items.length === 0) return;
      Toast.show('⏱ Tu selección expirará en 2 minutos por inactividad.', 'warning', 8000);
    }, WARN_MS);
    _timerClear = setTimeout(() => {
      if (_items.length === 0) return;
      clear();
      Logger.log('ttt-cart.js: carrito vaciado por inactividad');
    }, CLEAR_MS);
  }

  function _stopInactivityTimer() {
    clearTimeout(_timerWarn); clearTimeout(_timerClear);
  }

  // -------------------------------------------------------
  // INIT
  // -------------------------------------------------------
  function init() {
    _load();
    _resetInactivityTimer();
    Logger.log('ttt-cart.js inicializado ✓');
  }

  return { init, addItem, removeItem, updateQuantity, clear, getItems, getTotal, getCount, renderCart };

})();

document.addEventListener('DOMContentLoaded', () => { Cart.init(); });
window.Cart = Cart;
Logger.log('ttt-cart.js cargado ✓');
