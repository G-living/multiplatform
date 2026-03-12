/* ===================================================================
 * BODAS - Google Apps Script Backend
 * Lista de Bodas · Arte de la Mesa · G-Living
 * v1.0 — 2026
 * ===================================================================
 *
 * HOJA DE CÁLCULO:
 *   https://docs.google.com/spreadsheets/d/1ZUnUzQ8V_rpXjsY43VRUsi7ag2l88pUHMKk--HbscrI
 *
 * HOJAS REQUERIDAS (crear manualmente en el sheet antes de usar):
 *
 *   📋 Usuarios
 *      A: username | B: passwordHash | C: coupleName | D: active (TRUE/FALSE) | E: createdAt
 *      Ejemplo fila: esposos_garcia | [sha256] | María & Andrés García | TRUE | 2026-03-12
 *
 *   🔑 Sesiones
 *      A: token | B: username | C: coupleName | D: createdAt | E: expiresAt
 *
 *   ❤️ ListaBodas
 *      A: token | B: brand | C: productId | D: productName | E: variantSku |
 *      F: variantLabel | G: precio_cop | H: qty | I: addedAt
 *
 * DESPLIEGUE:
 *   1. Extensiones → Apps Script → pegar este código
 *   2. Implementar → Nueva implementación → Aplicación web
 *   3. Ejecutar como: yo mismo · Acceso: Cualquier persona
 *   4. Copiar la URL del deployment → pegar en bodas-landing.html como GAS_URL
 *
 * CREAR USUARIO (ejecutar en Apps Script manualmente):
 *   crearUsuario('esposos_garcia', 'password123', 'María & Andrés García')
 * =================================================================== */

'use strict';

// ── CONFIGURACIÓN ────────────────────────────────────────────────────────────

const CFG_BODAS = {
  SHEET_ID:        '1ZUnUzQ8V_rpXjsY43VRUsi7ag2l88pUHMKk--HbscrI',
  SESSION_TTL_H:   72,  // sesiones válidas por 72 horas
  CORS_ORIGIN:     'https://g-living.github.io',
  SHEET_USUARIOS:  'Usuarios',
  SHEET_SESIONES:  'Sesiones',
  SHEET_LISTA:     'ListaBodas',
};

// ── ROUTER PRINCIPAL ─────────────────────────────────────────────────────────

function doPost(e) {
  const cors = _corsHeaders_();
  try {
    const body   = JSON.parse(e.postData.contents);
    const action = body.action || '';
    let result;

    switch (action) {
      case 'login':        result = _login_(body.username, body.password);       break;
      case 'validate':     result = _validateSession_(body.token);               break;
      case 'logout':       result = _logout_(body.token);                        break;
      case 'saveCart':     result = _saveCart_(body.token, body.items);          break;
      case 'getCart':      result = _getCart_(body.token);                       break;
      case 'clearCart':    result = _clearCart_(body.token);                     break;
      default:             result = { success: false, error: 'Acción no reconocida: ' + action };
    }

    return _respond_(result, cors);
  } catch (err) {
    return _respond_({ success: false, error: 'Error interno: ' + err.message }, cors);
  }
}

function doGet(e) {
  // Para el preflight CORS y pruebas básicas
  return _respond_({ ok: true, service: 'bodas-backend', version: '1.0' }, _corsHeaders_());
}

// ── AUTH: LOGIN ──────────────────────────────────────────────────────────────

