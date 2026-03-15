// @version    v1.0  @file mlg-modal.js  @updated 2026-03-06  @session mlg-catalog
/* ===== MLG V1 - modal.js =====
 * Modales: familia, zoom, carrito, checkout WA/Wompi, gift card
 * Modal familia: navegación entre productos con flechas, 10 variantes comodín,
 *   precio dinámico, qty, subtotal, botones WA + Wompi
 * Carrito: fork → [Wishlist WhatsApp] / [Pagar con Wompi]
 * =========================================== */

'use strict';


// ===== MODAL MANAGER =====
const Modal = (() => {

  // ---- Mínimo 6 unidades — familias Copas y Vasos + Platos ----
  const _MIN6_FAMILIES = ['Copas y Vasos', 'Platos'];
  function _needsMin6(sku) {
    return (window.MLG_PRODUCT_TYPES || []).some(t =>
      _MIN6_FAMILIES.includes(t.familia) &&
      (t.variantes || []).some(v => v.sku === sku)
    );
  }

  // ---- Estado producto/familia ----
  let _currentProduct = null;
  let _currentFamily  = null;   // nombre de familia activa
  let _familyProducts = [];     // array de productos de la familia
  let _familyIdx      = 0;      // índice del producto visible en el modal
  let _currentPhotoIdx = 0;    // índice de la foto activa dentro del producto
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
      content.scrollTop = 0;  // Siempre muestra el título y datos del usuario al abrir
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
        mainImg.src = MLG_CONFIG.images.placeholder;
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
          <span class="qty-min6-msg" id="min6-${Utils.sanitize(v.sku)}" style="display:none;color:red;font-weight:bold;font-size:0.75em">mínimo 6 unidades</span>
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
    const min6    = _needsMin6(sku);
    if (action === 'dec') {
      _quantities[sku] = (min6 && current <= 6) ? 0 : Math.max(0, current - 1);
    } else if (action === 'inc') {
      const next = Math.min(MLG_CONFIG.cart.maxQuantity, current + 1);
      _quantities[sku] = (min6 && next < 6) ? 6 : next;
    }

    _updateVariantRow(sku);
    _updateAddButton();
  }

  function _updateVariantRow(sku) {
    const qty = _quantities[sku] || 0;
    const qtyEl = document.getElementById(`qty-${sku}`);
    const subEl = document.getElementById(`sub-${sku}`);
    const msgEl = document.getElementById(`min6-${sku}`);
    if (qtyEl) qtyEl.textContent = qty;

    if (subEl) {
      const variant = (_currentProduct?.variants || []).find(v => v.sku === sku);
      const subtotal = variant ? variant.price * qty : 0;
      subEl.textContent = Utils.formatPrice(subtotal);
    }

    if (msgEl) msgEl.style.display = (_needsMin6(sku) && qty > 0) ? 'block' : 'none';
  }

  function _updateAddButton() {
    const btn = document.getElementById('btnAddToCart');
    if (!btn) return;

    const totalQty = Object.values(_quantities).reduce((s, q) => s + q, 0);
    const totalAmount = _calculateTotal();
    const hasInvalidMin6 = Object.entries(_quantities).some(
      ([sku, qty]) => qty > 0 && qty < 6 && _needsMin6(sku)
    );

    if (totalQty > 0 && !hasInvalidMin6) {
      btn.disabled = false;
      btn.textContent = `Agregar al Carrito — ${Utils.formatPrice(totalAmount)}`;
    } else {
      btn.disabled = true;
      btn.textContent = totalQty > 0 ? 'Cantidad mínima: 6 unidades' : 'Selecciona al menos una colección';
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
  // HELPER — parsea campo medidas en texto legible
  // Formatos: 'h16.5cm ø9cm', 'h20cm · 2.5l', 'h18cm', '40x30x7cm'
  // -------------------------------------------------------
  function _parseMedidas(raw) {
    if (!raw) return '';
    // Formato plano: 40x30x7cm
    if (/^\d/.test(raw) && raw.includes('x')) return raw;
    const parts = [];
    const altoM = raw.match(/h([\d.]+)cm/);
    const diaM  = raw.match(/ø([\d.]+)cm/);
    const capM  = raw.match(/([\d.]+)\s*l\b/);
    if (altoM) parts.push(`Alto: ${altoM[1]} cm`);
    if (diaM)  parts.push(`Ø: ${diaM[1]} cm`);
    if (capM)  parts.push(`Cap: ${capM[1]} l`);
    return parts.join(' · ');
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
  function _buildFamilyProducts(familyName) {
    return (window.MLG_PRODUCT_TYPES || [])
      .filter(t => t.familia === familyName)
      .map(t => {
        // Galería: imágenes de cada variante de color
        const images = (t.variantes || []).map(v => v.image).filter(Boolean);

        // 1 fila por variante de color
        const displayRows = (t.variantes || []).map(v => ({
          sku:        v.sku,
          color:      v.color      || '—',
          precio_cop: v.precio_cop,
          image:      v.image      || '',
        }));

        return {
          id:        [t.familia, t.coleccion, t.tipo].join('-').toLowerCase().replace(/\s+/g, '-'),
          name:      t.tipo,
          coleccion: t.coleccion,
          tipo:      t.tipo,
          subtitle:  _parseMedidas(t.medidas),
          material:  t.material || '',
          familia:   t.familia,
          image:     images[0] || '',
          images,
          variants:  displayRows,
        };
      });
  }

  // Abre el modal de familia posicionado directamente en el producto indicado (deep-link)
  function openFamilyAtProduct(productId) {
    const entry = (window.MLG_PRODUCT_TYPES || []).find(t =>
      [t.familia, t.coleccion, t.tipo].join('-').toLowerCase().replace(/\s+/g, '-') === productId
    );
    if (!entry) return;
    _currentFamily  = entry.familia;
    _familyProducts = _buildFamilyProducts(entry.familia);
    if (!_familyProducts.length) return;
    _familyIdx  = Math.max(0, _familyProducts.findIndex(p => p.id === productId));
    _quantities = {};
    (_familyProducts[_familyIdx]?.variants || []).forEach(v => { _quantities[v.sku] = 0; });
    _ensureFamilyModal();
    _renderFamilyModal();
    _openModal('modalFamily');
  }

  function openFamily(familyName) {
    if (!familyName) return;

    _currentFamily  = familyName;
    _familyProducts = _buildFamilyProducts(familyName);

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
    modal.setAttribute('aria-labelledby', 'familyModalHeaderText');

    modal.innerHTML = `
      <div class="modal-overlay" id="modalFamilyOverlay"></div>
      <div class="modal-content modal-family-content">

        <button class="modal-close" id="closeFamilyModal" aria-label="Cerrar">×</button>

        <!-- Cabecera: Familia · Colección -->
        <div class="family-modal-header">
          <span class="family-modal-header-text" id="familyModalHeaderText"></span>
        </div>

        <!-- Imagen + flechas centradas en el eje de la foto -->
        <div class="family-modal-img-section">
          <div class="family-modal-img-wrap">
            <img id="familyProductImg" class="family-modal-img family-modal-img--zoomable" src="" alt=""
              onerror="this.style.display='none';document.getElementById('familyImgPlaceholder').style.display='flex'"
              title="Ampliar imagen">
            <div id="familyImgPlaceholder" class="family-modal-placeholder" style="display:none">
              <span class="family-card-placeholder-text">MLG</span>
            </div>
            <button class="family-nav-btn family-nav-prev" id="familyNavPrev" aria-label="Producto anterior">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button class="family-nav-btn family-nav-next" id="familyNavNext" aria-label="Producto siguiente">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <button class="btn-share" id="familyBtnShare" aria-label="Compartir producto">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Descripción: tipo · medidas · material + contador -->
        <div class="family-modal-product-desc-bar" id="familyProductDescBar">
          <p class="family-modal-product-desc" id="familyProductDesc"></p>
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

    // Share button — Web Share API en móvil, clipboard en desktop
    document.getElementById('familyBtnShare')?.addEventListener('click', async () => {
      const btn  = document.getElementById('familyBtnShare');
      const url  = `${location.origin}${location.pathname}?p=${btn.dataset.productId}`;
      const title = btn.dataset.productName || '';
      if (navigator.share) {
        try { await navigator.share({ title, url }); } catch (_) { /* usuario canceló */ }
      } else {
        try {
          await navigator.clipboard.writeText(url);
          Toast.show('Link copiado al portapapeles ✓');
        } catch (_) {
          window.prompt('Copia el link:', url);
        }
      }
    });

    // Click imagen principal → zoom (foto actual de la galería)
    document.getElementById('familyProductImg')?.addEventListener('click', () => {
      const prod = _familyProducts[_familyIdx];
      const src = prod?.images?.[_currentPhotoIdx] || _currentProduct?.image;
      if (src) openZoom(src, _currentProduct?.name || '');
    });
  }

  function _renderFamilyModal() {
    const prod = _familyProducts[_familyIdx];
    if (!prod) return;

    _currentProduct = prod;
    // Reset quantities for this product
    _quantities = {};
    (prod.variants || []).forEach(v => { _quantities[v.sku] = 0; });

    // Cabecera: "Familia · Colección" en una línea
    const headerEl = document.getElementById('familyModalHeaderText');
    if (headerEl) headerEl.textContent = [_currentFamily, prod.coleccion].filter(Boolean).join(' · ');

    // Foto inicial aleatoria entre las variantes de color
    _currentPhotoIdx = prod.images?.length
      ? Math.floor(Math.random() * prod.images.length)
      : 0;
    _updateMainPhoto();

    // Descripción: tipo · medidas · material en una línea
    const descEl = document.getElementById('familyProductDesc');
    if (descEl) {
      const parts = [prod.tipo || prod.name, prod.subtitle, prod.material].filter(Boolean);
      descEl.textContent = parts.join(' · ');
    }

    // Share button — siempre visible (Web Share en móvil, clipboard en desktop)
    const shareBtn = document.getElementById('familyBtnShare');
    if (shareBtn) {
      shareBtn.dataset.productId   = prod.id;
      shareBtn.dataset.productName = prod.coleccion + ' — ' + (prod.tipo || prod.name);
      shareBtn.style.display       = 'flex';
    }

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

    list.innerHTML = variants.map(v => {
      const ps = Utils.calcPresale(v.precio_cop);
      const priceHtml = ps.tieneDescuento
        ? `<span class="fv-price fv-price--presale">
             <span class="fv-price-original">${Utils.formatPrice(ps.original)}</span>
             <span class="fv-price-final">${Utils.formatPrice(ps.final)}</span>
           </span>`
        : `<span class="fv-price">${Utils.formatPrice(ps.original)}</span>`;
      return `
        <div class="fv-row" data-sku="${Utils.sanitize(v.sku)}">
          <img
            class="fv-thumb"
            src="${Utils.sanitize(v.image)}"
            alt="${Utils.sanitize(v.color)}"
            loading="lazy"
            data-zoom-src="${Utils.sanitize(v.image)}"
            data-zoom-alt="${Utils.sanitize(v.color)}"
            title="Ampliar"
            onerror="this.style.visibility='hidden'"
          >
          <div class="fv-info">
            <span class="fv-name">${Utils.sanitize(v.color)}</span>
            <span class="fv-sku">${Utils.sanitize(v.sku)}</span>
          </div>
          ${priceHtml}
          <div class="fv-qty">
            <button class="qty-btn" data-action="dec" data-sku="${Utils.sanitize(v.sku)}" aria-label="Reducir">−</button>
            <span class="qty-display" id="fqty-${Utils.sanitize(v.sku)}">0</span>
            <button class="qty-btn" data-action="inc" data-sku="${Utils.sanitize(v.sku)}" aria-label="Aumentar">+</button>
            <span class="qty-min6-msg" id="min6-fam-${Utils.sanitize(v.sku)}" style="display:none;color:red;font-weight:bold;font-size:0.75em">mínimo 6</span>
          </div>
          <span class="fv-subtotal" id="fsub-${Utils.sanitize(v.sku)}">$0</span>
        </div>`;
    }).join('');
  }

  function _handleFamilyVariantClick(e) {
    // Zoom en miniatura de variante
    const thumb = e.target.closest('.fv-thumb');
    if (thumb) {
      Modal.openZoom(thumb.dataset.zoomSrc, thumb.dataset.zoomAlt);
      return;
    }

    // Qty buttons
    const btn = e.target.closest('.qty-btn');
    if (!btn) return;
    const sku = btn.dataset.sku;
    const action = btn.dataset.action;
    if (!sku || !action) return;

    const cur  = _quantities[sku] || 0;
    const min6 = _needsMin6(sku);
    if (action === 'dec') {
      _quantities[sku] = (min6 && cur <= 6) ? 0 : Math.max(0, cur - 1);
    } else {
      const next = Math.min(MLG_CONFIG.cart.maxQuantity, cur + 1);
      _quantities[sku] = (min6 && next < 6) ? 6 : next;
    }

    _updateFamilyVariantRow(sku);
    _updateFamilyFooter();
  }

  function _updateFamilyVariantRow(sku) {
    const qty    = _quantities[sku] || 0;
    const qtyEl  = document.getElementById(`fqty-${sku}`);
    const subEl  = document.getElementById(`fsub-${sku}`);
    const msgEl  = document.getElementById(`min6-fam-${sku}`);
    if (qtyEl) qtyEl.textContent = qty;
    if (subEl) {
      const variant = (_currentProduct?.variants || []).find(v => v.sku === sku);
      const ps = Utils.calcPresale(variant?.precio_cop || 0);
      subEl.textContent = qty > 0 ? Utils.formatPrice(ps.final * qty) : '$0';
    }
    if (msgEl) msgEl.style.display = (_needsMin6(sku) && qty > 0 && qty < 6) ? 'block' : 'none';
  }

  function _updateFamilyFooter() {
    const total    = _calculateFamilyTotal();
    const hasItems = Object.values(_quantities).some(q => q > 0);
    const hasInvalidMin6 = Object.entries(_quantities).some(
      ([sku, qty]) => qty > 0 && qty < 6 && _needsMin6(sku)
    );

    const totalEl = document.getElementById('familyTotalAmount');
    if (totalEl) totalEl.textContent = Utils.formatPrice(total);

    const btnCart = document.getElementById('familyBtnCart');
    if (btnCart) btnCart.disabled = !hasItems || hasInvalidMin6;
  }

  function _calculateFamilyTotal() {
    if (!_currentProduct) return 0;
    return (_currentProduct.variants || []).reduce((sum, v) => {
      const ps = Utils.calcPresale(v.precio_cop || 0);
      return sum + ps.final * (_quantities[v.sku] || 0);
    }, 0);
  }

  // -------------------------------------------------------
  // FOTO PRINCIPAL — carga la imagen del índice actual
  // -------------------------------------------------------
  function _updateMainPhoto() {
    const prod  = _familyProducts[_familyIdx];
    const imgEl = document.getElementById('familyProductImg');
    const phEl  = document.getElementById('familyImgPlaceholder');
    const src   = prod?.images?.[_currentPhotoIdx] || '';
    if (!imgEl) return;
    if (src) {
      const preload = new Image();
      preload.onload = () => {
        imgEl.src = src;
        imgEl.alt = prod.name;
        imgEl.style.display = '';
        if (phEl) phEl.style.display = 'none';
      };
      preload.onerror = () => {
        imgEl.style.display = 'none';
        if (phEl) phEl.style.display = 'flex';
      };
      preload.src = src;
    } else {
      imgEl.style.display = 'none';
      if (phEl) phEl.style.display = 'flex';
    }
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
          productName:   (_currentProduct.coleccion || '') + ' — ' + (_currentProduct.tipo || _currentProduct.name),
          familia:       _currentFamily,
          collection:    v.color || v.sku,
          sku:           v.sku,
          price:         ps.final,
          priceOriginal: ps.original,
          descPct:       ps.descPct,
          quantity:      _quantities[v.sku],
          image:         v.image || _currentProduct.images?.[0] || '',
        };
      });
  }

  // -------------------------------------------------------
  // MODAL ZOOM
  // -------------------------------------------------------
  function openZoom(src, alt = '') {
    const img = document.getElementById('zoomImage');
    if (img) {
      img.src = src || MLG_CONFIG.images.placeholder;
      img.alt = alt;
      img.onerror = () => { img.onerror = null; img.src = MLG_CONFIG.images.placeholder; };
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
    document.getElementById('wpBtnApplyInfluencer')?.addEventListener('click', _applyInfluencer);
    document.getElementById('wpInputInfluencer')?.addEventListener('input', e => {
      e.target.value = e.target.value.toUpperCase();
      _resetInfluencer();
    });
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
  let _ckBono        = null;   // { code, available } si voucher válido
  let _ckInfluencer  = null;   // { codigo, descuentoPct, comisionPct } si código válido
  let _ckSubtotal    = 0;

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

      // Siempre actualizar barrio y ciudad cuando el usuario elige una dirección de Places
      // (sobreescribe el draft anterior — la elección explícita tiene prioridad)
      const barrioEl = document.getElementById(barrioInputId);
      if (barrioEl) {
        if (barrio) {
          barrioEl.value = barrio;
        } else {
          const parts = (place.formatted_address || '').split(',');
          if (parts.length >= 2) barrioEl.value = parts[1].trim();
        }
      }

      const ciudadEl = document.getElementById(ciudadInputId);
      if (ciudadEl && ciudad) ciudadEl.value = ciudad;

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
    _ckBono       = null;   // reset siempre — se revalida automáticamente si hay código
    _ckInfluencer = null;
    _ckSubtotal   = Cart.getTotal();
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
      // Barrio y Ciudad los llena Places Autocomplete al escribir la dirección.
      // Limpiarlos evita que persistan valores de sesiones anteriores.
      ['wpInputBarrio', 'wpInputCiudad'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      // Auto-revalidar influencer y bono si los campos tienen código (ej: cliente volvió con "Regresar")
      const inflInput = document.getElementById('wpInputInfluencer');
      if (inflInput && inflInput.value.trim()) {
        _applyInfluencer();
      }
      const bonoInput = document.getElementById('wpInputBono');
      if (bonoInput && bonoInput.value.trim()) {
        _applyBono();
      }
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
  // PERSISTENCIA FORMULARIO — localStorage indefinido
  // Draft compartido entre modal Wompi (wp*), WhatsApp (wa*)
  // y Gift Card emisor (gf*). El cliente no repite sus datos
  // en compras futuras desde el mismo dispositivo.
  // Nunca se borra — solo se actualiza con cada keystroke.
  // ═══════════════════════════════════════════════════
  const _DRAFT_KEY = 'mlg_checkout_draft';

  // Lee el primer valor no vacío entre los IDs dados (prioridad izquierda→derecha)
  function _draftRead(...ids) {
    for (const id of ids) {
      const v = (document.getElementById(id)?.value || '').trim();
      if (v) return v;
    }
    return '';
  }

  function _saveDraft() {
    try {
      const draft = {
        nombre:     _draftRead('wpInputNombre',   'waInputNombre',   'gfNombre'),
        apellido:   _draftRead('wpInputApellido', 'waInputApellido', 'gfApellido'),
        email:      _draftRead('wpInputEmail',    'waInputEmail',    'gfEmail'),
        emailConf:  _draftRead('wpInputEmailConf','waInputEmailConf','gfEmailConf'),
        codPais:    _draftRead('wpInputCodPais',  'waInputCodPais',  'gfPais'),
        tel:        _draftRead('wpInputTel',      'waInputTel',      'gfTel'),
        tipoDoc:    _draftRead('wpInputTipoDoc',  'waInputTipoDoc',  'gfTipoDoc'),
        numDoc:     _draftRead('wpInputNumDoc',   'waInputNumDoc',   'gfNumDoc'),
        cumpleDia:  _draftRead('wpInputCumpleDia','waInputCumpleDia','gfCumpleDia'),
        cumpleMes:  _draftRead('wpInputCumpleMes','waInputCumpleMes','gfCumpleMes'),
        dir:        _draftRead('wpInputDir',      'waInputDir',      'gfDir'),
        barrio:     _draftRead('wpInputBarrio',   'waInputBarrio',   'gfBarrio'),
        ciudad:     _draftRead('wpInputCiudad',   'waInputCiudad',   'gfCiudad'),
        notas:      _draftRead('wpInputNotas',    'waInputNotas'),
        tipoPersona: document.querySelector('input[name="wpInputTipoPersona"]:checked')?.value
                  || document.querySelector('input[name="waInputTipoPersona"]:checked')?.value
                  || 'natural',
      };
      localStorage.setItem(_DRAFT_KEY, JSON.stringify(draft));
    } catch(e) {}
  }

  function _loadDraft() {
    try {
      const raw = localStorage.getItem(_DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);

      // Escribe en los tres conjuntos de campos simultáneamente
      const s = (val, ...ids) => {
        if (!val) return;
        ids.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.value = val;
        });
      };
      s(draft.nombre,    'wpInputNombre',   'waInputNombre',   'gfNombre');
      s(draft.apellido,  'wpInputApellido', 'waInputApellido', 'gfApellido');
      s(draft.email,     'wpInputEmail',    'waInputEmail',    'gfEmail');
      s(draft.emailConf, 'wpInputEmailConf','waInputEmailConf','gfEmailConf');
      s(draft.codPais,   'wpInputCodPais',  'waInputCodPais',  'gfPais');
      s(draft.tel,       'wpInputTel',      'waInputTel',      'gfTel');
      s(draft.tipoDoc,   'wpInputTipoDoc',  'waInputTipoDoc',  'gfTipoDoc');
      s(draft.numDoc,    'wpInputNumDoc',   'waInputNumDoc',   'gfNumDoc');
      s(draft.cumpleDia, 'wpInputCumpleDia','waInputCumpleDia','gfCumpleDia');
      s(draft.cumpleMes, 'wpInputCumpleMes','waInputCumpleMes','gfCumpleMes');
      s(draft.dir,       'wpInputDir',      'waInputDir',      'gfDir');
      s(draft.barrio,    'wpInputBarrio',   'waInputBarrio',   'gfBarrio');
      s(draft.ciudad,    'wpInputCiudad',   'waInputCiudad',   'gfCiudad');
      s(draft.notas,     'wpInputNotas',    'waInputNotas');

      // Radios tipo persona — wp y wa
      ['wp', 'wa'].forEach(prefix => {
        if (draft.tipoPersona) {
          const radio = document.querySelector(`input[name="${prefix}InputTipoPersona"][value="${draft.tipoPersona}"]`);
          if (radio) radio.checked = true;
        }
      });

      // Mostrar ✓ email si coinciden — wp y wa y gf
      if (draft.email && draft.email === draft.emailConf) {
        ['wpOkEmailConf', 'waOkEmailConf', 'gfOkEmailConf'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.style.display = 'block';
        });
      }
    } catch(e) {}
  }

  // _clearDraft disponible pero nunca invocada — el draft persiste indefinidamente
  function _clearDraft() {
    try { localStorage.removeItem(_DRAFT_KEY); } catch(e) {}
  }

  function _bindDraftListeners() {
    // Idempotente — no duplica listeners si se llama varias veces
    const campos = [
      // Wompi
      'wpInputNombre','wpInputApellido','wpInputEmail','wpInputEmailConf',
      'wpInputCodPais','wpInputTel','wpInputTipoDoc','wpInputNumDoc',
      'wpInputCumpleDia','wpInputCumpleMes','wpInputDir','wpInputBarrio',
      'wpInputCiudad','wpInputNotas',
      // WhatsApp
      'waInputNombre','waInputApellido','waInputEmail','waInputEmailConf',
      'waInputCodPais','waInputTel','waInputTipoDoc','waInputNumDoc',
      'waInputCumpleDia','waInputCumpleMes','waInputDir','waInputBarrio',
      'waInputCiudad','waInputNotas',
      // Gift Card — solo datos del emisor (no destinatario)
      'gfNombre','gfApellido','gfEmail','gfEmailConf',
      'gfPais','gfTel','gfTipoDoc','gfNumDoc',
      'gfCumpleDia','gfCumpleMes','gfDir','gfBarrio','gfCiudad',
    ];
    campos.forEach(id => {
      const el = document.getElementById(id);
      if (!el || el.dataset.draftBound) return;
      el.dataset.draftBound = '1';
      el.addEventListener('input', _saveDraft);
      if (el.tagName === 'SELECT') el.addEventListener('change', _saveDraft);
    });
    // Radios tipo persona — wp y wa
    ['wpInputTipoPersona', 'waInputTipoPersona'].forEach(name => {
      document.querySelectorAll(`input[name="${name}"]`).forEach(r => {
        if (!r.dataset.draftBound) {
          r.dataset.draftBound = '1';
          r.addEventListener('change', _saveDraft);
        }
      });
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
      `🛍️ *Lista de deseos MLG — Mario Luca Giusti*`,
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
      `Hola, me interesan estas piezas de acrilico MLG. ¿Pueden confirmar disponibilidad?`,
    ].filter(Boolean).join('\n');

    const waUrl = `https://wa.me/${MLG_CONFIG.brand.phone.replace('+','')}?text=${encodeURIComponent(msgTemp)}`;
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
    const succEl = document.getElementById('wpSuccessBono');
    if (succEl) { succEl.textContent = ''; succEl.style.display = 'none'; }
    _updateWompiTotals();
  }

  async function _applyInfluencer() {
    const input  = document.getElementById('wpInputInfluencer');
    const errEl  = document.getElementById('wpErrInfluencer');
    const succEl = document.getElementById('wpSuccessInfluencer');
    const code   = (input?.value || '').trim().toUpperCase();

    if (!code) { if (errEl) errEl.textContent = 'Ingresa un código'; return; }

    const btn = document.getElementById('wpBtnApplyInfluencer');
    if (btn) { btn.disabled = true; btn.textContent = 'Verificando…'; }

    try {
      const data = await Api.getInfluencer(code);
      if (data.valid) {
        _ckInfluencer = { codigo: data.codigo, descuentoPct: data.descuentoPct, comisionPct: data.comisionPct };
        if (errEl)  errEl.textContent = '';
        if (succEl) { succEl.textContent = `✓ Código válido — ${data.descuentoPct}% de descuento aplicado`; succEl.style.display = 'block'; }
        _updateWompiTotals();
        Toast.show(`Descuento ${data.descuentoPct}% aplicado por código influencer`, 'success');
      } else {
        _resetInfluencer();
        if (errEl) errEl.textContent = data.reason || 'Código inválido';
        if (succEl) succEl.style.display = 'none';
      }
    } catch(err) {
      if (errEl) errEl.textContent = 'Error al verificar. Intenta de nuevo.';
      Logger.warn('modal.js: error validando influencer', err);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Aplicar'; }
    }
  }

  function _resetInfluencer() {
    _ckInfluencer = null;
    const succEl = document.getElementById('wpSuccessInfluencer');
    if (succEl) { succEl.textContent = ''; succEl.style.display = 'none'; }
    _updateWompiTotals();
  }

  function _updateWompiTotals() {
    const cfg       = MLG_CONFIG.checkout;
    const subtotal  = Utils.roundCOP(_ckSubtotal);
    // Orden recuadro financiero: subtotal → −infl% → −bono/GC → Total a Pagar.
    // El 3% se aplica SOLO en el botón Wompi 100% (no aparece en el recuadro).
    // Floor al millar: el cliente siempre paga menos o igual al valor calculado.
    const inflPct    = _ckInfluencer ? (_ckInfluencer.descuentoPct / 100) : 0;
    const discInfl   = _ckInfluencer ? Math.floor(subtotal * inflPct / 1000) * 1000 : 0;
    const afterInfl  = subtotal - discInfl;
    const bonoDesc   = _ckBono ? Math.min(_ckBono.available || 0, afterInfl) : 0;
    const totalPagar = afterInfl - bonoDesc;
    // 3% solo para calcular el monto del botón Wompi 100%
    const disc100    = Math.floor(totalPagar * cfg.discountPayFull / 1000) * 1000;
    const pay100     = totalPagar - disc100;
    const pay60      = Math.floor(totalPagar * 0.6 / 1000) * 1000;

    // Mostrar subtotal (precios de catálogo)
    const subEl = document.getElementById('wpValSubtotal');
    if (subEl) subEl.textContent = Utils.formatPrice(subtotal);

    // Línea descuento campaña — mostrar ahorro informativo
    const campLine  = document.getElementById('wpLineCampania');
    const campLabel = document.getElementById('wpLabelCampania');
    const campVal   = document.getElementById('wpValCampania');
    const descPct   = Campania.descuentoPct();
    if (descPct > 0 && campLine) {
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

    const anyDiscount = discInfl > 0 || bonoDesc > 0;

    // Mostrar/ocultar línea influencer (primero en el recuadro)
    const inflLine  = document.getElementById('wpLineInfluencer');
    const inflLabel = document.getElementById('wpLabelInfluencer');
    const inflVal   = document.getElementById('wpValInfluencer');
    if (inflLine) inflLine.style.display = discInfl > 0 ? 'flex' : 'none';
    if (inflLabel && _ckInfluencer) inflLabel.textContent = `Descuento ${_ckInfluencer.descuentoPct}% influencer`;
    if (inflVal)  inflVal.textContent = '− ' + Utils.formatPrice(discInfl);

    // Mostrar/ocultar línea Gift Card/bono (se resta después del influencer)
    const bonoLine = document.getElementById('wpLineBono');
    const bonoVal  = document.getElementById('wpValBono');
    if (bonoLine) bonoLine.style.display = bonoDesc > 0 ? 'flex' : 'none';
    if (bonoVal)  bonoVal.textContent = '− ' + Utils.formatPrice(bonoDesc);

    // Línea "Total a pagar" — sin descuento 3% (ese solo va en el botón)
    const totalFinalLine = document.getElementById('wpLineTotalFinal');
    const totalFinalVal  = document.getElementById('wpValTotalFinal');
    if (anyDiscount) {
      if (totalFinalLine) totalFinalLine.style.display = 'flex';
      if (totalFinalVal)  totalFinalVal.textContent = Utils.formatPrice(totalPagar);
    } else {
      if (totalFinalLine) totalFinalLine.style.display = 'none';
    }

    // ── Bono cubre el total (totalPagar ≤ 0) → botón Gift Card, sin Wompi ──
    const bonoCobreTotal = totalPagar <= 0;
    const wpPayActions   = document.getElementById('wpPayActions');
    const wpPayGift      = document.getElementById('wpPayGift');
    const tipEl          = document.getElementById('wpTipAnticipado');

    if (bonoCobreTotal) {
      if (wpPayActions) wpPayActions.style.display = 'none';
      if (wpPayGift)    wpPayGift.style.display     = 'block';
      if (tipEl)        tipEl.style.display         = 'none';

      const totalFinalLine2 = document.getElementById('wpLineTotalFinal');
      const totalFinalVal2  = document.getElementById('wpValTotalFinal');
      if (totalFinalLine2) totalFinalLine2.style.display = 'flex';
      if (totalFinalVal2)  totalFinalVal2.textContent    = Utils.formatPrice(0);

      const giftAmtEl = document.getElementById('wpAmountGift');
      if (giftAmtEl) giftAmtEl.textContent = 'Total: $0 — Cubierto por Gift Card';
    } else {
      if (wpPayActions) wpPayActions.style.display = 'flex';
      if (wpPayGift)    wpPayGift.style.display     = 'none';
      if (tipEl)        tipEl.style.display         = 'block';

      // Botones: 60% y 100% calculados sobre "Total a pagar" del recuadro.
      // 100% siempre muestra el 3% incluido en el monto del botón.
      const btn60El  = document.getElementById('wpAmount60');
      const btn100El = document.getElementById('wpAmount100');
      if (btn60El)  btn60El.textContent  = Utils.formatPrice(pay60);
      if (btn100El) btn100El.textContent = Utils.formatPrice(pay100) + '  —  3% dto. incl.';
    }
  }

  // ═══════════════════════════════════════════════════
  // SUBMIT — WOMPI
  // ═══════════════════════════════════════════════════
  async function _submitWompi(pct) {
    if (!_validateCMOForm('wp')) return;

    const btn60  = document.getElementById('btnPagar60');
    const btn100 = document.getElementById('btnPagar100');
    if (btn60)  { btn60.disabled  = true; btn60.innerHTML  = '<span class="cmo-btn-pago-label">Pago Anticipo 60%</span><span class="cmo-btn-pago-amount" id="wpAmount60">Procesando…</span>'; }
    if (btn100) { btn100.disabled = true; btn100.innerHTML = '<span class="cmo-btn-pago-label">Pago Anticipado 100%</span><span class="cmo-btn-pago-amount" id="wpAmount100">Procesando…</span>'; }
    const errGenEl = document.getElementById('wpErrGeneral');
    if (errGenEl) errGenEl.style.display = 'none';

    const data        = _collectCMO('wp');
    const items       = Cart.getItems();
    const subtotal    = _ckSubtotal;
    const cfg         = MLG_CONFIG.checkout;
    // Misma fórmula que _updateWompiTotals: infl% → bono/GC → totalPagar → 3%(si 100% en botón).
    const inflPct     = _ckInfluencer ? (_ckInfluencer.descuentoPct / 100) : 0;
    const discInfl    = _ckInfluencer ? Math.floor(subtotal * inflPct / 1000) * 1000 : 0;
    const afterInfl   = subtotal - discInfl;
    const bonoDesc    = _ckBono ? Math.min(_ckBono.available || 0, afterInfl) : 0;
    const totalPagar  = afterInfl - bonoDesc;
    const disc100raw  = pct === '100' ? Math.floor(totalPagar * cfg.discountPayFull / 1000) * 1000 : 0;
    const total       = pct === '60' ? Math.floor(totalPagar * 0.6 / 1000) * 1000 : totalPagar - disc100raw;
    const descuento   = discInfl + bonoDesc + disc100raw;
    const amountCents = total * 100;  // ya es múltiplo de $1.000 → sin pérdida de centavos

    // Generar referencia local — NO grabar en Sheets todavía.
    // El pedido se graba en Sheets solo cuando Wompi confirma APPROVED (en checkout.js)
    // evitando entradas PENDIENTE huérfanas si el usuario vuelve atrás.
    const reference = `WP-${Date.now()}`;

    // Guardar payload completo en sessionStorage para que checkout.js lo use
    const formaPago = _ckBono?.code
      ? (pct === '60' ? 'WOMPI_60' : 'WOMPI_100') + '+GIFT:' + _ckBono.code
      : (pct === '60' ? 'WOMPI_60' : 'WOMPI_100');
    // Guardar en sessionStorage Y localStorage — el redirect cross-origin de Wompi
    // puede limpiar sessionStorage; localStorage persiste como backup garantizado.
    const _pendingPayload = JSON.stringify({
      formaPago,
      subtotal, descuento, total,
      porcentajePagado: pct === '60' ? 60 : 100,
      referencia:       reference,
      cliente:          data.cliente,
      entrega:          data.entrega,
      productos:        items,
      bono:             _ckBono
        ? { code: _ckBono.code, monto: bonoDesc, available: _ckBono.available }
        : null,
      influencerCodigo: _ckInfluencer?.codigo        || null,
      influencerBase:   _ckInfluencer ? subtotal      : 0,
      influencerPct:    _ckInfluencer?.descuentoPct   || 0,
      discInfluencer:   discInfl,
      discGiftCard:     bonoDesc,
      disc3pct:         disc100raw,
      totalAPagar:      totalPagar,
      campaniaId:       MLG_CONFIG?.campania?.id  || '',
      catalogoId:       MLG_CONFIG?.catalogo?.id  || '',
    });
    try { sessionStorage.setItem('mlg_pending_pedido', _pendingPayload); } catch(e) { Logger.warn('modal.js: sessionStorage write error', e); }
    try { localStorage.setItem('mlg_pending_pedido', _pendingPayload); }   catch(e) { Logger.warn('modal.js: localStorage write error', e); }

    // ── Obtener firma de integridad Wompi ──────────────────
    let signature = null;
    try {
      const resp = await fetch(cfg.signatureWorkerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, amountInCents: amountCents, currency: cfg.currency, apiToken: cfg.apiToken }),
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
    // Limpiar flag Gift huérfano — evita que pageshow restaure el modal de Gift Card
    // en lugar del carrito al regresar de Wompi con el botón «Atrás» del browser.
    try { sessionStorage.removeItem('mlg_gift_redirect'); } catch(e) {}
    // Flag para detectar vuelta con «Regresar» — restaura modal con botones activos
    try { sessionStorage.setItem('mlg_wompi_redirect', '1'); } catch(e) {}
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
    const cfg2     = MLG_CONFIG.checkout;

    // Misma fórmula que _updateWompiTotals: infl% → bono/GC → totalPagar.
    // No hay 3% aquí porque no hay pago Wompi — la GC cubre el total restante.
    const inflPct2   = _ckInfluencer ? (_ckInfluencer.descuentoPct / 100) : 0;
    const discInfl2  = _ckInfluencer ? Math.floor(subtotal * inflPct2 / 1000) * 1000 : 0;
    const afterInfl2 = subtotal - discInfl2;
    const bonoActual = afterInfl2; // la GC cubre el total tras el descuento influencer
    const totalFinal = 0;          // bono cubre el total

    // Generar referencia
    const reference = `WP-${Date.now()}`;

    // LEAN: NO llamar APIs aquí — guardar payload completo en storage
    // checkout.js lo procesará todo en servidor cuando llegue con giftPaid=1 + APPROVED
    const _pendingGiftPayload = JSON.stringify({
      formaPago:        _ckBono?.code ? `GIFT_CARD:${_ckBono.code}` : 'GIFT_CARD',
      subtotal,
      descuento:        discInfl2 + bonoActual,  // = subtotal (discInfl + GC cubre afterInfl)
      total:            totalFinal,
      porcentajePagado: 100,
      referencia:       reference,
      cliente:          data.cliente,
      entrega:          data.entrega,
      productos:        items,
      bono:             _ckBono
        ? { code: _ckBono.code, monto: bonoActual, available: _ckBono.available }
        : null,
      influencerCodigo: _ckInfluencer?.codigo      || null,
      influencerBase:   _ckInfluencer ? subtotal    : 0,
      influencerPct:    _ckInfluencer?.descuentoPct || 0,
      discInfluencer:   discInfl2,
      discGiftCard:     bonoActual,
      disc3pct:         0,
      totalAPagar:      0,   // GC cubre el total → totalPagar = 0
      campaniaId:       MLG_CONFIG?.campania?.id || '',
      catalogoId:       MLG_CONFIG?.catalogo?.id || '',
    });
    try { sessionStorage.setItem('mlg_pending_pedido', _pendingGiftPayload); } catch(e) {}
    try { localStorage.setItem('mlg_pending_pedido',   _pendingGiftPayload); } catch(e) {}

    Logger.log('modal.js: gift card lean — payload guardado, redirigiendo', reference);
    // giftPaid=1 → checkout.js Flujo C: lean confirmarPagoWompi en servidor
    window.location.href = `mlg-checkout.html?reference=${encodeURIComponent(reference)}&transaction_status=APPROVED&giftPaid=1`;
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
      // Fallback texto: "G-LIVING" en negro sobre la banda blanca
      ctx.save();
      ctx.fillStyle   = '#1a1610';
      ctx.font        = 'bold 17px Georgia, serif';
      ctx.textAlign   = 'center';
      ctx.letterSpacing = '3px';
      ctx.fillText('G-LIVING', W / 2, BAND_H / 2 + 7);
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

    // Cargar draft del cliente en campos del emisor (idempotente)
    requestAnimationFrame(() => {
      _loadDraft();
      _bindDraftListeners();
      // Barrio y Ciudad los llena Places Autocomplete automáticamente al escribir la dirección.
      // Limpiarlos evita que persistan valores de sesiones anteriores.
      ['gfBarrio', 'gfCiudad'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
    });

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
      // Pre-llenar el input de monto con el valor actual para que el usuario lo vea en step 1
      const amountEl = document.getElementById('giftAmount');
      if (amountEl && !amountEl.value && _giftValue) amountEl.value = _giftValue;
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
    const cfg       = MLG_CONFIG.checkout;

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

    const _giftPayload = {
      referencia:   reference,
      codigo:       _giftCode,
      vigencia:     _giftValidUntil,
      valor:        amount,
      campaniaId:   MLG_CONFIG?.campania?.id  || '',
      catalogoId:   MLG_CONFIG?.catalogo?.id  || '',
      emisor:       { nombre, apellido, cumpleDia, cumpleMes, tipoDoc, numDoc, email, telefono: pais + tel, direccion: dir, barrio, ciudad },
      destinatario: { nombre: recNom, apellido: recApe, email: recEmail, telefono: recPais + recTel },
      mensaje,
    };
    // Guardar en storage como fallback (útil para restaurar el modal si el usuario vuelve atrás)
    const _giftPayloadStr = JSON.stringify(_giftPayload);
    try { sessionStorage.setItem('mlg_gift_payload', _giftPayloadStr); } catch(e) {}
    try { localStorage.setItem('mlg_gift_payload',   _giftPayloadStr); } catch(e) {}
    try { localStorage.setItem('mlg_gift_' + reference, _giftPayloadStr); } catch(e) {}

    // Grabar fila en Sheets Y obtener firma Wompi en paralelo.
    // createGiftCard ANTES del redirect garantiza que la fila existe cuando Wompi confirma,
    // incluso si el storage no está disponible en checkout.js (cross-tab, storage pressure, etc.).
    // v20.09: si ya existe fila PENDIENTE con el mismo código, actualiza la referencia (reintento).
    let signature = null;
    await Promise.all([
      Api.createGiftCard(_giftPayload)
        .catch(err => Logger.warn('modal.js: createGiftCard pre-redirect error', err)),
      (async () => {
        try {
          const resp = await fetch(cfg.signatureWorkerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference, amountInCents: amountCts, currency: cfg.currency, apiToken: cfg.apiToken }),
          });
          if (resp.ok) {
            const r = await resp.json();
            signature = r.integritySignature || null;
          }
        } catch(err) { Logger.warn('modal.js: error firma gift', err); }
      })(),
    ]);

    // Redirigir a Wompi
    const params = new URLSearchParams({
      'public-key':      cfg.wompiPublicKey,
      'currency':        cfg.currency,
      'amount-in-cents': amountCts,
      'reference':       reference,
      // isGiftCard=1 codificado en la URL de retorno — sobrevive al redirect cross-origin de Wompi
      'redirect-url':    cfg.checkoutUrl + (cfg.checkoutUrl.includes('?') ? '&' : '?') + 'isGiftCard=1',
    });
    if (signature) params.set('signature:integrity', signature);
    if (nombre)    params.set('customer-data:full-name', `${nombre} ${apellido}`);
    if (email)     params.set('customer-data:email', email);
    if (tel)       params.set('customer-data:phone-number', `${pais}${tel}`);

    Logger.log('modal.js: gift card → Wompi', { reference, amountCts });
    // Limpiar flag de carrito — evita interferencia si el usuario alterna flujos
    try { sessionStorage.removeItem('mlg_wompi_redirect'); } catch(e) {}
    // Flag específico para Gift — localStorage persiste cross-origin; sessionStorage como backup
    try { sessionStorage.setItem('mlg_gift_redirect', reference); } catch(e) {}
    try { localStorage.setItem('mlg_gift_redirect', reference); }   catch(e) {}
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

  // Restaura el paso 2 del Gift modal después de volver de Wompi sin pagar
  // El formulario queda intacto (el draft lo preserva), solo restaura el botón
  function restoreGiftStep2() {
    // Restaurar estado desde el payload guardado antes del redirect a Wompi
    let savedPayload = null;
    try {
      const raw = localStorage.getItem('mlg_gift_payload')
               || sessionStorage.getItem('mlg_gift_payload');
      if (raw) savedPayload = JSON.parse(raw);
    } catch(e) {}

    if (savedPayload) {
      _giftValue      = savedPayload.valor    || _giftValue    || 500000;
      _giftCode       = savedPayload.codigo   || _giftCode     || _generateGiftCode();
      _giftValidUntil = savedPayload.vigencia || _giftValidUntil || _giftVigencia();
    }

    _giftShowStep(2);
    _openModal('modalGift');

    requestAnimationFrame(() => {
      _loadDraft();          // Pre-carga campos emisor (gfNombre, gfEmail, etc.)
      _bindDraftListeners(); // Idempotente
      // Pre-cargar campos destinatario y mensaje desde payload
      if (savedPayload) {
        const dest = savedPayload.destinatario || {};
        const s = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
        s('gfRecNombre',   dest.nombre   || '');
        s('gfRecApellido', dest.apellido || '');
        s('gfRecEmail',    dest.email    || '');
        // telefono guardado como "+57XXXXXXXXXX" — mostrar solo los últimos 10 dígitos
        if (dest.telefono) s('gfRecTel', dest.telefono.replace(/^\+\d{1,3}/, ''));
        s('gfMensaje', savedPayload.mensaje || '');
      }
    });

    setTimeout(() => _drawGiftCard(_giftValue || 500000), 80);
    const btn = document.getElementById('giftBtnPagar');
    if (btn) { btn.disabled = false; btn.textContent = 'Pagar con Wompi'; }
  }

  return {
    init,
    resetState,
    restoreGiftStep2,
    openProduct,
    openFamily,
    openFamilyAtProduct,
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
  try {
    const params = new URLSearchParams(window.location.search);
    // retryGift=1: pago GC fallido → reabrir modal gift paso 2
    if (params.get('retryGift') === '1') {
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => Modal.restoreGiftStep2(), 300);
    }
    // retryWompi=1: pago Wompi DECLINED/ERROR → reabrir checkout Wompi con carrito intacto
    if (params.get('retryWompi') === '1') {
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => {
        if (typeof Cart !== 'undefined' && Cart.getItems().length > 0) {
          Modal.openCheckoutWompi();
        }
      }, 300);
    }
  } catch(e) {}
});

// Detectar vuelta desde Wompi vía bfcache (back/forward cache)
// DOMContentLoaded NO se dispara en este caso — pageshow con persisted=true sí
window.addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  try {
    const giftRef = sessionStorage.getItem('mlg_gift_redirect')
                 || localStorage.getItem('mlg_gift_redirect');
    if (giftRef) {
      // Usuario volvió de Wompi sin pagar — no hay fila en Sheets que cancelar (flujo lean).
      try { sessionStorage.removeItem('mlg_gift_redirect'); } catch(e) {}
      try { localStorage.removeItem('mlg_gift_redirect'); }   catch(e) {}
      setTimeout(() => {
        Modal.resetState();
        Modal.restoreGiftStep2(); // restaura paso 2 con botón activo
      }, 150);
      return;
    }
    if (sessionStorage.getItem('mlg_wompi_redirect') === '1') {
      sessionStorage.removeItem('mlg_wompi_redirect');
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
Logger.log('mlg-modal.js cargado ✓');
