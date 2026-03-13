/* ===================================================================
 * SISTEMA BODAS G-LIVING — Google Apps Script Backend v3
 * Lista de Bodas · Arte de la Mesa · G-Living
 * v3.0 — 2026
 * ===================================================================
 *
 * HOJA DE CÁLCULO:
 *   Crear una nueva hoja y reemplazar SHEET_ID abajo con su ID.
 *
 * HOJAS REQUERIDAS (se crean con setupSheets()):
 *
 *   📋 Usuarios (25 cols A–Y)
 *      A:username        | B:passwordHash     | C:coupleName
 *      D:estado_lista    | E:createdAt        | F:fecha_boda
 *      G:fecha_apertura  | H:fecha_cierre
 *      I:nombre_el       | J:apellido_el      | K:id_cc_el
 *      L:telefono_el     | M:email_el         | N:cumple_el (DD/MM)
 *      O:nombre_ella     | P:apellido_ella    | Q:id_cc_ella
 *      R:telefono_ella   | S:email_ella       | T:cumple_ella (DD/MM)
 *      U:direccion_entrega
 *      V:invitado_user   | W:invitado_passHash
 *      X:historial_cambios | Y:closure_email_sent
 *
 *      D valores: BORRADOR / ACTIVA / INACTIVA / CERRADA
 *        · BORRADOR  → pareja editando, invitados sin acceso
 *        · ACTIVA    → lista publicada (congelada para esposos), invitados pueden comprar
 *        · INACTIVA  → Filippo pausa; esposos pueden editar (items no comprados);
 *                      invitados ven overlay. Solo Filippo asigna este estado.
 *        · CERRADA   → post fecha_cierre; todos solo lectura
 *
 *   🔑 Sesiones (5 cols)
 *      A:token | B:username | C:coupleName | D:createdAt | E:expiresAt
 *
 *   💍 ListaBodas (12 cols)
 *      A:coupleUsername | B:coupleName | C:brand | D:productId | E:productName
 *      F:variantSku | G:variantLabel | H:precio_cop | I:qty
 *      J:addedAt | K:accion (agregado/removido) | L:timestamp_accion
 *
 *   🎁 PagosInvitados (12 cols)
 *      A:pagoId | B:coupleUsername | C:coupleName | D:invitado_user
 *      E:nombreInvitado | F:productId | G:variantSku | H:productName
 *      I:qty | J:precio_cop | K:wompiReference | L:timestamp
 *
 *   👤 Invitados (9 cols)
 *      A:invitado_user | B:nombre | C:apellido | D:id_cc | E:telefono
 *      F:email | G:direccion | H:createdAt | I:updatedAt
 *
 *   ⚙️ Configuracion (2 cols)
 *      A:clave | B:valor
 *      Fila: "codigo_invitacion" | "GLIVING-2026"  ← Filippo edita aquí para rotar el código
 *
 * API TOKEN: bodas-GLv3-SbQ8rKpX2mTn4wYz
 *
 * DESPLIEGUE:
 *   1. Extensiones → Apps Script → pegar este código
 *   2. Implementar → Nueva implementación → Aplicación web
 *   3. Ejecutar como: yo mismo · Acceso: Cualquier persona
 *   4. Copiar URL → config.js → GAS_URL
 *
 * TRIGGER DIARIO (configurar una vez):
 *   Ejecutar setupTriggerCierre() desde Apps Script UI para activar
 *   el cierre automático de listas expiradas a las 6am Bogotá.
 * =================================================================== */

'use strict';

// ── CONFIGURACIÓN ─────────────────────────────────────────────────────────────

const CFG_B = {
  SHEET_ID:        'REEMPLAZAR_CON_ID_DE_SPREADSHEET',
  SESSION_TTL_H:   72,
  CORS_ORIGIN:     'https://g-living.github.io',
  API_TOKEN:       'bodas-GLv3-SbQ8rKpX2mTn4wYz',
  SHEET_USUARIOS:  'Usuarios',
  SHEET_SESIONES:  'Sesiones',
  SHEET_LISTA:     'ListaBodas',
  SHEET_PAGOS:     'PagosInvitados',
  SHEET_INVITADOS: 'Invitados',
  SHEET_CONFIG:    'Configuracion',
  EMAIL_FILIPPO:   'filippo.massara2016@gmail.com',
  TZ_BOGOTA:       'America/Bogota',
  CODIGO_INV_DEFAULT: 'GLIVING-2026',  // fallback si Configuracion sheet no existe
};

// Índices col Usuarios (base 0)
const C = {
  USERNAME:         0,   // A
  PASSWORD_HASH:    1,   // B
  COUPLE_NAME:      2,   // C
  ESTADO:           3,   // D — BORRADOR/ACTIVA/INACTIVA/CERRADA
  CREATED_AT:       4,   // E
  FECHA_BODA:       5,   // F
  FECHA_APERTURA:   6,   // G
  FECHA_CIERRE:     7,   // H
  NOMBRE_EL:        8,   // I
  APELLIDO_EL:      9,   // J
  ID_CC_EL:         10,  // K
  TEL_EL:           11,  // L
  EMAIL_EL:         12,  // M
  CUMPLE_EL:        13,  // N — DD/MM
  NOMBRE_ELLA:      14,  // O
  APELLIDO_ELLA:    15,  // P
  ID_CC_ELLA:       16,  // Q
  TEL_ELLA:         17,  // R
  EMAIL_ELLA:       18,  // S
  CUMPLE_ELLA:      19,  // T — DD/MM
  DIRECCION:        20,  // U
  INV_USER:         21,  // V
  INV_PASS_HASH:    22,  // W
  HISTORIAL:        23,  // X
  CLOSURE_EMAIL:    24,  // Y — SI/NO
};

// Índices col ListaBodas (base 0)
const CL = {
  COUPLE_USERNAME:  0,   // A
  COUPLE_NAME:      1,   // B
  BRAND:            2,   // C
  PRODUCT_ID:       3,   // D
  PRODUCT_NAME:     4,   // E
  VARIANT_SKU:      5,   // F
  VARIANT_LABEL:    6,   // G
  PRECIO_COP:       7,   // H
  QTY:              8,   // I
  ADDED_AT:         9,   // J
  ACCION:           10,  // K — agregado/removido
  TIMESTAMP_ACCION: 11,  // L
};

// ── UTILIDADES ────────────────────────────────────────────────────────────────

function _sha256_(text) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8
  );
  return bytes.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function _nowBogota_() {
  return Utilities.formatDate(new Date(), CFG_B.TZ_BOGOTA, 'yyyy-MM-dd HH:mm:ss');
}