function _login_(username, password) {
  if (!username || !password) {
    return { success: false, error: 'Usuario y contraseña son requeridos' };
  }

  const ss    = SpreadsheetApp.openById(CFG_BODAS.SHEET_ID);
  const sheet = ss.getSheetByName(CFG_BODAS.SHEET_USUARIOS);

  if (!sheet) {
    return { success: false, error: 'Hoja Usuarios no encontrada. Revisa la configuración.' };
  }

  const data  = sheet.getDataRange().getValues();
  const hash  = _sha256_(password);

  // Buscar desde fila 2 (fila 1 = encabezados)
  for (let i = 1; i < data.length; i++) {
    const [uName, uHash, uCouple, uActive] = data[i];
    if (
      String(uName).trim().toLowerCase() === String(username).trim().toLowerCase() &&
      String(uHash).trim() === hash &&
      (uActive === true || String(uActive).toUpperCase() === 'TRUE')
    ) {
      // Crear sesión
      const token = Utilities.getUuid();
      const now   = new Date();
      const exp   = new Date(now.getTime() + CFG_BODAS.SESSION_TTL_H * 3600 * 1000);

      const sesSheet = ss.getSheetByName(CFG_BODAS.SHEET_SESIONES);
      if (sesSheet) {
        sesSheet.appendRow([token, String(uName), String(uCouple), now.toISOString(), exp.toISOString()]);
      }

      return {
        success:    true,
        token:      token,
        coupleName: String(uCouple),
        expiresAt:  exp.toISOString(),
      };
    }
  }

  return { success: false, error: 'Usuario o contraseña incorrectos' };
}

// ── AUTH: VALIDATE SESSION ───────────────────────────────────────────────────

function _validateSession_(token) {
  if (!token) return { success: false, error: 'Token requerido' };

  const ss     = SpreadsheetApp.openById(CFG_BODAS.SHEET_ID);
  const sheet  = ss.getSheetByName(CFG_BODAS.SHEET_SESIONES);
  if (!sheet) return { success: false, error: 'Sin sesiones activas' };

  const data = sheet.getDataRange().getValues();
  const now  = new Date();

  for (let i = 1; i < data.length; i++) {
    const [sToken, sUser, sCouple, , sExp] = data[i];
    if (String(sToken).trim() === String(token).trim()) {
      if (new Date(sExp) > now) {
        return { success: true, username: String(sUser), coupleName: String(sCouple) };
      } else {
        return { success: false, error: 'Sesión expirada. Por favor inicia sesión nuevamente.' };
      }
    }
  }

  return { success: false, error: 'Sesión no encontrada' };
}

// ── AUTH: LOGOUT ─────────────────────────────────────────────────────────────

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

// ── LISTA DE BODAS: GUARDAR CARRITO ──────────────────────────────────────────

function _saveCart_(token, items) {
  const validation = _validateSession_(token);
  if (!validation.success) return validation;

  if (!Array.isArray(items)) {
    return { success: false, error: 'items debe ser un array' };
  }

  const ss    = SpreadsheetApp.openById(CFG_BODAS.SHEET_ID);
  const sheet = ss.getSheetByName(CFG_BODAS.SHEET_LISTA);
  if (!sheet) return { success: false, error: 'Hoja ListaBodas no encontrada' };

  // Eliminar entradas previas de este token
  const data = sheet.getDataRange().getValues();
  const rowsToDelete = [];
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(token).trim()) {
      rowsToDelete.push(i + 1);
    }
  }
  // Eliminar de abajo hacia arriba para no desplazar índices
  for (let i = rowsToDelete.length - 1; i >= 0; i--) {
    sheet.deleteRow(rowsToDelete[i]);
  }

  // Insertar nuevos items
  const now = new Date().toISOString();
  for (const item of items) {
    sheet.appendRow([
      token,
      item.brand        || '',
      item.productId    || '',
      item.productName  || '',
      item.variantSku   || '',
      item.variantLabel || '',
      item.precio_cop   || 0,
      item.qty          || 1,
      now,
    ]);
  }

  return { success: true, saved: items.length };
}

// ── LISTA DE BODAS: OBTENER CARRITO ─────────────────────────────────────────

