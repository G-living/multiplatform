/* ===================================================================
 * BODAS - Google Apps Script Backend v2
 * Lista de Bodas · Arte de la Mesa · G-Living
 * v2.0 — 2026
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
 *
 * CREAR USUARIO (ejecutar manualmente en Apps Script):
 *   crearUsuario('esposos_garcia', 'password123', 'María & Andrés García')
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
  SHEET_PAGOS:      'PagosInvitados',
  SHEET_INVITADOS:  'Invitados',
  EMAIL_FILIPPO:    'filippo.massara2016@gmail.com',
  TZ_BOGOTA:      'America/Bogota',
};

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
      case 'login':                 result = _login_(body.username, body.password);                  break;
      case 'validate':              result = _validateSession_(body.token);                          break;
      case 'logout':                result = _logout_(body.token);                                   break;
      case 'saveCart':              result = _saveCart_(body.token, body.items);                     break;
      case 'getCart':               result = _getCart_(body.token);                                  break;
      case 'clearCart':             result = _clearCart_(body.token);                                break;
      case 'updateProfile':         result = _updateProfile_(body.token, body.profile);              break;
      case 'loginGuest':            result = _loginGuest_(body.invitado_user, body.password);                    break;
      case 'getGuestList':          result = _getGuestList_(body.invitado_user, body.guestToken);                break;
      case 'createPedidoInvitado':  result = _createPedidoInvitado_(body.guestToken, body.pedido);              break;
      case 'confirmarPagoInvitado': result = _confirmarPagoInvitado_(body.pagoId, body.wompiRef);               break;
      case 'saveGuestProfile':      result = _saveGuestProfile_(body.invitado_user, body.guestToken, body.profile); break;
      case 'getGuestProfile':       result = _getGuestProfile_(body.invitado_user, body.guestToken);             break;
      default:                      result = { success: false, error: 'Acción no reconocida: ' + action };
    }

    return _respond_(result, cors);
  } catch (err) {
    return _respond_({ success: false, error: 'Error interno: ' + err.message }, cors);
  }
}

function doGet(e) {
  return _respond_({ ok: true, service: 'bodas-backend', version: '2.0' }, _corsHeaders_());
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
    const [uName, uHash, uCouple, uActive] = row;
    if (
      String(uName).trim().toLowerCase() === String(username).trim().toLowerCase() &&
      String(uHash).trim() === hash
    ) {
      const isActive   = (uActive === true || String(uActive).toUpperCase() === 'TRUE');
      const restricted = !isActive;

      const token = Utilities.getUuid();
      const now   = new Date();
      const exp   = new Date(now.getTime() + CFG_BODAS.SESSION_TTL_H * 3600 * 1000);

      const sesSheet = ss.getSheetByName(CFG_BODAS.SHEET_SESIONES);
      if (sesSheet) {
        sesSheet.appendRow([token, String(uName), String(uCouple), now.toISOString(), exp.toISOString()]);
      }

      // profileComplete = nombre_el (col I, idx 8) diligenciado
      const profileComplete = !!String(row[8] || '').trim();

      return {
        success:         true,
        token:           token,
        username:        String(uName),
        coupleName:      String(uCouple),
        expiresAt:       exp.toISOString(),
        profileComplete: profileComplete,
        profile:         _rowToProfile_(row),
        restricted:      restricted,
      };
    }
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
    if (String(sToken).trim() === String(token).trim()) {
      if (new Date(sExp) > now) {
        const extra = _getProfileByUsername_(ss, String(sUser));
        return { success: true, username: String(sUser), coupleName: String(sCouple), ...extra };
      }
      return { success: false, error: 'Sesión expirada. Por favor inicia sesión nuevamente.' };
    }
  }

  return { success: false, error: 'Sesión no encontrada' };
}

function _getProfileByUsername_(ss, username) {
  const sheet = ss.getSheetByName(CFG_BODAS.SHEET_USUARIOS);
  if (!sheet) return {};
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === username.trim().toLowerCase()) {
      return {
        profileComplete: !!String(data[i][8] || '').trim(),
        profile: _rowToProfile_(data[i]),
      };
    }
  }
  return {};
}

function _rowToProfile_(row) {
  return {
    fecha_boda:           String(row[5]  || ''),
    fecha_apertura_lista: String(row[6]  || ''),
    fecha_cierre_lista:   String(row[7]  || ''),
    nombre_el:            String(row[8]  || ''),
    apellido_el:          String(row[9]  || ''),
    id_cc_el:             String(row[10] || ''),
    telefono_el:          String(row[11] || ''),
    email_el:             String(row[12] || ''),
    nombre_ella:          String(row[13] || ''),
    apellido_ella:        String(row[14] || ''),
    id_cc_ella:           String(row[15] || ''),
    telefono_ella:        String(row[16] || ''),
    email_ella:           String(row[17] || ''),
    direccion_entrega:    String(row[18] || ''),
    fecha_ultimo_cambio:  String(row[19] || ''),
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

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === validation.username.trim().toLowerCase()) {
      const r = i + 1; // fila 1-based en sheet
      // Cols I–S = posiciones 9–19 (1-based)
      sheet.getRange(r,  9).setValue(profile.nombre_el          || '');
      sheet.getRange(r, 10).setValue(profile.apellido_el        || '');
      sheet.getRange(r, 11).setValue(profile.id_cc_el           || '');
      sheet.getRange(r, 12).setValue(profile.telefono_el        || '');
      sheet.getRange(r, 13).setValue(profile.email_el           || '');
      sheet.getRange(r, 14).setValue(profile.nombre_ella        || '');
      sheet.getRange(r, 15).setValue(profile.apellido_ella      || '');
      sheet.getRange(r, 16).setValue(profile.id_cc_ella         || '');
      sheet.getRange(r, 17).setValue(profile.telefono_ella      || '');
      sheet.getRange(r, 18).setValue(profile.email_ella         || '');
      sheet.getRange(r, 19).setValue(profile.direccion_entrega  || '');
      return { success: true };
    }
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

  // Detectar primer envío: fecha_ultimo_cambio vacía
  const isFirstSend = !validation.profile || !validation.profile.fecha_ultimo_cambio;

  const coupleName = validation.coupleName || '';
  const total_cop  = items.reduce((s, it) => s + (it.precio_cop || 0) * (it.qty || 1), 0);
  const nowBogota  = Utilities.formatDate(new Date(), CFG_BODAS.TZ_BOGOTA, 'yyyy-MM-dd HH:mm:ss');

  // ── Audit trail: en vez de borrar, marcar "removido" y agregar nuevos ──────
  const allData = sheet.getDataRange().getValues();

  // Construir mapa de filas activas: variantSku → índice fila 1-based
  const activeRows = {}; // sku → rowNum
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][0]).trim() === String(token).trim()) {
      const sku    = String(allData[i][5]  || '').trim(); // col F: variantSku
      const accion = String(allData[i][11] || '').trim(); // col L: accion
      if (accion !== 'removido') {
        activeRows[sku] = i + 1; // 1-based
      }
    }
  }

  // Conjunto de SKUs nuevos
  const newSkus = new Set(items.map(it => String(it.variantSku || '').trim()));

  // Marcar como "removido" los SKUs que ya no están en la nueva lista
  for (const [sku, rowNum] of Object.entries(activeRows)) {
    if (!newSkus.has(sku)) {
      sheet.getRange(rowNum, 12).setValue('removido'); // col L
      sheet.getRange(rowNum, 13).setValue(nowBogota);  // col M
    }
  }

  // Agregar nuevos o actualizar cantidad en activos
  for (const item of items) {
    const sku = String(item.variantSku || '').trim();
    if (activeRows[sku]) {
      // Ya existe activo: actualizar cantidad y timestamp
      sheet.getRange(activeRows[sku], 9).setValue(item.qty || 1);  // col I: qty
      sheet.getRange(activeRows[sku], 13).setValue(nowBogota);      // col M: timestamp_accion
    } else {
      // Nuevo item: agregar fila con accion = 'agregado'
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
        nowBogota,    // col J: addedAt
        total_cop,    // col K: total_cop
        'agregado',   // col L: accion
        nowBogota,    // col M: timestamp_accion
      ]);
    }
  }

  // Actualizar fecha_ultimo_cambio (col T = columna 20, 1-based) en Usuarios
  const usrSheet = ss.getSheetByName(CFG_BODAS.SHEET_USUARIOS);
  let profileData = validation.profile || {};
  if (usrSheet) {
    const usrData = usrSheet.getDataRange().getValues();
    for (let i = 1; i < usrData.length; i++) {
      if (String(usrData[i][0]).trim().toLowerCase() === validation.username.trim().toLowerCase()) {
        usrSheet.getRange(i + 1, 20).setValue(nowBogota);
        profileData = _rowToProfile_(usrData[i]);
        profileData.fecha_ultimo_cambio = nowBogota;
        break;
      }
    }
  }

  // Enviar emails (no bloqueante)
  try { _enviarEmailPareja_(isFirstSend, coupleName, profileData, items, total_cop, nowBogota); }
  catch (err) { Logger.log('Email pareja error: ' + err.message); }
  try { _enviarEmailFilippo_(coupleName, profileData, items, total_cop, nowBogota); }
  catch (err) { Logger.log('Email Filippo error: ' + err.message); }

  return { success: true, saved: items.length, fecha_ultimo_cambio: nowBogota };
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
    if (String(data[i][0]).trim() === String(token).trim()) {
      const accion = String(data[i][11] || '').trim(); // col L
      if (accion === 'removido') continue;
      const [, , brand, productId, productName, variantSku, variantLabel, precio_cop, qty] = data[i];
      items.push({ brand, productId, productName, variantSku, variantLabel, precio_cop, qty });
    }
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
    const row       = data[i];
    const rowUser   = String(row[20] || '').trim(); // Col U: invitado_user
    const rowHash   = String(row[21] || '').trim(); // Col V: invitado_passHash

    if (rowUser.toLowerCase() === invitado_user.trim().toLowerCase() && rowHash === hash) {
      const guestToken    = 'G-' + Utilities.getUuid();
      const profileComplete = _guestProfileExists_(ss, rowUser);
      return {
        success:         true,
        guestToken:      guestToken,
        coupleUsername:  String(row[0]),
        coupleName:      String(row[2]),
        fecha_boda:      String(row[5] || ''),
        invitado_user:   rowUser,
        profileComplete: profileComplete,
        profile:         profileComplete ? _getGuestProfileData_(ss, rowUser) : null,
      };
    }
  }

  return { success: false, error: 'Acceso no válido' };
}

// ── INVITADOS: PERFIL (DATOS PARA FACTURACIÓN Y CROSS-SELLING) ───────────────

function _saveGuestProfile_(invitado_user, guestToken, profile) {
  if (!guestToken || !guestToken.startsWith('G-')) {
    return { success: false, error: 'Sesión de invitado no válida' };
  }
  if (!profile || !profile.nombre || !profile.apellido || !profile.id_cc || !profile.email) {
    return { success: false, error: 'Nombre, apellido, cédula y email son obligatorios' };
  }

  const ss    = SpreadsheetApp.openById(CFG_BODAS.SHEET_ID);
  let   sheet = ss.getSheetByName(CFG_BODAS.SHEET_INVITADOS);
  if (!sheet) { setupSheets(); sheet = ss.getSheetByName(CFG_BODAS.SHEET_INVITADOS); }

  const now  = Utilities.formatDate(new Date(), CFG_BODAS.TZ_BOGOTA, 'yyyy-MM-dd HH:mm:ss');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0] || '').trim().toLowerCase() === invitado_user.trim().toLowerCase()) {
      // Actualizar fila existente (cols B–H, updatedAt en col I)
      sheet.getRange(i + 1, 2, 1, 8).setValues([[
        profile.nombre     || '',
        profile.apellido   || '',
        profile.id_cc      || '',
        profile.telefono   || '',
        profile.email      || '',
        profile.direccion  || '',
        data[i][7],   // createdAt: no tocar
        now,          // updatedAt
      ]]);
      return { success: true, updated: true };
    }
  }

  // Registro nuevo
  sheet.appendRow([
    invitado_user.trim(),
    profile.nombre     || '',
    profile.apellido   || '',
    profile.id_cc      || '',
    profile.telefono   || '',
    profile.email      || '',
    profile.direccion  || '',
    now,   // createdAt
    now,   // updatedAt
  ]);
  return { success: true, updated: false };
}

function _getGuestProfile_(invitado_user, guestToken) {
  if (!guestToken || !guestToken.startsWith('G-')) {
    return { success: false, error: 'Sesión de invitado no válida' };
  }
  const ss      = SpreadsheetApp.openById(CFG_BODAS.SHEET_ID);
  const profile = _getGuestProfileData_(ss, invitado_user);
  if (!profile) return { success: true, profileComplete: false, profile: null };
  return { success: true, profileComplete: true, profile };
}

function _guestProfileExists_(ss, invitado_user) {
  const sheet = ss.getSheetByName(CFG_BODAS.SHEET_INVITADOS);
  if (!sheet) return false;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0] || '').trim().toLowerCase() === invitado_user.trim().toLowerCase()) {
      return !!String(data[i][1] || '').trim(); // nombre presente = completo
    }
  }
  return false;
}

function _getGuestProfileData_(ss, invitado_user) {
  const sheet = ss.getSheetByName(CFG_BODAS.SHEET_INVITADOS);
  if (!sheet) return null;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0] || '').trim().toLowerCase() === invitado_user.trim().toLowerCase()) {
      return {
        nombre:    String(data[i][1] || ''),
        apellido:  String(data[i][2] || ''),
        id_cc:     String(data[i][3] || ''),
        telefono:  String(data[i][4] || ''),
        email:     String(data[i][5] || ''),
        direccion: String(data[i][6] || ''),
      };
    }
  }
  return null;
}

// ── INVITADOS: VER LISTA ──────────────────────────────────────────────────────

function _getGuestList_(invitado_user, guestToken) {
  if (!guestToken || !guestToken.startsWith('G-')) {
    return { success: false, error: 'Sesión de invitado no válida' };
  }

  const ss    = SpreadsheetApp.openById(CFG_BODAS.SHEET_ID);
  const usrSh = ss.getSheetByName(CFG_BODAS.SHEET_USUARIOS);
  if (!usrSh) return { success: false, error: 'Configuración no disponible' };

  // Encontrar coupleName para este invitado_user
  let coupleName = null;
  const usrData  = usrSh.getDataRange().getValues();
  for (let i = 1; i < usrData.length; i++) {
    if (String(usrData[i][20] || '').trim().toLowerCase() === invitado_user.trim().toLowerCase()) {
      // Col W (idx 22): estado_lista — vacío se trata como ACTIVA
      const estadoLista = String(usrData[i][22] || 'ACTIVA').trim().toUpperCase();
      if (estadoLista === 'BLOQUEADA') {
        return { success: false, error: 'La lista de bodas no está disponible en este momento.' };
      }
      coupleName = String(usrData[i][2]);
      break;
    }
  }
  if (!coupleName) return { success: false, error: 'Lista no encontrada' };

  const listSh = ss.getSheetByName(CFG_BODAS.SHEET_LISTA);
  if (!listSh) return { success: true, coupleName, items: [] };

  const listData = listSh.getDataRange().getValues();
  const items    = [];
  for (let i = 1; i < listData.length; i++) {
    if (String(listData[i][1]).trim() === coupleName.trim()) {
      const accion = String(listData[i][11] || '').trim(); // col L
      if (accion === 'removido') continue;
      const [, , brand, productId, productName, variantSku, variantLabel, precio_cop, qty] = listData[i];
      const reservadas = _getUnidadesReservadas_(ss, productId, variantSku);
      items.push({ brand, productId, productName, variantSku, variantLabel, precio_cop, qty, reservadas });
    }
  }

  return { success: true, coupleName, items };
}

function _getUnidadesReservadas_(ss, productId, variantSku) {
  const sheet = ss.getSheetByName(CFG_BODAS.SHEET_PAGOS);
  if (!sheet) return 0;
  const data = sheet.getDataRange().getValues();
  let total  = 0;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][5]) === String(productId) && String(data[i][6]) === String(variantSku)) {
      total += Number(data[i][8] || 0);
    }
  }
  return total;
}

// ── INVITADOS: CREAR PEDIDO ───────────────────────────────────────────────────

function _createPedidoInvitado_(guestToken, pedido) {
  if (!guestToken || !guestToken.startsWith('G-')) {
    return { success: false, error: 'Sesión de invitado no válida' };
  }
  if (!pedido || !pedido.coupleUsername) {
    return { success: false, error: 'Datos del pedido incompletos' };
  }

  const ss    = SpreadsheetApp.openById(CFG_BODAS.SHEET_ID);
  const sheet = ss.getSheetByName(CFG_BODAS.SHEET_PAGOS);
  if (!sheet) return { success: false, error: 'Hoja PagosInvitados no encontrada' };

  const pagoId    = 'PG-' + Utilities.getUuid().split('-')[0].toUpperCase();
  const timestamp = Utilities.formatDate(new Date(), CFG_BODAS.TZ_BOGOTA, 'yyyy-MM-dd HH:mm:ss');

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
    '',         // wompiReference — se completa al confirmar pago
    timestamp,
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
    if (String(data[i][0]).trim() === String(pagoId).trim()) {
      sheet.getRange(i + 1, 11).setValue(wompiRef); // Col K
      return { success: true };
    }
  }
  return { success: false, error: 'Pedido no encontrado' };
}

// ── UTILIDADES ────────────────────────────────────────────────────────────────

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

function _respond_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
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
        { col: 4,  values: ['TRUE','FALSE']        },  // D: active
        { col: 23, values: ['ACTIVA','BLOQUEADA']  },  // W: estado_lista
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

    // Siempre escribe encabezados en fila 1
    const headerRange = sheet.getRange(1, 1, 1, hoja.headers.length);
    headerRange.setValues([hoja.headers]);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#8b6f5e');
    headerRange.setFontColor('#ffffff');
    sheet.setFrozenRows(1);

    // Dropdowns en columnas de datos (fila 2 hasta maxRows)
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
/**
 * 1. Edita los valores entre comillas (username, clave, nombre de pareja)
 * 2. Presiona ▶ para ejecutar
 * 3. Revisa el log (Ver → Registros) para confirmar
 */