function _eq_(a, b) {
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

function _respond_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function _cors_() {
  return {
    'Access-Control-Allow-Origin':  CFG_B.CORS_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

/** Lee el código de invitación actual desde la hoja Configuracion.
 *  Filippo puede rotarlo editando la celda B directamente en Sheets. */
function _getInvitationCode_(ss) {
  try {
    const sh = ss.getSheetByName(CFG_B.SHEET_CONFIG);
    if (!sh) return CFG_B.CODIGO_INV_DEFAULT;
    const data = sh.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (_eq_(data[i][0], 'codigo_invitacion')) {
        return String(data[i][1] || '').trim() || CFG_B.CODIGO_INV_DEFAULT;
      }
    }
  } catch (_) {}
  return CFG_B.CODIGO_INV_DEFAULT;
}

/** Genera contraseña alfanumérica de 8 caracteres para invitados */
function _genPass_() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pass = '';
  for (let i = 0; i < 8; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

/** Valida que token de invitado tenga prefijo G- */
function _validateGuestToken_(t) {
  if (!t || !t.startsWith('G-')) return { success: false, error: 'Sesión de invitado no válida' };
  return null;
}

// ── ROUTER ────────────────────────────────────────────────────────────────────

function doPost(e) {
  try {
    const body   = JSON.parse(e.postData.contents);
    const action = body.action || '';

    if (body._token !== CFG_B.API_TOKEN) {
      return _respond_({ success: false, error: 'No autorizado' });
    }

    let result;
    switch (action) {
      // Registro y auth
      case 'registerCouple':         result = _registerCouple_(body);                                              break;
      case 'login':                  result = _login_(body.username, body.password);                               break;
      case 'validate':               result = _validateSession_(body.token);                                       break;
      case 'logout':                 result = _logout_(body.token);                                                break;
      // Pareja — lista
      case 'saveCart':               result = _saveCart_(body.token, body.items);                                  break;
      case 'getCart':                result = _getCart_(body.token);                                               break;
      case 'getPurchasedQtys':       result = _getPurchasedQtys_(body.token);                                      break;
      case 'finalizeList':           result = _finalizeList_(body.token);                                          break;
      // Pareja — perfil
      case 'updateProfile':          result = _updateProfile_(body.token, body.profile);                           break;
      // Invitados
      case 'loginGuest':             result = _loginGuest_(body.invitado_user, body.password);                     break;
      case 'getGuestList':           result = _getGuestList_(body.invitado_user, body.guestToken);                 break;
      case 'createPedidoInvitado':   result = _createPedidoInvitado_(body.guestToken, body.pedido);               break;
      case 'confirmarPagoInvitado':  result = _confirmarPagoInvitado_(body.pagoId, body.wompiRef);                 break;
      case 'saveGuestProfile':       result = _saveGuestProfile_(body.invitado_user, body.guestToken, body.profile); break;
      case 'getGuestProfile':        result = _getGuestProfile_(body.invitado_user, body.guestToken);              break;
      default:                       result = { success: false, error: 'Acción no reconocida: ' + action };
    }
    return _respond_(result);
  } catch (err) {
    return _respond_({ success: false, error: 'Error interno: ' + err.message });
  }
}

function doGet(e) {
  return _respond_({ ok: true, service: 'bodas-v3', version: '3.0' });
}

// ── REGISTRO DE NUEVA PAREJA ──────────────────────────────────────────────────

/**
 * body: {
 *   invitationCode, username, password,
 *   nombre_el, apellido_el, id_cc_el, telefono_el, email_el, cumple_el,
 *   nombre_ella, apellido_ella, id_cc_ella, telefono_ella, email_ella, cumple_ella,
 *   fecha_boda, fecha_cierre_lista, direccion_entrega
 * }
 */
function _registerCouple_(body) {
  const ss = SpreadsheetApp.openById(CFG_B.SHEET_ID);

  // 1. Validar código de invitación
  const codigoValido = _getInvitationCode_(ss);
  if (!body.invitationCode || body.invitationCode.trim() !== codigoValido) {
    return { success: false, error: 'Código de acceso inválido. Comuníquese con G-Living.' };
  }

  // 2. Validar campos obligatorios
  const req = ['username', 'password', 'nombre_el', 'apellido_el', 'email_el',
               'nombre_ella', 'apellido_ella', 'email_ella', 'fecha_cierre_lista'];
  for (const f of req) {
    if (!body[f] || !String(body[f]).trim()) {
      return { success: false, error: 'Campo requerido faltante: ' + f };
    }
  }

  const username = String(body.username).trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');

  // 3. Verificar que username no exista
  const sh = ss.getSheetByName(CFG_B.SHEET_USUARIOS);
  if (!sh) return { success: false, error: 'Sistema no configurado. Contacte a G-Living.' };

  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (_eq_(data[i][C.USERNAME], username)) {
      return { success: false, error: 'Este nombre de usuario ya existe. Elija otro.' };
    }
  }

  // 4. Verificar que emails no estén ya registrados
  const emailEl   = String(body.email_el   || '').trim().toLowerCase();
  const emailElla = String(body.email_ella || '').trim().toLowerCase();
  for (let i = 1; i < data.length; i++) {
    if (_eq_(data[i][C.EMAIL_EL],   emailEl)   ||
        _eq_(data[i][C.EMAIL_ELLA], emailElla) ||
        _eq_(data[i][C.EMAIL_EL],   emailElla) ||
        _eq_(data[i][C.EMAIL_ELLA], emailEl)) {
      return { success: false, error: 'Este email ya está registrado. Si ya tienen cuenta, ingresen desde el portal.' };
    }
  }

  const coupleName = String(body.nombre_el   || '').trim().split(' ')[0] + ' & ' +
                     String(body.nombre_ella || '').trim().split(' ')[0];
  const now        = _nowBogota_();
  const hash       = _sha256_(String(body.password).trim());

  // 5. Insertar fila en Usuarios
  sh.appendRow([
    username,                                    // A: username
    hash,                                        // B: passwordHash
    coupleName,                                  // C: coupleName
    'BORRADOR',                                  // D: estado_lista
    now,                                         // E: createdAt
    String(body.fecha_boda           || ''),     // F: fecha_boda
    '',                                          // G: fecha_apertura (se llena en finalizeList)
    String(body.fecha_cierre_lista   || ''),     // H: fecha_cierre
    String(body.nombre_el            || ''),     // I
    String(body.apellido_el          || ''),     // J
    String(body.id_cc_el             || ''),     // K
    String(body.telefono_el          || ''),     // L
    emailEl,                                     // M
    String(body.cumple_el            || ''),     // N: DD/MM
    String(body.nombre_ella          || ''),     // O
    String(body.apellido_ella        || ''),     // P
    String(body.id_cc_ella           || ''),     // Q
    String(body.telefono_ella        || ''),     // R
    emailElla,                                   // S
    String(body.cumple_ella          || ''),     // T: DD/MM
    String(body.direccion_entrega    || ''),     // U
    '',                                          // V: invitado_user (se genera en finalizeList)
    '',                                          // W: invitado_passHash
    '',                                          // X: historial_cambios
    'NO',                                        // Y: closure_email_sent
  ]);

  // 6. Email de bienvenida
  try {
    _emailBienvenida_(coupleName, {
      nombre_el:   body.nombre_el,
      email_el:    emailEl,
      nombre_ella: body.nombre_ella,
      email_ella:  emailElla,
      fecha_boda:  body.fecha_boda || '',
    });
  } catch (err) {
    Logger.log('Email bienvenida error: ' + err.message);
  }

  return { success: true, username, coupleName };
}

// ── AUTH: LOGIN ───────────────────────────────────────────────────────────────

function _login_(username, password) {
  if (!username || !password) return { success: false, error: 'Usuario y contraseña requeridos' };

  const ss   = SpreadsheetApp.openById(CFG_B.SHEET_ID);
  const sh   = ss.getSheetByName(CFG_B.SHEET_USUARIOS);
  if (!sh)   return { success: false, error: 'Sistema no disponible' };

  const data = sh.getDataRange().getValues();
  const hash = _sha256_(password);

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!_eq_(row[C.USERNAME], username))          continue;
    if (String(row[C.PASSWORD_HASH]).trim() !== hash) continue;

    const estado = _resolveEstado_(ss, sh, i, row);
    const token  = Utilities.getUuid();
    const now    = new Date();
    const exp    = new Date(now.getTime() + CFG_B.SESSION_TTL_H * 3600 * 1000);

    const sesSh = ss.getSheetByName(CFG_B.SHEET_SESIONES);
    if (sesSh) {
      sesSh.appendRow([token, String(row[C.USERNAME]), String(row[C.COUPLE_NAME]),
                       now.toISOString(), exp.toISOString()]);
    }

    return {
      success:     true,
      token,
      username:    String(row[C.USERNAME]),
      coupleName:  String(row[C.COUPLE_NAME]),
      expiresAt:   exp.toISOString(),
      estado,
      profile:     _rowToProfile_(row),
      invitado_user: estado === 'ACTIVA' || estado === 'INACTIVA' || estado === 'CERRADA'
                     ? String(row[C.INV_USER] || '') : '',
    };
  }
  return { success: false, error: 'Usuario o contraseña incorrectos' };
}

