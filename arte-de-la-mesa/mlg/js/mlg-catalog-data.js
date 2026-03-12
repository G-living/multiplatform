// @version    v2.0  @file mlg-catalog-data.js  @updated 2026-03-11  @session mlg-catalog
/* ===== MLG V2 - catalog-data.js =====
 * Familias y tipos de producto para el catálogo MLG by Helena Caballero.
 * Factor EUR→COP: 12219 | Fuente: PRICE LIST JANUARY 2026
 * MLG_FAMILIES  → cards giratorias en la página principal
 * MLG_PRODUCT_TYPES → productos con variantes dentro de cada familia
 * =========================================== */

'use strict';

// ─────────────────────────────────────────────
// FAMILIAS — imágenes rotatorias en la grid
// ─────────────────────────────────────────────
const MLG_FAMILIES = {

  'Copas y Vasos': {
    label: 'Copas y Vasos',
    images: [
      'images/products/H.BIK.DLV1.jpg',
      'images/products/H.BIK.DLV3.jpg',
      'images/products/H.BIK.WIN1.jpg',
      'images/products/H.BIK.WIN2.jpg',
      'images/products/H.BIK.STE1.jpg',
      'images/products/H.BIK.LEN1.jpg',
      'images/products/H.BIK.LEN2.jpg',
      'images/products/H.BIK.PAL1.jpg',
      'images/products/H.BIK.TUM1.jpg',
      'images/products/H.BIK.VEN1.jpg',
    ],
  },

  'Alzadas': {
    label: 'Alzadas',
    images: [
      'images/products/H.ALZ.NIN1.jpg',
      'images/products/H.ALZ.NIN2.jpg',
      'images/products/H.ALZ.NIN3.jpg',
      'images/products/H.ALZ.GIR1.jpg',
      'images/products/H.ALZ.GIR2.jpg',
      'images/products/H.ALZ.SUS1.jpg',
      'images/products/H.ALZ.SUS2.jpg',
      'images/products/H.ALZ.CUP1.jpg',
    ],
  },

  'Ensaladeras': {
    label: 'Ensaladeras',
    images: [
      'images/products/H.INS.MIL1.jpg',
      'images/products/H.INS.MIL2.jpg',
      'images/products/H.INS.MIL3.jpg',
      'images/products/H.INS.LEN1.jpg',
      'images/products/H.INS.LEN2.jpg',
      'images/products/H.INS.LEN3.jpg',
      'images/products/H.INS.CHU1.jpg',
      'images/products/H.INS.CHU2.jpg',
    ],
  },

  'Platos': {
    label: 'Platos',
    images: [
      'images/products/H.PIA.PAN1.jpg',
      'images/products/H.PIA.PAN2.jpg',
      'images/products/H.PIA.MAR1.jpg',
      'images/products/H.PIA.MAR2.jpg',
      'images/products/H.PIA.VIE1.jpg',
      'images/products/H.PIA.EVA1.jpg',
      'images/products/H.PIA.PAT2.jpg',
      'images/products/H.PIA.LAP1.jpg',
    ],
  },


  'Jarras y Botellas': {
    label: 'Jarras y Botellas',
    images: [
      'images/products/H.BRO.SIS1.jpg',
      'images/products/H.BRO.SIS2.jpg',
      'images/products/H.BRO.HAL1.jpg',
      'images/products/H.BRO.HAL2.jpg',
      'images/products/H.BOT.AQU1.jpg',
      'images/products/H.BOT.AQU2.jpg',
      'images/products/H.BRO.GENE1.jpg',
      'images/products/H.BRO.PAL1.jpg',
    ],
  },

  'Complementos': {
    label: 'Complementos',
    images: [
      'images/products/H.LAM.AND1.jpg',
      'images/products/H.LAM.CAL6.jpg',
      'images/products/H.LAM.AND2.jpg',
      'images/products/H.LAM.CAL8.jpg',
      'images/products/H.KAN1.jpg',
      'images/products/H.KAN2.jpg',
      'images/products/H.MAD1.jpg',
      'images/products/H.MAD2.jpg',
    ],
  },

};