function crearUsuario() {
  /* ⬇️  DESCOMENTA Y EDITA esta línea antes de ejecutar:
  _agregarUsuario('esposos_garcia', 'clave_segura', 'María & Andrés García');
  */
  Logger.log('⚠️  crearUsuario: descomenta y edita la línea _agregarUsuario(...) antes de ejecutar.');
}

// ── CREAR INVITADO (ejecutar manualmente) ─────────────────────────────────────
/**
 * 1. Edita los valores: username de la pareja, username del invitado, clave del invitado
 * 2. Presiona ▶ para ejecutar
 * 3. Revisa el log (Ver → Registros) para confirmar
 */
function crearInvitado() {
  /* ⬇️  DESCOMENTA Y EDITA esta línea antes de ejecutar:
  _agregarInvitado('esposos_garcia', 'invitado_juan', 'clave123');
  */
  Logger.log('⚠️  crearInvitado: descomenta y edita la línea _agregarInvitado(...) antes de ejecutar.');
}

function _agregarInvitado(coupleUsername, invitadoUser, invitadoPass) {
  Logger.log('▶ _agregarInvitado | pareja="' + coupleUsername + '" invitado="' + invitadoUser + '"');
  if (!coupleUsername || !invitadoUser || !invitadoPass) {
    Logger.log('❌ Faltan parámetros: coupleUsername="' + coupleUsername + '" invitadoUser="' + invitadoUser + '" invitadoPass=' + (invitadoPass ? '(ok)' : '(vacío)'));
    return;
  }

  const ss    = SpreadsheetApp.openById(CFG_BODAS.SHEET_ID);
  const sheet = ss.getSheetByName(CFG_BODAS.SHEET_USUARIOS);
  if (!sheet) {
    Logger.log('❌ Hoja "' + CFG_BODAS.SHEET_USUARIOS + '" no encontrada. Ejecuta setupSheets() primero.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  Logger.log('ℹ️  Usuarios en hoja: ' + (data.length - 1) + ' filas de datos');

  for (let i = 1; i < data.length; i++) {
    const rowUser = String(data[i][0] || '').trim();
    Logger.log('   fila ' + (i+1) + ': username="' + rowUser + '"');
    if (rowUser.toLowerCase() === coupleUsername.trim().toLowerCase()) {
      sheet.getRange(i + 1, 21).setValue(invitadoUser.trim());    // Col U: invitado_user
      sheet.getRange(i + 1, 22).setValue(_sha256_(invitadoPass)); // Col V: invitado_passHash
      Logger.log('✅ Invitado "' + invitadoUser + '" asignado a la pareja "' + coupleUsername + '" (fila ' + (i+1) + ').');
      return;
    }
  }
  Logger.log('❌ Pareja "' + coupleUsername + '" no encontrada. Verifica el username exacto en col A de la hoja Usuarios.');
}

function _agregarUsuario(username, password, coupleName) {
  Logger.log('▶ _agregarUsuario | username="' + username + '" pareja="' + coupleName + '"');
  if (!username || !password || !coupleName) {
    Logger.log('❌ Faltan parámetros: username="' + username + '" coupleName="' + coupleName + '" password=' + (password ? '(ok)' : '(vacío)'));
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
    const rowUser = String(data[i][0] || '').trim();
    if (rowUser.toLowerCase() === username.trim().toLowerCase()) {
      Logger.log('❌ Usuario "' + username + '" ya existe en fila ' + (i+1) + '. No se creó duplicado.');
      return;
    }
  }

  sheet.appendRow([username.trim(), _sha256_(password), coupleName, true, new Date().toISOString()]);
  Logger.log('✅ Usuario "' + username + '" creado con éxito. Pareja: "' + coupleName + '"');
  Logger.log('   PasswordHash (primeros 8 chars): ' + _sha256_(password).substring(0, 8) + '...');
}