// ── AUTH: VALIDATE SESSION ────────────────────────────────────────────────────

function _validateSession_(token) {
  if (!token) return { success: false, error: 'Token requerido' };

  const ss   = SpreadsheetApp.openById(CFG_B.SHEET_ID);
  const sesSh = ss.getSheetByName(CFG_B.SHEET_SESIONES);
  if (!sesSh) return { success: false, error: 'Sin sesiones activas' };

  const data = sesSh.getDataRange().getValues();
  const now  = new Date();

  for (let i = 1; i < data.length; i++) {
    const [sToken, sUser, sCouple,, sExp] = data[i];
    if (String(sToken).trim() !== String(token).trim()) continue;
    if (new Date(sExp) <= now) return { success: false, error: 'Sesión expirada. Por favor ingresen nuevamente.' };

    const usrSh = ss.getSheetByName(CFG_B.SHEET_USUARIOS);
    const extra = _getProfileByUsername_(ss, usrSh, String(sUser));
    return { success: true, username: String(sUser), coupleName: String(sCouple), ...extra };
  }
  return { success: false, error: 'Sesión no encontrada' };
}

function _getProfileByUsername_(ss, usrSh, username) {
  if (!usrSh) return {};
  const data = usrSh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (!_eq_(data[i][C.USERNAME], username)) continue;
    const row    = data[i];
    const estado = _resolveEstado_(ss, usrSh, i, row);
    return {
      estado,
      profile:      _rowToProfile_(row),
      invitado_user: (estado === 'ACTIVA' || estado === 'INACTIVA' || estado === 'CERRADA')
                     ? String(row[C.INV_USER] || '') : '',
    };
  }
  return {};
}

/**
 * Resuelve el estado real de una lista chequeando expiración.
 * Auto-escribe CERRADA si fecha_cierre pasó y el estado era ACTIVA/INACTIVA.
 * INACTIVA solo la puede asignar Filippo desde Sheets — aquí nunca se auto-asigna.
 */
function _resolveEstado_(ss, sh, rowIdx, row) {
  const estado       = String(row[C.ESTADO]       || 'BORRADOR').trim().toUpperCase();
  const fechaCierre  = String(row[C.FECHA_CIERRE] || '').trim();

  if ((estado === 'ACTIVA' || estado === 'INACTIVA') && fechaCierre) {
    const cierre = new Date(fechaCierre);
    if (!isNaN(cierre) && cierre < new Date()) {
      sh.getRange(rowIdx + 1, C.ESTADO + 1).setValue('CERRADA');
      // Intentar enviar email de cierre si no se ha enviado
      try { _triggerClosureEmail_(ss, sh, rowIdx, row); } catch (_) {}
      return 'CERRADA';
    }
  }
  return estado === 'BORRADOR' || estado === 'ACTIVA' ||
         estado === 'INACTIVA' || estado === 'CERRADA'
    ? estado : 'BORRADOR';
}

function _rowToProfile_(row) {
  return {
    fecha_boda:        String(row[C.FECHA_BODA]     || ''),
    fecha_cierre:      String(row[C.FECHA_CIERRE]   || ''),
    nombre_el:         String(row[C.NOMBRE_EL]      || ''),
    apellido_el:       String(row[C.APELLIDO_EL]    || ''),
    id_cc_el:          String(row[C.ID_CC_EL]       || ''),
    telefono_el:       String(row[C.TEL_EL]         || ''),
    email_el:          String(row[C.EMAIL_EL]       || ''),
    cumple_el:         String(row[C.CUMPLE_EL]      || ''),
    nombre_ella:       String(row[C.NOMBRE_ELLA]    || ''),
    apellido_ella:     String(row[C.APELLIDO_ELLA]  || ''),
    id_cc_ella:        String(row[C.ID_CC_ELLA]     || ''),
    telefono_ella:     String(row[C.TEL_ELLA]       || ''),
    email_ella:        String(row[C.EMAIL_ELLA]     || ''),
    cumple_ella:       String(row[C.CUMPLE_ELLA]    || ''),
    direccion_entrega: String(row[C.DIRECCION]      || ''),
  };
}

// ── AUTH: LOGOUT ──────────────────────────────────────────────────────────────

function _logout_(token) {
  if (!token) return { success: true };
  const ss   = SpreadsheetApp.openById(CFG_B.SHEET_ID);
  const sesSh = ss.getSheetByName(CFG_B.SHEET_SESIONES);
  if (!sesSh) return { success: true };
  const data = sesSh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(token).trim()) {
      sesSh.deleteRow(i + 1);
      break;
    }
  }
  return { success: true };
}

// ── PERFIL: ACTUALIZAR ────────────────────────────────────────────────────────

