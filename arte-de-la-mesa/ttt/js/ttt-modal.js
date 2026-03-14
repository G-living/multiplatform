// @version    v1.0  @file ttt-modal.js  @updated 2026-03-14  @session fix-mlg-404-error-aSVYy
/* ===== TTT - ttt-modal.js =====
 * Modal producto TTT:
 *  - Galería de fotos con botones − / + (y flechas ← → teclado)
 *  - Foto inicial aleatoria; contador N/Total
 *  - Botón Compartir (solo mobile, Web Share API)
 *  - Nombre patrón + categoría + descripción + material
 *  - Array de medidas: medida | €precio | qty [− qty +]
 *  - Botón "Agregar al carrito" sticky abajo
 * Modal carrito: ver detalle + fork WA / Wompi
 * ============================================ */

'use strict';

const Modal = (() => {

  // ---- Estado producto ----
  let _product    = null;    // TTT product object actual
  let _imgIdx     = 0;       // índice de foto visible (0-based)
  let _imgList    = [];      // lista de URLs de fotos
  let _quantities = {};      // { sku: qty } por medida
  let _focusTrapCleanup = null;
  let _prevFocus  = null;

  // -------------------------------------------------------
  // OPEN / CLOSE HELPERS
  // -------------------------------------------------------
  function _openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    _prevFocus = document.activeElement;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    const content = modal.querySelector('.modal-content');
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
  // ABRIR MODAL PRODUCTO
  // -------------------------------------------------------
  function openProduct(product) {
    if (!product) return;
    _product    = product;
    _quantities = {};
    (product.medidas || []).forEach(m => { _quantities[m.sku] = 0; });

    // Construir lista de imágenes
    _imgList = (product.images || []).map(f => ImageManager.productSrc(f));
    if (_imgList.length === 0) _imgList = [TTT_CONFIG.images.placeholder];

    // Foto inicial aleatoria
    _imgIdx = _imgList.length > 1 ? Math.floor(Math.random() * _imgList.length) : 0;

    _ensureProductModal();
    _renderProductModal();
    _openModal('tttModalProduct');
  }

  // -------------------------------------------------------
  // BUILD MODAL DOM (una sola vez)
  // -------------------------------------------------------
  function _ensureProductModal() {
    if (document.getElementById('tttModalProduct')) return;

    const modal = document.createElement('div');
    modal.id        = 'tttModalProduct';
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'tttProductTitle');

    modal.innerHTML = `
      <div class="modal-overlay" id="tttModalOverlay"></div>
      <div class="modal-content ttt-modal-content">

        <!-- Cerrar -->
        <button class="modal-close" id="tttModalClose" aria-label="Cerrar">×</button>

        <!-- ── SECCIÓN FOTO ── -->
        <div class="ttt-modal-photo-section">

          <!-- Flechas laterales (← →) -->
          <button class="ttt-photo-nav ttt-photo-nav--prev" id="tttPhotoPrev" aria-label="Foto anterior">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>

          <div class="ttt-modal-img-wrap">
            <img id="tttMainImg" class="ttt-modal-img"
              src="" alt=""
              onerror="this.onerror=null;this.src='${TTT_CONFIG.images.placeholder}'"
            >
            <div id="tttImgPlaceholder" class="ttt-modal-img-placeholder" style="display:none">
              <span>Sin imagen</span>
            </div>
          </div>

          <div class="ttt-photo-nav-right">
            <button class="ttt-photo-nav ttt-photo-nav--next" id="tttPhotoNext" aria-label="Foto siguiente">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <!-- Share — solo visible en mobile vía CSS -->
            <button class="ttt-btn-share" id="tttBtnShare" aria-label="Compartir">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </button>
          </div>

        </div>

        <!-- Controles de foto: − contador + -->
        <div class="ttt-photo-controls">
          <button class="ttt-photo-ctrl-btn" id="tttPhotoDec" aria-label="Foto anterior">−</button>
          <span class="ttt-photo-counter" id="tttPhotoCounter">1 / 1</span>
          <button class="ttt-photo-ctrl-btn" id="tttPhotoInc" aria-label="Foto siguiente">+</button>
        </div>

        <!-- ── INFO PRODUCTO ── -->
        <div class="ttt-modal-product-info">
          <h2 class="ttt-modal-product-title" id="tttProductTitle"></h2>
          <p class="ttt-modal-product-cat" id="tttProductCat"></p>
          <p class="ttt-modal-product-desc" id="tttProductDesc"></p>
          <p class="ttt-modal-product-material" id="tttProductMaterial"></p>
        </div>

        <!-- ── MEDIDAS ARRAY ── -->
        <div class="ttt-modal-medidas-wrap">
          <div class="ttt-medidas-header">
            <span>Medida</span>
            <span>Precio</span>
            <span>Cantidad</span>
          </div>
          <div id="tttMedidasList" class="ttt-medidas-list"></div>
        </div>

        <!-- ── FOOTER ── -->
        <div class="ttt-modal-footer">
          <div class="ttt-modal-total">
            <span class="ttt-modal-total-label">Total seleccionado:</span>
            <span class="ttt-modal-total-amount" id="tttTotalAmount">€0</span>
          </div>
          <button class="btn btn-primary ttt-btn-cart" id="tttBtnCart" disabled>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Agregar al carrito
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(modal);

    // ── Eventos ──
    document.getElementById('tttModalClose')?.addEventListener('click',  () => _closeModal('tttModalProduct'));
    document.getElementById('tttModalOverlay')?.addEventListener('click', () => _closeModal('tttModalProduct'));
    document.getElementById('tttPhotoPrev')?.addEventListener('click', () => _navPhoto(-1));
    document.getElementById('tttPhotoNext')?.addEventListener('click', () => _navPhoto(+1));
    document.getElementById('tttPhotoDec')?.addEventListener('click',  () => _navPhoto(-1));
    document.getElementById('tttPhotoInc')?.addEventListener('click',  () => _navPhoto(+1));
    document.getElementById('tttBtnCart')?.addEventListener('click',   _addToCart);

    // Flechas de teclado
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); _navPhoto(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); _navPhoto(+1); }
      if (e.key === 'Escape')     { _closeModal('tttModalProduct'); }
    });

    // Share button
    document.getElementById('tttBtnShare')?.addEventListener('click', async () => {
      if (!navigator.share) return;
      const prod = _product;
      if (!prod) return;
      const url = `${location.origin}${location.pathname}?p=${prod.sku}`;
      try {
        await navigator.share({
          title: `${prod.patron} — ${Utils.catLabel(prod.categoria)}`,
          url,
        });
      } catch (_) { /* cancelado */ }
    });

    // Delegación qty buttons en medidas list
    document.getElementById('tttMedidasList')?.addEventListener('click', _handleQtyClick);
  }

  // -------------------------------------------------------
  // RENDER CONTENIDO DEL MODAL
  // -------------------------------------------------------
  function _renderProductModal() {
    const prod = _product;
    if (!prod) return;

    // Foto
    _updatePhoto();

    // Info
    const titleEl    = document.getElementById('tttProductTitle');
    const catEl      = document.getElementById('tttProductCat');
    const descEl     = document.getElementById('tttProductDesc');
    const materialEl = document.getElementById('tttProductMaterial');
    const shareBtn   = document.getElementById('tttBtnShare');

    if (titleEl)    titleEl.textContent    = prod.patron || prod.name || '';
    if (catEl)      catEl.textContent      = Utils.catLabel(prod.categoria);
    if (descEl)     descEl.textContent     = prod.shortDesc || '';
    if (materialEl) {
      materialEl.textContent = prod.material ? `Material: ${prod.material}` : '';
      materialEl.style.display = prod.material ? '' : 'none';
    }
    if (shareBtn) {
      shareBtn.dataset.sku = prod.sku;
      // Ocultar si no hay Web Share API
      shareBtn.style.display = navigator.share ? '' : 'none';
    }

    // Medidas
    _renderMedidas();
    _updateFooter();
  }

  // -------------------------------------------------------
  // FOTO NAVIGATION
  // -------------------------------------------------------
  function _navPhoto(dir) {
    if (_imgList.length <= 1) return;
    _imgIdx = (_imgIdx + dir + _imgList.length) % _imgList.length;
    _updatePhoto();
  }

  function _updatePhoto() {
    const imgEl = document.getElementById('tttMainImg');
    const phEl  = document.getElementById('tttImgPlaceholder');
    const counterEl = document.getElementById('tttPhotoCounter');

    const src = _imgList[_imgIdx] || TTT_CONFIG.images.placeholder;

    if (imgEl) {
      imgEl.style.display = '';
      if (phEl) phEl.style.display = 'none';

      const preload = new Image();
      preload.onload = () => {
        imgEl.src = src;
        imgEl.alt = _product?.patron || '';
      };
      preload.onerror = () => {
        imgEl.src = TTT_CONFIG.images.placeholder;
      };
      preload.src = src;
    }

    if (counterEl) {
      counterEl.textContent = `${_imgIdx + 1} / ${_imgList.length}`;
    }

    // Ocultar botones si solo hay 1 foto
    const hasMultiple = _imgList.length > 1;
    ['tttPhotoPrev','tttPhotoNext','tttPhotoDec','tttPhotoInc'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.visibility = hasMultiple ? '' : 'hidden';
    });
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
      const precioFmt = Utils.formatPrice(m.precio);
      return `
        <div class="ttt-medida-row" data-sku="${Utils.sanitize(m.sku)}">
          <span class="ttt-medida-size">${Utils.sanitize(m.medida || '—')}</span>
          <span class="ttt-medida-price">${Utils.sanitize(precioFmt)}</span>
          <div class="ttt-medida-qty">
            <button class="ttt-qty-btn" data-action="dec" data-sku="${Utils.sanitize(m.sku)}" aria-label="Reducir cantidad">−</button>
            <span class="ttt-qty-display" id="tttQty_${safeSkuId}">0</span>
            <button class="ttt-qty-btn" data-action="inc" data-sku="${Utils.sanitize(m.sku)}" aria-label="Aumentar cantidad">+</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function _handleQtyClick(e) {
    const btn = e.target.closest('.ttt-qty-btn');
    if (!btn) return;
    const sku    = btn.dataset.sku;
    const action = btn.dataset.action;
    if (!sku || !action) return;

    const current = _quantities[sku] || 0;
    if (action === 'dec') {
      _quantities[sku] = Math.max(0, current - 1);
    } else {
      _quantities[sku] = Math.min(TTT_CONFIG.cart.maxQuantity, current + 1);
    }

    _updateMedidaRow(sku);
    _updateFooter();
  }

  function _updateMedidaRow(sku) {
    const qty = _quantities[sku] || 0;
    const safeId = sku.replace(/[^a-zA-Z0-9_-]/g, '_');
    const qtyEl = document.getElementById(`tttQty_${safeId}`);
    if (qtyEl) qtyEl.textContent = qty;
  }

  // -------------------------------------------------------
  // FOOTER — total + estado botón
  // -------------------------------------------------------
  function _updateFooter() {
    const totalEl = document.getElementById('tttTotalAmount');
    const btn     = document.getElementById('tttBtnCart');

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
  // MODAL CARRITO
  // -------------------------------------------------------
  function openCart() {
    _ensureCartModal();
    Cart.renderCart();
    _openModal('tttModalCart');
  }

  function _ensureCartModal() {
    if (document.getElementById('tttModalCart')) return;

    const modal = document.createElement('div');
    modal.id        = 'tttModalCart';
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'tttCartTitle');

    modal.innerHTML = `
      <div class="modal-overlay" id="tttCartOverlay"></div>
      <div class="modal-content ttt-cart-content">

        <button class="modal-close" id="tttCartClose" aria-label="Cerrar">×</button>

        <div class="ttt-cart-header">
          <h2 class="ttt-cart-title" id="tttCartTitle">Tu selección</h2>
        </div>

        <!-- Estado vacío -->
        <div id="cartEmpty" class="ttt-cart-empty" style="display:none">
          <p>No hay artículos en tu selección.</p>
        </div>

        <!-- Items -->
        <div id="cartItems" class="ttt-cart-items"></div>

        <!-- Footer -->
        <div id="cartFooter" class="ttt-cart-footer" style="display:none">
          <div class="ttt-cart-total-row">
            <span>Total estimado:</span>
            <span class="ttt-cart-total-amount" id="cartTotalAmount">€0</span>
          </div>
          <div class="ttt-cart-actions">
            <button class="btn btn-secondary ttt-btn-wishlist" id="tttBtnWishlist">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Enviar por WhatsApp
            </button>
          </div>
        </div>

      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('tttCartClose')?.addEventListener('click',   () => _closeModal('tttModalCart'));
    document.getElementById('tttCartOverlay')?.addEventListener('click', () => _closeModal('tttModalCart'));
    document.getElementById('tttBtnWishlist')?.addEventListener('click', _handleWishlist);
  }

  function _handleWishlist() {
    const items = Cart.getItems();
    if (!items.length) { Toast.show('Tu carrito está vacío', 'warning'); return; }
    const msg = Utils.buildWishlistMessage(items);
    window.open(Utils.buildWhatsAppUrl(msg), '_blank');
  }

  // -------------------------------------------------------
  // API PÚBLICA
  // -------------------------------------------------------
  return {
    openProduct,
    openCart,
  };

})();

window.Modal = Modal;
Logger.log('ttt-modal.js cargado ✓');
