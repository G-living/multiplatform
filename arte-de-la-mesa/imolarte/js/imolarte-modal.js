// @version    v21.0  @file modal.js  @updated 2026-03-06  @session presale-campania
/* ===== IMOLARTE V2 - modal.js =====
 * Modales: familia, zoom, carrito, checkout WA/Wompi, gift card
 * Modal familia: navegación entre productos con flechas, 10 variantes comodín,
 *   precio dinámico, qty, subtotal, botones WA + Wompi
 * Carrito: fork → [Wishlist WhatsApp] / [Pagar con Wompi]
 * =========================================== */

'use strict';


// ===== MODAL MANAGER =====
const Modal = (() => {

  // ---- Estado producto/familia ----
  let _currentProduct = null;
  let _currentFamily  = null;   // nombre de familia activa
  let _familyProducts = [];     // array de productos de la familia
  let _familyIdx      = 0;      // índice del producto visible en el modal
  let _quantities     = {};     // { sku: qty } — una cantidad por variante
  let _focusTrapCleanup = null;
  let _prevFocus = null;

  // ---- Estado checkout WA ----
  let _waPedidoId   = '';     // referencia del pedido WA activo
  let _waProcessing = false;  // evita doble submit

  // -------------------------------------------------------
  // HELPERS APERTURA / CIERRE
  // -------------------------------------------------------
  function _openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    _prevFocus = document.activeElement;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    const content = modal.querySelector('.modal-content, .modal-zoom-content');
    if (content) {
      if (_focusTrapCleanup) _focusTrapCleanup();
      try { _focusTrapCleanup = A11y.trapFocus(content); }
      catch { _focusTrapCleanup = null; }
    }
  }

  function _closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('is-open');
    const anyOpen = document.querySelector('.modal.is-open');
    if (!anyOpen) document.body.style.overflow = '';
    if (_focusTrapCleanup) { _focusTrapCleanup(); _focusTrapCleanup = null; }
    if (_prevFocus) { _prevFocus.focus(); _prevFocus = null; }
    // BUG-PLACES-WA: al cerrar modales con Places, limpiar pacInit para reinicializar correctamente
    const pacInputs = modal.querySelectorAll('[data-pac-init]');
    pacInputs.forEach(el => delete el.dataset.pacInit);
  }

  // -------------------------------------------------------
  // MODAL PRODUCTO
  // Layout (confirmado por pantallas):
  //   [imagen real — top]
  //   [nombre producto]
  //   [fila variante: comodín | NOMBRE COLECCIÓN / SKU | precio | -qty+ | subtotal]  ×10
  //   [Agregar al Carrito — sticky bottom]
  // -------------------------------------------------------
  function openProduct(product) {
    _currentProduct = product;
    _quantities = {};
    // Inicializar todas las cantidades en 0
    (product.variants || []).forEach(v => { _quantities[v.sku] = 0; });

    _renderProductModal(product);
    _openModal('modalProduct');
  }

  function _renderProductModal(product) {
    // Imagen principal
    const mainImg = document.getElementById('productMainImage');
    if (mainImg) {
      mainImg.src = product.image;
      mainImg.alt = product.name;
      mainImg.onerror = () => {
        mainImg.onerror = null;
        mainImg.src = IMOLARTE_CONFIG.images.placeholder;
      };
    }

    // Título
    const titleEl = document.getElementById('productTitle');
    if (titleEl) titleEl.textContent = product.name;

    // Colección label — vaciar (no aplica al nivel producto)
    const collEl = document.getElementById('productCollection');
    if (collEl) collEl.textContent = '';

    // Variantes
    _renderVariants(product.variants || []);

    // Botón agregar
    _updateAddButton();
  }

  // -------------------------------------------------------
  // RENDER VARIANTES
  // Cada fila: [img comodín clickeable→zoom] [nombre\nsku] [precio] [-qty+] [subtotal]
  // -------------------------------------------------------
  function _renderVariants(variants) {
    const list = document.getElementById('variantsList');
    if (!list) return;

    if (!variants.length) {
      list.innerHTML = '<p class="variants-empty">Sin variantes disponibles</p>';
      return;
    }

    list.innerHTML = variants.map(v => `
      <div class="variant-row" data-sku="${Utils.sanitize(v.sku)}">

        <img
          class="variant-comodin"
          src="${Utils.sanitize(v.comodin)}"
          alt="${Utils.sanitize(v.collection)}"
          loading="lazy"
          data-zoom-src="${Utils.sanitize(v.comodin)}"
          data-zoom-alt="${Utils.sanitize(v.collection)}"
          title="Ampliar imagen"
          onerror="this.style.visibility='hidden'"
        >

        <div class="variant-info">
          <span class="variant-name">${Utils.sanitize(v.collection)}</span>
          <span class="variant-code">${Utils.sanitize(v.sku)}</span>
        </div>

        <span class="variant-price">${Utils.formatPrice(v.price)}</span>

        <div class="variant-qty">
          <button class="qty-btn" data-action="dec" data-sku="${Utils.sanitize(v.sku)}" aria-label="Reducir">−</button>
          <span class="qty-display" id="qty-${Utils.sanitize(v.sku)}">0</span>
          <button class="qty-btn" data-action="inc" data-sku="${Utils.sanitize(v.sku)}" aria-label="Aumentar">+</button>
        </div>

        <span class="variant-subtotal" id="sub-${Utils.sanitize(v.sku)}">$0</span>

      </div>
    `).join('');
  }

  function _handleVariantClick(e) {
    // Zoom en comodín
    const comodinImg = e.target.closest('.variant-comodin');
    if (comodinImg) {
      Modal.openZoom(comodinImg.dataset.zoomSrc, comodinImg.dataset.zoomAlt);
      return;
    }

    // Qty buttons
    const btn = e.target.closest('.qty-btn');
    if (!btn) return;

    const sku = btn.dataset.sku;
    const action = btn.dataset.action;
    if (!sku || !action) return;

    const current = _quantities[sku] || 0;
    if (action === 'dec') {
      _quantities[sku] = Math.max(0, current - 1);
    } else if (action === 'inc') {
      _quantities[sku] = Math.min(IMOLARTE_CONFIG.cart.maxQuantity, current + 1);
    }

    _updateVariantRow(sku);
    _updateAddButton();
  }

  function _updateVariantRow(sku) {
    const qty = _quantities[sku] || 0;
    const qtyEl = document.getElementById(`qty-${sku}`);
    const subEl = document.getElementById(`sub-${sku}`);
    if (qtyEl) qtyEl.textContent = qty;

    if (subEl) {
      const variant = (_currentProduct?.variants || []).find(v => v.sku === sku);
      const subtotal = variant ? variant.price * qty : 0;
      subEl.textContent = Utils.formatPrice(subtotal);
    }
  }

  function _updateAddButton() {
    const btn = document.getElementById('btnAddToCart');
    if (!btn) return;

    const totalQty = Object.values(_quantities).reduce((s, q) => s + q, 0);
    const totalAmount = _calculateTotal();

    if (totalQty > 0) {
      btn.disabled = false;
      btn.textContent = `Agregar al Carrito — ${Utils.formatPrice(totalAmount)}`;
    } else {
      btn.disabled = true;
      btn.textContent = 'Selecciona al menos una colección';
    }
  }

  function _calculateTotal() {
    if (!_currentProduct) return 0;
    return (_currentProduct.variants || []).reduce((sum, v) => {
      return sum + v.price * (_quantities[v.sku] || 0);
    }, 0);
  }

  // -------------------------------------------------------
  // AGREGAR AL CARRITO
  // Agrega un item por cada variante con qty > 0
  // -------------------------------------------------------
  function _handleAddToCart() {
    if (!_currentProduct) return;

    const itemsToAdd = (_currentProduct.variants || []).filter(v => (_quantities[v.sku] || 0) > 0);
    if (!itemsToAdd.length) return;

    itemsToAdd.forEach(v => {
      Cart.addItem({
        productId:   _currentProduct.id,
        productName: _currentProduct.name,
        collection:  v.collection,
        sku:         v.sku,
        comodin:     v.comodin,
        price:       v.price,
        quantity:    _quantities[v.sku],
        image:       _currentProduct.image,
      });
    });

    const totalQty = itemsToAdd.reduce((s, v) => s + _quantities[v.sku], 0);
    Toast.show(`${totalQty} ${totalQty === 1 ? 'pieza agregada' : 'piezas agregadas'} al carrito ✓`);
    _closeModal('modalProduct');
  }

  // -------------------------------------------------------
  // MODAL FAMILIA
  // Abre el modal con todos los productos de una familia.
  // Flechas ←→ navegan entre productos dentro de la familia.
  // Layout:
  //   [← flecha] [imagen producto] [→ flecha]
  //   [nombre producto] [N de M]
  //   [10 variantes: comodín | colección | precio | qty | subtotal]
  //   [footer: total | btn WA | btn Wompi]
  // -------------------------------------------------------
  function openFamily(familyName) {
    if (!familyName) return;

    _currentFamily  = familyName;
    _familyProducts = (typeof Catalog !== 'undefined')
      ? Catalog.getProductsByFamily(familyName)
      : [];

    if (!_familyProducts.length) {
      Logger.warn('openFamily: sin productos para', familyName);
      return;
    }

    _familyIdx = 0;
    _quantities = {};

    // Construir el modal dinámicamente si no existe
    _ensureFamilyModal();
    _renderFamilyModal();
    _openModal('modalFamily');
  }

  function _ensureFamilyModal() {
    if (document.getElementById('modalFamily')) return;

    const modal = document.createElement('div');
    modal.id        = 'modalFamily';
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'familyProductTitle');

    modal.innerHTML = `
      <div class="modal-overlay" id="modalFamilyOverlay"></div>
      <div class="modal-content modal-family-content">

        <button class="modal-close" id="closeFamilyModal" aria-label="Cerrar">×</button>

        <!-- Cabecera familia -->
        <div class="family-modal-header">
          <span class="family-modal-label" id="familyModalLabel"></span>
        </div>

        <!-- Imagen + flechas -->
        <div class="family-modal-img-section">
          <button class="family-nav-btn family-nav-prev" id="familyNavPrev" aria-label="Producto anterior">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="family-modal-img-wrap">
            <img id="familyProductImg" class="family-modal-img family-modal-img--zoomable" src="" alt=""
              onerror="this.style.display='none';document.getElementById('familyImgPlaceholder').style.display='flex'"
              title="Ampliar imagen">
            <div id="familyImgPlaceholder" class="family-modal-placeholder" style="display:none">
              <span class="family-card-placeholder-text">PLACEHOLDER</span>
            </div>
          </div>
          <button class="family-nav-btn family-nav-next" id="familyNavNext" aria-label="Producto siguiente">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <!-- Info producto -->
        <div class="family-modal-product-info">
          <h2 class="family-modal-product-title" id="familyProductTitle"></h2>
          <span class="family-modal-counter" id="familyCounter"></span>
        </div>

        <!-- Variantes -->
        <div class="family-modal-variants" id="familyVariantsList"></div>

        <!-- Footer totales + botones -->
        <div class="family-modal-footer">
          <div class="family-modal-total">
            <span class="family-modal-total-label">Total seleccionado:</span>
            <span class="family-modal-total-amount" id="familyTotalAmount">$0</span>
          </div>
          <div class="family-modal-actions">
            <button class="btn btn-primary family-btn-cart" id="familyBtnCart" disabled>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              Agregar al carrito
            </button>
          </div>
        </div>

      </div>
    `;

    document.body.appendChild(modal);

    // Eventos del modal familia
    document.getElementById('closeFamilyModal')?.addEventListener('click', () => _closeModal('modalFamily'));
    document.getElementById('modalFamilyOverlay')?.addEventListener('click', () => _closeModal('modalFamily'));
    document.getElementById('familyNavPrev')?.addEventListener('click', _familyNavPrev);
    document.getElementById('familyNavNext')?.addEventListener('click', _familyNavNext);
    document.getElementById('familyVariantsList')?.addEventListener('click', _handleFamilyVariantClick);
    document.getElementById('familyBtnCart')?.addEventListener('click', _familyAddToCart);

    // Click imagen principal → zoom
    document.getElementById('familyProductImg')?.addEventListener('click', () => {
      if (_currentProduct?.image) openZoom(_currentProduct.image, _currentProduct.name);
    });
  }

  function _renderFamilyModal() {
    const prod = _familyProducts[_familyIdx];
    if (!prod) return;

    _currentProduct = prod;
    // Reset quantities for this product
    _quantities = {};
    (prod.variants || []).forEach(v => { _quantities[v.sku] = 0; });

    // Label familia
    const labelEl = document.getElementById('familyModalLabel');
    if (labelEl) labelEl.textContent = _currentFamily;

    // Imagen — precargar antes de asignar para evitar flash de placeholder
    const imgEl = document.getElementById('familyProductImg');
    const phEl  = document.getElementById('familyImgPlaceholder');
    if (imgEl) {
      if (prod.image) {
        const preload = new Image();
        preload.onload = () => {
          imgEl.src     = prod.image;
          imgEl.alt     = prod.name;
          imgEl.style.display = '';
          if (phEl) phEl.style.display = 'none';
        };
        preload.onerror = () => {
          imgEl.style.display = 'none';
          if (phEl) phEl.style.display = 'flex';
        };
        preload.src = prod.image;
      } else {
        imgEl.style.display = 'none';
        if (phEl) phEl.style.display = 'flex';
      }
    }

    // Título
    const titleEl = document.getElementById('familyProductTitle');
    if (titleEl) titleEl.textContent = prod.name;

    // Contador
    const counterEl = document.getElementById('familyCounter');
    if (counterEl) counterEl.textContent = `${_familyIdx + 1} / ${_familyProducts.length}`;

    // Flechas: deshabilitar en extremos
    const prevBtn = document.getElementById('familyNavPrev');
    const nextBtn = document.getElementById('familyNavNext');
    if (prevBtn) prevBtn.disabled = _familyIdx === 0;
    if (nextBtn) nextBtn.disabled = _familyIdx === _familyProducts.length - 1;

    // Variantes
    _renderFamilyVariants(prod.variants || []);
    _updateFamilyFooter();
  }

  function _renderFamilyVariants(variants) {
    const list = document.getElementById('familyVariantsList');
    if (!list) return;

    if (!variants.length) {
      list.innerHTML = '<p class="variants-empty">Sin variantes disponibles</p>';
      return;
    }

    list.innerHTML = variants.map(v => `
      <div class="fv-row" data-sku="${Utils.sanitize(v.sku)}">
        <img
          class="fv-comodin"
          src="${Utils.sanitize(v.foto_comodin || 'images/placeholder.jpg')}"
          alt="${Utils.sanitize(v.coleccion)}"
          loading="lazy"
          onerror="this.style.visibility='hidden'"
          data-zoom-src="${Utils.sanitize(v.foto_comodin || '')}"
          data-zoom-alt="${Utils.sanitize(v.coleccion)}"
          title="Ampliar"
        >
        <div class="fv-info">
          <span class="fv-name">${Utils.sanitize(v.coleccion)}</span>
          <span class="fv-sku">${Utils.sanitize(v.sku)}</span>
        </div>
        ${(() => {
          const ps = Utils.calcPresale(v.precio_cop);
          if (ps.tieneDescuento) {
            return `<span class="fv-price fv-price--presale">
              <span class="fv-price-original">${Utils.formatPrice(ps.original)}</span>
              <span class="fv-price-final">${Utils.formatPrice(ps.final)}</span>
            </span>`;
          }
          return `<span class="fv-price">${Utils.formatPrice(ps.original)}</span>`;
        })()}
        <div class="fv-qty">
          <button class="qty-btn" data-action="dec" data-sku="${Utils.sanitize(v.sku)}" aria-label="Reducir">−</button>
          <span class="qty-display" id="fqty-${Utils.sanitize(v.sku)}">0</span>
          <button class="qty-btn" data-action="inc" data-sku="${Utils.sanitize(v.sku)}" aria-label="Aumentar">+</button>
        </div>
        <span class="fv-subtotal" id="fsub-${Utils.sanitize(v.sku)}">$0</span>
      </div>
    `).join('');
  }

  function _handleFamilyVariantClick(e) {
    // Zoom comodín
    const comodinImg = e.target.closest('.fv-comodin');
    if (comodinImg && comodinImg.dataset.zoomSrc) {
      openZoom(comodinImg.dataset.zoomSrc, comodinImg.dataset.zoomAlt);
      return;
    }
    // Qty buttons
    const btn = e.target.closest('.qty-btn');
    if (!btn) return;
    const sku = btn.dataset.sku;
    const action = btn.dataset.action;
    if (!sku || !action) return;

    const cur = _quantities[sku] || 0;
    _quantities[sku] = action === 'dec'
      ? Math.max(0, cur - 1)
      : Math.min(IMOLARTE_CONFIG.cart.maxQuantity, cur + 1);

    _updateFamilyVariantRow(sku);
    _updateFamilyFooter();
  }

  function _updateFamilyVariantRow(sku) {
    const qty    = _quantities[sku] || 0;
    const qtyEl  = document.getElementById(`fqty-${sku}`);
    const subEl  = document.getElementById(`fsub-${sku}`);
    if (qtyEl) qtyEl.textContent = qty;
    if (subEl) {
      const variant = (_currentProduct?.variants || []).find(v => v.sku === sku);
      const ps = Utils.calcPresale(variant?.precio_cop || 0);
      subEl.textContent = Utils.formatPrice(ps.final * qty);
    }
  }

  function _updateFamilyFooter() {
    const total    = _calculateFamilyTotal();
    const hasItems = Object.values(_quantities).some(q => q > 0);

    const totalEl = document.getElementById('familyTotalAmount');
    if (totalEl) totalEl.textContent = Utils.formatPrice(total);

    const btnCart = document.getElementById('familyBtnCart');
    if (btnCart) btnCart.disabled = !hasItems;
  }

  function _calculateFamilyTotal() {
    if (!_currentProduct) return 0;
    return (_currentProduct.variants || []).reduce((sum, v) => {
      const ps = Utils.calcPresale(v.precio_cop || 0);
      return sum + ps.final * (_quantities[v.sku] || 0);
    }, 0);
  }

  function _familyNavPrev() {
    if (_familyIdx > 0) {
      _familyIdx--;
      _renderFamilyModal();
    }
  }

  function _familyNavNext() {
    if (_familyIdx < _familyProducts.length - 1) {
      _familyIdx++;
      _renderFamilyModal();
    }
  }

  function _familyAddToCart() {
    const items = _buildFamilyCartItems();
    if (!items.length) return;
    items.forEach(it => Cart.addItem(it));
    const totalQty = items.reduce((s, i) => s + i.quantity, 0);
    _closeModal('modalFamily');
    Toast.show(`${totalQty} ${totalQty === 1 ? 'pieza agregada' : 'piezas agregadas'} al carrito ✓`);
  }

  function _buildFamilyCartItems() {
    if (!_currentProduct) return [];
    return (_currentProduct.variants || [])
      .filter(v => (_quantities[v.sku] || 0) > 0)
      .map(v => {
        const ps = Utils.calcPresale(v.precio_cop);
        return {
          productId:     _currentProduct.id,
          productName:   _currentProduct.name,
          familia:       _currentFamily,
          collection:    v.coleccion,
          sku:           v.sku,
          comodin:       v.foto_comodin,
          price:         ps.final,          // precio efectivo (con descuento si hay campaña)
          priceOriginal: ps.original,       // precio pleno — para mostrar tachado en carrito
          descPct:       ps.descPct,        // % descuento aplicado (0 si no hay campaña)
          quantity:      _quantities[v.sku],
          image:         _currentProduct.image,
        };
      });
  }

  // -------------------------------------------------------
  // MODAL ZOOM
  // -------------------------------------------------------
  function openZoom(src, alt = '') {
    const img = document.getElementById('zoomImage');
    if (img) {
      img.src = src || IMOLARTE_CONFIG.images.placeholder;
      img.alt = alt;
      img.onerror = () => { img.onerror = null; img.src = IMOLARTE_CONFIG.images.placeholder; };
    }
    _openModal('modalZoom');
  }

  // -------------------------------------------------------
  // MODAL CARRITO
  // -------------------------------------------------------
  function openCart() {
    Cart.renderCart();
    _openModal('modalCart');
  }

  // -------------------------------------------------------
  // EVENTOS GLOBALES
  // -------------------------------------------------------
  function _bindEvents() {

    // ── Modal Legal (TyC y Datos Personales) ──
    const _openLegal = (tpl, title) => {
      const overlay  = document.getElementById('modalLegal');
      const content  = document.getElementById('modalLegalContent');
      const titleEl  = document.getElementById('modalLegalTitle');
      const template = document.getElementById(tpl);
      if (!overlay || !content || !template) return;
      content.innerHTML = '';
      content.appendChild(template.content.cloneNode(true));
      if (titleEl) titleEl.textContent = title;
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    };
    const _closeLegal = () => {
      const overlay = document.getElementById('modalLegal');
      if (overlay) overlay.style.display = 'none';
      document.body.style.overflow = '';
    };
    // TyC y Datos — modal WA (IDs propios para no conflicto con Wompi)
    document.getElementById('btnOpenTyCWA')?.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      _openLegal('tplTyC', 'Términos y Condiciones Generales');
    });
    document.getElementById('btnOpenDatosWA')?.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      _openLegal('tplDatosWA', 'Autorización de Almacenamiento de Datos — Ley 1581/2012');
    });
    // TyC y Datos — modal Wompi
    document.getElementById('btnOpenTyC')?.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      _openLegal('tplTyC', 'Términos y Condiciones Generales');
    });
    document.getElementById('btnOpenTyC')?.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); _openLegal('tplTyC', 'Términos y Condiciones Generales'); }
    });
    document.getElementById('btnOpenDatos')?.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      _openLegal('tplDatos', 'Tratamiento de Datos Personales — Ley Habeas Data');
    });
    document.getElementById('btnOpenDatos')?.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); _openLegal('tplDatos', 'Tratamiento de Datos Personales — Ley Habeas Data'); }
    });
    document.getElementById('btnOpenTyCGift')?.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      _openLegal('tplTyCGift', 'Términos y Condiciones — Gift Card');
    });
    document.getElementById('btnOpenDatosGift')?.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      _openLegal('tplDatos', 'Tratamiento de Datos Personales — Ley Habeas Data');
    });
    document.getElementById('btnCloseLegal')?.addEventListener('click', _closeLegal);
    document.getElementById('modalLegal')?.addEventListener('click', e => {
      if (e.target === document.getElementById('modalLegal')) _closeLegal();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && document.getElementById('modalLegal')?.style.display === 'flex') {
        _closeLegal();
      }
    });

    // Variantes — listener único delegado en variantsList
    document.getElementById('variantsList')?.addEventListener('click', _handleVariantClick);

    // Imagen principal clickeable → zoom
    document.getElementById('productMainImage')?.addEventListener('click', () => {
      if (_currentProduct?.image) Modal.openZoom(_currentProduct.image, _currentProduct.name);
    });
    document.getElementById('productImageSection')?.addEventListener('click', () => {
      if (_currentProduct?.image) Modal.openZoom(_currentProduct.image, _currentProduct.name);
    });

    // Modal producto
    document.getElementById('closeProduct')?.addEventListener('click', () => _closeModal('modalProduct'));
    document.getElementById('modalProductOverlay')?.addEventListener('click', () => _closeModal('modalProduct'));
    document.getElementById('btnAddToCart')?.addEventListener('click', _handleAddToCart);

    // Modal zoom
    document.getElementById('closeZoom')?.addEventListener('click', () => _closeModal('modalZoom'));
    document.getElementById('modalZoomOverlay')?.addEventListener('click', () => _closeModal('modalZoom'));

    // Modal carrito
    document.getElementById('closeCart')?.addEventListener('click', () => _closeModal('modalCart'));
    document.getElementById('modalCartOverlay')?.addEventListener('click', () => _closeModal('modalCart'));
    document.getElementById('btnContinueShopping')?.addEventListener('click', () => _closeModal('modalCart'));

    // Botón flotante carrito
    document.getElementById('cartButton')?.addEventListener('click', openCart);

    document.getElementById('giftButton')
      ?.addEventListener('click', () => openGift());

    // Modal GIFT — cerrar
    document.getElementById('closeGift')?.addEventListener('click', () => _closeModal('modalGift'));
    document.getElementById('modalGiftOverlay')?.addEventListener('click', () => _closeModal('modalGift'));

    // GIFT — ESC
    // (ya cubierto por el listener global de Escape — agregar al chain)
    

    // Fork carrito → abrir modales checkout
    document.getElementById('btnWishlist')?.addEventListener('click', () => {
      _closeModal('modalCart');
      setTimeout(() => openCheckoutWA(), 200);
    });
    document.getElementById('btnPayment')?.addEventListener('click', () => {
      _closeModal('modalCart');
      setTimeout(() => openCheckoutWompi(), 200);
    });

    // Checkout WA
    document.getElementById('closeCheckoutWA')?.addEventListener('click', () => {
      _resetWAModal();
      _closeModal('modalCheckoutWA');
    });
    document.getElementById('modalCheckoutWAOverlay')?.addEventListener('click', () => {
      _resetWAModal();
      _closeModal('modalCheckoutWA');
    });
    document.getElementById('formCheckoutWA')?.addEventListener('submit', _handleSubmitWA);
    // radios entrega eliminados — dirección siempre visible

    // Checkout Wompi
    document.getElementById('closeCheckoutWompi')?.addEventListener('click', () => _closeModal('modalCheckoutWompi'));
    document.getElementById('modalCheckoutWompiOverlay')?.addEventListener('click', () => _closeModal('modalCheckoutWompi'));
    document.getElementById('wpBtnApplyBono')?.addEventListener('click', _applyBono);
    document.getElementById('wpInputBono')?.addEventListener('input', e => {
      e.target.value = e.target.value.toUpperCase();
      _resetBono();
    });

    document.getElementById('btnPagar60')?.addEventListener('click', () => _submitWompi('60'));
    document.getElementById('btnPagar100')?.addEventListener('click', () => _submitWompi('100'));
    document.getElementById('btnPagarGift')?.addEventListener('click', () => _submitConGiftCard());

    // Validación blur en tiempo real — WA
    ['waInputNombre','waInputApellido','waInputEmail','waInputEmailConf','waInputTel',
     'waInputTipoDoc','waInputNumDoc',
     'waInputCumpleDia','waInputCumpleMes','waInputDir','waInputBarrio','waInputCiudad'
    ].forEach(id => {
      document.getElementById(id)?.addEventListener('blur', () => _validateCMOField(id, 'wa'));
    });
    // Check email coincidencia en tiempo real (input) — WA
    document.getElementById('waInputEmailConf')?.addEventListener('input', () => {
      _validateCMOField('waInputEmailConf', 'wa');
    });
    // Validación blur en tiempo real — Wompi
    ['wpInputNombre','wpInputApellido','wpInputEmail','wpInputEmailConf','wpInputTel',
     'wpInputTipoDoc','wpInputNumDoc',
     'wpInputCumpleDia','wpInputCumpleMes','wpInputDir','wpInputBarrio','wpInputCiudad'
    ].forEach(id => {
      document.getElementById(id)?.addEventListener('blur', () => _validateCMOField(id, 'wp'));
    });
    // Check email coincidencia en tiempo real (input) — Wompi
    document.getElementById('wpInputEmailConf')?.addEventListener('input', () => {
      _validateCMOField('wpInputEmailConf', 'wp');
    });

    // ESC — cierra el modal más interno abierto
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (document.getElementById('modalZoom')?.classList.contains('is-open')) {
        _closeModal('modalZoom');
      } else if (document.getElementById('modalFamily')?.classList.contains('is-open')) {
        _closeModal('modalFamily');
      } else if (document.getElementById('modalProduct')?.classList.contains('is-open')) {
        _closeModal('modalProduct');
      } else if (document.getElementById('modalCart')?.classList.contains('is-open')) {
        _closeModal('modalCart');
      } else if (document.getElementById('modalGift')?.classList.contains('is-open')) {
        _closeModal('modalGift');
      } else if (document.getElementById('modalCheckoutWA')?.classList.contains('is-open')) {
        _resetWAModal();
        _closeModal('modalCheckoutWA');
      } else if (document.getElementById('modalCheckoutWompi')?.classList.contains('is-open')) {
        _closeModal('modalCheckoutWompi');
      }
    });
  }


  // ═══════════════════════════════════════════════════
  // CHECKOUT — ESTADO COMPARTIDO
  // ═══════════════════════════════════════════════════
  let _ckBono      = null;   // { code, available } si voucher válido
  let _ckSubtotal  = 0;

  // ═══════════════════════════════════════════════════
  // OPEN — rellenar días y montos al abrir
  // ═══════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════
  // GOOGLE PLACES — widget oficial Autocomplete (Places API New, importLibrary)
  // Input normal → debounce → getPlacePredictions → dropdown
  // → getDetails → rellena barrio y ciudad
  // ═══════════════════════════════════════════════════

  // Estado por instancia de autocomplete activa
  // Places: estado de instancias activas por inputId
  const _pacInstances = {};

  async function _initPlacesAutocomplete(dirInputId, barrioInputId, ciudadInputId) {
    // Cargar librería Places con el nuevo loader (importLibrary)
    // Evita el deprecation warning de AutocompleteService
    try {
      await google.maps.importLibrary('places');
    } catch(e) {
      Logger.warn('modal.js: google.maps.importLibrary no disponible, reintentando…');
      setTimeout(() => _initPlacesAutocomplete(dirInputId, barrioInputId, ciudadInputId), 500);
      return;
    }

    const input = document.getElementById(dirInputId);
    if (!input || input.dataset.pacInit) return;
    input.dataset.pacInit = '1';
    input.setAttribute('autocomplete', 'off');

    // Widget oficial google.maps.places.Autocomplete
    // — no usa AutocompleteService (deprecado desde mar 2025)
    // — genera su propio dropdown .pac-container gestionado por Google
    // — z-index del .pac-container manejado por CSS (modals.css), no mover el nodo
    const ac = new google.maps.places.Autocomplete(input, {
      componentRestrictions: { country: 'co' },
      fields: ['address_components', 'formatted_address'],
      types:  ['address'],
    });

    // Cuando el usuario selecciona una sugerencia
    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (!place || !place.address_components) {
        Logger.warn('modal.js: Places place_changed sin address_components');
        return;
      }

      const components = place.address_components;
      let via    = '';
      let numero = '';
      let barrio = '';
      let ciudad = '';

      components.forEach(comp => {
        const types = comp.types || [];
        const txt   = comp.long_name || '';
        if (types.includes('route'))          via    = txt;
        if (types.includes('street_number'))  numero = txt;
        if (!barrio && (
          types.includes('neighborhood')        ||
          types.includes('sublocality_level_1') ||
          types.includes('sublocality_level_2') ||
          types.includes('sublocality')
        )) barrio = txt;
        if (!ciudad && (
          types.includes('locality') ||
          types.includes('administrative_area_level_2')
        )) ciudad = txt;
      });

      // Formatear dirección: "Calle 80 # 10-25"
      const dirFormatted = via
        ? via + (numero ? ' # ' + numero : '')
        : (place.formatted_address || '').split(',')[0].trim();
      input.value = dirFormatted;

      // Auto-rellenar barrio solo si está vacío
      const barrioEl = document.getElementById(barrioInputId);
      if (barrioEl && !barrioEl.value) {
        if (barrio) {
          barrioEl.value = barrio;
        } else {
          const parts = (place.formatted_address || '').split(',');
          if (parts.length >= 2) barrioEl.value = parts[1].trim();
        }
      }

      // Auto-rellenar ciudad
      const ciudadEl = document.getElementById(ciudadInputId);
      if (ciudadEl && ciudad && !ciudadEl.value) ciudadEl.value = ciudad;

      Logger.log('Places→', dirFormatted, '|', barrio, '|', ciudad);
    });
  }


  function openCheckoutWA() {
    _populateDias('waInputCumpleDia');
    _ckSubtotal = Cart.getTotal();
    _openModal('modalCheckoutWA');
    _initPlacesAutocomplete('waInputDir', 'waInputBarrio', 'waInputCiudad');
  }

  function openCheckoutWompi() {
    _populateDias('wpInputCumpleDia');
    _ckBono     = null;
    _ckSubtotal = Cart.getTotal();
    _updateWompiTotals();
    const btn60  = document.getElementById('btnPagar60');
    const btn100 = document.getElementById('btnPagar100');
    if (btn60)  btn60.disabled  = false;
    if (btn100) btn100.disabled = false;
    _openModal('modalCheckoutWompi');
    // BUG-07: rAF garantiza que los selects están poblados antes de cargar el draft
    requestAnimationFrame(() => {
      _loadDraft();
      _bindDraftListeners(); // idempotente — no duplica listeners
    });
    _initPlacesAutocomplete('wpInputDir', 'wpInputBarrio', 'wpInputCiudad');
  }

  function _populateDias(selectId) {
    const sel = document.getElementById(selectId);
    if (!sel || sel.options.length > 2) return; // ya poblado
    for (let d = 1; d <= 31; d++) {
      const opt = document.createElement('option');
      opt.value = d; opt.textContent = d;
      sel.appendChild(opt);
    }
  }

  // ═══════════════════════════════════════════════════
  // TOGGLE ADDRESS — domicilio / tienda
  // ═══════════════════════════════════════════════════
  function _toggleWAAddress() {
    // Dirección siempre visible y requerida — radios eliminados
    ['waInputDir','waInputBarrio','waInputCiudad'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.required = true;
    });
  }

  function _toggleWompiAddress() {
    // Dirección siempre visible y requerida — radios eliminados
    ['wpInputDir','wpInputBarrio','wpInputCiudad'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.required = true;
    });
  }

  // ═══════════════════════════════════════════════════
  // VALIDACIÓN
  // ═══════════════════════════════════════════════════
  const _CMO_VALIDATORS = {
    email:    v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Email inválido',
    telefono: v => /^\d{9,15}$/.test(v.replace(/[\s\-]/g,'')) || 'Mínimo 9 dígitos',
    nombre:   v => {
      const s = v.trim();
      if (s.length < 3) return 'Mínimo 3 caracteres';
      if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(s)) return 'Solo letras';
      return true;
    },
  };

  function _validateCMOField(inputId, prefix) {
    const el = document.getElementById(inputId);
    if (!el) return true;

    const key    = inputId.replace(prefix === 'wa' ? 'waInput' : 'wpInput', '');
    const errKey = prefix === 'wa' ? 'waErr' : 'wpErr';
    const errEl  = document.getElementById(errKey + key);
    let msg = '';

    if (el.required && !el.value.trim()) {
      msg = 'Campo obligatorio';
    } else if ((inputId.includes('Nombre') || inputId.includes('Apellido')) && el.value.trim()) {
      const r = _CMO_VALIDATORS.nombre(el.value);
      if (r !== true) msg = r;
    } else if (el.type === 'email' && el.value && !inputId.includes('Conf')) {
      const r = _CMO_VALIDATORS.email(el.value);
      if (r !== true) msg = r;
    } else if (inputId.includes('EmailConf') && el.value) {
      // Validar coincidencia con el email principal
      const mainId  = inputId.replace('EmailConf', 'Email');
      const mainEl  = document.getElementById(mainId);
      const okEl    = document.getElementById(
        (prefix === 'wa' ? 'waOkEmailConf' : 'wpOkEmailConf')
      );
      if (mainEl && el.value !== mainEl.value) {
        msg = 'Los emails no coinciden';
        if (okEl) okEl.style.display = 'none';
      } else if (mainEl && el.value === mainEl.value && el.value) {
        if (okEl) okEl.style.display = 'block';
      }
    } else if (el.type === 'tel' && el.value) {
      const r = _CMO_VALIDATORS.telefono(el.value);
      if (r !== true) msg = r;
    }

    if (errEl) errEl.textContent = msg;
    el.classList.toggle('cmo-input-error', !!msg);
    return !msg;
  }

  function _validateCMOForm(prefix) {
    const fields = prefix === 'wa'
      ? ['waInputNombre','waInputApellido','waInputEmail','waInputEmailConf','waInputTel',
         'waInputTipoDoc','waInputNumDoc',
         'waInputCumpleDia','waInputCumpleMes']
      : ['wpInputNombre','wpInputApellido','wpInputEmail','wpInputEmailConf','wpInputTel',
         'wpInputTipoDoc','wpInputNumDoc',
         'wpInputCumpleDia','wpInputCumpleMes'];

    // Dirección siempre requerida — radios eliminados
    if (true) {
      if (prefix === 'wa') fields.push('waInputDir','waInputBarrio','waInputCiudad');
      else                 fields.push('wpInputDir','wpInputBarrio','wpInputCiudad');
    }

    let ok = true;
    fields.forEach(id => { if (!_validateCMOField(id, prefix)) ok = false; });

    // T&C
    const tycId  = prefix === 'wa' ? 'waCheckTyC' : 'wpCheckTyC';
    const tycErr = prefix === 'wa' ? 'waErrTyC'   : 'wpErrTyC';
    const tyc    = document.getElementById(tycId);
    const tycEl  = document.getElementById(tycErr);
    if (tyc && !tyc.checked) {
      if (tycEl) tycEl.textContent = 'Debes aceptar los términos y condiciones';
      ok = false;
    } else if (tycEl) tycEl.textContent = '';

    // Datos personales — WA
    if (prefix === 'wa') {
      const datos    = document.getElementById('waCheckDatos');
      const datosErr = document.getElementById('waErrDatos');
      if (datos && !datos.checked) {
        if (datosErr) datosErr.textContent = 'Debes aceptar el tratamiento de datos personales';
        ok = false;
      } else if (datosErr) datosErr.textContent = '';
    }

    // Datos personales — Wompi
    if (prefix === 'wp') {
      const datos    = document.getElementById('wpCheckDatos');
      const datosErr = document.getElementById('wpErrDatos');
      if (datos && !datos.checked) {
        if (datosErr) datosErr.textContent = 'Debes aceptar el tratamiento de datos personales';
        ok = false;
      } else if (datosErr) datosErr.textContent = '';
    }

    if (!ok) {
      const firstErr = document.querySelector(`#modal${prefix === 'wa' ? 'CheckoutWA' : 'CheckoutWompi'} .cmo-input-error, #modal${prefix === 'wa' ? 'CheckoutWA' : 'CheckoutWompi'} .cmo-error:not(:empty)`);
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return ok;
  }

  // ═══════════════════════════════════════════════════
  // RECOLECTAR DATOS
  // ═══════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════
  // PERSISTENCIA FORMULARIO WOMPI — localStorage 30 días
  // Key compartida entre catálogos Helena Caballero
  // ═══════════════════════════════════════════════════
  const _DRAFT_KEY    = 'imolarte_checkout_draft';
  const _DRAFT_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días

  function _saveDraft() {
    try {
      const g = id => document.getElementById(id)?.value || '';
      const draft = {
        ts: Date.now(),
        nombre:    g('wpInputNombre'),
        apellido:  g('wpInputApellido'),
        email:     g('wpInputEmail'),
        emailConf: g('wpInputEmailConf'),
        codPais:   g('wpInputCodPais'),
        tel:       g('wpInputTel'),
        tipoPersona: document.querySelector('input[name="wpInputTipoPersona"]:checked')?.value || 'natural',
        tipoDoc:   g('wpInputTipoDoc'),
        numDoc:    g('wpInputNumDoc'),
        cumpleDia: g('wpInputCumpleDia'),
        cumpleMes: g('wpInputCumpleMes'),
        dir:       g('wpInputDir'),
        barrio:    g('wpInputBarrio'),
        ciudad:    g('wpInputCiudad'),
        notas:     g('wpInputNotas'),
        bono:      g('wpInputBono'),
      };
      localStorage.setItem(_DRAFT_KEY, JSON.stringify(draft));
    } catch(e) {}
  }

  function _loadDraft() {
    try {
      const raw = localStorage.getItem(_DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (!draft.ts || (Date.now() - draft.ts) > _DRAFT_TTL_MS) {
        localStorage.removeItem(_DRAFT_KEY);
        return;
      }
      const s = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
      s('wpInputNombre',   draft.nombre);
      s('wpInputApellido', draft.apellido);
      s('wpInputEmail',    draft.email);
      s('wpInputEmailConf',draft.emailConf);
      s('wpInputCodPais',  draft.codPais);
      s('wpInputTel',      draft.tel);
      s('wpInputTipoDoc',  draft.tipoDoc);
      s('wpInputNumDoc',   draft.numDoc);
      s('wpInputCumpleDia',draft.cumpleDia);
      s('wpInputCumpleMes',draft.cumpleMes);
      s('wpInputDir',      draft.dir);
      s('wpInputBarrio',   draft.barrio);
      s('wpInputCiudad',   draft.ciudad);
      s('wpInputNotas',    draft.notas);
      if (draft.bono) s('wpInputBono', draft.bono);
      // Radio tipo persona
      if (draft.tipoPersona) {
        const radio = document.querySelector(`input[name="wpInputTipoPersona"][value="${draft.tipoPersona}"]`);
        if (radio) radio.checked = true;
      }
      // Mostrar ✓ email si coinciden
      if (draft.email && draft.email === draft.emailConf) {
        const okEl = document.getElementById('wpOkEmailConf');
        if (okEl) okEl.style.display = 'block';
      }
    } catch(e) {}
  }

  function _clearDraft() {
    try { localStorage.removeItem(_DRAFT_KEY); } catch(e) {}
  }

  function _bindDraftListeners() {
    // Idempotente — evita duplicar listeners si se llama varias veces
    const campos = [
      'wpInputNombre','wpInputApellido','wpInputEmail','wpInputEmailConf',
      'wpInputCodPais','wpInputTel','wpInputTipoDoc','wpInputNumDoc',
      'wpInputCumpleDia','wpInputCumpleMes','wpInputDir','wpInputBarrio',
      'wpInputCiudad','wpInputNotas','wpInputBono',
    ];
    campos.forEach(id => {
      const el = document.getElementById(id);
      if (!el || el.dataset.draftBound) return;
      el.dataset.draftBound = '1';
      el.addEventListener('input', _saveDraft);
      if (el.tagName === 'SELECT') el.addEventListener('change', _saveDraft);
    });
    // Radio tipo persona — también idempotente
    document.querySelectorAll('input[name="wpInputTipoPersona"]').forEach(r => {
      if (!r.dataset.draftBound) {
        r.dataset.draftBound = '1';
        r.addEventListener('change', _saveDraft);
      }
    });
  }

  function _collectCMO(prefix) {
    const g = id => document.getElementById(id)?.value.trim() || '';
    const gr = name => document.querySelector(`input[name="${name}"]:checked`)?.value || '';
    const metodo = 'domicilio'; // siempre domicilio — radios eliminados
    const p = prefix === 'wa' ? 'wa' : 'wp';

    return {
      cliente: {
        nombre:       g(`${p}InputNombre`),
        apellido:     g(`${p}InputApellido`),
        email:        g(`${p}InputEmail`),
        codigoPais:   g(`${p}InputCodPais`) || '+57',
        telefono:     g(`${p}InputTel`),
        tipoDoc:      g(`${p}InputTipoDoc`),
        numDoc:       g(`${p}InputNumDoc`),
                cumpleDia:    g(`${p}InputCumpleDia`),
        cumpleMes:    g(`${p}InputCumpleMes`),
        referralCode: '',
      },
      entrega: {
        metodo,
        direccion:  metodo === 'domicilio' ? g(`${p}InputDir`)       : '',
        barrio:     metodo === 'domicilio' ? g(`${p}InputBarrio`)    : '',
        ciudad:     metodo === 'domicilio' ? g(`${p}InputCiudad`)    : '',
        ciudadDane: metodo === 'domicilio' ? g(`${p}InputCiudadDane`): '',
        notas:      g(`${p}InputNotas`),
      },
      formaPago: g(`${p}InputFormaPago`) || 'WA_WISHLIST',
    };
  }

  // ═══════════════════════════════════════════════════
  // RESET — restaurar modal WA a estado inicial
  // ═══════════════════════════════════════════════════
  function _resetWAModal() {
    const form          = document.getElementById('formCheckoutWA');
    const confirmScreen = document.getElementById('waConfirmScreen');
    const btnConfirm    = document.getElementById('btnConfirmWASent');
    const btnClose      = document.getElementById('btnConfirmWAClose');
    if (form)          form.style.display = '';
    if (confirmScreen) confirmScreen.style.display = 'none';
    if (btnConfirm)  { btnConfirm.disabled = true;  btnConfirm.innerHTML = '⏳ Registrando pedido…'; }
    if (btnClose)      btnClose.disabled = true;
    _waPedidoId   = '';
    _waProcessing = false;
  }

  // ═══════════════════════════════════════════════════
  // SUBMIT — WHATSAPP / WISHLIST
  // ═══════════════════════════════════════════════════
  async function _handleSubmitWA(e) {
    e.preventDefault();
    if (_waProcessing) return;
    if (!_validateCMOForm('wa')) return;

    _waProcessing = true;
    const btn = document.getElementById('btnSubmitWA');
    if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }

    const data    = _collectCMO('wa');
    const items   = Cart.getItems();
    const total   = Cart.getTotal();

    // Generar referencia ANTES del await para incluirla en el mensaje WA
    _waPedidoId = 'WA-' + Date.now();

    // Construir URL WA ANTES del await (los browsers bloquean window.open tras await)
    const lines = items.map(i =>
      `• ${i.productName} — ${i.collection} (${i.sku}) × ${i.quantity} → ${Utils.formatPrice(i.price * i.quantity)}`
    );
    const msgTemp = [
      `🏺 *Lista de deseos IMOLARTE*`,
      `Ref: ${_waPedidoId}`,
      ``,
      `*Cliente:* ${data.cliente.nombre} ${data.cliente.apellido}`,
      `*Email:* ${data.cliente.email}`,
      `*Tel:* ${data.cliente.codigoPais} ${data.cliente.telefono}`,
      ``,
      ...lines,
      ``,
      `*Total estimado: ${Utils.formatPrice(total)} COP*`,
      ``,
      `Hola, me interesan estas piezas. ¿Pueden confirmar disponibilidad?`,
    ].filter(Boolean).join('\n');

    const waUrl = `https://wa.me/${IMOLARTE_CONFIG.brand.phone.replace('+','')}?text=${encodeURIComponent(msgTemp)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // POST a Sheets como BORRADOR — referencia generada en frontend
    let clienteId = '';
    try {
      const result = await Api.createWishlist(data, items, {
        subtotal:   total,
        descuento:  0,
        total,
        referencia: _waPedidoId,
      });
      if (result.ok) clienteId = result.clienteId || '';
      else Logger.warn('api.js: createWishlist error', result.error);
    } catch(err) {
      Logger.warn('modal.js: error POST wishlist', err);
    }

    // Cambiar modal a pantalla de confirmación
    const form          = document.getElementById('formCheckoutWA');
    const confirmScreen = document.getElementById('waConfirmScreen');
    const confirmRef    = document.getElementById('waConfirmRef');

    if (form)          form.style.display = 'none';
    if (confirmScreen) confirmScreen.style.display = 'block';
    if (confirmRef) {
      const parts = [`Pedido: ${_waPedidoId}`];
      if (clienteId) parts.push(`Cliente: ${clienteId}`);
      confirmRef.textContent = parts.join(' · ');
    }

    // Limpiar listeners acumulados con cloneNode antes de reasignar
    const btnConfirmOld = document.getElementById('btnConfirmWASent');
    const btnCloseOld   = document.getElementById('btnConfirmWAClose');
    const btnConfirm    = btnConfirmOld.cloneNode(true);
    const btnClose      = btnCloseOld.cloneNode(true);
    // Guardar referencia en dataset del DOM — independiente de la variable de módulo
    btnConfirm.dataset.pedidoId = _waPedidoId;
    btnConfirmOld.parentNode.replaceChild(btnConfirm, btnConfirmOld);
    btnCloseOld.parentNode.replaceChild(btnClose, btnCloseOld);

    // Habilitar botones — la fila ya está escrita en Sheets
    btnConfirm.disabled = false;
    btnConfirm.innerHTML = '✓ Sí, ya lo envié';
    btnClose.disabled = false;

    // Botón "Sí, ya lo envié"
    btnConfirm.addEventListener('click', async () => {
      const ref = btnConfirm.dataset.pedidoId || _waPedidoId;
      btnConfirm.disabled = true;
      btnConfirm.textContent = 'Confirmando…';
      try {
        await Api.updateEstadoWishlist(ref, 'ENVIADO_WA');
      } catch(err) {
        Logger.warn('modal.js: error updateEstadoWishlist', err);
      }
      _waPedidoId = '';
      _waProcessing = false;
      Cart.clear();
      _closeModal('modalCheckoutWA');
      _closeModal('modalCart');
      document.getElementById('formCheckoutWA')?.reset();
      if (form) form.style.display = '';
      if (confirmScreen) confirmScreen.style.display = 'none';
      Toast.show('¡Lista enviada por WhatsApp! ✓', 'success');
    });

    // Botón "Cerrar sin confirmar"
    btnClose.addEventListener('click', () => {
      _waPedidoId = '';
      Cart.clear();
      _closeModal('modalCheckoutWA');
      _closeModal('modalCart');
      document.getElementById('formCheckoutWA')?.reset();
      if (form) form.style.display = '';
      if (confirmScreen) confirmScreen.style.display = 'none';
    });

    if (btn) { btn.disabled = false; btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>Enviar por WhatsApp'; }
  }

  // ═══════════════════════════════════════════════════
  // BONO — validar y aplicar
  // ═══════════════════════════════════════════════════
  async function _applyBono() {
    const input  = document.getElementById('wpInputBono');
    const errEl  = document.getElementById('wpErrBono');
    const succEl = document.getElementById('wpSuccessBono');
    const code   = (input?.value || '').trim().toUpperCase();

    if (!code) { if (errEl) errEl.textContent = 'Ingresa un código'; return; }

    const btn = document.getElementById('wpBtnApplyBono');
    if (btn) { btn.disabled = true; btn.textContent = 'Verificando…'; }

    try {
      const data = await Api.validateDono(code);

      if (data.valid) {
        _ckBono = { code, available: data.available };
        if (errEl)  errEl.textContent = '';
        if (succEl) { succEl.textContent = `✓ Bono válido — ${Utils.formatPrice(data.available)} disponible`; succEl.style.display = 'block'; }
        _updateWompiTotals();
        Toast.show(`Bono aplicado: ${Utils.formatPrice(data.available)} de descuento`, 'success');
      } else {
        _resetBono();
        if (errEl) errEl.textContent = data.reason || 'Código inválido';
        if (succEl) succEl.style.display = 'none';
      }
    } catch(err) {
      if (errEl) errEl.textContent = 'Error al verificar. Intenta de nuevo.';
      Logger.warn('modal.js: error validando bono', err);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Aplicar'; }
    }
  }

  function _resetBono() {
    _ckBono = null;
    _updateWompiTotals();
  }

  function _updateWompiTotals() {
    const cfg       = IMOLARTE_CONFIG.checkout;
    const subtotal  = Utils.roundCOP(_ckSubtotal);
    const bonoDesc  = _ckBono ? Math.min(Utils.roundCOP(_ckBono.available), subtotal) : 0;
    const base      = subtotal - bonoDesc;
    const disc100   = Math.ceil(base * cfg.discountPayFull / 1000) * 1000;
    const pay60     = Math.ceil(base * 0.6 / 1000) * 1000;
    const pay100    = base - disc100;

    // Mostrar subtotal (ya con descuento campaña si aplica)
    const subEl = document.getElementById('wpValSubtotal');
    if (subEl) subEl.textContent = Utils.formatPrice(subtotal);

    // Línea descuento campaña — mostrar ahorro informativo
    const campLine  = document.getElementById('wpLineCampania');
    const campLabel = document.getElementById('wpLabelCampania');
    const campVal   = document.getElementById('wpValCampania');
    const descPct   = Campania.descuentoPct();
    if (descPct > 0 && campLine) {
      // Calcular ahorro = subtotal_pleno - subtotal_presale
      // subtotal_pleno: reconstruir desde items originales
      const ahorroTotal = Cart.getItems().reduce((s, i) => {
        const orig = i.priceOriginal || i.price;
        return s + (orig - i.price) * i.quantity;
      }, 0);
      const ahorro = Utils.roundCOP(ahorroTotal);
      if (ahorro > 0) {
        campLine.style.display = 'flex';
        if (campLabel) campLabel.textContent = `Presale −${descPct}%`;
        if (campVal)   campVal.textContent   = '− ' + Utils.formatPrice(ahorro);
      } else {
        campLine.style.display = 'none';
      }
    } else if (campLine) {
      campLine.style.display = 'none';
    }

    // Mostrar/ocultar línea bono con valor negativo
    const bonoLine = document.getElementById('wpLineBono');
    const bonoVal  = document.getElementById('wpValBono');
    if (bonoLine) bonoLine.style.display = bonoDesc > 0 ? 'flex' : 'none';
    if (bonoVal)  bonoVal.textContent = '− ' + Utils.formatPrice(bonoDesc);

    // Línea "Total" visible cuando hay bono o campaña activa
    const totalFinalLine = document.getElementById('wpLineTotalFinal');
    const totalFinalVal  = document.getElementById('wpValTotalFinal');
    if (bonoDesc > 0) {
      if (totalFinalLine) totalFinalLine.style.display = 'flex';
      if (totalFinalVal)  totalFinalVal.textContent = Utils.formatPrice(base);
    } else {
      if (totalFinalLine) totalFinalLine.style.display = 'none';
    }

    // Ocultar siempre la línea de descuento 3% separada (queda en label del botón)
    const disc100Line = document.getElementById('wpLineDisc100');
    if (disc100Line) disc100Line.style.display = 'none';

    // ── Bono cubre el total → botón Gift Card, sin Wompi ──
    const bonoCobreTotal = bonoDesc >= subtotal;
    const wpPayActions   = document.getElementById('wpPayActions');
    const wpPayGift      = document.getElementById('wpPayGift');

    if (bonoCobreTotal) {
      if (wpPayActions) wpPayActions.style.display = 'none';
      if (wpPayGift)    wpPayGift.style.display     = 'block';
      const giftAmtEl = document.getElementById('wpAmountGift');
      if (giftAmtEl) giftAmtEl.textContent = 'Cubierto por Gift Card';
    } else {
      if (wpPayActions) wpPayActions.style.display = 'flex';
      if (wpPayGift)    wpPayGift.style.display     = 'none';

      // W2: labels de botones con formato aprobado
      const btn60El  = document.getElementById('wpAmount60');
      const btn100El = document.getElementById('wpAmount100');
      if (btn60El)
        btn60El.textContent = Utils.formatPrice(pay60);
      if (btn100El)
        btn100El.textContent = Utils.formatPrice(pay100) + '  —  3% dto. incl.';
    }
  }

  // ═══════════════════════════════════════════════════
  // SUBMIT — WOMPI
  // ═══════════════════════════════════════════════════
  async function _submitWompi(pct) {
    if (!_validateCMOForm('wp')) return;

    const btn60  = document.getElementById('btnPagar60');
    const btn100 = document.getElementById('btnPagar100');
    if (btn60)  { btn60.disabled  = true; btn60.innerHTML  = '<span class="cmo-btn-pago-label">Pago Anticipo 60%</span><span class="cmo-btn-pago-amount">Procesando…</span>'; }
    if (btn100) { btn100.disabled = true; btn100.innerHTML = '<span class="cmo-btn-pago-label">Pago Anticipado 100%</span><span class="cmo-btn-pago-amount">Procesando…</span>'; }
    const errGenEl = document.getElementById('wpErrGeneral');
    if (errGenEl) errGenEl.style.display = 'none';

    const data        = _collectCMO('wp');
    const items       = Cart.getItems();
    const subtotal    = _ckSubtotal;
    const cfg         = IMOLARTE_CONFIG.checkout;
    const bonoDesc    = _ckBono ? Math.min(_ckBono.available, subtotal) : 0;
    const base        = subtotal - bonoDesc;
    const disc100     = pct === '100' ? Math.round(base * cfg.discountPayFull) : 0;
    const total       = pct === '60'  ? Math.round(base * 0.6) : base - disc100;
    const descuento   = bonoDesc + disc100;
    const amountCents = Math.round(total * 100);

    // Generar referencia local — NO grabar en Sheets todavía.
    // El pedido se graba en Sheets solo cuando Wompi confirma APPROVED (en checkout.js)
    // evitando entradas PENDIENTE huérfanas si el usuario vuelve atrás.
    const reference = `WP-${Date.now()}`;

    // Guardar payload completo en sessionStorage para que checkout.js lo use
    const formaPago = _ckBono?.code
      ? (pct === '60' ? 'WOMPI_60' : 'WOMPI_100') + '+GIFT:' + _ckBono.code
      : (pct === '60' ? 'WOMPI_60' : 'WOMPI_100');
    try {
      sessionStorage.setItem('imolarte_pending_pedido', JSON.stringify({
        formaPago,
        subtotal, descuento, total,
        porcentajePagado: pct === '60' ? 60 : 100,
        referencia:       reference,
        cliente:          data.cliente,
        entrega:          data.entrega,
        productos:        items,
        bono:             _ckBono ? { code: _ckBono.code, monto: bonoDesc } : null,
        campaniaId:       IMOLARTE_CONFIG?.campania?.id || '',
      }));
    } catch(e) { Logger.warn('modal.js: no se pudo guardar payload en sessionStorage', e); }

    // ── Obtener firma de integridad Wompi ──────────────────
    let signature = null;
    try {
      const resp = await fetch(cfg.signatureWorkerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, amountInCents: amountCents, currency: cfg.currency }),
      });
      if (resp.ok) {
        const r = await resp.json();
        signature = r.integritySignature || null;
      }
    } catch(err) {
      Logger.warn('modal.js: error firma Wompi', err);
    }

    // Si no hay firma no se puede proceder — Wompi rechazará
    if (!signature) {
      _updateWompiTotals(); // restaura labels con montos correctos
      if (btn60)  btn60.disabled  = false;
      if (btn100) btn100.disabled = false;
      const errEl = document.getElementById('wpErrGeneral');
      if (errEl) {
        errEl.textContent = 'Error al conectar con el procesador de pagos. Por favor intenta de nuevo.';
        errEl.style.display = 'block';
      }
      return;
    }

    // ── Redirigir a Wompi ──────────────────────────────────────
    const params = new URLSearchParams({
      'public-key':      cfg.wompiPublicKey,
      'currency':        cfg.currency,
      'amount-in-cents': amountCents,
      'reference':       reference,
      'redirect-url':    cfg.checkoutUrl,
    });
    if (signature)             params.set('signature:integrity', signature);
    if (data.cliente.nombre)   params.set('customer-data:full-name', `${data.cliente.nombre} ${data.cliente.apellido}`);
    if (data.cliente.email)    params.set('customer-data:email', data.cliente.email);
    if (data.cliente.telefono) params.set('customer-data:phone-number', `${data.cliente.codigoPais}${data.cliente.telefono}`);

    Logger.log('modal.js: redirigiendo a Wompi', { reference, amountCents, pct });
    // Flag para detectar vuelta con «Regresar» — restaura modal con botones activos
    try { sessionStorage.setItem('imolarte_wompi_redirect', '1'); } catch(e) {}
    window.location.href = `${cfg.wompiCheckoutUrl}?${params.toString()}`;
  }

  // ═══════════════════════════════════════════════════
  // PAGO COMPLETO CON GIFT CARD (bono ≥ total)
  // ═══════════════════════════════════════════════════
  async function _submitConGiftCard() {
    if (!_validateCMOForm('wp')) return;

    const btn = document.getElementById('btnPagarGift');
    if (btn) { btn.disabled = true; btn.textContent = 'Procesando…'; }

    const data     = _collectCMO('wp');
    const items    = Cart.getItems();
    const subtotal = _ckSubtotal;
    const bonoDesc = _ckBono ? Math.min(_ckBono.available, subtotal) : 0;
    const total    = 0;  // cubierto por gift card

    // 1. Registrar pedido en Sheets
    let reference = '';
    try {
      const result = await Api.createPedidoWompi(data, items, {
        formaPago:        'GIFT_CARD',
        subtotal,
        descuento:        bonoDesc,
        total,
        porcentajePagado: 100,
        referencia:       '',
      });
      reference = (result.ok && result.referencia) ? result.referencia : `WP-${Date.now()}`;
    } catch(err) {
      reference = `WP-${Date.now()}`;
      Logger.warn('modal.js: error registrando pedido gift', err);
    }

    // 2. Redimir bono
    if (_ckBono?.code) {
      try { await Api.redeemDono(_ckBono.code, bonoDesc, reference); }
      catch(err) { Logger.warn('modal.js: error redimiendo bono gift', err); }
    }

    // 3. Confirmar pedido directamente (sin Wompi)
    try {
      await Api.confirmarPagoWompi(reference, 'APPROVED', 'GIFT_CARD');
    } catch(err) { Logger.warn('modal.js: error confirmando pedido gift', err); }

    // 4. Vaciar carrito y redirigir a checkout con estado aprobado
    try { localStorage.removeItem(IMOLARTE_CONFIG.cart.storageKey); } catch(e) {}
    Logger.log('modal.js: compra con gift card confirmada', reference);
    window.location.href = `checkout.html?reference=${encodeURIComponent(reference)}&transaction_status=APPROVED`;
  }


  // ═══════════════════════════════════════════════════
  // MODAL GIFT — canvas tarjeta + código + vigencia
  // ═══════════════════════════════════════════════════

  let _giftValue    = 0;
  let _giftCode     = '';
  let _giftValidUntil = '';

  // ── Genera código alfanumérico 10 chars tipo HC-XXXXXXXX ──
  function _generateGiftCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'HC-';
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;  // ej: HC-A3K9WX2M
  }

  // ── Calcula fecha vigencia +9 meses ──
  function _giftVigencia() {
    const d = new Date();
    d.setMonth(d.getMonth() + 9);
    const meses = ['ene','feb','mar','abr','may','jun',
                   'jul','ago','sep','oct','nov','dic'];
    return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
  }

  // ── Dibuja la tarjeta en el canvas (base sin logo) ──
  function _drawGiftCardBase(ctx, W, H, amount) {
    // Fondo negro con gradiente
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0,   '#0a0a0a');
    grad.addColorStop(0.5, '#1a1610');
    grad.addColorStop(1,   '#0a0a0a');
    ctx.fillStyle = grad;
    ctx.beginPath();
    _roundRect(ctx, 0, 0, W, H, 22);
    ctx.fill();

    // Textura diamante fina
    ctx.save();
    ctx.strokeStyle = 'rgba(196,160,90,0.07)';
    ctx.lineWidth   = 0.8;
    const step = 38;
    for (let x = -H; x < W + H; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + H, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - H, H); ctx.stroke();
    }
    ctx.restore();

    // Borde dorado fino
    ctx.save();
    ctx.strokeStyle = 'rgba(196,160,90,0.5)';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    _roundRect(ctx, 4, 4, W - 8, H - 8, 19);
    ctx.stroke();
    ctx.restore();

    // Banda blanca superior para el logo
    const BAND_H = 82;
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    // Solo esquinas superiores redondeadas
    ctx.moveTo(22, 4);
    ctx.lineTo(W - 22, 4);
    ctx.quadraticCurveTo(W - 4, 4, W - 4, 22);
    ctx.lineTo(W - 4, BAND_H);
    ctx.lineTo(4, BAND_H);
    ctx.lineTo(4, 22);
    ctx.quadraticCurveTo(4, 4, 22, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Línea separadora dorada bajo la banda
    ctx.save();
    ctx.strokeStyle = 'rgba(196,160,90,0.5)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(4, BAND_H);
    ctx.lineTo(W - 4, BAND_H);
    ctx.stroke();
    ctx.restore();

    // "GIFT CARD" centrado — blanco
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 42px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('GIFT CARD', W / 2, H / 2 + 30);
    ctx.restore();

    // Valor abajo — blanco
    const amountStr = amount > 0
      ? '$ ' + amount.toLocaleString('es-CO')
      : '$ — — —';
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font      = '600 28px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(amountStr, W / 2, H - 86);
    ctx.restore();

    // Código — gris claro
    if (_giftCode) {
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font      = '14px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(_giftCode, W / 2, H - 54);
      ctx.restore();
    }

    // Vigencia
    if (_giftValidUntil) {
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.38)';
      ctx.font      = '12px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('Válido hasta: ' + _giftValidUntil, W / 2, H - 30);
      ctx.restore();
    }

    // Ornamento dorado esquina inferior derecha
    ctx.save();
    ctx.strokeStyle = 'rgba(196,160,90,0.6)';
    ctx.lineWidth   = 1.2;
    ctx.beginPath(); ctx.arc(W - 36, H - 36, 14, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(W - 36, H - 36, 9,  0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  // Logo cacheado para no recargarlo en cada redraw
  let _giftLogoImg = null;
  let _giftLogoLoaded = false;

  function _loadGiftLogo(callback) {
    if (_giftLogoLoaded) { callback(_giftLogoImg); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    // Ruta relativa al repo — funciona tanto en localhost como en GitHub Pages
    img.src = 'images/branding/Logo-HC.jpeg';
    img.onload  = () => {
      _giftLogoImg    = img;
      _giftLogoLoaded = true;
      callback(img);
    };
    img.onerror = () => {
      _giftLogoLoaded = true;  // marcar como intentado para no reintentar en cada tecla
      _giftLogoImg    = null;
      callback(null);
    };
  }

  function _drawLogoOnCard(ctx, W, BAND_H, img) {
    if (!img) {
      // Fallback texto: "HELENA CABALLERO" en negro sobre la banda blanca
      ctx.save();
      ctx.fillStyle   = '#1a1610';
      ctx.font        = 'bold 17px Georgia, serif';
      ctx.textAlign   = 'center';
      ctx.letterSpacing = '3px';
      ctx.fillText('HELENA CABALLERO', W / 2, BAND_H / 2 + 7);
      ctx.restore();
      return;
    }
    // Centrar el logo en la banda blanca con padding
    const PAD    = 18;
    const maxW   = W - PAD * 2;
    const maxH   = BAND_H - PAD * 2;
    const ratio  = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
    const dw     = img.naturalWidth  * ratio;
    const dh     = img.naturalHeight * ratio;
    const dx     = (W - dw) / 2;
    const dy     = PAD + (maxH - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function _drawGiftCard(amount) {
    const canvas = document.getElementById('giftCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const BAND_H = 82;

    _loadGiftLogo(logoImg => {
      ctx.clearRect(0, 0, W, H);
      _drawGiftCardBase(ctx, W, H, amount);
      _drawLogoOnCard(ctx, W, BAND_H, logoImg);
    });
  }

  // Utilidad: roundRect (compatible con navegadores sin soporte nativo)
  function _roundRect(ctx, x, y, w, h, r) {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ── Formatea número con puntos COP mientras escribe ──
  function _formatAmountInput(raw) {
    const digits = raw.replace(/\D/g,'');
    if (!digits) return '';
    return parseInt(digits,10).toLocaleString('es-CO');
  }

  function _parseAmountInput(formatted) {
    return parseInt(formatted.replace(/\./g,'').replace(/\D/g,''), 10) || 0;
  }

  function openGift() {
    _giftValue      = 0;
    _giftCode       = '';
    _giftValidUntil = '';

    // Pre-diligenciar valor 500.000
    const amountEl = document.getElementById('giftAmount');
    if (amountEl) amountEl.value = '500.000';
    const errEl = document.getElementById('giftErrAmount');
    if (errEl) errEl.textContent = '';
    const infoEl = document.getElementById('giftCardInfo');
    const nextBtn = document.getElementById('giftBtnNext');

    // Inicializar con 500.000
    _giftValue      = 500000;
    _giftCode       = _generateGiftCode();
    _giftValidUntil = _giftVigencia();
    const codeEl  = document.getElementById('giftCodeDisplay');
    const validEl = document.getElementById('giftValidUntil');
    if (codeEl)  codeEl.textContent  = _giftCode;
    if (validEl) validEl.textContent = _giftValidUntil;
    if (infoEl)  infoEl.style.display = 'block';
    if (nextBtn) nextBtn.disabled = false;

    _giftShowStep(1);
    _openModal('modalGift');

    setTimeout(() => _drawGiftCard(500000), 80);
  }

  function _giftShowStep(n) {
    document.getElementById('giftStep1').style.display = n === 1 ? 'block' : 'none';
    document.getElementById('giftStep2').style.display = n === 2 ? 'block' : 'none';
  }

  function _bindGiftEvents() {
    // Input monto — formato COP en tiempo real + redraw canvas
    document.getElementById('giftAmount')?.addEventListener('input', e => {
      const raw      = e.target.value;
      const formatted = _formatAmountInput(raw);
      e.target.value  = formatted;
      const amount    = _parseAmountInput(formatted);
      const errEl     = document.getElementById('giftErrAmount');
      const infoEl    = document.getElementById('giftCardInfo');
      const nextBtn   = document.getElementById('giftBtnNext');

      if (amount > 0 && amount < 200000) {
        if (errEl) errEl.textContent = 'Valor mínimo $200.000';
        if (nextBtn) nextBtn.disabled = true;
        _giftValue = 0; _giftCode = ''; _giftValidUntil = '';
        if (infoEl) infoEl.style.display = 'none';
        _drawGiftCard(amount);
        return;
      }

      if (amount > 10000000) {
        if (errEl) errEl.textContent = 'Valor máximo $10.000.000';
        if (nextBtn) nextBtn.disabled = true;
        _giftValue = 0; _giftCode = ''; _giftValidUntil = '';
        if (infoEl) infoEl.style.display = 'none';
        _drawGiftCard(amount);
        return;
      }

      if (errEl) errEl.textContent = '';

      if (amount >= 200000) {
        _giftValue = amount;
        // Generar código y vigencia si no existen aún
        if (!_giftCode) {
          _giftCode       = _generateGiftCode();
          _giftValidUntil = _giftVigencia();
        }
        // Mostrar info
        const codeEl  = document.getElementById('giftCodeDisplay');
        const validEl = document.getElementById('giftValidUntil');
        if (codeEl)  codeEl.textContent  = _giftCode;
        if (validEl) validEl.textContent = _giftValidUntil;
        if (infoEl)  infoEl.style.display = 'block';
        if (nextBtn) nextBtn.disabled = false;
      } else {
        _giftValue = 0;
        _giftCode  = '';
        _giftValidUntil = '';
        if (infoEl) infoEl.style.display = 'none';
        if (nextBtn) nextBtn.disabled = true;
      }

      _drawGiftCard(amount);
    });

    // Botón Continuar → paso 2
    document.getElementById('giftBtnNext')?.addEventListener('click', () => {
      if (_giftValue < 200000 || _giftValue > 10000000) return;
      const label = '$ ' + _giftValue.toLocaleString('es-CO');
      const selEl = document.getElementById('giftSelectedLabel');
      const totEl = document.getElementById('giftTotalDisplay');
      if (selEl) selEl.textContent = label;
      if (totEl) totEl.textContent = Utils.formatPrice(_giftValue);
      _giftShowStep(2);
      // Inicializar Places aquí — el input gfDir ya está visible
      setTimeout(() => _initPlacesAutocomplete('gfDir', 'gfBarrio', 'gfCiudad'), 100);
    });

    // Botón Volver
    document.getElementById('giftBtnBack')?.addEventListener('click', () => {
      _giftShowStep(1);
      setTimeout(() => _drawGiftCard(_giftValue), 60);
    });

    // Email confirmación en tiempo real
    document.getElementById('gfEmailConf')?.addEventListener('input', () => _validateGiftField('gfEmailConf'));

    // Validación blur — incluye destinatario
    ['gfNombre','gfApellido','gfCumpleDia','gfCumpleMes','gfTipoDoc','gfNumDoc','gfEmail','gfEmailConf','gfTel','gfDir','gfBarrio','gfCiudad',
     'gfRecNombre','gfRecApellido','gfRecEmail','gfRecTel'].forEach(id => {
      document.getElementById(id)?.addEventListener('blur', () => _validateGiftField(id));
    });

    // Submit formulario
    document.getElementById('formGift')?.addEventListener('submit', _handleSubmitGift);
  }

  function _validateGiftField(id) {
    const el    = document.getElementById(id);
    if (!el) return true;
    const key   = id.replace('gf', '');
    const errEl = document.getElementById('gfErr' + key);
    let msg = '';

    if (el.required && !el.value.trim()) {
      msg = 'Campo obligatorio';
    } else if (id === 'gfTipoDoc' && el.required && !el.value) {
      msg = 'Selecciona un tipo';
    } else if (id === 'gfNumDoc' && el.value.trim()) {
      if (!/^\d{4,15}$/.test(el.value.trim())) msg = 'Solo números, 4-15 dígitos';
    } else if ((id === 'gfNombre' || id === 'gfApellido') && el.value.trim()) {
      const r = _CMO_VALIDATORS.nombre(el.value);
      if (r !== true) msg = r;
    } else if (id === 'gfEmail' && el.value) {
      const r = _CMO_VALIDATORS.email(el.value);
      if (r !== true) msg = r;
    } else if (id === 'gfEmailConf' && el.value) {
      const mainEl = document.getElementById('gfEmail');
      const okEl   = document.getElementById('gfOkEmailConf');
      if (mainEl && el.value !== mainEl.value) {
        msg = 'Los emails no coinciden';
        if (okEl) okEl.style.display = 'none';
      } else if (mainEl && el.value === mainEl.value) {
        if (okEl) okEl.style.display = 'block';
      }
    } else if (id === 'gfTel' && el.value) {
      const r = _CMO_VALIDATORS.telefono(el.value);
      if (r !== true) msg = r;
    } else if (id === 'gfDir' && el.required && !el.value.trim()) {
      msg = 'Campo obligatorio';
    } else if ((id === 'gfBarrio' || id === 'gfCiudad') && el.required) {
      if (!el.value.trim()) {
        msg = 'Campo obligatorio';
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s\-\.]+$/.test(el.value.trim())) {
        msg = 'Solo se permiten letras';
      }
    } else if ((id === 'gfRecNombre' || id === 'gfRecApellido') && el.required) {
      if (!el.value.trim()) {
        msg = 'Campo obligatorio';
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s\-]+$/.test(el.value.trim())) {
        msg = 'Solo se permiten letras';
      }
    } else if (id === 'gfRecTel' && el.required) {
      if (!el.value.trim()) {
        msg = 'Campo obligatorio';
      } else {
        const r = _CMO_VALIDATORS.telefono(el.value);
        if (r !== true) msg = r;
      }
    } else if (id === 'gfRecEmail' && el.required) {
      if (!el.value.trim()) {
        msg = 'Campo obligatorio';
      } else {
        const r = _CMO_VALIDATORS.email(el.value);
        if (r !== true) msg = r;
      }
    } else if ((id === 'gfCumpleDia' || id === 'gfCumpleMes') && el.required) {
      if (!el.value) msg = 'Campo obligatorio';
    }

    if (errEl) errEl.textContent = msg;
    el.classList.toggle('cmo-input-error', !!msg);
    return !msg;
  }

  function _validateGiftForm() {
    let ok = true;
    ['gfNombre','gfApellido','gfCumpleDia','gfCumpleMes','gfTipoDoc','gfNumDoc','gfEmail','gfEmailConf','gfTel','gfDir','gfBarrio','gfCiudad',
     'gfRecNombre','gfRecApellido','gfRecEmail','gfRecTel'].forEach(id => {
      if (!_validateGiftField(id)) ok = false;
    });
    // Checkbox TyC
    const tyc    = document.getElementById('gfCheckTyC');
    const tycErr = document.getElementById('gfErrTyC');
    if (tyc && !tyc.checked) {
      if (tycErr) tycErr.textContent = 'Debes aceptar los términos y condiciones';
      ok = false;
    } else {
      if (tycErr) tycErr.textContent = '';
    }
    return ok;
  }

  async function _handleSubmitGift(e) {
    e.preventDefault();
    if (!_validateGiftForm()) return;

    const btn = document.getElementById('giftBtnPagar');
    if (btn) { btn.disabled = true; btn.textContent = 'Procesando…'; }

    const amount    = parseFloat(_giftValue);
    const amountCts = Math.round(amount * 100);
    const reference = `GIFT-${Date.now()}`;
    const cfg       = IMOLARTE_CONFIG.checkout;

    // Datos del formulario
    const nombre    = document.getElementById('gfNombre')?.value.trim() || '';
    const apellido  = document.getElementById('gfApellido')?.value.trim() || '';
    const cumpleDia = document.getElementById('gfCumpleDia')?.value.trim() || '';
    const cumpleMes = document.getElementById('gfCumpleMes')?.value || '';
    const tipoDoc  = document.getElementById('gfTipoDoc')?.value || '';
    const numDoc   = document.getElementById('gfNumDoc')?.value.trim() || '';
    const email    = document.getElementById('gfEmail')?.value.trim() || '';
    const tel      = document.getElementById('gfTel')?.value.trim() || '';
    const pais     = document.getElementById('gfPais')?.value || '+57';
    const dir      = document.getElementById('gfDir')?.value.trim() || '';
    const barrio   = document.getElementById('gfBarrio')?.value.trim() || '';
    const ciudad   = document.getElementById('gfCiudad')?.value.trim() || '';
    const recNom   = document.getElementById('gfRecNombre')?.value.trim() || '';
    const recApe   = document.getElementById('gfRecApellido')?.value.trim() || '';
    const recEmail = document.getElementById('gfRecEmail')?.value.trim() || '';
    const recPais  = document.getElementById('gfRecPais')?.value || '+57';
    const recTel   = document.getElementById('gfRecTel')?.value.trim() || '';
    const mensaje  = document.getElementById('gfMensaje')?.value.trim() || '';

    // Registrar en Sheets vía Api.js
    try {
      await Api.createGiftCard({
        referencia:   reference,
        codigo:       _giftCode,
        vigencia:     _giftValidUntil,
        valor:        amount,
        campaniaId:   IMOLARTE_CONFIG?.campania?.id || '',
        emisor:       { nombre, apellido, cumpleDia, cumpleMes, tipoDoc, numDoc, email, telefono: pais + tel, direccion: dir, barrio, ciudad },
        destinatario: { nombre: recNom, apellido: recApe, email: recEmail, telefono: recPais + recTel },
        mensaje,
      });
    } catch(err) { Logger.warn('modal.js: error registrando gift card', err); }

    // Obtener firma Wompi
    let signature = null;
    try {
      const resp = await fetch(cfg.signatureWorkerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, amountInCents: amountCts, currency: cfg.currency }),
      });
      if (resp.ok) {
        const r = await resp.json();
        signature = r.integritySignature || null;
      }
    } catch(err) { Logger.warn('modal.js: error firma gift', err); }

    // Redirigir a Wompi
    const params = new URLSearchParams({
      'public-key':      cfg.wompiPublicKey,
      'currency':        cfg.currency,
      'amount-in-cents': amountCts,
      'reference':       reference,
      'redirect-url':    cfg.checkoutUrl,
    });
    if (signature) params.set('signature:integrity', signature);
    if (nombre)    params.set('customer-data:full-name', `${nombre} ${apellido}`);
    if (email)     params.set('customer-data:email', email);
    if (tel)       params.set('customer-data:phone-number', `${pais}${tel}`);

    Logger.log('modal.js: gift card → Wompi', { reference, amountCts });
    try { sessionStorage.setItem('imolarte_wompi_redirect', '1'); } catch(e) {}
    window.location.href = `${cfg.wompiCheckoutUrl}?${params.toString()}`;
  }

  // ═══════════════════════════════════════════════════
  // INACTIVIDAD — banner 15 min → vacía carrito
  // ═══════════════════════════════════════════════════

  let _inactivityTimer   = null;
  let _countdownTimer    = null;
  let _inactivityBanner  = null;
  const INACTIVITY_MS    = 13 * 60 * 1000; // 13 min → aparece banner
  const COUNTDOWN_S      = 120;             // 2 min de countdown antes de vaciar

  function _createInactivityBanner() {
    if (document.getElementById('inactivityBanner')) return;
    const el = document.createElement('div');
    el.id        = 'inactivityBanner';
    el.className = 'inactivity-banner';
    el.setAttribute('role', 'alertdialog');
    el.setAttribute('aria-live', 'assertive');
    el.innerHTML = `
      <div class="inactivity-banner-inner">
        <div class="inactivity-banner-icon">🛒</div>
        <div class="inactivity-banner-body">
          <p class="inactivity-banner-title">¿Sigues ahí?</p>
          <p class="inactivity-banner-msg">
            Tu selección se liberará en <strong id="inactivityCountdown">2:00</strong>
            por inactividad.
          </p>
        </div>
        <button class="inactivity-banner-btn" id="inactivityKeep">
          Mantener selección
        </button>
        <button class="inactivity-banner-close" id="inactivityClose" aria-label="Cerrar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>`;
    document.body.appendChild(el);
    _inactivityBanner = el;

    document.getElementById('inactivityKeep')?.addEventListener('click', _resetInactivity);
    document.getElementById('inactivityClose')?.addEventListener('click', _resetInactivity);
  }

  function _showInactivityBanner() {
    _createInactivityBanner();
    _inactivityBanner = document.getElementById('inactivityBanner');
    _inactivityBanner.classList.add('is-visible');

    let remaining = COUNTDOWN_S;
    const cdEl = () => document.getElementById('inactivityCountdown');

    _countdownTimer = setInterval(() => {
      remaining--;
      const m = String(Math.floor(remaining / 60)).padStart(1, '0');
      const s = String(remaining % 60).padStart(2, '0');
      if (cdEl()) cdEl().textContent = `${m}:${s}`;

      if (remaining <= 0) {
        clearInterval(_countdownTimer);
        _clearCartByInactivity();
      }
    }, 1000);
  }

  function _hideInactivityBanner() {
    if (_inactivityBanner) _inactivityBanner.classList.remove('is-visible');
    clearInterval(_countdownTimer);
  }

  function _clearCartByInactivity() {
    _hideInactivityBanner();
    Cart.clear();
    // Cerrar modales abiertos
    ['modalCart','modalCheckoutWA','modalCheckoutWompi'].forEach(id => {
      const el = document.getElementById(id);
      if (el?.classList.contains('is-open')) _closeModal(id);
    });
    Toast.show('Tu selección fue liberada por inactividad.', 'info');
  }

  function _resetInactivity() {
    _hideInactivityBanner();
    clearTimeout(_inactivityTimer);
    // Solo reiniciar si hay items en el carrito
    if (Cart.getItems().length > 0) {
      _inactivityTimer = setTimeout(_showInactivityBanner, INACTIVITY_MS);
    }
  }

  function _startInactivityWatch() {
    clearTimeout(_inactivityTimer);
    if (Cart.getItems().length === 0) return;
    _inactivityTimer = setTimeout(_showInactivityBanner, INACTIVITY_MS);
    ['click','keydown','scroll','touchstart'].forEach(ev => {
      document.addEventListener(ev, _resetInactivity, { passive: true });
    });
  }

  // -------------------------------------------------------
  // INIT
  // -------------------------------------------------------
  // Limpia estado residual del modal Wompi — usado por pageshow (bfcache)
  // Restaura explícitamente botones de pago por si quedaron deshabilitados
  function resetState() {
    const modal = document.getElementById('modalCheckoutWompi');
    if (modal) modal.classList.remove('is-open');
    document.body.style.overflow = '';
    if (_focusTrapCleanup) { _focusTrapCleanup(); _focusTrapCleanup = null; }
    // BUG-03: restaurar botones explícitamente — bfcache puede devolver DOM congelado
    const btn60  = document.getElementById('btnPagar60');
    const btn100 = document.getElementById('btnPagar100');
    if (btn60)  { btn60.disabled = false; btn60.innerHTML  = '<span class="cmo-btn-pago-label">Pago Anticipo 60%</span><span class="cmo-btn-pago-amount" id="wpAmount60"></span>'; }
    if (btn100) { btn100.disabled = false; btn100.innerHTML = '<span class="cmo-btn-pago-label">Pago Anticipado 100%</span><span class="cmo-btn-pago-amount" id="wpAmount100"></span>'; }
  }

  function init() {
    _bindEvents();
    _bindGiftEvents();
    _bindDraftListeners();
    _startInactivityWatch();
    Logger.log('modal.js inicializado ✓');
  }

  return {
    init,
    resetState,
    openProduct,
    openFamily,
    openZoom,
    openCart,
    openCheckoutWA,
    openCheckoutWompi,
    openGift,
    closeModal: _closeModal,
  };

})();

// ===== BOOTSTRAP =====
document.addEventListener('DOMContentLoaded', () => {
  Modal.init();
});

// Detectar vuelta desde Wompi vía bfcache (back/forward cache)
// DOMContentLoaded NO se dispara en este caso — pageshow con persisted=true sí
window.addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  try {
    if (sessionStorage.getItem('imolarte_wompi_redirect') === '1') {
      sessionStorage.removeItem('imolarte_wompi_redirect');
      // BUG-03: 150ms — bfcache necesita más tiempo que 50ms para hidratar el DOM
      setTimeout(() => {
        Modal.resetState(); // restaura botones + cierra modal residual
        if (typeof Cart !== 'undefined' && Cart.getItems().length > 0) {
          Modal.openCheckoutWompi(); // reabre limpio con totales y labels correctos
        }
      }, 150);
    }
  } catch(e) {}
});

window.Modal = Modal;
Logger.log('modal.js cargado ✓');
