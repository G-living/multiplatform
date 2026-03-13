/* ===================================================================
 * BODAS - Google Apps Script Backend v2
 * Lista de Bodas · Arte de la Mesa · G-Living
 * v2.1 — 2026
 * ===================================================================
 *
 * HOJA DE CÁLCULO:
 *   https://docs.google.com/spreadsheets/d/1ZUnUzQ8V_rpXjsY43VRUsi7ag2l88pUHMKk--HbscrI
 *
 * HOJAS REQUERIDAS:
 *
 *   📋 Usuarios (23 cols A–W)
 *      A:username | B:passwordHash | C:coupleName | D:active | E:createdAt
 *      F:fecha_boda | G:fecha_apertura_lista | H:fecha_cierre_lista
 *      I:nombre_el | J:apellido_el | K:id_cc_el | L:telefono_el | M:email_el
 *      N:nombre_ella | O:apellido_ella | P:id_cc_ella | Q:telefono_ella | R:email_ella
 *      S:direccion_entrega | T:fecha_ultimo_cambio | U:invitado_user | V:invitado_passHash
 *      W:estado_lista  → dropdown ACTIVA / BLOQUEADA (Filippo lo cambia manualmente)
 *      → Cols A–H y U–W: Filippo inserta/gestiona manualmente
 *      → Cols I–S: la pareja actualiza vía formulario / botón flotante ✏️
 *      → Col T: sistema actualiza automáticamente al guardar wishlist
 *
 *   🔑 Sesiones (5 cols)
 *      A:token | B:username | C:coupleName | D:createdAt | E:expiresAt
 *
 *   ❤️ ListaBodas (13 cols)
 *      A:token | B:coupleName | C:brand | D:productId | E:productName
 *      F:variantSku | G:variantLabel | H:precio_cop | I:qty | J:addedAt | K:total_cop
 *      L:accion (agregado/removido) | M:timestamp_accion
 *
 *   🎁 PagosInvitados (12 cols)
 *      A:pagoId | B:coupleUsername | C:coupleName | D:invitado_user | E:nombreInvitado
 *      F:productId | G:variantSku | H:productName | I:qty | J:precio_cop
 *      K:wompiReference | L:timestamp
 *
 *   👤 Invitados (9 cols)  ← datos para facturación y cross-selling
 *      A:invitado_user | B:nombre | C:apellido | D:id_cc | E:telefono
 *      F:email | G:direccion | H:createdAt | I:updatedAt
 *      → Se completa en el formulario de registro al primer acceso del invitado
 *
 * API TOKEN: bodas-GLv2-XkP9mTqR7hNwJ3sE
 *   Todos los requests deben incluir: { _token: '...', action: '...', ... }
 *
 * DESPLIEGUE:
 *   1. Extensiones → Apps Script → pegar este código
 *   2. Implementar → Nueva implementación → Aplicación web
 *   3. Ejecutar como: yo mismo · Acceso: Cualquier persona
 *   4. Copiar URL → bodas-config.js → GAS_URL
 * =================================================================== */

'use strict';

// ── CONFIGURACIÓN ─────────────────────────────────────────────────────────────

const CFG_BODAS = {
  SHEET_ID:       '1ZUnUzQ8V_rpXjsY43VRUsi7ag2l88pUHMKk--HbscrI',
  SESSION_TTL_H:  72,
  CORS_ORIGIN:    'https://g-living.github.io',
  API_TOKEN:      'bodas-GLv2-XkP9mTqR7hNwJ3sE',
  SHEET_USUARIOS: 'Usuarios',
  SHEET_SESIONES: 'Sesiones',
  SHEET_LISTA:    'ListaBodas',
  SHEET_PAGOS:    'PagosInvitados',
  SHEET_INVITADOS:'Invitados',
  EMAIL_FILIPPO:  'filippo.massara2016@gmail.com',
  TZ_BOGOTA:      'America/Bogota',
};

// Índices de columna (base 0) — hoja Usuarios
const COL_USR = {
  USERNAME:       0,
  PASSWORD_HASH:  1,
  COUPLE_NAME:    2,
  ACTIVE:         3,
  CREATED_AT:     4,
  FECHA_BODA:     5,
  FECHA_APERTURA: 6,
  FECHA_CIERRE:   7,
  NOMBRE_EL:      8,
  APELLIDO_EL:    9,
  ID_CC_EL:       10,
  TEL_EL:         11,
  EMAIL_EL:       12,
  NOMBRE_ELLA:    13,
  APELLIDO_ELLA:  14,
  ID_CC_ELLA:     15,
  TEL_ELLA:       16,
  EMAIL_ELLA:     17,
  DIRECCION:        18,
  FECHA_CAMBIO:     19,
  INVITADO_USER:    20,
  INVITADO_PASS:    21,
  ESTADO_LISTA:     22,
  HISTORIAL_CAMBIOS:23,  // col X — acumula diffs "timestamp: campo: viejo→nuevo"
};

// Índices de columna (base 0) — hoja ListaBodas
const COL_LISTA = {
  TOKEN:            0,
  COUPLE_NAME:      1,
  BRAND:            2,
  PRODUCT_ID:       3,
  PRODUCT_NAME:     4,
  VARIANT_SKU:      5,
  VARIANT_LABEL:    6,
  PRECIO_COP:       7,
  QTY:              8,
  ADDED_AT:         9,
  TOTAL_COP:        10,
  ACCION:           11,
  TIMESTAMP_ACCION: 12,
};

// ── UTILIDADES ────────────────────────────────────────────────────────────────

function _sha256_(text) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    text,
    Utilities.Charset.UTF_8
  );
  return bytes.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