function _updateProfile_(token, profile) {
  const val = _validateSession_(token);
  if (!val.success) return val;
  if (!profile || typeof profile !== 'object') return { success: false, error: 'Perfil requerido' };

  const ss  = SpreadsheetApp.openById(CFG_B.SHEET_ID);
  const sh  = ss.getSheetByName(CFG_B.SHEET_USUARIOS);
  if (!sh)  return { success: false, error: 'Hoja Usuarios no encontrada' };

  const FIELDS = [
    ['nombre_el',         C.NOMBRE_EL],
    ['apellido_el',       C.APELLIDO_EL],
    ['id_cc_el',          C.ID_CC_EL],
    ['telefono_el',       C.TEL_EL],
    ['email_el',          C.EMAIL_EL],
    ['cumple_el',         C.CUMPLE_EL],
    ['nombre_ella',       C.NOMBRE_ELLA],
    ['apellido_ella',     C.APELLIDO_ELLA],
    ['id_cc_ella',        C.ID_CC_ELLA],
    ['telefono_ella',     C.TEL_ELLA],
    ['email_ella',        C.EMAIL_ELLA],
    ['cumple_ella',       C.CUMPLE_ELLA],
    ['direccion_entrega', C.DIRECCION],
  ];

  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (!_eq_(data[i][C.USERNAME], val.username)) continue;

    const row = data[i];
    const now = _nowBogota_();
    const diffs = [];
    for (const [key, idx] of FIELDS) {
      const oldVal = String(row[idx] || '').trim();
      const newVal = String(profile[key] || '').trim();
      if (oldVal !== newVal) diffs.push(key + ': "' + oldVal + '"→"' + newVal + '"');
    }

    // Cols I–U (13 campos)
    sh.getRange(i + 1, C.NOMBRE_EL + 1, 1, 13).setValues([[
      profile.nombre_el         || '',
      profile.apellido_el       || '',
      profile.id_cc_el          || '',
      profile.telefono_el       || '',
      profile.email_el          || '',
      profile.cumple_el         || '',
      profile.nombre_ella       || '',
      profile.apellido_ella     || '',
      profile.id_cc_ella        || '',
      profile.telefono_ella     || '',
      profile.email_ella        || '',
      profile.cumple_ella       || '',
      profile.direccion_entrega || '',
    ]]);

    if (diffs.length) {
      const prev    = String(row[C.HISTORIAL] || '').trim();
      const entry   = '[' + now + '] ' + diffs.join(' | ');
      sh.getRange(i + 1, C.HISTORIAL + 1).setValue(prev ? prev + '\n' + entry : entry);
    }

    return { success: true };
  }
  return { success: false, error: 'Usuario no encontrado' };
}

// ── LISTA DE BODAS: GUARDAR ───────────────────────────────────────────────────

function _saveCart_(token, items) {
  const val = _validateSession_(token);
  if (!val.success) return val;
  if (!Array.isArray(items)) return { success: false, error: 'items debe ser array' };

  const ss     = SpreadsheetApp.openById(CFG_B.SHEET_ID);
  const usrSh  = ss.getSheetByName(CFG_B.SHEET_USUARIOS);
  const listSh = ss.getSheetByName(CFG_B.SHEET_LISTA);
  if (!listSh) return { success: false, error: 'Hoja ListaBodas no encontrada' };

  // Verificar estado
  let estado = 'BORRADOR';
  let rowIdx = -1;
  if (usrSh) {
    const usrData = usrSh.getDataRange().getValues();
    for (let i = 1; i < usrData.length; i++) {
      if (!_eq_(usrData[i][C.USERNAME], val.username)) continue;
      estado = _resolveEstado_(ss, usrSh, i, usrData[i]);
      rowIdx = i;
      break;
    }
  }

  if (estado === 'ACTIVA')   return { success: false, error: 'Tu lista está publicada. No se puede modificar. Contacta a G-Living si necesitas un cambio.', locked: true };
  if (estado === 'CERRADA')  return { success: false, error: 'La lista está cerrada.', locked: true };

  // Si INACTIVA: cargar cantidades ya compradas para validación
  let purchasedMap = {};
  if (estado === 'INACTIVA') {
    purchasedMap = _buildPurchasedMap_(ss, val.username);
  }

  // Validar que items en INACTIVA respeten cantidades compradas
  for (const item of items) {
    const sku     = String(item.variantSku || '').trim();
    const bought  = purchasedMap[sku] || 0;
    const newQty  = Number(item.qty || 1);
    if (bought > 0 && newQty < bought) {
      return {
        success: false,
        error: `No se puede reducir "${item.productName}" a ${newQty} — ya se compraron ${bought} unidades.`,
      };
    }
  }

  const coupleName = val.coupleName || '';
  const now        = _nowBogota_();
  const newSkus    = new Set(items.map(it => String(it.variantSku || '').trim()));

  // Mapa de filas activas por variantSku
  const allData    = listSh.getDataRange().getValues();
  const activeRows = {};
  for (let i = 1; i < allData.length; i++) {
    if (!_eq_(allData[i][CL.COUPLE_USERNAME], val.username)) continue;
    const sku    = String(allData[i][CL.VARIANT_SKU] || '').trim();
    const accion = String(allData[i][CL.ACCION]      || '').trim();
    if (accion !== 'removido') activeRows[sku] = i + 1;
  }

  // Marcar removidos (validar que no tengan compras en INACTIVA)
  for (const [sku, rowNum] of Object.entries(activeRows)) {
    if (!newSkus.has(sku)) {
      const bought = purchasedMap[sku] || 0;
      if (bought > 0) {
        return {
          success: false,
          error: `No se puede eliminar un producto ya comprado por invitados (${sku}).`,
        };
      }
      listSh.getRange(rowNum, CL.ACCION + 1, 1, 2).setValues([['removido', now]]);
    }
  }

  // Actualizar activos / agregar nuevos
  for (const item of items) {
    const sku = String(item.variantSku || '').trim();
    if (activeRows[sku]) {
      listSh.getRange(activeRows[sku], CL.QTY              + 1).setValue(item.qty || 1);
      listSh.getRange(activeRows[sku], CL.TIMESTAMP_ACCION + 1).setValue(now);
    } else {
      listSh.appendRow([
        val.username,
        coupleName,
        item.brand        || '',
        item.productId    || '',
        item.productName  || '',
        item.variantSku   || '',
        item.variantLabel || '',
        item.precio_cop   || 0,
        item.qty          || 1,
        now,
        'agregado',
        now,
      ]);
    }
  }

  return { success: true, saved: items.length };
}

// ── LISTA DE BODAS: OBTENER ───────────────────────────────────────────────────