function _getCart_(token) {
  const validation = _validateSession_(token);
  if (!validation.success) return validation;

  const ss    = SpreadsheetApp.openById(CFG_BODAS.SHEET_ID);
  const sheet = ss.getSheetByName(CFG_BODAS.SHEET_LISTA);
  if (!sheet) return { success: true, items: [] };

  const data  = sheet.getDataRange().getValues();
  const items = [];

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(token).trim()) {
      const [, brand, productId, productName, variantSku, variantLabel, precio_cop, qty] = data[i];
      items.push({ brand, productId, productName, variantSku, variantLabel, precio_cop, qty });
    }
  }

  return { success: true, items };
}

// ── LISTA DE BODAS: LIMPIAR CARRITO ─────────────────────────────────────────

function _clearCart_(token) {
  return _saveCart_(token, []);
}

// ── UTILIDADES ───────────────────────────────────────────────────────────────

function _sha256_(text) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    text,
    Utilities.Charset.UTF_8
  );
  return bytes.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function _corsHeaders_() {
  return {
    'Access-Control-Allow-Origin':  CFG_BODAS.CORS_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function _respond_(data, headers) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  // GAS no permite setear headers en ContentService; CORS se maneja via HtmlService si es necesario
  return output;
}

// ── FUNCIÓN PARA CREAR USUARIOS (ejecutar manualmente desde Apps Script) ─────

/**
 * Crea un usuario en la hoja Usuarios.
 * Ejecutar MANUALMENTE desde el editor de Apps Script (no se llama desde el frontend).
 *
 * @param {string} username  - Nombre de usuario (ej: 'esposos_garcia')
 * @param {string} password  - Contraseña en texto plano (se guarda hasheada)
 * @param {string} coupleName - Nombre de la pareja (ej: 'María & Andrés García')
 */
function crearUsuario(username, password, coupleName) {
  const ss    = SpreadsheetApp.openById(CFG_BODAS.SHEET_ID);
  let sheet   = ss.getSheetByName(CFG_BODAS.SHEET_USUARIOS);

  // Crear hoja si no existe
  if (!sheet) {
    sheet = ss.insertSheet(CFG_BODAS.SHEET_USUARIOS);
    sheet.appendRow(['username', 'passwordHash', 'coupleName', 'active', 'createdAt']);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
  }

  // Verificar que no exista
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === username.trim().toLowerCase()) {
      Logger.log('❌ Usuario "' + username + '" ya existe.');
      return;
    }
  }

  const hash = _sha256_(password);
  sheet.appendRow([username.trim(), hash, coupleName, true, new Date().toISOString()]);
  Logger.log('✅ Usuario "' + username + '" creado correctamente. Pareja: ' + coupleName);
}

/**
 * Inicializa las hojas necesarias si no existen.
 * Ejecutar UNA VEZ al configurar el sistema.
 */
function inicializarHojas() {
  const ss = SpreadsheetApp.openById(CFG_BODAS.SHEET_ID);

  const hojas = [
    {
      nombre: CFG_BODAS.SHEET_USUARIOS,
      headers: ['username', 'passwordHash', 'coupleName', 'active', 'createdAt'],
    },
    {
      nombre: CFG_BODAS.SHEET_SESIONES,
      headers: ['token', 'username', 'coupleName', 'createdAt', 'expiresAt'],
    },
    {
      nombre: CFG_BODAS.SHEET_LISTA,
      headers: ['token', 'brand', 'productId', 'productName', 'variantSku', 'variantLabel', 'precio_cop', 'qty', 'addedAt'],
    },
  ];

  for (const hoja of hojas) {
    let sheet = ss.getSheetByName(hoja.nombre);
    if (!sheet) {
      sheet = ss.insertSheet(hoja.nombre);
      sheet.appendRow(hoja.headers);
      sheet.getRange(1, 1, 1, hoja.headers.length).setFontWeight('bold');
      Logger.log('✅ Hoja "' + hoja.nombre + '" creada.');
    } else {
      Logger.log('ℹ️ Hoja "' + hoja.nombre + '" ya existe.');
    }
  }

  Logger.log('🎉 Inicialización completa.');
}