/** Timestamp actual formateado en zona horaria de Bogotá */
function _nowBogota_() {
  return Utilities.formatDate(new Date(), CFG_BODAS.TZ_BOGOTA, 'yyyy-MM-dd HH:mm:ss');
}

/** Comparación de cadenas normalizada: trim + lowercase */
function _normalizedEquals_(a, b) {
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

/** Valida que el token de invitado tenga el prefijo G- */
function _validateGuestToken_(guestToken) {
  if (!guestToken || !guestToken.startsWith('G-')) {
    return { success: false, error: 'Sesión de invitado no válida' };
  }
  return null;
}

function _corsHeaders_() {
  return {
    'Access-Control-Allow-Origin':  CFG_BODAS.CORS_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function _respond_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── ROUTER PRINCIPAL ──────────────────────────────────────────────────────────

function doPost(e) {
  const cors = _corsHeaders_();
  try {
    const body   = JSON.parse(e.postData.contents);
    const action = body.action || '';

    if (body._token !== CFG_BODAS.API_TOKEN) {
      return _respond_({ success: false, error: 'No autorizado' }, cors);
    }

    let result;
    switch (action) {
      case 'login':                 result = _login_(body.username, body.password);                              break;
      case 'validate':              result = _validateSession_(body.token);                                      break;
      case 'logout':                result = _logout_(body.token);                                               break;
      case 'saveCart':              result = _saveCart_(body.token, body.items);                                 break;
      case 'getCart':               result = _getCart_(body.token);                                              break;
      case 'clearCart':             result = _clearCart_(body.token);                                            break;
      case 'updateProfile':         result = _updateProfile_(body.token, body.profile);                         break;
      case 'loginGuest':            result = _loginGuest_(body.invitado_user, body.password);                   break;
      case 'getGuestList':          result = _getGuestList_(body.invitado_user, body.guestToken);               break;
      case 'createPedidoInvitado':  result = _createPedidoInvitado_(body.guestToken, body.pedido);             break;
      case 'confirmarPagoInvitado': result = _confirmarPagoInvitado_(body.pagoId, body.wompiRef);              break;
      case 'saveGuestProfile':      result = _saveGuestProfile_(body.invitado_user, body.guestToken, body.profile); break;
      case 'getGuestProfile':       result = _getGuestProfile_(body.invitado_user, body.guestToken);           break;
      default:                      result = { success: false, error: 'Acción no reconocida: ' + action };
    }

    return _respond_(result, cors);
  } catch (err) {
    return _respond_({ success: false, error: 'Error interno: ' + err.message }, cors);
  }
}

function doGet(e) {
  return _respond_({ ok: true, service: 'bodas-backend', version: '2.1' }, _corsHeaders_());
}

// ── AUTH: LOGIN ───────────────────────────────────────────────────────────────

function _login_(username, password) {
  if (!username || !password) {
    return { success: false, error: 'Usuario y contraseña son requeridos' };
  }

  const ss    = SpreadsheetApp.openById(CFG_BODAS.SHEET_ID);
  const sheet = ss.getSheetByName(CFG_BODAS.SHEET_USUARIOS);
  if (!sheet) return { success: false, error: 'Hoja Usuarios no encontrada' };

  const data = sheet.getDataRange().getValues();
  const hash = _sha256_(password);

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!_normalizedEquals_(row[COL_USR.USERNAME], username)) continue;
    if (String(row[COL_USR.PASSWORD_HASH]).trim() !== hash)   continue;

    const isActive   = (row[COL_USR.ACTIVE] === true || String(row[COL_USR.ACTIVE]).toUpperCase() === 'TRUE');
    const token      = Utilities.getUuid();
    const now        = new Date();
    const exp        = new Date(now.getTime() + CFG_BODAS.SESSION_TTL_H * 3600 * 1000);

    const sesSheet = ss.getSheetByName(CFG_BODAS.SHEET_SESIONES);
    if (sesSheet) {
      sesSheet.appendRow([token, String(row[COL_USR.USERNAME]), String(row[COL_USR.COUPLE_NAME]),
                          now.toISOString(), exp.toISOString()]);
    }

    return {
      success:         true,
      token:           token,
      username:        String(row[COL_USR.USERNAME]),
      coupleName:      String(row[COL_USR.COUPLE_NAME]),
      expiresAt:       exp.toISOString(),
      profileComplete: !!String(row[COL_USR.NOMBRE_EL] || '').trim(),
      profile:         _rowToProfile_(row),
      restricted:      !isActive,
    };
  }

  return { success: false, error: 'Usuario o contraseña incorrectos' };
}

// ── AUTH: VALIDATE SESSION ────────────────────────────────────────────────────

function _validateSession_(token) {
  if (!token) return { success: false, error: 'Token requerido' };

  const ss    = SpreadsheetApp.openById(CFG_BODAS.SHEET_ID);
  const sheet = ss.getSheetByName(CFG_BODAS.SHEET_SESIONES);
  if (!sheet) return { success: false, error: 'Sin sesiones activas' };

  const data = sheet.getDataRange().getValues();
  const now  = new Date();

  for (let i = 1; i < data.length; i++) {
    const [sToken, sUser, sCouple, , sExp] = data[i];
    if (String(sToken).trim() !== String(token).trim()) continue;
    if (new Date(sExp) > now) {
      const extra = _getProfileByUsername_(ss, String(sUser));
      return { success: true, username: String(sUser), coupleName: String(sCouple), ...extra };
    }
    return { success: false, error: 'Sesión expirada. Por favor inicia sesión nuevamente.' };
  }

  return { success: false, error: 'Sesión no encontrada' };
}

function _getProfileByUsername_(ss, username) {
  const sheet = ss.getSheetByName(CFG_BODAS.SHEET_USUARIOS);
  if (!sheet) return {};
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (!_normalizedEquals_(data[i][COL_USR.USERNAME], username)) continue;
    return {
      profileComplete: !!String(data[i][COL_USR.NOMBRE_EL] || '').trim(),
      profile:         _rowToProfile_(data[i]),
    };
  }
  return {};
}