// ─────────────────────────────────────────────
// TIPOS DE PRODUCTO
// ─────────────────────────────────────────────
const MLG_PRODUCT_TYPES = [

  // ══════════════════════════════════════════
  // COPAS Y VASOS
  // ══════════════════════════════════════════
  {
    familia:   'Copas y Vasos',
    coleccion: 'Biancaneve',
    tipo:      'Shot',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BIK.BN2', color: 'Dorado', precio_cop: 67000, image: 'images/products/H.BIK.BN2.jpg' },
      { sku: 'H.BIK.BN3', color: 'Verde', precio_cop: 67000, image: 'images/products/H.BIK.BN3.jpg' },
      { sku: 'H.BIK.BN4', color: 'Azul Real', precio_cop: 67000, image: 'images/products/H.BIK.BN4.jpg' },
      { sku: 'H.BIK.BN5', color: 'Rojo', precio_cop: 67000, image: 'images/products/H.BIK.BN5.jpg' },
      { sku: 'H.BIK.BN6', color: 'Turquesa', precio_cop: 67000, image: 'images/products/H.BIK.BN6.jpg' },
    ],
  },

  {
    familia:   'Copas y Vasos',
    coleccion: 'Double Face',
    tipo:      'Tumbler',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BIK.DF1', color: 'Naranja Flúo', precio_cop: 103000, image: 'images/products/H.BIK.DF1 copy.jpg' },
      { sku: 'H.BIK.DF2', color: 'Verde Flúo', precio_cop: 103000, image: 'images/products/H.BIK.DF2.jpg' },
      { sku: 'H.BIK.DF3', color: 'Fucsia Flúo', precio_cop: 103000, image: 'images/products/H.BIK.DF3.jpg' },
      { sku: 'H.BIK.DF4', color: 'Azul Claro', precio_cop: 103000, image: 'images/products/H.BIK.DF4.jpg' },
      { sku: 'H.BIK.DF5', color: 'Negro', precio_cop: 103000, image: 'images/products/H.BIK.DF5.jpg' },
      { sku: 'H.BIK.DF6', color: 'Blanco', precio_cop: 103000, image: 'images/products/H.BIK.DF6.jpg' },
      { sku: 'H.BIK.DF7', color: 'Azul/Verde', precio_cop: 103000, image: 'images/products/H.BIK.DF7.jpg' },
      { sku: 'H.BIK.DF8', color: 'Cobalto Morado', precio_cop: 103000, image: 'images/products/H.BIK.DF8.jpg' },
      { sku: 'H.BIK.DF9', color: 'Escarlata', precio_cop: 103000, image: 'images/products/H.BIK.DF9.jpg' },
    ],
  },

  {
    familia:   'Copas y Vasos',
    coleccion: 'Dolce Vita',
    tipo:      'Copa de Vino',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BIK.DLV1', color: 'Ámbar', precio_cop: 126000, image: 'images/products/H.BIK.DLV1.jpg' },
      { sku: 'H.BIK.DLV26', color: 'Blanco', precio_cop: 126000, image: 'images/products/H.BIK.DLV26.jpg' },
      { sku: 'H.BIK.DLV29', color: 'Turquesa', precio_cop: 126000, image: 'images/products/H.BIK.DLV29.jpg' },
      { sku: 'H.BIK.DLV3', color: 'Azul Real', precio_cop: 126000, image: 'images/products/H.BIK.DLV3.jpg' },
      { sku: 'H.BIK.DLV32', color: 'Gris', precio_cop: 126000, image: 'images/products/H.BIK.DLV32.jpg' },
      { sku: 'H.BIK.DLV35', color: 'Dorado', precio_cop: 126000, image: 'images/products/H.BIK.DLV35.jpg' },
      { sku: 'H.BIK.DLV4', color: 'Transparente', precio_cop: 126000, image: 'images/products/H.BIK.DLV4.jpg' },
      { sku: 'H.BIK.DLV41', color: 'Transparente hilo dorado', precio_cop: 141000, image: 'images/products/H.BIK.DLV41.jpg' },
      { sku: 'H.BIK.DLV5', color: 'Verde', precio_cop: 126000, image: 'images/products/H.BIK.DLV5.jpg' },
      { sku: 'H.BIK.DLV7', color: 'Rojo', precio_cop: 126000, image: 'images/products/H.BIK.DLV7.jpg' },
      { sku: 'H.BIK.DLV8', color: 'Rubí', precio_cop: 126000, image: 'images/products/H.BIK.DLV8.jpg' },
    ],
  },

  {
    familia:   'Copas y Vasos',
    coleccion: 'Dolce Vita',
    tipo:      'Flauta Champagne',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BIK.DLV10', color: 'Negro', precio_cop: 126000, image: 'images/products/H.BIK.DLV10.jpg' },
      { sku: 'H.BIK.DLV11', color: 'Azul Real', precio_cop: 126000, image: 'images/products/H.BIK.DLV11.jpg' },
      { sku: 'H.BIK.DLV12', color: 'Transparente', precio_cop: 126000, image: 'images/products/H.BIK.DLV12.jpg' },
      { sku: 'H.BIK.DLV13', color: 'Verde', precio_cop: 126000, image: 'images/products/H.BIK.DLV13.jpg' },
      { sku: 'H.BIK.DLV15', color: 'Rojo', precio_cop: 126000, image: 'images/products/H.BIK.DLV15.jpg' },
      { sku: 'H.BIK.DLV16', color: 'Rubí', precio_cop: 126000, image: 'images/products/H.BIK.DLV16.jpg' },
      { sku: 'H.BIK.DLV27', color: 'Blanco', precio_cop: 126000, image: 'images/products/H.BIK.DLV27.jpg' },
      { sku: 'H.BIK.DLV30', color: 'Turquesa', precio_cop: 126000, image: 'images/products/H.BIK.DLV30.jpg' },
      { sku: 'H.BIK.DLV33', color: 'Gris', precio_cop: 126000, image: 'images/products/H.BIK.DLV33.jpg' },
      { sku: 'H.BIK.DLV36', color: 'Dorado', precio_cop: 126000, image: 'images/products/H.BIK.DLV36.jpg' },
      { sku: 'H.BIK.DLV42', color: 'Transparente hilo dorado', precio_cop: 141000, image: 'images/products/H.BIK.DLV42.jpg' },
      { sku: 'H.BIK.DLV9', color: 'Ámbar', precio_cop: 126000, image: 'images/products/H.BIK.DLV9.jpg' },
    ],
  },

  {
    familia:   'Copas y Vasos',
    coleccion: 'Dolce Vita',
    tipo:      'Vaso de Agua',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BIK.DLV17', color: 'Ámbar', precio_cop: 126000, image: 'images/products/H.BIK.DLV17.jpg' },
      { sku: 'H.BIK.DLV19', color: 'Azul Real', precio_cop: 126000, image: 'images/products/H.BIK.DLV19.jpg' },
      { sku: 'H.BIK.DLV20', color: 'Transparente', precio_cop: 126000, image: 'images/products/H.BIK.DLV20.jpg' },
      { sku: 'H.BIK.DLV21', color: 'Verde', precio_cop: 126000, image: 'images/products/H.BIK.DLV21.jpg' },
      { sku: 'H.BIK.DLV23', color: 'Rojo', precio_cop: 126000, image: 'images/products/H.BIK.DLV23.jpg' },
      { sku: 'H.BIK.DLV24', color: 'Rubí', precio_cop: 126000, image: 'images/products/H.BIK.DLV24.jpg' },
      { sku: 'H.BIK.DLV25', color: 'Blanco', precio_cop: 126000, image: 'images/products/H.BIK.DLV25.jpg' },
      { sku: 'H.BIK.DLV28', color: 'Turquesa', precio_cop: 126000, image: 'images/products/H.BIK.DLV28.jpg' },
      { sku: 'H.BIK.DLV31', color: 'Gris', precio_cop: 126000, image: 'images/products/H.BIK.DLV31.jpg' },
      { sku: 'H.BIK.DLV34', color: 'Dorado', precio_cop: 126000, image: 'images/products/H.BIK.DLV34.jpg' },
      { sku: 'H.BIK.DLV40', color: 'Transparente hilo dorado', precio_cop: 153000, image: 'images/products/H.BIK.DLV40.jpg' },
    ],
  },

  {
    familia:   'Copas y Vasos',
    coleccion: 'Gulli',
    tipo:      'Tumbler',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BIK.GUL1', color: 'Blanco', precio_cop: 126000, image: 'images/products/H.BIK.GUL1.jpg' },
      { sku: 'H.BIK.GUL2', color: 'Negro', precio_cop: 126000, image: 'images/products/H.BIK.GUL2.jpg' },
      { sku: 'H.BIK.GUL3', color: 'Verde Flúo', precio_cop: 126000, image: 'images/products/H.BIK.GUL3.jpg' },
      { sku: 'H.BIK.GUL4', color: 'Transparente', precio_cop: 126000, image: 'images/products/H.BIK.GUL4.jpg' },
      { sku: 'H.BIK.GUL5', color: 'Naranja Flúo', precio_cop: 126000, image: 'images/products/H.BIK.GUL5.jpg' },
      { sku: 'H.BIK.GUL7', color: 'Turquesa', precio_cop: 126000, image: 'images/products/H.BIK.GUL7.jpg' },
    ],
  },

  {
    familia:   'Copas y Vasos',
    coleccion: 'Lente',
    tipo:      'Tumbler',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BIK.LEN1', color: 'Negro', precio_cop: 103000, image: 'images/products/H.BIK.LEN1.jpg' },
      { sku: 'H.BIK.LEN11', color: 'Rojo', precio_cop: 103000, image: 'images/products/H.BIK.LEN11.jpg' },
      { sku: 'H.BIK.LEN13', color: 'Azul', precio_cop: 103000, image: 'images/products/H.BIK.LEN13.jpg' },
      { sku: 'H.BIK.LEN15', color: 'Turquesa', precio_cop: 103000, image: 'images/products/H.BIK.LEN15.jpg' },
      { sku: 'H.BIK.LEN16', color: 'Verde Flúo', precio_cop: 103000, image: 'images/products/H.BIK.LEN16.jpg' },
      { sku: 'H.BIK.LEN17', color: 'Naranja Flúo', precio_cop: 103000, image: 'images/products/H.BIK.LEN17.jpg' },
      { sku: 'H.BIK.LEN18', color: 'Fucsia Flúo', precio_cop: 103000, image: 'images/products/H.BIK.LEN18.jpg' },
      { sku: 'H.BIK.LEN19', color: 'Transparente', precio_cop: 103000, image: 'images/products/H.BIK.LEN19.jpg' },
      { sku: 'H.BIK.LEN2', color: 'Negro high', precio_cop: 111000, image: 'images/products/H.BIK.LEN2.jpg' },
      { sku: 'H.BIK.LEN20', color: 'Transparente high', precio_cop: 111000, image: 'images/products/H.BIK.LEN20 copy.jpg' },
      { sku: 'H.BIK.LEN21', color: 'Azul high', precio_cop: 111000, image: 'images/products/H.BIK.LEN21.jpg' },
      { sku: 'H.BIK.LEN24', color: 'Turquesa high', precio_cop: 111000, image: 'images/products/H.BIK.LEN24.jpg' },
      { sku: 'H.BIK.LEN26', color: 'Azul/Blanco', precio_cop: 103000, image: 'images/products/H.BIK.LEN26.jpg' },
      { sku: 'H.BIK.LEN27', color: 'Rojo/Blanco', precio_cop: 103000, image: 'images/products/H.BIK.LEN27.jpg' },
      { sku: 'H.BIK.LEN28', color: 'Morado/Blanco', precio_cop: 103000, image: 'images/products/H.BIK.LEN28.jpg' },
      { sku: 'H.BIK.LEN29', color: 'Verde/Blanco', precio_cop: 103000, image: 'images/products/H.BIK.LEN29.jpg' },
      { sku: 'H.BIK.LEN3', color: 'Blanco', precio_cop: 103000, image: 'images/products/H.BIK.LEN3.jpg' },
      { sku: 'H.BIK.LEN30', color: 'Turquesa/Blanco', precio_cop: 103000, image: 'images/products/H.BIK.LEN30.jpg' },
      { sku: 'H.BIK.LEN31', color: 'Gris/Blanco', precio_cop: 103000, image: 'images/products/H.BIK.LEN31.jpg' },
      { sku: 'H.BIK.LEN35', color: 'Rosa', precio_cop: 103000, image: 'images/products/H.BIK.LEN35.jpg' },
      { sku: 'H.BIK.LEN4', color: 'Blanco high', precio_cop: 111000, image: 'images/products/H.BIK.LEN4.jpg' },
      { sku: 'H.BIK.LEN5', color: 'Gris', precio_cop: 103000, image: 'images/products/H.BIK.LEN5.jpg' },
    ],
  },

  {
    familia:   'Copas y Vasos',
    coleccion: 'Mille e una Notte',
    tipo:      'Tumbler',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BIK.MUN1', color: 'Ámbar', precio_cop: 134000, image: 'images/products/H.BIK.MUN1.jpg' },
    ],
  },

  {
    familia:   'Copas y Vasos',
    coleccion: 'Mille e una Notte',
    tipo:      'Producto',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BIK.MUN2', color: 'Transparente', precio_cop: 134000, image: 'images/products/H.BIK.MUN2.jpg' },
      { sku: 'H.BIK.MUN3', color: 'Azul', precio_cop: 134000, image: 'images/products/H.BIK.MUN3.jpg' },
      { sku: 'H.BIK.MUN4', color: 'Verde', precio_cop: 134000, image: 'images/products/H.BIK.MUN4.jpg' },
      { sku: 'H.BIK.MUN5', color: 'Turquesa', precio_cop: 134000, image: 'images/products/H.BIK.MUN5.jpg' },
      { sku: 'H.BIK.MUN6', color: 'Rojo', precio_cop: 134000, image: 'images/products/H.BIK.MUN6.jpg' },
    ],
  },

  {
    familia:   'Copas y Vasos',
    coleccion: 'Pallina',
    tipo:      'Tumbler',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BIK.PAL1', color: 'Transparente', precio_cop: 133000, image: 'images/products/H.BIK.PAL1.jpg' },
      { sku: 'H.BIK.PAL2', color: 'Azul', precio_cop: 133000, image: 'images/products/H.BIK.PAL2.jpg' },
      { sku: 'H.BIK.PAL3', color: 'Rojo', precio_cop: 133000, image: 'images/products/H.BIK.PAL3.jpg' },
      { sku: 'H.BIK.PAL4', color: 'Verde', precio_cop: 133000, image: 'images/products/H.BIK.PAL4.jpg' },
    ],
  },

  {
    familia:   'Copas y Vasos',
    coleccion: 'Peter',
    tipo:      'Tumbler',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BIK.PET1', color: 'Transparente', precio_cop: 128000, image: 'images/products/H.BIK.PET1.jpg' },
      { sku: 'H.BIK.PET2', color: 'Ámbar', precio_cop: 128000, image: 'images/products/H.BIK.PET2.jpg' },
      { sku: 'H.BIK.PET4', color: 'Verde', precio_cop: 128000, image: 'images/products/H.BIK.PET4.jpg' },
      { sku: 'H.BIK.PET5', color: 'Azul Real', precio_cop: 128000, image: 'images/products/H.BIK.PET5.jpg' },
    ],
  },

  {
    familia:   'Copas y Vasos',
    coleccion: 'Pie',
    tipo:      'Tumbler',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BIK.PIE1', color: 'Transparente', precio_cop: 122000, image: 'images/products/H.BIK.PIE1.jpg' },
      { sku: 'H.BIK.PIE2', color: 'Ámbar', precio_cop: 122000, image: 'images/products/H.BIK.PIE2.jpg' },
      { sku: 'H.BIK.PIE3', color: 'Verde', precio_cop: 122000, image: 'images/products/H.BIK.PIE3.jpg' },
      { sku: 'H.BIK.PIE4', color: 'Azul Real', precio_cop: 122000, image: 'images/products/H.BIK.PIE4.jpg' },
    ],
  },

  {
    familia:   'Copas y Vasos',
    coleccion: 'Panza / Sancho',
    tipo:      'Copa de Vino',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BIK.SAPA1', color: 'Rubí', precio_cop: 128000, image: 'images/products/H.BIK.SAPA1.jpg' },
      { sku: 'H.BIK.SAPA2', color: 'Rubí', precio_cop: 128000, image: 'images/products/H.BIK.SAPA2.jpg' },
      { sku: 'H.BIK.SAPA3', color: 'Verde', precio_cop: 128000, image: 'images/products/H.BIK.SAPA3.jpg' },
    ],
  },

  {
    familia:   'Copas y Vasos',
    coleccion: 'Panza / Sancho',
    tipo:      'Vaso de Agua',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BIK.SAPA10', color: 'Verde', precio_cop: 128000, image: 'images/products/H.BIK.SAPA10.jpg' },
      { sku: 'H.BIK.SAPA8', color: 'Rubí', precio_cop: 128000, image: 'images/products/H.BIK.SAPA8.jpg' },
      { sku: 'H.BIK.SAPA9', color: 'Transparente', precio_cop: 128000, image: 'images/products/H.BIK.SAPA9.jpg' },
    ],
  },

  {
    familia:   'Copas y Vasos',
    coleccion: 'St. Moritz',
    tipo:      'Copa de Vino',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BIK.SCR1', color: 'Transparente', precio_cop: 118000, image: 'images/products/H.BIK.SCR1.jpg' },
      { sku: 'H.BIK.SCR2', color: 'Rojo Bicolor', precio_cop: 118000, image: 'images/products/H.BIK.SCR2.jpg' },
      { sku: 'H.BIK.SCR3', color: 'Azul Real Bicolor', precio_cop: 118000, image: 'images/products/H.BIK.SCR3.jpg' },
      { sku: 'H.BIK.SCR4', color: 'Verde Bicolor', precio_cop: 118000, image: 'images/products/H.BIK.SCR4.jpg' },
    ],
  },

  {
    familia:   'Copas y Vasos',
    coleccion: 'St. Moritz',
    tipo:      'Copa de Vino Alta',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BIK.SCR5', color: 'Transparente', precio_cop: 118000, image: 'images/products/H.BIK.SCR5.jpg' },
      { sku: 'H.BIK.SCR6', color: 'Rojo Bicolor', precio_cop: 118000, image: 'images/products/H.BIK.SCR6.jpg' },
      { sku: 'H.BIK.SCR7', color: 'Azul Real Bicolor', precio_cop: 118000, image: 'images/products/H.BIK.SCR7.jpg' },
      { sku: 'H.BIK.SCR8', color: 'Verde Bicolor', precio_cop: 118000, image: 'images/products/H.BIK.SCR8.jpg' },
    ],
  },

  {
    familia:   'Copas y Vasos',
    coleccion: 'Stella',
    tipo:      'Tumbler',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BIK.STARD.10', color: 'Ámbar', precio_cop: 111000, image: 'images/products/H.BIK.STARD.10.jpg' },
      { sku: 'H.BIK.STARD.3', color: 'Azul', precio_cop: 111000, image: 'images/products/H.BIK.STARD.3.jpg' },
      { sku: 'H.BIK.STARD.4', color: 'Verde', precio_cop: 111000, image: 'images/products/H.BIK.STARD.4.jpg' },
      { sku: 'H.BIK.STARD.5', color: 'Gris', precio_cop: 111000, image: 'images/products/H.BIK.STARD.5.jpg' },
      { sku: 'H.BIK.STARD.6', color: 'Turquesa', precio_cop: 111000, image: 'images/products/H.BIK.STARD.6.jpg' },
      { sku: 'H.BIK.STARD.7', color: 'Blanco', precio_cop: 111000, image: 'images/products/H.BIK.STARD.7.jpg' },
      { sku: 'H.BIK.STARD1', color: 'Transparente', precio_cop: 111000, image: 'images/products/H.BIK.STARD1.jpg' },
      { sku: 'H.BIK.STARD2', color: 'Rojo', precio_cop: 111000, image: 'images/products/H.BIK.STARD2.jpg' },
    ],
  },

  {
    familia:   'Copas y Vasos',
    coleccion: 'Stella',
    tipo:      'Copa de Vino',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BIK.STE1', color: 'Transparente', precio_cop: 141000, image: 'images/products/H.BIK.STE1.jpg' },
      { sku: 'H.BIK.STE2', color: 'Rojo', precio_cop: 141000, image: 'images/products/H.BIK.STE2.jpg' },
      { sku: 'H.BIK.STE3', color: 'Azul', precio_cop: 141000, image: 'images/products/H.BIK.STE3.jpg' },
      { sku: 'H.BIK.STE4', color: 'Verde', precio_cop: 141000, image: 'images/products/H.BIK.STE4.jpg' },
      { sku: 'H.BIK.STE5', color: 'Turquesa', precio_cop: 141000, image: 'images/products/H.BIK.STE5.jpg' },
      { sku: 'H.BIK.STE6', color: 'Ámbar', precio_cop: 141000, image: 'images/products/H.BIK.STE6.jpg' },
      { sku: 'H.BIK.STE7', color: 'Gris', precio_cop: 141000, image: 'images/products/H.BIK.STE7.jpg' },
      { sku: 'H.BIK.STE8', color: 'Blanco', precio_cop: 141000, image: 'images/products/H.BIK.STE8.jpg' },
    ],
  },

  {
    familia:   'Copas y Vasos',
    coleccion: 'Classic Tumbler',
    tipo:      'Tumbler',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BIK.TUM1', color: 'Transparente', precio_cop: 133000, image: 'images/products/H.BIK.TUM1.jpg' },
      { sku: 'H.BIK.TUM15', color: 'Rubí', precio_cop: 133000, image: 'images/products/H.BIK.TUM15.jpg' },
      { sku: 'H.BIK.TUM2', color: 'Blanco Esmerilado', precio_cop: 148000, image: 'images/products/H.BIK.TUM2.jpg' },
    ],
  },

  {
    familia:   'Copas y Vasos',
    coleccion: 'Classic Tumbler',
    tipo:      'Tumbler Grande',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BIK.TUM10', color: 'Transparente', precio_cop: 141000, image: 'images/products/H.BIK.TUM10.jpg' },
      { sku: 'H.BIK.TUM11', color: 'Blanco Esmerilado', precio_cop: 170000, image: 'images/products/H.BIK.TUM11.jpg' },
      { sku: 'H.BIK.TUM12', color: 'Turquesa', precio_cop: 141000, image: 'images/products/H.BIK.TUM12.jpg' },
      { sku: 'H.BIK.TUM13', color: 'Rojo', precio_cop: 141000, image: 'images/products/H.BIK.TUM13.jpg' },
      { sku: 'H.BIK.TUM14', color: 'Verde', precio_cop: 141000, image: 'images/products/H.BIK.TUM14.jpg' },
      { sku: 'H.BIK.TUM16', color: 'Rubí', precio_cop: 141000, image: 'images/products/H.BIK.TUM16.jpg' },
      { sku: 'H.BIK.TUM8', color: 'Ámbar', precio_cop: 141000, image: 'images/products/H.BIK.TUM8.jpg' },
      { sku: 'H.BIK.TUM9', color: 'Azul', precio_cop: 141000, image: 'images/products/H.BIK.TUM9.jpg' },
    ],
  },

  {
    familia:   'Copas y Vasos',
    coleccion: 'Venezia',
    tipo:      'Tumbler',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BIK.VEN1', color: 'Transparente', precio_cop: 96000, image: 'images/products/H.BIK.VEN1.jpg' },
      { sku: 'H.BIK.VEN3', color: 'Verde', precio_cop: 96000, image: 'images/products/H.BIK.VEN3.jpg' },
      { sku: 'H.BIK.VEN4', color: 'Ahumado', precio_cop: 96000, image: 'images/products/H.BIK.VEN4.jpg' },
      { sku: 'H.BIK.VEN6', color: 'Azul Real', precio_cop: 96000, image: 'images/products/H.BIK.VEN6.jpg' },
      { sku: 'H.BIK.VEN7', color: 'Ámbar', precio_cop: 96000, image: 'images/products/H.BIK.VEN7.jpg' },
    ],
  },

  {
    familia:   'Copas y Vasos',
    coleccion: 'David',
    tipo:      'Tumbler',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BIK.VIE1', color: 'Transparente', precio_cop: 111000, image: 'images/products/H.BIK.VIE1.jpg' },
      { sku: 'H.BIK.VIE2', color: 'Rubí', precio_cop: 111000, image: 'images/products/H.BIK.VIE2.jpg' },
      { sku: 'H.BIK.VIE3', color: 'Azul Real', precio_cop: 111000, image: 'images/products/H.BIK.VIE3.jpg' },
      { sku: 'H.BIK.VIE4', color: 'Verde', precio_cop: 111000, image: 'images/products/H.BIK.VIE4.jpg' },
      { sku: 'H.BIK.VIE5', color: 'Gris', precio_cop: 111000, image: 'images/products/H.BIK.VIE5.jpg' },
      { sku: 'H.BIK.VIE8', color: 'Ámbar', precio_cop: 111000, image: 'images/products/H.BIK.VIE8.jpg' },
    ],
  },

  {
    familia:   'Copas y Vasos',
    coleccion: 'Imperial',
    tipo:      'Copa de Vino',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BIK.WIN1', color: 'Transparente', precio_cop: 141000, image: 'images/products/H.BIK.WIN1.jpg' },
      { sku: 'H.BIK.WIN15', color: 'Blanco', precio_cop: 141000, image: 'images/products/H.BIK.WIN15.jpg' },
      { sku: 'H.BIK.WIN2', color: 'Rubí', precio_cop: 141000, image: 'images/products/H.BIK.WIN2.jpg' },
      { sku: 'H.BIK.WIN25', color: 'Dorado', precio_cop: 141000, image: 'images/products/H.BIK.WIN25.jpg' },
      { sku: 'H.BIK.WIN26', color: 'Gris', precio_cop: 141000, image: 'images/products/H.BIK.WIN26.jpg' },
      { sku: 'H.BIK.WIN3', color: 'Azul Real', precio_cop: 141000, image: 'images/products/H.BIK.WIN3.jpg' },
      { sku: 'H.BIK.WIN4', color: 'Verde', precio_cop: 141000, image: 'images/products/H.BIK.WIN4.jpg' },
      { sku: 'H.BIK.WIN5', color: 'Negro', precio_cop: 141000, image: 'images/products/H.BIK.WIN5.jpg' },
    ],
  },

  {
    familia:   'Copas y Vasos',
    coleccion: 'Imperial',
    tipo:      'Flauta',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BIK.WIN10', color: 'Transparente', precio_cop: 141000, image: 'images/products/H.BIK.WIN10.jpg' },
      { sku: 'H.BIK.WIN11', color: 'Azul', precio_cop: 141000, image: 'images/products/H.BIK.WIN11.jpg' },
      { sku: 'H.BIK.WIN12', color: 'Blanco', precio_cop: 141000, image: 'images/products/H.BIK.WIN12.jpg' },
      { sku: 'H.BIK.WIN13', color: 'Verde', precio_cop: 141000, image: 'images/products/H.BIK.WIN13.jpg' },
      { sku: 'H.BIK.WIN20', color: 'Dorado', precio_cop: 141000, image: 'images/products/H.BIK.WIN20.jpg' },
    ],
  },

  {
    familia:   'Copas y Vasos',
    coleccion: 'Imperial',
    tipo:      'Tumbler',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BIK.WIN14', color: 'Azul', precio_cop: 111000, image: 'images/products/H.BIK.WIN14.jpg' },
      { sku: 'H.BIK.WIN16', color: 'Verde', precio_cop: 111000, image: 'images/products/H.BIK.WIN16.jpg' },
      { sku: 'H.BIK.WIN17', color: 'Transparente', precio_cop: 111000, image: 'images/products/H.BIK.WIN17.jpg' },
      { sku: 'H.BIK.WIN18', color: 'Rubí', precio_cop: 111000, image: 'images/products/H.BIK.WIN18.jpg' },
      { sku: 'H.BIK.WIN19', color: 'Negro', precio_cop: 111000, image: 'images/products/H.BIK.WIN19.jpg' },
      { sku: 'H.BIK.WIN21', color: 'Dorado', precio_cop: 111000, image: 'images/products/H.BIK.WIN21.jpg' },
      { sku: 'H.BIK.WIN23', color: 'Gris', precio_cop: 111000, image: 'images/products/H.BIK.WIN23.jpg' },
      { sku: 'H.BIK.WIN24', color: 'Blanco', precio_cop: 111000, image: 'images/products/H.BIK.WIN24.jpg' },
    ],
  },

  {
    familia:   'Copas y Vasos',
    coleccion: 'Imperial',
    tipo:      'Taza',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BIK.WIN27', color: 'Blanco', precio_cop: 134000, image: 'images/products/H.BIK.WIN27.jpg' },
      { sku: 'H.BIK.WIN28', color: 'Verde', precio_cop: 134000, image: 'images/products/H.BIK.WIN28.jpg' },
      { sku: 'H.BIK.WIN8', color: 'Transparente', precio_cop: 134000, image: 'images/products/H.BIK.WIN8.jpg' },
      { sku: 'H.BIK.WIN9', color: 'Azul Real', precio_cop: 134000, image: 'images/products/H.BIK.WIN9.jpg' },
    ],
  },

  // ══════════════════════════════════════════
  // ALZADAS
  // ══════════════════════════════════════════
  {
    familia:   'Alzadas',
    coleccion: 'Girasole',
    tipo:      'Base',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.ALZ.CUP1', color: 'Transparente', precio_cop: 177000, image: 'images/products/H.ALZ.CUP1.jpg' },
    ],
  },

  {
    familia:   'Alzadas',
    coleccion: 'Girasole',
    tipo:      'Cúpula',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.ALZ.GIR1', color: 'Ámbar', precio_cop: 665000, image: 'images/products/H.ALZ.GIR1.jpg' },
      { sku: 'H.ALZ.GIR2', color: 'Transparente', precio_cop: 665000, image: 'images/products/H.ALZ.GIR2.jpg' },
    ],
  },

  {
    familia:   'Alzadas',
    coleccion: 'Ninfea',
    tipo:      'Cúpula',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.ALZ.NIN1', color: 'Ámbar', precio_cop: 370000, image: 'images/products/H.ALZ.NIN1.jpg' },
      { sku: 'H.ALZ.NIN2', color: 'Transparente', precio_cop: 370000, image: 'images/products/H.ALZ.NIN2.jpg' },
      { sku: 'H.ALZ.NIN3', color: 'Rojo', precio_cop: 370000, image: 'images/products/H.ALZ.NIN3.jpg' },
      { sku: 'H.ALZ.NIN4', color: 'Verde', precio_cop: 370000, image: 'images/products/H.ALZ.NIN4.jpg' },
      { sku: 'H.ALZ.NIN5', color: 'Dorado', precio_cop: 414000, image: 'images/products/H.ALZ.NIN5.jpg' },
    ],
  },

  {
    familia:   'Alzadas',
    coleccion: 'Susan',
    tipo:      'Centro de Mesa',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.ALZ.SUS1', color: 'Dorado', precio_cop: 672000, image: 'images/products/H.ALZ.SUS1.jpg' },
      { sku: 'H.ALZ.SUS2', color: 'Rojo', precio_cop: 672000, image: 'images/products/H.ALZ.SUS2.jpg' },
      { sku: 'H.ALZ.SUS3', color: 'Transparente', precio_cop: 672000, image: 'images/products/H.ALZ.SUS3.jpg' },
      { sku: 'H.ALZ.SUS4', color: 'Verde', precio_cop: 672000, image: 'images/products/H.ALZ.SUS4.jpg' },
    ],
  },

  // ══════════════════════════════════════════
  // ENSALADERAS
  // ══════════════════════════════════════════
  {
    familia:   'Ensaladeras',
    coleccion: 'Churchill / Elena',
    tipo:      'Ensaladera',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.INS.CHU1', color: 'Rojo', precio_cop: 444000, image: 'images/products/H.INS.CHU1.jpg' },
      { sku: 'H.INS.CHU2', color: 'Transparente', precio_cop: 444000, image: 'images/products/H.INS.CHU2.jpg' },
      { sku: 'H.INS.CHU4', color: 'Verde', precio_cop: 444000, image: 'images/products/H.INS.CHU4.jpg' },
      { sku: 'H.INS.CHU5', color: 'Blanco', precio_cop: 444000, image: 'images/products/H.INS.CHU5.jpg' },
    ],
  },

  {
    familia:   'Ensaladeras',
    coleccion: 'Churchill / Elena',
    tipo:      'Bol Pequeño',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.INS.CHU11', color: 'Dorado', precio_cop: 134000, image: 'images/products/H.INS.CHU11.jpg' },
    ],
  },

  {
    familia:   'Ensaladeras',
    coleccion: 'Lente',
    tipo:      'Ensaladera',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.INS.LEN1', color: 'Azul', precio_cop: 355000, image: 'images/products/H.INS.LEN1.jpg' },
      { sku: 'H.INS.LEN2', color: 'Transparente', precio_cop: 355000, image: 'images/products/H.INS.LEN2.jpg' },
      { sku: 'H.INS.LEN3', color: 'Blanco', precio_cop: 355000, image: 'images/products/H.INS.LEN3.jpg' },
      { sku: 'H.INS.LEN4', color: 'Rojo', precio_cop: 355000, image: 'images/products/H.INS.LEN4.jpg' },
      { sku: 'H.INS.LEN5', color: 'Turquesa', precio_cop: 355000, image: 'images/products/H.INS.LEN5.jpg' },
    ],
  },

  {
    familia:   'Ensaladeras',
    coleccion: 'Lente',
    tipo:      'Bol Pequeño',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.INS.LEN10', color: 'Turquesa', precio_cop: 118000, image: 'images/products/H.INS.LEN10.jpg' },
      { sku: 'H.INS.LEN6', color: 'Azul', precio_cop: 118000, image: 'images/products/H.INS.LEN6.jpg' },
      { sku: 'H.INS.LEN7', color: 'Transparente', precio_cop: 118000, image: 'images/products/H.INS.LEN7.jpg' },
      { sku: 'H.INS.LEN8', color: 'Blanco', precio_cop: 118000, image: 'images/products/H.INS.LEN8.jpg' },
      { sku: 'H.INS.LEN9', color: 'Rojo', precio_cop: 118000, image: 'images/products/H.INS.LEN9.jpg' },
    ],
  },

  {
    familia:   'Ensaladeras',
    coleccion: 'Supernova',
    tipo:      'Ensaladera',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.INS.MIL1', color: 'Transparente', precio_cop: 621000, image: 'images/products/H.INS.MIL1.jpg' },
      { sku: 'H.INS.MIL2', color: 'Rojo', precio_cop: 621000, image: 'images/products/H.INS.MIL2.jpg' },
      { sku: 'H.INS.MIL3', color: 'Azul Real', precio_cop: 621000, image: 'images/products/H.INS.MIL3.jpg' },
      { sku: 'H.INS.MIL4', color: 'Verde', precio_cop: 621000, image: 'images/products/H.INS.MIL4.jpg' },
      { sku: 'H.INS.MIL5', color: 'Ámbar', precio_cop: 621000, image: 'images/products/H.INS.MIL5.jpg' },
    ],
  },

  // ══════════════════════════════════════════
  // PLATOS
  // ══════════════════════════════════════════
  {
    familia:   'Platos',
    coleccion: 'Eva',
    tipo:      'Bandeja',
    medidas:   '—',
    material:  'Melamina',
    variantes: [
      { sku: 'H.PIA.EVA1', color: 'Marfil/Gris', precio_cop: 550000, image: 'images/products/H.PIA.EVA1.jpg' },
    ],
  },

  {
    familia:   'Platos',
    coleccion: 'Eva',
    tipo:      'Plato Mediano',
    medidas:   '—',
    material:  'Melamina',
    variantes: [
      { sku: 'H.PIA.EVA10', color: 'Rojo', precio_cop: 159000, image: 'images/products/H.PIA.EVA10.jpg' },
      { sku: 'H.PIA.EVA11', color: 'Azul Real', precio_cop: 159000, image: 'images/products/H.PIA.EVA11.jpg' },
      { sku: 'H.PIA.EVA12', color: 'Gris', precio_cop: 159000, image: 'images/products/H.PIA.EVA12.jpg' },
    ],
  },

  {
    familia:   'Platos',
    coleccion: 'Eva',
    tipo:      'Plato Sopero',
    medidas:   '—',
    material:  'Melamina',
    variantes: [
      { sku: 'H.PIA.EVA2', color: 'Rojo', precio_cop: 128000, image: 'images/products/H.PIA.EVA2.jpg' },
      { sku: 'H.PIA.EVA3', color: 'Azul Real', precio_cop: 128000, image: 'images/products/H.PIA.EVA3.jpg' },
      { sku: 'H.PIA.EVA4', color: 'Gris', precio_cop: 128000, image: 'images/products/H.PIA.EVA4.jpg' },
    ],
  },

  {
    familia:   'Platos',
    coleccion: 'Eva',
    tipo:      'Plato Pequeño',
    medidas:   '—',
    material:  'Melamina',
    variantes: [
      { sku: 'H.PIA.EVA6', color: 'Rojo', precio_cop: 128000, image: 'images/products/H.PIA.EVA6.jpg' },
      { sku: 'H.PIA.EVA7', color: 'Azul Real', precio_cop: 128000, image: 'images/products/H.PIA.EVA7.jpg' },
      { sku: 'H.PIA.EVA8', color: 'Gris', precio_cop: 128000, image: 'images/products/H.PIA.EVA8.jpg' },
    ],
  },

  {
    familia:   'Platos',
    coleccion: 'Lapislazzulo',
    tipo:      'Plato Sopero',
    medidas:   '—',
    material:  'Melamina',
    variantes: [
      { sku: 'H.PIA.LAP1', color: 'Transparente', precio_cop: 124000, image: 'images/products/H.PIA.LAP1.jpg' },
    ],
  },

  {
    familia:   'Platos',
    coleccion: 'Lapislazzulo',
    tipo:      'Plato Pequeño',
    medidas:   '—',
    material:  'Melamina',
    variantes: [
      { sku: 'H.PIA.LAP2', color: 'Transparente', precio_cop: 124000, image: 'images/products/H.PIA.LAP2.jpg' },
    ],
  },

  {
    familia:   'Platos',
    coleccion: 'Lapislazzulo',
    tipo:      'Plato Mediano',
    medidas:   '—',
    material:  'Melamina',
    variantes: [
      { sku: 'H.PIA.LAP3', color: 'Transparente', precio_cop: 155000, image: 'images/products/H.PIA.LAP3.jpg' },
    ],
  },

  {
    familia:   'Platos',
    coleccion: 'Lapislazzulo',
    tipo:      'Plato Base',
    medidas:   '—',
    material:  'Melamina',
    variantes: [
      { sku: 'H.PIA.LAP4', color: 'Transparente', precio_cop: 266000, image: 'images/products/H.PIA.LAP4.jpg' },
    ],
  },

  {
    familia:   'Platos',
    coleccion: 'Maria',
    tipo:      'Plato Sopero',
    medidas:   '—',
    material:  'Melamina',
    variantes: [
      { sku: 'H.PIA.MAR1', color: 'Marfil', precio_cop: 124000, image: 'images/products/H.PIA.MAR1.jpg' },
      { sku: 'H.PIA.MAR2', color: 'Naranja', precio_cop: 124000, image: 'images/products/H.PIA.MAR2.jpg' },
      { sku: 'H.PIA.MAR3', color: 'Turquesa', precio_cop: 124000, image: 'images/products/H.PIA.MAR3.jpg' },
      { sku: 'H.PIA.MAR4', color: 'Verde', precio_cop: 124000, image: 'images/products/H.PIA.MAR4.jpg' },
      { sku: 'H.PIA.MAR5', color: 'Rojo', precio_cop: 124000, image: 'images/products/H.PIA.MAR5.jpg' },
    ],
  },

  {
    familia:   'Platos',
    coleccion: 'Maria',
    tipo:      'Plato Pequeño',
    medidas:   '—',
    material:  'Melamina',
    variantes: [
      { sku: 'H.PIA.MAR10', color: 'Rojo', precio_cop: 124000, image: 'images/products/H.PIA.MAR10.jpg' },
      { sku: 'H.PIA.MAR6', color: 'Marfil', precio_cop: 124000, image: 'images/products/H.PIA.MAR6.jpg' },
      { sku: 'H.PIA.MAR7', color: 'Naranja', precio_cop: 124000, image: 'images/products/H.PIA.MAR7.jpg' },
      { sku: 'H.PIA.MAR8', color: 'Turquesa', precio_cop: 124000, image: 'images/products/H.PIA.MAR8.jpg' },
      { sku: 'H.PIA.MAR9', color: 'Verde', precio_cop: 124000, image: 'images/products/H.PIA.MAR9.jpg' },
    ],
  },

  {
    familia:   'Platos',
    coleccion: 'Maria',
    tipo:      'Plato Mediano',
    medidas:   '—',
    material:  'Melamina',
    variantes: [
      { sku: 'H.PIA.MAR11', color: 'Marfil', precio_cop: 155000, image: 'images/products/H.PIA.MAR11.jpg' },
      { sku: 'H.PIA.MAR12', color: 'Naranja', precio_cop: 155000, image: 'images/products/H.PIA.MAR12.jpg' },
      { sku: 'H.PIA.MAR13', color: 'Turquesa', precio_cop: 155000, image: 'images/products/H.PIA.MAR13.jpg' },
      { sku: 'H.PIA.MAR14', color: 'Verde', precio_cop: 155000, image: 'images/products/H.PIA.MAR14.jpg' },
      { sku: 'H.PIA.MAR15', color: 'Rojo', precio_cop: 155000, image: 'images/products/H.PIA.MAR15.jpg' },
    ],
  },

  {
    familia:   'Platos',
    coleccion: 'Pancale',
    tipo:      'Plato Sopero',
    medidas:   '—',
    material:  'Melamina',
    variantes: [
      { sku: 'H.PIA.PAN1', color: 'Blanco', precio_cop: 124000, image: 'images/products/H.PIA.PAN1.jpg' },
      { sku: 'H.PIA.PAN2', color: 'Naranja', precio_cop: 124000, image: 'images/products/H.PIA.PAN2.jpg' },
      { sku: 'H.PIA.PAN21', color: 'Azul', precio_cop: 124000, image: 'images/products/H.PIA.PAN21.jpg' },
      { sku: 'H.PIA.PAN3', color: 'Turquesa', precio_cop: 124000, image: 'images/products/H.PIA.PAN3.jpg' },
      { sku: 'H.PIA.PAN4', color: 'Verde', precio_cop: 124000, image: 'images/products/H.PIA.PAN4.jpg' },
      { sku: 'H.PIA.PAN5', color: 'Amarillo', precio_cop: 124000, image: 'images/products/H.PIA.PAN5.jpg' },
    ],
  },

  {
    familia:   'Platos',
    coleccion: 'Pancale',
    tipo:      'Plato Pequeño',
    medidas:   '—',
    material:  'Melamina',
    variantes: [
      { sku: 'H.PIA.PAN10', color: 'Amarillo', precio_cop: 124000, image: 'images/products/H.PIA.PAN10.jpg' },
      { sku: 'H.PIA.PAN22', color: 'Azul', precio_cop: 124000, image: 'images/products/H.PIA.PAN22.jpg' },
      { sku: 'H.PIA.PAN6', color: 'Blanco', precio_cop: 124000, image: 'images/products/H.PIA.PAN6.jpg' },
      { sku: 'H.PIA.PAN7', color: 'Naranja', precio_cop: 124000, image: 'images/products/H.PIA.PAN7.jpg' },
      { sku: 'H.PIA.PAN8', color: 'Turquesa', precio_cop: 124000, image: 'images/products/H.PIA.PAN8.jpg' },
      { sku: 'H.PIA.PAN9', color: 'Verde', precio_cop: 124000, image: 'images/products/H.PIA.PAN9.jpg' },
    ],
  },

  {
    familia:   'Platos',
    coleccion: 'Pancale',
    tipo:      'Plato Mediano',
    medidas:   '—',
    material:  'Melamina',
    variantes: [
      { sku: 'H.PIA.PAN11', color: 'Blanco', precio_cop: 155000, image: 'images/products/H.PIA.PAN11.jpg' },
      { sku: 'H.PIA.PAN12', color: 'Naranja', precio_cop: 155000, image: 'images/products/H.PIA.PAN12.jpg' },
      { sku: 'H.PIA.PAN13', color: 'Turquesa', precio_cop: 155000, image: 'images/products/H.PIA.PAN13.jpg' },
      { sku: 'H.PIA.PAN14', color: 'Verde', precio_cop: 155000, image: 'images/products/H.PIA.PAN14.jpg' },
      { sku: 'H.PIA.PAN15', color: 'Amarillo', precio_cop: 155000, image: 'images/products/H.PIA.PAN15.jpg' },
      { sku: 'H.PIA.PAN23', color: 'Azul', precio_cop: 155000, image: 'images/products/H.PIA.PAN23.jpg' },
    ],
  },

  {
    familia:   'Platos',
    coleccion: 'Patagonia',
    tipo:      'Plato Pequeño',
    medidas:   '—',
    material:  'Melamina',
    variantes: [
      { sku: 'H.PIA.PAT10', color: 'Amarillo', precio_cop: 124000, image: 'images/products/H.PIA.PAT10.jpg' },
      { sku: 'H.PIA.PAT7', color: 'Azul', precio_cop: 124000, image: 'images/products/H.PIA.PAT7.jpg' },
    ],
  },

  {
    familia:   'Platos',
    coleccion: 'Patagonia',
    tipo:      'Plato Mediano',
    medidas:   '—',
    material:  'Melamina',
    variantes: [
      { sku: 'H.PIA.PAT12', color: 'Azul', precio_cop: 155000, image: 'images/products/H.PIA.PAT12.jpg' },
      { sku: 'H.PIA.PAT13', color: 'Verde', precio_cop: 155000, image: 'images/products/H.PIA.PAT13.jpg' },
      { sku: 'H.PIA.PAT15', color: 'Amarillo', precio_cop: 155000, image: 'images/products/H.PIA.PAT15.jpg' },
    ],
  },

  {
    familia:   'Platos',
    coleccion: 'Patagonia',
    tipo:      'Plato Sopero',
    medidas:   '—',
    material:  'Melamina',
    variantes: [
      { sku: 'H.PIA.PAT2', color: 'Azul', precio_cop: 124000, image: 'images/products/H.PIA.PAT2.jpg' },
      { sku: 'H.PIA.PAT3', color: 'Verde', precio_cop: 124000, image: 'images/products/H.PIA.PAT3.jpg' },
      { sku: 'H.PIA.PAT5', color: 'Amarillo', precio_cop: 124000, image: 'images/products/H.PIA.PAT5.jpg' },
    ],
  },

  {
    familia:   'Platos',
    coleccion: 'Patagonia',
    tipo:      'Plato Base',
    medidas:   '—',
    material:  'Melamina',
    variantes: [
      { sku: 'H.PIA.PAT22', color: 'Azul', precio_cop: 266000, image: 'images/products/H.PIA.PAT22.jpg' },
      { sku: 'H.PIA.PAT23', color: 'Verde', precio_cop: 266000, image: 'images/products/H.PIA.PAT23.jpg' },
      { sku: 'H.PIA.PAT25', color: 'Amarillo', precio_cop: 266000, image: 'images/products/H.PIA.PAT25.jpg' },
    ],
  },

  {
    familia:   'Platos',
    coleccion: 'Saint Tropez',
    tipo:      'Plato Pequeño',
    medidas:   '—',
    material:  'Melamina',
    variantes: [
      { sku: 'H.PIA.VIE1', color: 'Naranja', precio_cop: 124000, image: 'images/products/H.PIA.VIE1.jpg' },
      { sku: 'H.PIA.VIE2', color: 'Amarillo', precio_cop: 124000, image: 'images/products/H.PIA.VIE2.jpg' },
      { sku: 'H.PIA.VIE3', color: 'Verde', precio_cop: 124000, image: 'images/products/H.PIA.VIE3.jpg' },
      { sku: 'H.PIA.VIE5', color: 'Turquesa', precio_cop: 124000, image: 'images/products/H.PIA.VIE5.jpg' },
      { sku: 'H.PIA.VIE6', color: 'Azul', precio_cop: 124000, image: 'images/products/H.PIA.VIE6.jpg' },
    ],
  },

  {
    familia:   'Platos',
    coleccion: 'Saint Tropez',
    tipo:      'Plato Mediano',
    medidas:   '—',
    material:  'Melamina',
    variantes: [
      { sku: 'H.PIA.VIE11', color: 'Turquesa', precio_cop: 155000, image: 'images/products/H.PIA.VIE11.jpg' },
      { sku: 'H.PIA.VIE12', color: 'Azul', precio_cop: 155000, image: 'images/products/H.PIA.VIE12.jpg' },
      { sku: 'H.PIA.VIE7', color: 'Naranja', precio_cop: 155000, image: 'images/products/H.PIA.VIE7.jpg' },
      { sku: 'H.PIA.VIE8', color: 'Amarillo', precio_cop: 155000, image: 'images/products/H.PIA.VIE8.jpg' },
      { sku: 'H.PIA.VIE9', color: 'Verde', precio_cop: 155000, image: 'images/products/H.PIA.VIE9.jpg' },
    ],
  },

  {
    familia:   'Platos',
    coleccion: 'Saint Tropez',
    tipo:      'Plato Sopero',
    medidas:   '—',
    material:  'Melamina',
    variantes: [
      { sku: 'H.PIA.VIE13', color: 'Naranja', precio_cop: 124000, image: 'images/products/H.PIA.VIE13.jpg' },
      { sku: 'H.PIA.VIE14', color: 'Amarillo', precio_cop: 124000, image: 'images/products/H.PIA.VIE14.jpg' },
      { sku: 'H.PIA.VIE15', color: 'Verde', precio_cop: 124000, image: 'images/products/H.PIA.VIE15.jpg' },
      { sku: 'H.PIA.VIE17', color: 'Turquesa', precio_cop: 124000, image: 'images/products/H.PIA.VIE17.jpg' },
      { sku: 'H.PIA.VIE18', color: 'Azul', precio_cop: 124000, image: 'images/products/H.PIA.VIE18.jpg' },
    ],
  },

  // ══════════════════════════════════════════
  // COMPLEMENTOS
  // ══════════════════════════════════════════
  {
    familia:   'Jarras y Botellas',
    coleccion: 'Aquarama',
    tipo:      'Botella',
    medidas:   '1.0 L',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BOT.AQU1', color: 'Rubí', precio_cop: 384000, image: 'images/products/H.BOT.AQU1.jpg' },
      { sku: 'H.BOT.AQU2', color: 'Verde', precio_cop: 384000, image: 'images/products/H.BOT.AQU2.jpg' },
      { sku: 'H.BOT.AQU3', color: 'Azul Real', precio_cop: 384000, image: 'images/products/H.BOT.AQU3.jpg' },
      { sku: 'H.BOT.AQU4', color: 'Transparente', precio_cop: 384000, image: 'images/products/H.BOT.AQU4.jpg' },
    ],
  },

  {
    familia:   'Jarras y Botellas',
    coleccion: 'Bona',
    tipo:      'Botella Noche',
    medidas:   '0.65 L',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BOT.BONA10', color: 'night Azul', precio_cop: 207000, image: 'images/products/H.BOT.BONA10.jpg' },
      { sku: 'H.BOT.BONA7', color: 'night Verde', precio_cop: 207000, image: 'images/products/H.BOT.BONA7.jpg' },
      { sku: 'H.BOT.BONA9', color: 'night Transparente', precio_cop: 207000, image: 'images/products/H.BOT.BONA9.jpg' },
    ],
  },

  {
    familia:   'Jarras y Botellas',
    coleccion: 'Bona',
    tipo:      'Botella',
    medidas:   '1.0 L',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BOT.BONA16', color: 'Esmerilado', precio_cop: 348000, image: 'images/products/H.BOT.BONA16.jpg' },
      { sku: 'H.BOT.BONA2', color: 'Verde', precio_cop: 325000, image: 'images/products/H.BOT.BONA2.jpg' },
      { sku: 'H.BOT.BONA3', color: 'Rubí', precio_cop: 325000, image: 'images/products/H.BOT.BONA3.jpg' },
      { sku: 'H.BOT.BONA4', color: 'Azul', precio_cop: 325000, image: 'images/products/H.BOT.BONA4.jpg' },
    ],
  },

  {
    familia:   'Jarras y Botellas',
    coleccion: 'Manfredo',
    tipo:      'Botella',
    medidas:   '1.0 L',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BOT.MAN1', color: 'Ámbar', precio_cop: 550000, image: 'images/products/H.BOT.MAN1.jpg' },
      { sku: 'H.BOT.MAN2', color: 'Transparente', precio_cop: 550000, image: 'images/products/H.BOT.MAN2.jpg' },
      { sku: 'H.BOT.MAN4', color: 'Gris', precio_cop: 550000, image: 'images/products/H.BOT.MAN4.jpg' },
      { sku: 'H.BOT.MAN6', color: 'Verde', precio_cop: 550000, image: 'images/products/H.BOT.MAN6.jpg' },
    ],
  },

  {
    familia:   'Jarras y Botellas',
    coleccion: 'Orsetta',
    tipo:      'Botella',
    medidas:   '1.35 L',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BOT.ORS1', color: 'Blanco Gloss', precio_cop: 550000, image: 'images/products/H.BOT.ORS1.jpg' },
      { sku: 'H.BOT.ORS2', color: 'Azul Real', precio_cop: 550000, image: 'images/products/H.BOT.ORS2.jpg' },
      { sku: 'H.BOT.ORS3', color: 'Verde', precio_cop: 550000, image: 'images/products/H.BOT.ORS3.jpg' },
      { sku: 'H.BOT.ORS4', color: 'Transparente', precio_cop: 550000, image: 'images/products/H.BOT.ORS4.jpg' },
    ],
  },

  {
    familia:   'Jarras y Botellas',
    coleccion: 'Susy',
    tipo:      'Vinagrera',
    medidas:   '150 ml c/u',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BOT5', color: 'Transparente', precio_cop: 497000, image: 'images/products/H.BOT5.jpg' },
      { sku: 'H.BOT7', color: 'Rojo', precio_cop: 497000, image: 'images/products/H.BOT7.jpg' },
    ],
  },

  {
    familia:   'Jarras y Botellas',
    coleccion: 'Susy',
    tipo:      'Botella',
    medidas:   '150 ml',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BOT9', color: 'Transparente', precio_cop: 92000, image: 'images/products/H.BOT9.jpg' },
    ],
  },

  {
    familia:   'Jarras y Botellas',
    coleccion: 'Palla',
    tipo:      'Jarra',
    medidas:   '3.0 L',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BRO.DIA21', color: 'Transparente', precio_cop: 355000, image: 'images/products/H.BRO.DIA21.jpg' },
      { sku: 'H.BRO.DIA22', color: 'Rojo', precio_cop: 355000, image: 'images/products/H.BRO.DIA22.jpg' },
      { sku: 'H.BRO.DIA23', color: 'Verde Oscuro', precio_cop: 355000, image: 'images/products/H.BRO.DIA23.jpg' },
      { sku: 'H.BRO.DIA24', color: 'Azul Real', precio_cop: 355000, image: 'images/products/H.BRO.DIA24.jpg' },
      { sku: 'H.BRO.DIA34', color: 'Rojo Gloss', precio_cop: 355000, image: 'images/products/H.BRO.DIA34.jpg' },
      { sku: 'H.BRO.DIA36', color: 'Blanco Gloss', precio_cop: 355000, image: 'images/products/H.BRO.DIA36.jpg' },
      { sku: 'H.BRO.DIA37', color: 'Turquesa Gloss', precio_cop: 355000, image: 'images/products/H.BRO.DIA37.jpg' },
      { sku: 'H.BRO.DIA41', color: 'Ámbar', precio_cop: 355000, image: 'images/products/H.BRO.DIA41.jpg' },
      { sku: 'H.BRO.DIA44', color: 'Aguamarina Gloss', precio_cop: 355000, image: 'images/products/H.BRO.DIA44.jpg' },
      { sku: 'H.BRO.DIA45', color: 'Fucsia Flúo Gloss', precio_cop: 355000, image: 'images/products/H.BRO.DIA45.jpg' },
      { sku: 'H.BRO.DIA46', color: 'Naranja Flúo Gloss', precio_cop: 355000, image: 'images/products/H.BRO.DIA46.jpg' },
      { sku: 'H.BRO.DIA47', color: 'Verde Flúo Gloss', precio_cop: 355000, image: 'images/products/H.BRO.DIA47.jpg' },
      { sku: 'H.BRO.DIA48', color: 'Blanco Opaco', precio_cop: 355000, image: 'images/products/H.BRO.DIA48.jpg' },
      { sku: 'H.BRO.DIA49', color: 'Naranja/Verde', precio_cop: 355000, image: 'images/products/H.BRO.DIA49.jpg' },
      { sku: 'H.BRO.DIA50', color: 'Amarillo Gloss', precio_cop: 355000, image: 'images/products/H.BRO.DIA50.jpg' },
      { sku: 'H.BRO.DIA51', color: 'Gris', precio_cop: 355000, image: 'images/products/H.BRO.DIA51.jpg' },
      { sku: 'H.BRO.DIA52', color: 'Rosa', precio_cop: 355000, image: 'images/products/H.BRO.DIA52.jpg' },
    ],
  },

  {
    familia:   'Jarras y Botellas',
    coleccion: 'Federica',
    tipo:      'Jarra',
    medidas:   '1.2 L',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BRO.FED1', color: 'Transparente', precio_cop: 370000, image: 'images/products/H.BRO.FED1.jpg' },
      { sku: 'H.BRO.FED10', color: 'Gris', precio_cop: 370000, image: 'images/products/H.BRO.FED10.jpg' },
      { sku: 'H.BRO.FED3', color: 'Verde', precio_cop: 370000, image: 'images/products/H.BRO.FED3.jpg' },
      { sku: 'H.BRO.FED5', color: 'Rubí', precio_cop: 370000, image: 'images/products/H.BRO.FED5.jpg' },
      { sku: 'H.BRO.FED6', color: 'Blanco Gloss', precio_cop: 370000, image: 'images/products/H.BRO.FED6.jpg' },
      { sku: 'H.BRO.FED7', color: 'Azul', precio_cop: 370000, image: 'images/products/H.BRO.FED7.jpg' },
    ],
  },

  {
    familia:   'Jarras y Botellas',
    coleccion: 'Gene Krupa',
    tipo:      'Jarra',
    medidas:   '1.5 L',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BRO.GENE1', color: 'Transparente', precio_cop: 428000, image: 'images/products/H.BRO.GENE1.jpg' },
      { sku: 'H.BRO.GENE2', color: 'Blanco Gloss', precio_cop: 428000, image: 'images/products/H.BRO.GENE2.jpg' },
      { sku: 'H.BRO.GENE3', color: 'Azul Real', precio_cop: 428000, image: 'images/products/H.BRO.GENE3.jpg' },
      { sku: 'H.BRO.GENE4', color: 'Rubí', precio_cop: 428000, image: 'images/products/H.BRO.GENE4.jpg' },
      { sku: 'H.BRO.GENE5', color: 'Verde', precio_cop: 428000, image: 'images/products/H.BRO.GENE5.jpg' },
      { sku: 'H.BRO.GENE6', color: 'Ámbar', precio_cop: 428000, image: 'images/products/H.BRO.GENE6.jpg' },
    ],
  },

  {
    familia:   'Jarras y Botellas',
    coleccion: 'Halina',
    tipo:      'Jarra',
    medidas:   '1.6 L',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BRO.HAL1', color: 'Transparente', precio_cop: 399000, image: 'images/products/H.BRO.HAL1.jpg' },
      { sku: 'H.BRO.HAL2', color: 'Rojo', precio_cop: 399000, image: 'images/products/H.BRO.HAL2.jpg' },
      { sku: 'H.BRO.HAL3', color: 'Azul Real', precio_cop: 399000, image: 'images/products/H.BRO.HAL3.jpg' },
      { sku: 'H.BRO.HAL4', color: 'Verde', precio_cop: 399000, image: 'images/products/H.BRO.HAL4.jpg' },
      { sku: 'H.BRO.HAL5', color: 'Turquesa', precio_cop: 399000, image: 'images/products/H.BRO.HAL5.jpg' },
      { sku: 'H.BRO.HAL6', color: 'Dorado', precio_cop: 517000, image: 'images/products/H.BRO.HAL6.jpg' },
      { sku: 'H.BRO.HAL7', color: 'Gris', precio_cop: 399000, image: 'images/products/H.BRO.HAL7.jpg' },
    ],
  },

  {
    familia:   'Jarras y Botellas',
    coleccion: 'Maria',
    tipo:      'Jarra',
    medidas:   '0.75 L',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BRO.MAR3', color: 'Morado', precio_cop: 222000, image: 'images/products/H.BRO.MAR3.jpg' },
      { sku: 'H.BRO.MAR6', color: 'Blanco Gloss', precio_cop: 222000, image: 'images/products/H.BRO.MAR6.jpg' },
    ],
  },

  {
    familia:   'Jarras y Botellas',
    coleccion: 'Pallina',
    tipo:      'Jarra',
    medidas:   '2.0 L',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BRO.PAL1', color: 'Transparente', precio_cop: 325000, image: 'images/products/H.BRO.PAL1.jpg' },
      { sku: 'H.BRO.PAL10', color: 'Blanco/Mango Fluorescente', precio_cop: 325000, image: 'images/products/H.BRO.PAL10.jpg' },
      { sku: 'H.BRO.PAL11', color: 'Gris', precio_cop: 325000, image: 'images/products/H.BRO.PAL11.jpg' },
      { sku: 'H.BRO.PAL12', color: 'Amarillo/Mango Rojo', precio_cop: 325000, image: 'images/products/H.BRO.PAL12.jpg' },
      { sku: 'H.BRO.PAL13', color: 'Verde Oliva Gloss', precio_cop: 325000, image: 'images/products/H.BRO.PAL13.jpg' },
      { sku: 'H.BRO.PAL2', color: 'Blanco Gloss', precio_cop: 325000, image: 'images/products/H.BRO.PAL2.jpg' },
      { sku: 'H.BRO.PAL3', color: 'Rosa Opaco', precio_cop: 325000, image: 'images/products/H.BRO.PAL3.jpg' },
      { sku: 'H.BRO.PAL4', color: 'Amarillo Gloss', precio_cop: 325000, image: 'images/products/H.BRO.PAL4.jpg' },
      { sku: 'H.BRO.PAL5', color: 'Azul/Mango Verde', precio_cop: 325000, image: 'images/products/H.BRO.PAL5.jpg' },
      { sku: 'H.BRO.PAL6', color: 'Rubí/Mango Verde', precio_cop: 325000, image: 'images/products/H.BRO.PAL6.jpg' },
      { sku: 'H.BRO.PAL8', color: 'Rojo', precio_cop: 325000, image: 'images/products/H.BRO.PAL8.jpg' },
      { sku: 'H.BRO.PAL9', color: 'Turquesa/Mango Rubí', precio_cop: 325000, image: 'images/products/H.BRO.PAL9.jpg' },
    ],
  },

  {
    familia:   'Jarras y Botellas',
    coleccion: 'Plutone',
    tipo:      'Jarra',
    medidas:   '1.4 L',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BRO.PLU13', color: 'Negro Gloss', precio_cop: 296000, image: 'images/products/H.BRO.PLU13jpg.jpg' },
      { sku: 'H.BRO.PLU3', color: 'Azul Real', precio_cop: 296000, image: 'images/products/H.BRO.PLU3.jpg' },
      { sku: 'H.BRO.PLU4', color: 'Verde', precio_cop: 296000, image: 'images/products/H.BRO.PLU4.jpg' },
      { sku: 'H.BRO.PLU5', color: 'Amarillo Gloss/Mango Rojo', precio_cop: 296000, image: 'images/products/H.BRO.PLU5.jpg' },
      { sku: 'H.BRO.PLU7', color: 'Rojo', precio_cop: 296000, image: 'images/products/H.BRO.PLU7.jpg' },
      { sku: 'H.BRO.PLU8', color: 'Dorado', precio_cop: 325000, image: 'images/products/H.BRO.PLU8.jpg' },
      { sku: 'H.BRO.PLU9', color: 'Blanco Esmerilado', precio_cop: 296000, image: 'images/products/H.BRO.PLU9.jpg' },
    ],
  },

  {
    familia:   'Jarras y Botellas',
    coleccion: 'Roberta',
    tipo:      'Jarra',
    medidas:   '1.2 L',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BRO.ROB1', color: 'Transparente', precio_cop: 414000, image: 'images/products/H.BRO.ROB1.jpg' },
      { sku: 'H.BRO.ROB11', color: 'Turquesa', precio_cop: 414000, image: 'images/products/H.BRO.ROB11.jpg' },
      { sku: 'H.BRO.ROB12', color: 'Dorado', precio_cop: 444000, image: 'images/products/H.BRO.ROB12.jpg' },
      { sku: 'H.BRO.ROB2', color: 'Blanco Gloss', precio_cop: 414000, image: 'images/products/H.BRO.ROB2.jpg' },
      { sku: 'H.BRO.ROB3', color: 'Rubí', precio_cop: 414000, image: 'images/products/H.BRO.ROB3.jpg' },
      { sku: 'H.BRO.ROB4', color: 'Verde', precio_cop: 414000, image: 'images/products/H.BRO.ROB4.jpg' },
      { sku: 'H.BRO.ROB6', color: 'Azul', precio_cop: 414000, image: 'images/products/H.BRO.ROB6.jpg' },
    ],
  },

  {
    familia:   'Jarras y Botellas',
    coleccion: 'Sister Rosetta',
    tipo:      'Jarra',
    medidas:   '2.4 L',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BRO.SIS1', color: 'Blanco Gloss', precio_cop: 574000, image: 'images/products/H.BRO.SIS1.jpg' },
      { sku: 'H.BRO.SIS10', color: 'Fucsia Flúo', precio_cop: 574000, image: 'images/products/H.BRO.SIS10.jpg' },
      { sku: 'H.BRO.SIS2', color: 'Verde', precio_cop: 574000, image: 'images/products/H.BRO.SIS2.jpg' },
      { sku: 'H.BRO.SIS3', color: 'Transparente', precio_cop: 574000, image: 'images/products/H.BRO.SIS3.jpg' },
      { sku: 'H.BRO.SIS4', color: 'Rubí', precio_cop: 574000, image: 'images/products/H.BRO.SIS4.jpg' },
      { sku: 'H.BRO.SIS5', color: 'Ámbar', precio_cop: 574000, image: 'images/products/H.BRO.SIS5.jpg' },
      { sku: 'H.BRO.SIS6', color: 'Azul', precio_cop: 574000, image: 'images/products/H.BRO.SIS6.jpg' },
      { sku: 'H.BRO.SIS7', color: 'Amarillo Gloss', precio_cop: 574000, image: 'images/products/H.BRO.SIS7.jpg' },
      { sku: 'H.BRO.SIS8', color: 'Turquesa Glaze', precio_cop: 574000, image: 'images/products/H.BRO.SIS8.jpg' },
      { sku: 'H.BRO.SIS9', color: 'Naranja Flúo', precio_cop: 574000, image: 'images/products/H.BRO.SIS9.jpg' },
    ],
  },

  {
    familia:   'Jarras y Botellas',
    coleccion: 'Imperial',
    tipo:      'Jarra',
    medidas:   '1.5 L',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.BRO.WIN1', color: 'Transparente', precio_cop: 672000, image: 'images/products/H.BRO.WIN1.jpg' },
      { sku: 'H.BRO.WIN2', color: 'Blanco Gloss', precio_cop: 672000, image: 'images/products/H.BRO.WIN2. jpg.jpg' },
      { sku: 'H.BRO.WIN3', color: 'Verde', precio_cop: 672000, image: 'images/products/H.BRO.WIN3.jpg' },
      { sku: 'H.BRO.WIN4', color: 'Azul', precio_cop: 672000, image: 'images/products/H.BRO.WIN4.jpg' },
      { sku: 'H.BRO.WIN5', color: 'Dorado', precio_cop: 672000, image: 'images/products/H.BRO.WIN5.jpg' },
    ],
  },

  {
    familia:   'Complementos',
    coleccion: 'Kane',
    tipo:      'Bol para Mascotas',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.KAN1', color: 'Rojo', precio_cop: 325000, image: 'images/products/H.KAN1.jpg' },
      { sku: 'H.KAN2', color: 'Ámbar', precio_cop: 325000, image: 'images/products/H.KAN2.jpg' },
      { sku: 'H.KAN3', color: 'Azul Real', precio_cop: 325000, image: 'images/products/H.KAN3.jpg' },
      { sku: 'H.KAN4', color: 'Verde', precio_cop: 325000, image: 'images/products/H.KAN4.jpg' },
    ],
  },

  {
    familia:   'Complementos',
    coleccion: 'Andalusia',
    tipo:      'Pantalla de Lámpara',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.LAM.AND1', color: 'Transparente', precio_cop: 269000, image: 'images/products/H.LAM.AND1.jpg' },
      { sku: 'H.LAM.AND2', color: 'Rojo', precio_cop: 269000, image: 'images/products/H.LAM.AND2.jpg' },
      { sku: 'H.LAM.AND3', color: 'Verde', precio_cop: 269000, image: 'images/products/H.LAM.AND3.jpg' },
    ],
  },

  {
    familia:   'Complementos',
    coleccion: 'Calypso',
    tipo:      'Pantalla de Lámpara',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.LAM.CAL11', color: 'Gris', precio_cop: 611000, image: 'images/products/H.LAM.CAL11.jpg' },
      { sku: 'H.LAM.CAL8', color: 'Transparente', precio_cop: 611000, image: 'images/products/H.LAM.CAL8.jpg' },
      { sku: 'H.LAM.CAL9', color: 'Dorado', precio_cop: 611000, image: 'images/products/H.LAM.CAL9.jpg' },
    ],
  },

  {
    familia:   'Complementos',
    coleccion: 'Calypso',
    tipo:      'Base de Lámpara',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.LAM.CAL6', color: 'Transparente', precio_cop: 1459000, image: 'images/products/H.LAM.CAL6.jpg' },
    ],
  },

  {
    familia:   'Complementos',
    coleccion: 'Cleopatra',
    tipo:      'Pantalla de Lámpara',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.LAM.CLE5', color: 'Transparente', precio_cop: 269000, image: 'images/products/H.LAM.CLE5.jpg' },
      { sku: 'H.LAM.CLE6', color: 'Naranja', precio_cop: 269000, image: 'images/products/H.LAM.CLE6.jpg' },
      { sku: 'H.LAM.CLE7', color: 'Rojo', precio_cop: 269000, image: 'images/products/H.LAM.CLE7.jpg' },
      { sku: 'H.LAM.CLE8', color: 'Turquesa', precio_cop: 269000, image: 'images/products/H.LAM.CLE8.jpg' },
    ],
  },

  {
    familia:   'Complementos',
    coleccion: 'Joshua',
    tipo:      'Pantalla de Lámpara',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.LAM.JOS10', color: 'Blanco Opaco', precio_cop: 428000, image: 'images/products/H.LAM.JOS10.jpg' },
      { sku: 'H.LAM.JOS7', color: 'Transparente', precio_cop: 428000, image: 'images/products/H.LAM.JOS7.jpg' },
      { sku: 'H.LAM.JOS9', color: 'Gris Opaco', precio_cop: 428000, image: 'images/products/H.LAM.JOS9.jpg' },
    ],
  },

  {
    familia:   'Complementos',
    coleccion: 'Joshua',
    tipo:      'Base de Lámpara',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.LAM.JOS11', color: 'Transparente', precio_cop: 755000, image: 'images/products/H.LAM.JOS11.jpg' },
    ],
  },

  {
    familia:   'Complementos',
    coleccion: 'Serena',
    tipo:      'Base Piña Serena',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.MAD1', color: 'Transparente', precio_cop: 550000, image: 'images/products/H.MAD1.jpg' },
      { sku: 'H.MAD2', color: 'Rubí', precio_cop: 550000, image: 'images/products/H.MAD2.jpg' },
      { sku: 'H.MAD3', color: 'Ámbar', precio_cop: 550000, image: 'images/products/H.MAD3.jpg' },
      { sku: 'H.MAD4', color: 'Verde', precio_cop: 550000, image: 'images/products/H.MAD4.jpg' },
      { sku: 'H.MAD5', color: 'Dorado', precio_cop: 550000, image: 'images/products/H.MAD5.jpg' },
    ],
  },

  {
    familia:   'Complementos',
    coleccion: 'Melissa',
    tipo:      'Base Piña',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.MEL2', color: 'Transparente', precio_cop: 1283000, image: 'images/products/H.MEL2.jpg' },
      { sku: 'H.MEL3', color: 'Verde', precio_cop: 1283000, image: 'images/products/H.MEL3.jpg' },
      { sku: 'H.MEL4', color: 'Dorado', precio_cop: 1283000, image: 'images/products/H.MEL4.jpg' },
      { sku: 'H.MEL5', color: 'Rubí', precio_cop: 1283000, image: 'images/products/H.MEL5.jpg' },
    ],
  },

  {
    familia:   'Complementos',
    coleccion: 'Antartica',
    tipo:      'Cubitera',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.PBO18', color: 'Ámbar', precio_cop: 636000, image: 'images/products/H.PBO18.jpg' },
      { sku: 'H.PBO19', color: 'Azul', precio_cop: 636000, image: 'images/products/H.PBO19.jpg' },
      { sku: 'H.PBO20', color: 'Transparente', precio_cop: 636000, image: 'images/products/H.PBO20.jpg' },
      { sku: 'H.PBO21', color: 'Verde', precio_cop: 636000, image: 'images/products/H.PBO21.jpg' },
      { sku: 'H.PBO22', color: 'Rojo', precio_cop: 636000, image: 'images/products/H.PBO22.jpg' },
      { sku: 'H.PBO29', color: 'Blanco Esmerilado', precio_cop: 665000, image: 'images/products/H.PBO29.jpg' },
      { sku: 'H.PBO32', color: 'Rojo Esmerilado', precio_cop: 665000, image: 'images/products/H.PBO32.jpg' },
      { sku: 'H.PBO35', color: 'Azul Esmerilado', precio_cop: 665000, image: 'images/products/H.PBO35.jpg' },
      { sku: 'H.PBO37', color: 'Dorado', precio_cop: 794000, image: 'images/products/H.PBO37.jpg' },
    ],
  },

  {
    familia:   'Complementos',
    coleccion: 'Filippo',
    tipo:      'Soportaborellas',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.PBO24', color: 'Transparente', precio_cop: 414000, image: 'images/products/H.PBO24.jpg' },
      { sku: 'H.PBO26', color: 'Rojo', precio_cop: 414000, image: 'images/products/H.PBO26.jpg' },
      { sku: 'H.PBO30', color: 'Turquesa', precio_cop: 414000, image: 'images/products/H.PBO30.jpg' },
    ],
  },

  {
    familia:   'Complementos',
    coleccion: 'Bonnie & Clyde',
    tipo:      'Sal y Pimienta',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.SAL.BEC1', color: 'Verde', precio_cop: 222000, image: 'images/products/H.SAL.BEC1.jpg' },
      { sku: 'H.SAL.BEC2', color: 'Transparente', precio_cop: 222000, image: 'images/products/H.SAL.BEC2.jpg' },
      { sku: 'H.SAL.BEC3', color: 'Azul', precio_cop: 222000, image: 'images/products/H.SAL.BEC3.jpg' },
      { sku: 'H.SAL.BEC5', color: 'Rojo', precio_cop: 222000, image: 'images/products/H.SAL.BEC5.jpg' },
      { sku: 'H.SAL.BEC6', color: 'Dorado', precio_cop: 222000, image: 'images/products/H.SAL.BEC6.jpg' },
    ],
  },

  {
    familia:   'Complementos',
    coleccion: 'Casanova',
    tipo:      'Salero',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.SAL.CAS1', color: 'Transparente', precio_cop: 55000, image: 'images/products/H.SAL.CAS1.jpg' },
      { sku: 'H.SAL.CAS2', color: 'Ahumado´', precio_cop: 55000, image: 'images/products/H.SAL.CAS2.jpg' },
      { sku: 'H.SAL.CAS3', color: 'Verde', precio_cop: 55000, image: 'images/products/H.SAL.CAS3.jpg' },
      { sku: 'H.SAL.CAS4', color: 'Rojo', precio_cop: 55000, image: 'images/products/H.SAL.CAS4.jpg' },
    ],
  },

  {
    familia:   'Complementos',
    coleccion: 'Caterina & Vittoria',
    tipo:      'Sal y Pimienta',
    medidas:   '—',
    material:  'Acrílico',
    variantes: [
      { sku: 'H.SAL.CEV1', color: 'Transparente', precio_cop: 269000, image: 'images/products/H.SAL.CEV1.jpg' },
      { sku: 'H.SAL.CEV2', color: 'Rubí', precio_cop: 269000, image: 'images/products/H.SAL.CEV2.jpg' },
      { sku: 'H.SAL.CEV3', color: 'Azul', precio_cop: 269000, image: 'images/products/H.SAL.CEV3.jpg' },
      { sku: 'H.SAL.CEV4', color: 'Verde', precio_cop: 269000, image: 'images/products/H.SAL.CEV4.jpg' },
    ],
  },

];


// ─────────────────────────────────────────────
// EXPORTAR AL SCOPE GLOBAL
// ─────────────────────────────────────────────
window.MLG_FAMILIES      = MLG_FAMILIES;
window.MLG_PRODUCT_TYPES = MLG_PRODUCT_TYPES;