function _getCart_(token) {
  const val = _validateSession_(token);
  if (!val.success) return val;

  const ss     = SpreadsheetApp.openById(CFG_B.SHEET_ID);
  const listSh = ss.getSheetByName(CFG_B.SHEET_LISTA);
  if (!listSh) return { success: true, items: [] };

  const data  = listSh.getDataRange().getValues();
  const items = [];
  for (let i = 1; i < data.length; i++) {
    if (!_eq_(data[i][CL.COUPLE_USERNAME], val.username)) continue;
    if (String(data[i][CL.ACCION] || '').trim() === 'removido') continue;
    items.push({
      brand:        data[i][CL.BRAND],
      productId:    data[i][CL.PRODUCT_ID],
      productName:  data[i][CL.PRODUCT_NAME],
      variantSku:   data[i][CL.VARIANT_SKU],
      variantLabel: data[i][CL.VARIANT_LABEL],
      precio_cop:   data[i][CL.PRECIO_COP],
      qty:          data[i][CL.QTY],
    });
  }
  return { success: true, items, estado: val.estado };
}

// ── LISTA DE BODAS: CANTIDADES COMPRADAS ──────────────────────────────────────

function _buildPurchasedMap_(ss, username) {
  const map  = {};
  const sh   = ss.getSheetByName(CFG_B.SHEET_PAGOS);
  if (!sh)   return map;
  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (!_eq_(data[i][1], username)) continue;  // col B: coupleUsername
    if (!data[i][10])                continue;  // col K: wompiReference (solo pagos confirmados)
    const sku = String(data[i][6] || '').trim(); // col G: variantSku
    map[sku]  = (map[sku] || 0) + Number(data[i][8] || 0); // col I: qty
  }
  return map;
}

function _getPurchasedQtys_(token) {
  const val = _validateSession_(token);
  if (!val.success) return val;
  const ss  = SpreadsheetApp.openById(CFG_B.SHEET_ID);
  return { success: true, purchasedQtys: _buildPurchasedMap_(ss, val.username) };
}

// ── FINALIZAR LISTA (BORRADOR → ACTIVA) ──────────────────────────────────────

function _finalizeList_(token) {
  const val = _validateSession_(token);
  if (!val.success) return val;

  const ss    = SpreadsheetApp.openById(CFG_B.SHEET_ID);
  const usrSh = ss.getSheetByName(CFG_B.SHEET_USUARIOS);
  if (!usrSh) return { success: false, error: 'Sistema no disponible' };

  const data = usrSh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (!_eq_(data[i][C.USERNAME], val.username)) continue;

    const row    = data[i];
    const estado = String(row[C.ESTADO] || '').trim().toUpperCase();

    if (estado !== 'BORRADOR') {
      return { success: false, error: 'La lista ya fue publicada.' };
    }

    // Verificar al menos 1 item
    const listSh = ss.getSheetByName(CFG_B.SHEET_LISTA);
    let itemCount = 0;
    if (listSh) {
      const listData = listSh.getDataRange().getValues();
      for (let j = 1; j < listData.length; j++) {
        if (_eq_(listData[j][CL.COUPLE_USERNAME], val.username) &&
            String(listData[j][CL.ACCION] || '').trim() !== 'removido') {
          itemCount++;
        }
      }
    }
    if (itemCount === 0) {
      return { success: false, error: 'Agrega al menos un producto antes de publicar.' };
    }

    // Generar credenciales de invitado
    const invUser = 'invitados_' + String(val.username).replace(/[^a-z0-9]/gi, '_');
    const invPass = _genPass_();
    const invHash = _sha256_(invPass);
    const now     = _nowBogota_();

    // Actualizar fila: estado → ACTIVA, fecha_apertura, invitado_user, invitado_passHash
    usrSh.getRange(i + 1, C.ESTADO        + 1).setValue('ACTIVA');
    usrSh.getRange(i + 1, C.FECHA_APERTURA + 1).setValue(now);
    usrSh.getRange(i + 1, C.INV_USER      + 1).setValue(invUser);
    usrSh.getRange(i + 1, C.INV_PASS_HASH + 1).setValue(invHash);

    // Email a la pareja con credenciales de invitados
    try {
      _emailListaPublicada_(String(row[C.COUPLE_NAME]), _rowToProfile_(row), invUser, invPass);
    } catch (err) {
      Logger.log('Email finalizeList error: ' + err.message);
    }

    return {
      success:      true,
      invitado_user: invUser,
      invitado_pass: invPass,
      message:      '¡Su lista está publicada! Compartan las credenciales con sus invitados.',
    };
  }
  return { success: false, error: 'Usuario no encontrado' };
}

// ── INVITADOS: LOGIN ──────────────────────────────────────────────────────────

function _loginGuest_(invitado_user, password) {
  if (!invitado_user || !password) return { success: false, error: 'Datos requeridos' };

  const ss   = SpreadsheetApp.openById(CFG_B.SHEET_ID);
  const sh   = ss.getSheetByName(CFG_B.SHEET_USUARIOS);
  if (!sh)   return { success: false, error: 'Sistema no disponible' };

  const data = sh.getDataRange().getValues();
  const hash = _sha256_(password);

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!_eq_(row[C.INV_USER], invitado_user))          continue;
    if (String(row[C.INV_PASS_HASH]).trim() !== hash)   continue;

    const estado = _resolveEstado_(ss, sh, i, row);

    // Solo ACTIVA permite acceso a invitados (INACTIVA muestra overlay)
    const guestToken = 'G-' + Utilities.getUuid();
    const info       = _getGuestProfileInfo_(ss, String(row[C.INV_USER]));

    return {
      success:         true,
      guestToken,
      coupleUsername:  String(row[C.USERNAME]),
      coupleName:      String(row[C.COUPLE_NAME]),
      fecha_boda:      String(row[C.FECHA_BODA] || ''),
      invitado_user:   String(row[C.INV_USER]),
      lista_inactiva:  estado === 'INACTIVA',
      lista_cerrada:   estado === 'CERRADA',
      profileComplete: info.complete,
      profile:         info.profile,
    };
  }
  return { success: false, error: 'Acceso no válido' };
}

// ── INVITADOS: VER LISTA ──────────────────────────────────────────────────────

