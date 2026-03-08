/**
 * catalog-data-mlg.js — Mario Luca Giusti · Synthetic Crystal
 * Generado automáticamente · Sprint MLG v1.0
 *
 * REGLAS:
 *   - precio_eur: COSTO INTERNO — nunca mostrar en DOM.
 *   - Precio COP: Utils.precioCOPmlg(precio_eur)  [×12.000, ceil/1000]
 *   - placeholder: true → imagen pendiente. Reemplazar image cuando llegue la foto.
 *   - Path relativo a: arte-de-la-mesa/MLG/index.html
 */

const MLG_CATALOG = [

  // ═══════════════════════════════════════════════════════════════
  // COPAS & VASOS CON PIE
  // 118 SKUs total · 71 con imagen · 47 pendientes
  // ═══════════════════════════════════════════════════════════════

  // ⚠️ Biancaneve  (2/6 con imagen)
  {
    id:          'mlg_015',
    sku:         'H.BIK.BN1',
    barcode:     '8057014544800',
    name:        'Biancaneve Shot clear',
    modelo:      'Biancaneve',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  5.5,  // INTERNO
  },
  {
    id:          'mlg_016',
    sku:         'H.BIK.BN2',
    barcode:     '8057014544817',
    name:        'Biancaneve Shot gold',
    modelo:      'Biancaneve',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  5.5,  // INTERNO
  },
  {
    id:          'mlg_017',
    sku:         'H.BIK.BN3',
    barcode:     '8057014544824',
    name:        'Biancaneve Shot green',
    modelo:      'Biancaneve',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  5.5,  // INTERNO
  },
  {
    id:          'mlg_018',
    sku:         'H.BIK.BN4',
    barcode:     '8057014544831',
    name:        'Biancaneve Shot royal blue',
    modelo:      'Biancaneve',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/biancaneve-royal-blue-1343.jpg',
    placeholder: false,
    precio_eur:  5.5,  // INTERNO
  },
  {
    id:          'mlg_019',
    sku:         'H.BIK.BN5',
    barcode:     '8057014544848',
    name:        'Biancaneve Shot red',
    modelo:      'Biancaneve',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  5.5,  // INTERNO
  },
  {
    id:          'mlg_020',
    sku:         'H.BIK.BN6',
    barcode:     '8057014544855',
    name:        'Biancaneve Shot turquoise',
    modelo:      'Biancaneve',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/biancaneve-turquoise-1345.jpg',
    placeholder: false,
    precio_eur:  5.5,  // INTERNO
  },

  // ⚠️ Dolce Vita  (28/34 con imagen)
  {
    id:          'mlg_036',
    sku:         'H.BIK.DLV17',
    barcode:     '8057014591675',
    name:        'Dolce Vita water glass amber',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-acqua-ambra-998.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_037',
    sku:         'H.BIK.DLV25',
    barcode:     '8057014591682',
    name:        'Dolce Vita water glass white',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-acqua-bianco-999.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_038',
    sku:         'H.BIK.DLV31',
    barcode:     '8057014598339',
    name:        'Dolce Vita water glass grey',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-acqua-grigio-1003.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_039',
    sku:         'H.BIK.DLV34',
    barcode:     '8057014541854',
    name:        'Dolce Vita water glass gold',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-acqua-oro-1002.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_040',
    sku:         'H.BIK.DLV23',
    barcode:     '8057014591705',
    name:        'Dolce Vita water glass red',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-acqua-rosso-1004.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_041',
    sku:         'H.BIK.DLV19',
    barcode:     '8057014591712',
    name:        'Dolce Vita water glass royal blue',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-acqua-royal-blue-1005.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_042',
    sku:         'H.BIK.DLV24',
    barcode:     '8057014591729',
    name:        'Dolce Vita water glass ruby',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-acqua-ruby-1006.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_043',
    sku:         'H.BIK.DLV40',
    barcode:     '8057014544060',
    name:        'Dolce Vita water glass clear gold thread',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-acqua-clearfilo-1001.jpg',
    placeholder: false,
    precio_eur:  12.5,  // INTERNO
  },
  {
    id:          'mlg_044',
    sku:         'H.BIK.DLV20',
    barcode:     '8057014591736',
    name:        'Dolce Vita water glass clear',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_045',
    sku:         'H.BIK.DLV28',
    barcode:     '8057014591743',
    name:        'Dolce Vita water glass turquoise',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-acqua-turchese-1007.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_046',
    sku:         'H.BIK.DLV21',
    barcode:     '8057014591750',
    name:        'Dolce Vita water glass green',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_047',
    sku:         'H.BIK.DLV1',
    barcode:     '8057014591774',
    name:        'Dolce Vita wine glass amber',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-vino-ambra-1008.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_048',
    sku:         'H.BIK.DLV26',
    barcode:     '8057014591781',
    name:        'Dolce Vita wine glass white',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-vino-bianco-1009.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_049',
    sku:         'H.BIK.DLV32',
    barcode:     '8057014598346',
    name:        'Dolce Vita wine glass grey',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-vino-grigio-1013.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_050',
    sku:         'H.BIK.DLV35',
    barcode:     '8057014541830',
    name:        'Dolce Vita wine glass gold',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-vino-oro-1012.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_051',
    sku:         'H.BIK.DLV7',
    barcode:     '8057014591804',
    name:        'Dolce Vita wine glass red',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-vino-rosso-1014.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_052',
    sku:         'H.BIK.DLV3',
    barcode:     '8057014591811',
    name:        'Dolce Vita wine glass royal blue',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-vino-royal-blue-1015.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_053',
    sku:         'H.BIK.DLV8',
    barcode:     '8057014591828',
    name:        'Dolce Vita wine glass ruby',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-vino-ruby-1016.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_054',
    sku:         'H.BIK.DLV41',
    barcode:     '8057014544046',
    name:        'Dolce Vita wine glass clear gold thread',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-vino-clearfilo-1011.jpg',
    placeholder: false,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_055',
    sku:         'H.BIK.DLV4',
    barcode:     '8057014591835',
    name:        'Dolce Vita wine glass clear',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_056',
    sku:         'H.BIK.DLV29',
    barcode:     '8057014591842',
    name:        'Dolce Vita wine glass turquoise',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-vino-turchese-1017.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_057',
    sku:         'H.BIK.DLV5',
    barcode:     '8057014591859',
    name:        'Dolce Vita wine glass green',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_058',
    sku:         'H.BIK.DLV9',
    barcode:     '8057014595697',
    name:        'Dolce Vita flute champagne amber',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-flute-ambra-1018.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_059',
    sku:         'H.BIK.DLV27',
    barcode:     '8057014595703',
    name:        'Dolce Vita flute champagne white',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-flute-bianco-1019.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_060',
    sku:         'H.BIK.DLV33',
    barcode:     '8057014598353',
    name:        'Dolce Vira flute champagne grey',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-flute-grigio-1023.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_061',
    sku:         'H.BIK.DLV10',
    barcode:     '8057014595727',
    name:        'Dolce Vita flute champagne black',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_062',
    sku:         'H.BIK.DLV36',
    barcode:     '8057014541847',
    name:        'Dolce Vita flute champagne gold',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-flute-oro-1022.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_063',
    sku:         'H.BIK.DLV15',
    barcode:     '8057014595734',
    name:        'Dolce Vita flute champagne red',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-flute-rosso-1024.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_064',
    sku:         'H.BIK.DLV11',
    barcode:     '8057014595710',
    name:        'Dolce Vita flute champagne royal blue',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-flute-royal-blue-1025.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_065',
    sku:         'H.BIK.DLV16',
    barcode:     '8057014595741',
    name:        'Dolce Vita flute champagne ruby',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-flute-ruby-1026.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_066',
    sku:         'H.BIK.DLV42',
    barcode:     '8057014544053',
    name:        'Dolce Vita flute champagne clear gold thread',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-flute-clearfilo-1021.jpg',
    placeholder: false,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_067',
    sku:         'H.BIK.DLV12',
    barcode:     '8057014595758',
    name:        'Dolce Vita flute champagne clear',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_068',
    sku:         'H.BIK.DLV30',
    barcode:     '8057014595765',
    name:        'Dolce Vita flute champagne turquoise',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-flute-turchese-1027.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_069',
    sku:         'H.BIK.DLV13',
    barcode:     '8057014595772',
    name:        'Dolce Vita flute champagne green',
    modelo:      'Dolce Vita',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/dolce-vita-flute-verde-1028.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },

  // 🔲 Nuova Italia  (0/18 con imagen)
  {
    id:          'mlg_106',
    sku:         'H.BIK.ITA4',
    barcode:     '8057014599138',
    name:        'Nuova Italia tumbler grey',
    modelo:      'Nuova Italia',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_107',
    sku:         'H.BIK.ITA1',
    barcode:     '8057014599107',
    name:        'Nuova Italia tumbler royal blue',
    modelo:      'Nuova Italia',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_108',
    sku:         'H.BIK.ITA5',
    barcode:     '8057014599145',
    name:        'Nuova Italia tumbler ruby',
    modelo:      'Nuova Italia',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_109',
    sku:         'H.BIK.ITA2',
    barcode:     '8057014599114',
    name:        'Nuova Italia tumbler clear',
    modelo:      'Nuova Italia',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_110',
    sku:         'H.BIK.ITA6',
    barcode:     '8057014599152',
    name:        'Nuova Italia tumbler turquoise',
    modelo:      'Nuova Italia',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_111',
    sku:         'H.BIK.ITA3',
    barcode:     '8057014599121',
    name:        'Nuova Italia tumbler green',
    modelo:      'Nuova Italia',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_112',
    sku:         'H.BIK.ITA10',
    barcode:     '8057014599190',
    name:        'Nuova Italia wine glass grey',
    modelo:      'Nuova Italia',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_113',
    sku:         'H.BIK.ITA7',
    barcode:     '8057014599169',
    name:        'Nuova Italia wine glass royal blue',
    modelo:      'Nuova Italia',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_114',
    sku:         'H.BIK.ITA11',
    barcode:     '8057014599206',
    name:        'Nuova Italia wine glass ruby',
    modelo:      'Nuova Italia',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_115',
    sku:         'H.BIK.ITA8',
    barcode:     '8057014599176',
    name:        'Nuova Italia wine glass clear',
    modelo:      'Nuova Italia',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_116',
    sku:         'H.BIK.ITA12',
    barcode:     '8057014599213',
    name:        'Nuova Italia wine glass turquoise',
    modelo:      'Nuova Italia',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_117',
    sku:         'H.BIK.ITA9',
    barcode:     '8057014599183',
    name:        'Nuova Italia wine glass green',
    modelo:      'Nuova Italia',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_118',
    sku:         'H.BIK.ITA18',
    barcode:     '8057014599404',
    name:        'Nuova Italia flute grey',
    modelo:      'Nuova Italia',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.68,  // INTERNO
  },
  {
    id:          'mlg_119',
    sku:         'H.BIK.ITA15',
    barcode:     '8057014599374',
    name:        'Nuova Italia flute royal blue',
    modelo:      'Nuova Italia',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.68,  // INTERNO
  },
  {
    id:          'mlg_120',
    sku:         'H.BIK.ITA14',
    barcode:     '8057014599367',
    name:        'Nuova Italia flute ruby',
    modelo:      'Nuova Italia',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.68,  // INTERNO
  },
  {
    id:          'mlg_121',
    sku:         'H.BIK.ITA13',
    barcode:     '8057014599350',
    name:        'Nuova italia flute clear',
    modelo:      'Nuova Italia',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.68,  // INTERNO
  },
  {
    id:          'mlg_122',
    sku:         'H.BIK.ITA17',
    barcode:     '8057014599398',
    name:        'Nuova Italia flute turquoise',
    modelo:      'Nuova Italia',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.68,  // INTERNO
  },
  {
    id:          'mlg_123',
    sku:         'H.BIK.ITA16',
    barcode:     '8057014599381',
    name:        'Nuova Italia flute green',
    modelo:      'Nuova Italia',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.68,  // INTERNO
  },

  // ⚠️ Novella  (10/12 con imagen)
  {
    id:          'mlg_153',
    sku:         'H.BIK.NOV7',
    barcode:     '8057014543155',
    name:        'Novella tumbler amber',
    modelo:      'Novella',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/novella-acqua-ambra-1052.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_154',
    sku:         'H.BIK.NOV8',
    barcode:     '8057014543162',
    name:        'Novella tumbler blue',
    modelo:      'Novella',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/novella-acqua-blu-1054.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_155',
    sku:         'H.BIK.NOV10',
    barcode:     '8057014543124',
    name:        'Novella tumbler gold',
    modelo:      'Novella',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_156',
    sku:         'H.BIK.NOV9',
    barcode:     '8057014543179',
    name:        'Novella tumbler red',
    modelo:      'Novella',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/novella-acqua-rosso-1055.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_157',
    sku:         'H.BIK.NOV12',
    barcode:     '8057014543148',
    name:        'Novella tumbler clear',
    modelo:      'Novella',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/novella-acqua-trasparente-1058.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_158',
    sku:         'H.BIK.NOV11',
    barcode:     '8057014543131',
    name:        'Novella tumbler green',
    modelo:      'Novella',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/novella-acqua-verde-1059.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_159',
    sku:         'H.BIK.NOV1',
    barcode:     '8057014543063',
    name:        'Novella wine glass amber',
    modelo:      'Novella',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/novella-vino-ambra-1060.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_160',
    sku:         'H.BIK.NOV2',
    barcode:     '8057014543070',
    name:        'Novella wine glass blue',
    modelo:      'Novella',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/novella-vino-blu-1062.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_161',
    sku:         'H.BIK.NOV4',
    barcode:     '8057014543094',
    name:        'Novella wine glass gold',
    modelo:      'Novella',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_162',
    sku:         'H.BIK.NOV3',
    barcode:     '8057014543087',
    name:        'Novella wine glass red',
    modelo:      'Novella',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/novella-vino-rosso-1063.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_163',
    sku:         'H.BIK.NOV6',
    barcode:     '8057014543117',
    name:        'Novella wine glass clear',
    modelo:      'Novella',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/novella-vino-trasparente-1066.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_164',
    sku:         'H.BIK.NOV5',
    barcode:     '8057014543100',
    name:        'Novella wine glass green',
    modelo:      'Novella',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/novella-vino-verde-1067.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },

  // ⚠️ Sancho & Panza  (5/6 con imagen)
  {
    id:          'mlg_177',
    sku:         'H.BIK.SAPA1',
    barcode:     '8057014544480',
    name:        'Panza wine glass Ruby',
    modelo:      'Sancho & Panza',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/panza-coppa-ruby-1113.jpg',
    placeholder: false,
    precio_eur:  10.5,  // INTERNO
  },
  {
    id:          'mlg_178',
    sku:         'H.BIK.SAPA2',
    barcode:     '8057014544497',
    name:        'Panza wine glass Ruby',
    modelo:      'Sancho & Panza',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/panza-coppa-ruby-1113.jpg',
    placeholder: false,
    precio_eur:  10.5,  // INTERNO
  },
  {
    id:          'mlg_179',
    sku:         'H.BIK.SAPA3',
    barcode:     '8057014544503',
    name:        'Panza wine glass Green',
    modelo:      'Sancho & Panza',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.5,  // INTERNO
  },
  {
    id:          'mlg_180',
    sku:         'H.BIK.SAPA8',
    barcode:     '8057014544473',
    name:        'Sancho water glass Ruby',
    modelo:      'Sancho & Panza',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/sancho-coppa-ruby-1105.jpg',
    placeholder: false,
    precio_eur:  10.5,  // INTERNO
  },
  {
    id:          'mlg_181',
    sku:         'H.BIK.SAPA9',
    barcode:     '8057014544466',
    name:        'Sancho water glass Clear',
    modelo:      'Sancho & Panza',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/sancho-coppa-trasparente-1108.jpg',
    placeholder: false,
    precio_eur:  10.5,  // INTERNO
  },
  {
    id:          'mlg_182',
    sku:         'H.BIK.SAPA10',
    barcode:     '8057014544459',
    name:        'Sancho water glass Green',
    modelo:      'Sancho & Panza',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/sancho-coppa-verde-1109.jpg',
    placeholder: false,
    precio_eur:  10.5,  // INTERNO
  },

  // ⚠️ Saint Moritz  (6/8 con imagen)
  {
    id:          'mlg_184',
    sku:         'H.BIK.SCR1',
    barcode:     '8057014541342',
    name:        'St. Moritz wine glass clear',
    modelo:      'Saint Moritz',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/saint-moritz-vino-trasparente-1091.jpg',
    placeholder: false,
    precio_eur:  9.68,  // INTERNO
  },
  {
    id:          'mlg_185',
    sku:         'H.BIK.SCR2',
    barcode:     '8057014541366',
    name:        'St. Moritz wine glass red bicolor',
    modelo:      'Saint Moritz',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/saint-moritz-vino-rosso-1087.jpg',
    placeholder: false,
    precio_eur:  9.68,  // INTERNO
  },
  {
    id:          'mlg_186',
    sku:         'H.BIK.SCR3',
    barcode:     '8057014541335',
    name:        'St. Moritz wine glass royal blue bicolor',
    modelo:      'Saint Moritz',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/saint-moritz-vino-royal-blue-1088.jpg',
    placeholder: false,
    precio_eur:  9.68,  // INTERNO
  },
  {
    id:          'mlg_187',
    sku:         'H.BIK.SCR4',
    barcode:     '8057014541359',
    name:        'St. Moritz wine glass green bicolor',
    modelo:      'Saint Moritz',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.68,  // INTERNO
  },
  {
    id:          'mlg_188',
    sku:         'H.BIK.SCR5',
    barcode:     '8057014541380',
    name:        'St. Moritz wine glass high clear',
    modelo:      'Saint Moritz',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/saint-moritz-vino-trasparente-1091.jpg',
    placeholder: false,
    precio_eur:  9.68,  // INTERNO
  },
  {
    id:          'mlg_189',
    sku:         'H.BIK.SCR6',
    barcode:     '8057014541403',
    name:        'St. Moritz wine glass high red bicolor',
    modelo:      'Saint Moritz',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/saint-moritz-vino-rosso-1087.jpg',
    placeholder: false,
    precio_eur:  9.68,  // INTERNO
  },
  {
    id:          'mlg_190',
    sku:         'H.BIK.SCR7',
    barcode:     '8057014541373',
    name:        'St. Moritz wine glass high royal blue bicolor',
    modelo:      'Saint Moritz',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/saint-moritz-vino-royal-blue-1088.jpg',
    placeholder: false,
    precio_eur:  9.68,  // INTERNO
  },
  {
    id:          'mlg_191',
    sku:         'H.BIK.SCR8',
    barcode:     '8057014541397',
    name:        'St. Moritz wine glass high green bicolor',
    modelo:      'Saint Moritz',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.68,  // INTERNO
  },

  // ✅ Stella  (8/8 con imagen)
  {
    id:          'mlg_206',
    sku:         'H.BIK.STE1',
    barcode:     '8057014541915',
    name:        'Stella wine glass clear',
    modelo:      'Stella',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/stella-coppa-trasparente-1099.jpg',
    placeholder: false,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_207',
    sku:         'H.BIK.STE2',
    barcode:     '8057014541946',
    name:        'Stella wine glass red',
    modelo:      'Stella',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/stella-coppa-rosso-1096.jpg',
    placeholder: false,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_208',
    sku:         'H.BIK.STE3',
    barcode:     '8057014541908',
    name:        'Stella wine glass blue',
    modelo:      'Stella',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/stella-coppa-blu-1094.jpg',
    placeholder: false,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_209',
    sku:         'H.BIK.STE4',
    barcode:     '8057014541922',
    name:        'Stella wine glass green',
    modelo:      'Stella',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/stella-coppa-verde-1100.jpg',
    placeholder: false,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_210',
    sku:         'H.BIK.STE5',
    barcode:     '8057014541953',
    name:        'Stella wine glass turquoise',
    modelo:      'Stella',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/stella-coppa-turchese-1098.jpg',
    placeholder: false,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_211',
    sku:         'H.BIK.STE6',
    barcode:     '8057014541892',
    name:        'Stella wine glass amber',
    modelo:      'Stella',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/stella-coppa-ambra-1092.jpg',
    placeholder: false,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_212',
    sku:         'H.BIK.STE7',
    barcode:     '8057014541939',
    name:        'Stella wine glass grey',
    modelo:      'Stella',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/stella-coppa-grigio-1095.jpg',
    placeholder: false,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_213',
    sku:         'H.BIK.STE8',
    barcode:     '8057014541960',
    name:        'Stella wine glass white',
    modelo:      'Stella',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/stella-coppa-bianco-1093.jpg',
    placeholder: false,
    precio_eur:  11.5,  // INTERNO
  },

  // ⚠️ Winston  (12/26 con imagen)
  {
    id:          'mlg_242',
    sku:         'H.BIK.WIN14',
    barcode:     '8057014542486',
    name:        'Winston tumbler blue',
    modelo:      'Winston',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/winston-acqua-blu-1031.jpg',
    placeholder: false,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_243',
    sku:         'H.BIK.WIN23',
    barcode:     '8057014542417',
    name:        'Winston tumbler grey',
    modelo:      'Winston',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/winston-acqua-grigio-1032.jpg',
    placeholder: false,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_244',
    sku:         'H.BIK.WIN19',
    barcode:     '8057014542394',
    name:        'Winston tumbler black',
    modelo:      'Winston',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_245',
    sku:         'H.BIK.WIN21',
    barcode:     '8057014542400',
    name:        'Winston tumbler gold',
    modelo:      'Winston',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_246',
    sku:         'H.BIK.WIN18',
    barcode:     '8057014542387',
    name:        'Winston tumbler ruby',
    modelo:      'Winston',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/winston-acqua-ruby-1035.jpg',
    placeholder: false,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_247',
    sku:         'H.BIK.WIN24',
    barcode:     '8057014542424',
    name:        'Winston tumbler white',
    modelo:      'Winston',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/winston-acqua-bianco-1030.jpg',
    placeholder: false,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_248',
    sku:         'H.BIK.WIN17',
    barcode:     '8057014542370',
    name:        'Winston tumbler clear',
    modelo:      'Winston',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_249',
    sku:         'H.BIK.WIN16',
    barcode:     '8057014542493',
    name:        'Winston tumbler green',
    modelo:      'Winston',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_250',
    sku:         'H.BIK.WIN26',
    barcode:     '8057014542455',
    name:        'Winston wine glass grey',
    modelo:      'Winston',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/winston-vino-grigio-1040.jpg',
    placeholder: false,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_251',
    sku:         'H.BIK.WIN25',
    barcode:     '8057014542448',
    name:        'Winston wine glass gold',
    modelo:      'Winston',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_252',
    sku:         'H.BIK.WIN3',
    barcode:     '8057014540925',
    name:        'Winston wine glass royal blue',
    modelo:      'Winston',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/winston-vino-royal-blue-1042.jpg',
    placeholder: false,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_253',
    sku:         'H.BIK.WIN2',
    barcode:     '8057014542431',
    name:        'Winston wine glass ruby',
    modelo:      'Winston',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/winston-vino-ruby-1043.jpg',
    placeholder: false,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_254',
    sku:         'H.BIK.WIN15',
    barcode:     '8057014540932',
    name:        'Winston wine glass white',
    modelo:      'Winston',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/winston-vino-bianco-1038.jpg',
    placeholder: false,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_255',
    sku:         'H.BIK.WIN5',
    barcode:     '8057014542462',
    name:        'Winston wine glass black',
    modelo:      'Winston',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_256',
    sku:         'H.BIK.WIN1',
    barcode:     '8057014540949',
    name:        'Winston wine glass clear',
    modelo:      'Winston',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_257',
    sku:         'H.BIK.WIN6',
    barcode:     '8057014540956',
    name:        'Winston wine glass turquoise',
    modelo:      'Winston',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/winston-vino-turchese-1044.jpg',
    placeholder: false,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_258',
    sku:         'H.BIK.WIN4',
    barcode:     '8057014540963',
    name:        'Winston wine glass green',
    modelo:      'Winston',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_259',
    sku:         'H.BIK.WIN27',
    barcode:     '8057014542615',
    name:        'Winston cup white',
    modelo:      'Winston',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/winston-acqua-bianco-1030.jpg',
    placeholder: false,
    precio_eur:  11.0,  // INTERNO
  },
  {
    id:          'mlg_260',
    sku:         'H.BIK.WIN9',
    barcode:     '8057014542585',
    name:        'Winston cup royal blue',
    modelo:      'Winston',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/winston-acqua-royal-blue-1034.jpg',
    placeholder: false,
    precio_eur:  11.0,  // INTERNO
  },
  {
    id:          'mlg_261',
    sku:         'H.BIK.WIN8',
    barcode:     '8057014542592',
    name:        'Winston cup clear',
    modelo:      'Winston',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  11.0,  // INTERNO
  },
  {
    id:          'mlg_262',
    sku:         'H.BIK.WIN28',
    barcode:     '8057014542608',
    name:        'Winston cup green',
    modelo:      'Winston',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  11.0,  // INTERNO
  },
  {
    id:          'mlg_263',
    sku:         'H.BIK.WIN12',
    barcode:     '8057014542653',
    name:        'Winston flute white',
    modelo:      'Winston',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/winston-flute-bianco-1046.jpg',
    placeholder: false,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_264',
    sku:         'H.BIK.WIN11',
    barcode:     '8057014542622',
    name:        'Winston flute blu',
    modelo:      'Winston',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_265',
    sku:         'H.BIK.WIN20',
    barcode:     '8057014542745',
    name:        'Winston flute gold',
    modelo:      'Winston',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_266',
    sku:         'H.BIK.WIN10',
    barcode:     '8057014542639',
    name:        'Winston flute clear',
    modelo:      'Winston',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_267',
    sku:         'H.BIK.WIN13',
    barcode:     '8057014542646',
    name:        'Winston flute green',
    modelo:      'Winston',
    familia:     'COPAS & VASOS CON PIE',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  11.5,  // INTERNO
  },

  // ═══════════════════════════════════════════════════════════════
  // VASOS & TUMBLERS
  // 146 SKUs total · 63 con imagen · 83 pendientes
  // ═══════════════════════════════════════════════════════════════

  // ⚠️ Double Face  (7/9 con imagen)
  {
    id:          'mlg_021',
    sku:         'H.BIK.DF1',
    barcode:     '8057014590234',
    name:        'Double Face tumbler fluo orange',
    modelo:      'Double Face',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/double-face-fluo-orange-1134.jpg',
    placeholder: false,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_022',
    sku:         'H.BIK.DF2',
    barcode:     '8057014590258',
    name:        'Double Face tumbler fluo green',
    modelo:      'Double Face',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/double-face-fluo-green-1135.jpg',
    placeholder: false,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_023',
    sku:         'H.BIK.DF3',
    barcode:     '8057014590241',
    name:        'Double Face tumbler fluo fuxia',
    modelo:      'Double Face',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/double-face-fluo-fuxia-1136.jpg',
    placeholder: false,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_024',
    sku:         'H.BIK.DF4',
    barcode:     '8057014590227',
    name:        'Double Face tumbler light blue',
    modelo:      'Double Face',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/double-face-light-blue-1137.jpg',
    placeholder: false,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_025',
    sku:         'H.BIK.DF5',
    barcode:     '8057014590265',
    name:        'Double Face tumbler black',
    modelo:      'Double Face',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/double-face-black-1138.jpg',
    placeholder: false,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_026',
    sku:         'H.BIK.DF6',
    barcode:     '8057014590210',
    name:        'Double Face tumbler white',
    modelo:      'Double Face',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/double-face-white-1139.jpg',
    placeholder: false,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_027',
    sku:         'H.BIK.DF7',
    barcode:     '8057014598490',
    name:        'Double Face tumbler blue/green',
    modelo:      'Double Face',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/double-face-blue-1142.jpg',
    placeholder: false,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_028',
    sku:         'H.BIK.DF8',
    barcode:     '8057014598506',
    name:        'Double Face tumbler cobalt purple',
    modelo:      'Double Face',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_029',
    sku:         'H.BIK.DF9',
    barcode:     '8057014598513',
    name:        'Double Face tumbler scarlet',
    modelo:      'Double Face',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  8.47,  // INTERNO
  },

  // 🔲 Diamante  (0/6 con imagen)
  {
    id:          'mlg_030',
    sku:         'H.BIK.DIA02',
    barcode:     '8057014590180',
    name:        'Diamante tumbler clear',
    modelo:      'Diamante',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  7.87,  // INTERNO
  },
  {
    id:          'mlg_031',
    sku:         'H.BIK.DIA07',
    barcode:     '8057014590142',
    name:        'Diamante tumbler fumé',
    modelo:      'Diamante',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  7.87,  // INTERNO
  },
  {
    id:          'mlg_032',
    sku:         'H.BIK.DIA09',
    barcode:     '8057014590135',
    name:        'Diamante tumbler dark green',
    modelo:      'Diamante',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  7.87,  // INTERNO
  },
  {
    id:          'mlg_033',
    sku:         'H.BIK.DIA10',
    barcode:     '8057014590173',
    name:        'Diamante tumbler royal blue',
    modelo:      'Diamante',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  7.87,  // INTERNO
  },
  {
    id:          'mlg_034',
    sku:         'H.BIK.DIA14',
    barcode:     '8057014590203',
    name:        'Diamante tumbler Via Lattea',
    modelo:      'Diamante',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_035',
    sku:         'H.BIK.DIA55',
    barcode:     '8057014543452',
    name:        'Diamante tumbler turquoise Portofino Dry Gin',
    modelo:      'Diamante',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  7.87,  // INTERNO
  },

  // 🔲 Forte dei Marmi  (0/4 con imagen)
  {
    id:          'mlg_070',
    sku:         'H.BIK.FDM3',
    barcode:     '8057014540741',
    name:        'Forte dei Marmi amber/green',
    modelo:      'Forte dei Marmi',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_071',
    sku:         'H.BIK.FDM10',
    barcode:     '8057014540734',
    name:        'Forte dei Marmi white/black',
    modelo:      'Forte dei Marmi',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_072',
    sku:         'H.BIK.FDM5',
    barcode:     '8057014540758',
    name:        'Forte dei Marmi black/white',
    modelo:      'Forte dei Marmi',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_073',
    sku:         'H.BIK.FDM1',
    barcode:     '8057014540727',
    name:        'Forte dei Marmi ruby/green',
    modelo:      'Forte dei Marmi',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.29,  // INTERNO
  },

  // 🔲 Fisheye  (0/15 con imagen)
  {
    id:          'mlg_074',
    sku:         'H.BIK.FIS1',
    barcode:     '8057014541786',
    name:        'Fisheye tumbler red',
    modelo:      'Fisheye',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_075',
    sku:         'H.BIK.FIS10',
    barcode:     '8057014542974',
    name:        'Fisheye tumbler fluo fuxia',
    modelo:      'Fisheye',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_076',
    sku:         'H.BIK.FIS11',
    barcode:     '8057014542981',
    name:        'Fisheye fluo orange',
    modelo:      'Fisheye',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_077',
    sku:         'H.BIK.FIS12',
    barcode:     '8057014544169',
    name:        'Fisheye tumbler frost/white',
    modelo:      'Fisheye',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.0,  // INTERNO
  },
  {
    id:          'mlg_078',
    sku:         'H.BIK.FIS13',
    barcode:     '8057014544176',
    name:        'Fisheye tumbler yellow',
    modelo:      'Fisheye',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_079',
    sku:         'H.BIK.FIS14',
    barcode:     '8057014544183',
    name:        'Fisheye tumbler pink',
    modelo:      'Fisheye',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_080',
    sku:         'H.BIK.FIS15',
    barcode:     '8057014544190',
    name:        'Fisheye tumbler aquamarine',
    modelo:      'Fisheye',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_081',
    sku:         'H.BIK.FIS2',
    barcode:     '8057014541755',
    name:        'Fisheye tumbler clear',
    modelo:      'Fisheye',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_082',
    sku:         'H.BIK.FIS3',
    barcode:     '8057014541748',
    name:        'Fisheye tumbler blue',
    modelo:      'Fisheye',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_083',
    sku:         'H.BIK.FIS4',
    barcode:     '8057014541762',
    name:        'Fisheye tumbler green',
    modelo:      'Fisheye',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_084',
    sku:         'H.BIK.FIS5',
    barcode:     '8057014542998',
    name:        'Fisheye tumbler turquoise',
    modelo:      'Fisheye',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_085',
    sku:         'H.BIK.FIS6',
    barcode:     '8057014541779',
    name:        'Fisheye tumbler grey',
    modelo:      'Fisheye',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_086',
    sku:         'H.BIK.FIS7',
    barcode:     '8057014543001',
    name:        'Fisheye tumbler black',
    modelo:      'Fisheye',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_087',
    sku:         'H.BIK.FIS8',
    barcode:     '8057014541793',
    name:        'Fisheye tumbler white',
    modelo:      'Fisheye',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_088',
    sku:         'H.BIK.FIS9',
    barcode:     '8057014543018',
    name:        'Fisheye tumbler fluo green',
    modelo:      'Fisheye',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },

  // 🔲 Wine & Drinks  (0/7 con imagen)
  {
    id:          'mlg_089',
    sku:         'H.BIK.FLU4',
    barcode:     '8057014590906',
    name:        'Wine & Drinks Billionaire clear',
    modelo:      'Wine & Drinks',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_090',
    sku:         'H.BIK.FLU10',
    barcode:     '8057014544145',
    name:        'Wine E Drinks bistrot frost',
    modelo:      'Wine & Drinks',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.68,  // INTERNO
  },
  {
    id:          'mlg_091',
    sku:         'H.BIK.FLU1',
    barcode:     '8057014590913',
    name:        'Wine & Drinks bistrot clear',
    modelo:      'Wine & Drinks',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.68,  // INTERNO
  },
  {
    id:          'mlg_092',
    sku:         'H.BIK.FLU3',
    barcode:     '8057014595369',
    name:        'MARTINI GLASS CLEAR',
    modelo:      'Wine & Drinks',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  7.87,  // INTERNO
  },
  {
    id:          'mlg_093',
    sku:         'H.BIK.FLU',
    barcode:     '8057014595833',
    name:        'Wine & Drinks flute clear',
    modelo:      'Wine & Drinks',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  7.87,  // INTERNO
  },
  {
    id:          'mlg_094',
    sku:         'H.BIK.FLU7',
    barcode:     '8057014544152',
    name:        'Wine E Drinks Twiga frost',
    modelo:      'Wine & Drinks',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.5,  // INTERNO
  },
  {
    id:          'mlg_095',
    sku:         'H.BIK.FLU2',
    barcode:     '8057014597318',
    name:        'Wine & Drinks Twiga clear',
    modelo:      'Wine & Drinks',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },

  // ⚠️ Gulli  (8/10 con imagen)
  {
    id:          'mlg_096',
    sku:         'H.BIK.GUL1',
    barcode:     '8057014599886',
    name:        'Gulli tumbler white',
    modelo:      'Gulli',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/gulli-white-1192.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_097',
    sku:         'H.BIK.GUL5',
    barcode:     '8057014599862',
    name:        'Gulli tumbler fluo orange',
    modelo:      'Gulli',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/gulli-fluo-orange-1193.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_098',
    sku:         'H.BIK.GUL3',
    barcode:     '8057014599855',
    name:        'Gulli tumbler fluo green',
    modelo:      'Gulli',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/gulli-fluo-green-1194.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_099',
    sku:         'H.BIK.GUL2',
    barcode:     '8057014599831',
    name:        'Gulli tumbler black',
    modelo:      'Gulli',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/gulli-black-1195.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_100',
    sku:         'H.BIK.GUL4',
    barcode:     '8057014599848',
    name:        'Gulli tumbler clear',
    modelo:      'Gulli',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/gulli-clear-1196.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_101',
    sku:         'H.BIK.GUL7',
    barcode:     '8057014599879',
    name:        'Gulli tumbler turquoise',
    modelo:      'Gulli',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/gulli-turquoise-1197.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_102',
    sku:         'H.BIK.GUL8',
    barcode:     '8057014540710',
    name:        'Gulli tumbler amber/green',
    modelo:      'Gulli',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_103',
    sku:         'H.BIK.GUL10',
    barcode:     '8057014540680',
    name:        'Gulli tumbler ruby/green',
    modelo:      'Gulli',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_104',
    sku:         'H.BIK.GUL12',
    barcode:     '8057014540697',
    name:        'Gulli tumbler white/black',
    modelo:      'Gulli',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/gulli-white-1192.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },
  {
    id:          'mlg_105',
    sku:         'H.BIK.GUL13',
    barcode:     '8057014540703',
    name:        'Gulli tumbler black/white',
    modelo:      'Gulli',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/gulli-white-1192.jpg',
    placeholder: false,
    precio_eur:  10.29,  // INTERNO
  },

  // ⚠️ Lente  (15/23 con imagen)
  {
    id:          'mlg_124',
    sku:         'H.BIK.LEN26',
    barcode:     '8057014541243',
    name:        'Lente tumbler blue/white',
    modelo:      'Lente',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/lente-basso-blue-bianco-1116.jpg',
    placeholder: false,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_125',
    sku:         'H.BIK.LEN31',
    barcode:     '8057014541694',
    name:        'Lente tumbler grey/white',
    modelo:      'Lente',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/lente-basso-grigio-bianco-1121.jpg',
    placeholder: false,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_126',
    sku:         'H.BIK.LEN27',
    barcode:     '8057014541281',
    name:        'Lente tumbler red/white',
    modelo:      'Lente',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/lente-basso-rosso-bianco-1120.jpg',
    placeholder: false,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_127',
    sku:         'H.BIK.LEN30',
    barcode:     '8057014541298',
    name:        'Lente tumbler turquoise/white',
    modelo:      'Lente',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/lente-basso-turchese-bianco-1119.jpg',
    placeholder: false,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_128',
    sku:         'H.BIK.LEN29',
    barcode:     '8057014541267',
    name:        'Lente tumbler green/white',
    modelo:      'Lente',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/lente-basso-verde-bianco-1124.jpg',
    placeholder: false,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_129',
    sku:         'H.BIK.LEN28',
    barcode:     '8057014541274',
    name:        'Lente tumbler purple/white',
    modelo:      'Lente',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_130',
    sku:         'H.BIK.LEN4',
    barcode:     '8057014590272',
    name:        'Lente tumbler white high',
    modelo:      'Lente',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_131',
    sku:         'H.BIK.LEN3',
    barcode:     '8057014590289',
    name:        'Lente tumbler white',
    modelo:      'Lente',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_132',
    sku:         'H.BIK.LEN21',
    barcode:     '8057014590296',
    name:        'Lente tumbler blue high',
    modelo:      'Lente',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/lente-alto-blue-bianco-1125.jpg',
    placeholder: false,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_133',
    sku:         'H.BIK.LEN13',
    barcode:     '8057014590302',
    name:        'Lente tumbler blue',
    modelo:      'Lente',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/lente-basso-blue-bianco-1116.jpg',
    placeholder: false,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_134',
    sku:         'H.BIK.LEN17',
    barcode:     '8057014590319',
    name:        'Lente tumbler fluo orange',
    modelo:      'Lente',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_135',
    sku:         'H.BIK.LEN18',
    barcode:     '8057014590326',
    name:        'Lente tumbler fluo fuxia',
    modelo:      'Lente',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_136',
    sku:         'H.BIK.LEN16',
    barcode:     '8057014590333',
    name:        'Lente tumbler fluo green',
    modelo:      'Lente',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/lente-basso-verde-bianco-1124.jpg',
    placeholder: false,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_137',
    sku:         'H.BIK.LEN5',
    barcode:     '8057014590340',
    name:        'Lente tumbler grey',
    modelo:      'Lente',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/lente-basso-grigio-bianco-1121.jpg',
    placeholder: false,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_138',
    sku:         'H.BIK.LEN2',
    barcode:     '8057014590357',
    name:        'Lente tumbler black high',
    modelo:      'Lente',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_139',
    sku:         'H.BIK.LEN1',
    barcode:     '8057014590364',
    name:        'Lente tumbler black',
    modelo:      'Lente',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_140',
    sku:         'H.BIK.LEN35',
    barcode:     '8057014545111',
    name:        'Lente tumbler pink',
    modelo:      'Lente',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_141',
    sku:         'H.BIK.LEN23',
    barcode:     '8057014590371',
    name:        'Lente tumbler red high',
    modelo:      'Lente',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/lente-alto-rosso-bianco-1129.jpg',
    placeholder: false,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_142',
    sku:         'H.BIK.LEN11',
    barcode:     '8057014590388',
    name:        'Lente tumbler red',
    modelo:      'Lente',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/lente-basso-rosso-bianco-1120.jpg',
    placeholder: false,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_143',
    sku:         'H.BIK.LEN20',
    barcode:     '8057014590395',
    name:        'Lente tumbler clear high',
    modelo:      'Lente',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/lente-alto-clear-bianco-1126.jpg',
    placeholder: false,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_144',
    sku:         'H.BIK.LEN19',
    barcode:     '8057014590401',
    name:        'Lente tumbler clear',
    modelo:      'Lente',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/lente-basso-clear-bianco-1117.jpg',
    placeholder: false,
    precio_eur:  8.47,  // INTERNO
  },
  {
    id:          'mlg_145',
    sku:         'H.BIK.LEN24',
    barcode:     '8057014590418',
    name:        'Lente tumbler turquoise high',
    modelo:      'Lente',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/lente-alto-turchese-bianco-1128.jpg',
    placeholder: false,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_146',
    sku:         'H.BIK.LEN15',
    barcode:     '8057014590425',
    name:        'Lente tumbler turquoise',
    modelo:      'Lente',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/lente-basso-turchese-bianco-1119.jpg',
    placeholder: false,
    precio_eur:  8.47,  // INTERNO
  },

  // 🔲 Mille e Una Notte  (0/6 con imagen)
  {
    id:          'mlg_147',
    sku:         'H.BIK.MUN1',
    barcode:     '8057014542660',
    name:        'Mille e una Notte tumbler amber',
    modelo:      'Mille e Una Notte',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  11.0,  // INTERNO
  },
  {
    id:          'mlg_148',
    sku:         'H.BIK.MUN2',
    barcode:     '8057014542684',
    name:        'Mille e una Notte clear',
    modelo:      'Mille e Una Notte',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  11.0,  // INTERNO
  },
  {
    id:          'mlg_149',
    sku:         'H.BIK.MUN3',
    barcode:     '8057014542677',
    name:        'Mille e una Notte blue',
    modelo:      'Mille e Una Notte',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  11.0,  // INTERNO
  },
  {
    id:          'mlg_150',
    sku:         'H.BIK.MUN4',
    barcode:     '8057014542691',
    name:        'Mille e una Notte green',
    modelo:      'Mille e Una Notte',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  11.0,  // INTERNO
  },
  {
    id:          'mlg_151',
    sku:         'H.BIK.MUN5',
    barcode:     '8057014542714',
    name:        'Mille e una Notte turquoise',
    modelo:      'Mille e Una Notte',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  11.0,  // INTERNO
  },
  {
    id:          'mlg_152',
    sku:         'H.BIK.MUN6',
    barcode:     '8057014542707',
    name:        'Mille e una Notte red',
    modelo:      'Mille e Una Notte',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  11.0,  // INTERNO
  },

  // 🔲 Palazzo  (0/4 con imagen)
  {
    id:          'mlg_165',
    sku:         'H.BIK.PAL1',
    barcode:     '8057014598582',
    name:        'Palazzo tumbler clear',
    modelo:      'Palazzo',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.89,  // INTERNO
  },
  {
    id:          'mlg_166',
    sku:         'H.BIK.PAL2',
    barcode:     '8057014598599',
    name:        'Palazzo tumbler blue',
    modelo:      'Palazzo',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.89,  // INTERNO
  },
  {
    id:          'mlg_167',
    sku:         'H.BIK.PAL3',
    barcode:     '8057014598605',
    name:        'Palazzo tumbler red',
    modelo:      'Palazzo',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.89,  // INTERNO
  },
  {
    id:          'mlg_168',
    sku:         'H.BIK.PAL4',
    barcode:     '8057014598612',
    name:        'Palazzo tumbler green',
    modelo:      'Palazzo',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.89,  // INTERNO
  },

  // ⚠️ Peter  (3/4 con imagen)
  {
    id:          'mlg_169',
    sku:         'H.BIK.PET1',
    barcode:     '8057014545302',
    name:        'Peter tumbler clear',
    modelo:      'Peter',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/peter-trasparente-1181.jpg',
    placeholder: false,
    precio_eur:  10.5,  // INTERNO
  },
  {
    id:          'mlg_170',
    sku:         'H.BIK.PET2',
    barcode:     '8057014545319',
    name:        'Peter tumbler amber',
    modelo:      'Peter',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/peter-ambra-1179.jpg',
    placeholder: false,
    precio_eur:  10.5,  // INTERNO
  },
  {
    id:          'mlg_171',
    sku:         'H.BIK.PET4',
    barcode:     '8057014545326',
    name:        'Peter tumbler green',
    modelo:      'Peter',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/peter-verde-1182.jpg',
    placeholder: false,
    precio_eur:  10.5,  // INTERNO
  },
  {
    id:          'mlg_172',
    sku:         'H.BIK.PET5',
    barcode:     '8057014545333',
    name:        'Peter tumbler royal blue',
    modelo:      'Peter',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.5,  // INTERNO
  },

  // ⚠️ Pie  (3/4 con imagen)
  {
    id:          'mlg_173',
    sku:         'H.BIK.PIE1',
    barcode:     '8057014545494',
    name:        'Pie tumbler clear',
    modelo:      'Pie',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/pie-trasparente-1185.jpg',
    placeholder: false,
    precio_eur:  10.0,  // INTERNO
  },
  {
    id:          'mlg_174',
    sku:         'H.BIK.PIE2',
    barcode:     '8057014545500',
    name:        'Pie tumbler amber',
    modelo:      'Pie',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/pie-ambra-1183.jpg',
    placeholder: false,
    precio_eur:  10.0,  // INTERNO
  },
  {
    id:          'mlg_175',
    sku:         'H.BIK.PIE3',
    barcode:     '8057014545517',
    name:        'Pie tumbler green',
    modelo:      'Pie',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/pie-verde-1186.jpg',
    placeholder: false,
    precio_eur:  10.0,  // INTERNO
  },
  {
    id:          'mlg_176',
    sku:         'H.BIK.PIE4',
    barcode:     '8057014545524',
    name:        'Pie tumbler royal blue',
    modelo:      'Pie',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.0,  // INTERNO
  },

  // ✅ Scotch  (1/1 con imagen)
  {
    id:          'mlg_183',
    sku:         'H.BIK.SCO2',
    barcode:     '8057014590593',
    name:        'Scotch tumbler clear',
    modelo:      'Scotch',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/scotch-trasparente-1191.jpg',
    placeholder: false,
    precio_eur:  9.68,  // INTERNO
  },

  // ✅ Siviglia  (1/1 con imagen)
  {
    id:          'mlg_192',
    sku:         'H.BIK.SIV7',
    barcode:     '8057014599251',
    name:        'Siviglia tumbler white frost',
    modelo:      'Siviglia',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/siviglia-white-frost-1169.jpg',
    placeholder: false,
    precio_eur:  9.68,  // INTERNO
  },

  // 🔲 Super Star  (0/5 con imagen)
  {
    id:          'mlg_193',
    sku:         'H.BIK.SS1',
    barcode:     '8057014590678',
    name:        'Super Star tumbler white',
    modelo:      'Super Star',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_194',
    sku:         'H.BIK.SS2',
    barcode:     '8057014590708',
    name:        'Super Star tumbler black',
    modelo:      'Super Star',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_195',
    sku:         'H.BIK.SS3',
    barcode:     '8057014590722',
    name:        'Super Star tumbler clear',
    modelo:      'Super Star',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_196',
    sku:         'H.BIK.SS6',
    barcode:     '8057014590715',
    name:        'Super Star tumbler red',
    modelo:      'Super Star',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_197',
    sku:         'H.BIK.SS7',
    barcode:     '8057014590692',
    name:        'Super Star tumbler blue/green',
    modelo:      'Super Star',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },

  // 🔲 Stella Tumbler  (0/8 con imagen)
  {
    id:          'mlg_198',
    sku:         'H.BIK.STARD.10',
    barcode:     '8057014540833',
    name:        'Stella tumbler amber',
    modelo:      'Stella Tumbler',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_199',
    sku:         'H.BIK.STARD.3',
    barcode:     '8057014540864',
    name:        'Stella tumbler blue',
    modelo:      'Stella Tumbler',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_200',
    sku:         'H.BIK.STARD.4',
    barcode:     '8057014540901',
    name:        'Stella tumbler green',
    modelo:      'Stella Tumbler',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_201',
    sku:         'H.BIK.STARD.5',
    barcode:     '8057014540840',
    name:        'Stella tumbler grey',
    modelo:      'Stella Tumbler',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_202',
    sku:         'H.BIK.STARD.6',
    barcode:     '8057014540895',
    name:        'Stella tumbler turquoise',
    modelo:      'Stella Tumbler',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_203',
    sku:         'H.BIK.STARD.7',
    barcode:     '8057014540871',
    name:        'Stella tumbler white',
    modelo:      'Stella Tumbler',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_204',
    sku:         'H.BIK.STARD1',
    barcode:     '8057014540888',
    name:        'Stella tumbler clear',
    modelo:      'Stella Tumbler',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_205',
    sku:         'H.BIK.STARD2',
    barcode:     '8057014540857',
    name:        'Stella tumbler red',
    modelo:      'Stella Tumbler',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },

  // ⚠️ Super Tumbler / Milly  (14/16 con imagen)
  {
    id:          'mlg_214',
    sku:         'H.BIK.TUM8',
    barcode:     '8057014590616',
    name:        'Super tumbler amber',
    modelo:      'Super Tumbler / Milly',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/super-milly-ambra-1152.jpg',
    placeholder: false,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_215',
    sku:         'H.BIK.TUM9',
    barcode:     '8057014590623',
    name:        'Super tumbler blue',
    modelo:      'Super Tumbler / Milly',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/super-milly-blu-1154.jpg',
    placeholder: false,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_216',
    sku:         'H.BIK.TUM11',
    barcode:     '8057014598728',
    name:        'Super tumbler white frost',
    modelo:      'Super Tumbler / Milly',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/super-milly-bianco-1153.jpg',
    placeholder: false,
    precio_eur:  13.92,  // INTERNO
  },
  {
    id:          'mlg_217',
    sku:         'H.BIK.TUM13',
    barcode:     '8057014590630',
    name:        'Super tumbler red',
    modelo:      'Super Tumbler / Milly',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/super-milly-rosso-1155.jpg',
    placeholder: false,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_218',
    sku:         'H.BIK.TUM16',
    barcode:     '8057014544404',
    name:        'Super tumbler rubi',
    modelo:      'Super Tumbler / Milly',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_219',
    sku:         'H.BIK.TUM10',
    barcode:     '8057014590647',
    name:        'Super tumbler clear',
    modelo:      'Super Tumbler / Milly',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/super-milly-trasparente-1158.jpg',
    placeholder: false,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_220',
    sku:         'H.BIK.TUM12',
    barcode:     '8057014590654',
    name:        'Super tumbler turquoise',
    modelo:      'Super Tumbler / Milly',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/super-milly-turchese-1157.jpg',
    placeholder: false,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_221',
    sku:         'H.BIK.TUM14',
    barcode:     '8057014590661',
    name:        'Super tumbler green',
    modelo:      'Super Tumbler / Milly',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/super-milly-verde-1159.jpg',
    placeholder: false,
    precio_eur:  11.5,  // INTERNO
  },
  {
    id:          'mlg_222',
    sku:         'H.BIK.TUM4',
    barcode:     '8057014590470',
    name:        'Tumbler amber',
    modelo:      'Super Tumbler / Milly',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/milly-ambra-1143.jpg',
    placeholder: false,
    precio_eur:  10.89,  // INTERNO
  },
  {
    id:          'mlg_223',
    sku:         'H.BIK.TUM2',
    barcode:     '8057014598711',
    name:        'Tumbler white frost',
    modelo:      'Super Tumbler / Milly',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/milly-bianco-1144.jpg',
    placeholder: false,
    precio_eur:  12.1,  // INTERNO
  },
  {
    id:          'mlg_224',
    sku:         'H.BIK.TUM3',
    barcode:     '8057014590494',
    name:        'Tumbler red',
    modelo:      'Super Tumbler / Milly',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/milly-rosso-1146.jpg',
    placeholder: false,
    precio_eur:  10.89,  // INTERNO
  },
  {
    id:          'mlg_225',
    sku:         'H.BIK.TUM6',
    barcode:     '8057014590487',
    name:        'Tumbler royal blue',
    modelo:      'Super Tumbler / Milly',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/milly-royal-blue-1151.jpg',
    placeholder: false,
    precio_eur:  10.89,  // INTERNO
  },
  {
    id:          'mlg_226',
    sku:         'H.BIK.TUM15',
    barcode:     '8057014544398',
    name:        'Tumbler ruby',
    modelo:      'Super Tumbler / Milly',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.89,  // INTERNO
  },
  {
    id:          'mlg_227',
    sku:         'H.BIK.TUM1',
    barcode:     '8057014590500',
    name:        'Tumbler clear',
    modelo:      'Super Tumbler / Milly',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/milly-trasparente-1148.jpg',
    placeholder: false,
    precio_eur:  10.89,  // INTERNO
  },
  {
    id:          'mlg_228',
    sku:         'H.BIK.TUM5',
    barcode:     '8057014590517',
    name:        'Tumbler turquoise',
    modelo:      'Super Tumbler / Milly',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/milly-turchese-1147.jpg',
    placeholder: false,
    precio_eur:  10.89,  // INTERNO
  },
  {
    id:          'mlg_229',
    sku:         'H.BIK.TUM7',
    barcode:     '8057014590524',
    name:        'Tumbler green',
    modelo:      'Super Tumbler / Milly',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/milly-verde-1149.jpg',
    placeholder: false,
    precio_eur:  10.89,  // INTERNO
  },

  // ⚠️ Venezia  (4/6 con imagen)
  {
    id:          'mlg_230',
    sku:         'H.BIK.VEN1',
    barcode:     '8057014590791',
    name:        'Venezia tumbler clear',
    modelo:      'Venezia',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/venezia-trasparente-1176.jpg',
    placeholder: false,
    precio_eur:  7.87,  // INTERNO
  },
  {
    id:          'mlg_231',
    sku:         'H.BIK.VEN3',
    barcode:     '8057014590807',
    name:        'Venezia tumbler green',
    modelo:      'Venezia',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/venezia-verde-1177.jpg',
    placeholder: false,
    precio_eur:  7.87,  // INTERNO
  },
  {
    id:          'mlg_232',
    sku:         'H.BIK.VEN4',
    barcode:     '8057014590753',
    name:        'Venezia tumbler fumè',
    modelo:      'Venezia',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  7.87,  // INTERNO
  },
  {
    id:          'mlg_233',
    sku:         'H.BIK.VEN5',
    barcode:     '8057014590777',
    name:        'Venezia tumbler red',
    modelo:      'Venezia',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/venezia-rosso-1173.jpg',
    placeholder: false,
    precio_eur:  7.87,  // INTERNO
  },
  {
    id:          'mlg_234',
    sku:         'H.BIK.VEN6',
    barcode:     '8057014590784',
    name:        'Venezia tumbler royal blue',
    modelo:      'Venezia',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  7.87,  // INTERNO
  },
  {
    id:          'mlg_235',
    sku:         'H.BIK.VEN7',
    barcode:     '8057014590746',
    name:        'Venezia tumbler amber',
    modelo:      'Venezia',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/venezia-ambra-1170.jpg',
    placeholder: false,
    precio_eur:  7.87,  // INTERNO
  },

  // 🔲 David  (0/6 con imagen)
  {
    id:          'mlg_236',
    sku:         'H.BIK.VIE1',
    barcode:     '8057014541472',
    name:        'David tumbler clear',
    modelo:      'David',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_237',
    sku:         'H.BIK.VIE2',
    barcode:     '8057014541502',
    name:        'David tumbler ruby',
    modelo:      'David',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_238',
    sku:         'H.BIK.VIE3',
    barcode:     '8057014541465',
    name:        'David tumbler royal blue',
    modelo:      'David',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_239',
    sku:         'H.BIK.VIE4',
    barcode:     '8057014541489',
    name:        'David tumbler green',
    modelo:      'David',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_240',
    sku:         'H.BIK.VIE5',
    barcode:     '8057014541496',
    name:        'David tumbler grey',
    modelo:      'David',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },
  {
    id:          'mlg_241',
    sku:         'H.BIK.VIE8',
    barcode:     '8057014541458',
    name:        'David tumbler amber',
    modelo:      'David',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.08,  // INTERNO
  },

  // 🔲 Whiskey  (0/1 con imagen)
  {
    id:          'mlg_268',
    sku:         'H.BIK.WIS1',
    barcode:     '8057014590876',
    name:        'Wiskey tumbler clear',
    modelo:      'Whiskey',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.79,  // INTERNO
  },

  // ⚠️ Zeynep  (7/10 con imagen)
  {
    id:          'mlg_269',
    sku:         'H.BIK.ZEY1',
    barcode:     '8057014542516',
    name:        'Zeynep tumbler clear',
    modelo:      'Zeynep',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/zeynep-trasparente-1166.jpg',
    placeholder: false,
    precio_eur:  9.9,  // INTERNO
  },
  {
    id:          'mlg_270',
    sku:         'H.BIK.ZEY10',
    barcode:     '8057014544206',
    name:        'Zeynep tumbler aquamarine',
    modelo:      'Zeynep',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.9,  // INTERNO
  },
  {
    id:          'mlg_271',
    sku:         'H.BIK.ZEY2',
    barcode:     '8057014542509',
    name:        'Zeynep tumbler blue',
    modelo:      'Zeynep',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/zeynep-blu-1162.jpg',
    placeholder: false,
    precio_eur:  9.9,  // INTERNO
  },
  {
    id:          'mlg_272',
    sku:         'H.BIK.ZEY3',
    barcode:     '8057014542523',
    name:        'Zeynep tumbler grey',
    modelo:      'Zeynep',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/zeynep-grigio-1168.jpg',
    placeholder: false,
    precio_eur:  9.9,  // INTERNO
  },
  {
    id:          'mlg_273',
    sku:         'H.BIK.ZEY4',
    barcode:     '8057014542530',
    name:        'Zeynep tumbler white',
    modelo:      'Zeynep',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/zeynep-bianco-1161.jpg',
    placeholder: false,
    precio_eur:  9.9,  // INTERNO
  },
  {
    id:          'mlg_274',
    sku:         'H.BIK.ZEY5',
    barcode:     '8057014542721',
    name:        'Zeynep tumbler green',
    modelo:      'Zeynep',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/zeynep-verde-1167.jpg',
    placeholder: false,
    precio_eur:  9.9,  // INTERNO
  },
  {
    id:          'mlg_275',
    sku:         'H.BIK.ZEY6',
    barcode:     '8057014542738',
    name:        'Zeynep tumbler red',
    modelo:      'Zeynep',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/zeynep-rosso-1163.jpg',
    placeholder: false,
    precio_eur:  9.9,  // INTERNO
  },
  {
    id:          'mlg_276',
    sku:         'H.BIK.ZEY7',
    barcode:     '8057014544213',
    name:        'Zeynep tumbler frost/white',
    modelo:      'Zeynep',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/zeynep-bianco-1161.jpg',
    placeholder: false,
    precio_eur:  11.0,  // INTERNO
  },
  {
    id:          'mlg_277',
    sku:         'H.BIK.ZEY8',
    barcode:     '8057014544220',
    name:        'Zeynep tumbler yellow',
    modelo:      'Zeynep',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.9,  // INTERNO
  },
  {
    id:          'mlg_278',
    sku:         'H.BIK.ZEY9',
    barcode:     '8057014544237',
    name:        'Zeynep tumbler pink',
    modelo:      'Zeynep',
    familia:     'VASOS & TUMBLERS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.9,  // INTERNO
  },

  // ═══════════════════════════════════════════════════════════════
  // JARRAS
  // 88 SKUs total · 37 con imagen · 51 pendientes
  // ═══════════════════════════════════════════════════════════════

  // ✅ Cesara  (1/1 con imagen)
  {
    id:          'mlg_307',
    sku:         'H.BRO.CES1',
    barcode:     '8057014599442',
    name:        'Cesara pitcher clear',
    modelo:      'Cesara',
    familia:     'JARRAS',
    image:       'images/products/cesara-trasparente-1271.jpg',
    placeholder: false,
    precio_eur:  33.88,  // INTERNO
  },

  // ⚠️ Palla  (8/20 con imagen)
  {
    id:          'mlg_308',
    sku:         'H.BRO.DIA18',
    barcode:     '8057014597561',
    name:        'Diamante pitcher lilla',
    modelo:      'Palla',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  22.99,  // INTERNO
  },
  {
    id:          'mlg_309',
    sku:         'H.BRO.DIA19',
    barcode:     '8057014597608',
    name:        'Diamante pitcher green',
    modelo:      'Palla',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  22.99,  // INTERNO
  },
  {
    id:          'mlg_310',
    sku:         'H.BRO.DIA21',
    barcode:     '8057014597769',
    name:        'Palla pitcher clear',
    modelo:      'Palla',
    familia:     'JARRAS',
    image:       'images/products/palla-trasparente-1203.jpg',
    placeholder: false,
    precio_eur:  29.04,  // INTERNO
  },
  {
    id:          'mlg_311',
    sku:         'H.BRO.DIA22',
    barcode:     '8057014597691',
    name:        'Palla pitcher red',
    modelo:      'Palla',
    familia:     'JARRAS',
    image:       'images/products/palla-rosso-1201.jpg',
    placeholder: false,
    precio_eur:  29.04,  // INTERNO
  },
  {
    id:          'mlg_312',
    sku:         'H.BRO.DIA23',
    barcode:     '8057014597776',
    name:        'Palla pitcher dark green',
    modelo:      'Palla',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  29.04,  // INTERNO
  },
  {
    id:          'mlg_313',
    sku:         'H.BRO.DIA24',
    barcode:     '8057014597707',
    name:        'Palla pitcher royal blue',
    modelo:      'Palla',
    familia:     'JARRAS',
    image:       'images/products/palla-blu-1200.jpg',
    placeholder: false,
    precio_eur:  29.04,  // INTERNO
  },
  {
    id:          'mlg_314',
    sku:         'H.BRO.DIA34',
    barcode:     '8057014597745',
    name:        'Palla pitcher red gloss',
    modelo:      'Palla',
    familia:     'JARRAS',
    image:       'images/products/palla-rosso-1201.jpg',
    placeholder: false,
    precio_eur:  29.04,  // INTERNO
  },
  {
    id:          'mlg_315',
    sku:         'H.BRO.DIA35',
    barcode:     '8057014540383',
    name:        'Palla pitcher black gloss',
    modelo:      'Palla',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  29.04,  // INTERNO
  },
  {
    id:          'mlg_316',
    sku:         'H.BRO.DIA36',
    barcode:     '8057014597721',
    name:        'Palla pitcher white gloss',
    modelo:      'Palla',
    familia:     'JARRAS',
    image:       'images/products/palla-bianco-1199.jpg',
    placeholder: false,
    precio_eur:  29.04,  // INTERNO
  },
  {
    id:          'mlg_317',
    sku:         'H.BRO.DIA37',
    barcode:     '8057014597752',
    name:        'Palla pitcher turquoise gloss',
    modelo:      'Palla',
    familia:     'JARRAS',
    image:       'images/products/palla-turchese-1202.jpg',
    placeholder: false,
    precio_eur:  29.04,  // INTERNO
  },
  {
    id:          'mlg_318',
    sku:         'H.BRO.DIA41',
    barcode:     '8057014597615',
    name:        'Palla pitcher amber',
    modelo:      'Palla',
    familia:     'JARRAS',
    image:       'images/products/palla-ambra-1198.jpg',
    placeholder: false,
    precio_eur:  29.04,  // INTERNO
  },
  {
    id:          'mlg_319',
    sku:         'H.BRO.DIA44',
    barcode:     '8057014597714',
    name:        'Palla pitcher aquamarine gloss',
    modelo:      'Palla',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  29.04,  // INTERNO
  },
  {
    id:          'mlg_320',
    sku:         'H.BRO.DIA45',
    barcode:     '8057014597646',
    name:        'Palla pitcher fluo fuxia gloss',
    modelo:      'Palla',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  29.04,  // INTERNO
  },
  {
    id:          'mlg_321',
    sku:         'H.BRO.DIA46',
    barcode:     '8057014597639',
    name:        'Palla pitcher fluo orange gloss',
    modelo:      'Palla',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  29.04,  // INTERNO
  },
  {
    id:          'mlg_322',
    sku:         'H.BRO.DIA47',
    barcode:     '8057014597653',
    name:        'Palla pitcher fluo green gloss',
    modelo:      'Palla',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  29.04,  // INTERNO
  },
  {
    id:          'mlg_323',
    sku:         'H.BRO.DIA48',
    barcode:     '8057014597684',
    name:        'Palla pitcher white opaque',
    modelo:      'Palla',
    familia:     'JARRAS',
    image:       'images/products/palla-bianco-1199.jpg',
    placeholder: false,
    precio_eur:  29.04,  // INTERNO
  },
  {
    id:          'mlg_324',
    sku:         'H.BRO.DIA49',
    barcode:     '8057014597622',
    name:        'Palla pitcher orange/green',
    modelo:      'Palla',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  29.04,  // INTERNO
  },
  {
    id:          'mlg_325',
    sku:         'H.BRO.DIA50',
    barcode:     '8057014597738',
    name:        'Palla pitcher yellow gloss',
    modelo:      'Palla',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  29.04,  // INTERNO
  },
  {
    id:          'mlg_326',
    sku:         'H.BRO.DIA51',
    barcode:     '8057014541250',
    name:        'Palla pitcher grey',
    modelo:      'Palla',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  29.04,  // INTERNO
  },
  {
    id:          'mlg_327',
    sku:         'H.BRO.DIA52',
    barcode:     '8057014545159',
    name:        'Palla pitcher pink',
    modelo:      'Palla',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  29.04,  // INTERNO
  },

  // ⚠️ Federica  (2/6 con imagen)
  {
    id:          'mlg_328',
    sku:         'H.BRO.FED1',
    barcode:     '8057014591132',
    name:        'Federica pitcher clear',
    modelo:      'Federica',
    familia:     'JARRAS',
    image:       'images/products/federica-trasparente-1221.jpg',
    placeholder: false,
    precio_eur:  30.25,  // INTERNO
  },
  {
    id:          'mlg_329',
    sku:         'H.BRO.FED10',
    barcode:     '8057014591095',
    name:        'Federica pitcher grey',
    modelo:      'Federica',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  30.25,  // INTERNO
  },
  {
    id:          'mlg_330',
    sku:         'H.BRO.FED3',
    barcode:     '8057014591156',
    name:        'Federica pitcher green',
    modelo:      'Federica',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  30.25,  // INTERNO
  },
  {
    id:          'mlg_331',
    sku:         'H.BRO.FED5',
    barcode:     '8057014591101',
    name:        'Federica pitcher ruby',
    modelo:      'Federica',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  30.25,  // INTERNO
  },
  {
    id:          'mlg_332',
    sku:         'H.BRO.FED6',
    barcode:     '8057014591118',
    name:        'Federica pitcher white gloss',
    modelo:      'Federica',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  30.25,  // INTERNO
  },
  {
    id:          'mlg_333',
    sku:         'H.BRO.FED7',
    barcode:     '8057014591071',
    name:        'Federica pitcher blue',
    modelo:      'Federica',
    familia:     'JARRAS',
    image:       'images/products/federica-blu-1218.jpg',
    placeholder: false,
    precio_eur:  30.25,  // INTERNO
  },

  // ⚠️ Gene Krupa  (2/6 con imagen)
  {
    id:          'mlg_334',
    sku:         'H.BRO.GENE1',
    barcode:     '8057014544077',
    name:        'Gene Krupa pitcher clear',
    modelo:      'Gene Krupa',
    familia:     'JARRAS',
    image:       'images/products/genekrupa-trasparente-1244.jpg',
    placeholder: false,
    precio_eur:  35.0,  // INTERNO
  },
  {
    id:          'mlg_335',
    sku:         'H.BRO.GENE2',
    barcode:     '8057014544084',
    name:        'Gene Krupa pitcher white gloss',
    modelo:      'Gene Krupa',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  35.0,  // INTERNO
  },
  {
    id:          'mlg_336',
    sku:         'H.BRO.GENE3',
    barcode:     '8057014544091',
    name:        'Gene Krupa pitcher royal blue',
    modelo:      'Gene Krupa',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  35.0,  // INTERNO
  },
  {
    id:          'mlg_337',
    sku:         'H.BRO.GENE4',
    barcode:     '8057014544107',
    name:        'Gene Krupa pitcher ruby',
    modelo:      'Gene Krupa',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  35.0,  // INTERNO
  },
  {
    id:          'mlg_338',
    sku:         'H.BRO.GENE5',
    barcode:     '8057014544114',
    name:        'Gene Krupa pitcher green',
    modelo:      'Gene Krupa',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  35.0,  // INTERNO
  },
  {
    id:          'mlg_339',
    sku:         'H.BRO.GENE6',
    barcode:     '8057014544121',
    name:        'Gene Krupa pitcher AMBER',
    modelo:      'Gene Krupa',
    familia:     'JARRAS',
    image:       'images/products/genekrupa-ambra-1239.jpg',
    placeholder: false,
    precio_eur:  35.0,  // INTERNO
  },

  // ⚠️ Halina  (4/7 con imagen)
  {
    id:          'mlg_340',
    sku:         'H.BRO.HAL1',
    barcode:     '8057014541724',
    name:        'Halina pitcher clear',
    modelo:      'Halina',
    familia:     'JARRAS',
    image:       'images/products/halina-trasparente-1227.jpg',
    placeholder: false,
    precio_eur:  32.67,  // INTERNO
  },
  {
    id:          'mlg_341',
    sku:         'H.BRO.HAL2',
    barcode:     '8057014542257',
    name:        'Halina pitcher red',
    modelo:      'Halina',
    familia:     'JARRAS',
    image:       'images/products/halina-rosso-1225.jpg',
    placeholder: false,
    precio_eur:  32.67,  // INTERNO
  },
  {
    id:          'mlg_342',
    sku:         'H.BRO.HAL3',
    barcode:     '8057014541861',
    name:        'Halina pitcher royal blue',
    modelo:      'Halina',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  32.67,  // INTERNO
  },
  {
    id:          'mlg_343',
    sku:         'H.BRO.HAL4',
    barcode:     '8057014541878',
    name:        'Halina pitcher green',
    modelo:      'Halina',
    familia:     'JARRAS',
    image:       'images/products/halina-verde-1228.jpg',
    placeholder: false,
    precio_eur:  32.67,  // INTERNO
  },
  {
    id:          'mlg_344',
    sku:         'H.BRO.HAL5',
    barcode:     '8057014541731',
    name:        'Halina pitcher turquoise',
    modelo:      'Halina',
    familia:     'JARRAS',
    image:       'images/products/halina-turchese-1226.jpg',
    placeholder: false,
    precio_eur:  32.67,  // INTERNO
  },
  {
    id:          'mlg_345',
    sku:         'H.BRO.HAL6',
    barcode:     '8057014542264',
    name:        'Halina pitcher gold',
    modelo:      'Halina',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  42.35,  // INTERNO
  },
  {
    id:          'mlg_346',
    sku:         'H.BRO.HAL7',
    barcode:     '8057014541885',
    name:        'Halina pitcher grey',
    modelo:      'Halina',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  32.67,  // INTERNO
  },

  // 🔲 Maria  (0/2 con imagen)
  {
    id:          'mlg_347',
    sku:         'H.BRO.MAR3',
    barcode:     '8057014591224',
    name:        'Maria pitcher purple',
    modelo:      'Maria',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  18.15,  // INTERNO
  },
  {
    id:          'mlg_348',
    sku:         'H.BRO.MAR6',
    barcode:     '8057014591170',
    name:        'Maria pitcher white gloss',
    modelo:      'Maria',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  18.15,  // INTERNO
  },

  // ⚠️ Pallina  (8/13 con imagen)
  {
    id:          'mlg_349',
    sku:         'H.BRO.PAL1',
    barcode:     '8057014591361',
    name:        'Pallina pitcher clear',
    modelo:      'Pallina',
    familia:     'JARRAS',
    image:       'images/products/pallina-trasparente-1209.jpg',
    placeholder: false,
    precio_eur:  26.62,  // INTERNO
  },
  {
    id:          'mlg_350',
    sku:         'H.BRO.PAL10',
    barcode:     '8057014598902',
    name:        'Pallina pitcher white/handle fluorescent',
    modelo:      'Pallina',
    familia:     'JARRAS',
    image:       'images/products/pallina-bianco-1205.jpg',
    placeholder: false,
    precio_eur:  26.62,  // INTERNO
  },
  {
    id:          'mlg_351',
    sku:         'H.BRO.PAL11',
    barcode:     '8057014541311',
    name:        'Pallina pitcher grey',
    modelo:      'Pallina',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  26.62,  // INTERNO
  },
  {
    id:          'mlg_352',
    sku:         'H.BRO.PAL12',
    barcode:     '8057014541700',
    name:        'Pallina pitcher yellow/handle red',
    modelo:      'Pallina',
    familia:     'JARRAS',
    image:       'images/products/pallina-rosso-1207.jpg',
    placeholder: false,
    precio_eur:  26.62,  // INTERNO
  },
  {
    id:          'mlg_353',
    sku:         'H.BRO.PAL13',
    barcode:     '8057014544244',
    name:        'Pallina pitcher olive green gloss',
    modelo:      'Pallina',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  26.62,  // INTERNO
  },
  {
    id:          'mlg_354',
    sku:         'H.BRO.PAL2',
    barcode:     '8057014591347',
    name:        'Pallina pitcher white gloss',
    modelo:      'Pallina',
    familia:     'JARRAS',
    image:       'images/products/pallina-bianco-1205.jpg',
    placeholder: false,
    precio_eur:  26.62,  // INTERNO
  },
  {
    id:          'mlg_355',
    sku:         'H.BRO.PAL3',
    barcode:     '8057014591316',
    name:        'Pallina pitcher opaque pink',
    modelo:      'Pallina',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  26.62,  // INTERNO
  },
  {
    id:          'mlg_356',
    sku:         'H.BRO.PAL4',
    barcode:     '8057014591354',
    name:        'Pallina pitcher yellow gloss',
    modelo:      'Pallina',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  26.62,  // INTERNO
  },
  {
    id:          'mlg_357',
    sku:         'H.BRO.PAL5',
    barcode:     '8057014591309',
    name:        'Pallina pitcher blue/handle green',
    modelo:      'Pallina',
    familia:     'JARRAS',
    image:       'images/products/pallina-blu-1206.jpg',
    placeholder: false,
    precio_eur:  26.62,  // INTERNO
  },
  {
    id:          'mlg_358',
    sku:         'H.BRO.PAL6',
    barcode:     '8057014591330',
    name:        'Pallina pitcher ruby/handle green',
    modelo:      'Pallina',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  26.62,  // INTERNO
  },
  {
    id:          'mlg_359',
    sku:         'H.BRO.PAL7',
    barcode:     '8057014591378',
    name:        'Pallina pitcher green/handle blue',
    modelo:      'Pallina',
    familia:     'JARRAS',
    image:       'images/products/pallina-blu-1206.jpg',
    placeholder: false,
    precio_eur:  26.62,  // INTERNO
  },
  {
    id:          'mlg_360',
    sku:         'H.BRO.PAL8',
    barcode:     '8057014591323',
    name:        'Pallina pitcher red',
    modelo:      'Pallina',
    familia:     'JARRAS',
    image:       'images/products/pallina-rosso-1207.jpg',
    placeholder: false,
    precio_eur:  26.62,  // INTERNO
  },
  {
    id:          'mlg_361',
    sku:         'H.BRO.PAL9',
    barcode:     '8057014598391',
    name:        'Pallina pitcher turquoise/handle ruby',
    modelo:      'Pallina',
    familia:     'JARRAS',
    image:       'images/products/pallina-turchese-1208.jpg',
    placeholder: false,
    precio_eur:  26.62,  // INTERNO
  },

  // ⚠️ Plutone  (3/11 con imagen)
  {
    id:          'mlg_362',
    sku:         'H.BRO.PLU1',
    barcode:     '8057014599626',
    name:        'Plutone pitcher clear',
    modelo:      'Plutone',
    familia:     'JARRAS',
    image:       'images/products/plutone-trasparente-1215.jpg',
    placeholder: false,
    precio_eur:  24.2,  // INTERNO
  },
  {
    id:          'mlg_363',
    sku:         'H.BRO.PLU13',
    barcode:     '8057014599763',
    name:        'Plutone pitcher black gloss',
    modelo:      'Plutone',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  24.2,  // INTERNO
  },
  {
    id:          'mlg_364',
    sku:         'H.BRO.PLU14',
    barcode:     '8057014541328',
    name:        'Plutone pitcher grey',
    modelo:      'Plutone',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  24.2,  // INTERNO
  },
  {
    id:          'mlg_365',
    sku:         'H.BRO.PLU2',
    barcode:     '8057014599619',
    name:        'Plutone pitcher ruby/handle green',
    modelo:      'Plutone',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  24.2,  // INTERNO
  },
  {
    id:          'mlg_366',
    sku:         'H.BRO.PLU3',
    barcode:     '8057014599602',
    name:        'Plutone pitcher royal blue',
    modelo:      'Plutone',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  24.2,  // INTERNO
  },
  {
    id:          'mlg_367',
    sku:         'H.BRO.PLU4',
    barcode:     '8057014599633',
    name:        'Plutone pitcher green',
    modelo:      'Plutone',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  24.2,  // INTERNO
  },
  {
    id:          'mlg_368',
    sku:         'H.BRO.PLU5',
    barcode:     '8057014541717',
    name:        'Plutone pitcher yellow gloss/handle red',
    modelo:      'Plutone',
    familia:     'JARRAS',
    image:       'images/products/plutone-rosso-1213.jpg',
    placeholder: false,
    precio_eur:  24.2,  // INTERNO
  },
  {
    id:          'mlg_369',
    sku:         'H.BRO.PLU6',
    barcode:     '8057014599770',
    name:        'Plutone pitcher white gloss',
    modelo:      'Plutone',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  24.2,  // INTERNO
  },
  {
    id:          'mlg_370',
    sku:         'H.BRO.PLU7',
    barcode:     '8057014599640',
    name:        'Plutone pitcher red',
    modelo:      'Plutone',
    familia:     'JARRAS',
    image:       'images/products/plutone-rosso-1213.jpg',
    placeholder: false,
    precio_eur:  24.2,  // INTERNO
  },
  {
    id:          'mlg_371',
    sku:         'H.BRO.PLU8',
    barcode:     '8057014599596',
    name:        'Plutone pitcher gold',
    modelo:      'Plutone',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  26.62,  // INTERNO
  },
  {
    id:          'mlg_372',
    sku:         'H.BRO.PLU9',
    barcode:     '8057014599787',
    name:        'Plutone pitcher white frost',
    modelo:      'Plutone',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  24.2,  // INTERNO
  },

  // ⚠️ Roberta  (2/7 con imagen)
  {
    id:          'mlg_373',
    sku:         'H.BRO.ROB1',
    barcode:     '8057014591460',
    name:        'Roberta pitcher clear',
    modelo:      'Roberta',
    familia:     'JARRAS',
    image:       'images/products/roberta-trasparente-1248.jpg',
    placeholder: false,
    precio_eur:  33.88,  // INTERNO
  },
  {
    id:          'mlg_374',
    sku:         'H.BRO.ROB11',
    barcode:     '8057014591446',
    name:        'Roberta pitcher turquoise',
    modelo:      'Roberta',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  33.88,  // INTERNO
  },
  {
    id:          'mlg_375',
    sku:         'H.BRO.ROB12',
    barcode:     '8057014598681',
    name:        'Roberta pitcher gold',
    modelo:      'Roberta',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  36.3,  // INTERNO
  },
  {
    id:          'mlg_376',
    sku:         'H.BRO.ROB2',
    barcode:     '8057014591408',
    name:        'Roberta pitcher white gloss',
    modelo:      'Roberta',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  33.88,  // INTERNO
  },
  {
    id:          'mlg_377',
    sku:         'H.BRO.ROB3',
    barcode:     '8057014591392',
    name:        'Roberta Pitcher ruby',
    modelo:      'Roberta',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  33.88,  // INTERNO
  },
  {
    id:          'mlg_378',
    sku:         'H.BRO.ROB4',
    barcode:     '8057014591477',
    name:        'Roberta pitcher green',
    modelo:      'Roberta',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  33.88,  // INTERNO
  },
  {
    id:          'mlg_379',
    sku:         'H.BRO.ROB6',
    barcode:     '8057014591385',
    name:        'Roberta pitcher blue',
    modelo:      'Roberta',
    familia:     'JARRAS',
    image:       'images/products/roberta-blu-1247.jpg',
    placeholder: false,
    precio_eur:  33.88,  // INTERNO
  },

  // ⚠️ Sister Rosetta  (4/10 con imagen)
  {
    id:          'mlg_380',
    sku:         'H.BRO.SIS1',
    barcode:     '8057014543469',
    name:        'Sister Rosetta pitcher white gloss',
    modelo:      'Sister Rosetta',
    familia:     'JARRAS',
    image:       'images/products/sister-rosetta-white-gloss-1229.jpg',
    placeholder: false,
    precio_eur:  47.0,  // INTERNO
  },
  {
    id:          'mlg_381',
    sku:         'H.BRO.SIS10',
    barcode:     '8057014543926',
    name:        'Sister Rosetta pitcher fuxia fluo',
    modelo:      'Sister Rosetta',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  47.0,  // INTERNO
  },
  {
    id:          'mlg_382',
    sku:         'H.BRO.SIS2',
    barcode:     '8057014543476',
    name:        'Sister Rosetta pitcher green',
    modelo:      'Sister Rosetta',
    familia:     'JARRAS',
    image:       'images/products/sister-rosetta-green-1232.jpg',
    placeholder: false,
    precio_eur:  47.0,  // INTERNO
  },
  {
    id:          'mlg_383',
    sku:         'H.BRO.SIS3',
    barcode:     '8057014543483',
    name:        'Sister Rosetta pitcher clear',
    modelo:      'Sister Rosetta',
    familia:     'JARRAS',
    image:       'images/products/sister-rosetta-clear-1230.jpg',
    placeholder: false,
    precio_eur:  47.0,  // INTERNO
  },
  {
    id:          'mlg_384',
    sku:         'H.BRO.SIS4',
    barcode:     '8057014543490',
    name:        'Sister Rosetta pitcher ruby',
    modelo:      'Sister Rosetta',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  47.0,  // INTERNO
  },
  {
    id:          'mlg_385',
    sku:         'H.BRO.SIS5',
    barcode:     '8057014543506',
    name:        'Sister Rosetta pitcher amber',
    modelo:      'Sister Rosetta',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  47.0,  // INTERNO
  },
  {
    id:          'mlg_386',
    sku:         'H.BRO.SIS6',
    barcode:     '8057014543513',
    name:        'Sister Rosetta pitcher blue',
    modelo:      'Sister Rosetta',
    familia:     'JARRAS',
    image:       'images/products/sister-rosetta-blue-1233.jpg',
    placeholder: false,
    precio_eur:  47.0,  // INTERNO
  },
  {
    id:          'mlg_387',
    sku:         'H.BRO.SIS7',
    barcode:     '8057014543933',
    name:        'Sister Rosetta pitcher yellow gloss',
    modelo:      'Sister Rosetta',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  47.0,  // INTERNO
  },
  {
    id:          'mlg_388',
    sku:         'H.BRO.SIS8',
    barcode:     '8057014543940',
    name:        'Sister Rosetta pitcher turquoise glaze',
    modelo:      'Sister Rosetta',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  47.0,  // INTERNO
  },
  {
    id:          'mlg_389',
    sku:         'H.BRO.SIS9',
    barcode:     '8057014543957',
    name:        'Sister Rosetta pitcher orange fluo',
    modelo:      'Sister Rosetta',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  47.0,  // INTERNO
  },

  // ⚠️ Imperial  (3/5 con imagen)
  {
    id:          'mlg_390',
    sku:         'H.BRO.WIN1',
    barcode:     '8057014542554',
    name:        'Imperial pitcher clear',
    modelo:      'Imperial',
    familia:     'JARRAS',
    image:       'images/products/imperial-trasparente-1238.jpg',
    placeholder: false,
    precio_eur:  55.0,  // INTERNO
  },
  {
    id:          'mlg_391',
    sku:         'H.BRO.WIN2',
    barcode:     '8057014542578',
    name:        'Imperial pitcher white gloss',
    modelo:      'Imperial',
    familia:     'JARRAS',
    image:       'images/products/imperial-bianco-1235.jpg',
    placeholder: false,
    precio_eur:  55.0,  // INTERNO
  },
  {
    id:          'mlg_392',
    sku:         'H.BRO.WIN3',
    barcode:     '8057014542561',
    name:        'Imperial pitcher green',
    modelo:      'Imperial',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  55.0,  // INTERNO
  },
  {
    id:          'mlg_393',
    sku:         'H.BRO.WIN4',
    barcode:     '8057014542547',
    name:        'Imperial pitcher blue',
    modelo:      'Imperial',
    familia:     'JARRAS',
    image:       'images/products/imperial-blu-1236.jpg',
    placeholder: false,
    precio_eur:  55.0,  // INTERNO
  },
  {
    id:          'mlg_394',
    sku:         'H.BRO.WIN5',
    barcode:     '8057014542752',
    name:        'Imperial pitcher gold',
    modelo:      'Imperial',
    familia:     'JARRAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  55.0,  // INTERNO
  },

  // ═══════════════════════════════════════════════════════════════
  // BOTELLAS & DECANTADORES
  // 28 SKUs total · 17 con imagen · 11 pendientes
  // ═══════════════════════════════════════════════════════════════

  // ⚠️ Aquarama  (3/4 con imagen)
  {
    id:          'mlg_279',
    sku:         'H.BOT.AQU1',
    barcode:     '8057014540390',
    name:        'Aquarama bottle ruby',
    modelo:      'Aquarama',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/aquarama-ruby-1249.jpg',
    placeholder: false,
    precio_eur:  31.46,  // INTERNO
  },
  {
    id:          'mlg_280',
    sku:         'H.BOT.AQU2',
    barcode:     '8057014540406',
    name:        'Aquarama bottle green',
    modelo:      'Aquarama',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  31.46,  // INTERNO
  },
  {
    id:          'mlg_281',
    sku:         'H.BOT.AQU3',
    barcode:     '8057014540765',
    name:        'Aquarama bottle royal blue',
    modelo:      'Aquarama',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/aquarama-royal-blue-1250.jpg',
    placeholder: false,
    precio_eur:  31.46,  // INTERNO
  },
  {
    id:          'mlg_282',
    sku:         'H.BOT.AQU4',
    barcode:     '8057014540413',
    name:        'Aquarama bottle clear',
    modelo:      'Aquarama',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/aquarama-trasparente-1252.jpg',
    placeholder: false,
    precio_eur:  31.46,  // INTERNO
  },

  // ⚠️ Bona  (6/12 con imagen)
  {
    id:          'mlg_283',
    sku:         'H.BOT.BONA4',
    barcode:     '8057014590968',
    name:        'Bona bottle blue',
    modelo:      'Bona',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/bona-blu-1263.jpg',
    placeholder: false,
    precio_eur:  26.62,  // INTERNO
  },
  {
    id:          'mlg_284',
    sku:         'H.BOT.BONA16',
    barcode:     '8057014544138',
    name:        'Bona bottle frost',
    modelo:      'Bona',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  28.5,  // INTERNO
  },
  {
    id:          'mlg_285',
    sku:         'H.BOT.BONA3',
    barcode:     '8057014590975',
    name:        'Bona bottle ruby',
    modelo:      'Bona',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  26.62,  // INTERNO
  },
  {
    id:          'mlg_286',
    sku:         'H.BOT.BONA1',
    barcode:     '8057014590982',
    name:        'Bona bottle clear',
    modelo:      'Bona',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/bona-trasparente-1266.jpg',
    placeholder: false,
    precio_eur:  26.62,  // INTERNO
  },
  {
    id:          'mlg_287',
    sku:         'H.BOT.BONA6',
    barcode:     '8057014590999',
    name:        'Bona bottle turquoise',
    modelo:      'Bona',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/bona-turchese-1265.jpg',
    placeholder: false,
    precio_eur:  26.62,  // INTERNO
  },
  {
    id:          'mlg_288',
    sku:         'H.BOT.BONA2',
    barcode:     '8057014591002',
    name:        'Bona bottle green',
    modelo:      'Bona',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  26.62,  // INTERNO
  },
  {
    id:          'mlg_289',
    sku:         'H.BOT.BONA14',
    barcode:     '8057014591040',
    name:        'Bona bottle oil clear',
    modelo:      'Bona',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/bona-trasparente-1266.jpg',
    placeholder: false,
    precio_eur:  16.94,  // INTERNO
  },
  {
    id:          'mlg_290',
    sku:         'H.BOT.BONA12',
    barcode:     '8057014591057',
    name:        'Bona bottle oil green',
    modelo:      'Bona',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  16.94,  // INTERNO
  },
  {
    id:          'mlg_291',
    sku:         'H.BOT.BONA10',
    barcode:     '8057014590920',
    name:        'Bona night bottle blue',
    modelo:      'Bona',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/bona-notte-blu-1269.jpg',
    placeholder: false,
    precio_eur:  16.94,  // INTERNO
  },
  {
    id:          'mlg_292',
    sku:         'H.BOT.BONA8',
    barcode:     '8057014590937',
    name:        'Bona night bottle ruby',
    modelo:      'Bona',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  16.94,  // INTERNO
  },
  {
    id:          'mlg_293',
    sku:         'H.BOT.BONA9',
    barcode:     '8057014590944',
    name:        'Bona night bottle clear',
    modelo:      'Bona',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/bona-notte-trasparente-1270.jpg',
    placeholder: false,
    precio_eur:  16.94,  // INTERNO
  },
  {
    id:          'mlg_294',
    sku:         'H.BOT.BONA7',
    barcode:     '8057014590951',
    name:        'Bona night bottle green',
    modelo:      'Bona',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  16.94,  // INTERNO
  },

  // ✅ Manfredo  (4/4 con imagen)
  {
    id:          'mlg_295',
    sku:         'H.BOT.MAN1',
    barcode:     '8057014544411',
    name:        'Manfredo bottle Amber',
    modelo:      'Manfredo',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/manfredo-ambra-1253.jpg',
    placeholder: false,
    precio_eur:  45.0,  // INTERNO
  },
  {
    id:          'mlg_296',
    sku:         'H.BOT.MAN2',
    barcode:     '8057014544428',
    name:        'Manfredo bottle Clear',
    modelo:      'Manfredo',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/manfredo-rosso-1255.jpg',
    placeholder: false,
    precio_eur:  45.0,  // INTERNO
  },
  {
    id:          'mlg_297',
    sku:         'H.BOT.MAN4',
    barcode:     '8057014544435',
    name:        'Manfredo bottle Grey',
    modelo:      'Manfredo',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/manfredo-rosso-1255.jpg',
    placeholder: false,
    precio_eur:  45.0,  // INTERNO
  },
  {
    id:          'mlg_298',
    sku:         'H.BOT.MAN6',
    barcode:     '8057014544442',
    name:        'Manfredo bottle Green',
    modelo:      'Manfredo',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/manfredo-rosso-1255.jpg',
    placeholder: false,
    precio_eur:  45.0,  // INTERNO
  },

  // ⚠️ Orsetta  (2/4 con imagen)
  {
    id:          'mlg_299',
    sku:         'H.BOT.ORS1',
    barcode:     '8057014544275',
    name:        'Orsetta bottle white gloss',
    modelo:      'Orsetta',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/orsetta-white-gloss-1257.jpg',
    placeholder: false,
    precio_eur:  45.0,  // INTERNO
  },
  {
    id:          'mlg_300',
    sku:         'H.BOT.ORS2',
    barcode:     '8057014544282',
    name:        'Orsetta bottle royal blue',
    modelo:      'Orsetta',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  45.0,  // INTERNO
  },
  {
    id:          'mlg_301',
    sku:         'H.BOT.ORS3',
    barcode:     '8057014544299',
    name:        'Orsetta bottle green',
    modelo:      'Orsetta',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  45.0,  // INTERNO
  },
  {
    id:          'mlg_302',
    sku:         'H.BOT.ORS4',
    barcode:     '8057014544305',
    name:        'Orsetta bottle clear',
    modelo:      'Orsetta',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/orsetta-trasparente-1260.jpg',
    placeholder: false,
    precio_eur:  45.0,  // INTERNO
  },

  // ⚠️ Susy / Fontana  (2/4 con imagen)
  {
    id:          'mlg_303',
    sku:         'H.BOT2',
    barcode:     '8057014591026',
    name:        'Fontana bottle clear',
    modelo:      'Susy / Fontana',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  13.31,  // INTERNO
  },
  {
    id:          'mlg_304',
    sku:         'H.BOT5',
    barcode:     '8057014596304',
    name:        'Susy cruets clear',
    modelo:      'Susy / Fontana',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/susy-trasparente-1277.jpg',
    placeholder: false,
    precio_eur:  40.66,  // INTERNO
  },
  {
    id:          'mlg_305',
    sku:         'H.BOT7',
    barcode:     '8057014596281',
    name:        'Susy cruets red',
    modelo:      'Susy / Fontana',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/susy-rosso-1275.jpg',
    placeholder: false,
    precio_eur:  40.66,  // INTERNO
  },
  {
    id:          'mlg_306',
    sku:         'H.BOT9',
    barcode:     '8057014591019',
    name:        'Susy bottle acrylic for cruets',
    modelo:      'Susy / Fontana',
    familia:     'BOTELLAS & DECANTADORES',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  7.5,  // INTERNO
  },

  // ═══════════════════════════════════════════════════════════════
  // VAJILLA
  // 117 SKUs total · 31 con imagen · 86 pendientes
  // ═══════════════════════════════════════════════════════════════

  // 🔲 Aimone  (0/14 con imagen)
  {
    id:          'mlg_534',
    sku:         'H.PIA.AIM1',
    barcode:     '8057014540048',
    name:        'Aimone soup plate orange',
    modelo:      'Aimone',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_535',
    sku:         'H.PIA.AIM2',
    barcode:     '8057014540055',
    name:        'Aimone soup plate blue',
    modelo:      'Aimone',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_536',
    sku:         'H.PIA.AIM15',
    barcode:     '8057014541656',
    name:        'Aimone soup plate yellow',
    modelo:      'Aimone',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_537',
    sku:         'H.PIA.AIM3',
    barcode:     '8057014540062',
    name:        'Aimone soup plate turquoise',
    modelo:      'Aimone',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_538',
    sku:         'H.PIA.AIM4',
    barcode:     '8057014540079',
    name:        'Aimone small plate orange',
    modelo:      'Aimone',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_539',
    sku:         'H.PIA.AIM5',
    barcode:     '8057014540086',
    name:        'Aimone small plate blue',
    modelo:      'Aimone',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_540',
    sku:         'H.PIA.AIM13',
    barcode:     '8057014541649',
    name:        'Aimone small plate yellow',
    modelo:      'Aimone',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_541',
    sku:         'H.PIA.AIM6',
    barcode:     '8057014540093',
    name:        'Aimone small plate turquoise',
    modelo:      'Aimone',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_542',
    sku:         'H.PIA.AIM7',
    barcode:     '8057014540109',
    name:        'Aimone medium plate orange',
    modelo:      'Aimone',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.65,  // INTERNO
  },
  {
    id:          'mlg_543',
    sku:         'H.PIA.AIM8',
    barcode:     '8057014540116',
    name:        'Aimone medium plate blue',
    modelo:      'Aimone',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.65,  // INTERNO
  },
  {
    id:          'mlg_544',
    sku:         'H.PIA.AIM14',
    barcode:     '8057014541663',
    name:        'Aimone medium plate yellow',
    modelo:      'Aimone',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.65,  // INTERNO
  },
  {
    id:          'mlg_545',
    sku:         'H.PIA.AIM9',
    barcode:     '8057014540123',
    name:        'Aimone medium plate turquoise',
    modelo:      'Aimone',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.65,  // INTERNO
  },
  {
    id:          'mlg_546',
    sku:         'H.PIA.AIM10',
    barcode:     '8057014541670',
    name:        'Aimone tray yellow',
    modelo:      'Aimone',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  41.14,  // INTERNO
  },
  {
    id:          'mlg_547',
    sku:         'H.PIA.AIM12',
    barcode:     '8057014541687',
    name:        'Aimone tray turquoise',
    modelo:      'Aimone',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  41.14,  // INTERNO
  },

  // 🔲 Corallo  (0/5 con imagen)
  {
    id:          'mlg_548',
    sku:         'H.PIA.CORA2',
    barcode:     '8057014540147',
    name:        'Corallo soup plate blue',
    modelo:      'Corallo',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_549',
    sku:         'H.PIA.CORA4',
    barcode:     '8057014540154',
    name:        'Corallo small plate red',
    modelo:      'Corallo',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_550',
    sku:         'H.PIA.CORA5',
    barcode:     '8057014540161',
    name:        'Corallo small plate blue',
    modelo:      'Corallo',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_551',
    sku:         'H.PIA.CORA7',
    barcode:     '8057014540178',
    name:        'Corallo medium plate red',
    modelo:      'Corallo',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.65,  // INTERNO
  },
  {
    id:          'mlg_552',
    sku:         'H.PIA.CORA8',
    barcode:     '8057014540185',
    name:        'Corallo medium plate blue',
    modelo:      'Corallo',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.65,  // INTERNO
  },

  // ✅ Eva  (13/13 con imagen)
  {
    id:          'mlg_553',
    sku:         'H.PIA.EVA5',
    barcode:     '8057014544589',
    name:        'Eva soup plate Ivory',
    modelo:      'Eva',
    familia:     'VAJILLA',
    image:       'images/products/evaavo-medio-2513.jpg',
    placeholder: false,
    precio_eur:  10.5,  // INTERNO
  },
  {
    id:          'mlg_554',
    sku:         'H.PIA.EVA3',
    barcode:     '8057014544565',
    name:        'Eva soup plate Royal Blue',
    modelo:      'Eva',
    familia:     'VAJILLA',
    image:       'images/products/evablu-medio-2507.jpg',
    placeholder: false,
    precio_eur:  10.5,  // INTERNO
  },
  {
    id:          'mlg_555',
    sku:         'H.PIA.EVA4',
    barcode:     '8057014544572',
    name:        'Eva soup plate Grey',
    modelo:      'Eva',
    familia:     'VAJILLA',
    image:       'images/products/evagrigio-medio-2504.jpg',
    placeholder: false,
    precio_eur:  10.5,  // INTERNO
  },
  {
    id:          'mlg_556',
    sku:         'H.PIA.EVA2',
    barcode:     '8057014544558',
    name:        'Eva soup plate Red',
    modelo:      'Eva',
    familia:     'VAJILLA',
    image:       'images/products/evarosso-medio-2510.jpg',
    placeholder: false,
    precio_eur:  10.5,  // INTERNO
  },
  {
    id:          'mlg_557',
    sku:         'H.PIA.EVA9',
    barcode:     '8057014544626',
    name:        'Eva small plate Ivory',
    modelo:      'Eva',
    familia:     'VAJILLA',
    image:       'images/products/evaavo-medio-2513.jpg',
    placeholder: false,
    precio_eur:  10.5,  // INTERNO
  },
  {
    id:          'mlg_558',
    sku:         'H.PIA.EVA8',
    barcode:     '8057014544619',
    name:        'Eva small plate Grey',
    modelo:      'Eva',
    familia:     'VAJILLA',
    image:       'images/products/evagrigio-medio-2504.jpg',
    placeholder: false,
    precio_eur:  10.5,  // INTERNO
  },
  {
    id:          'mlg_559',
    sku:         'H.PIA.EVA6',
    barcode:     '8057014544596',
    name:        'Eva small plate Red',
    modelo:      'Eva',
    familia:     'VAJILLA',
    image:       'images/products/evarosso-medio-2510.jpg',
    placeholder: false,
    precio_eur:  10.5,  // INTERNO
  },
  {
    id:          'mlg_560',
    sku:         'H.PIA.EVA7',
    barcode:     '8057014544602',
    name:        'Eva small plate Royal Blue',
    modelo:      'Eva',
    familia:     'VAJILLA',
    image:       'images/products/evablu-medio-2507.jpg',
    placeholder: false,
    precio_eur:  10.5,  // INTERNO
  },
  {
    id:          'mlg_561',
    sku:         'H.PIA.EVA13',
    barcode:     '8057014544541',
    name:        'Eva medium plate Ivory',
    modelo:      'Eva',
    familia:     'VAJILLA',
    image:       'images/products/evaavo-medio-2513.jpg',
    placeholder: false,
    precio_eur:  13.0,  // INTERNO
  },
  {
    id:          'mlg_562',
    sku:         'H.PIA.EVA12',
    barcode:     '8057014544534',
    name:        'Eva medium plate Grey',
    modelo:      'Eva',
    familia:     'VAJILLA',
    image:       'images/products/evagrigio-medio-2504.jpg',
    placeholder: false,
    precio_eur:  13.0,  // INTERNO
  },
  {
    id:          'mlg_563',
    sku:         'H.PIA.EVA10',
    barcode:     '8057014544510',
    name:        'Eva medium plate Red',
    modelo:      'Eva',
    familia:     'VAJILLA',
    image:       'images/products/evarosso-medio-2510.jpg',
    placeholder: false,
    precio_eur:  13.0,  // INTERNO
  },
  {
    id:          'mlg_564',
    sku:         'H.PIA.EVA11',
    barcode:     '8057014544527',
    name:        'Eva medium plate Royal Blue',
    modelo:      'Eva',
    familia:     'VAJILLA',
    image:       'images/products/evablu-medio-2507.jpg',
    placeholder: false,
    precio_eur:  13.0,  // INTERNO
  },
  {
    id:          'mlg_565',
    sku:         'H.PIA.EVA1',
    barcode:     '8057014545104',
    name:        'Eva tray ivory/grey',
    modelo:      'Eva',
    familia:     'VAJILLA',
    image:       'images/products/evaavo-medio-2513.jpg',
    placeholder: false,
    precio_eur:  45.0,  // INTERNO
  },

  // 🔲 Cat Bowl  (0/9 con imagen)
  {
    id:          'mlg_566',
    sku:         'H.PIA.GAT20',
    barcode:     '8057014545449',
    name:        'Cat bowl plate ski',
    modelo:      'Cat Bowl',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_567',
    sku:         'H.PIA.GAT14',
    barcode:     '8057014545401',
    name:        'Cat bowl plate train',
    modelo:      'Cat Bowl',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_568',
    sku:         'H.PIA.GAT18',
    barcode:     '8057014545425',
    name:        'Cat bowl plate wasp',
    modelo:      'Cat Bowl',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_569',
    sku:         'H.PIA.GAT19',
    barcode:     '8057014545432',
    name:        'Cat small plate ski',
    modelo:      'Cat Bowl',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_570',
    sku:         'H.PIA.GAT13',
    barcode:     '8057014545395',
    name:        'Cat small plate train',
    modelo:      'Cat Bowl',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_571',
    sku:         'H.PIA.GAT17',
    barcode:     '8057014545418',
    name:        'Cat small plate wasp',
    modelo:      'Cat Bowl',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_572',
    sku:         'H.PIA.GAT6',
    barcode:     '8057014545470',
    name:        'Cat medium plate ski',
    modelo:      'Cat Bowl',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.65,  // INTERNO
  },
  {
    id:          'mlg_573',
    sku:         'H.PIA.GAT3',
    barcode:     '8057014545456',
    name:        'Cat medium plate train',
    modelo:      'Cat Bowl',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.65,  // INTERNO
  },
  {
    id:          'mlg_574',
    sku:         'H.PIA.GAT5',
    barcode:     '8057014545463',
    name:        'Cat medium plate wasp',
    modelo:      'Cat Bowl',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.65,  // INTERNO
  },

  // 🔲 Kenzia  (0/3 con imagen)
  {
    id:          'mlg_575',
    sku:         'H.PIA.KEN1',
    barcode:     '8057014541205',
    name:        'Kenzia soup plate',
    modelo:      'Kenzia',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  8.23,  // INTERNO
  },
  {
    id:          'mlg_576',
    sku:         'H.PIA.KEN2',
    barcode:     '8057014541212',
    name:        'Kenzia small plate',
    modelo:      'Kenzia',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  8.86,  // INTERNO
  },
  {
    id:          'mlg_577',
    sku:         'H.PIA.KEN3',
    barcode:     '8057014541229',
    name:        'Kenzia medium plate',
    modelo:      'Kenzia',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.02,  // INTERNO
  },

  // 🔲 Lapislazzulo  (0/4 con imagen)
  {
    id:          'mlg_578',
    sku:         'H.PIA.LAP1',
    barcode:     '8057014543278',
    name:        'Lapislazzulo soup plate',
    modelo:      'Lapislazzulo',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_579',
    sku:         'H.PIA.LAP2',
    barcode:     '8057014543285',
    name:        'Lapislazzulo small plate',
    modelo:      'Lapislazzulo',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_580',
    sku:         'H.PIA.LAP3',
    barcode:     '8057014543292',
    name:        'Lapislazzulo medium plate',
    modelo:      'Lapislazzulo',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.65,  // INTERNO
  },
  {
    id:          'mlg_581',
    sku:         'H.PIA.LAP4',
    barcode:     '8057014543308',
    name:        'Lapislazzulo underplate',
    modelo:      'Lapislazzulo',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  21.78,  // INTERNO
  },

  // ⚠️ Marinella  (6/15 con imagen)
  {
    id:          'mlg_582',
    sku:         'H.PIA.MAR2',
    barcode:     '8057014544640',
    name:        'Marinella soup plate Orange',
    modelo:      'Marinella',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_583',
    sku:         'H.PIA.MAR1',
    barcode:     '8057014544633',
    name:        'Marinella soup plate Ivory',
    modelo:      'Marinella',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_584',
    sku:         'H.PIA.MAR5',
    barcode:     '8057014544671',
    name:        'Marinella soup plate Red',
    modelo:      'Marinella',
    familia:     'VAJILLA',
    image:       'images/products/marinella-piatto-fondo-rosso-1301.jpg',
    placeholder: false,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_585',
    sku:         'H.PIA.MAR3',
    barcode:     '8057014544657',
    name:        'Marinella soup plate Turquoise',
    modelo:      'Marinella',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_586',
    sku:         'H.PIA.MAR4',
    barcode:     '8057014544664',
    name:        'Marinella soup plate Green',
    modelo:      'Marinella',
    familia:     'VAJILLA',
    image:       'images/products/marinella-piatto-fondo-verde-1302.jpg',
    placeholder: false,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_587',
    sku:         'H.PIA.MAR7',
    barcode:     '8057014544701',
    name:        'Marinella small plate Orange',
    modelo:      'Marinella',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_588',
    sku:         'H.PIA.MAR6',
    barcode:     '8057014544695',
    name:        'Marinella small plate Ivory',
    modelo:      'Marinella',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_589',
    sku:         'H.PIA.MAR10',
    barcode:     '8057014544688',
    name:        'Marinella small plate Red',
    modelo:      'Marinella',
    familia:     'VAJILLA',
    image:       'images/products/marinella-piatto-piano-rosso-1296.jpg',
    placeholder: false,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_590',
    sku:         'H.PIA.MAR8',
    barcode:     '8057014544718',
    name:        'Marinella small plate Turquoise',
    modelo:      'Marinella',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_591',
    sku:         'H.PIA.MAR9',
    barcode:     '8057014544725',
    name:        'Marinella small plate Green',
    modelo:      'Marinella',
    familia:     'VAJILLA',
    image:       'images/products/marinella-piatto-piano-verde-1297.jpg',
    placeholder: false,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_592',
    sku:         'H.PIA.MAR12',
    barcode:     '8057014544749',
    name:        'Marinella medium plate Orange',
    modelo:      'Marinella',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.65,  // INTERNO
  },
  {
    id:          'mlg_593',
    sku:         'H.PIA.MAR11',
    barcode:     '8057014544732',
    name:        'Marinella medium plate Ivory',
    modelo:      'Marinella',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.65,  // INTERNO
  },
  {
    id:          'mlg_594',
    sku:         'H.PIA.MAR15',
    barcode:     '8057014544770',
    name:        'Marinella medium plate Red',
    modelo:      'Marinella',
    familia:     'VAJILLA',
    image:       'images/products/marinella-piatto-piano-rosso-1296.jpg',
    placeholder: false,
    precio_eur:  12.65,  // INTERNO
  },
  {
    id:          'mlg_595',
    sku:         'H.PIA.MAR13',
    barcode:     '8057014544756',
    name:        'Marinella medium plate Turquoise',
    modelo:      'Marinella',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.65,  // INTERNO
  },
  {
    id:          'mlg_596',
    sku:         'H.PIA.MAR14',
    barcode:     '8057014544763',
    name:        'Marinella medium plate Green',
    modelo:      'Marinella',
    familia:     'VAJILLA',
    image:       'images/products/marinella-piatto-piano-verde-1297.jpg',
    placeholder: false,
    precio_eur:  12.65,  // INTERNO
  },

  // ⚠️ Pancale / Lillybet  (12/26 con imagen)
  {
    id:          'mlg_597',
    sku:         'H.PIA.PAN25',
    barcode:     '8057014544008',
    name:        'Lillybet soup plate',
    modelo:      'Pancale / Lillybet',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_598',
    sku:         'H.PIA.PAN26',
    barcode:     '8057014544015',
    name:        'Lillybet small plate',
    modelo:      'Pancale / Lillybet',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_599',
    sku:         'H.PIA.PAN27',
    barcode:     '8057014544022',
    name:        'Lillybet medium plate',
    modelo:      'Pancale / Lillybet',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.65,  // INTERNO
  },
  {
    id:          'mlg_600',
    sku:         'H.PIA.PAN28',
    barcode:     '8057014544039',
    name:        'Lillybet underplate',
    modelo:      'Pancale / Lillybet',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  21.78,  // INTERNO
  },
  {
    id:          'mlg_601',
    sku:         'H.PIA.PAN2',
    barcode:     '8057014542769',
    name:        'Pancale soup plate orange',
    modelo:      'Pancale / Lillybet',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_602',
    sku:         'H.PIA.PAN1',
    barcode:     '8057014542776',
    name:        'Pancale soup plate white',
    modelo:      'Pancale / Lillybet',
    familia:     'VAJILLA',
    image:       'images/products/pancale-piatto-fondo-bianco-1290.jpg',
    placeholder: false,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_603',
    sku:         'H.PIA.PAN21',
    barcode:     '8057014543964',
    name:        'Pancale soup plate blue',
    modelo:      'Pancale / Lillybet',
    familia:     'VAJILLA',
    image:       'images/products/pancale-piatto-fondo-blu-1291.jpg',
    placeholder: false,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_604',
    sku:         'H.PIA.PAN5',
    barcode:     '8057014542783',
    name:        'Pancale soup plate yellow',
    modelo:      'Pancale / Lillybet',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_605',
    sku:         'H.PIA.PAN3',
    barcode:     '8057014542790',
    name:        'Pancale soup plate turquoise',
    modelo:      'Pancale / Lillybet',
    familia:     'VAJILLA',
    image:       'images/products/pancale-piatto-fondo-turchese-1293.jpg',
    placeholder: false,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_606',
    sku:         'H.PIA.PAN4',
    barcode:     '8057014542806',
    name:        'Pancale soup plate green',
    modelo:      'Pancale / Lillybet',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_607',
    sku:         'H.PIA.PAN7',
    barcode:     '8057014542813',
    name:        'Pancale small plate orange',
    modelo:      'Pancale / Lillybet',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_608',
    sku:         'H.PIA.PAN6',
    barcode:     '8057014542820',
    name:        'Pancale small plate white',
    modelo:      'Pancale / Lillybet',
    familia:     'VAJILLA',
    image:       'images/products/pancale-piatto-piano-bianco-1285.jpg',
    placeholder: false,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_609',
    sku:         'H.PIA.PAN22',
    barcode:     '8057014543971',
    name:        'Pancale small plate blue',
    modelo:      'Pancale / Lillybet',
    familia:     'VAJILLA',
    image:       'images/products/pancale-piatto-piano-blu-1286.jpg',
    placeholder: false,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_610',
    sku:         'H.PIA.PAN10',
    barcode:     '8057014542837',
    name:        'Pancale small plate yellow',
    modelo:      'Pancale / Lillybet',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_611',
    sku:         'H.PIA.PAN8',
    barcode:     '8057014542844',
    name:        'Pancale small plate turquoise',
    modelo:      'Pancale / Lillybet',
    familia:     'VAJILLA',
    image:       'images/products/pancale-piatto-piano-turchese-1288.jpg',
    placeholder: false,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_612',
    sku:         'H.PIA.PAN9',
    barcode:     '8057014542851',
    name:        'Pancale small plate green',
    modelo:      'Pancale / Lillybet',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_613',
    sku:         'H.PIA.PAN12',
    barcode:     '8057014542868',
    name:        'Pancale medium plate orange',
    modelo:      'Pancale / Lillybet',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.65,  // INTERNO
  },
  {
    id:          'mlg_614',
    sku:         'H.PIA.PAN11',
    barcode:     '8057014542875',
    name:        'Pancale medium plate white',
    modelo:      'Pancale / Lillybet',
    familia:     'VAJILLA',
    image:       'images/products/pancale-piatto-piano-bianco-1285.jpg',
    placeholder: false,
    precio_eur:  12.65,  // INTERNO
  },
  {
    id:          'mlg_615',
    sku:         'H.PIA.PAN23',
    barcode:     '8057014543988',
    name:        'Pancale medium plate blue',
    modelo:      'Pancale / Lillybet',
    familia:     'VAJILLA',
    image:       'images/products/pancale-piatto-piano-blu-1286.jpg',
    placeholder: false,
    precio_eur:  12.65,  // INTERNO
  },
  {
    id:          'mlg_616',
    sku:         'H.PIA.PAN15',
    barcode:     '8057014542882',
    name:        'Pancale medium plate yellow',
    modelo:      'Pancale / Lillybet',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.65,  // INTERNO
  },
  {
    id:          'mlg_617',
    sku:         'H.PIA.PAN13',
    barcode:     '8057014542899',
    name:        'Pancale medium plate turquoise',
    modelo:      'Pancale / Lillybet',
    familia:     'VAJILLA',
    image:       'images/products/pancale-piatto-piano-turchese-1288.jpg',
    placeholder: false,
    precio_eur:  12.65,  // INTERNO
  },
  {
    id:          'mlg_618',
    sku:         'H.PIA.PAN14',
    barcode:     '8057014542905',
    name:        'Pancale medium plate green',
    modelo:      'Pancale / Lillybet',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.65,  // INTERNO
  },
  {
    id:          'mlg_619',
    sku:         'H.PIA.PAN16',
    barcode:     '8057014542929',
    name:        'Pancale underplate white',
    modelo:      'Pancale / Lillybet',
    familia:     'VAJILLA',
    image:       'images/products/pancale-piatto-piano-bianco-1285.jpg',
    placeholder: false,
    precio_eur:  21.78,  // INTERNO
  },
  {
    id:          'mlg_620',
    sku:         'H.PIA.PAN24',
    barcode:     '8057014543995',
    name:        'Pancale underplate blue',
    modelo:      'Pancale / Lillybet',
    familia:     'VAJILLA',
    image:       'images/products/pancale-piatto-piano-blu-1286.jpg',
    placeholder: false,
    precio_eur:  21.78,  // INTERNO
  },
  {
    id:          'mlg_621',
    sku:         'H.PIA.PAN20',
    barcode:     '8057014542936',
    name:        'Pancale underplate yellow',
    modelo:      'Pancale / Lillybet',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  21.78,  // INTERNO
  },
  {
    id:          'mlg_622',
    sku:         'H.PIA.PAN18',
    barcode:     '8057014542943',
    name:        'Pancale underplate turquoise',
    modelo:      'Pancale / Lillybet',
    familia:     'VAJILLA',
    image:       'images/products/pancale-piatto-piano-turchese-1288.jpg',
    placeholder: false,
    precio_eur:  21.78,  // INTERNO
  },

  // 🔲 Patagonia  (0/12 con imagen)
  {
    id:          'mlg_623',
    sku:         'H.PIA.PAT2',
    barcode:     '8057014542035',
    name:        'Patagonia soup plate blue',
    modelo:      'Patagonia',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_624',
    sku:         'H.PIA.PAT5',
    barcode:     '8057014542059',
    name:        'Patagonia soup plate yellow',
    modelo:      'Patagonia',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_625',
    sku:         'H.PIA.PAT3',
    barcode:     '8057014542042',
    name:        'Patagonia soup plate green',
    modelo:      'Patagonia',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_626',
    sku:         'H.PIA.PAT7',
    barcode:     '8057014541977',
    name:        'Patagonia small plate blue',
    modelo:      'Patagonia',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_627',
    sku:         'H.PIA.PAT10',
    barcode:     '8057014541991',
    name:        'Patagonia small plate yellow',
    modelo:      'Patagonia',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_628',
    sku:         'H.PIA.PAT8',
    barcode:     '8057014541984',
    name:        'Patagonia small plate green',
    modelo:      'Patagonia',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_629',
    sku:         'H.PIA.PAT12',
    barcode:     '8057014542004',
    name:        'Patagonia medium plate blue',
    modelo:      'Patagonia',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.65,  // INTERNO
  },
  {
    id:          'mlg_630',
    sku:         'H.PIA.PAT15',
    barcode:     '8057014542028',
    name:        'Patagonia medium plate yellow',
    modelo:      'Patagonia',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.65,  // INTERNO
  },
  {
    id:          'mlg_631',
    sku:         'H.PIA.PAT13',
    barcode:     '8057014542011',
    name:        'Patagonia medium plate green',
    modelo:      'Patagonia',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.65,  // INTERNO
  },
  {
    id:          'mlg_632',
    sku:         'H.PIA.PAT22',
    barcode:     '8057014542066',
    name:        'Patagonia underplate blue',
    modelo:      'Patagonia',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  21.78,  // INTERNO
  },
  {
    id:          'mlg_633',
    sku:         'H.PIA.PAT25',
    barcode:     '8057014542080',
    name:        'Patagonia underplate yellow',
    modelo:      'Patagonia',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  21.78,  // INTERNO
  },
  {
    id:          'mlg_634',
    sku:         'H.PIA.PAT23',
    barcode:     '8057014542073',
    name:        'Patagonia underplate green',
    modelo:      'Patagonia',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  21.78,  // INTERNO
  },

  // 🔲 Viena  (0/16 con imagen)
  {
    id:          'mlg_635',
    sku:         'H.PIA.VIE13',
    barcode:     '8057014596519',
    name:        'Saint Tropez soup plate orange',
    modelo:      'Viena',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_636',
    sku:         'H.PIA.VIE18',
    barcode:     '8057014596526',
    name:        'Saint Tropez soup plate blue',
    modelo:      'Viena',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_637',
    sku:         'H.PIA.VIE14',
    barcode:     '8057014596540',
    name:        'Saint Tropez soup plate yellow',
    modelo:      'Viena',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_638',
    sku:         'H.PIA.VIE17',
    barcode:     '8057014596533',
    name:        'Saint Tropez soup plate turquoise',
    modelo:      'Viena',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_639',
    sku:         'H.PIA.VIE15',
    barcode:     '8057014596564',
    name:        'Saint Tropez soup plate green',
    modelo:      'Viena',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_640',
    sku:         'H.PIA.VIE1',
    barcode:     '8057014596571',
    name:        'Saint Tropez small plate orange',
    modelo:      'Viena',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_641',
    sku:         'H.PIA.VIE6',
    barcode:     '8057014596588',
    name:        'Saint Tropez small plate blue',
    modelo:      'Viena',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_642',
    sku:         'H.PIA.VIE2',
    barcode:     '8057014596601',
    name:        'Saint Tropez small plate yellow',
    modelo:      'Viena',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_643',
    sku:         'H.PIA.VIE5',
    barcode:     '8057014596595',
    name:        'Saint Tropez small plate turquoise',
    modelo:      'Viena',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_644',
    sku:         'H.PIA.VIE3',
    barcode:     '8057014596625',
    name:        'Saint Tropez small plate green',
    modelo:      'Viena',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.12,  // INTERNO
  },
  {
    id:          'mlg_645',
    sku:         'H.PIA.VIE7',
    barcode:     '8057014596632',
    name:        'Saint Tropez medium plate orange',
    modelo:      'Viena',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.65,  // INTERNO
  },
  {
    id:          'mlg_646',
    sku:         'H.PIA.VIE12',
    barcode:     '8057014596649',
    name:        'Saint Tropez medium plate blue',
    modelo:      'Viena',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.65,  // INTERNO
  },
  {
    id:          'mlg_647',
    sku:         'H.PIA.VIE8',
    barcode:     '8057014596663',
    name:        'Saint Tropez medium plate yellow',
    modelo:      'Viena',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.65,  // INTERNO
  },
  {
    id:          'mlg_648',
    sku:         'H.PIA.VIE11',
    barcode:     '8057014596656',
    name:        'Saint Tropez medium plate turquoise',
    modelo:      'Viena',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.65,  // INTERNO
  },
  {
    id:          'mlg_649',
    sku:         'H.PIA.VIE9',
    barcode:     '8057014596687',
    name:        'Saint Tropez medium plate green',
    modelo:      'Viena',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.65,  // INTERNO
  },
  {
    id:          'mlg_650',
    sku:         'H.PIA.VIE24',
    barcode:     '8057014598551',
    name:        'Saint Tropez tray green',
    modelo:      'Viena',
    familia:     'VAJILLA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  41.14,  // INTERNO
  },

  // ═══════════════════════════════════════════════════════════════
  // ENSALADERAS & CENTROS
  // 54 SKUs total · 17 con imagen · 37 pendientes
  // ═══════════════════════════════════════════════════════════════

  // 🔲 Dolce Alzata  (0/1 con imagen)
  {
    id:          'mlg_001',
    sku:         'H.ALZ.DOL1',
    barcode:     '8057014590111',
    name:        'Cake stand clear',
    modelo:      'Dolce Alzata',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  30.25,  // INTERNO
  },

  // ⚠️ Girasole  (1/2 con imagen)
  {
    id:          'mlg_002',
    sku:         'H.ALZ.GIR1',
    barcode:     '8057014590005',
    name:        'Girasole cake dome amber',
    modelo:      'Girasole',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/girasole-ambra-1322.jpg',
    placeholder: false,
    precio_eur:  54.45,  // INTERNO
  },
  {
    id:          'mlg_003',
    sku:         'H.ALZ.GIR2',
    barcode:     '8057014590029',
    name:        'Girasole cake dome clera',
    modelo:      'Girasole',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  54.45,  // INTERNO
  },

  // 🔲 Girasole Dome  (0/1 con imagen)
  {
    id:          'mlg_004',
    sku:         'H.ALZ.CUP1',
    barcode:     '8057014541304',
    name:        'Dome for Girasole stand',
    modelo:      'Girasole Dome',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  14.52,  // INTERNO
  },

  // 🔲 Guendalina  (0/1 con imagen)
  {
    id:          'mlg_005',
    sku:         'H.ALZ.GUE1',
    barcode:     '8057014590098',
    name:        'Guendalina stand for fruit red',
    modelo:      'Guendalina',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  30.25,  // INTERNO
  },

  // ✅ Ninfea  (5/5 con imagen)
  {
    id:          'mlg_006',
    sku:         'H.ALZ.NIN1',
    barcode:     '8057014590043',
    name:        'Ninfea cake dome amber',
    modelo:      'Ninfea',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/ninfea-ambra-1326.jpg',
    placeholder: false,
    precio_eur:  30.25,  // INTERNO
  },
  {
    id:          'mlg_007',
    sku:         'H.ALZ.NIN2',
    barcode:     '8057014590067',
    name:        'Ninfea cake dome clear',
    modelo:      'Ninfea',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/ninfea-trasparente-1329.jpg',
    placeholder: false,
    precio_eur:  30.25,  // INTERNO
  },
  {
    id:          'mlg_008',
    sku:         'H.ALZ.NIN3',
    barcode:     '8057014590050',
    name:        'Ninfea cake dome red',
    modelo:      'Ninfea',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/ninfea-rosso-1328.jpg',
    placeholder: false,
    precio_eur:  30.25,  // INTERNO
  },
  {
    id:          'mlg_009',
    sku:         'H.ALZ.NIN4',
    barcode:     '8057014590074',
    name:        'Ninfea cake dome green',
    modelo:      'Ninfea',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/ninfea-verde-1330.jpg',
    placeholder: false,
    precio_eur:  30.25,  // INTERNO
  },
  {
    id:          'mlg_010',
    sku:         'H.ALZ.NIN5',
    barcode:     '8057014542288',
    name:        'Ninfea cake dome gold',
    modelo:      'Ninfea',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/ninfea-ambra-1326.jpg',
    placeholder: false,
    precio_eur:  33.88,  // INTERNO
  },

  // 🔲 Susan  (0/4 con imagen)
  {
    id:          'mlg_011',
    sku:         'H.ALZ.SUS1',
    barcode:     '8057014543353',
    name:        'Susan centerpiece gold',
    modelo:      'Susan',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  55.0,  // INTERNO
  },
  {
    id:          'mlg_012',
    sku:         'H.ALZ.SUS2',
    barcode:     '8057014543360',
    name:        'Susan centerpiece red',
    modelo:      'Susan',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  55.0,  // INTERNO
  },
  {
    id:          'mlg_013',
    sku:         'H.ALZ.SUS3',
    barcode:     '8057014543377',
    name:        'Susan centerpiece clear',
    modelo:      'Susan',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  55.0,  // INTERNO
  },
  {
    id:          'mlg_014',
    sku:         'H.ALZ.SUS4',
    barcode:     '8057014543384',
    name:        'Susan centerpiece green',
    modelo:      'Susan',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  55.0,  // INTERNO
  },

  // ⚠️ Churchill / Elena  (8/10 con imagen)
  {
    id:          'mlg_421',
    sku:         'H.INS.CHU6',
    barcode:     '8057014542295',
    name:        'Churchill salad bowl gold',
    modelo:      'Churchill / Elena',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/churchill-grande-gold-1308.jpg',
    placeholder: false,
    precio_eur:  43.56,  // INTERNO
  },
  {
    id:          'mlg_422',
    sku:         'H.INS.CHU1',
    barcode:     '8057014541434',
    name:        'Churchill sald bowl red',
    modelo:      'Churchill / Elena',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/churchill-grande-red-1309.jpg',
    placeholder: false,
    precio_eur:  36.3,  // INTERNO
  },
  {
    id:          'mlg_423',
    sku:         'H.INS.CHU5',
    barcode:     '8057014541441',
    name:        'Churchill salad bowl white',
    modelo:      'Churchill / Elena',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  36.3,  // INTERNO
  },
  {
    id:          'mlg_424',
    sku:         'H.INS.CHU2',
    barcode:     '8057014541410',
    name:        'Churchill sald bowl clear',
    modelo:      'Churchill / Elena',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/churchill-grande-clear-1312.jpg',
    placeholder: false,
    precio_eur:  36.3,  // INTERNO
  },
  {
    id:          'mlg_425',
    sku:         'H.INS.CHU4',
    barcode:     '8057014541427',
    name:        'Churchill salad bowl green',
    modelo:      'Churchill / Elena',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/churchill-grande-green-1310.jpg',
    placeholder: false,
    precio_eur:  36.3,  // INTERNO
  },
  {
    id:          'mlg_426',
    sku:         'H.INS.CHU11',
    barcode:     '8057014542332',
    name:        'Elena small bowl gold',
    modelo:      'Churchill / Elena',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/churchill-piccola-gold-1313.jpg',
    placeholder: false,
    precio_eur:  11.0,  // INTERNO
  },
  {
    id:          'mlg_427',
    sku:         'H.INS.CHU12',
    barcode:     '8057014542349',
    name:        'Elena small bowl red',
    modelo:      'Churchill / Elena',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/churchill-piccola-red-1314.jpg',
    placeholder: false,
    precio_eur:  11.0,  // INTERNO
  },
  {
    id:          'mlg_428',
    sku:         'H.INS.CHU13',
    barcode:     '8057014542356',
    name:        'Elena small bowl white',
    modelo:      'Churchill / Elena',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  11.0,  // INTERNO
  },
  {
    id:          'mlg_429',
    sku:         'H.INS.CHU9',
    barcode:     '8057014542363',
    name:        'Elena small bowl clear',
    modelo:      'Churchill / Elena',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/churchill-piccola-clear-1317.jpg',
    placeholder: false,
    precio_eur:  11.0,  // INTERNO
  },
  {
    id:          'mlg_430',
    sku:         'H.INS.CHU10',
    barcode:     '8057014542325',
    name:        'Elena small bowl green',
    modelo:      'Churchill / Elena',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/churchill-piccola-green-1315.jpg',
    placeholder: false,
    precio_eur:  11.0,  // INTERNO
  },

  // 🔲 Fulmine  (0/8 con imagen)
  {
    id:          'mlg_431',
    sku:         'H.INS.FUL9',
    barcode:     '8057014545203',
    name:        'Fulmine small bowl blue',
    modelo:      'Fulmine',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  11.0,  // INTERNO
  },
  {
    id:          'mlg_432',
    sku:         'H.INS.FUL10',
    barcode:     '8057014545234',
    name:        'Fulmine small bowl red',
    modelo:      'Fulmine',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  11.0,  // INTERNO
  },
  {
    id:          'mlg_433',
    sku:         'H.INS.FUL12',
    barcode:     '8057014545210',
    name:        'Fulmine small bowl clear',
    modelo:      'Fulmine',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  11.0,  // INTERNO
  },
  {
    id:          'mlg_434',
    sku:         'H.INS.FUL11',
    barcode:     '8057014545227',
    name:        'Fulmine small bowl turquoise',
    modelo:      'Fulmine',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  11.0,  // INTERNO
  },
  {
    id:          'mlg_435',
    sku:         'H.INS.FUL5',
    barcode:     '8057014595895',
    name:        'Fulmine salad bowl blue',
    modelo:      'Fulmine',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  31.46,  // INTERNO
  },
  {
    id:          'mlg_436',
    sku:         'H.INS.FUL3',
    barcode:     '8057014595901',
    name:        'Fulmine salad bowl red',
    modelo:      'Fulmine',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  31.46,  // INTERNO
  },
  {
    id:          'mlg_437',
    sku:         'H.INS.FUL1',
    barcode:     '8057014595918',
    name:        'Fulmine salad bowl clear',
    modelo:      'Fulmine',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  31.46,  // INTERNO
  },
  {
    id:          'mlg_438',
    sku:         'H.INS.FUL4',
    barcode:     '8057014595925',
    name:        'Fulmine salad bowl turquoise',
    modelo:      'Fulmine',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  31.46,  // INTERNO
  },

  // 🔲 Italia Bowl  (0/2 con imagen)
  {
    id:          'mlg_439',
    sku:         'H.INS.ITA2',
    barcode:     '8057014544862',
    name:        'Nuova Italia sald bowl clear',
    modelo:      'Italia Bowl',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  50.0,  // INTERNO
  },
  {
    id:          'mlg_440',
    sku:         'H.INS.ITA3',
    barcode:     '8057014544879',
    name:        'Nuova Italia sald bowl green',
    modelo:      'Italia Bowl',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  50.0,  // INTERNO
  },

  // 🔲 Lente Bowl  (0/10 con imagen)
  {
    id:          'mlg_441',
    sku:         'H.INS.LEN8',
    barcode:     '8057014592801',
    name:        'Lente small bowl white',
    modelo:      'Lente Bowl',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.68,  // INTERNO
  },
  {
    id:          'mlg_442',
    sku:         'H.INS.LEN6',
    barcode:     '8057014592818',
    name:        'Lente small bowl blue',
    modelo:      'Lente Bowl',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.68,  // INTERNO
  },
  {
    id:          'mlg_443',
    sku:         'H.INS.LEN9',
    barcode:     '8057014592825',
    name:        'Lente small bowl red',
    modelo:      'Lente Bowl',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.68,  // INTERNO
  },
  {
    id:          'mlg_444',
    sku:         'H.INS.LEN7',
    barcode:     '8057014592832',
    name:        'Lente small bowl clear',
    modelo:      'Lente Bowl',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.68,  // INTERNO
  },
  {
    id:          'mlg_445',
    sku:         'H.INS.LEN10',
    barcode:     '8057014592849',
    name:        'Lente small bowl turquoise',
    modelo:      'Lente Bowl',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  9.68,  // INTERNO
  },
  {
    id:          'mlg_446',
    sku:         'H.INS.LEN3',
    barcode:     '8057014595956',
    name:        'Lente salad bowl white',
    modelo:      'Lente Bowl',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  29.04,  // INTERNO
  },
  {
    id:          'mlg_447',
    sku:         'H.INS.LEN1',
    barcode:     '8057014595963',
    name:        'Lente salad bowl blue',
    modelo:      'Lente Bowl',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  29.04,  // INTERNO
  },
  {
    id:          'mlg_448',
    sku:         'H.INS.LEN4',
    barcode:     '8057014595970',
    name:        'Lente salad bowl red',
    modelo:      'Lente Bowl',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  29.04,  // INTERNO
  },
  {
    id:          'mlg_449',
    sku:         'H.INS.LEN2',
    barcode:     '8057014595987',
    name:        'Lente salad bowl clear',
    modelo:      'Lente Bowl',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  29.04,  // INTERNO
  },
  {
    id:          'mlg_450',
    sku:         'H.INS.LEN5',
    barcode:     '8057014595994',
    name:        'Lente salad bowl turquoise',
    modelo:      'Lente Bowl',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  29.04,  // INTERNO
  },

  // ⚠️ Supernova  (3/5 con imagen)
  {
    id:          'mlg_451',
    sku:         'H.INS.MIL1',
    barcode:     '8057014596038',
    name:        'Supernova salad bowl clear',
    modelo:      'Supernova',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/supernova-trasparente-1321.jpg',
    placeholder: false,
    precio_eur:  50.82,  // INTERNO
  },
  {
    id:          'mlg_452',
    sku:         'H.INS.MIL2',
    barcode:     '8057014596014',
    name:        'Supernova salad bowl red',
    modelo:      'Supernova',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/supernova-rosso-1320.jpg',
    placeholder: false,
    precio_eur:  50.82,  // INTERNO
  },
  {
    id:          'mlg_453',
    sku:         'H.INS.MIL3',
    barcode:     '8057014596021',
    name:        'Supernova salad bowl royal blue',
    modelo:      'Supernova',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  50.82,  // INTERNO
  },
  {
    id:          'mlg_454',
    sku:         'H.INS.MIL4',
    barcode:     '8057014596045',
    name:        'Supernova salad bowl green',
    modelo:      'Supernova',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  50.82,  // INTERNO
  },
  {
    id:          'mlg_455',
    sku:         'H.INS.MIL5',
    barcode:     '8057014596007',
    name:        'Supernova salad bowl amber',
    modelo:      'Supernova',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/supernova-ambra-1318.jpg',
    placeholder: false,
    precio_eur:  50.82,  // INTERNO
  },

  // 🔲 Sputnik Bowl  (0/5 con imagen)
  {
    id:          'mlg_456',
    sku:         'H.INS.SPU1',
    barcode:     '8057014545340',
    name:        'Sputnik sald bowl clear',
    modelo:      'Sputnik Bowl',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  58.0,  // INTERNO
  },
  {
    id:          'mlg_457',
    sku:         'H.INS.SPU2',
    barcode:     '8057014545357',
    name:        'Sputnik sald bowl green',
    modelo:      'Sputnik Bowl',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  58.0,  // INTERNO
  },
  {
    id:          'mlg_458',
    sku:         'H.INS.SPU3',
    barcode:     '8057014545364',
    name:        'Sputnik sald bowl red',
    modelo:      'Sputnik Bowl',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  58.0,  // INTERNO
  },
  {
    id:          'mlg_459',
    sku:         'H.INS.SPU4',
    barcode:     '8057014545371',
    name:        'Sputnik sald bowl white',
    modelo:      'Sputnik Bowl',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  58.0,  // INTERNO
  },
  {
    id:          'mlg_460',
    sku:         'H.INS.SPU5',
    barcode:     '8057014545388',
    name:        'Sputnik sald bowl grey',
    modelo:      'Sputnik Bowl',
    familia:     'ENSALADERAS & CENTROS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  58.0,  // INTERNO
  },

  // ═══════════════════════════════════════════════════════════════
  // ACCESORIOS DE MESA
  // 76 SKUs total · 12 con imagen · 64 pendientes
  // ═══════════════════════════════════════════════════════════════

  // 🔲 Buddha  (0/2 con imagen)
  {
    id:          'mlg_395',
    sku:         'H.CAN.BUD3',
    barcode:     '8057014592528',
    name:        'Buddha candle orange',
    modelo:      'Buddha',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  26.62,  // INTERNO
  },
  {
    id:          'mlg_396',
    sku:         'H.CAN.BUD4',
    barcode:     '8057014592573',
    name:        'Buddha candle green',
    modelo:      'Buddha',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  26.62,  // INTERNO
  },

  // 🔲 Matteo  (0/2 con imagen)
  {
    id:          'mlg_495',
    sku:         'H.MATTEO1',
    barcode:     '8057014544787',
    name:        'Matteo fish magnet',
    modelo:      'Matteo',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  5.5,  // INTERNO
  },
  {
    id:          'mlg_496',
    sku:         'H.MATTEO2',
    barcode:     '8057014542479',
    name:        'Matteo fish magnet set 6',
    modelo:      'Matteo',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  33.0,  // INTERNO
  },

  // ⚠️ Melissa  (3/7 con imagen)
  {
    id:          'mlg_497',
    sku:         'H.MEL4',
    barcode:     '8057014543216',
    name:        'BASE PINEAPPLE MELISSA GOLD',
    modelo:      'Melissa',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  105.0,  // INTERNO
  },
  {
    id:          'mlg_498',
    sku:         'H.MEL5',
    barcode:     '8057014543223',
    name:        'BASE PINEAPPLE MELISSA RUBY',
    modelo:      'Melissa',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  105.0,  // INTERNO
  },
  {
    id:          'mlg_499',
    sku:         'H.MEL2',
    barcode:     '8057014543193',
    name:        'BASE PINEAPPLE MELISSA CLEAR',
    modelo:      'Melissa',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/melissa-1-trasparente-1353.jpg',
    placeholder: false,
    precio_eur:  105.0,  // INTERNO
  },
  {
    id:          'mlg_500',
    sku:         'H.MEL3',
    barcode:     '8057014543209',
    name:        'BASE PINEAPPLE MELISSA GREEN',
    modelo:      'Melissa',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/melissa-1-verde-1354.jpg',
    placeholder: false,
    precio_eur:  105.0,  // INTERNO
  },
  {
    id:          'mlg_501',
    sku:         'H.MEL8',
    barcode:     '8057014543254',
    name:        'LEAF FOR PINEAPPLE GOLD',
    modelo:      'Melissa',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  60.0,  // INTERNO
  },
  {
    id:          'mlg_502',
    sku:         'H.MEL9',
    barcode:     '8057014543261',
    name:        'LEAF FOR PINEAPPLE RUBY',
    modelo:      'Melissa',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  60.0,  // INTERNO
  },
  {
    id:          'mlg_503',
    sku:         'H.MEL7',
    barcode:     '8057014543247',
    name:        'LEAF FOR PINEAPPLE GREEN',
    modelo:      'Melissa',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/melissa-1-verde-1354.jpg',
    placeholder: false,
    precio_eur:  60.0,  // INTERNO
  },

  // 🔲 Picnic  (0/5 con imagen)
  {
    id:          'mlg_651',
    sku:         'H.PPO.PIC1',
    barcode:     '8057014541151',
    name:        'Picnic cutlery holder red',
    modelo:      'Picnic',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  96.8,  // INTERNO
  },
  {
    id:          'mlg_652',
    sku:         'H.PPO.PIC2',
    barcode:     '8057014541168',
    name:        'Picnic cutlery holder blue',
    modelo:      'Picnic',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  96.8,  // INTERNO
  },
  {
    id:          'mlg_653',
    sku:         'H.PPO.PIC3',
    barcode:     '8057014541175',
    name:        'Picnic cutlery holder clear',
    modelo:      'Picnic',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  96.8,  // INTERNO
  },
  {
    id:          'mlg_654',
    sku:         'H.PPO.PIC4',
    barcode:     '8057014541182',
    name:        'Picnic cutlery holder green',
    modelo:      'Picnic',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  96.8,  // INTERNO
  },
  {
    id:          'mlg_655',
    sku:         'H.PPO.PIC5',
    barcode:     '8057014541199',
    name:        'Picnic cutlery holder black',
    modelo:      'Picnic',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  96.8,  // INTERNO
  },

  // 🔲 Kaspar  (0/3 con imagen)
  {
    id:          'mlg_656',
    sku:         'H.PTO.KAS1',
    barcode:     '8057014598476',
    name:        'Kaspar napkin 17.5x17.5 clear',
    modelo:      'Kaspar',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  20.57,  // INTERNO
  },
  {
    id:          'mlg_657',
    sku:         'H.PTO.KAS2',
    barcode:     '8057014598452',
    name:        'Kaspar napkin 17.5x17.5 blue',
    modelo:      'Kaspar',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  20.57,  // INTERNO
  },
  {
    id:          'mlg_658',
    sku:         'H.PTO.KAS4',
    barcode:     '8057014598483',
    name:        'Kaspar napkin 17.5x17.5 green',
    modelo:      'Kaspar',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  20.57,  // INTERNO
  },

  // 🔲 Napkin  (0/6 con imagen)
  {
    id:          'mlg_659',
    sku:         'H.PTO.NAP1',
    barcode:     '8057014541106',
    name:        'Napkin red',
    modelo:      'Napkin',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  78.65,  // INTERNO
  },
  {
    id:          'mlg_660',
    sku:         'H.PTO.NAP2',
    barcode:     '8057014541113',
    name:        'Napkin royal blue',
    modelo:      'Napkin',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  78.65,  // INTERNO
  },
  {
    id:          'mlg_661',
    sku:         'H.PTO.NAP3',
    barcode:     '8057014541120',
    name:        'Napkin clear',
    modelo:      'Napkin',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  78.65,  // INTERNO
  },
  {
    id:          'mlg_662',
    sku:         'H.PTO.NAP4',
    barcode:     '8057014541137',
    name:        'Napkin green',
    modelo:      'Napkin',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  78.65,  // INTERNO
  },
  {
    id:          'mlg_663',
    sku:         'H.PTO.NAP5',
    barcode:     '8057014541144',
    name:        'Napkin black',
    modelo:      'Napkin',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  78.65,  // INTERNO
  },
  {
    id:          'mlg_664',
    sku:         'H.PTO.NAP6',
    barcode:     '8057014545180',
    name:        'Napkin clear/rattan',
    modelo:      'Napkin',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  130.0,  // INTERNO
  },

  // ✅ Bonnie & Clyde  (5/5 con imagen)
  {
    id:          'mlg_665',
    sku:         'H.SAL.BEC1',
    barcode:     '8057014599985',
    name:        'Bonnie & Clyde salt and pepper set green',
    modelo:      'Bonnie & Clyde',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/bonnie-e-clyde-green-1331.jpg',
    placeholder: false,
    precio_eur:  18.15,  // INTERNO
  },
  {
    id:          'mlg_666',
    sku:         'H.SAL.BEC2',
    barcode:     '8057014599992',
    name:        'Bonnie & Clyde salt and pepper set clear',
    modelo:      'Bonnie & Clyde',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/bonnie-e-clyde-clear-1334.jpg',
    placeholder: false,
    precio_eur:  18.15,  // INTERNO
  },
  {
    id:          'mlg_667',
    sku:         'H.SAL.BEC3',
    barcode:     '8057014540000',
    name:        'Bonnie & Clyde salt and pepper set blue',
    modelo:      'Bonnie & Clyde',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/bonnie-e-clyde-blue-1333.jpg',
    placeholder: false,
    precio_eur:  18.15,  // INTERNO
  },
  {
    id:          'mlg_668',
    sku:         'H.SAL.BEC5',
    barcode:     '8057014540024',
    name:        'Bonnie & Clyde salt and pepper set red',
    modelo:      'Bonnie & Clyde',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/bonnie-e-clyde-red-1332.jpg',
    placeholder: false,
    precio_eur:  18.15,  // INTERNO
  },
  {
    id:          'mlg_669',
    sku:         'H.SAL.BEC6',
    barcode:     '8057014542318',
    name:        'Bonnie & Clyde salt and pepper set gold',
    modelo:      'Bonnie & Clyde',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/bonnie-e-clyde-gold-1335.jpg',
    placeholder: false,
    precio_eur:  18.15,  // INTERNO
  },

  // ⚠️ Casanova  (2/4 con imagen)
  {
    id:          'mlg_670',
    sku:         'H.SAL.CAS1',
    barcode:     '8057014596922',
    name:        'SALT SHAKER CASANOVA CLEAR',
    modelo:      'Casanova',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/casanova-4-saliere-trasparente-1349.jpg',
    placeholder: false,
    precio_eur:  4.5,  // INTERNO
  },
  {
    id:          'mlg_671',
    sku:         'H.SAL.CAS2',
    barcode:     '8057014596908',
    name:        'SALT SHAKER CASANOVA FUME´',
    modelo:      'Casanova',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  4.5,  // INTERNO
  },
  {
    id:          'mlg_672',
    sku:         'H.SAL.CAS3',
    barcode:     '8057014596939',
    name:        'SALT SHAKER CASANOVA GREEN',
    modelo:      'Casanova',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  4.5,  // INTERNO
  },
  {
    id:          'mlg_673',
    sku:         'H.SAL.CAS4',
    barcode:     '8057014596915',
    name:        'SALT SHAKER CASANOVA RED',
    modelo:      'Casanova',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/casanova-4-saliere-rosso-1348.jpg',
    placeholder: false,
    precio_eur:  4.5,  // INTERNO
  },

  // ⚠️ Caterina & Vittoria  (2/4 con imagen)
  {
    id:          'mlg_674',
    sku:         'H.SAL.CEV1',
    barcode:     '8057014543315',
    name:        'Caterina & Vittoria salt and pepper set clear',
    modelo:      'Caterina & Vittoria',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/caterinaevittoria-clear-1336.jpg',
    placeholder: false,
    precio_eur:  22.0,  // INTERNO
  },
  {
    id:          'mlg_675',
    sku:         'H.SAL.CEV2',
    barcode:     '8057014543322',
    name:        'Caterina & Vittoria salt and pepper set ruby',
    modelo:      'Caterina & Vittoria',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  22.0,  // INTERNO
  },
  {
    id:          'mlg_676',
    sku:         'H.SAL.CEV3',
    barcode:     '8057014543339',
    name:        'Caterina & Vittoria salt and pepper set blue',
    modelo:      'Caterina & Vittoria',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/caterinaevittoria-blue-1339.jpg',
    placeholder: false,
    precio_eur:  22.0,  // INTERNO
  },
  {
    id:          'mlg_677',
    sku:         'H.SAL.CEV4',
    barcode:     '8057014543346',
    name:        'Caterina & Vittoria salt and pepper set green',
    modelo:      'Caterina & Vittoria',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  22.0,  // INTERNO
  },

  // 🔲 Mantel  (0/2 con imagen)
  {
    id:          'mlg_712',
    sku:         'H.TOV01',
    barcode:     '8057014597165',
    name:        'Cloth large table 150X260',
    modelo:      'Mantel',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  33.28,  // INTERNO
  },
  {
    id:          'mlg_713',
    sku:         'H.TOV02',
    barcode:     '8057014597172',
    name:        'Cloth small table 137X180',
    modelo:      'Mantel',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  26.62,  // INTERNO
  },

  // 🔲 Butler  (0/3 con imagen)
  {
    id:          'mlg_714',
    sku:         'H.VSS.BUT3',
    barcode:     '8057014540970',
    name:        'Butler tray clear',
    modelo:      'Butler',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  133.1,  // INTERNO
  },
  {
    id:          'mlg_715',
    sku:         'H.VSS.BUT5',
    barcode:     '8057014540987',
    name:        'Butler tray black',
    modelo:      'Butler',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  133.1,  // INTERNO
  },
  {
    id:          'mlg_716',
    sku:         'H.VSS.BUT6',
    barcode:     '8057014545265',
    name:        'Butler tray clear/rattan 45x35',
    modelo:      'Butler',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  200.0,  // INTERNO
  },

  // 🔲 Camilla  (0/1 con imagen)
  {
    id:          'mlg_717',
    sku:         'H.VSS.CAM4',
    barcode:     '8057014597875',
    name:        'Camilla tray red',
    modelo:      'Camilla',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  62.92,  // INTERNO
  },

  // 🔲 Canoca  (0/1 con imagen)
  {
    id:          'mlg_718',
    sku:         'H.VSS.CAN1',
    barcode:     '8057014597011',
    name:        'Canoca coaster white',
    modelo:      'Canoca',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  2.42,  // INTERNO
  },

  // 🔲 Canova  (0/4 con imagen)
  {
    id:          'mlg_719',
    sku:         'H.VSS.CAN3',
    barcode:     '8057014597028',
    name:        'Canova coaster blue',
    modelo:      'Canova',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  2.42,  // INTERNO
  },
  {
    id:          'mlg_720',
    sku:         'H.VSS.CAN4',
    barcode:     '8057014597042',
    name:        'Canova coaster red',
    modelo:      'Canova',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  2.42,  // INTERNO
  },
  {
    id:          'mlg_721',
    sku:         'H.VSS.CAN5',
    barcode:     '8057014597066',
    name:        'Canova coaster green',
    modelo:      'Canova',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  2.42,  // INTERNO
  },
  {
    id:          'mlg_722',
    sku:         'H.VSS.CAN6',
    barcode:     '8057014597035',
    name:        'Canova coaster black',
    modelo:      'Canova',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  2.42,  // INTERNO
  },

  // 🔲 Donovan  (0/4 con imagen)
  {
    id:          'mlg_723',
    sku:         'H.VSS.DON1',
    barcode:     '8057014544350',
    name:        'Donovan tray pink',
    modelo:      'Donovan',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  170.0,  // INTERNO
  },
  {
    id:          'mlg_724',
    sku:         'H.VSS.DON2',
    barcode:     '8057014544367',
    name:        'Donovan tray white',
    modelo:      'Donovan',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  170.0,  // INTERNO
  },
  {
    id:          'mlg_725',
    sku:         'H.VSS.DON3',
    barcode:     '8057014544374',
    name:        'Donovan tray orange',
    modelo:      'Donovan',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  170.0,  // INTERNO
  },
  {
    id:          'mlg_726',
    sku:         'H.VSS.DON4',
    barcode:     '8057014544381',
    name:        'Donovan tray grey',
    modelo:      'Donovan',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  170.0,  // INTERNO
  },

  // 🔲 Dylan  (0/4 con imagen)
  {
    id:          'mlg_727',
    sku:         'H.VSS.DYL1',
    barcode:     '8057014544312',
    name:        'Dylan tray pink',
    modelo:      'Dylan',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  170.0,  // INTERNO
  },
  {
    id:          'mlg_728',
    sku:         'H.VSS.DYL2',
    barcode:     '8057014544329',
    name:        'Dylan tray white',
    modelo:      'Dylan',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  170.0,  // INTERNO
  },
  {
    id:          'mlg_729',
    sku:         'H.VSS.DYL3',
    barcode:     '8057014544336',
    name:        'Dylan tray orange',
    modelo:      'Dylan',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  170.0,  // INTERNO
  },
  {
    id:          'mlg_730',
    sku:         'H.VSS.DYL4',
    barcode:     '8057014544343',
    name:        'Dylan tray grey',
    modelo:      'Dylan',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  170.0,  // INTERNO
  },

  // 🔲 Flag  (0/4 con imagen)
  {
    id:          'mlg_731',
    sku:         'H.VSS.FLAG1',
    barcode:     '8057014545005',
    name:        'Flag tray red',
    modelo:      'Flag',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  180.0,  // INTERNO
  },
  {
    id:          'mlg_732',
    sku:         'H.VSS.FLAG2',
    barcode:     '8057014545012',
    name:        'Flag tray royal blue',
    modelo:      'Flag',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  180.0,  // INTERNO
  },
  {
    id:          'mlg_733',
    sku:         'H.VSS.FLAG3',
    barcode:     '8057014545029',
    name:        'Flag tray dark grey',
    modelo:      'Flag',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  180.0,  // INTERNO
  },
  {
    id:          'mlg_734',
    sku:         'H.VSS.FLAG4',
    barcode:     '8057014545036',
    name:        'Flag tray dark green',
    modelo:      'Flag',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  180.0,  // INTERNO
  },

  // 🔲 Lazy Susan  (0/1 con imagen)
  {
    id:          'mlg_735',
    sku:         'H.VSS.LAZ1',
    barcode:     '8057014596151',
    name:        'LAZY SUSAN CLEAR',
    modelo:      'Lazy Susan',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  48.4,  // INTERNO
  },

  // 🔲 Costanza  (0/1 con imagen)
  {
    id:          'mlg_736',
    sku:         'H.VSS.NEX2',
    barcode:     '8057014598704',
    name:        'Costanza tray red',
    modelo:      'Costanza',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  78.65,  // INTERNO
  },

  // 🔲 Raffaello  (0/3 con imagen)
  {
    id:          'mlg_737',
    sku:         'H.VSS.RAF1',
    barcode:     '8057014597219',
    name:        'Raffaello american towel clear',
    modelo:      'Raffaello',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  18.15,  // INTERNO
  },
  {
    id:          'mlg_738',
    sku:         'H.VSS.RAF6',
    barcode:     '8057014597189',
    name:        'Raffaello american towel white',
    modelo:      'Raffaello',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  18.15,  // INTERNO
  },
  {
    id:          'mlg_739',
    sku:         'H.VSS.RAF9',
    barcode:     '8057014542301',
    name:        'Raffaello american towel gold',
    modelo:      'Raffaello',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  24.2,  // INTERNO
  },

  // 🔲 Six  (0/2 con imagen)
  {
    id:          'mlg_740',
    sku:         'H.VSS.SIX1',
    barcode:     '8057014540611',
    name:        'Six tray clear',
    modelo:      'Six',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  66.55,  // INTERNO
  },
  {
    id:          'mlg_741',
    sku:         'H.VSS.SIX5',
    barcode:     '8057014540628',
    name:        'Six tray white',
    modelo:      'Six',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  66.55,  // INTERNO
  },

  // 🔲 Della Robbia  (0/6 con imagen)
  {
    id:          'mlg_742',
    sku:         'H.VSS.VDR1',
    barcode:     '8057014597950',
    name:        'Della Robbia tray red',
    modelo:      'Della Robbia',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  60.5,  // INTERNO
  },
  {
    id:          'mlg_743',
    sku:         'H.VSS.VDR2',
    barcode:     '8057014598001',
    name:        'Della Robbia tray clear',
    modelo:      'Della Robbia',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  60.5,  // INTERNO
  },
  {
    id:          'mlg_744',
    sku:         'H.VSS.VDR3',
    barcode:     '8057014597943',
    name:        'Della Robbia tray dark green',
    modelo:      'Della Robbia',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  60.5,  // INTERNO
  },
  {
    id:          'mlg_745',
    sku:         'H.VSS.VDR4',
    barcode:     '8057014597967',
    name:        'Della Robbia tray royal blue',
    modelo:      'Della Robbia',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  60.5,  // INTERNO
  },
  {
    id:          'mlg_746',
    sku:         'H.VSS.VDR5',
    barcode:     '8057014597974',
    name:        'Della Robbia tray white gloss',
    modelo:      'Della Robbia',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  60.5,  // INTERNO
  },
  {
    id:          'mlg_747',
    sku:         'H.VSS.VDR6',
    barcode:     '8057014597998',
    name:        'Della Robbia tray red gloss',
    modelo:      'Della Robbia',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  60.5,  // INTERNO
  },

  // 🔲 Gioconda  (0/2 con imagen)
  {
    id:          'mlg_748',
    sku:         'H.VSS.VG1',
    barcode:     '8057014598124',
    name:        'Gioconda tray clear',
    modelo:      'Gioconda',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  48.4,  // INTERNO
  },
  {
    id:          'mlg_749',
    sku:         'H.VSS.VG5',
    barcode:     '8057014598094',
    name:        'Gioconda tray white gloss',
    modelo:      'Gioconda',
    familia:     'ACCESORIOS DE MESA',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  48.4,  // INTERNO
  },

  // ═══════════════════════════════════════════════════════════════
  // TAZAS & BEBIDAS
  // 21 SKUs total · 6 con imagen · 15 pendientes
  // ═══════════════════════════════════════════════════════════════

  // ⚠️ Lucilla  (6/8 con imagen)
  {
    id:          'mlg_397',
    sku:         'H.COF.1',
    barcode:     '8057014543520',
    name:        'Lucilla Coffe Cup with saucer white',
    modelo:      'Lucilla',
    familia:     'TAZAS & BEBIDAS',
    image:       'images/products/lucilla-white-1355.jpg',
    placeholder: false,
    precio_eur:  8.0,  // INTERNO
  },
  {
    id:          'mlg_398',
    sku:         'H.COF.2',
    barcode:     '8057014543537',
    name:        'Lucilla Coffe Cup with saucer red',
    modelo:      'Lucilla',
    familia:     'TAZAS & BEBIDAS',
    image:       'images/products/lucilla-red-1356.jpg',
    placeholder: false,
    precio_eur:  8.0,  // INTERNO
  },
  {
    id:          'mlg_399',
    sku:         'H.COF.3',
    barcode:     '8057014543544',
    name:        'Lucilla Coffe Cup with saucer black',
    modelo:      'Lucilla',
    familia:     'TAZAS & BEBIDAS',
    image:       'images/products/lucilla-black-1357.jpg',
    placeholder: false,
    precio_eur:  8.0,  // INTERNO
  },
  {
    id:          'mlg_400',
    sku:         'H.COF.4',
    barcode:     '8057014543551',
    name:        'Lucilla Coffe Cup with saucer blue',
    modelo:      'Lucilla',
    familia:     'TAZAS & BEBIDAS',
    image:       'images/products/lucilla-blue-1358.jpg',
    placeholder: false,
    precio_eur:  8.0,  // INTERNO
  },
  {
    id:          'mlg_401',
    sku:         'H.COF.5',
    barcode:     '8057014543568',
    name:        'Lucilla Coffe Cup with saucer ivory',
    modelo:      'Lucilla',
    familia:     'TAZAS & BEBIDAS',
    image:       'images/products/lucilla-ivory-1359.jpg',
    placeholder: false,
    precio_eur:  8.0,  // INTERNO
  },
  {
    id:          'mlg_402',
    sku:         'H.COF.6',
    barcode:     '8057014543575',
    name:        'Lucilla Coffe Cup with saucer turquoise',
    modelo:      'Lucilla',
    familia:     'TAZAS & BEBIDAS',
    image:       'images/products/lucilla-turquoise-1360.jpg',
    placeholder: false,
    precio_eur:  8.0,  // INTERNO
  },
  {
    id:          'mlg_403',
    sku:         'H.COF.7',
    barcode:     '8057014543902',
    name:        'Lucilla Coffe Cup with saucer orange',
    modelo:      'Lucilla',
    familia:     'TAZAS & BEBIDAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  8.0,  // INTERNO
  },
  {
    id:          'mlg_404',
    sku:         'H.COF.8',
    barcode:     '8057014545128',
    name:        'Lucilla Coffe Cup with saucer pink',
    modelo:      'Lucilla',
    familia:     'TAZAS & BEBIDAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  8.0,  // INTERNO
  },

  // 🔲 Magic Mug  (0/6 con imagen)
  {
    id:          'mlg_489',
    sku:         'H.MAG2',
    barcode:     '8057014544909',
    name:        'Magic Mug ivory',
    modelo:      'Magic Mug',
    familia:     'TAZAS & BEBIDAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  15.5,  // INTERNO
  },
  {
    id:          'mlg_490',
    sku:         'H.MAG3',
    barcode:     '8057014544916',
    name:        'Magic Mug blue navy',
    modelo:      'Magic Mug',
    familia:     'TAZAS & BEBIDAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  15.5,  // INTERNO
  },
  {
    id:          'mlg_491',
    sku:         'H.MAG4',
    barcode:     '8057014544923',
    name:        'Magic Mug turquoise',
    modelo:      'Magic Mug',
    familia:     'TAZAS & BEBIDAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  15.5,  // INTERNO
  },
  {
    id:          'mlg_492',
    sku:         'H.MAG5',
    barcode:     '8057014544930',
    name:        'Magic Mug red',
    modelo:      'Magic Mug',
    familia:     'TAZAS & BEBIDAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  15.5,  // INTERNO
  },
  {
    id:          'mlg_493',
    sku:         'H.MAG6',
    barcode:     '8057014544947',
    name:        'Magic Mug orange',
    modelo:      'Magic Mug',
    familia:     'TAZAS & BEBIDAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  15.5,  // INTERNO
  },
  {
    id:          'mlg_494',
    sku:         'H.MAG7',
    barcode:     '8057014545142',
    name:        'Magic Mug pink',
    modelo:      'Magic Mug',
    familia:     'TAZAS & BEBIDAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  15.5,  // INTERNO
  },

  // 🔲 Teatime  (0/7 con imagen)
  {
    id:          'mlg_705',
    sku:         'H.TEA.1',
    barcode:     '8057014543582',
    name:        'Tea Cup with saucer white',
    modelo:      'Teatime',
    familia:     'TAZAS & BEBIDAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.0,  // INTERNO
  },
  {
    id:          'mlg_706',
    sku:         'H.TEA.2',
    barcode:     '8057014543599',
    name:        'Tea Cup with saucer red',
    modelo:      'Teatime',
    familia:     'TAZAS & BEBIDAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.0,  // INTERNO
  },
  {
    id:          'mlg_707',
    sku:         'H.TEA.3',
    barcode:     '8057014543605',
    name:        'Tea Cup with saucer black',
    modelo:      'Teatime',
    familia:     'TAZAS & BEBIDAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.0,  // INTERNO
  },
  {
    id:          'mlg_708',
    sku:         'H.TEA.4',
    barcode:     '8057014543612',
    name:        'Tea Cup with saucer blue',
    modelo:      'Teatime',
    familia:     'TAZAS & BEBIDAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.0,  // INTERNO
  },
  {
    id:          'mlg_709',
    sku:         'H.TEA.5',
    barcode:     '8057014543629',
    name:        'Tea Cup with saucer ivory',
    modelo:      'Teatime',
    familia:     'TAZAS & BEBIDAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.0,  // INTERNO
  },
  {
    id:          'mlg_710',
    sku:         'H.TEA.6',
    barcode:     '8057014543636',
    name:        'Tea Cup with saucer turquoise',
    modelo:      'Teatime',
    familia:     'TAZAS & BEBIDAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.0,  // INTERNO
  },
  {
    id:          'mlg_711',
    sku:         'H.TEA.7',
    barcode:     '8057014545135',
    name:        'Tea Cup with saucer pink',
    modelo:      'Teatime',
    familia:     'TAZAS & BEBIDAS',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  12.0,  // INTERNO
  },

  // ═══════════════════════════════════════════════════════════════
  // LAMPARAS & DECO
  // 101 SKUs total · 30 con imagen · 71 pendientes
  // ═══════════════════════════════════════════════════════════════

  // 🔲 Anacapri  (0/3 con imagen)
  {
    id:          'mlg_405',
    sku:         'H.COR.ANC1',
    barcode:     '8057014540284',
    name:        'Anacapri photo frame clear',
    modelo:      'Anacapri',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  58.08,  // INTERNO
  },
  {
    id:          'mlg_406',
    sku:         'H.COR.ANC2',
    barcode:     '8057014540291',
    name:        'Anacapri photo frame royal blue',
    modelo:      'Anacapri',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  58.08,  // INTERNO
  },
  {
    id:          'mlg_407',
    sku:         'H.COR.ANC4',
    barcode:     '8057014544954',
    name:        'Anacapri photo frame black',
    modelo:      'Anacapri',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  80.0,  // INTERNO
  },

  // 🔲 Capri  (0/5 con imagen)
  {
    id:          'mlg_408',
    sku:         'H.COR.CAP1',
    barcode:     '8057014540307',
    name:        'Capri photo frame clear',
    modelo:      'Capri',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  72.6,  // INTERNO
  },
  {
    id:          'mlg_409',
    sku:         'H.COR.CAP2',
    barcode:     '8057014540314',
    name:        'Capri photo frame green',
    modelo:      'Capri',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  72.6,  // INTERNO
  },
  {
    id:          'mlg_410',
    sku:         'H.COR.CAP3',
    barcode:     '8057014544961',
    name:        'Capri photo frame orange',
    modelo:      'Capri',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  105.0,  // INTERNO
  },
  {
    id:          'mlg_411',
    sku:         'H.COR.CAP4',
    barcode:     '8057014544978',
    name:        'Capri photo frame black',
    modelo:      'Capri',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  105.0,  // INTERNO
  },
  {
    id:          'mlg_412',
    sku:         'H.COR.CAP5',
    barcode:     '8057014544985',
    name:        'Capri photo frame blu',
    modelo:      'Capri',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  105.0,  // INTERNO
  },

  // 🔲 Giulia Frame  (0/8 con imagen)
  {
    id:          'mlg_413',
    sku:         'H.COR.RAN7',
    barcode:     '8057014541519',
    name:        'Giulia photo frame blue',
    modelo:      'Giulia Frame',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  66.55,  // INTERNO
  },
  {
    id:          'mlg_414',
    sku:         'H.COR.RAN8',
    barcode:     '8057014541526',
    name:        'Giulia photo frame grey',
    modelo:      'Giulia Frame',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  66.55,  // INTERNO
  },
  {
    id:          'mlg_415',
    sku:         'H.COR.RAN10',
    barcode:     '8057014541533',
    name:        'Giulia photo frame red',
    modelo:      'Giulia Frame',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  66.55,  // INTERNO
  },
  {
    id:          'mlg_416',
    sku:         'H.COR.RAN6',
    barcode:     '8057014541540',
    name:        'Giulia photo frame clear',
    modelo:      'Giulia Frame',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  66.55,  // INTERNO
  },
  {
    id:          'mlg_417',
    sku:         'H.COR.RAN4',
    barcode:     '8057014541557',
    name:        'Ranieri photo frame blue',
    modelo:      'Giulia Frame',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  78.65,  // INTERNO
  },
  {
    id:          'mlg_418',
    sku:         'H.COR.RAN5',
    barcode:     '8057014541564',
    name:        'Ranieri photo frame grey',
    modelo:      'Giulia Frame',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  78.65,  // INTERNO
  },
  {
    id:          'mlg_419',
    sku:         'H.COR.RAN2',
    barcode:     '8057014541571',
    name:        'Ranieri photo frame red',
    modelo:      'Giulia Frame',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  78.65,  // INTERNO
  },
  {
    id:          'mlg_420',
    sku:         'H.COR.RAN1',
    barcode:     '8057014541588',
    name:        'Ranieri photo frame clear',
    modelo:      'Giulia Frame',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  78.65,  // INTERNO
  },

  // 🔲 Kane Dog Bowl  (0/4 con imagen)
  {
    id:          'mlg_461',
    sku:         'H.KAN1',
    barcode:     '8057014592771',
    name:        'Kane dog bowl red',
    modelo:      'Kane Dog Bowl',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  26.62,  // INTERNO
  },
  {
    id:          'mlg_462',
    sku:         'H.KAN2',
    barcode:     '8057014592764',
    name:        'Kane dog bowl amber',
    modelo:      'Kane Dog Bowl',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  26.62,  // INTERNO
  },
  {
    id:          'mlg_463',
    sku:         'H.KAN3',
    barcode:     '8057014592788',
    name:        'Kane dog bowl royal blue',
    modelo:      'Kane Dog Bowl',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  26.62,  // INTERNO
  },
  {
    id:          'mlg_464',
    sku:         'H.KAN4',
    barcode:     '8057014592795',
    name:        'Kane dog bowl green',
    modelo:      'Kane Dog Bowl',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  26.62,  // INTERNO
  },

  // ✅ Andalusia  (3/3 con imagen)
  {
    id:          'mlg_465',
    sku:         'H.LAM.AND1',
    barcode:     '8057014598773',
    name:        'Andalusia lampshade clear',
    modelo:      'Andalusia',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/andalusia-clear-1369.jpg',
    placeholder: false,
    precio_eur:  22.0,  // INTERNO
  },
  {
    id:          'mlg_466',
    sku:         'H.LAM.AND2',
    barcode:     '8057014598780',
    name:        'Andalusia lampshade red',
    modelo:      'Andalusia',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/andalusia-clear-1369.jpg',
    placeholder: false,
    precio_eur:  22.0,  // INTERNO
  },
  {
    id:          'mlg_467',
    sku:         'H.LAM.AND3',
    barcode:     '8057014598797',
    name:        'Andalusia lampshade green',
    modelo:      'Andalusia',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/andalusia-clear-1369.jpg',
    placeholder: false,
    precio_eur:  22.0,  // INTERNO
  },

  // ✅ Cleopatra / Andalusia  (7/7 con imagen)
  {
    id:          'mlg_468',
    sku:         'H.LAM.CLE9',
    barcode:     '8057014590128',
    name:        'Andalusia lamp base',
    modelo:      'Cleopatra / Andalusia',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/andalusia-clear-1369.jpg',
    placeholder: false,
    precio_eur:  56.65,  // INTERNO
  },
  {
    id:          'mlg_473',
    sku:         'H.LAM.CLE6',
    barcode:     '8057014596373',
    name:        'Cleopatra lampshade orange',
    modelo:      'Cleopatra / Andalusia',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/cleopatra-clear-1368.jpg',
    placeholder: false,
    precio_eur:  22.0,  // INTERNO
  },
  {
    id:          'mlg_474',
    sku:         'H.LAM.CLE10',
    barcode:     '8057014598520',
    name:        'Cleopatra lampshade yellow',
    modelo:      'Cleopatra / Andalusia',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/cleopatra-clear-1368.jpg',
    placeholder: false,
    precio_eur:  22.0,  // INTERNO
  },
  {
    id:          'mlg_475',
    sku:         'H.LAM.CLE7',
    barcode:     '8057014596380',
    name:        'Cleopatra lampshade red',
    modelo:      'Cleopatra / Andalusia',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/cleopatra-clear-1368.jpg',
    placeholder: false,
    precio_eur:  22.0,  // INTERNO
  },
  {
    id:          'mlg_476',
    sku:         'H.LAM.CLE5',
    barcode:     '8057014596397',
    name:        'Cleopatra lampshade clear',
    modelo:      'Cleopatra / Andalusia',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/cleopatra-clear-1368.jpg',
    placeholder: false,
    precio_eur:  22.0,  // INTERNO
  },
  {
    id:          'mlg_477',
    sku:         'H.LAM.CLE8',
    barcode:     '8057014596403',
    name:        'Cleopatra lampshade turquoise',
    modelo:      'Cleopatra / Andalusia',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/cleopatra-clear-1368.jpg',
    placeholder: false,
    precio_eur:  22.0,  // INTERNO
  },
  {
    id:          'mlg_478',
    sku:         'H.LAM.CLE9',
    barcode:     '8057014590128',
    name:        'Cleopatra lamp base',
    modelo:      'Cleopatra / Andalusia',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/cleopatra-clear-1368.jpg',
    placeholder: false,
    precio_eur:  56.65,  // INTERNO
  },

  // ✅ Calypso  (4/4 con imagen)
  {
    id:          'mlg_469',
    sku:         'H.LAM.CAL6',
    barcode:     '8057014541823',
    name:        'Calypso lamp base',
    modelo:      'Calypso',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/calypso-clear-1364.jpg',
    placeholder: false,
    precio_eur:  119.4,  // INTERNO
  },
  {
    id:          'mlg_470',
    sku:         'H.LAM.CAL11',
    barcode:     '8057014541816',
    name:        'Calypso lampshade grey',
    modelo:      'Calypso',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/calypso-clear-1364.jpg',
    placeholder: false,
    precio_eur:  50.0,  // INTERNO
  },
  {
    id:          'mlg_471',
    sku:         'H.LAM.CAL9',
    barcode:     '8057014542271',
    name:        'Calypso lampshade gold',
    modelo:      'Calypso',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/calypso-clear-1364.jpg',
    placeholder: false,
    precio_eur:  50.0,  // INTERNO
  },
  {
    id:          'mlg_472',
    sku:         'H.LAM.CAL8',
    barcode:     '8057014541809',
    name:        'Calypso lampshade clear',
    modelo:      'Calypso',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/calypso-clear-1364.jpg',
    placeholder: false,
    precio_eur:  50.0,  // INTERNO
  },

  // ✅ Joshua  (4/4 con imagen)
  {
    id:          'mlg_479',
    sku:         'H.LAM.JOS11',
    barcode:     '8057014540451',
    name:        'Joshua lamp base',
    modelo:      'Joshua',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/joshua-clear-1361.jpg',
    placeholder: false,
    precio_eur:  61.8,  // INTERNO
  },
  {
    id:          'mlg_480',
    sku:         'H.LAM.JOS9',
    barcode:     '8057014540444',
    name:        'Joshua lampshade opaque grey',
    modelo:      'Joshua',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/joshua-clear-1361.jpg',
    placeholder: false,
    precio_eur:  35.0,  // INTERNO
  },
  {
    id:          'mlg_481',
    sku:         'H.LAM.JOS10',
    barcode:     '8057014540420',
    name:        'Joshua lampshade opaque white',
    modelo:      'Joshua',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/joshua-clear-1361.jpg',
    placeholder: false,
    precio_eur:  35.0,  // INTERNO
  },
  {
    id:          'mlg_482',
    sku:         'H.LAM.JOS7',
    barcode:     '8057014540437',
    name:        'Joshua lampshade clear',
    modelo:      'Joshua',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/joshua-clear-1361.jpg',
    placeholder: false,
    precio_eur:  35.0,  // INTERNO
  },

  // 🔲 Serena  (0/5 con imagen)
  {
    id:          'mlg_483',
    sku:         'H.MAD1',
    barcode:     '8057014599497',
    name:        'M/Serena clear',
    modelo:      'Serena',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  45.0,  // INTERNO
  },
  {
    id:          'mlg_484',
    sku:         'H.MAD2',
    barcode:     '8057014599480',
    name:        'M/Serena ruby',
    modelo:      'Serena',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  45.0,  // INTERNO
  },
  {
    id:          'mlg_485',
    sku:         'H.MAD3',
    barcode:     '8057014599473',
    name:        'M/Serena amber',
    modelo:      'Serena',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  45.0,  // INTERNO
  },
  {
    id:          'mlg_486',
    sku:         'H.MAD4',
    barcode:     '8057014599503',
    name:        'M/Serena green',
    modelo:      'Serena',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  45.0,  // INTERNO
  },
  {
    id:          'mlg_487',
    sku:         'H.MAD5',
    barcode:     '8057014599466',
    name:        'M/Serena gold',
    modelo:      'Serena',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  45.0,  // INTERNO
  },

  // 🔲 Serena Thermal  (0/1 con imagen)
  {
    id:          'mlg_488',
    sku:         'H.PGE.ACC',
    barcode:     '8057014541236',
    name:        'Serena thermal',
    modelo:      'Serena Thermal',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  10.0,  // INTERNO
  },

  // 🔲 Versailles / Luigi XIV  (0/6 con imagen)
  {
    id:          'mlg_504',
    sku:         'H.MEN5',
    barcode:     '8057014599008',
    name:        'Luigi XIV shelf blue 749x280x227',
    modelo:      'Versailles / Luigi XIV',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  121.0,  // INTERNO
  },
  {
    id:          'mlg_505',
    sku:         'H.MEN6',
    barcode:     '8057014599015',
    name:        'Luigi XIV shelf clear 749x280x227',
    modelo:      'Versailles / Luigi XIV',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  121.0,  // INTERNO
  },
  {
    id:          'mlg_506',
    sku:         'H.MEN4',
    barcode:     '8057014598995',
    name:        'Luigi XIV shelf green 749x280x227',
    modelo:      'Versailles / Luigi XIV',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  121.0,  // INTERNO
  },
  {
    id:          'mlg_507',
    sku:         'H.MEN2',
    barcode:     '8057014598971',
    name:        'Versailles shelf blue 297x188x182',
    modelo:      'Versailles / Luigi XIV',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  44.77,  // INTERNO
  },
  {
    id:          'mlg_508',
    sku:         'H.MEN3',
    barcode:     '8057014598988',
    name:        'Versailles shelf clear 297x188x182',
    modelo:      'Versailles / Luigi XIV',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  44.77,  // INTERNO
  },
  {
    id:          'mlg_509',
    sku:         'H.MEN1',
    barcode:     '8057014598964',
    name:        'Versailles shelf green 297x188x182',
    modelo:      'Versailles / Luigi XIV',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  44.77,  // INTERNO
  },

  // 🔲 Culla  (0/2 con imagen)
  {
    id:          'mlg_510',
    sku:         'H.PB09',
    barcode:     '8057014595529',
    name:        'Culla bucklet small green',
    modelo:      'Culla',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  24.2,  // INTERNO
  },
  {
    id:          'mlg_511',
    sku:         'H.PB10',
    barcode:     '8057014595499',
    name:        'Culla bucklet small red',
    modelo:      'Culla',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  24.2,  // INTERNO
  },

  // ⚠️ Antartica / Filippo / Culla  (11/22 con imagen)
  {
    id:          'mlg_512',
    sku:         'H.PBO.MES1',
    barcode:     '8057014541007',
    name:        'Message in a bottle red',
    modelo:      'Antartica / Filippo / Culla',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  102.85,  // INTERNO
  },
  {
    id:          'mlg_513',
    sku:         'H.PBO.MES2',
    barcode:     '8057014540994',
    name:        'Message in a bottle royal blue',
    modelo:      'Antartica / Filippo / Culla',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  102.85,  // INTERNO
  },
  {
    id:          'mlg_514',
    sku:         'H.PBO.MES3',
    barcode:     '8057014541021',
    name:        'Message in a bottle clear',
    modelo:      'Antartica / Filippo / Culla',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  102.85,  // INTERNO
  },
  {
    id:          'mlg_515',
    sku:         'H.PBO.MES4',
    barcode:     '8057014541014',
    name:        'Message in a bottle green',
    modelo:      'Antartica / Filippo / Culla',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  102.85,  // INTERNO
  },
  {
    id:          'mlg_516',
    sku:         'H.PBO.MES5',
    barcode:     '8057014541038',
    name:        'Message in a bottle black',
    modelo:      'Antartica / Filippo / Culla',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  102.85,  // INTERNO
  },
  {
    id:          'mlg_517',
    sku:         'H.PBO.MES6',
    barcode:     '8057014545173',
    name:        'Message in a bottle clear/rattan',
    modelo:      'Antartica / Filippo / Culla',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  190.0,  // INTERNO
  },
  {
    id:          'mlg_518',
    sku:         'H.PBO18',
    barcode:     '8057014596830',
    name:        'Antartica ice bucket amber',
    modelo:      'Antartica / Filippo / Culla',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/antartica-ambra-1375.jpg',
    placeholder: false,
    precio_eur:  52.03,  // INTERNO
  },
  {
    id:          'mlg_519',
    sku:         'H.PBO19',
    barcode:     '8057014596847',
    name:        'Antartica ice bucket blue',
    modelo:      'Antartica / Filippo / Culla',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/antartica-blu-1377.jpg',
    placeholder: false,
    precio_eur:  52.03,  // INTERNO
  },
  {
    id:          'mlg_520',
    sku:         'H.PBO29',
    barcode:     '8057014598735',
    name:        'Antartica ice bucket white frost',
    modelo:      'Antartica / Filippo / Culla',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/antartica-white-frost-1380.jpg',
    placeholder: false,
    precio_eur:  54.45,  // INTERNO
  },
  {
    id:          'mlg_521',
    sku:         'H.PBO35',
    barcode:     '8057014599282',
    name:        'Antartica ice bucket blue frost',
    modelo:      'Antartica / Filippo / Culla',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  54.45,  // INTERNO
  },
  {
    id:          'mlg_522',
    sku:         'H.PBO32',
    barcode:     '8057014598742',
    name:        'Antartica ice bucket red frost',
    modelo:      'Antartica / Filippo / Culla',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/antartica-red-frost-1381.jpg',
    placeholder: false,
    precio_eur:  54.45,  // INTERNO
  },
  {
    id:          'mlg_523',
    sku:         'H.PBO37',
    barcode:     '8057014543025',
    name:        'Antartica ice bucket gold',
    modelo:      'Antartica / Filippo / Culla',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/antartica-gold-1382.jpg',
    placeholder: false,
    precio_eur:  65.0,  // INTERNO
  },
  {
    id:          'mlg_524',
    sku:         'H.PBO22',
    barcode:     '8057014596854',
    name:        'Antartica ice bucket red',
    modelo:      'Antartica / Filippo / Culla',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/antartica-rosso-1378.jpg',
    placeholder: false,
    precio_eur:  52.03,  // INTERNO
  },
  {
    id:          'mlg_525',
    sku:         'H.PBO20',
    barcode:     '8057014596861',
    name:        'Antartica ice bucket clear',
    modelo:      'Antartica / Filippo / Culla',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/antartica-trasparente-1379.jpg',
    placeholder: false,
    precio_eur:  52.03,  // INTERNO
  },
  {
    id:          'mlg_526',
    sku:         'H.PBO21',
    barcode:     '8057014596878',
    name:        'Antartica ice bucket green',
    modelo:      'Antartica / Filippo / Culla',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/antartica-trasparente-1379.jpg',
    placeholder: false,
    precio_eur:  52.03,  // INTERNO
  },
  {
    id:          'mlg_527',
    sku:         'H.PBO6',
    barcode:     '8057014595550',
    name:        'Culla bucklet large green',
    modelo:      'Antartica / Filippo / Culla',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  33.28,  // INTERNO
  },
  {
    id:          'mlg_528',
    sku:         'H.PBO5',
    barcode:     '8057014595567',
    name:        'Culla bucklet large purple',
    modelo:      'Antartica / Filippo / Culla',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  33.28,  // INTERNO
  },
  {
    id:          'mlg_529',
    sku:         'H.PBO26',
    barcode:     '8057014598285',
    name:        'Filippo ice holder red',
    modelo:      'Antartica / Filippo / Culla',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/filippo-red-1384.jpg',
    placeholder: false,
    precio_eur:  33.88,  // INTERNO
  },
  {
    id:          'mlg_530',
    sku:         'H.PBO24',
    barcode:     '8057014598261',
    name:        'Filippo ice holder clear',
    modelo:      'Antartica / Filippo / Culla',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/filippo-clear-1383.jpg',
    placeholder: false,
    precio_eur:  33.88,  // INTERNO
  },
  {
    id:          'mlg_531',
    sku:         'H.PBO30',
    barcode:     '8057014598315',
    name:        'Filippo ice holder turquoise',
    modelo:      'Antartica / Filippo / Culla',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/filippo-turquoise-1385.jpg',
    placeholder: false,
    precio_eur:  33.88,  // INTERNO
  },
  {
    id:          'mlg_532',
    sku:         'H.PBO12',
    barcode:     '8057014596786',
    name:        'Ice bucket fuxia',
    modelo:      'Antartica / Filippo / Culla',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  22.99,  // INTERNO
  },
  {
    id:          'mlg_533',
    sku:         'H.PBO11',
    barcode:     '8057014596809',
    name:        'Ice bucket red',
    modelo:      'Antartica / Filippo / Culla',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  22.99,  // INTERNO
  },

  // 🔲 King / Queen Box  (0/15 con imagen)
  {
    id:          'mlg_678',
    sku:         'H.SCA.QUE14',
    barcode:     '8057014540499',
    name:        'King box black 24x30x11',
    modelo:      'King / Queen Box',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  151.25,  // INTERNO
  },
  {
    id:          'mlg_679',
    sku:         'H.SCA.QUE11',
    barcode:     '8057014540468',
    name:        'King box red 24x30x11',
    modelo:      'King / Queen Box',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  151.25,  // INTERNO
  },
  {
    id:          'mlg_680',
    sku:         'H.SCA.QUE15',
    barcode:     '8057014540505',
    name:        'King box royal blue 24x30x11',
    modelo:      'King / Queen Box',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  151.25,  // INTERNO
  },
  {
    id:          'mlg_681',
    sku:         'H.SCA.QUE12',
    barcode:     '8057014540475',
    name:        'King box clear 24x30x11',
    modelo:      'King / Queen Box',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  151.25,  // INTERNO
  },
  {
    id:          'mlg_682',
    sku:         'H.SCA.QUE13',
    barcode:     '8057014540482',
    name:        'King box green 24x30x11',
    modelo:      'King / Queen Box',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  151.25,  // INTERNO
  },
  {
    id:          'mlg_683',
    sku:         'H.SCA.QUE4',
    barcode:     '8057014540543',
    name:        'Prince box black 12x15x11',
    modelo:      'King / Queen Box',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  54.45,  // INTERNO
  },
  {
    id:          'mlg_684',
    sku:         'H.SCA.QUE1',
    barcode:     '8057014540512',
    name:        'Prince box red 12x15x11',
    modelo:      'King / Queen Box',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  54.45,  // INTERNO
  },
  {
    id:          'mlg_685',
    sku:         'H.SCA.QUE5',
    barcode:     '8057014540550',
    name:        'Prince box royal blue 12x15x11',
    modelo:      'King / Queen Box',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  54.45,  // INTERNO
  },
  {
    id:          'mlg_686',
    sku:         'H.SCA.QUE2',
    barcode:     '8057014540529',
    name:        'Prince box clear 12x15x11',
    modelo:      'King / Queen Box',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  54.45,  // INTERNO
  },
  {
    id:          'mlg_687',
    sku:         'H.SCA.QUE3',
    barcode:     '8057014540536',
    name:        'Prinec box green 12x15x11',
    modelo:      'King / Queen Box',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  54.45,  // INTERNO
  },
  {
    id:          'mlg_688',
    sku:         'H.SCA.QUE9',
    barcode:     '8057014540604',
    name:        'Queen box black 12x30x11',
    modelo:      'King / Queen Box',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  78.65,  // INTERNO
  },
  {
    id:          'mlg_689',
    sku:         'H.SCA.QUE6',
    barcode:     '8057014540574',
    name:        'Queen box red 12x30x11',
    modelo:      'King / Queen Box',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  78.65,  // INTERNO
  },
  {
    id:          'mlg_690',
    sku:         'H.SCA.QUE10',
    barcode:     '8057014540567',
    name:        'Queen box royal blue 12x30x11',
    modelo:      'King / Queen Box',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  78.65,  // INTERNO
  },
  {
    id:          'mlg_691',
    sku:         'H.SCA.QUE7',
    barcode:     '8057014540581',
    name:        'Queen box clear 12x30x11',
    modelo:      'King / Queen Box',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  78.65,  // INTERNO
  },
  {
    id:          'mlg_692',
    sku:         'H.SCA.QUE8',
    barcode:     '8057014540598',
    name:        'Queen box green 12x30x11',
    modelo:      'King / Queen Box',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  78.65,  // INTERNO
  },

  // ⚠️ Salome  (1/3 con imagen)
  {
    id:          'mlg_693',
    sku:         'H.SPE.SAL1',
    barcode:     '8057014599800',
    name:        'Salomè mirror clear',
    modelo:      'Salome',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/salome-clear-1372.jpg',
    placeholder: false,
    precio_eur:  181.5,  // INTERNO
  },
  {
    id:          'mlg_694',
    sku:         'H.SPE.SAL3',
    barcode:     '8057014599817',
    name:        'Salomè mirror gold',
    modelo:      'Salome',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  181.5,  // INTERNO
  },
  {
    id:          'mlg_695',
    sku:         'H.SPE.SAL4',
    barcode:     '8057014599824',
    name:        'Salomè mirror grey frost',
    modelo:      'Salome',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  181.5,  // INTERNO
  },

  // 🔲 Sputnik Hielera  (0/2 con imagen)
  {
    id:          'mlg_696',
    sku:         'H.SPU1',
    barcode:     '8057014544886',
    name:        'Sputnik ice bucket aquamarine',
    modelo:      'Sputnik Hielera',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  95.0,  // INTERNO
  },
  {
    id:          'mlg_697',
    sku:         'H.SPU3',
    barcode:     '8057014544893',
    name:        'Sputnik ice bucket white',
    modelo:      'Sputnik Hielera',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  95.0,  // INTERNO
  },

  // 🔲 James Table  (0/7 con imagen)
  {
    id:          'mlg_698',
    sku:         'H.TAB15',
    barcode:     '8057014545074',
    name:        'JAMES NEW TABLE ACRYLIC BLUE',
    modelo:      'James Table',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  284.0,  // INTERNO
  },
  {
    id:          'mlg_699',
    sku:         'H.TAB17',
    barcode:     '8057014545098',
    name:        'JAMES NEW TABLE ACRYLIC GREY',
    modelo:      'James Table',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  284.0,  // INTERNO
  },
  {
    id:          'mlg_700',
    sku:         'H.TAB12',
    barcode:     '8057014545043',
    name:        'JAMES NEW TABLE ACRYLIC RATTAN',
    modelo:      'James Table',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  352.0,  // INTERNO
  },
  {
    id:          'mlg_701',
    sku:         'H.TAB16',
    barcode:     '8057014545081',
    name:        'JAMES NEW TABLE ACRYLIC RED',
    modelo:      'James Table',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  284.0,  // INTERNO
  },
  {
    id:          'mlg_702',
    sku:         'H.TAB14',
    barcode:     '8057014545067',
    name:        'JAMES NEW TABLE ACRYLIC CLEAR',
    modelo:      'James Table',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  284.0,  // INTERNO
  },
  {
    id:          'mlg_703',
    sku:         'H.TAB18',
    barcode:     '8057014545197',
    name:        'JAMES NEW TABLE ACRYLIC GREEN',
    modelo:      'James Table',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  284.0,  // INTERNO
  },
  {
    id:          'mlg_704',
    sku:         'H.TAB13',
    barcode:     '8057014545050',
    name:        'JAMES NEW TABLE ACRYLIC GLASS',
    modelo:      'James Table',
    familia:     'LAMPARAS & DECO',
    image:       'images/products/placeholder.jpg',  // ← PENDIENTE
    placeholder: true,
    precio_eur:  284.0,  // INTERNO
  },

];

// Totales al cierre de sprint:
// 749 SKUs · 284 con imagen (37%) · 465 pendientes (62%)

if (typeof module !== "undefined") module.exports = { MLG_CATALOG };