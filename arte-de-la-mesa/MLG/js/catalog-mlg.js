// @version    v1.0  @file catalog-mlg.js  @updated 2026-03-08
/* ===== MLG CATALOG =====
 * Grid de 9 familias MLG.
 * Cada card muestra foto rotatoria de los productos de esa familia
 * (saltando placeholders si hay imágenes reales).
 * Click en card → ModalMlg.openFamily(familyName)
 * ============================================ */
'use strict';

const CatalogMlg = (() => {

  const GRID_ID   = 'mlgProductsGrid';
  const ROTATE_MS = 60000;

  let _products  = [];
  let _byId      = {};
  let _families  = {};   // { familyName: [id, id, …] }
  let _rotTimers = {};

  // ── INIT ────────────────────────────────────────────────
  function init() {
    const grid = document.getElementById(GRID_ID);
    if (!grid) { Logger.error('catalog-mlg.js: #mlgProductsGrid no encontrado'); return; }

    _products = (window.MLG_CATALOG || []);
    if (!_products.length) {
      grid.innerHTML = '<p class="catalog-empty-title">Catálogo en preparación</p>';
      return;
    }

    // Indexar por id y por familia
    _families = {};
    _byId     = {};
    _products.forEach(p => {
      _byId[p.id] = p;
      if (!_families[p.familia]) _families[p.familia] = [];
      _families[p.familia].push(p.id);
    });

    _render(grid);
    _bindEvents(grid);
    Logger.log('catalog-mlg.js: ' + Object.keys(_families).length + ' familias renderizadas ✓');
  }

  // ── RENDER GRID ─────────────────────────────────────────
  function _render(grid) {
    grid.className = 'families-grid';
    const frag = document.createDocumentFragment();
    const ORDEN_FAMILIAS = [
      'COPAS & VASOS CON PIE','VASOS & TUMBLERS','JARRAS',
      'BOTELLAS & DECANTADORES','VAJILLA','ENSALADERAS & CENTROS',
      'ACCESORIOS DE MESA','TAZAS & BEBIDAS','LAMPARAS & DECO',
    ];
    ORDEN_FAMILIAS.forEach(fam => {
      if (!_families[fam]) return;
      const card = _createFamilyCard(fam, _families[fam]);
      if (card) frag.appendChild(card);
    });
    grid.innerHTML = '';
    grid.appendChild(frag);
    _startAllRotations();
  }

  // ── FAMILY CARD ─────────────────────────────────────────
  function _createFamilyCard(familyName, productIds) {
    const allProds = productIds.map(id => _byId[id]).filter(Boolean);
    if (!allProds.length) return null;

    // Imágenes reales (sin placeholder)
    const realImgs = allProds
      .filter(p => !p.placeholder)
      .map(p => p.image);

    const imgSrcs = realImgs.length ? realImgs : [];
    const startIdx = imgSrcs.length ? Math.floor(Math.random() * imgSrcs.length) : 0;
    const firstImg = imgSrcs[startIdx] || '';
    const totalCount = productIds.length;
    const totalReal  = realImgs.length;

    const card = document.createElement('article');
    card.className         = 'family-card mlg-family-card';
    card.dataset.family    = familyName;
    card.dataset.catalog   = 'mlg';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', 'Ver colección ' + familyName);

    const imgHtml = firstImg
      ? `<img
           class="family-card-img"
           src="${firstImg}"
           alt="${familyName}"
           loading="lazy"
           data-imgs='${JSON.stringify(imgSrcs)}'
           data-idx="${startIdx}"
           onerror="this.style.display='none'"
         >`
      : `<div class="family-card-no-img"><span class="family-card-placeholder-text">PLACEHOLDER</span></div>`;

    // Badge: imágenes disponibles vs total
    const badgeHtml = totalReal < totalCount
      ? `<span class="mlg-img-badge">${totalReal}/${totalCount} fotos</span>`
      : '';

    card.innerHTML = `
      <div class="family-card-img-wrap">
        ${imgHtml}
        <div class="family-card-overlay">
          <span class="family-card-count">${totalCount} pieza${totalCount !== 1 ? 's' : ''}</span>
          ${badgeHtml}
        </div>
      </div>
      <div class="family-card-body">
        <h3 class="family-card-title">${familyName}</h3>
        <p class="mlg-family-subtitle">Synthetic Crystal</p>
      </div>`;

    return card;
  }

  // ── ROTACIÓN ────────────────────────────────────────────
  function _startAllRotations() {
    Object.values(_rotTimers).forEach(t => clearInterval(t));
    _rotTimers = {};
    document.querySelectorAll('#mlgProductsGrid .family-card-img[data-imgs]').forEach(img => {
      let imgs;
      try { imgs = JSON.parse(img.dataset.imgs || '[]'); } catch { return; }
      if (imgs.length <= 1) return;
      const familyName = img.closest('[data-family]')?.dataset.family;
      if (!familyName) return;
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

  // ── EVENTOS ─────────────────────────────────────────────
  function _bindEvents(grid) {
    grid.addEventListener('click', e => {
      const card = e.target.closest('.mlg-family-card');
      if (!card) return;
      if (typeof ModalMlg !== 'undefined') ModalMlg.openFamily(card.dataset.family);
    });
    grid.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('.mlg-family-card');
      if (!card) return;
      e.preventDefault();
      if (typeof ModalMlg !== 'undefined') ModalMlg.openFamily(card.dataset.family);
    });
  }

  // ── API PÚBLICA ──────────────────────────────────────────
  function getProductsByFamily(familyName) {
    return (_families[familyName] || []).map(id => _byId[id]).filter(Boolean);
  }
  function getProductsByModelo(modelo) {
    return _products.filter(p => p.modelo === modelo);
  }
  function findProduct(id) { return _byId[id] || null; }

  return { init, getProductsByFamily, getProductsByModelo, findProduct };

})();

document.addEventListener('DOMContentLoaded', () => { CatalogMlg.init(); });
window.CatalogMlg = CatalogMlg;
Logger.log('catalog-mlg.js cargado ✓');