function _getGuestList_(invitado_user, guestToken) {
  const err = _validateGuestToken_(guestToken);
  if (err) return err;

  const ss    = SpreadsheetApp.openById(CFG_B.SHEET_ID);
  const usrSh = ss.getSheetByName(CFG_B.SHEET_USUARIOS);
  if (!usrSh) return { success: false, error: 'Sistema no disponible' };

  let coupleName = null, coupleUsername = null, estado = null;
  const usrData  = usrSh.getDataRange().getValues();

  for (let i = 1; i < usrData.length; i++) {
    if (!_eq_(usrData[i][C.INV_USER], invitado_user)) continue;
    estado         = _resolveEstado_(ss, usrSh, i, usrData[i]);
    coupleName     = String(usrData[i][C.COUPLE_NAME]);
    coupleUsername = String(usrData[i][C.USERNAME]);
    break;
  }

  if (!coupleName) return { success: false, error: 'Lista no encontrada' };
  if (estado === 'INACTIVA') return { success: true, lista_inactiva: true, coupleName, items: [] };
  if (estado === 'CERRADA')  return { success: true, lista_cerrada:  true, coupleName, items: [] };

  const listSh = ss.getSheetByName(CFG_B.SHEET_LISTA);
  if (!listSh) return { success: true, coupleName, items: [] };

  // Mapa de cantidades compradas
  const purchased = _buildPurchasedMap_(ss, coupleUsername);

  const listData = listSh.getDataRange().getValues();
  const items    = [];
  for (let i = 1; i < listData.length; i++) {
    if (!_eq_(listData[i][CL.COUPLE_USERNAME], coupleUsername)) continue;
    if (String(listData[i][CL.ACCION] || '').trim() === 'removido') continue;
    const sku = String(listData[i][CL.VARIANT_SKU]);
    items.push({
      brand:        listData[i][CL.BRAND],
      productId:    listData[i][CL.PRODUCT_ID],
      productName:  listData[i][CL.PRODUCT_NAME],
      variantSku:   sku,
      variantLabel: listData[i][CL.VARIANT_LABEL],
      precio_cop:   listData[i][CL.PRECIO_COP],
      qty:          listData[i][CL.QTY],
      qty_purchased: purchased[sku] || 0,
    });
  }

  return { success: true, coupleName, coupleUsername, items };
}

// ── INVITADOS: PERFIL ─────────────────────────────────────────────────────────

function _getGuestProfileInfo_(ss, invitado_user) {
  const sh = ss.getSheetByName(CFG_B.SHEET_INVITADOS);
  if (!sh) return { complete: false, profile: null };
  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (!_eq_(data[i][0], invitado_user)) continue;
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
  const err = _validateGuestToken_(guestToken);
  if (err) return err;
  if (!profile || !profile.nombre || !profile.apellido || !profile.id_cc || !profile.email) {
    return { success: false, error: 'Nombre, apellido, cédula y email son obligatorios' };
  }

  const ss  = SpreadsheetApp.openById(CFG_B.SHEET_ID);
  let   sh  = ss.getSheetByName(CFG_B.SHEET_INVITADOS);
  if (!sh) { setupSheets(); sh = ss.getSheetByName(CFG_B.SHEET_INVITADOS); }

  const now  = _nowBogota_();
  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (!_eq_(data[i][0], invitado_user)) continue;
    sh.getRange(i + 1, 2, 1, 8).setValues([[
      profile.nombre    || '',
      profile.apellido  || '',
      profile.id_cc     || '',
      profile.telefono  || '',
      profile.email     || '',
      profile.direccion || '',
      data[i][7],
      now,
    ]]);
    return { success: true };
  }

  sh.appendRow([
    String(invitado_user).trim(),
    profile.nombre    || '',
    profile.apellido  || '',
    profile.id_cc     || '',
    profile.telefono  || '',
    profile.email     || '',
    profile.direccion || '',
    now,
    now,
  ]);
  return { success: true };
}

function _getGuestProfile_(invitado_user, guestToken) {
  const err  = _validateGuestToken_(guestToken);
  if (err)   return err;
  const ss   = SpreadsheetApp.openById(CFG_B.SHEET_ID);
  const info = _getGuestProfileInfo_(ss, invitado_user);
  return { success: true, profileComplete: info.complete, profile: info.profile };
}

// ── INVITADOS: PEDIDO Y PAGO ──────────────────────────────────────────────────

function _createPedidoInvitado_(guestToken, pedido) {
  const err = _validateGuestToken_(guestToken);
  if (err) return err;
  if (!pedido || !pedido.coupleUsername) return { success: false, error: 'Datos del pedido incompletos' };

  const ss = SpreadsheetApp.openById(CFG_B.SHEET_ID);
  const sh = ss.getSheetByName(CFG_B.SHEET_PAGOS);
  if (!sh) return { success: false, error: 'Hoja PagosInvitados no encontrada' };

  const pagoId = 'PG-' + Utilities.getUuid().split('-')[0].toUpperCase();
  sh.appendRow([
    pagoId,
    pedido.coupleUsername  || '',
    pedido.coupleName      || '',
    pedido.invitado_user   || '',
    pedido.nombreInvitado  || '',
    pedido.productId       || '',
    pedido.variantSku      || '',
    pedido.productName     || '',
    pedido.qty             || 1,
    pedido.precio_cop      || 0,
    '',              // wompiReference — se completa al confirmar
    _nowBogota_(),
  ]);
  return { success: true, pagoId };
}

function _confirmarPagoInvitado_(pagoId, wompiRef) {
  if (!pagoId || !wompiRef) return { success: false, error: 'pagoId y wompiRef son requeridos' };

  const ss = SpreadsheetApp.openById(CFG_B.SHEET_ID);
  const sh = ss.getSheetByName(CFG_B.SHEET_PAGOS);
  if (!sh) return { success: false, error: 'Hoja PagosInvitados no encontrada' };

  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() !== String(pagoId).trim()) continue;
    sh.getRange(i + 1, 11).setValue(wompiRef);
    return { success: true };
  }
  return { success: false, error: 'Pedido no encontrado' };
}

// ── EMAILS ────────────────────────────────────────────────────────────────────

function _emailWrapper_(titulo, subtitulo, bodyHtml) {
  return `<div style="max-width:640px;margin:0 auto;font-family:Georgia,serif;background:#fffaf7;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
    <div style="background:#8b6f5e;padding:28px 32px;text-align:center">
      <h1 style="color:#fff;font-size:22px;margin:0;letter-spacing:2px">G-LIVING</h1>
      <p style="color:#f5ede8;margin:6px 0 0;font-size:12px;letter-spacing:1.5px;text-transform:uppercase">Arte de la Mesa</p>
    </div>
    <div style="padding:32px">
      <h2 style="color:#5a3e35;font-size:20px;margin:0 0 8px">${titulo}</h2>
      ${subtitulo ? `<p style="color:#9e8a7e;font-size:13px;margin:0 0 28px">${subtitulo}</p>` : ''}
      ${bodyHtml}
      <p style="margin-top:36px;font-size:12px;color:#b0a098;text-align:center;line-height:1.8">
        Con todo el cariño,<br>
        <strong style="color:#8b6f5e">El equipo G-Living · Arte de la Mesa</strong><br>
        <a href="https://g-living.github.io/multiplatform/" style="color:#8b6f5e">g-living.github.io</a>
      </p>
    </div>
  </div>`;
}