function _rowToProfile_(row) {
  return {
    fecha_boda:           String(row[COL_USR.FECHA_BODA]     || ''),
    fecha_apertura_lista: String(row[COL_USR.FECHA_APERTURA] || ''),
    fecha_cierre_lista:   String(row[COL_USR.FECHA_CIERRE]   || ''),
    nombre_el:            String(row[COL_USR.NOMBRE_EL]      || ''),
    apellido_el:          String(row[COL_USR.APELLIDO_EL]    || ''),
    id_cc_el:             String(row[COL_USR.ID_CC_EL]       || ''),
    telefono_el:          String(row[COL_USR.TEL_EL]         || ''),
    email_el:             String(row[COL_USR.EMAIL_EL]       || ''),
    nombre_ella:          String(row[COL_USR.NOMBRE_ELLA]    || ''),
    apellido_ella:        String(row[COL_USR.APELLIDO_ELLA]  || ''),
    id_cc_ella:           String(row[COL_USR.ID_CC_ELLA]     || ''),
    telefono_ella:        String(row[COL_USR.TEL_ELLA]       || ''),
    email_ella:           String(row[COL_USR.EMAIL_ELLA]     || ''),
    direccion_entrega:    String(row[COL_USR.DIRECCION]      || ''),
    fecha_ultimo_cambio:  String(row[COL_USR.FECHA_CAMBIO]   || ''),
  };
}

// ── AUTH: LOGOUT ──────────────────────────────────────────────────────────────

function _logout_(token) {
  if (!token) return { success: true };
  const ss    = SpreadsheetApp.openById(CFG_BODAS.SHEET_ID);
  const sheet = ss.getSheetByName(CFG_BODAS.SHEET_SESIONES);
  if (!sheet) return { success: true };
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(token).trim()) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  return { success: true };
}

// ── PERFIL: ACTUALIZAR ────────────────────────────────────────────────────────

function _updateProfile_(token, profile) {
  const validation = _validateSession_(token);
  if (!validation.success) return validation;
  if (!profile || typeof profile !== 'object') {
    return { success: false, error: 'Datos de perfil requeridos' };
  }

  const ss    = SpreadsheetApp.openById(CFG_BODAS.SHEET_ID);
  const sheet = ss.getSheetByName(CFG_BODAS.SHEET_USUARIOS);
  if (!sheet) return { success: false, error: 'Hoja Usuarios no encontrada' };

  const FIELD_MAP = [
    ['nombre_el',         COL_USR.NOMBRE_EL],
    ['apellido_el',       COL_USR.APELLIDO_EL],
    ['id_cc_el',          COL_USR.ID_CC_EL],
    ['telefono_el',       COL_USR.TEL_EL],
    ['email_el',          COL_USR.EMAIL_EL],
    ['nombre_ella',       COL_USR.NOMBRE_ELLA],
    ['apellido_ella',     COL_USR.APELLIDO_ELLA],
    ['id_cc_ella',        COL_USR.ID_CC_ELLA],
    ['telefono_ella',     COL_USR.TEL_ELLA],
    ['email_ella',        COL_USR.EMAIL_ELLA],
    ['direccion_entrega', COL_USR.DIRECCION],
  ];

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (!_normalizedEquals_(data[i][COL_USR.USERNAME], validation.username)) continue;

    const row = data[i];
    const now = _nowBogota_();

    // Calcular diff campo por campo
    const diffs = [];
    for (const [key, colIdx] of FIELD_MAP) {
      const oldVal = String(row[colIdx] || '').trim();
      const newVal = String(profile[key] || '').trim();
      if (oldVal !== newVal) diffs.push(key + ': "' + oldVal + '"→"' + newVal + '"');
    }

    // Cols I–S (11 campos) + FECHA_CAMBIO = 12 valores en lote
    sheet.getRange(i + 1, COL_USR.NOMBRE_EL + 1, 1, 12).setValues([[
      profile.nombre_el         || '',
      profile.apellido_el       || '',
      profile.id_cc_el          || '',
      profile.telefono_el       || '',
      profile.email_el          || '',
      profile.nombre_ella       || '',
      profile.apellido_ella     || '',
      profile.id_cc_ella        || '',
      profile.telefono_ella     || '',
      profile.email_ella        || '',
      profile.direccion_entrega || '',
      now,                             // FECHA_CAMBIO (col T)
    ]]);

    // Acumular historial en col X si hubo cambios
    if (diffs.length) {
      const prevHist  = String(row[COL_USR.HISTORIAL_CAMBIOS] || '').trim();
      const newEntry  = '[' + now + '] ' + diffs.join(' | ');
      const newHist   = prevHist ? prevHist + '\n' + newEntry : newEntry;
      sheet.getRange(i + 1, COL_USR.HISTORIAL_CAMBIOS + 1).setValue(newHist);
    }

    return { success: true };
  }
  return { success: false, error: 'Usuario no encontrado' };
}

// ── LISTA DE BODAS: GUARDAR ───────────────────────────────────────────────────

