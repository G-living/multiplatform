// @version    v1.0  @file config-mlg-patch.js  @updated 2026-03-08
// Parche MLG: agregar al IMOLARTE_CONFIG y Utils ANTES de cargar catalog-data-mlg.js
// Cargar en <head> DESPUÉS de config.js
'use strict';

// ── Sección MLG en IMOLARTE_CONFIG ────────────────────────
IMOLARTE_CONFIG.mlg = {
  multiplicador: 12000,          // EUR × 12000 = COP base
  brand: {
    name:    'Mario Luca Giusti',
    tagline: 'Synthetic Crystal — Hecho en Italia',
  },
  images: {
    placeholder: 'images/products/placeholder.jpg',
  },
};

// ── Utils.precioCOPmlg ────────────────────────────────────
/**
 * Convierte precio EUR MLG a COP con redondeo a $1.000 por exceso.
 * @param {number} precio_eur
 * @returns {number}  Precio COP listo para formatear
 */
Utils.precioCOPmlg = function(precio_eur) {
  if (!precio_eur || precio_eur <= 0) return 0;
  const raw = precio_eur * IMOLARTE_CONFIG.mlg.multiplicador;
  return Math.ceil(raw / 1000) * 1000;
};

Logger.log('config-mlg-patch.js cargado ✓');
