// @version    v1.0  @file modal-mlg.js  @updated 2026-03-08
/* ===== MLG MODAL =====
 * Layout confirmado (prototipo aprobado):
 *
 *  ┌─────────────────────────────────────────────┐
 *  │  FAMILIA                     N/total  ← →   │
 *  ├─────────────────────────────────────────────┤
 *  │        [FOTO GRANDE — header]                │
 *  │        Modelo — descripción                  │
 *  │        dim 1 × dim 2 cm (comp)              │
 *  ├──────┬──────────────────────┬──────┬────────┤
 *  │ mini │ color · SKU          │ −1+  │  $COP  │
 *  │ mini │ color · SKU          │ −1+  │  $COP  │
 *  ├─────────────────────────────────────────────┤
 *  │  [Agregar al carrito — $TOTAL]              │
 *  └─────────────────────────────────────────────┘
 *
 * Navegación: ← → entre MODELOS de la misma familia.
 * Click miniatura → foto grande sube al header.
 * Precio COP via Utils.precioCOPmlg(precio_eur).
 * ============================================ */
'use strict';

const ModalMlg = (() => {

  // ── Estado ──────────────────────────────────────────────
  let _currentFamily  = null;
  let _familyModelos  = [];   // array de nombres de modelo únicos de la familia
  let _modeloIdx      = 0;    // índice del modelo visible
  let _currentItems   = [];   // productos del modelo actual (distintos tamaños)
  let _quantities     = {};   // { sku: qty }
  let _focusTrapCleanup = null;
  let _prevFocus = null;

  // ── Helpers apertura/cierre ──────────────────────────────
  function _open() {
    const modal = document.getElementById('modalMlg');
    if (!modal) return;
    _prevFocus = document.activeElement;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    const content = modal.querySelector('.modal-content');
    if (content) {
      if (_focusTrapCleanup) _focusTrapCleanup();
      try { _focusTrapCleanup = A11y.trapFocus(content); } catch { _focusTrapCleanup = null; }
    }
  }

  function _close() {
    const modal = document.getElementById('modalMlg');
    if (!modal) return;
    modal.classList.remove('is-open');
    if (!document.querySelector('.modal.is-open')) document.body.style.overflow = '';
    if (_focusTrapCleanup) { _focusTrapCleanup(); _focusTrapCleanup = null; }
    if (_prevFocus) { _prevFocus.focus(); _prevFocus = null; }
  }

  // ── Apertura por familia ─────────────────────────────────
  function openFamily(familyName) {
    if (!familyName || typeof CatalogMlg === 'undefined') return;

    _currentFamily = familyName;
    _quantities    = {};

    // Obtener todos los productos de la familia y agrupar por modelo
    const allProds = CatalogMlg.getProductsByFamily(familyName);
    // Extraer modelos únicos manteniendo orden de aparición
    const seenModelos = new Set();
    _familyModelos = [];
    allProds.forEach(p => {
      if (!seenModelos.has(p.modelo)) {
        seenModelos.add(p.modelo);
        _familyModelos.push(p.modelo);
      }
    });

    _modeloIdx = 0;
    _loadModelo();
    _open();
  }

  // ── Cargar modelo actual ─────────────────────────────────
  function _loadModelo() {
    const modelo = _familyModelos[_modeloIdx];
    if (!modelo) return;

    _currentItems = CatalogMlg.getProductsByModelo(modelo)
      .filter(p => p.familia === _currentFamily);

    // Inicializar cantidades en 0
    _currentItems.forEach(p => {
      if (_quantities[p.sku] === undefined) _quantities[p.sku] = 0;
    });

    _renderModal();
  }

  // ── Render completo del modal ────────────────────────────
  function _renderModal() {
    const modelo = _familyModelos[_modeloIdx];
    const total  = _familyModelos.length;
    const pos    = _modeloIdx + 1;

    // ── Cabecera: familia + contador + flechas
    const famEl = document.getElementById('mlgModalFamily');
    if (famEl) famEl.textContent = _currentFamily;

    const ctrEl = document.getElementById('mlgModalCounter');
    if (ctrEl) ctrEl.textContent = pos + '/' + total;

    const prevBtn = document.getElementById('mlgModalPrev');
    const nextBtn = document.getElementById('mlgModalNext');
    if (prevBtn) prevBtn.disabled = (_modeloIdx === 0);
    if (nextBtn) nextBtn.disabled = (_modeloIdx === total - 1);

    // ── Foto principal: primer item con imagen real
    const firstReal = _currentItems.find(p => !p.placeholder) || _currentItems[0];
    const mainImg = document.getElementById('mlgMainImage');
    if (mainImg && firstReal) {
      mainImg.src = firstReal.image;
      mainImg.alt = firstReal.name;
      mainImg.onerror = () => {
        mainImg.onerror = null;
        mainImg.src = IMOLARTE_CONFIG.mlg.images.placeholder;
      };
    }

    // ── Nombre modelo y composición
    const nameEl = document.getElementById('mlgModalName');
    if (nameEl) nameEl.textContent = modelo;

    // Composición: tomar del primer item (comp)
    const compEl = document.getElementById('mlgModalComp');
    if (compEl) {
      const comp = firstReal?.comp || '';
      compEl.textContent = comp;
      compEl.style.display = comp ? '' : 'none';
    }

    // ── Tabla de variantes (un ítem = una fila)
    _renderRows();

    // ── Botón agregar
    _updateAddBtn();
  }

  // ── Renderizar filas de variantes ────────────────────────
  function _renderRows() {
    const tbody = document.getElementById('mlgVariantRows');
    if (!tbody) return;

    tbody.innerHTML = _currentItems.map(p => {
      const precioCOP = Utils.precioCOPmlg(p.precio_eur);
      const qty       = _quantities[p.sku] || 0;
      const subtotal  = precioCOP * qty;
      const imgSrc    = p.placeholder
        ? IMOLARTE_CONFIG.mlg.images.placeholder
        : p.image;

      return `
        <tr class="mlg-variant-row" data-sku="${p.sku}">
          <td class="mlg-vrow-img">
            <img
              src="${imgSrc}"
              alt="${Utils.sanitize(p.name)}"
              class="mlg-mini-thumb"
              data-full="${imgSrc}"
              onerror="this.src='${IMOLARTE_CONFIG.mlg.images.placeholder}'"
            >
          </td>
          <td class="mlg-vrow-info">
            <span class="mlg-vrow-name">${Utils.sanitize(p.name)}</span>
            <span class="mlg-vrow-sku">${Utils.sanitize(p.sku)}</span>
          </td>
          <td class="mlg-vrow-price">${Utils.formatPrice(precioCOP)}</td>
          <td class="mlg-vrow-qty">
            <div class="mlg-qty-ctrl">
              <button class="qty-btn" data-action="dec" data-sku="${p.sku}" aria-label="Reducir">−</button>
              <span class="qty-display" id="mlgQty-${p.sku}">${qty}</span>
              <button class="qty-btn" data-action="inc" data-sku="${p.sku}" aria-label="Aumentar">+</button>
            </div>
          </td>
          <td class="mlg-vrow-sub" id="mlgSub-${p.sku}">${Utils.formatPrice(subtotal)}</td>
        </tr>`;
    }).join('');
  }

  // ── Actualizar una fila tras cambio de cantidad ──────────
  function _updateRow(sku) {
    const qty     = _quantities[sku] || 0;
    const item    = _currentItems.find(p => p.sku === sku);
    const qtyEl   = document.getElementById('mlgQty-' + sku);
    const subEl   = document.getElementById('mlgSub-' + sku);
    if (qtyEl) qtyEl.textContent = qty;
    if (subEl && item) subEl.textContent = Utils.formatPrice(Utils.precioCOPmlg(item.precio_eur) * qty);
  }

  // ── Botón agregar al carrito ─────────────────────────────
  function _updateAddBtn() {
    const btn = document.getElementById('mlgBtnAdd');
    if (!btn) return;
    const total = _calcTotal();
    const totalQty = Object.values(_quantities).reduce((s, q) => s + q, 0);
    if (totalQty > 0) {
      btn.disabled  = false;
      btn.textContent = 'Agregar al carrito — ' + Utils.formatPrice(total);
    } else {
      btn.disabled  = true;
      btn.textContent = 'Selecciona al menos un ítem';
    }
  }

  function _calcTotal() {
    return _currentItems.reduce((sum, p) => {
      return sum + Utils.precioCOPmlg(p.precio_eur) * (_quantities[p.sku] || 0);
    }, 0);
  }

  // ── Agregar al carrito compartido ───────────────────────
  function _addToCart() {
    if (typeof Cart === 'undefined') {
      Logger.warn('modal-mlg.js: Cart no disponible');
      return;
    }
    let added = 0;
    _currentItems.forEach(p => {
      const qty = _quantities[p.sku] || 0;
      if (qty <= 0) return;
      Cart.addItem({
        productId:   p.id,
        productName: p.name,
        sku:         p.sku,
        price:       Utils.precioCOPmlg(p.precio_eur),
        quantity:    qty,
        image:       p.image,
        variant:     { name: p.modelo, size: '' },
        catalog:     'mlg',
      });
      added++;
    });
    if (added > 0) {
      _close();
      Toast.show('Agregado al carrito ✓', 'success');
    }
  }

  // ── Bind eventos ────────────────────────────────────────
  function _bindEvents() {
    // Cerrar con X o backdrop
    document.getElementById('mlgModalClose')
      ?.addEventListener('click', _close);
    document.getElementById('modalMlg')
      ?.addEventListener('click', e => {
        if (e.target === e.currentTarget) _close();
      });

    // Flechas navegación
    document.getElementById('mlgModalPrev')
      ?.addEventListener('click', () => {
        if (_modeloIdx > 0) { _modeloIdx--; _loadModelo(); }
      });
    document.getElementById('mlgModalNext')
      ?.addEventListener('click', () => {
        if (_modeloIdx < _familyModelos.length - 1) { _modeloIdx++; _loadModelo(); }
      });

    // Teclado: ← →, Esc
    document.addEventListener('keydown', e => {
      const modal = document.getElementById('modalMlg');
      if (!modal?.classList.contains('is-open')) return;
      if (e.key === 'Escape') _close();
      if (e.key === 'ArrowLeft')  { if (_modeloIdx > 0) { _modeloIdx--; _loadModelo(); } }
      if (e.key === 'ArrowRight') { if (_modeloIdx < _familyModelos.length - 1) { _modeloIdx++; _loadModelo(); } }
    });

    // Click en miniatura → foto grande
    document.getElementById('mlgVariantRows')
      ?.addEventListener('click', e => {
        const thumb = e.target.closest('.mlg-mini-thumb');
        if (!thumb) return;
        const mainImg = document.getElementById('mlgMainImage');
        if (mainImg && thumb.dataset.full) {
          mainImg.classList.add('is-fading');
          setTimeout(() => {
            mainImg.src = thumb.dataset.full;
            mainImg.classList.remove('is-fading');
          }, 180);
        }
      });

    // Qty buttons en filas (delegación)
    document.getElementById('mlgVariantRows')
      ?.addEventListener('click', e => {
        const btn = e.target.closest('.qty-btn');
        if (!btn) return;
        const sku    = btn.dataset.sku;
        const action = btn.dataset.action;
        if (!sku || !action) return;
        const current = _quantities[sku] || 0;
        if (action === 'dec') _quantities[sku] = Math.max(0, current - 1);
        if (action === 'inc') _quantities[sku] = Math.min(IMOLARTE_CONFIG.cart.maxQuantity, current + 1);
        _updateRow(sku);
        _updateAddBtn();
      });

    // Botón agregar
    document.getElementById('mlgBtnAdd')
      ?.addEventListener('click', _addToCart);
  }

  function init() {
    _bindEvents();
    Logger.log('modal-mlg.js inicializado ✓');
  }

  return { init, openFamily, close: _close };

})();

document.addEventListener('DOMContentLoaded', () => { ModalMlg.init(); });
window.ModalMlg = ModalMlg;
Logger.log('modal-mlg.js cargado ✓');
