// @version    v2.0  @file ttt-catalog.js  @updated 2026-03-14  @session fix-mlg-404-error-aSVYy
/* ===== TTT - ttt-catalog.js =====
 * Grid de 6 FAMILIAS con imágenes rotatorias.
 * Fuente: TTT_PRODUCTS (de ttt-catalog-data.js), agrupados por categoria.
 * 6 familias: tovaglie, runner, tovaglioli, tovaglietta, mezzero, cuscini
 * Cada card → imagen rotatoria → click abre Modal.openProduct(primerProducto)
 * El modal navega con flechas entre todos los productos de esa familia.
 * Búsqueda por patrón filtra qué productos verá el modal al abrir.
 * ============================================ */

'use strict';

const Catalog = (() => {

  const GRID_ID   = 'productsGrid';
  const ROTATE_MS = 8000;

  // 6 familias del catálogo TTT — orden visual en el grid
  const FAMILIES = [
    { cat: 'tovaglie',    label: 'Manteles'        },
    { cat: 'runner',      label: 'Caminos de mesa'  },
    { cat: 'tovaglioli',  label: 'Servilletas'      },
    { cat: 'tovaglietta', label: 'Individuales'     },
    { cat: 'mezzero',     label: 'Paños deco'       },
    { cat: 'cuscini',     label: 'Cojines'          },
  ];

  let _all       = [];   // TTT_PRODUCTS completo
  let _rotTimers = {};   // { cat: intervalId }

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

    _render(grid);
    _bindCardEvents(grid);

    Logger.log(`ttt-catalog.js: ${FAMILIES.length} familias renderizadas ✓`);

    Campania.cargar().then(() => {
      if (Campania.activa()) {
        _renderPresaleBadges();
        Logger.log(`ttt-catalog.js: badges presale ${Campania.descuentoPct()}% aplicados`);
      }
    });
  }

  // -------------------------------------------------------
  // API PÚBLICA — usada por Modal para construir catalogList
  // -------------------------------------------------------
  function getFiltered() { return _all; }

  function getAllProducts() { return _all; }

  function findProduct(sku) {
    return _all.find(p => p.sku === sku) || null;
  }

  // -------------------------------------------------------
  // RENDER GRID — 6 family cards
  // -------------------------------------------------------
  function _render(grid) {
    _stopAllRotations();
    grid.className = 'ttt-products-grid';

    const frag = document.createDocumentFragment();
    FAMILIES.forEach(fam => {
      const prods = _all.filter(p => p.categoria === fam.cat);
      if (!prods.length) return;

      // Recoger imágenes únicas de todos los productos de la familia (máx 20)
      const seen = new Set();
      const images = prods
        .flatMap(p => p.images || [])
        .filter(img => { if (seen.has(img)) return false; seen.add(img); return true; })
        .slice(0, 20);

      if (!images.length) return;

      const card = _createFamilyCard(fam, prods.length, images);
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
        <p class="catalog-empty-sub">Pronto dispondremos de los productos para usted.</p>
      </div>`;
  }

  // -------------------------------------------------------
  // CREAR FAMILY CARD — reutiliza clases CSS ttt-product-card
  // -------------------------------------------------------
  function _createFamilyCard(fam, count, images) {
    const imgSrcs  = images.map(img => ImageManager.productSrc(img));
    const startIdx = Math.floor(Math.random() * imgSrcs.length);
    const firstImg = imgSrcs[startIdx] || TTT_CONFIG.images.placeholder;

    const card = document.createElement('article');
    card.className = 'ttt-product-card';
    card.dataset.cat = fam.cat;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Ver colección ${fam.label}`);

    card.innerHTML = `
      <div class="ttt-card-img-wrap">
        <img
          class="ttt-card-img"
          src="${Utils.sanitize(firstImg)}"
          alt="${Utils.sanitize(fam.label)}"
          loading="lazy"
          onerror="this.onerror=null;this.src='${TTT_CONFIG.images.placeholder}'"
          data-imgs='${JSON.stringify(imgSrcs)}'
          data-idx="${startIdx}"
        >
      </div>
      <div class="ttt-card-body">
        <p class="ttt-card-patron">${Utils.sanitize(fam.label)}</p>
        <p class="ttt-card-cat">${count} diseños</p>
      </div>
    `;

    return card;
  }

  // -------------------------------------------------------
  // PRESALE BADGES
  // -------------------------------------------------------
  function _renderPresaleBadges() {
    const pct = Campania.descuentoPct();
    document.querySelectorAll('.ttt-product-card[data-cat]').forEach(card => {
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

      const cat = img.closest('.ttt-product-card')?.dataset.cat;
      if (!cat) return;

      let idx = parseInt(img.dataset.idx, 10) || 0;
      const delay = Math.random() * ROTATE_MS;

      setTimeout(() => {
        _rotTimers[cat] = setInterval(() => {
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
  // EVENTOS — click en family card abre modal
  // -------------------------------------------------------
  function _bindCardEvents(grid) {
    const open = (cat) => {
      const prods = _all.filter(p => p.categoria === cat);
      if (!prods.length || !window.Modal?.openProduct) return;
      Modal.openProduct(prods[0]);
    };

    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.ttt-product-card[data-cat]');
      if (card) open(card.dataset.cat);
    });

    grid.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('.ttt-product-card[data-cat]');
      if (card) { e.preventDefault(); open(card.dataset.cat); }
    });
  }

  return {
    init,
    getFiltered,
    getAllProducts,
    findProduct,
    stopRotations:  _stopAllRotations,
    startRotations: _startAllRotations,
  };

})();

document.addEventListener('DOMContentLoaded', () => { Catalog.init(); });
window.Catalog = Catalog;
Logger.log('ttt-catalog.js cargado ✓');