function _emailBienvenida_(coupleName, p) {
  const emails = [p.email_el, p.email_ella].filter(e => e && e.includes('@'));
  if (!emails.length) return;

  const body = `
    <p style="font-size:16px;line-height:1.9;color:#5a3e35">
      Queridos <strong>${coupleName}</strong>,<br><br>
      Nos llena el corazón darles la bienvenida al mundo de <strong>G-Living</strong>.
      Gracias por habernos escogido para acompañarles en esta etapa tan especial e irrepetible —
      es un honor y un privilegio ser parte de su historia.<br><br>
      Su cuenta ha sido creada exitosamente. Ahora pueden comenzar a construir
      su lista de bodas: exploren nuestro catálogo, seleccionen las piezas que los enamoren
      y cuando estén listos, publiquen su lista para que sus invitados puedan celebrarles.
    </p>
    ${p.fecha_boda ? `<p style="font-size:14px;color:#8b6f5e;background:#fdf5f0;border-radius:8px;padding:16px;margin-top:16px">
      <strong>Fecha de su boda:</strong> ${p.fecha_boda}
    </p>` : ''}`;

  const html = _emailWrapper_(
    '¡Bienvenidos a G-Living! 🌸',
    'Su cuenta ha sido creada',
    body
  );

  MailApp.sendEmail({
    to:       emails.join(','),
    subject:  '¡Bienvenidos a G-Living! Su lista de bodas comienza hoy',
    htmlBody: html,
  });
}

function _emailListaPublicada_(coupleName, p, invUser, invPass) {
  const emails = [p.email_el, p.email_ella].filter(e => e && e.includes('@'));
  if (!emails.length) return;

  const body = `
    <p style="font-size:16px;line-height:1.9;color:#5a3e35">
      Queridos <strong>${coupleName}</strong>,<br><br>
      ¡Su lista de bodas está publicada! A partir de ahora sus invitados podrán
      acceder y regalarles las piezas que eligieron con tanto cariño.
    </p>
    <div style="background:#fdf5f0;border-radius:10px;padding:24px;margin:24px 0;border-left:4px solid #8b6f5e">
      <p style="margin:0 0 8px;font-size:13px;color:#9e8a7e;text-transform:uppercase;letter-spacing:.08em">Credenciales para sus invitados</p>
      <p style="margin:0;font-size:15px;color:#5a3e35">
        <strong>Usuario:</strong> <code style="background:#fff;padding:2px 6px;border-radius:4px">${invUser}</code><br>
        <strong>Contraseña:</strong> <code style="background:#fff;padding:2px 6px;border-radius:4px">${invPass}</code>
      </p>
      <p style="margin:12px 0 0;font-size:12px;color:#b0a098">
        Compartan estas credenciales con sus invitados por WhatsApp, email o tarjeta de invitación.
        La contraseña no se mostrará nuevamente — guárdenla en un lugar seguro.
      </p>
    </div>
    <p style="font-size:13px;color:#5a3e35;line-height:1.8">
      Recuerden que a partir de este momento su lista queda congelada. Si necesitan
      realizar algún cambio, contáctennos directamente a través de G-Living.
    </p>`;

  const html = _emailWrapper_(
    '¡Su lista está publicada!',
    'Sus invitados ya pueden acceder',
    body
  );

  MailApp.sendEmail({
    to:       emails.join(','),
    subject:  'G-Living · Su lista de bodas está publicada — credenciales de invitados',
    htmlBody: html,
  });
}

function _buildListHtml_(items) {
  let rows = '';
  let total = 0;
  for (const it of items) {
    const subtotal = (it.precio_cop || 0) * (it.qty || 1);
    total += subtotal;
    rows += `<tr>
      <td style="padding:6px 10px;border-bottom:1px solid #f0e8e0">${it.productName || ''}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #f0e8e0;text-align:center">${it.variantLabel || ''}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #f0e8e0;text-align:center">${it.qty || 1}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #f0e8e0;text-align:right">$${Number(subtotal).toLocaleString('es-CO')}</td>
    </tr>`;
  }
  return `<table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead><tr style="background:#8b6f5e;color:#fff">
      <th style="padding:8px 10px;text-align:left">Producto</th>
      <th style="padding:8px 10px;text-align:center">Variante</th>
      <th style="padding:8px 10px;text-align:center">Cant.</th>
      <th style="padding:8px 10px;text-align:right">Subtotal</th>
    </tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr style="background:#f5ede8;font-weight:bold">
      <td colspan="3" style="padding:8px 10px;text-align:right">TOTAL COP</td>
      <td style="padding:8px 10px;text-align:right">$${Number(total).toLocaleString('es-CO')}</td>
    </tr></tfoot>
  </table>`;
}

function _emailCierreLista_(coupleName, p, items, purchasedMap) {
  const emails = [p.email_el, p.email_ella].filter(e => e && e.includes('@'));
  if (!emails.length) return;

  // Calcular totales
  let totalListado = 0, totalRecibido = 0;
  for (const it of items) {
    totalListado  += (it.precio_cop || 0) * (it.qty || 1);
    totalRecibido += (it.precio_cop || 0) * (purchasedMap[it.variantSku] || 0);
  }

  // Tabla con columna "comprado"
  let rows = '';
  for (const it of items) {
    const comprado = purchasedMap[it.variantSku] || 0;
    rows += `<tr>
      <td style="padding:6px 10px;border-bottom:1px solid #f0e8e0">${it.productName || ''}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #f0e8e0;text-align:center">${it.qty}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #f0e8e0;text-align:center;color:${comprado>0?'#4a7c59':'#b0a098'}">${comprado}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #f0e8e0;text-align:right">$${Number((it.precio_cop||0)*comprado).toLocaleString('es-CO')}</td>
    </tr>`;
  }

  const tabla = `<table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead><tr style="background:#8b6f5e;color:#fff">
      <th style="padding:8px 10px;text-align:left">Producto</th>
      <th style="padding:8px 10px;text-align:center">Solicitado</th>
      <th style="padding:8px 10px;text-align:center">Comprado</th>
      <th style="padding:8px 10px;text-align:right">Total recibido</th>
    </tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr style="background:#f5ede8;font-weight:bold">
      <td colspan="3" style="padding:8px 10px;text-align:right">TOTAL RECIBIDO</td>
      <td style="padding:8px 10px;text-align:right">$${Number(totalRecibido).toLocaleString('es-CO')}</td>
    </tr></tfoot>
  </table>`;

  const body = `
    <p style="font-size:16px;line-height:1.9;color:#5a3e35">
      Queridos <strong>${coupleName}</strong>,<br><br>
      El período de su lista de bodas ha llegado a su fin. Fue un honor
      acompañarles en esta etapa tan especial. A continuación encontrarán
      el resumen de los regalos que sus seres queridos les obsequiaron.
    </p>
    <h3 style="color:#8b6f5e;border-bottom:1px solid #f0e8e0;padding-bottom:8px">Resumen de regalos</h3>
    ${tabla}
    <p style="margin-top:20px;font-size:14px;color:#5a3e35;background:#fdf5f0;border-radius:8px;padding:16px">
      <strong>Total listado:</strong> $${Number(totalListado).toLocaleString('es-CO')}<br>
      <strong>Total recibido:</strong> $${Number(totalRecibido).toLocaleString('es-CO')}
    </p>
    <p style="font-size:14px;color:#5a3e35;line-height:1.8;margin-top:16px">
      Pronto nos pondremos en contacto para coordinar la entrega de los productos.
      Gracias por confiar en G-Living para uno de los días más importantes de sus vidas.
    </p>`;

  const html = _emailWrapper_('Su lista de bodas ha cerrado', 'Resumen final', body);

  MailApp.sendEmail({
    to:       emails.join(','),
    subject:  'G-Living · Resumen final de su lista de bodas — ' + coupleName,
    htmlBody: html,
  });
}

