// @version    v21.0  @file catalog.js  @updated 2026-03-06  @session presale-campania
/* ===== IMOLARTE V2 - catalog.js =====
 * Grid de 9 FAMILIAS (reemplaza grid de productos individuales)
 * Cada card → foto rotatoria aleatoria entre los productos de la familia
 * Click → abre Modal.openFamily(familyName)
 * =========================================== */

'use strict';

const Catalog = (() => {

  const GRID_ID    = 'productsGrid';
  const ROTATE_MS  = 60000; // 1 rotación por minuto

  let _products   = [];
  let _families   = {};
  let _byId       = {};
  let _rotTimers  = {}; // { familyName: intervalId }

  // -------------------------------------------------------
  // INIT
  // -------------------------------------------------------
  function init() {
    const grid = document.getElementById(GRID_ID);
    if (!grid) { Logger.error('catalog.js: #productsGrid no encontrado'); return; }

    _products = window.CATALOG_PRODUCTS || [];
    _families = window.CATALOG_FAMILIES || {};
    _byId     = window.CATALOG_BY_ID    || {};

    if (_products.length === 0) {
      _renderEmpty(grid);
      Logger.warn('catalog.js: CATALOG_PRODUCTS vacío');
      return;
    }

    // Renderizar primero a precio pleno (inmediato)
    _render(grid);
    _bindEvents(grid);
    Logger.log(`catalog.js: ${Object.keys(_families).length} familias renderizadas ✓`);

    // Luego cargar campaña — si hay descuento re-renderizar badges
    Campania.cargar().then(() => {
      if (Campania.activa()) {
        _renderPresaleBadges();
        Logger.log(`catalog.js: badges presale ${Campania.descuentoPct()}% aplicados`);
      }
    });
  }

  // -------------------------------------------------------
  // RENDER GRID DE FAMILIAS
  // -------------------------------------------------------
  function _render(grid) {
    grid.className = 'families-grid';
    const frag = document.createDocumentFragment();

    Object.entries(_families).forEach(([familyName, productIds]) => {
      const card = _createFamilyCard(familyName, productIds);
      if (card) frag.appendChild(card);
    });

    grid.innerHTML = '';
    grid.appendChild(frag);

    // Iniciar rotación de imágenes en todas las cards
    _startAllRotations();
  }

  function _renderEmpty(grid) {
    grid.innerHTML = `
      <div class="catalog-empty">
        <p class="catalog-empty-title">Catálogo en preparación</p>
        <p class="catalog-empty-sub">Pronto dispondremos de nuestras piezas para usted.</p>
      </div>`;
  }

  // -------------------------------------------------------
  // CREAR FAMILY CARD
  // -------------------------------------------------------
  function _createFamilyCard(familyName, productIds) {
    if (!familyName || !productIds.length) return null;

    // Obtener todos los productos de la familia
    const allProds = productIds.map(id => _byId[id]).filter(Boolean);
    if (!allProds.length) return null;

    // Preferir productos con imagen real; si ninguno tiene, usar comodines como fallback
    const prodsWithImg = allProds.filter(p => p.image);
    const imgProds = prodsWithImg.length ? prodsWithImg : [];

    // Construir array de imágenes para rotar: primero reales, luego comodines si faltan
    let imgSrcs = imgProds.map(p => p.image);
    if (!imgSrcs.length) {
      // Fallback: primer comodín disponible de cualquier producto
      for (const p of allProds) {
        if (p.variants && p.variants[0]?.foto_comodin) {
          imgSrcs = [p.variants[0].foto_comodin];
          break;
        }
      }
    }

    const startIdx = Math.floor(Math.random() * Math.max(imgSrcs.length, 1));
    const firstImg = imgSrcs[startIdx] || '';
    const totalCount = productIds.length;

    const card = document.createElement('article');
    card.className   = 'family-card';
    card.dataset.family = familyName;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Ver colección ${familyName}`);

    const imgHtml = firstImg
      ? `<img
          class="family-card-img"
          src="${Utils.sanitize(firstImg)}"
          alt="${Utils.sanitize(familyName)}"
          loading="lazy"
          onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<span class=\\'family-card-placeholder-text\\'>PLACEHOLDER</span>')"
          data-imgs='${JSON.stringify(imgSrcs)}'
          data-idx="${startIdx}"
        >`
      : `<div class="family-card-no-img"><span class="family-card-placeholder-text">PLACEHOLDER</span></div>`;

    card.innerHTML = `
      <div class="family-card-img-wrap">
        ${imgHtml}
        <div class="family-card-overlay">
          <span class="family-card-count">${totalCount} pieza${totalCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
      <div class="family-card-body">
        <h3 class="family-card-title">${Utils.sanitize(familyName)}</h3>
      </div>
    `;

    return card;
  }

  // -------------------------------------------------------
  // BADGE PRESALE — agregar/quitar de las cards existentes
  // Se llama después de que Campania.cargar() confirma descuento
  // -------------------------------------------------------
  function _renderPresaleBadges() {
    const pct = Campania.descuentoPct();
    document.querySelectorAll('.family-card').forEach(card => {
      // Evitar duplicados
      if (card.querySelector('.presale-badge')) return;
      const body = card.querySelector('.family-card-body');
      if (!body) return;
      const badge = document.createElement('span');
      badge.className   = 'presale-badge';
      badge.textContent = `PRESALE −${pct}%`;
      body.appendChild(badge);
    });
  }

  function _removePresaleBadges() {
    document.querySelectorAll('.presale-badge').forEach(b => b.remove());
  }

  // -------------------------------------------------------
  // ROTACIÓN DE IMÁGENES
  // -------------------------------------------------------
  function _startAllRotations() {
    Object.values(_rotTimers).forEach(t => clearInterval(t));
    _rotTimers = {};

    document.querySelectorAll('.family-card').forEach(card => {
      const img = card.querySelector('.family-card-img[data-imgs]');
      if (!img) return;

      let imgs;
      try { imgs = JSON.parse(img.dataset.imgs || '[]'); } catch { return; }
      if (imgs.length <= 1) return;

      const familyName = card.dataset.family;
      let idx = parseInt(img.dataset.idx, 10) || 0;

      const delay = Math.random() * ROTATE_MS;
      setTimeout(() => {
        _rotTimers[familyName] = setInterval(() => {
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
  function _bindEvents(grid) {
    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.family-card');
      if (!card) return;
      const familyName = card.dataset.family;
      if (familyName && typeof Modal !== 'undefined') {
        Modal.openFamily(familyName);
      }
    });

    grid.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('.family-card');
      if (!card) return;
      e.preventDefault();
      const familyName = card.dataset.family;
      if (familyName && typeof Modal !== 'undefined') {
        Modal.openFamily(familyName);
      }
    });
  }

  // -------------------------------------------------------
  // API PÚBLICA
  // -------------------------------------------------------
  function getProductsByFamily(familyName) {
    const ids = _families[familyName] || [];
    return ids.map(id => _byId[id]).filter(Boolean);
  }

  function getFamilyNames() {
    return Object.keys(_families);
  }

  function findProduct(id) {
    return _byId[id] || null;
  }

  return {
    init,
    getProductsByFamily,
    getFamilyNames,
    findProduct,
    stopRotations: _stopAllRotations,
    startRotations: _startAllRotations,
  };

})();

// ===== BOOTSTRAP =====
document.addEventListener('DOMContentLoaded', () => {
  Catalog.init();
});

window.Catalog = Catalog;
Logger.log('catalog.js cargado ✓');
