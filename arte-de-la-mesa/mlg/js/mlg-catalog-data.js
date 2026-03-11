// @version    v1.0  @file mlg-catalog-data.js  @updated 2026-03-11  @session mlg-catalog
/* ===== MLG V1 - catalog-data.js =====
 * Familias y tipos de producto para el catálogo MLG by Helena Caballero.
 * MLG_FAMILIES  → cards giratorias en la página principal
 * MLG_PRODUCT_TYPES → productos con variantes dentro de cada familia
 * =========================================== */

'use strict';

// ─────────────────────────────────────────────
// FAMILIAS — imágenes rotatorias en la grid
// ─────────────────────────────────────────────
const MLG_FAMILIES = {

  'Bicchieri': {
    label: 'Bicchieri',
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

  'Alzate': {
    label: 'Alzate',
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

  'Insalatiere': {
    label: 'Insalatiere',
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

  'Piatti': {
    label: 'Piatti',
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

  'Complementos': {
    label: 'Complementos',
    images: [
      'images/products/H.BRO.SIS1.jpg',
      'images/products/H.BRO.SIS2.jpg',
      'images/products/H.BRO.HAL1.jpg',
      'images/products/H.BRO.HAL2.jpg',
      'images/products/H.BOT.AQU1.jpg',
      'images/products/H.BOT.AQU2.jpg',
      'images/products/H.LAM.AND1.jpg',
      'images/products/H.LAM.CAL6.jpg',
    ],
  },

};


// ─────────────────────────────────────────────
// TIPOS DE PRODUCTO
// Cada entrada → un producto navegable en el modal de familia.
// variantes → filas de colores/colecciones con SKU y precio.
// ─────────────────────────────────────────────
const MLG_PRODUCT_TYPES = [

  // ══════════════════════════════════════════
  // BICCHIERI
  // ══════════════════════════════════════════
  {
    familia:  'Bicchieri',
    coleccion: 'Dolce Vita',
    tipo:     'Tumbler',
    medidas:  '9 cm alt. · 390 ml',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.BIK.DLV.999',  color: 'Acqua Blu',         precio_cop: 155000, image: 'images/products/dolce-vita-acqua-blu-999-g2-o.jpg' },
      { sku: 'H.BIK.DLV.1003', color: 'Acqua Trasparente', precio_cop: 155000, image: 'images/products/dolce-vita-acqua-trasparente-1003-g2-o.jpg' },
      { sku: 'H.BIK.DLV.2418', color: 'Acqua Oro',         precio_cop: 165000, image: 'images/products/goldfingerdolcevita-acqua-2418-g1-o.jpg' },
      { sku: 'H.BIK.DLV.1',    color: 'Variante 1',        precio_cop: 155000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.DLV.4',    color: 'Variante 4',        precio_cop: 155000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.DLV.5',    color: 'Variante 5',        precio_cop: 155000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.DLV.7',    color: 'Variante 7',        precio_cop: 155000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.DLV.8',    color: 'Variante 8',        precio_cop: 155000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.DLV.9',    color: 'Variante 9',        precio_cop: 155000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.DLV.10',   color: 'Variante 10',       precio_cop: 155000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Bicchieri',
    coleccion: 'Dolce Vita',
    tipo:     'Flute',
    medidas:  '22 cm alt.',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.BIK.DF.AMB',  color: 'Ambra',       precio_cop: 175000, image: 'images/products/dolce-vita-flute-ambra-set.jpg' },
      { sku: 'H.BIK.DF.1',    color: 'Variante 1',  precio_cop: 165000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.DF.3',    color: 'Variante 3',  precio_cop: 165000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.DF.4',    color: 'Variante 4',  precio_cop: 165000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.DF.5',    color: 'Variante 5',  precio_cop: 165000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.DF.6',    color: 'Variante 6',  precio_cop: 165000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.DF.7',    color: 'Variante 7',  precio_cop: 165000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.DF.8',    color: 'Variante 8',  precio_cop: 165000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.DF.9',    color: 'Variante 9',  precio_cop: 165000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Bicchieri',
    coleccion: 'Winston',
    tipo:     'Tumbler Alto',
    medidas:  '14 cm alt. · 450 ml',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.BIK.WIN.2158', color: 'Acqua Oro',   precio_cop: 175000, image: 'images/products/winston-acqua-oro-2158-g1-v.jpg' },
      { sku: 'H.BIK.WIN.2159', color: 'Acqua Verde', precio_cop: 175000, image: 'images/products/winston-acqua-verde-2159-g1-o.jpg' },
      { sku: 'H.BIK.WIN.2027', color: 'Vino Verde',  precio_cop: 175000, image: 'images/products/winston-vino-verde-2027-g2-o.jpg' },
      { sku: 'H.BIK.WIN.1',    color: 'Variante 1',  precio_cop: 175000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.WIN.2',    color: 'Variante 2',  precio_cop: 175000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.WIN.3',    color: 'Variante 3',  precio_cop: 175000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.WIN.4',    color: 'Variante 4',  precio_cop: 175000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.WIN.5',    color: 'Variante 5',  precio_cop: 175000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.WIN.8',    color: 'Variante 8',  precio_cop: 175000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.WIN.9',    color: 'Variante 9',  precio_cop: 175000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Bicchieri',
    coleccion: 'Stella Acqua',
    tipo:     'Copa de Agua',
    medidas:  '18 cm alt. · 500 ml',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.BIK.STE.2030', color: 'Bianco',       precio_cop: 165000, image: 'images/products/stella-acqua-bianco-2030-g1-o.jpg' },
      { sku: 'H.BIK.STE.2029', color: 'Blu',          precio_cop: 165000, image: 'images/products/stella-acqua-blu-2029-g2-o.jpg' },
      { sku: 'H.BIK.STE.2032', color: 'Trasparente',  precio_cop: 165000, image: 'images/products/stella-acqua-trasparente-2032-g2-o.jpg' },
      { sku: 'H.BIK.STE.1',    color: 'Variante 1',   precio_cop: 165000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.STE.2',    color: 'Variante 2',   precio_cop: 165000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.STE.3',    color: 'Variante 3',   precio_cop: 165000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.STE.4',    color: 'Variante 4',   precio_cop: 165000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.STE.5',    color: 'Variante 5',   precio_cop: 165000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Bicchieri',
    coleccion: 'Lente Basso',
    tipo:     'Tumbler Bajo',
    medidas:  '6 cm alt. · 280 ml',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.BIK.LEN.591',  color: 'Verde',          precio_cop: 140000, image: 'images/products/lente-basso-verde-591.jpg' },
      { sku: 'H.BIK.LEN.1090', color: 'Verde Fluo',     precio_cop: 140000, image: 'images/products/lente-basso-verde-fluo-1090-g1-o.jpg' },
      { sku: 'H.BIK.LEN.ARF',  color: 'Arancio Fluo',   precio_cop: 140000, image: 'images/products/lente-basso-arancio-fluo-ambiente.jpg' },
      { sku: 'H.BIK.LEN.1',    color: 'Variante 1',     precio_cop: 140000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.LEN.2',    color: 'Variante 2',     precio_cop: 140000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.LEN.3',    color: 'Variante 3',     precio_cop: 140000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.LEN.4',    color: 'Variante 4',     precio_cop: 140000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.LEN.5',    color: 'Variante 5',     precio_cop: 140000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Bicchieri',
    coleccion: 'Palazzo',
    tipo:     'Copa',
    medidas:  '19 cm alt. · 550 ml',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.BIK.PAL.1756', color: 'Blu',   precio_cop: 185000, image: 'images/products/palazzo-blu-1756-g1-o.jpg' },
      { sku: 'H.BIK.PAL.ROS',  color: 'Rosso', precio_cop: 185000, image: 'images/products/palazzo-rosso-ambientar.jpg' },
      { sku: 'H.BIK.PAL.VER',  color: 'Verde', precio_cop: 185000, image: 'images/products/palazzo-verde-ambientejpg.jpg' },
      { sku: 'H.BIK.PAL.1',    color: 'Variante 1', precio_cop: 185000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.PAL.2',    color: 'Variante 2', precio_cop: 185000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Bicchieri',
    coleccion: 'Biancaneve',
    tipo:     'Copa',
    medidas:  '20 cm alt.',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.BIK.BN.2554', color: 'Trasparente', precio_cop: 175000, image: 'images/products/biancaneve-trasparente-2554-g2-o.jpg' },
      { sku: 'H.BIK.BN.2',    color: 'Variante 2',  precio_cop: 175000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.BN.3',    color: 'Variante 3',  precio_cop: 175000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.BN.4',    color: 'Variante 4',  precio_cop: 175000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.BN.5',    color: 'Variante 5',  precio_cop: 175000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Bicchieri',
    coleccion: 'Giulia',
    tipo:     'Copa de Vino',
    medidas:  '21 cm alt.',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.BIK.GUL.1', color: 'Variante 1', precio_cop: 170000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.GUL.2', color: 'Variante 2', precio_cop: 170000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.GUL.3', color: 'Variante 3', precio_cop: 170000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.GUL.4', color: 'Variante 4', precio_cop: 170000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.GUL.5', color: 'Variante 5', precio_cop: 170000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.GUL.7', color: 'Variante 7', precio_cop: 170000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Bicchieri',
    coleccion: 'Scarlet',
    tipo:     'Copa',
    medidas:  '18 cm alt.',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.BIK.SCR.1', color: 'Variante 1', precio_cop: 170000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.SCR.2', color: 'Variante 2', precio_cop: 170000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.SCR.3', color: 'Variante 3', precio_cop: 170000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.SCR.4', color: 'Variante 4', precio_cop: 170000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.SCR.5', color: 'Variante 5', precio_cop: 170000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.SCR.6', color: 'Variante 6', precio_cop: 170000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.SCR.7', color: 'Variante 7', precio_cop: 170000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.SCR.8', color: 'Variante 8', precio_cop: 170000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Bicchieri',
    coleccion: 'Tumbler',
    tipo:     'Tumbler Medio',
    medidas:  '11 cm alt. · 360 ml',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.BIK.TUM.1',  color: 'Variante 1',  precio_cop: 150000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.TUM.2',  color: 'Variante 2',  precio_cop: 150000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.TUM.8',  color: 'Variante 8',  precio_cop: 150000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.TUM.9',  color: 'Variante 9',  precio_cop: 150000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.TUM.10', color: 'Variante 10', precio_cop: 150000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.TUM.11', color: 'Variante 11', precio_cop: 150000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.TUM.12', color: 'Variante 12', precio_cop: 150000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.TUM.13', color: 'Variante 13', precio_cop: 150000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Bicchieri',
    coleccion: 'Venezia',
    tipo:     'Copa',
    medidas:  '20 cm alt.',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.BIK.VEN.1',    color: 'Variante 1', precio_cop: 175000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.VEN.3',    color: 'Variante 3', precio_cop: 175000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.VEN.4',    color: 'Variante 4', precio_cop: 175000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.VEN.6',    color: 'Variante 6', precio_cop: 175000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.VEN.7',    color: 'Variante 7', precio_cop: 175000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Bicchieri',
    coleccion: 'Vienna',
    tipo:     'Copa de Vino',
    medidas:  '21 cm alt.',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.BIK.VIE.1', color: 'Variante 1', precio_cop: 175000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.VIE.2', color: 'Variante 2', precio_cop: 175000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.VIE.3', color: 'Variante 3', precio_cop: 175000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.VIE.4', color: 'Variante 4', precio_cop: 175000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.VIE.5', color: 'Variante 5', precio_cop: 175000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.VIE.8', color: 'Variante 8', precio_cop: 175000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Bicchieri',
    coleccion: 'Petalo',
    tipo:     'Copa',
    medidas:  '18 cm alt.',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.BIK.PET.1', color: 'Variante 1', precio_cop: 170000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.PET.2', color: 'Variante 2', precio_cop: 170000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.PET.4', color: 'Variante 4', precio_cop: 170000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.PET.5', color: 'Variante 5', precio_cop: 170000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Bicchieri',
    coleccion: 'Stardust',
    tipo:     'Copa',
    medidas:  '19 cm alt.',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.BIK.STARD.1',  color: 'Variante 1',  precio_cop: 180000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.STARD.2',  color: 'Variante 2',  precio_cop: 180000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.STARD.3',  color: 'Variante 3',  precio_cop: 180000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.STARD.4',  color: 'Variante 4',  precio_cop: 180000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.STARD.5',  color: 'Variante 5',  precio_cop: 180000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.STARD.6',  color: 'Variante 6',  precio_cop: 180000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.STARD.7',  color: 'Variante 7',  precio_cop: 180000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.STARD.10', color: 'Variante 10', precio_cop: 180000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Bicchieri',
    coleccion: 'Murano',
    tipo:     'Tumbler',
    medidas:  '10 cm alt. · 350 ml',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.BIK.MUN.1', color: 'Variante 1', precio_cop: 160000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.MUN.2', color: 'Variante 2', precio_cop: 160000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.MUN.3', color: 'Variante 3', precio_cop: 160000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.MUN.4', color: 'Variante 4', precio_cop: 160000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.MUN.5', color: 'Variante 5', precio_cop: 160000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.MUN.6', color: 'Variante 6', precio_cop: 160000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Bicchieri',
    coleccion: 'Pierre',
    tipo:     'Tumbler',
    medidas:  '10 cm alt.',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.BIK.PIE.1', color: 'Variante 1', precio_cop: 155000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.PIE.2', color: 'Variante 2', precio_cop: 155000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.PIE.3', color: 'Variante 3', precio_cop: 155000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.PIE.4', color: 'Variante 4', precio_cop: 155000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Bicchieri',
    coleccion: 'Sapale',
    tipo:     'Copa',
    medidas:  '19 cm alt.',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.BIK.SAPA.1',  color: 'Variante 1',  precio_cop: 170000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.SAPA.2',  color: 'Variante 2',  precio_cop: 170000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.SAPA.3',  color: 'Variante 3',  precio_cop: 170000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.SAPA.8',  color: 'Variante 8',  precio_cop: 170000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.SAPA.9',  color: 'Variante 9',  precio_cop: 170000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BIK.SAPA.10', color: 'Variante 10', precio_cop: 170000, image: 'images/products/placeholder.svg' },
    ],
  },


  // ══════════════════════════════════════════
  // ALZATE
  // ══════════════════════════════════════════
  {
    familia:  'Alzate',
    coleccion: 'Colección Alzate',
    tipo:     'Copa',
    medidas:  '12 cm alt. · Ø 20 cm',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.ALZ.CUP.1', color: 'Variante 1', precio_cop: 380000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Alzate',
    coleccion: 'Colección Alzate',
    tipo:     'Giraffa',
    medidas:  '24 cm alt. · Ø 18 cm',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.ALZ.GIR.1', color: 'Variante 1', precio_cop: 480000, image: 'images/products/placeholder.svg' },
      { sku: 'H.ALZ.GIR.2', color: 'Variante 2', precio_cop: 480000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Alzate',
    coleccion: 'Colección Alzate',
    tipo:     'Ninfa',
    medidas:  '16 cm alt. · Ø 22 cm',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.ALZ.NIN.1', color: 'Variante 1', precio_cop: 420000, image: 'images/products/placeholder.svg' },
      { sku: 'H.ALZ.NIN.2', color: 'Variante 2', precio_cop: 420000, image: 'images/products/placeholder.svg' },
      { sku: 'H.ALZ.NIN.3', color: 'Variante 3', precio_cop: 420000, image: 'images/products/placeholder.svg' },
      { sku: 'H.ALZ.NIN.4', color: 'Variante 4', precio_cop: 420000, image: 'images/products/placeholder.svg' },
      { sku: 'H.ALZ.NIN.5', color: 'Variante 5', precio_cop: 420000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Alzate',
    coleccion: 'Colección Alzate',
    tipo:     'Susanna',
    medidas:  '20 cm alt. · Ø 24 cm',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.ALZ.SUS.1', color: 'Variante 1', precio_cop: 550000, image: 'images/products/placeholder.svg' },
      { sku: 'H.ALZ.SUS.2', color: 'Variante 2', precio_cop: 550000, image: 'images/products/placeholder.svg' },
      { sku: 'H.ALZ.SUS.3', color: 'Variante 3', precio_cop: 550000, image: 'images/products/placeholder.svg' },
      { sku: 'H.ALZ.SUS.4', color: 'Variante 4', precio_cop: 550000, image: 'images/products/placeholder.svg' },
    ],
  },


  // ══════════════════════════════════════════
  // INSALATIERE
  // ══════════════════════════════════════════
  {
    familia:  'Insalatiere',
    coleccion: 'Milly',
    tipo:     'Insalatiera',
    medidas:  'Ø 23 cm · Alt. 9 cm',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.INS.MIL.1064', color: 'Ambra',       precio_cop: 320000, image: 'images/products/milly-ambra-1064.jpg' },
      { sku: 'H.INS.MIL.1060', color: 'Blu',          precio_cop: 320000, image: 'images/products/milly-blu-1060.jpg' },
      { sku: 'H.INS.MIL.2339', color: 'Frost',        precio_cop: 320000, image: 'images/products/milly-frost-2339.jpg' },
      { sku: 'H.INS.MIL.1061', color: 'Rosso',        precio_cop: 320000, image: 'images/products/milly-rosso-1061.jpg' },
      { sku: 'H.INS.MIL.2499', color: 'Rubino',       precio_cop: 320000, image: 'images/products/milly-rubino-2499.jpg' },
      { sku: 'H.INS.MIL.1058', color: 'Trasparente',  precio_cop: 320000, image: 'images/products/milly-trasparente-1058.jpg' },
      { sku: 'H.INS.MIL.1199', color: 'Turchese',     precio_cop: 320000, image: 'images/products/milly-turchese-1199.jpg' },
      { sku: 'H.INS.MIL.1062', color: 'Verde',        precio_cop: 320000, image: 'images/products/milly-verde-1062.jpg' },
    ],
  },

  {
    familia:  'Insalatiere',
    coleccion: 'Super Milly',
    tipo:     'Insalatiera Grande',
    medidas:  'Ø 30 cm · Alt. 12 cm',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.INS.MIL.SUP.ROS', color: 'Rosso', precio_cop: 450000, image: 'images/products/super-milly-rosso-1ambiente.jpg' },
      { sku: 'H.INS.MIL.1',       color: 'Variante 1', precio_cop: 420000, image: 'images/products/placeholder.svg' },
      { sku: 'H.INS.MIL.2',       color: 'Variante 2', precio_cop: 420000, image: 'images/products/placeholder.svg' },
      { sku: 'H.INS.MIL.3',       color: 'Variante 3', precio_cop: 420000, image: 'images/products/placeholder.svg' },
      { sku: 'H.INS.MIL.4',       color: 'Variante 4', precio_cop: 420000, image: 'images/products/placeholder.svg' },
      { sku: 'H.INS.MIL.5',       color: 'Variante 5', precio_cop: 420000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Insalatiere',
    coleccion: 'Lente',
    tipo:     'Insalatiera',
    medidas:  'Ø 25 cm · Alt. 8 cm',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.INS.LEN.1',  color: 'Variante 1',  precio_cop: 340000, image: 'images/products/placeholder.svg' },
      { sku: 'H.INS.LEN.2',  color: 'Variante 2',  precio_cop: 340000, image: 'images/products/placeholder.svg' },
      { sku: 'H.INS.LEN.3',  color: 'Variante 3',  precio_cop: 340000, image: 'images/products/placeholder.svg' },
      { sku: 'H.INS.LEN.4',  color: 'Variante 4',  precio_cop: 340000, image: 'images/products/placeholder.svg' },
      { sku: 'H.INS.LEN.5',  color: 'Variante 5',  precio_cop: 340000, image: 'images/products/placeholder.svg' },
      { sku: 'H.INS.LEN.6',  color: 'Variante 6',  precio_cop: 340000, image: 'images/products/placeholder.svg' },
      { sku: 'H.INS.LEN.7',  color: 'Variante 7',  precio_cop: 340000, image: 'images/products/placeholder.svg' },
      { sku: 'H.INS.LEN.8',  color: 'Variante 8',  precio_cop: 340000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Insalatiere',
    coleccion: 'Churchill',
    tipo:     'Insalatiera',
    medidas:  'Ø 22 cm · Alt. 9 cm',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.INS.CHU.1',  color: 'Variante 1',  precio_cop: 310000, image: 'images/products/placeholder.svg' },
      { sku: 'H.INS.CHU.2',  color: 'Variante 2',  precio_cop: 310000, image: 'images/products/placeholder.svg' },
      { sku: 'H.INS.CHU.4',  color: 'Variante 4',  precio_cop: 310000, image: 'images/products/placeholder.svg' },
      { sku: 'H.INS.CHU.5',  color: 'Variante 5',  precio_cop: 310000, image: 'images/products/placeholder.svg' },
      { sku: 'H.INS.CHU.11', color: 'Variante 11', precio_cop: 310000, image: 'images/products/placeholder.svg' },
    ],
  },


  // ══════════════════════════════════════════
  // PIATTI
  // ══════════════════════════════════════════
  {
    familia:  'Piatti',
    coleccion: 'Imperial',
    tipo:     'Piatto',
    medidas:  'Ø 28 cm',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.PBO.IMP.2286', color: 'Bianco',       precio_cop: 220000, image: 'images/products/imperial-bianco-2286-g1-o.jpg' },
      { sku: 'H.PBO.IMP.2288', color: 'Trasparente',  precio_cop: 220000, image: 'images/products/imperial-trasparente-2288-g1-o.jpg' },
      { sku: 'H.PBO.IMP.2289', color: 'Verde',        precio_cop: 220000, image: 'images/products/imperial-verde-2289-g1-o.jpg' },
    ],
  },

  {
    familia:  'Piatti',
    coleccion: 'Patagonia',
    tipo:     'Sottopiatto',
    medidas:  'Ø 33 cm',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.PBO.PAT.2326', color: 'Blu', precio_cop: 250000, image: 'images/products/patagonia-sottopiatti-blu-2326-g2-o.jpg' },
    ],
  },

  {
    familia:  'Piatti',
    coleccion: 'Sancho',
    tipo:     'Piatto Fondo',
    medidas:  'Ø 26 cm',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.PBO.SAN.2540', color: 'Rubino', precio_cop: 230000, image: 'images/products/sancho-rubino-2540-g1-o.jpg' },
      { sku: 'H.PBO.SAN.2539', color: 'Verde',  precio_cop: 230000, image: 'images/products/sancho-verde-2539-g1-o.jpg' },
    ],
  },

  {
    familia:  'Piatti',
    coleccion: 'Panama',
    tipo:     'Piatto',
    medidas:  'Ø 26 cm',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.PIA.PAN.1',  color: 'Variante 1',  precio_cop: 200000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.PAN.2',  color: 'Variante 2',  precio_cop: 200000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.PAN.3',  color: 'Variante 3',  precio_cop: 200000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.PAN.4',  color: 'Variante 4',  precio_cop: 200000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.PAN.5',  color: 'Variante 5',  precio_cop: 200000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.PAN.6',  color: 'Variante 6',  precio_cop: 200000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.PAN.7',  color: 'Variante 7',  precio_cop: 200000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.PAN.8',  color: 'Variante 8',  precio_cop: 200000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Piatti',
    coleccion: 'Marika',
    tipo:     'Piatto',
    medidas:  'Ø 26 cm',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.PIA.MAR.1',  color: 'Variante 1',  precio_cop: 200000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.MAR.2',  color: 'Variante 2',  precio_cop: 200000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.MAR.3',  color: 'Variante 3',  precio_cop: 200000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.MAR.4',  color: 'Variante 4',  precio_cop: 200000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.MAR.5',  color: 'Variante 5',  precio_cop: 200000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.MAR.6',  color: 'Variante 6',  precio_cop: 200000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.MAR.7',  color: 'Variante 7',  precio_cop: 200000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.MAR.8',  color: 'Variante 8',  precio_cop: 200000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Piatti',
    coleccion: 'Vienna',
    tipo:     'Piatto',
    medidas:  'Ø 27 cm',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.PIA.VIE.1',  color: 'Variante 1',  precio_cop: 210000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.VIE.2',  color: 'Variante 2',  precio_cop: 210000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.VIE.3',  color: 'Variante 3',  precio_cop: 210000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.VIE.5',  color: 'Variante 5',  precio_cop: 210000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.VIE.6',  color: 'Variante 6',  precio_cop: 210000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.VIE.7',  color: 'Variante 7',  precio_cop: 210000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.VIE.8',  color: 'Variante 8',  precio_cop: 210000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.VIE.9',  color: 'Variante 9',  precio_cop: 210000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Piatti',
    coleccion: 'Eva',
    tipo:     'Piattino',
    medidas:  'Ø 22 cm',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.PIA.EVA.1',  color: 'Variante 1',  precio_cop: 160000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.EVA.2',  color: 'Variante 2',  precio_cop: 160000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.EVA.3',  color: 'Variante 3',  precio_cop: 160000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.EVA.4',  color: 'Variante 4',  precio_cop: 160000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.EVA.6',  color: 'Variante 6',  precio_cop: 160000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.EVA.7',  color: 'Variante 7',  precio_cop: 160000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.EVA.8',  color: 'Variante 8',  precio_cop: 160000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Piatti',
    coleccion: 'Patricia',
    tipo:     'Piatto',
    medidas:  'Ø 27 cm',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.PIA.PAT.2',  color: 'Variante 2',  precio_cop: 210000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.PAT.3',  color: 'Variante 3',  precio_cop: 210000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.PAT.5',  color: 'Variante 5',  precio_cop: 210000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.PAT.7',  color: 'Variante 7',  precio_cop: 210000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.PAT.10', color: 'Variante 10', precio_cop: 210000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.PAT.12', color: 'Variante 12', precio_cop: 210000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.PAT.13', color: 'Variante 13', precio_cop: 210000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Piatti',
    coleccion: 'Lapislazzuli',
    tipo:     'Piattino',
    medidas:  'Ø 20 cm',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.PIA.LAP.1', color: 'Variante 1', precio_cop: 165000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.LAP.2', color: 'Variante 2', precio_cop: 165000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.LAP.3', color: 'Variante 3', precio_cop: 165000, image: 'images/products/placeholder.svg' },
      { sku: 'H.PIA.LAP.4', color: 'Variante 4', precio_cop: 165000, image: 'images/products/placeholder.svg' },
    ],
  },


  // ══════════════════════════════════════════
  // COMPLEMENTOS
  // ══════════════════════════════════════════
  {
    familia:  'Complementos',
    coleccion: 'Broderie — Sissi',
    tipo:     'Piatto Decorativo',
    medidas:  'Ø 28 cm',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.BRO.SIS.1',  color: 'Variante 1',  precio_cop: 280000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BRO.SIS.2',  color: 'Variante 2',  precio_cop: 280000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BRO.SIS.3',  color: 'Variante 3',  precio_cop: 280000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BRO.SIS.4',  color: 'Variante 4',  precio_cop: 280000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BRO.SIS.5',  color: 'Variante 5',  precio_cop: 280000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BRO.SIS.6',  color: 'Variante 6',  precio_cop: 280000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BRO.SIS.7',  color: 'Variante 7',  precio_cop: 280000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BRO.SIS.8',  color: 'Variante 8',  precio_cop: 280000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BRO.SIS.9',  color: 'Variante 9',  precio_cop: 280000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BRO.SIS.10', color: 'Variante 10', precio_cop: 280000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Complementos',
    coleccion: 'Broderie — Halina',
    tipo:     'Piatto Decorativo',
    medidas:  'Ø 28 cm',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.BRO.HAL.1', color: 'Variante 1', precio_cop: 280000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BRO.HAL.2', color: 'Variante 2', precio_cop: 280000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BRO.HAL.3', color: 'Variante 3', precio_cop: 280000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BRO.HAL.4', color: 'Variante 4', precio_cop: 280000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BRO.HAL.5', color: 'Variante 5', precio_cop: 280000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BRO.HAL.6', color: 'Variante 6', precio_cop: 280000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BRO.HAL.7', color: 'Variante 7', precio_cop: 280000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Complementos',
    coleccion: 'Broderie — Roberta',
    tipo:     'Piatto Decorativo',
    medidas:  'Ø 28 cm',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.BRO.ROB.1',  color: 'Variante 1',  precio_cop: 280000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BRO.ROB.2',  color: 'Variante 2',  precio_cop: 280000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BRO.ROB.3',  color: 'Variante 3',  precio_cop: 280000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BRO.ROB.4',  color: 'Variante 4',  precio_cop: 280000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BRO.ROB.6',  color: 'Variante 6',  precio_cop: 280000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BRO.ROB.11', color: 'Variante 11', precio_cop: 280000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BRO.ROB.12', color: 'Variante 12', precio_cop: 280000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Complementos',
    coleccion: 'Bottiglia — Aqua',
    tipo:     'Botella',
    medidas:  '28 cm alt. · 750 ml',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.BOT.AQU.1', color: 'Variante 1', precio_cop: 220000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BOT.AQU.2', color: 'Variante 2', precio_cop: 220000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BOT.AQU.3', color: 'Variante 3', precio_cop: 220000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BOT.AQU.4', color: 'Variante 4', precio_cop: 220000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Complementos',
    coleccion: 'Bottiglia — Bona',
    tipo:     'Botella',
    medidas:  '30 cm alt.',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.BOT.BONA.2',  color: 'Variante 2',  precio_cop: 230000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BOT.BONA.3',  color: 'Variante 3',  precio_cop: 230000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BOT.BONA.4',  color: 'Variante 4',  precio_cop: 230000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BOT.BONA.7',  color: 'Variante 7',  precio_cop: 230000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BOT.BONA.9',  color: 'Variante 9',  precio_cop: 230000, image: 'images/products/placeholder.svg' },
      { sku: 'H.BOT.BONA.10', color: 'Variante 10', precio_cop: 230000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Complementos',
    coleccion: 'Laminato — Andromeda',
    tipo:     'Vassoio',
    medidas:  '35 × 25 cm',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.LAM.AND.1', color: 'Variante 1', precio_cop: 260000, image: 'images/products/placeholder.svg' },
      { sku: 'H.LAM.AND.2', color: 'Variante 2', precio_cop: 260000, image: 'images/products/placeholder.svg' },
      { sku: 'H.LAM.AND.3', color: 'Variante 3', precio_cop: 260000, image: 'images/products/placeholder.svg' },
    ],
  },

  {
    familia:  'Complementos',
    coleccion: 'Laminato — Cleopatra',
    tipo:     'Vassoio',
    medidas:  '38 × 28 cm',
    material: 'Acrílico',
    variantes: [
      { sku: 'H.LAM.CLE.5', color: 'Variante 5', precio_cop: 280000, image: 'images/products/placeholder.svg' },
      { sku: 'H.LAM.CLE.6', color: 'Variante 6', precio_cop: 280000, image: 'images/products/placeholder.svg' },
      { sku: 'H.LAM.CLE.7', color: 'Variante 7', precio_cop: 280000, image: 'images/products/placeholder.svg' },
      { sku: 'H.LAM.CLE.8', color: 'Variante 8', precio_cop: 280000, image: 'images/products/placeholder.svg' },
    ],
  },

];


// ─────────────────────────────────────────────
// EXPORTAR AL SCOPE GLOBAL
// ─────────────────────────────────────────────
window.MLG_FAMILIES      = MLG_FAMILIES;
window.MLG_PRODUCT_TYPES = MLG_PRODUCT_TYPES;