// ── CIERRE AUTOMÁTICO (TRIGGER DIARIO) ────────────────────────────────────────

/**
 * Revisa todas las listas ACTIVA/INACTIVA cuya fecha_cierre ya pasó.
 * Las marca CERRADA y envía el email de cierre (una sola vez por bandera Y).
 * Configurar con setupTriggerCierre() — ejecutar una vez desde Apps Script UI.
 */
function autoCloseExpiredLists() {
  const ss    = SpreadsheetApp.openById(CFG_B.SHEET_ID);
  const usrSh = ss.getSheetByName(CFG_B.SHEET_USUARIOS);
  if (!usrSh) return;

  const data = usrSh.getDataRange().getValues();
  const now  = new Date();

  for (let i = 1; i < data.length; i++) {
    const row    = data[i];
    const estado = String(row[C.ESTADO] || '').trim().toUpperCase();
    if (estado !== 'ACTIVA' && estado !== 'INACTIVA') continue;

    const fechaCierreStr = String(row[C.FECHA_CIERRE] || '').trim();
    if (!fechaCierreStr) continue;

    const fechaCierre = new Date(fechaCierreStr);
    if (isNaN(fechaCierre) || fechaCierre >= now) continue;

    usrSh.getRange(i + 1, C.ESTADO + 1).setValue('CERRADA');
    _triggerClosureEmail_(ss, usrSh, i, row);
  }
}

function _triggerClosureEmail_(ss, usrSh, rowIdx, row) {
  if (String(row[C.CLOSURE_EMAIL] || '').trim().toUpperCase() === 'SI') return;

  const coupleName  = String(row[C.COUPLE_NAME]);
  const profile     = _rowToProfile_(row);
  const username    = String(row[C.USERNAME]);
  const listSh      = ss.getSheetByName(CFG_B.SHEET_LISTA);
  const items       = [];

  if (listSh) {
    const listData = listSh.getDataRange().getValues();
    for (let j = 1; j < listData.length; j++) {
      if (!_eq_(listData[j][CL.COUPLE_USERNAME], username)) continue;
      if (String(listData[j][CL.ACCION] || '').trim() === 'removido') continue;
      items.push({
        productName:  listData[j][CL.PRODUCT_NAME],
        variantSku:   String(listData[j][CL.VARIANT_SKU]),
        variantLabel: listData[j][CL.VARIANT_LABEL],
        precio_cop:   Number(listData[j][CL.PRECIO_COP] || 0),
        qty:          Number(listData[j][CL.QTY]        || 0),
      });
    }
  }

  const purchasedMap = _buildPurchasedMap_(ss, username);

  try {
    _emailCierreLista_(coupleName, profile, items, purchasedMap);
    usrSh.getRange(rowIdx + 1, C.CLOSURE_EMAIL + 1).setValue('SI');
  } catch (err) {
    Logger.log('Email cierre error: ' + err.message);
  }
}

function setupTriggerCierre() {
  ScriptApp.newTrigger('autoCloseExpiredLists')
    .timeBased()
    .everyDays(1)
    .atHour(6)
    .inTimezone(CFG_B.TZ_BOGOTA)
    .create();
  Logger.log('Trigger diario de cierre configurado — 6am Bogotá.');
}

// ── SETUP DE HOJAS ────────────────────────────────────────────────────────────

function setupSheets() {
  const ss = SpreadsheetApp.openById(CFG_B.SHEET_ID);

  const HOJAS = [
    {
      nombre: CFG_B.SHEET_USUARIOS,
      headers: [
        'username','passwordHash','coupleName','estado_lista','createdAt',
        'fecha_boda','fecha_apertura_lista','fecha_cierre_lista',
        'nombre_el','apellido_el','id_cc_el','telefono_el','email_el','cumple_el',
        'nombre_ella','apellido_ella','id_cc_ella','telefono_ella','email_ella','cumple_ella',
        'direccion_entrega','invitado_user','invitado_passHash','historial_cambios','closure_email_sent',
      ],
      dropdowns: [
        { col: 4, values: ['BORRADOR','ACTIVA','INACTIVA','CERRADA'] },
        { col: 25, values: ['SI','NO'] },
      ],
    },
    {
      nombre: CFG_B.SHEET_SESIONES,
      headers: ['token','username','coupleName','createdAt','expiresAt'],
    },
    {
      nombre: CFG_B.SHEET_LISTA,
      headers: [
        'coupleUsername','coupleName','brand','productId','productName',
        'variantSku','variantLabel','precio_cop','qty','addedAt','accion','timestamp_accion',
      ],
      dropdowns: [{ col: 11, values: ['agregado','removido'] }],
    },
    {
      nombre: CFG_B.SHEET_PAGOS,
      headers: [
        'pagoId','coupleUsername','coupleName','invitado_user','nombreInvitado',
        'productId','variantSku','productName','qty','precio_cop','wompiReference','timestamp',
      ],
    },
    {
      nombre: CFG_B.SHEET_INVITADOS,
      headers: ['invitado_user','nombre','apellido','id_cc','telefono','email','direccion','createdAt','updatedAt'],
    },
    {
      nombre: CFG_B.SHEET_CONFIG,
      headers: ['clave','valor'],
      seedRows: [['codigo_invitacion', 'GLIVING-2026']],
    },
  ];

  for (const hoja of HOJAS) {
    let sheet = ss.getSheetByName(hoja.nombre);
    if (!sheet) {
      sheet = ss.insertSheet(hoja.nombre);
      Logger.log('Hoja "' + hoja.nombre + '" creada.');
    }

    const headerRange = sheet.getRange(1, 1, 1, hoja.headers.length);
    headerRange.setValues([hoja.headers]);
    headerRange.setFontWeight('bold').setBackground('#8b6f5e').setFontColor('#ffffff');
    sheet.setFrozenRows(1);

    if (hoja.dropdowns) {
      for (const dd of hoja.dropdowns) {
        const rule = SpreadsheetApp.newDataValidation()
          .requireValueInList(dd.values, true).setAllowInvalid(false).build();
        sheet.getRange(2, dd.col, Math.max(sheet.getMaxRows() - 1, 500), 1).setDataValidation(rule);
      }
    }

    if (hoja.seedRows && sheet.getLastRow() <= 1) {
      for (const row of hoja.seedRows) sheet.appendRow(row);
      Logger.log('Datos iniciales insertados en "' + hoja.nombre + '".');
    }
  }

  Logger.log('setupSheets completado.');
}
