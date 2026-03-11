// @version    v1.0  @file mlg-cart.js  @updated 2026-03-11  @session mlg-catalog
/* ===== MLG V1 - cart.js =====
 * Carrito con persistencia LocalStorage
 * Item shape: { uid, productId, productName, familia, collection, sku, price, quantity, image }
 * =========================================== */

'use strict';

const Cart = (() => {

  let _items = [];

  // -------------------------------------------------------
  // PERSISTENCIA
  // -------------------------------------------------------
  function _load() {
    try {
      const raw = localStorage.getItem(MLG_CONFIG.cart.storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      _items = Array.isArray(parsed) ? parsed : [];
    } catch {
      _items = [];
    }
    _syncBadge();
  }

  function _save() {
    try {
      localStorage.setItem(MLG_CONFIG.cart.storageKey, JSON.stringify(_items));
    } catch (e) {
      Logger.warn('cart.js: No se pudo guardar en localStorage', e);
    }
    _syncBadge();
  }

  // -------------------------------------------------------
  // BADGE FLOTANTE
  // -------------------------------------------------------
  function _syncBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    const total = _items.reduce((s, i) => s + (i.quantity || 0), 0);
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
    badge.classList.remove('badge-pulse');
    void badge.offsetWidth;
    if (total > 0) badge.classList.add('badge-pulse');
  }

  // -------------------------------------------------------
  // OPERACIONES
  // -------------------------------------------------------
  function addItem(item) {
    const key = `${item.productId}::${item.sku}`;
    const existing = _items.find(i => `${i.productId}::${i.sku}` === key);

    if (existing) {
      existing.quantity = Math.min(
        existing.quantity + (item.quantity || 1),
        MLG_CONFIG.cart.maxQuantity
      );
    } else {
      _items.push({
        uid:         Utils.uid(),
        productId:   item.productId,
        productName: item.productName,
        familia:     item.familia || '',
        collection:  item.collection,
        sku:         item.sku,
        price:       item.price,
        priceOriginal: item.priceOriginal || item.price,
        descPct:     item.descPct || 0,
        quantity:    item.quantity || 1,
        image:       item.image || MLG_CONFIG.images.placeholder,
      });
    }
    _save();
    _resetInactivityTimer();
    Logger.log('cart.js: ítem agregado', item.sku);
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
    if (q <= 0) { removeItem(uid); }
    else { item.quantity = Math.min(q, MLG_CONFIG.cart.maxQuantity); _save(); }
    _resetInactivityTimer();
  }

  function clear() {
    _items = [];
    _save();
    _stopInactivityTimer();
  }

  function getItems()  { return _items.map(i => ({ ...i })); }
  function getTotal()  { return _items.reduce((s, i) => s + i.price * i.quantity, 0); }
  function getCount()  { return _items.reduce((s, i) => s + i.quantity, 0); }

  // -------------------------------------------------------
  // RENDER MODAL CARRITO
  // -------------------------------------------------------
  function renderCart() {
    const itemsContainer = document.getElementById('cartItems');
    const emptyEl        = document.getElementById('cartEmpty');
    const footerEl       = document.getElementById('cartFooter');
    const totalEl        = document.getElementById('cartTotalAmount');

    if (!itemsContainer) return;

    const items = getItems();

    if (items.length === 0) {
      itemsContainer.innerHTML = '';
      itemsContainer.style.display = 'none';
      if (emptyEl)   emptyEl.style.display   = 'flex';
      if (footerEl)  footerEl.style.display  = 'none';
      return;
    }

    if (emptyEl)  emptyEl.style.display  = 'none';
    if (footerEl) footerEl.style.display = '';
    itemsContainer.style.display = '';

    itemsContainer.innerHTML = items.map(item => `
      <div class="cart-item" data-uid="${Utils.sanitize(item.uid)}">

        <div class="cart-item-image-wrap">
          <img
            class="cart-item-image"
            src="${Utils.sanitize(item.image)}"
            alt="${Utils.sanitize(item.collection)}"
            loading="lazy"
            title="Ampliar"
            onerror="this.onerror=null;this.src='${MLG_CONFIG.images.placeholder}'"
          >
        </div>

        <div class="cart-item-info">
          <p class="cart-item-name">${Utils.sanitize(item.productName)}</p>
          <span class="cart-item-collection">${Utils.sanitize(item.collection)}</span>
          <span class="cart-item-sku">${Utils.sanitize(item.sku)}</span>
          ${item.priceOriginal && item.priceOriginal !== item.price
            ? `<p class="cart-item-unit-price">
                <span class="cart-price-original">${Utils.formatPrice(item.priceOriginal)}</span>
                <span class="cart-price-final">${Utils.formatPrice(item.price)}</span>
                <span class="cart-price-badge">-${item.descPct}%</span>
               </p>`
            : `<p class="cart-item-unit-price">${Utils.formatPrice(item.price)} / ud</p>`
          }
        </div>

        <div class="cart-item-controls">
          <div class="cart-qty-selector">
            <button class="cart-qty-btn" data-action="dec" data-uid="${Utils.sanitize(item.uid)}" aria-label="Reducir">−</button>
            <input
              class="cart-qty-input"
              type="number" min="1" max="${MLG_CONFIG.cart.maxQuantity}"
              value="${item.quantity}"
              data-uid="${Utils.sanitize(item.uid)}"
              aria-label="Cantidad"
            >
            <button class="cart-qty-btn" data-action="inc" data-uid="${Utils.sanitize(item.uid)}" aria-label="Aumentar">+</button>
          </div>
          <p class="cart-item-total">${Utils.formatPrice(item.price * item.quantity)}</p>
          <button class="cart-item-remove" data-uid="${Utils.sanitize(item.uid)}" aria-label="Eliminar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

    _bindCartItemEvents(itemsContainer);
  }

  function _bindCartItemEvents(container) {
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
      const removeBtn = e.target.closest('.cart-item-remove');
      if (removeBtn) {
        const uid  = removeBtn.dataset.uid;
        const item = _items.find(i => i.uid === uid);
        const name = item?.productName || 'Producto';
        removeItem(uid);
        Toast.show(`"${Utils.truncate(name, 30)}" eliminado`, 'info');
        renderCart();
      }
      const img = e.target.closest('.cart-item-image');
      if (img) Modal.openZoom(img.src, img.alt);
    });

    fresh.addEventListener('change', (e) => {
      const input = e.target.closest('.cart-qty-input');
      if (!input) return;
      updateQuantity(input.dataset.uid, parseInt(input.value, 10));
      renderCart();
    });
  }

  function handleWishlist() {
    const items = getItems();
    if (!items.length) { Toast.show('Tu carrito está vacío', 'warning'); return; }
    Logger.log('cart.js: handleWishlist → modal checkout WA');
  }

  function handlePayment() {
    const items = getItems();
    if (!items.length) { Toast.show('Tu carrito está vacío', 'warning'); return; }
    const total = getTotal();
    if (total <= 0) { Toast.show('Total inválido', 'error'); return; }
    Logger.log('cart.js: handlePayment → modal checkout Wompi');
  }

  function _checkPostPayment() {
    const params    = new URLSearchParams(window.location.search);
    const status    = params.get('transaction_status') || params.get('status');
    const reference = params.get('reference');
    if (!status || !reference) return;
    window.history.replaceState({}, '', window.location.pathname);
    if (status === 'APPROVED') {
      Toast.show('¡Pago aprobado! Gracias por tu compra', 'success', 6000);
      clear();
    } else if (status === 'DECLINED' || status === 'ERROR') {
      Toast.show('El pago no fue procesado. Puedes intentarlo nuevamente.', 'error', 6000);
    } else if (status === 'PENDING') {
      Toast.show('Pago en proceso. Te notificaremos cuando se confirme.', 'info', 5000);
    }
    try { sessionStorage.removeItem('mlg_pending_order'); } catch {}
  }

  // -------------------------------------------------------
  // TIMER DE INACTIVIDAD
  // -------------------------------------------------------
  const INACTIVITY_WARN_MS  = 10 * 60 * 1000;
  const INACTIVITY_CLEAR_MS = 12 * 60 * 1000;
  let _timerWarn  = null;
  let _timerClear = null;

  function _resetInactivityTimer() {
    clearTimeout(_timerWarn);
    clearTimeout(_timerClear);
    if (_items.length === 0) return;
    _timerWarn = setTimeout(() => {
      if (_items.length === 0) return;
      Toast.show('Tu selección expirará en 2 minutos por inactividad.', 'warning', 8000);
    }, INACTIVITY_WARN_MS);
    _timerClear = setTimeout(() => {
      if (_items.length === 0) return;
      clear();
      Logger.log('cart.js: carrito vaciado por inactividad');
    }, INACTIVITY_CLEAR_MS);
  }

  function _stopInactivityTimer() {
    clearTimeout(_timerWarn);
    clearTimeout(_timerClear);
  }

  // -------------------------------------------------------
  // INIT
  // -------------------------------------------------------
  function init() {
    _load();
    _checkPostPayment();
    _resetInactivityTimer();
    Logger.log('cart.js inicializado ✓');
  }

  return {
    init,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    getItems,
    getTotal,
    getCount,
    renderCart,
    handleWishlist,
    handlePayment,
  };

})();

// ===== BOOTSTRAP =====
document.addEventListener('DOMContentLoaded', () => {
  Cart.init();
});

window.Cart = Cart;
Logger.log('cart.js cargado ✓');
