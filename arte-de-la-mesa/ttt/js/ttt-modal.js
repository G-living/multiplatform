// @version    v2.1  @file ttt-modal.js  @updated 2026-03-14  @session fix-mlg-404-error-aSVYy
/* ===== TTT - ttt-modal.js =====
 * Modal producto TTT — modales estáticos en HTML, eventos enlazados en _bindEvents()
 *  - Imagen principal: fotos del producto
 *  - Flechas ← → navegan entre productos de la misma categoría
 *  - Botones − / + bajo la foto ciclan las fotos del producto actual
 *  - Contador fotos (1/N) y contador productos (N de M)
 *  - Botón Compartir (solo mobile, Web Share API)
 *  - Array medidas: miniatura expandible | medida | SKU | €precio | -qty+ | subtotal
 *  - Footer sticky: total + Agregar al carrito
 *  - Modal Zoom para miniaturas y foto principal
 *  - Modal Carrito: detalle + enviar por WhatsApp
 * ============================================ */

'use strict';

const Modal = (() => {

  // ---- Estado ----
  let _product       = null;
  let _catalogList   = [];
  let _productIdx    = 0;
  let _imgList       = [];
  let _imgIdx        = 0;
  let _quantities    = {};
  let _focusTrapCleanup = null;
  let _prevFocus     = null;

  // -------------------------------------------------------
  // HELPERS APERTURA / CIERRE
  // -------------------------------------------------------
  function _openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    _prevFocus = document.activeElement;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    const content = modal.querySelector('.modal-content, .ttt-zoom-content');
    if (content) {
      content.scrollTop = 0;
      if (_focusTrapCleanup) _focusTrapCleanup();
      try { _focusTrapCleanup = A11y.trapFocus(content); }
      catch { _focusTrapCleanup = null; }
    }
  }

  function _closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('is-open');
    const anyOpen = document.querySelector('.modal.is-open');
    if (!anyOpen) document.body.style.overflow = '';
    if (_focusTrapCleanup) { _focusTrapCleanup(); _focusTrapCleanup = null; }
    if (_prevFocus) { _prevFocus.focus(); _prevFocus = null; }
  }

  // -------------------------------------------------------
  // BIND EVENTS — enlaza todos los eventos sobre modales estáticos del HTML
  // Se llama una sola vez desde DOMContentLoaded (dentro del IIFE)
  // -------------------------------------------------------
  function _bindEvents() {

    // ── Modal producto ──
    document.getElementById('tttModalClose')?.addEventListener('click',   () => _closeModal('tttModalProduct'));
    document.getElementById('tttModalOverlay')?.addEventListener('click', () => _closeModal('tttModalProduct'));

    document.getElementById('tttNavPrev')?.addEventListener('click', () => _navProduct(-1));
    document.getElementById('tttNavNext')?.addEventListener('click', () => _navProduct(+1));

    document.getElementById('tttPhotoDec')?.addEventListener('click', () => _navPhoto(-1));
    document.getElementById('tttPhotoInc')?.addEventListener('click', () => _navPhoto(+1));

    document.getElementById('tttMainImg')?.addEventListener('click', () => {
      const src = _imgList[_imgIdx];
      if (src) openZoom(src, _product?.patron || '');
    });

    document.getElementById('tttMedidasList')?.addEventListener('click', _handleMedidaClick);
    document.getElementById('tttBtnCart')?.addEventListener('click', _addToCart);

    document.getElementById('tttBtnShare')?.addEventListener('click', async () => {
      if (!_product) return;
      const url  = `${location.origin}${location.pathname}?p=${_product.sku}`;
      const title = `${_product.patron} — ${Utils.catLabel(_product.categoria)}`;
      if (navigator.share) {
        try { await navigator.share({ title, url }); } catch (_) { /* cancelado */ }
      } else {
        try {
          await navigator.clipboard.writeText(url);
          Toast.show('Enlace copiado al portapapeles');
        } catch (_) {
          window.prompt('Copia el enlace:', url);
        }
      }
    });

    document.getElementById('tttModalProduct')?.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); _navProduct(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); _navProduct(+1); }
    });

    // ── Modal zoom ──
    document.getElementById('tttZoomClose')?.addEventListener('click',   () => _closeModal('tttModalZoom'));
    document.getElementById('tttZoomOverlay')?.addEventListener('click', () => _closeModal('tttModalZoom'));

    // ── Modal carrito ──
    document.getElementById('tttCartClose')?.addEventListener('click',   () => _closeModal('tttModalCart'));
    document.getElementById('tttCartOverlay')?.addEventListener('click', () => _closeModal('tttModalCart'));
    document.getElementById('tttBtnWishlist')?.addEventListener('click', _handleWishlist);

    // Escape global
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (document.getElementById('tttModalZoom')?.classList.contains('is-open'))    { _closeModal('tttModalZoom');    return; }
      if (document.getElementById('tttModalProduct')?.classList.contains('is-open')) { _closeModal('tttModalProduct'); return; }
      if (document.getElementById('tttModalCart')?.classList.contains('is-open'))    { _closeModal('tttModalCart');    return; }
    });
  }

  // -------------------------------------------------------
  // ABRIR MODAL PRODUCTO
  // -------------------------------------------------------
  function openProduct(prod) {
    if (!prod) return;

    const all = (typeof Catalog !== 'undefined' && Catalog.getFiltered)
      ? Catalog.getFiltered()
      : (window.TTT_PRODUCTS || []);
    _catalogList = all.filter(p => p.categoria === prod.categoria);
    if (_catalogList.length === 0) _catalogList = [prod];
    _productIdx = Math.max(0, _catalogList.findIndex(p => p.sku === prod.sku));

    _loadProduct(_catalogList[_productIdx] || prod);
    _renderProductModal();
    _openModal('tttModalProduct');
  }

  function _loadProduct(prod) {
    _product    = prod;
    _quantities = {};
    (prod.medidas || []).forEach(m => { _quantities[m.sku] = 0; });

    _imgList = (prod.images || []).map(f => ImageManager.productSrc(f));
    if (_imgList.length === 0) _imgList = [TTT_CONFIG.images.placeholder];

    _imgIdx = _imgList.length > 1 ? Math.floor(Math.random() * _imgList.length) : 0;
  }

  // -------------------------------------------------------
  // RENDER MODAL PRODUCTO
  // -------------------------------------------------------
  function _renderProductModal() {
    const prod = _product;
    if (!prod) return;

    const catEl = document.getElementById('tttModalCatLabel');
    if (catEl) catEl.textContent = Utils.catLabel(prod.categoria);

    _updatePhoto();

    const titleEl   = document.getElementById('tttProductTitle');
    const counterEl = document.getElementById('tttProductCounter');
    if (titleEl) titleEl.textContent = prod.patron || prod.name || '';
    if (counterEl) {
      counterEl.textContent = _catalogList.length > 1
        ? `${_productIdx + 1} / ${_catalogList.length}`
        : '';
    }

    const descEl     = document.getElementById('tttProductDesc');
    const materialEl = document.getElementById('tttProductMaterial');
    if (descEl) descEl.textContent = prod.shortDesc || '';
    if (materialEl) {
      materialEl.textContent = prod.material || '';
      materialEl.style.display = prod.material ? '' : 'none';
    }

    const shareBtn = document.getElementById('tttBtnShare');
    if (shareBtn) {
      shareBtn.dataset.sku = prod.sku;
      shareBtn.style.display = navigator.share ? 'flex' : 'none';
    }

    const prevBtn = document.getElementById('tttNavPrev');
    const nextBtn = document.getElementById('tttNavNext');
    if (prevBtn) prevBtn.disabled = _productIdx === 0;
    if (nextBtn) nextBtn.disabled = _productIdx === _catalogList.length - 1;

    _renderMedidas();
    _updateFooter();
  }

  // -------------------------------------------------------
  // NAVEGACIÓN PRODUCTOS
  // -------------------------------------------------------
  function _navProduct(dir) {
    const newIdx = _productIdx + dir;
    if (newIdx < 0 || newIdx >= _catalogList.length) return;
    _productIdx = newIdx;
    _loadProduct(_catalogList[_productIdx]);
    _renderProductModal();

    const wrap = document.querySelector('.ttt-modal-medidas-wrap');
    if (wrap) wrap.scrollTop = 0;
    const content = document.querySelector('.ttt-modal-content');
    if (content) content.scrollTop = 0;
  }

  // -------------------------------------------------------
  // NAVEGACIÓN FOTOS
  // -------------------------------------------------------
  function _navPhoto(dir) {
    if (_imgList.length <= 1) return;
    _imgIdx = (_imgIdx + dir + _imgList.length) % _imgList.length;
    _updatePhoto();
  }

  function _updatePhoto() {
    const imgEl     = document.getElementById('tttMainImg');
    const phEl      = document.getElementById('tttImgPlaceholder');
    const counterEl = document.getElementById('tttPhotoCounter');

    const src = _imgList[_imgIdx] || TTT_CONFIG.images.placeholder;

    if (imgEl) {
      const preload = new Image();
      preload.onload = () => {
        imgEl.src = src;
        imgEl.alt = _product?.patron || '';
        imgEl.style.display = '';
        if (phEl) phEl.style.display = 'none';
      };
      preload.onerror = () => {
        imgEl.style.display = 'none';
        if (phEl) phEl.style.display = 'flex';
      };
      preload.src = src;
    }

    if (counterEl) counterEl.textContent = `${_imgIdx + 1} / ${_imgList.length}`;

    const hasMultiple = _imgList.length > 1;
    ['tttPhotoDec', 'tttPhotoInc'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.visibility = hasMultiple ? '' : 'hidden';
    });
    if (counterEl) counterEl.style.visibility = hasMultiple ? '' : 'hidden';
  }

  // -------------------------------------------------------
  // MEDIDAS ARRAY
  // -------------------------------------------------------
  function _renderMedidas() {
    const list = document.getElementById('tttMedidasList');
    if (!list || !_product) return;

    const medidas = _product.medidas || [];
    if (medidas.length === 0) {
      list.innerHTML = '<p class="ttt-medidas-empty">Sin medidas disponibles</p>';
      return;
    }

    list.innerHTML = medidas.map(m => {
      const safeSkuId = m.sku.replace(/[^a-zA-Z0-9_-]/g, '_');
      const imgSrc    = m.imagen
        ? ImageManager.productSrc(m.imagen)
        : (_imgList[0] || TTT_CONFIG.images.placeholder);
      const precioFmt = Utils.formatPrice(m.precio);

      return `
        <div class="ttt-fv-row" data-sku="${Utils.sanitize(m.sku)}">
          <img
            class="ttt-fv-thumb"
            src="${Utils.sanitize(imgSrc)}"
            alt="${Utils.sanitize(m.medida || '')}"
            loading="lazy"
            data-zoom-src="${Utils.sanitize(imgSrc)}"
            data-zoom-alt="${Utils.sanitize(m.medida || '')}"
            title="Ampliar"
            onerror="this.style.visibility='hidden'"
          >
          <div class="ttt-fv-info">
            <span class="ttt-fv-medida">${Utils.sanitize(m.medida || '—')}</span>
            <span class="ttt-fv-sku">${Utils.sanitize(m.sku)}</span>
          </div>
          <span class="ttt-fv-price">${Utils.sanitize(precioFmt)}</span>
          <div class="ttt-fv-qty">
            <button class="ttt-qty-btn" data-action="dec" data-sku="${Utils.sanitize(m.sku)}" aria-label="Reducir">−</button>
            <span class="ttt-qty-display" id="tttQty_${safeSkuId}">0</span>
            <button class="ttt-qty-btn" data-action="inc" data-sku="${Utils.sanitize(m.sku)}" aria-label="Aumentar">+</button>
          </div>
          <span class="ttt-fv-subtotal" id="tttSub_${safeSkuId}">€0</span>
        </div>
      `;
    }).join('');
  }

  function _handleMedidaClick(e) {
    const thumb = e.target.closest('.ttt-fv-thumb');
    if (thumb && thumb.dataset.zoomSrc) {
      openZoom(thumb.dataset.zoomSrc, thumb.dataset.zoomAlt || '');
      return;
    }

    const btn = e.target.closest('.ttt-qty-btn');
    if (!btn) return;
    const sku    = btn.dataset.sku;
    const action = btn.dataset.action;
    if (!sku || !action) return;

    const cur = _quantities[sku] || 0;
    _quantities[sku] = action === 'dec'
      ? Math.max(0, cur - 1)
      : Math.min(TTT_CONFIG.cart.maxQuantity, cur + 1);

    _updateMedidaRow(sku);
    _updateFooter();
  }

  function _updateMedidaRow(sku) {
    const qty    = _quantities[sku] || 0;
    const safeId = sku.replace(/[^a-zA-Z0-9_-]/g, '_');
    const qtyEl  = document.getElementById(`tttQty_${safeId}`);
    const subEl  = document.getElementById(`tttSub_${safeId}`);
    if (qtyEl) qtyEl.textContent = qty;
    if (subEl) {
      const medida   = (_product?.medidas || []).find(m => m.sku === sku);
      const subtotal = medida ? medida.precio * qty : 0;
      subEl.textContent = Utils.formatPrice(subtotal);
    }
  }

  // -------------------------------------------------------
  // FOOTER
  // -------------------------------------------------------
  function _updateFooter() {
    const totalEl  = document.getElementById('tttTotalAmount');
    const btn      = document.getElementById('tttBtnCart');
    const total    = _calcTotal();
    const totalQty = Object.values(_quantities).reduce((s, q) => s + q, 0);

    if (totalEl) totalEl.textContent = Utils.formatPrice(total);
    if (btn) {
      btn.disabled = totalQty === 0;
      btn.innerHTML = totalQty > 0
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
           Agregar al carrito — ${Utils.formatPrice(total)}`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
           Selecciona al menos una medida`;
    }
  }

  function _calcTotal() {
    if (!_product) return 0;
    return (_product.medidas || []).reduce((sum, m) => {
      return sum + m.precio * (_quantities[m.sku] || 0);
    }, 0);
  }

  // -------------------------------------------------------
  // AGREGAR AL CARRITO
  // -------------------------------------------------------
  function _addToCart() {
    if (!_product) return;
    const itemsToAdd = (_product.medidas || []).filter(m => (_quantities[m.sku] || 0) > 0);
    if (!itemsToAdd.length) return;

    itemsToAdd.forEach(m => {
      Cart.addItem({
        productSku:  _product.sku,
        productName: `${_product.patron} — ${Utils.catLabel(_product.categoria)}`,
        medida:      m.medida,
        sku:         m.sku,
        precio:      m.precio,
        quantity:    _quantities[m.sku],
        imagen:      m.imagen
          ? ImageManager.productSrc(m.imagen)
          : (_imgList[0] || TTT_CONFIG.images.placeholder),
      });
    });

    const totalQty = itemsToAdd.reduce((s, m) => s + _quantities[m.sku], 0);
    Toast.show(`${totalQty} ${totalQty === 1 ? 'artículo agregado' : 'artículos agregados'} al carrito ✓`);
    _closeModal('tttModalProduct');
  }

  // -------------------------------------------------------
  // MODAL ZOOM
  // -------------------------------------------------------
  function openZoom(src, alt = '') {
    const img = document.getElementById('tttZoomImage');
    if (img) {
      img.src = src || TTT_CONFIG.images.placeholder;
      img.alt = alt;
      img.onerror = () => { img.onerror = null; img.src = TTT_CONFIG.images.placeholder; };
    }
    _openModal('tttModalZoom');
  }

  // -------------------------------------------------------
  // MODAL CARRITO
  // -------------------------------------------------------
  function openCart() {
    Cart.renderCart();
    _openModal('tttModalCart');
  }

  function _handleWishlist() {
    const items = Cart.getItems();
    if (!items.length) { Toast.show('Tu carrito está vacío', 'warning'); return; }
    const msg = Utils.buildWishlistMessage(items);
    window.open(Utils.buildWhatsAppUrl(msg), '_blank');
  }

  // -------------------------------------------------------
  // INIT — _bindEvents se llama cuando el DOM está listo
  // -------------------------------------------------------
  document.addEventListener('DOMContentLoaded', _bindEvents);

  // -------------------------------------------------------
  // API PÚBLICA
  // -------------------------------------------------------
  return {
    openProduct,
    openCart,
    openZoom,
  };

})();

window.Modal = Modal;
Logger.log('ttt-modal.js v2.1 cargado ✓');
