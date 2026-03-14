// @version    v1.0  @file mlg-catalog.js  @updated 2026-03-11  @session mlg-catalog
/* ===== MLG V1 - catalog.js =====
 * Grid de 5 FAMILIAS con imágenes rotatorias.
 * Fuente: MLG_FAMILIES (de mlg-catalog-data.js)
 * Cada card → imagen rotatoria → click abre Modal.openFamily(familyName)
 * =========================================== */

'use strict';

const Catalog = (() => {

  const GRID_ID   = 'productsGrid';
  const ROTATE_MS = 60000; // 1 rotación por minuto

  let _families  = {};
  let _rotTimers = {};

  // -------------------------------------------------------
  // INIT
  // -------------------------------------------------------
  function init() {
    const grid = document.getElementById(GRID_ID);
    if (!grid) { Logger.error('catalog.js: #productsGrid no encontrado'); return; }

    _families = window.MLG_FAMILIES || {};

    if (Object.keys(_families).length === 0) {
      _renderEmpty(grid);
      Logger.warn('catalog.js: MLG_FAMILIES vacío');
      return;
    }

    _render(grid);
    _bindEvents(grid);
    Logger.log(`catalog.js: ${Object.keys(_families).length} familias renderizadas ✓`);

    Campania.cargar().then(() => {
      if (Campania.activa()) {
        _renderPresaleBadges();
        Logger.log(`catalog.js: badges presale ${Campania.descuentoPct()}% aplicados`);
      }
    });
  }

  // -------------------------------------------------------
  // RENDER GRID
  // -------------------------------------------------------
  function _render(grid) {
    grid.className = 'families-grid';
    const frag = document.createDocumentFragment();

    Object.entries(_families).forEach(([familyName, familyData]) => {
      const card = _createFamilyCard(familyName, familyData);
      if (card) frag.appendChild(card);
    });

    grid.innerHTML = '';
    grid.appendChild(frag);
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
  // familyData = { label, images: [...] }
  // -------------------------------------------------------
  function _createFamilyCard(familyName, familyData) {
    const imgSrcs = familyData.images || [];
    if (!imgSrcs.length) return null;

    const startIdx = Math.floor(Math.random() * imgSrcs.length);
    const firstImg = imgSrcs[startIdx];

    // Contar tipos de producto en esta familia
    const types = (window.MLG_PRODUCT_TYPES || []).filter(t => t.familia === familyName);
    const totalCount = types.length;

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
          onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<span class=\\'family-card-placeholder-text\\'>MLG</span>')"
          data-imgs='${JSON.stringify(imgSrcs)}'
          data-idx="${startIdx}"
        >`
      : `<div class="family-card-no-img"><span class="family-card-placeholder-text">MLG</span></div>`;

    card.innerHTML = `
      <div class="family-card-img-wrap">
        ${imgHtml}
        <div class="family-card-overlay">
          <span class="family-card-count">${totalCount} tipo${totalCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
      <div class="family-card-body">
        <h3 class="family-card-title">${Utils.sanitize(familyData.label || familyName)}</h3>
      </div>
    `;

    return card;
  }

  // -------------------------------------------------------
  // BADGE PRESALE
  // -------------------------------------------------------
  function _renderPresaleBadges() {
    const pct = Campania.descuentoPct();
    document.querySelectorAll('.family-card').forEach(card => {
      if (card.querySelector('.presale-badge')) return;
      const body = card.querySelector('.family-card-body');
      if (!body) return;
      const badge = document.createElement('span');
      badge.className   = 'presale-badge';
      badge.textContent = `PRESALE -${pct}%`;
      body.appendChild(badge);
    });
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
  // EVENTOS
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
  function getTypesByFamily(familyName) {
    return (window.MLG_PRODUCT_TYPES || []).filter(t => t.familia === familyName);
  }

  function getFamilyNames() {
    return Object.keys(_families);
  }

  return {
    init,
    getTypesByFamily,
    getFamilyNames,
    stopRotations: _stopAllRotations,
    startRotations: _startAllRotations,
  };

})();

// ===== BOOTSTRAP =====
document.addEventListener('DOMContentLoaded', () => {
  Catalog.init();

  // Deep-link: ?p=familia-coleccion-tipo → abre el modal de familia en ese producto
  const pid = new URLSearchParams(location.search).get('p');
  if (pid && window.Modal?.openFamilyAtProduct) {
    window.Modal.openFamilyAtProduct(pid);
  }
});

window.Catalog = Catalog;
Logger.log('catalog.js cargado ✓');
