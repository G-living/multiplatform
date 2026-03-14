// @version    v1.0  @file ttt-catalog.js  @updated 2026-03-14  @session fix-mlg-404-error-aSVYy
/* ===== TTT - ttt-catalog.js =====
 * Grid de productos TTT (490 grouped products)
 * Cada card = un producto (patron + categoria)
 * Filtros: zona, categoria, búsqueda por nombre
 * Click → Modal.openProduct(product)
 * ============================================ */

'use strict';

const Catalog = (() => {

  const GRID_ID   = 'productsGrid';
  const ROTATE_MS = 8000;  // rotar foto cada 8s

  let _all      = [];   // TTT_PRODUCTS completo
  let _filtered = [];   // productos visibles tras filtros
  let _rotTimers = {};  // { sku: intervalId }

  // Filtros activos
  let _fZona = '';
  let _fCat  = '';
  let _fText = '';

  // -------------------------------------------------------
  // INIT
  // -------------------------------------------------------
  function init() {
    const grid = document.getElementById(GRID_ID);
    if (!grid) { Logger.error('ttt-catalog.js: #productsGrid no encontrado'); return; }

    _all = window.TTT_PRODUCTS || [];

    if (_all.length === 0) {
      _renderEmpty(grid);
      Logger.warn('ttt-catalog.js: TTT_PRODUCTS vacío');
      return;
    }

    _buildFilters();
    _applyFilters();
    _render(grid);
    _bindFilterEvents();

    Logger.log(`ttt-catalog.js: ${_all.length} productos cargados ✓`);

    // Cargar campaña → refrescar badges si hay descuento
    Campania.cargar().then(() => {
      if (Campania.activa()) {
        _renderPresaleBadges();
        Logger.log(`ttt-catalog.js: badges presale ${Campania.descuentoPct()}% aplicados`);
      }
    });

    // Deep-link: ?p=SKU → abre modal directo
    const pSku = new URLSearchParams(location.search).get('p');
    if (pSku) {
      const prod = _all.find(p => p.sku === pSku);
      if (prod && window.Modal?.openProduct) {
        requestAnimationFrame(() => Modal.openProduct(prod));
      }
    }
  }

  // -------------------------------------------------------
  // FILTROS
  // -------------------------------------------------------
  function _buildFilters() {
    // Poblar select de categorias únicas
    const catSelect = document.getElementById('filterCat');
    if (!catSelect) return;

    const zonas = [...new Set(_all.map(p => p.zona).filter(Boolean))].sort();
    const cats  = [...new Set(_all.map(p => p.categoria).filter(Boolean))].sort();

    const zonaSelect = document.getElementById('filterZona');
    if (zonaSelect) {
      zonaSelect.innerHTML = '<option value="">Todo</option>' +
        zonas.map(z => `<option value="${z}">${Utils.zonaLabel(z)}</option>`).join('');
    }

    catSelect.innerHTML = '<option value="">Todas las categorías</option>' +
      cats.map(c => `<option value="${c}">${Utils.catLabel(c)}</option>`).join('');
  }

  function _applyFilters() {
    _filtered = _all.filter(p => {
      if (_fZona && p.zona !== _fZona) return false;
      if (_fCat  && p.categoria !== _fCat) return false;
      if (_fText) {
        const q = _fText.toLowerCase();
        if (!p.patron?.toLowerCase().includes(q) &&
            !p.name?.toLowerCase().includes(q) &&
            !p.shortDesc?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }

  function _bindFilterEvents() {
    const zonaSelect = document.getElementById('filterZona');
    const catSelect  = document.getElementById('filterCat');
    const searchInput= document.getElementById('filterSearch');
    const clearBtn   = document.getElementById('filterClear');
    const counter    = document.getElementById('filterCounter');
    const grid       = document.getElementById(GRID_ID);

    const refresh = () => {
      _applyFilters();
      _render(grid);
      if (counter) counter.textContent = `${_filtered.length} productos`;
    };

    zonaSelect?.addEventListener('change', e => { _fZona = e.target.value; refresh(); });
    catSelect?.addEventListener('change',  e => { _fCat  = e.target.value; refresh(); });

    const debouncedSearch = Utils.debounce(e => { _fText = e.target.value.trim(); refresh(); }, 250);
    searchInput?.addEventListener('input', debouncedSearch);

    clearBtn?.addEventListener('click', () => {
      _fZona = ''; _fCat = ''; _fText = '';
      if (zonaSelect)  zonaSelect.value  = '';
      if (catSelect)   catSelect.value   = '';
      if (searchInput) searchInput.value = '';
      refresh();
    });

    if (counter) counter.textContent = `${_filtered.length} productos`;
  }

  // -------------------------------------------------------
  // RENDER GRID
  // -------------------------------------------------------
  function _render(grid) {
    _stopAllRotations();
    grid.className = 'ttt-products-grid';

    if (_filtered.length === 0) {
      grid.innerHTML = `
        <div class="catalog-empty">
          <p class="catalog-empty-title">Sin resultados</p>
          <p class="catalog-empty-sub">Prueba con otros filtros.</p>
        </div>`;
      return;
    }

    const frag = document.createDocumentFragment();
    _filtered.forEach(prod => {
      const card = _createCard(prod);
      if (card) frag.appendChild(card);
    });
    grid.innerHTML = '';
    grid.appendChild(frag);

    _startAllRotations();
    _bindCardEvents(grid);
  }

  function _renderEmpty(grid) {
    grid.innerHTML = `
      <div class="catalog-empty">
        <p class="catalog-empty-title">Catálogo en preparación</p>
        <p class="catalog-empty-sub">Pronto dispondremos de los productos para usted.</p>
      </div>`;
  }

  // -------------------------------------------------------
  // CREAR CARD
  // -------------------------------------------------------
  function _createCard(prod) {
    const images = prod.images || [];
    // Imagen inicial aleatoria
    const startIdx = images.length ? Math.floor(Math.random() * images.length) : 0;
    const firstImg = images[startIdx]
      ? ImageManager.productSrc(images[startIdx])
      : TTT_CONFIG.images.placeholder;

    const catLabel = Utils.catLabel(prod.categoria);
    const newBadge = prod.isNew ? '<span class="ttt-card-badge-new">Nuevo</span>' : '';

    const card = document.createElement('article');
    card.className = 'ttt-product-card';
    card.dataset.sku = prod.sku;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Ver ${prod.patron} — ${catLabel}`);

    card.innerHTML = `
      <div class="ttt-card-img-wrap">
        <img
          class="ttt-card-img"
          src="${Utils.sanitize(firstImg)}"
          alt="${Utils.sanitize(prod.patron)}"
          loading="lazy"
          onerror="this.onerror=null;this.src='${TTT_CONFIG.images.placeholder}'"
          data-imgs='${JSON.stringify(images.map(img => ImageManager.productSrc(img)))}'
          data-idx="${startIdx}"
        >
        ${newBadge}
      </div>
      <div class="ttt-card-body">
        <p class="ttt-card-patron">${Utils.sanitize(prod.patron)}</p>
        <p class="ttt-card-cat">${Utils.sanitize(catLabel)}</p>
      </div>
    `;

    return card;
  }

  // -------------------------------------------------------
  // PRESALE BADGES
  // -------------------------------------------------------
  function _renderPresaleBadges() {
    const pct = Campania.descuentoPct();
    document.querySelectorAll('.ttt-product-card').forEach(card => {
      if (card.querySelector('.presale-badge')) return;
      const body = card.querySelector('.ttt-card-body');
      if (!body) return;
      const badge = document.createElement('span');
      badge.className   = 'presale-badge';
      badge.textContent = `PRESALE −${pct}%`;
      body.appendChild(badge);
    });
  }

  // -------------------------------------------------------
  // ROTACIÓN DE IMÁGENES
  // -------------------------------------------------------
  function _startAllRotations() {
    document.querySelectorAll('.ttt-card-img[data-imgs]').forEach(img => {
      let imgs;
      try { imgs = JSON.parse(img.dataset.imgs || '[]'); } catch { return; }
      if (imgs.length <= 1) return;

      const sku = img.closest('.ttt-product-card')?.dataset.sku;
      if (!sku) return;

      let idx = parseInt(img.dataset.idx, 10) || 0;
      const delay = Math.random() * ROTATE_MS;

      setTimeout(() => {
        _rotTimers[sku] = setInterval(() => {
          idx = (idx + 1) % imgs.length;
          img.dataset.idx = idx;
          img.classList.add('is-fading');
          setTimeout(() => {
            img.src = imgs[idx];
            img.classList.remove('is-fading');
          }, 220);
        }, ROTATE_MS);
      }, delay);
    });
  }

  function _stopAllRotations() {
    Object.values(_rotTimers).forEach(t => clearInterval(t));
    _rotTimers = {};
  }

  // -------------------------------------------------------
  // EVENTOS — delegación en grid
  // -------------------------------------------------------
  function _bindCardEvents(grid) {
    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.ttt-product-card');
      if (!card) return;
      const prod = _all.find(p => p.sku === card.dataset.sku);
      if (prod && window.Modal?.openProduct) Modal.openProduct(prod);
    });

    grid.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('.ttt-product-card');
      if (!card) return;
      e.preventDefault();
      const prod = _all.find(p => p.sku === card.dataset.sku);
      if (prod && window.Modal?.openProduct) Modal.openProduct(prod);
    });
  }

  // -------------------------------------------------------
  // API PÚBLICA
  // -------------------------------------------------------
  function findProduct(sku) {
    return _all.find(p => p.sku === sku) || null;
  }

  function getAllProducts() { return _all; }

  // Devuelve la lista filtrada activa — usada por Modal para navegar entre productos
  function getFiltered() { return _filtered; }

  return {
    init,
    findProduct,
    getAllProducts,
    getFiltered,
    stopRotations:  _stopAllRotations,
    startRotations: _startAllRotations,
  };

})();

document.addEventListener('DOMContentLoaded', () => { Catalog.init(); });
window.Catalog = Catalog;
Logger.log('ttt-catalog.js cargado ✓');