function _saveCart_(token, items) {
  const validation = _validateSession_(token);
  if (!validation.success) return validation;
  if (!Array.isArray(items)) return { success: false, error: 'items debe ser un array' };

  const ss    = SpreadsheetApp.openById(CFG_BODAS.SHEET_ID);
  const sheet = ss.getSheetByName(CFG_BODAS.SHEET_LISTA);
  if (!sheet) return { success: false, error: 'Hoja ListaBodas no encontrada' };

  const isFirstSend = !validation.profile || !validation.profile.fecha_ultimo_cambio;
  const coupleName  = validation.coupleName || '';
  const total_cop   = items.reduce((s, it) => s + (it.precio_cop || 0) * (it.qty || 1), 0);
  const now         = _nowBogota_();

  // Mapa de filas activas: variantSku → número de fila (1-based)
  const allData    = sheet.getDataRange().getValues();
  const activeRows = {};
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][COL_LISTA.TOKEN]).trim() !== String(token).trim()) continue;
    const sku    = String(allData[i][COL_LISTA.VARIANT_SKU] || '').trim();
    const accion = String(allData[i][COL_LISTA.ACCION]      || '').trim();
    if (accion !== 'removido') activeRows[sku] = i + 1;
  }

  const newSkus = new Set(items.map(it => String(it.variantSku || '').trim()));

  // Marcar removidos (lote de 2 celdas por fila)
  for (const [sku, rowNum] of Object.entries(activeRows)) {
    if (!newSkus.has(sku)) {
      sheet.getRange(rowNum, COL_LISTA.ACCION + 1, 1, 2).setValues([['removido', now]]);
    }
  }

  // Actualizar activos o agregar nuevos
  for (const item of items) {
    const sku = String(item.variantSku || '').trim();
    if (activeRows[sku]) {
      sheet.getRange(activeRows[sku], COL_LISTA.QTY              + 1).setValue(item.qty || 1);
      sheet.getRange(activeRows[sku], COL_LISTA.TIMESTAMP_ACCION + 1).setValue(now);
    } else {
      sheet.appendRow([
        token,
        coupleName,
        item.brand        || '',
        item.productId    || '',
        item.productName  || '',
        item.variantSku   || '',
        item.variantLabel || '',
        item.precio_cop   || 0,
        item.qty          || 1,
        now,         // addedAt
        total_cop,   // total_cop
        'agregado',  // accion
        now,         // timestamp_accion
      ]);
    }
  }

  // Actualizar fecha_ultimo_cambio en Usuarios (col T)
  const usrSheet = ss.getSheetByName(CFG_BODAS.SHEET_USUARIOS);
  let profileData = validation.profile || {};
  if (usrSheet) {
    const usrData = usrSheet.getDataRange().getValues();
    for (let i = 1; i < usrData.length; i++) {
      if (!_normalizedEquals_(usrData[i][COL_USR.USERNAME], validation.username)) continue;
      usrSheet.getRange(i + 1, COL_USR.FECHA_CAMBIO + 1).setValue(now);
      profileData = _rowToProfile_(usrData[i]);
      profileData.fecha_ultimo_cambio = now;
      break;
    }
  }

  try { _enviarEmailPareja_(isFirstSend, coupleName, profileData, items, total_cop, now); }
  catch (err) { Logger.log('Email pareja error: ' + err.message); }
  try { _enviarEmailFilippo_(coupleName, profileData, items, total_cop, now); }
  catch (err) { Logger.log('Email Filippo error: ' + err.message); }

  return { success: true, saved: items.length, fecha_ultimo_cambio: now };
}

// ── LISTA DE BODAS: OBTENER ───────────────────────────────────────────────────

function _getCart_(token) {
  const validation = _validateSession_(token);
  if (!validation.success) return validation;

  const ss    = SpreadsheetApp.openById(CFG_BODAS.SHEET_ID);
  const sheet = ss.getSheetByName(CFG_BODAS.SHEET_LISTA);
  if (!sheet) return { success: true, items: [] };

  const data  = sheet.getDataRange().getValues();
  const items = [];
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][COL_LISTA.TOKEN]).trim() !== String(token).trim()) continue;
    if (String(data[i][COL_LISTA.ACCION] || '').trim() === 'removido')    continue;
    items.push({
      brand:        data[i][COL_LISTA.BRAND],
      productId:    data[i][COL_LISTA.PRODUCT_ID],
      productName:  data[i][COL_LISTA.PRODUCT_NAME],
      variantSku:   data[i][COL_LISTA.VARIANT_SKU],
      variantLabel: data[i][COL_LISTA.VARIANT_LABEL],
      precio_cop:   data[i][COL_LISTA.PRECIO_COP],
      qty:          data[i][COL_LISTA.QTY],
    });
  }
  return { success: true, items };
}

function _clearCart_(token) {
  return _saveCart_(token, []);
}

// ── EMAILS ────────────────────────────────────────────────────────────────────

function _buildWishlistHtml_(items, total_cop) {
  let rows = '';
  for (const it of items) {
    const subtotal = (it.precio_cop || 0) * (it.qty || 1);
    rows += `<tr>
      <td style="padding:6px 8px;border-bottom:1px solid #f0e8e0">${it.productName || ''}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f0e8e0;text-align:center">${it.variantLabel || ''}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f0e8e0;text-align:center">${it.qty || 1}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f0e8e0;text-align:right">$${Number(it.precio_cop || 0).toLocaleString('es-CO')}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f0e8e0;text-align:right">$${Number(subtotal).toLocaleString('es-CO')}</td>
    </tr>`;
  }
  return `<table style="width:100%;border-collapse:collapse;font-family:Georgia,serif;font-size:13px">
    <thead>
      <tr style="background:#8b6f5e;color:#fff">
        <th style="padding:8px;text-align:left">Producto</th>
        <th style="padding:8px;text-align:center">Variante</th>
        <th style="padding:8px;text-align:center">Cant.</th>
        <th style="padding:8px;text-align:right">Precio unit.</th>
        <th style="padding:8px;text-align:right">Subtotal</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr style="background:#f5ede8;font-weight:bold">
        <td colspan="4" style="padding:8px;text-align:right">TOTAL COP</td>
        <td style="padding:8px;text-align:right">$${Number(total_cop).toLocaleString('es-CO')}</td>
      </tr>
    </tfoot>
  </table>`;
}

