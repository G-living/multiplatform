// @version    v3.1  @file ttt-modal.js  @updated 2026-03-15  @session fix-mlg-404-error-aSVYy
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
 *  - Modal Carrito: detalle + [Wishlist WA] + [Pagar Wompi]
 *  - Modal Checkout WA: formulario cliente → WhatsApp + Sheets
 *  - Modal Checkout Wompi: formulario cliente → bono/influencer → Wompi
 * v3.1: Google Places API + Modal Legal (TyC/Datos/Gift Card)
 * ============================================ */

'use strict';

const Modal = (() => {

  // ---- Estado producto ----
  let _product          = null;
  let _catalogList      = [];
  let _productIdx       = 0;
  let _imgList          = [];
  let _imgIdx           = 0;
  let _quantities       = {};
  let _focusTrapCleanup = null;
  let _prevFocus        = null;

  // ---- Estado checkout WA ----
  let _waPedidoId   = '';
  let _waProcessing = false;

  // ---- Estado checkout compartido ----
  let _ckBono       = null;   // { code, available }
  let _ckInfluencer = null;   // { codigo, descuentoPct, comisionPct }
  let _ckSubtotal   = 0;

  // ---- Google Places — instancias activas por inputId ----
  const _pacInstances = {};

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
  // BIND EVENTS
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
      const url   = `${location.origin}${location.pathname}?p=${_product.sku}`;
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

    // Fork carrito → checkout
    document.getElementById('tttBtnWishlist')?.addEventListener('click', () => {
      _closeModal('tttModalCart');
      setTimeout(() => openCheckoutWA(), 200);
    });
    document.getElementById('tttBtnPayment')?.addEventListener('click', () => {
      _closeModal('tttModalCart');
      setTimeout(() => openCheckoutWompi(), 200);
    });

    // ── Checkout WA ──
    document.getElementById('closeCheckoutWA')?.addEventListener('click', () => {
      _resetWAModal();
      _closeModal('modalCheckoutWA');
    });
    document.getElementById('modalCheckoutWAOverlay')?.addEventListener('click', () => {
      _resetWAModal();
      _closeModal('modalCheckoutWA');
    });
    document.getElementById('formCheckoutWA')?.addEventListener('submit', _handleSubmitWA);

    // ── Checkout Wompi ──
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

    document.getElementById('btnPagar60')?.addEventListener('click',   () => _submitWompi('60'));
    document.getElementById('btnPagar100')?.addEventListener('click',  () => _submitWompi('100'));
    document.getElementById('btnPagarGift')?.addEventListener('click', () => _submitConGiftCard());

    // Validación blur en tiempo real — WA
    ['waInputNombre','waInputApellido','waInputEmail','waInputEmailConf','waInputTel',
     'waInputTipoDoc','waInputNumDoc',
     'waInputCumpleDia','waInputCumpleMes','waInputDir','waInputBarrio','waInputCiudad'
    ].forEach(id => {
      document.getElementById(id)?.addEventListener('blur', () => _validateCMOField(id, 'wa'));
    });
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
    document.getElementById('wpInputEmailConf')?.addEventListener('input', () => {
      _validateCMOField('wpInputEmailConf', 'wp');
    });

    // ── Modal Legal ──
    document.getElementById('btnOpenTyCWA')?.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      _openLegal('tplTyC', 'Términos y Condiciones Generales');
    });
    document.getElementById('btnOpenTyC')?.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      _openLegal('tplTyC', 'Términos y Condiciones Generales');
    });
    document.getElementById('btnOpenTyC')?.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); _openLegal('tplTyC', 'Términos y Condiciones Generales'); }
    });
    document.getElementById('btnOpenDatos')?.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
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

    // Escape global — cierra el modal más interno
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (document.getElementById('tttModalZoom')?.classList.contains('is-open'))         { _closeModal('tttModalZoom');           return; }
      if (document.getElementById('tttModalProduct')?.classList.contains('is-open'))      { _closeModal('tttModalProduct');        return; }
      if (document.getElementById('tttModalCart')?.classList.contains('is-open'))         { _closeModal('tttModalCart');           return; }
      if (document.getElementById('modalCheckoutWA')?.classList.contains('is-open'))      { _resetWAModal(); _closeModal('modalCheckoutWA');    return; }
      if (document.getElementById('modalCheckoutWompi')?.classList.contains('is-open'))   { _closeModal('modalCheckoutWompi');     return; }
    });

    // Restaurar modal Wompi si el usuario vuelve con "Regresar" del navegador
    window.addEventListener('pageshow', (e) => {
      if (e.persisted || performance?.getEntriesByType('navigation')[0]?.type === 'back_forward') {
        try {
          const flag = sessionStorage.getItem('ttt_wompi_redirect');
          if (flag) {
            sessionStorage.removeItem('ttt_wompi_redirect');
            Cart.renderCart();
            _openModal('tttModalCart');
          }
        } catch(err) {}
      }
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

    const wrap    = document.querySelector('.ttt-modal-medidas-wrap');
    const content = document.querySelector('.ttt-modal-content');
    if (wrap)    wrap.scrollTop    = 0;
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
  // FOOTER MODAL PRODUCTO
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

  // ═══════════════════════════════════════════════════════
  // MODAL LEGAL
  // ═══════════════════════════════════════════════════════
  function _openLegal(tplId, title) {
    const tpl = document.getElementById(tplId);
    const overlay = document.getElementById('modalLegal');
    const content = document.getElementById('modalLegalContent');
    const titleEl = document.getElementById('modalLegalTitle');
    if (!tpl || !overlay || !content) return;
    if (titleEl) titleEl.textContent = title || 'Información Legal';
    content.innerHTML = '';
    content.appendChild(tpl.content.cloneNode(true));
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function _closeLegal() {
    const overlay = document.getElementById('modalLegal');
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  // ═══════════════════════════════════════════════════════
  // GOOGLE PLACES — widget oficial Autocomplete (Places API New, importLibrary)
  // ═══════════════════════════════════════════════════════
  async function _initPlacesAutocomplete(dirInputId, barrioInputId, ciudadInputId) {
    try {
      await google.maps.importLibrary('places');
    } catch(e) {
      Logger.warn('ttt-modal.js: google.maps.importLibrary no disponible, reintentando…');
      setTimeout(() => _initPlacesAutocomplete(dirInputId, barrioInputId, ciudadInputId), 500);
      return;
    }

    const input = document.getElementById(dirInputId);
    if (!input || input.dataset.pacInit) return;
    input.dataset.pacInit = '1';
    input.setAttribute('autocomplete', 'off');

    const ac = new google.maps.places.Autocomplete(input, {
      componentRestrictions: { country: 'co' },
      fields: ['address_components', 'formatted_address'],
      types:  ['address'],
    });

    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (!place || !place.address_components) {
        Logger.warn('ttt-modal.js: Places place_changed sin address_components');
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

      const dirFormatted = via
        ? via + (numero ? ' # ' + numero : '')
        : (place.formatted_address || '').split(',')[0].trim();
      input.value = dirFormatted;

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

  // ═══════════════════════════════════════════════════════
  // CHECKOUT — OPEN
  // ═══════════════════════════════════════════════════════

  function openCheckoutWA() {
    _populateDias('waInputCumpleDia');
    _ckSubtotal = Cart.getTotal();
    _openModal('modalCheckoutWA');
    _initPlacesAutocomplete('waInputDir', 'waInputBarrio', 'waInputCiudad');
    requestAnimationFrame(() => {
      _loadDraft();
      _bindDraftListeners();
    });
  }

  function openCheckoutWompi() {
    _populateDias('wpInputCumpleDia');
    _ckBono       = null;
    _ckInfluencer = null;
    _ckSubtotal   = Cart.getTotal();
    _updateWompiTotals();
    const btn60  = document.getElementById('btnPagar60');
    const btn100 = document.getElementById('btnPagar100');
    if (btn60)  btn60.disabled  = false;
    if (btn100) btn100.disabled = false;
    _openModal('modalCheckoutWompi');
    _initPlacesAutocomplete('wpInputDir', 'wpInputBarrio', 'wpInputCiudad');
    requestAnimationFrame(() => {
      _loadDraft();
      _bindDraftListeners();
      // Barrio y Ciudad los llena Places Autocomplete al escribir la dirección.
      ['wpInputBarrio', 'wpInputCiudad'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      // Auto-revalidar códigos si el usuario regresa de Wompi con "Regresar"
      const inflInput = document.getElementById('wpInputInfluencer');
      if (inflInput && inflInput.value.trim()) _applyInfluencer();
      const bonoInput = document.getElementById('wpInputBono');
      if (bonoInput && bonoInput.value.trim()) _applyBono();
    });
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

  // ═══════════════════════════════════════════════════════
  // VALIDACIÓN
  // ═══════════════════════════════════════════════════════
  const _CMO_VALIDATORS = {
    email:    v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Email inválido',
    telefono: v => /^\d{9,15}$/.test(v.replace(/[\s\-]/g, '')) || 'Mínimo 9 dígitos',
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
      const mainId = inputId.replace('EmailConf', 'Email');
      const mainEl = document.getElementById(mainId);
      const okEl   = document.getElementById(prefix === 'wa' ? 'waOkEmailConf' : 'wpOkEmailConf');
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
         'waInputTipoDoc','waInputNumDoc','waInputCumpleDia','waInputCumpleMes',
         'waInputDir','waInputBarrio','waInputCiudad']
      : ['wpInputNombre','wpInputApellido','wpInputEmail','wpInputEmailConf','wpInputTel',
         'wpInputTipoDoc','wpInputNumDoc','wpInputCumpleDia','wpInputCumpleMes',
         'wpInputDir','wpInputBarrio','wpInputCiudad'];

    let ok = true;
    fields.forEach(id => { if (!_validateCMOField(id, prefix)) ok = false; });

    // T&C
    const tycId  = prefix === 'wa' ? 'waCheckTyC'  : 'wpCheckTyC';
    const tycErr = prefix === 'wa' ? 'waErrTyC'    : 'wpErrTyC';
    const tyc    = document.getElementById(tycId);
    const tycEl  = document.getElementById(tycErr);
    if (tyc && !tyc.checked) {
      if (tycEl) tycEl.textContent = 'Debes aceptar los términos y condiciones';
      ok = false;
    } else if (tycEl) tycEl.textContent = '';

    // Datos personales
    const datosId  = prefix === 'wa' ? 'waCheckDatos' : 'wpCheckDatos';
    const datosErr = prefix === 'wa' ? 'waErrDatos'   : 'wpErrDatos';
    const datos    = document.getElementById(datosId);
    const datosEl  = document.getElementById(datosErr);
    if (datos && !datos.checked) {
      if (datosEl) datosEl.textContent = 'Debes aceptar el tratamiento de datos personales';
      ok = false;
    } else if (datosEl) datosEl.textContent = '';

    if (!ok) {
      const modalId = prefix === 'wa' ? 'modalCheckoutWA' : 'modalCheckoutWompi';
      const firstErr = document.querySelector(`#${modalId} .cmo-input-error, #${modalId} .cmo-error:not(:empty)`);
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return ok;
  }

  // ═══════════════════════════════════════════════════════
  // PERSISTENCIA FORMULARIO — localStorage indefinido
  // Draft compartido entre modal WA (wa*) y Wompi (wp*)
  // ═══════════════════════════════════════════════════════
  const _DRAFT_KEY = 'ttt_checkout_draft';

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
        nombre:      _draftRead('wpInputNombre',   'waInputNombre'),
        apellido:    _draftRead('wpInputApellido', 'waInputApellido'),
        email:       _draftRead('wpInputEmail',    'waInputEmail'),
        emailConf:   _draftRead('wpInputEmailConf','waInputEmailConf'),
        codPais:     _draftRead('wpInputCodPais',  'waInputCodPais'),
        tel:         _draftRead('wpInputTel',      'waInputTel'),
        tipoDoc:     _draftRead('wpInputTipoDoc',  'waInputTipoDoc'),
        numDoc:      _draftRead('wpInputNumDoc',   'waInputNumDoc'),
        cumpleDia:   _draftRead('wpInputCumpleDia','waInputCumpleDia'),
        cumpleMes:   _draftRead('wpInputCumpleMes','waInputCumpleMes'),
        dir:         _draftRead('wpInputDir',      'waInputDir'),
        barrio:      _draftRead('wpInputBarrio',   'waInputBarrio'),
        ciudad:      _draftRead('wpInputCiudad',   'waInputCiudad'),
        notas:       _draftRead('wpInputNotas',    'waInputNotas'),
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

      const s = (val, ...ids) => {
        if (!val) return;
        ids.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.value = val;
        });
      };
      s(draft.nombre,    'wpInputNombre',   'waInputNombre');
      s(draft.apellido,  'wpInputApellido', 'waInputApellido');
      s(draft.email,     'wpInputEmail',    'waInputEmail');
      s(draft.emailConf, 'wpInputEmailConf','waInputEmailConf');
      s(draft.codPais,   'wpInputCodPais',  'waInputCodPais');
      s(draft.tel,       'wpInputTel',      'waInputTel');
      s(draft.tipoDoc,   'wpInputTipoDoc',  'waInputTipoDoc');
      s(draft.numDoc,    'wpInputNumDoc',   'waInputNumDoc');
      s(draft.cumpleDia, 'wpInputCumpleDia','waInputCumpleDia');
      s(draft.cumpleMes, 'wpInputCumpleMes','waInputCumpleMes');
      s(draft.dir,       'wpInputDir',      'waInputDir');
      s(draft.barrio,    'wpInputBarrio',   'waInputBarrio');
      s(draft.ciudad,    'wpInputCiudad',   'waInputCiudad');
      s(draft.notas,     'wpInputNotas',    'waInputNotas');

      // Radios tipo persona
      ['wp', 'wa'].forEach(p => {
        if (draft.tipoPersona) {
          const radio = document.querySelector(`input[name="${p}InputTipoPersona"][value="${draft.tipoPersona}"]`);
          if (radio) radio.checked = true;
        }
      });

      // Email coincide → mostrar ✓
      if (draft.email && draft.email === draft.emailConf) {
        ['wpOkEmailConf', 'waOkEmailConf'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.style.display = 'block';
        });
      }
    } catch(e) {}
  }

  function _bindDraftListeners() {
    const campos = [
      'wpInputNombre','wpInputApellido','wpInputEmail','wpInputEmailConf',
      'wpInputCodPais','wpInputTel','wpInputTipoDoc','wpInputNumDoc',
      'wpInputCumpleDia','wpInputCumpleMes','wpInputDir','wpInputBarrio',
      'wpInputCiudad','wpInputNotas',
      'waInputNombre','waInputApellido','waInputEmail','waInputEmailConf',
      'waInputCodPais','waInputTel','waInputTipoDoc','waInputNumDoc',
      'waInputCumpleDia','waInputCumpleMes','waInputDir','waInputBarrio',
      'waInputCiudad','waInputNotas',
    ];
    campos.forEach(id => {
      const el = document.getElementById(id);
      if (!el || el.dataset.draftBound) return;
      el.dataset.draftBound = '1';
      el.addEventListener('input', _saveDraft);
      if (el.tagName === 'SELECT') el.addEventListener('change', _saveDraft);
    });
    ['wpInputTipoPersona', 'waInputTipoPersona'].forEach(name => {
      document.querySelectorAll(`input[name="${name}"]`).forEach(r => {
        if (!r.dataset.draftBound) {
          r.dataset.draftBound = '1';
          r.addEventListener('change', _saveDraft);
        }
      });
    });
  }

  // ═══════════════════════════════════════════════════════
  // RECOLECTAR DATOS DEL FORMULARIO
  // ═══════════════════════════════════════════════════════
  function _collectCMO(prefix) {
    const g  = id => document.getElementById(id)?.value.trim() || '';
    const p  = prefix === 'wa' ? 'wa' : 'wp';
    const metodo = 'domicilio'; // siempre domicilio

    return {
      cliente: {
        nombre:      g(`${p}InputNombre`),
        apellido:    g(`${p}InputApellido`),
        email:       g(`${p}InputEmail`),
        codigoPais:  g(`${p}InputCodPais`) || '+57',
        telefono:    g(`${p}InputTel`),
        tipoDoc:     g(`${p}InputTipoDoc`),
        numDoc:      g(`${p}InputNumDoc`),
        cumpleDia:   g(`${p}InputCumpleDia`),
        cumpleMes:   g(`${p}InputCumpleMes`),
        referralCode: '',
      },
      entrega: {
        metodo,
        direccion: g(`${p}InputDir`),
        barrio:    g(`${p}InputBarrio`),
        ciudad:    g(`${p}InputCiudad`),
        notas:     g(`${p}InputNotas`),
      },
      formaPago: g(`${p}InputFormaPago`) || 'WA_WISHLIST',
    };
  }

  // ═══════════════════════════════════════════════════════
  // RESET MODAL WA
  // ═══════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════
  // SUBMIT WHATSAPP / WISHLIST
  // ═══════════════════════════════════════════════════════
  async function _handleSubmitWA(e) {
    e.preventDefault();
    if (_waProcessing) return;
    if (!_validateCMOForm('wa')) return;

    _waProcessing = true;
    const btn = document.getElementById('btnSubmitWA');
    if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }

    const data  = _collectCMO('wa');
    const items = Cart.getItems();
    const total = Cart.getTotal();

    // Generar referencia ANTES del await (browsers bloquean window.open tras await)
    _waPedidoId = 'WA-TTT-' + Date.now();

    // Construir mensaje WA
    const lines = items.map(i =>
      `• ${i.productName}${i.medida ? ' · ' + i.medida : ''} (${i.sku}) × ${i.quantity} → ${Utils.formatPrice(i.precio * i.quantity)}`
    );
    const msgTemp = [
      `🧺 *Lista de deseos TTT — Tessitura Toscana Telerie*`,
      `Ref: ${_waPedidoId}`,
      ``,
      `*Cliente:* ${data.cliente.nombre} ${data.cliente.apellido}`,
      `*Email:* ${data.cliente.email}`,
      `*Tel:* ${data.cliente.codigoPais} ${data.cliente.telefono}`,
      ``,
      ...lines,
      ``,
      `*Total estimado: ${Utils.formatPrice(total)}*`,
      ``,
      `Hola, me interesan estas piezas importadas desde Toscana. ¿Pueden confirmar disponibilidad y condiciones de envío?`,
    ].join('\n');

    const waUrl = `https://wa.me/${TTT_CONFIG.brand.phone.replace('+', '')}?text=${encodeURIComponent(msgTemp)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // POST a Sheets (sin bloquear la UX)
    let clienteId = '';
    try {
      const result = await Api.createWishlist(data, items, {
        subtotal:   total,
        descuento:  0,
        total,
        referencia: _waPedidoId,
      });
      if (result.ok) clienteId = result.clienteId || '';
      else Logger.warn('ttt-modal.js: createWishlist error', result.error);
    } catch(err) {
      Logger.warn('ttt-modal.js: error POST wishlist', err);
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
    if (!btnConfirmOld || !btnCloseOld) {
      if (btn) { btn.disabled = false; btn.innerHTML = 'Enviar por WhatsApp'; }
      return;
    }
    const btnConfirm = btnConfirmOld.cloneNode(true);
    const btnClose   = btnCloseOld.cloneNode(true);
    btnConfirm.dataset.pedidoId = _waPedidoId;
    btnConfirmOld.parentNode.replaceChild(btnConfirm, btnConfirmOld);
    btnCloseOld.parentNode.replaceChild(btnClose, btnCloseOld);

    btnConfirm.disabled = false;
    btnConfirm.innerHTML = '✓ Sí, ya lo envié';
    btnClose.disabled = false;

    // "Sí, ya lo envié"
    btnConfirm.addEventListener('click', async () => {
      const ref = btnConfirm.dataset.pedidoId || _waPedidoId;
      btnConfirm.disabled = true;
      btnConfirm.textContent = 'Confirmando…';
      try {
        await Api.updateEstadoWishlist(ref, 'ENVIADO_WA');
      } catch(err) {
        Logger.warn('ttt-modal.js: error updateEstadoWishlist', err);
      }
      _waPedidoId   = '';
      _waProcessing = false;
      Cart.clear();
      _closeModal('modalCheckoutWA');
      _closeModal('tttModalCart');
      document.getElementById('formCheckoutWA')?.reset();
      if (form)          form.style.display = '';
      if (confirmScreen) confirmScreen.style.display = 'none';
      Toast.show('¡Lista enviada por WhatsApp! ✓', 'success');
    });

    // "Cerrar sin confirmar"
    btnClose.addEventListener('click', () => {
      _waPedidoId   = '';
      Cart.clear();
      _closeModal('modalCheckoutWA');
      _closeModal('tttModalCart');
      document.getElementById('formCheckoutWA')?.reset();
      if (form)          form.style.display = '';
      if (confirmScreen) confirmScreen.style.display = 'none';
    });

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>Enviar por WhatsApp`;
    }
  }

  // ═══════════════════════════════════════════════════════
  // BONO — validar y aplicar
  // ═══════════════════════════════════════════════════════
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
        if (errEl)  errEl.textContent = data.reason || 'Código inválido';
        if (succEl) succEl.style.display = 'none';
      }
    } catch(err) {
      if (errEl) errEl.textContent = 'Error al verificar. Intenta de nuevo.';
      Logger.warn('ttt-modal.js: error validando bono', err);
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

  // ═══════════════════════════════════════════════════════
  // INFLUENCER — validar y aplicar
  // ═══════════════════════════════════════════════════════
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
        if (errEl)  errEl.textContent = data.reason || 'Código inválido';
        if (succEl) succEl.style.display = 'none';
      }
    } catch(err) {
      if (errEl) errEl.textContent = 'Error al verificar. Intenta de nuevo.';
      Logger.warn('ttt-modal.js: error validando influencer', err);
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

  // ═══════════════════════════════════════════════════════
  // TOTALES WOMPI
  // Orden: subtotal → −infl% → −bono/GC → Total a Pagar
  // El 3% va SOLO en el monto del botón 100%, no en el recuadro
  // ═══════════════════════════════════════════════════════
  function _updateWompiTotals() {
    const cfg      = TTT_CONFIG.checkout;
    const subtotal = Utils.roundCOP(_ckSubtotal);

    const inflPct   = _ckInfluencer ? (_ckInfluencer.descuentoPct / 100) : 0;
    const discInfl  = _ckInfluencer ? Math.floor(subtotal * inflPct / 1000) * 1000 : 0;
    const afterInfl = subtotal - discInfl;
    const bonoDesc  = _ckBono ? Math.min(_ckBono.available || 0, afterInfl) : 0;
    const totalPagar = afterInfl - bonoDesc;

    const disc100 = Math.floor(totalPagar * cfg.discountPayFull / 1000) * 1000;
    const pay100  = totalPagar - disc100;
    const pay60   = Math.floor(totalPagar * 0.6 / 1000) * 1000;

    // Subtotal
    const subEl = document.getElementById('wpValSubtotal');
    if (subEl) subEl.textContent = Utils.formatPrice(subtotal);

    // Línea campaña (descuento presale — oculta si no aplica)
    const campLine  = document.getElementById('wpLineCampania');
    const campLabel = document.getElementById('wpLabelCampania');
    const campVal   = document.getElementById('wpValCampania');
    const descPct   = Campania.descuentoPct();
    if (descPct > 0 && campLine) {
      const ahorro = Utils.roundCOP(Cart.getItems().reduce((s, i) => {
        const orig = i.precioOriginal || i.precio;
        return s + (orig - i.precio) * i.quantity;
      }, 0));
      if (ahorro > 0) {
        campLine.style.display = 'flex';
        if (campLabel) campLabel.textContent = `Presale −${descPct}%`;
        if (campVal)   campVal.textContent   = '− ' + Utils.formatPrice(ahorro);
      } else if (campLine) campLine.style.display = 'none';
    } else if (campLine) campLine.style.display = 'none';

    // Línea influencer
    const inflLine  = document.getElementById('wpLineInfluencer');
    const inflLabel = document.getElementById('wpLabelInfluencer');
    const inflVal   = document.getElementById('wpValInfluencer');
    if (inflLine) inflLine.style.display = discInfl > 0 ? 'flex' : 'none';
    if (inflLabel && _ckInfluencer) inflLabel.textContent = `Descuento ${_ckInfluencer.descuentoPct}% influencer`;
    if (inflVal)  inflVal.textContent = '− ' + Utils.formatPrice(discInfl);

    // Línea bono/GC
    const bonoLine = document.getElementById('wpLineBono');
    const bonoVal  = document.getElementById('wpValBono');
    if (bonoLine) bonoLine.style.display = bonoDesc > 0 ? 'flex' : 'none';
    if (bonoVal)  bonoVal.textContent = '− ' + Utils.formatPrice(bonoDesc);

    // Línea Total a pagar
    const anyDiscount = discInfl > 0 || bonoDesc > 0;
    const totalFinalLine = document.getElementById('wpLineTotalFinal');
    const totalFinalVal  = document.getElementById('wpValTotalFinal');
    if (anyDiscount) {
      if (totalFinalLine) totalFinalLine.style.display = 'flex';
      if (totalFinalVal)  totalFinalVal.textContent = Utils.formatPrice(totalPagar);
    } else {
      if (totalFinalLine) totalFinalLine.style.display = 'none';
    }

    // Bono cubre el total → botón Gift Card, sin Wompi
    const bonoCobreTotal = totalPagar <= 0;
    const wpPayActions   = document.getElementById('wpPayActions');
    const wpPayGift      = document.getElementById('wpPayGift');
    const tipEl          = document.getElementById('wpTipAnticipado');

    if (bonoCobreTotal) {
      if (wpPayActions) wpPayActions.style.display = 'none';
      if (wpPayGift)    wpPayGift.style.display    = 'block';
      if (tipEl)        tipEl.style.display        = 'none';
      if (totalFinalLine) totalFinalLine.style.display = 'flex';
      if (totalFinalVal)  totalFinalVal.textContent    = Utils.formatPrice(0);
      const giftAmtEl = document.getElementById('wpAmountGift');
      if (giftAmtEl) giftAmtEl.textContent = 'Total: $0 — Cubierto por Gift Card';
    } else {
      if (wpPayActions) wpPayActions.style.display = 'flex';
      if (wpPayGift)    wpPayGift.style.display    = 'none';
      if (tipEl)        tipEl.style.display        = 'block';
      const btn60El  = document.getElementById('wpAmount60');
      const btn100El = document.getElementById('wpAmount100');
      if (btn60El)  btn60El.textContent  = Utils.formatPrice(pay60);
      if (btn100El) btn100El.textContent = Utils.formatPrice(pay100) + '  —  3% dto. incl.';
    }
  }

  // ═══════════════════════════════════════════════════════
  // SUBMIT WOMPI
  // ═══════════════════════════════════════════════════════
  async function _submitWompi(pct) {
    if (!_validateCMOForm('wp')) return;

    const btn60  = document.getElementById('btnPagar60');
    const btn100 = document.getElementById('btnPagar100');
    if (btn60)  { btn60.disabled  = true; btn60.innerHTML  = '<span class="cmo-btn-pago-label">Pago Anticipo 60%</span><span class="cmo-btn-pago-amount" id="wpAmount60">Procesando…</span>'; }
    if (btn100) { btn100.disabled = true; btn100.innerHTML = '<span class="cmo-btn-pago-label">Pago Anticipado 100%</span><span class="cmo-btn-pago-amount" id="wpAmount100">Procesando…</span>'; }
    const errGenEl = document.getElementById('wpErrGeneral');
    if (errGenEl) errGenEl.style.display = 'none';

    const data       = _collectCMO('wp');
    const items      = Cart.getItems();
    const subtotal   = _ckSubtotal;
    const cfg        = TTT_CONFIG.checkout;

    // Fórmula idéntica a _updateWompiTotals
    const inflPct    = _ckInfluencer ? (_ckInfluencer.descuentoPct / 100) : 0;
    const discInfl   = _ckInfluencer ? Math.floor(subtotal * inflPct / 1000) * 1000 : 0;
    const afterInfl  = subtotal - discInfl;
    const bonoDesc   = _ckBono ? Math.min(_ckBono.available || 0, afterInfl) : 0;
    const totalPagar = afterInfl - bonoDesc;
    const disc100raw = pct === '100' ? Math.floor(totalPagar * cfg.discountPayFull / 1000) * 1000 : 0;
    const total      = pct === '60'  ? Math.floor(totalPagar * 0.6 / 1000) * 1000 : totalPagar - disc100raw;
    const descuento  = discInfl + bonoDesc + disc100raw;
    const amountCents = total * 100;

    const reference = `WP-TTT-${Date.now()}`;

    const formaPago = _ckBono?.code
      ? (pct === '60' ? 'WOMPI_60' : 'WOMPI_100') + '+GIFT:' + _ckBono.code
      : (pct === '60' ? 'WOMPI_60' : 'WOMPI_100');

    const _pendingPayload = JSON.stringify({
      formaPago,
      subtotal, descuento, total,
      porcentajePagado:  pct === '60' ? 60 : 100,
      referencia:        reference,
      cliente:           data.cliente,
      entrega:           data.entrega,
      productos:         items,
      bono:              _ckBono
        ? { code: _ckBono.code, monto: bonoDesc, available: _ckBono.available }
        : null,
      influencerCodigo:  _ckInfluencer?.codigo       || null,
      influencerBase:    _ckInfluencer ? subtotal     : 0,
      influencerPct:     _ckInfluencer?.descuentoPct  || 0,
      discInfluencer:    discInfl,
      discGiftCard:      bonoDesc,
      disc3pct:          disc100raw,
      totalAPagar:       totalPagar,
      campaniaId:        TTT_CONFIG?.campania?.id  || '',
      catalogoId:        TTT_CONFIG?.catalogo?.id  || '',
    });
    try { sessionStorage.setItem('ttt_pending_pedido', _pendingPayload); } catch(e) { Logger.warn('ttt-modal.js: sessionStorage write error', e); }
    try { localStorage.setItem('ttt_pending_pedido',   _pendingPayload); } catch(e) { Logger.warn('ttt-modal.js: localStorage write error', e); }

    // Obtener firma Wompi
    let signature = null;
    if (cfg.signatureWorkerUrl) {
      try {
        const resp = await fetch(cfg.signatureWorkerUrl, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ reference, amountInCents: amountCents, currency: cfg.currency, apiToken: cfg.apiToken }),
        });
        if (resp.ok) {
          const r = await resp.json();
          signature = r.integritySignature || null;
        }
      } catch(err) {
        Logger.warn('ttt-modal.js: error firma Wompi', err);
      }
    }

    if (!signature) {
      _updateWompiTotals();
      if (btn60)  btn60.disabled  = false;
      if (btn100) btn100.disabled = false;
      if (errGenEl) {
        errGenEl.textContent = 'Error al conectar con el procesador de pagos. Por favor intenta de nuevo.';
        errGenEl.style.display = 'block';
      }
      return;
    }

    // Redirigir a Wompi
    const params = new URLSearchParams({
      'public-key':      cfg.wompiPublicKey,
      'currency':        cfg.currency,
      'amount-in-cents': amountCents,
      'reference':       reference,
      'redirect-url':    cfg.checkoutUrl,
    });
    if (signature)             params.set('signature:integrity', signature);
    if (data.cliente.nombre)   params.set('customer-data:full-name',    `${data.cliente.nombre} ${data.cliente.apellido}`);
    if (data.cliente.email)    params.set('customer-data:email',        data.cliente.email);
    if (data.cliente.telefono) params.set('customer-data:phone-number', `${data.cliente.codigoPais}${data.cliente.telefono}`);

    Logger.log('ttt-modal.js: redirigiendo a Wompi', { reference, amountCents, pct });
    try { sessionStorage.removeItem('ttt_gift_redirect'); } catch(e) {}
    try { sessionStorage.setItem('ttt_wompi_redirect', '1'); } catch(e) {}
    window.location.href = `${cfg.wompiCheckoutUrl}?${params.toString()}`;
  }

  // ═══════════════════════════════════════════════════════
  // PAGO COMPLETO CON GIFT CARD (bono ≥ total)
  // ═══════════════════════════════════════════════════════
  async function _submitConGiftCard() {
    if (!_validateCMOForm('wp')) return;

    const btn = document.getElementById('btnPagarGift');
    if (btn) { btn.disabled = true; btn.textContent = 'Procesando…'; }

    const data     = _collectCMO('wp');
    const items    = Cart.getItems();
    const subtotal = _ckSubtotal;

    const inflPct2   = _ckInfluencer ? (_ckInfluencer.descuentoPct / 100) : 0;
    const discInfl2  = _ckInfluencer ? Math.floor(subtotal * inflPct2 / 1000) * 1000 : 0;
    const afterInfl2 = subtotal - discInfl2;
    const bonoActual = afterInfl2; // GC cubre el total tras el descuento influencer
    const totalFinal = 0;

    const reference = `WP-TTT-${Date.now()}`;

    const _pendingGiftPayload = JSON.stringify({
      formaPago:        _ckBono?.code ? `GIFT_CARD:${_ckBono.code}` : 'GIFT_CARD',
      subtotal,
      descuento:        discInfl2 + bonoActual,
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
      totalAPagar:      0,
      campaniaId:       TTT_CONFIG?.campania?.id || '',
      catalogoId:       TTT_CONFIG?.catalogo?.id || '',
    });
    try { sessionStorage.setItem('ttt_pending_pedido', _pendingGiftPayload); } catch(e) {}
    try { localStorage.setItem('ttt_pending_pedido',   _pendingGiftPayload); } catch(e) {}

    Logger.log('ttt-modal.js: gift card lean — payload guardado, redirigiendo', reference);
    window.location.href = `ttt-checkout.html?reference=${encodeURIComponent(reference)}&transaction_status=APPROVED&giftPaid=1`;
  }

  // -------------------------------------------------------
  // INIT
  // -------------------------------------------------------
  document.addEventListener('DOMContentLoaded', _bindEvents);

  // -------------------------------------------------------
  // API PÚBLICA
  // -------------------------------------------------------
  return {
    openProduct,
    openCart,
    openZoom,
    openCheckoutWA,
    openCheckoutWompi,
  };

})();

window.Modal = Modal;
Logger.log('ttt-modal.js v3.1 cargado ✓');
