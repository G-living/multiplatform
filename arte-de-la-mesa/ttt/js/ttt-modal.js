// @version    v2.0  @file ttt-modal.js  @updated 2026-03-14  @session fix-mlg-404-error-aSVYy
/* ===== TTT - ttt-modal.js =====
 * Modal producto TTT — clonado de Imolarte family modal:
 *  - Imagen principal: Gallery_Image del producto (foto 0)
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
  let _product       = null;   // producto actual
  let _catalogList   = [];     // lista de navegación (misma categoría en filtrado activo)
  let _productIdx    = 0;      // índice en _catalogList
  let _imgList       = [];     // URLs de fotos del producto actual
  let _imgIdx        = 0;      // índice de foto visible
  let _quantities    = {};     // { sku: qty }
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
  // ABRIR MODAL PRODUCTO
  // -------------------------------------------------------
  function openProduct(prod) {
    if (!prod) return;
    _product = prod;

    // Lista de navegación: productos de la misma categoría en el filtrado activo
    const all = (typeof Catalog !== 'undefined' && Catalog.getFiltered)
      ? Catalog.getFiltered()
      : (window.TTT_PRODUCTS || []);
    _catalogList = all.filter(p => p.categoria === prod.categoria);
    if (_catalogList.length === 0) _catalogList = [prod];
    _productIdx = Math.max(0, _catalogList.findIndex(p => p.sku === prod.sku));

    _loadProduct(_catalogList[_productIdx] || prod);
    _ensureProductModal();
    _renderProductModal();
    _openModal('tttModalProduct');
  }

  function _loadProduct(prod) {
    _product    = prod;
    _quantities = {};
    (prod.medidas || []).forEach(m => { _quantities[m.sku] = 0; });

    // Fotos principales del producto
    _imgList = (prod.images || []).map(f => ImageManager.productSrc(f));
    if (_imgList.length === 0) _imgList = [TTT_CONFIG.images.placeholder];

    // Foto inicial aleatoria
    _imgIdx = _imgList.length > 1 ? Math.floor(Math.random() * _imgList.length) : 0;
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

        <!-- ── CABECERA CATEGORÍA ── -->
        <div class="ttt-modal-header">
          <span class="ttt-modal-cat-label" id="tttModalCatLabel"></span>
        </div>

        <!-- ── SECCIÓN FOTO ── -->
        <div class="ttt-modal-img-section">

          <!-- Flecha: producto anterior -->
          <button class="ttt-nav-btn ttt-nav-prev" id="tttNavPrev" aria-label="Producto anterior">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>

          <!-- Foto principal -->
          <div class="ttt-modal-img-wrap" id="tttImgWrap">
            <img id="tttMainImg" class="ttt-modal-img ttt-modal-img--zoomable"
              src="" alt=""
              title="Ampliar"
              onerror="this.onerror=null;this.src='${TTT_CONFIG.images.placeholder}'"
            >
            <div id="tttImgPlaceholder" class="ttt-modal-img-placeholder" style="display:none">
              <span>Sin imagen</span>
            </div>
          </div>

          <!-- Columna derecha: flecha producto siguiente + share -->
          <div class="ttt-nav-right">
            <button class="ttt-nav-btn ttt-nav-next" id="tttNavNext" aria-label="Producto siguiente">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <button class="ttt-btn-share" id="tttBtnShare" aria-label="Compartir producto" style="display:none">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </button>
          </div>

        </div>

        <!-- ── CONTROLES FOTO: − contador + ── -->
        <div class="ttt-photo-controls">
          <button class="ttt-photo-ctrl-btn" id="tttPhotoDec" aria-label="Foto anterior">−</button>
          <span class="ttt-photo-counter" id="tttPhotoCounter">1 / 1</span>
          <button class="ttt-photo-ctrl-btn" id="tttPhotoInc" aria-label="Foto siguiente">+</button>
        </div>

        <!-- ── INFO PRODUCTO ── -->
        <div class="ttt-modal-product-info">
          <div class="ttt-modal-product-title-row">
            <h2 class="ttt-modal-product-title" id="tttProductTitle"></h2>
            <span class="ttt-modal-product-counter" id="tttProductCounter"></span>
          </div>
          <p class="ttt-modal-product-desc" id="tttProductDesc"></p>
          <p class="ttt-modal-product-material" id="tttProductMaterial"></p>
        </div>

        <!-- ── MEDIDAS ARRAY ── -->
        <div class="ttt-modal-medidas-wrap">
          <div class="ttt-medidas-header">
            <span></span>
            <span>Medida / SKU</span>
            <span>Precio</span>
            <span>Cantidad</span>
            <span>Subtotal</span>
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
            Selecciona al menos una medida
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(modal);

    // ── Eventos ──
    document.getElementById('tttModalClose')?.addEventListener('click',  () => _closeModal('tttModalProduct'));
    document.getElementById('tttModalOverlay')?.addEventListener('click', () => _closeModal('tttModalProduct'));

    // Flechas: navegan PRODUCTOS
    document.getElementById('tttNavPrev')?.addEventListener('click', () => _navProduct(-1));
    document.getElementById('tttNavNext')?.addEventListener('click', () => _navProduct(+1));

    // −/+: navegan FOTOS del producto actual
    document.getElementById('tttPhotoDec')?.addEventListener('click', () => _navPhoto(-1));
    document.getElementById('tttPhotoInc')?.addEventListener('click', () => _navPhoto(+1));

    // Foto principal → zoom
    document.getElementById('tttMainImg')?.addEventListener('click', () => {
      const src = _imgList[_imgIdx];
      if (src) openZoom(src, _product?.patron || '');
    });

    // Delegación en lista medidas: zoom en miniatura + qty buttons
    document.getElementById('tttMedidasList')?.addEventListener('click', _handleMedidaClick);

    // Carrito
    document.getElementById('tttBtnCart')?.addEventListener('click', _addToCart);

    // Share button
    document.getElementById('tttBtnShare')?.addEventListener('click', async () => {
      if (!navigator.share || !_product) return;
      const url = `${location.origin}${location.pathname}?p=${_product.sku}`;
      try {
        await navigator.share({
          title: `${_product.patron} — ${Utils.catLabel(_product.categoria)}`,
          url,
        });
      } catch (_) { /* cancelado */ }
    });

    // Teclado: ← → navegan productos; Escape cierra
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); _navProduct(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); _navProduct(+1); }
      if (e.key === 'Escape')     { _closeModal('tttModalProduct'); }
    });
  }

  // -------------------------------------------------------
  // RENDER MODAL PRODUCTO
  // -------------------------------------------------------
  function _renderProductModal() {
    const prod = _product;
    if (!prod) return;

    // Categoría label
    const catEl = document.getElementById('tttModalCatLabel');
    if (catEl) catEl.textContent = Utils.catLabel(prod.categoria);

    // Foto principal
    _updatePhoto();

    // Título + contador productos
    const titleEl   = document.getElementById('tttProductTitle');
    const counterEl = document.getElementById('tttProductCounter');
    if (titleEl) titleEl.textContent = prod.patron || prod.name || '';
    if (counterEl) {
      counterEl.textContent = _catalogList.length > 1
        ? `${_productIdx + 1} / ${_catalogList.length}`
        : '';
    }

    // Descripción + material
    const descEl     = document.getElementById('tttProductDesc');
    const materialEl = document.getElementById('tttProductMaterial');
    if (descEl) descEl.textContent = prod.shortDesc || '';
    if (materialEl) {
      materialEl.textContent = prod.material ? `${prod.material}` : '';
      materialEl.style.display = prod.material ? '' : 'none';
    }

    // Share button (solo mobile con Web Share API)
    const shareBtn = document.getElementById('tttBtnShare');
    if (shareBtn) {
      shareBtn.dataset.sku = prod.sku;
      shareBtn.style.display = navigator.share ? 'flex' : 'none';
    }

    // Flechas: deshabilitar en extremos
    const prevBtn = document.getElementById('tttNavPrev');
    const nextBtn = document.getElementById('tttNavNext');
    if (prevBtn) prevBtn.disabled = _productIdx === 0;
    if (nextBtn) nextBtn.disabled = _productIdx === _catalogList.length - 1;

    // Medidas
    _renderMedidas();
    _updateFooter();
  }

  // -------------------------------------------------------
  // NAVEGACIÓN PRODUCTOS (flechas laterales)
  // -------------------------------------------------------
  function _navProduct(dir) {
    const newIdx = _productIdx + dir;
    if (newIdx < 0 || newIdx >= _catalogList.length) return;
    _productIdx = newIdx;
    _loadProduct(_catalogList[_productIdx]);
    _renderProductModal();

    // Scroll al top de medidas
    const wrap = document.querySelector('.ttt-modal-medidas-wrap');
    if (wrap) wrap.scrollTop = 0;
    const content = document.querySelector('.ttt-modal-content');
    if (content) content.scrollTop = 0;
  }

  // -------------------------------------------------------
  // NAVEGACIÓN FOTOS (−/+ bajo la imagen)
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

    if (counterEl) {
      counterEl.textContent = `${_imgIdx + 1} / ${_imgList.length}`;
    }

    // Ocultar controles si solo hay 1 foto
    const hasMultiple = _imgList.length > 1;
    ['tttPhotoDec', 'tttPhotoInc'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.visibility = hasMultiple ? '' : 'hidden';
    });
    if (counterEl) counterEl.style.visibility = hasMultiple ? '' : 'hidden';
  }

  // -------------------------------------------------------
  // MEDIDAS ARRAY
  // Cada fila: [miniatura] [medida / sku] [precio] [-qty+] [subtotal]
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
      const safeSkuId  = m.sku.replace(/[^a-zA-Z0-9_-]/g, '_');
      const imgSrc     = m.imagen
        ? ImageManager.productSrc(m.imagen)
        : (_imgList[0] || TTT_CONFIG.images.placeholder);
      const precioFmt  = Utils.formatPrice(m.precio);

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
    // Zoom en miniatura
    const thumb = e.target.closest('.ttt-fv-thumb');
    if (thumb && thumb.dataset.zoomSrc) {
      openZoom(thumb.dataset.zoomSrc, thumb.dataset.zoomAlt || '');
      return;
    }

    // Qty buttons
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
      const medida  = (_product?.medidas || []).find(m => m.sku === sku);
      const subtotal = medida ? medida.precio * qty : 0;
      subEl.textContent = Utils.formatPrice(subtotal);
    }
  }

  // -------------------------------------------------------
  // FOOTER — total + estado botón
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
    _ensureZoomModal();
    const img = document.getElementById('tttZoomImage');
    if (img) {
      img.src = src || TTT_CONFIG.images.placeholder;
      img.alt = alt;
      img.onerror = () => { img.onerror = null; img.src = TTT_CONFIG.images.placeholder; };
    }
    _openModal('tttModalZoom');
  }

  function _ensureZoomModal() {
    if (document.getElementById('tttModalZoom')) return;

    const modal = document.createElement('div');
    modal.id        = 'tttModalZoom';
    modal.className = 'modal';
    modal.style.zIndex = String(parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--z-modal').trim() || '1400') + 100);

    modal.innerHTML = `
      <div class="ttt-zoom-overlay" id="tttZoomOverlay"></div>
      <div class="ttt-zoom-content">
        <button class="modal-close ttt-zoom-close" id="tttZoomClose" aria-label="Cerrar">×</button>
        <img id="tttZoomImage" class="ttt-zoom-image" src="" alt="">
      </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('tttZoomClose')?.addEventListener('click',   () => _closeModal('tttModalZoom'));
    document.getElementById('tttZoomOverlay')?.addEventListener('click', () => _closeModal('tttModalZoom'));
    modal.addEventListener('keydown', e => { if (e.key === 'Escape') _closeModal('tttModalZoom'); });
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

        <div id="cartEmpty" class="ttt-cart-empty" style="display:none">
          <p>No hay artículos en tu selección.</p>
        </div>

        <div id="cartItems" class="ttt-cart-items"></div>

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
    openZoom,
  };

})();

window.Modal = Modal;
Logger.log('ttt-modal.js v2 cargado ✓');