function _enviarEmailPareja_(isFirstSend, coupleName, p, items, total_cop, fechaCambio) {
  const emails = [p.email_el, p.email_ella].filter(e => e && e.includes('@'));
  if (!emails.length) return;

  let subject, intro;
  if (isFirstSend) {
    subject = '¡Bienvenidos a G-Living! Su lista de bodas fue enviada con éxito 🌸';
    intro = `<p style="font-size:16px;line-height:1.8;color:#5a3e35">
      Queridos <strong>${coupleName}</strong>,<br><br>
      Nos llena el corazón darles la bienvenida al mundo de <strong>G-Living</strong>.
      Gracias por habernos escogido para acompañarles en esta etapa tan especial e irrepetible —
      es un honor y un privilegio ser parte de su historia.<br><br>
      Su lista de bodas ha sido registrada exitosamente. A continuación encontrarán el detalle
      de los productos seleccionados. Recuerden que podrán realizar ajustes en cualquier momento.
    </p>`;
  } else {
    subject = 'G-Living · Sus cambios en la lista de bodas han sido guardados';
    intro = `<p style="font-size:16px;line-height:1.8;color:#5a3e35">
      Queridos <strong>${coupleName}</strong>,<br><br>
      Los cambios en su lista de bodas han sido guardados exitosamente.
      A continuación encontrarán la selección actualizada.
      Quedamos atentos a cualquier inquietud — siempre es un placer atenderles.<br><br>
      <strong>Fecha del último cambio:</strong> ${fechaCambio}
    </p>`;
  }

  const html = `
    <div style="max-width:640px;margin:0 auto;font-family:Georgia,serif;background:#fffaf7;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
      <div style="background:#8b6f5e;padding:28px 32px;text-align:center">
        <h1 style="color:#fff;font-size:22px;margin:0;letter-spacing:2px">G-LIVING</h1>
        <p style="color:#f5ede8;margin:6px 0 0;font-size:13px;letter-spacing:1px">ARTE DE LA MESA</p>
      </div>
      <div style="padding:32px">
        ${intro}
        <h3 style="color:#8b6f5e;border-bottom:1px solid #f0e8e0;padding-bottom:8px;margin-top:28px">Su Lista de Bodas</h3>
        ${_buildWishlistHtml_(items, total_cop)}
        <p style="margin-top:28px;font-size:13px;color:#9e8a7e;text-align:center;line-height:1.6">
          Con todo el cariño y dedicación,<br>
          <strong style="color:#8b6f5e">El equipo G-Living · Arte de la Mesa</strong>
        </p>
      </div>
    </div>`;

  MailApp.sendEmail({ to: emails.join(','), subject: subject, htmlBody: html });
}

function _enviarEmailFilippo_(coupleName, p, items, total_cop, fechaCambio) {
  const subject = `Lista Bodas: ${coupleName} — ${fechaCambio}`;
  const html = `
    <div style="max-width:640px;margin:0 auto;font-family:Arial,sans-serif;background:#fff">
      <h2 style="color:#8b6f5e;border-bottom:2px solid #f0e8e0;padding-bottom:8px">Lista de Bodas: ${coupleName}</h2>
      <h3 style="color:#5a3e35">Datos de la Pareja</h3>
      <table style="font-size:13px;border-collapse:collapse;width:100%;margin-bottom:16px">
        <tr style="background:#faf5f2"><td style="padding:5px 10px;color:#888;font-weight:bold;width:100px">ÉL</td>
          <td style="padding:5px 10px">${p.nombre_el} ${p.apellido_el} &nbsp;·&nbsp; CC ${p.id_cc_el} &nbsp;·&nbsp; Tel ${p.telefono_el} &nbsp;·&nbsp; ${p.email_el}</td></tr>
        <tr><td style="padding:5px 10px;color:#888;font-weight:bold">ELLA</td>
          <td style="padding:5px 10px">${p.nombre_ella} ${p.apellido_ella} &nbsp;·&nbsp; CC ${p.id_cc_ella} &nbsp;·&nbsp; Tel ${p.telefono_ella} &nbsp;·&nbsp; ${p.email_ella}</td></tr>
        <tr style="background:#faf5f2"><td style="padding:5px 10px;color:#888;font-weight:bold">Entrega</td>
          <td style="padding:5px 10px">${p.direccion_entrega}</td></tr>
        <tr><td style="padding:5px 10px;color:#888;font-weight:bold">Fecha Boda</td>
          <td style="padding:5px 10px">${p.fecha_boda}</td></tr>
        <tr style="background:#faf5f2"><td style="padding:5px 10px;color:#888;font-weight:bold">Cierre Lista</td>
          <td style="padding:5px 10px">${p.fecha_cierre_lista}</td></tr>
        <tr><td style="padding:5px 10px;color:#888;font-weight:bold">Último Cambio</td>
          <td style="padding:5px 10px"><strong>${fechaCambio}</strong></td></tr>
      </table>
      <h3 style="color:#5a3e35">Wishlist</h3>
      ${_buildWishlistHtml_(items, total_cop)}
    </div>`;
  MailApp.sendEmail({ to: CFG_BODAS.EMAIL_FILIPPO, subject: subject, htmlBody: html });
}

// ── INVITADOS: LOGIN ──────────────────────────────────────────────────────────

function _loginGuest_(invitado_user, password) {
  if (!invitado_user || !password) {
    return { success: false, error: 'Usuario y contraseña son requeridos' };
  }

  const ss    = SpreadsheetApp.openById(CFG_BODAS.SHEET_ID);
  const sheet = ss.getSheetByName(CFG_BODAS.SHEET_USUARIOS);
  if (!sheet) return { success: false, error: 'Configuración no disponible' };

  const data = sheet.getDataRange().getValues();
  const hash = _sha256_(password);

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!_normalizedEquals_(row[COL_USR.INVITADO_USER], invitado_user)) continue;
    if (String(row[COL_USR.INVITADO_PASS]).trim() !== hash)              continue;

    const guestToken = 'G-' + Utilities.getUuid();
    const info       = _getGuestProfileInfo_(ss, String(row[COL_USR.INVITADO_USER]));
    return {
      success:         true,
      guestToken:      guestToken,
      coupleUsername:  String(row[COL_USR.USERNAME]),
      coupleName:      String(row[COL_USR.COUPLE_NAME]),
      fecha_boda:      String(row[COL_USR.FECHA_BODA] || ''),
      invitado_user:   String(row[COL_USR.INVITADO_USER]),
      profileComplete: info.complete,
      profile:         info.profile,
    };
  }

  return { success: false, error: 'Acceso no válido' };
}

// ── INVITADOS: PERFIL (DATOS PARA FACTURACIÓN Y CROSS-SELLING) ───────────────

/**
 * Busca el perfil de un invitado en la hoja Invitados.
 * Retorna { complete, profile } en una sola pasada — evita doble lectura de hoja.
 */
function _getGuestProfileInfo_(ss, invitado_user) {
  const sheet = ss.getSheetByName(CFG_BODAS.SHEET_INVITADOS);
  if (!sheet) return { complete: false, profile: null };

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (!_normalizedEquals_(data[i][0], invitado_user)) continue;
    const nombre = String(data[i][1] || '').trim();
    if (!nombre) return { complete: false, profile: null };
    return {
      complete: true,
      profile: {
        nombre:    nombre,
        apellido:  String(data[i][2] || ''),
        id_cc:     String(data[i][3] || ''),
        telefono:  String(data[i][4] || ''),
        email:     String(data[i][5] || ''),
        direccion: String(data[i][6] || ''),
      },
    };
  }
  return { complete: false, profile: null };
}

function _saveGuestProfile_(invitado_user, guestToken, profile) {
  const tokenErr = _validateGuestToken_(guestToken);
  if (tokenErr) return tokenErr;
  if (!profile || !profile.nombre || !profile.apellido || !profile.id_cc || !profile.email) {
    return { success: false, error: 'Nombre, apellido, cédula y email son obligatorios' };
  }

  const ss  = SpreadsheetApp.openById(CFG_BODAS.SHEET_ID);
  let sheet = ss.getSheetByName(CFG_BODAS.SHEET_INVITADOS);
  if (!sheet) { setupSheets(); sheet = ss.getSheetByName(CFG_BODAS.SHEET_INVITADOS); }

  const now  = _nowBogota_();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (!_normalizedEquals_(data[i][0], invitado_user)) continue;
    sheet.getRange(i + 1, 2, 1, 8).setValues([[
      profile.nombre    || '',
      profile.apellido  || '',
      profile.id_cc     || '',
      profile.telefono  || '',
      profile.email     || '',
      profile.direccion || '',
      data[i][7],  // createdAt: no tocar
      now,         // updatedAt
    ]]);
    return { success: true, updated: true };
  }

  sheet.appendRow([
    String(invitado_user).trim(),
    profile.nombre    || '',
    profile.apellido  || '',
    profile.id_cc     || '',
    profile.telefono  || '',
    profile.email     || '',
    profile.direccion || '',
    now,  // createdAt
    now,  // updatedAt
  ]);
  return { success: true, updated: false };
}

function _getGuestProfile_(invitado_user, guestToken) {
  const tokenErr = _validateGuestToken_(guestToken);
  if (tokenErr) return tokenErr;
  const ss   = SpreadsheetApp.openById(CFG_BODAS.SHEET_ID);
  const info = _getGuestProfileInfo_(ss, invitado_user);
  return { success: true, profileComplete: info.complete, profile: info.profile };
}

// ── INVITADOS: VER LISTA ──────────────────────────────────────────────────────

function _getGuestList_(invitado_user, guestToken) {
  const tokenErr = _validateGuestToken_(guestToken);
  if (tokenErr) return tokenErr;

  const ss    = SpreadsheetApp.openById(CFG_BODAS.SHEET_ID);
  const usrSh = ss.getSheetByName(CFG_BODAS.SHEET_USUARIOS);
  if (!usrSh) return { success: false, error: 'Configuración no disponible' };

  let coupleName = null;
  const usrData  = usrSh.getDataRange().getValues();
  for (let i = 1; i < usrData.length; i++) {
    if (!_normalizedEquals_(usrData[i][COL_USR.INVITADO_USER], invitado_user)) continue;
    const estadoLista = String(usrData[i][COL_USR.ESTADO_LISTA] || 'ACTIVA').trim().toUpperCase();
    if (estadoLista === 'BLOQUEADA') {
      return { success: false, error: 'La lista de bodas no está disponible en este momento.' };
    }
    coupleName = String(usrData[i][COL_USR.COUPLE_NAME]);
    break;
  }
  if (!coupleName) return { success: false, error: 'Lista no encontrada' };

  const listSh = ss.getSheetByName(CFG_BODAS.SHEET_LISTA);
  if (!listSh) return { success: true, coupleName, items: [] };

  // Construir mapa de reservas una sola vez (evita N+1 lecturas)
  const reservasMap = {};
  const pagosSh = ss.getSheetByName(CFG_BODAS.SHEET_PAGOS);
  if (pagosSh) {
    const pagosData = pagosSh.getDataRange().getValues();
    for (let i = 1; i < pagosData.length; i++) {
      const key = String(pagosData[i][5]) + '|' + String(pagosData[i][6]);
      reservasMap[key] = (reservasMap[key] || 0) + Number(pagosData[i][8] || 0);
    }
  }

  const listData = listSh.getDataRange().getValues();
  const items    = [];
  for (let i = 1; i < listData.length; i++) {
    if (String(listData[i][COL_LISTA.COUPLE_NAME]).trim() !== coupleName.trim()) continue;
    if (String(listData[i][COL_LISTA.ACCION] || '').trim() === 'removido')       continue;
    const productId  = listData[i][COL_LISTA.PRODUCT_ID];
    const variantSku = listData[i][COL_LISTA.VARIANT_SKU];
    items.push({
      brand:        listData[i][COL_LISTA.BRAND],
      productId:    productId,
      productName:  listData[i][COL_LISTA.PRODUCT_NAME],
      variantSku:   variantSku,
      variantLabel: listData[i][COL_LISTA.VARIANT_LABEL],
      precio_cop:   listData[i][COL_LISTA.PRECIO_COP],
      qty:          listData[i][COL_LISTA.QTY],
      reservadas:   reservasMap[String(productId) + '|' + String(variantSku)] || 0,
    });
  }

  return { success: true, coupleName, items };
}

// ── INVITADOS: CREAR PEDIDO ───────────────────────────────────────────────────

function _createPedidoInvitado_(guestToken, pedido) {
  const tokenErr = _validateGuestToken_(guestToken);
  if (tokenErr) return tokenErr;
  if (!pedido || !pedido.coupleUsername) {
    return { success: false, error: 'Datos del pedido incompletos' };
  }

  const ss    = SpreadsheetApp.openById(CFG_BODAS.SHEET_ID);
  const sheet = ss.getSheetByName(CFG_BODAS.SHEET_PAGOS);
  if (!sheet) return { success: false, error: 'Hoja PagosInvitados no encontrada' };

  const pagoId = 'PG-' + Utilities.getUuid().split('-')[0].toUpperCase();

  sheet.appendRow([
    pagoId,
    pedido.coupleUsername || '',
    pedido.coupleName     || '',
    pedido.invitado_user  || '',
    pedido.nombreInvitado || '',
    pedido.productId      || '',
    pedido.variantSku     || '',
    pedido.productName    || '',
    pedido.qty            || 1,
    pedido.precio_cop     || 0,
    '',               // wompiReference — se completa al confirmar pago
    _nowBogota_(),
  ]);

  return { success: true, pagoId };
}

// ── INVITADOS: CONFIRMAR PAGO ─────────────────────────────────────────────────

function _confirmarPagoInvitado_(pagoId, wompiRef) {
  if (!pagoId || !wompiRef) {
    return { success: false, error: 'pagoId y wompiRef son requeridos' };
  }

  const ss    = SpreadsheetApp.openById(CFG_BODAS.SHEET_ID);
  const sheet = ss.getSheetByName(CFG_BODAS.SHEET_PAGOS);
  if (!sheet) return { success: false, error: 'Hoja PagosInvitados no encontrada' };

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() !== String(pagoId).trim()) continue;
    sheet.getRange(i + 1, 11).setValue(wompiRef); // Col K: wompiReference
    return { success: true };
  }
  return { success: false, error: 'Pedido no encontrado' };
}

// ── SETUP DE HOJAS ────────────────────────────────────────────────────────────
/**
 * Ejecutar cada vez que se necesite reparar / inicializar el Spreadsheet.
 * • Crea las hojas si no existen.
 * • Siempre sobreescribe los encabezados de la fila 1 (idempotente).
 * • Aplica formato (negrita, color, freeze) y validaciones (dropdowns).
 */
function setupSheets() {
  const ss = SpreadsheetApp.openById(CFG_BODAS.SHEET_ID);

  const HOJAS = [
    {
      nombre:  CFG_BODAS.SHEET_USUARIOS,
      headers: [
        'username','passwordHash','coupleName','active','createdAt',
        'fecha_boda','fecha_apertura_lista','fecha_cierre_lista',
        'nombre_el','apellido_el','id_cc_el','telefono_el','email_el',
        'nombre_ella','apellido_ella','id_cc_ella','telefono_ella','email_ella',
        'direccion_entrega','fecha_ultimo_cambio','invitado_user','invitado_passHash',
        'estado_lista',
      ],
      dropdowns: [
        { col: 4,  values: ['TRUE','FALSE']       },  // D: active
        { col: 23, values: ['ACTIVA','BLOQUEADA'] },  // W: estado_lista
      ],
    },
    {
      nombre:  CFG_BODAS.SHEET_SESIONES,
      headers: ['token','username','coupleName','createdAt','expiresAt'],
    },
    {
      nombre:  CFG_BODAS.SHEET_LISTA,
      headers: [
        'token','coupleName','brand','productId','productName',
        'variantSku','variantLabel','precio_cop','qty','addedAt','total_cop',
        'accion','timestamp_accion',
      ],
      dropdowns: [
        { col: 12, values: ['agregado','removido'] }, // L: accion
      ],
    },
    {
      nombre:  CFG_BODAS.SHEET_PAGOS,
      headers: [
        'pagoId','coupleUsername','coupleName','invitado_user','nombreInvitado',
        'productId','variantSku','productName','qty','precio_cop','wompiReference','timestamp',
      ],
    },
    {
      nombre:  CFG_BODAS.SHEET_INVITADOS,
      headers: [
        'invitado_user','nombre','apellido','id_cc','telefono','email','direccion',
        'createdAt','updatedAt',
      ],
    },
  ];

  for (const hoja of HOJAS) {
    let sheet = ss.getSheetByName(hoja.nombre);
    if (!sheet) {
      sheet = ss.insertSheet(hoja.nombre);
      Logger.log('✅ Hoja "' + hoja.nombre + '" creada.');
    } else {
      Logger.log('ℹ️ Hoja "' + hoja.nombre + '" existe — actualizando encabezados y validaciones.');
    }

    const headerRange = sheet.getRange(1, 1, 1, hoja.headers.length);
    headerRange.setValues([hoja.headers]);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#8b6f5e');
    headerRange.setFontColor('#ffffff');
    sheet.setFrozenRows(1);

    if (hoja.dropdowns) {
      const maxDataRows = Math.max(sheet.getMaxRows() - 1, 1000);
      for (const dd of hoja.dropdowns) {
        const rule = SpreadsheetApp.newDataValidation()
          .requireValueInList(dd.values, true)
          .setAllowInvalid(false)
          .build();
        sheet.getRange(2, dd.col, maxDataRows, 1).setDataValidation(rule);
      }
    }
  }

  Logger.log('🎉 setupSheets completo.');
}

/** Alias retrocompatible */
function inicializarHojas() { setupSheets(); }

// ── CREAR USUARIO (ejecutar manualmente) ─────────────────────────────────────
// Edita los valores entre comillas '' y presiona ▶ Ejecutar
function crearUsuario() {
  _agregarUsuario('pareja_garcia', 'clave2026', 'María & Andrés García');
}

// ── CREAR INVITADO (ejecutar manualmente) ─────────────────────────────────────
// Primer arg: username de la pareja | Segundo: username invitado | Tercero: contraseña invitado
// Edita los valores entre comillas '' y presiona ▶ Ejecutar
function crearInvitado() {
  _agregarInvitado('pareja_garcia', 'invitado_juan', 'clave123');
}

function _agregarUsuario(username, password, coupleName) {
  Logger.log('▶ crearUsuario | username="' + username + '" pareja="' + coupleName + '"');
  if (!username || !password || !coupleName) {
    Logger.log('❌ Faltan parámetros.');
    return;
  }

  const ss    = SpreadsheetApp.openById(CFG_BODAS.SHEET_ID);
  let   sheet = ss.getSheetByName(CFG_BODAS.SHEET_USUARIOS);
  if (!sheet) {
    Logger.log('⚠️  Hoja Usuarios no existe — ejecutando setupSheets()...');
    setupSheets();
    sheet = ss.getSheetByName(CFG_BODAS.SHEET_USUARIOS);
  }

  const data = sheet.getDataRange().getValues();
  Logger.log('ℹ️  Usuarios existentes: ' + (data.length - 1));

  for (let i = 1; i < data.length; i++) {
    if (_normalizedEquals_(data[i][COL_USR.USERNAME], username)) {
      Logger.log('❌ Usuario "' + username + '" ya existe en fila ' + (i + 1) + '.');
      return;
    }
  }

  const hash = _sha256_(password);
  sheet.appendRow([username.trim(), hash, coupleName, true, new Date().toISOString()]);
  Logger.log('✅ Usuario "' + username + '" creado. Pareja: "' + coupleName + '"');
  Logger.log('   Hash (8 chars): ' + hash.substring(0, 8) + '...');
}

function _agregarInvitado(coupleUsername, invitadoUser, invitadoPass) {
  Logger.log('▶ crearInvitado | pareja="' + coupleUsername + '" invitado="' + invitadoUser + '"');
  if (!coupleUsername || !invitadoUser || !invitadoPass) {
    Logger.log('❌ Faltan parámetros.');
    return;
  }

  const ss    = SpreadsheetApp.openById(CFG_BODAS.SHEET_ID);
  const sheet = ss.getSheetByName(CFG_BODAS.SHEET_USUARIOS);
  if (!sheet) {
    Logger.log('❌ Hoja "' + CFG_BODAS.SHEET_USUARIOS + '" no encontrada. Ejecuta setupSheets() primero.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  Logger.log('ℹ️  Buscando pareja entre ' + (data.length - 1) + ' registros...');

  for (let i = 1; i < data.length; i++) {
    if (!_normalizedEquals_(data[i][COL_USR.USERNAME], coupleUsername)) continue;
    sheet.getRange(i + 1, COL_USR.INVITADO_USER + 1).setValue(invitadoUser.trim());
    sheet.getRange(i + 1, COL_USR.INVITADO_PASS + 1).setValue(_sha256_(invitadoPass));
    Logger.log('✅ Invitado "' + invitadoUser + '" asignado a "' + coupleUsername + '" (fila ' + (i + 1) + ').');
    return;
  }
  Logger.log('❌ Pareja "' + coupleUsername + '" no encontrada. Verifica el username exacto en col A de Usuarios.');
}
