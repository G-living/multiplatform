// ============================================================
// TTT — Google Apps Script Backend v1.0
// Tessitura Toscana Telerie | G-Living
// ============================================================
// Spreadsheet ID : 1H094kL9ZtbipFfsm4Gn12RczSYTQdq1u8BxxZDB9waY
// Publicar: Deploy → New deployment → Web App → Execute as: Me → Access: Anyone
// Setup inicial (ejecutar una vez): setupSheets()
// ============================================================

'use strict';

const CFG = {
  SPREADSHEET_ID  : '1H094kL9ZtbipFfsm4Gn12RczSYTQdq1u8BxxZDB9waY',
  NOMBRE_TIENDA   : 'TTT — Tessitura Toscana Telerie | G-Living | Est. 2018',
  EMAIL_ADMIN     : 'filippo.massara2016@gmail.com',
  EMAIL_REMITENTE : 'filippo.massara2016@gmail.com',
  WHATSAPP        : '+573004257367',
  WEBSITE         : 'https://g-living.github.io/multiplatform/',
  API_TOKEN       : 'ttt_tLaO8fenZj_FyP0HCW8N5KdzXZe28rSSYZyUy_j6',
  CURRENCY        : 'EUR',
  TZ              : 'America/Bogota',
};


// ============================================================
// ROUTER — doGet / doPost
// ============================================================
function doGet(e) {
  try {
    const p      = e.parameter || {};
    const action = p.action || '';
    let result;

    if (action === 'ping')          result = { ok: true, ts: new Date().toISOString() };
    else if (action === 'getCliente')    result = _getCliente(p.telefono || '');
    else if (action === 'getCampanias')  result = _getCampanias();
    else                                 result = { ok: false, error: 'Acción GET no reconocida: ' + action };

    return _jsonOut(result);
  } catch(err) {
    return _jsonOut({ ok: false, error: err.message });
  }
}

function doPost(e) {
  try {
    let payload = {};
    if (e.postData?.contents) {
      const raw = e.postData.contents;
      if (raw.includes('data=')) {
        const decoded = decodeURIComponent(raw.replace(/^data=/, ''));
        payload = JSON.parse(decoded);
      } else {
        payload = JSON.parse(raw);
      }
    }

    // Verificar token
    if (payload._token !== CFG.API_TOKEN) {
      return _jsonOut({ ok: false, error: 'Token inválido' });
    }

    const action = payload.action || '';
    let result;

    if      (action === 'createWishlist')  result = _createWishlist(payload);
    else                                    result = { ok: false, error: 'Acción POST no reconocida: ' + action };

    return _jsonOut(result);
  } catch(err) {
    Logger.log('doPost error: ' + err.message);
    return _jsonOut({ ok: false, error: err.message });
  }
}


// ============================================================
// WISHLIST
// ============================================================
function _createWishlist(p) {
  const ss     = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
  const sheet  = ss.getSheetByName('Wishlists');
  if (!sheet) return { ok: false, error: 'Hoja Wishlists no encontrada' };

  const ref      = p.referencia || _genRef('TTT-WA');
  const now      = _now();
  const cliente  = p.cliente  || {};
  const entrega  = p.entrega  || {};
  const prods    = p.productos || [];
  const total    = p.total    || 0;

  // Guardar cada línea de producto
  prods.forEach(prod => {
    sheet.appendRow([
      now,
      ref,
      p.campaniaId   || '',
      p.catalogoId   || 'TTT',
      cliente.nombre || '',
      cliente.telefono || '',
      cliente.email  || '',
      entrega.ciudad || '',
      entrega.direccion || '',
      prod.productSku  || '',
      prod.productName || '',
      prod.medida      || '',
      prod.sku         || '',
      prod.precio      || 0,
      prod.quantity    || 1,
      (prod.precio || 0) * (prod.quantity || 1),
      total,
      'PENDIENTE',   // Estado
    ]);
  });

  SpreadsheetApp.flush();

  // Email admin
  _emailAdminWishlist(ref, cliente, prods, total);

  return { ok: true, referencia: ref };
}


// ============================================================
// CLIENTES
// ============================================================
function _getCliente(telefono) {
  if (!telefono) return { ok: false, error: 'telefono requerido' };
  const ss    = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Clientes');
  if (!sheet) return { ok: false, error: 'Hoja Clientes no encontrada' };

  const data = sheet.getDataRange().getValues();
  const tel  = String(telefono).replace(/\D/g,'');

  for (let i = 1; i < data.length; i++) {
    const rowTel = String(data[i][1] || '').replace(/\D/g,'');
    if (rowTel === tel) {
      return {
        ok:      true,
        cliente: {
          nombre:    data[i][0] || '',
          telefono:  data[i][1] || '',
          email:     data[i][2] || '',
          ciudad:    data[i][3] || '',
          direccion: data[i][4] || '',
        }
      };
    }
  }

  return { ok: false, error: 'Cliente no encontrado' };
}


// ============================================================
// CAMPAÑAS
// ============================================================
function _getCampanias() {
  try {
    const ss    = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Campanias');
    if (!sheet) return { ok: true, campanias: [] };

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return { ok: true, campanias: [] };

    const headers = data[0];
    const campanias = data.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });

    return { ok: true, campanias };
  } catch(err) {
    return { ok: true, campanias: [] };
  }
}


// ============================================================
// EMAIL ADMIN — nueva wishlist
// ============================================================
function _emailAdminWishlist(ref, cliente, prods, total) {
  try {
    const subject = `[TTT] Nueva wishlist ${ref} — ${cliente.nombre || 'Sin nombre'}`;
    const rows = prods.map(p =>
      `<tr><td>${p.productName||''}</td><td>${p.medida||''}</td><td>${p.sku||''}</td><td>${p.precio||0} EUR</td><td>${p.quantity||1}</td><td>${(p.precio||0)*(p.quantity||1)} EUR</td></tr>`
    ).join('');

    const body = `
      <h2 style="font-family:Georgia,serif;color:#1A1A1A;">Nueva Wishlist TTT</h2>
      <p><strong>Ref:</strong> ${ref}</p>
      <p><strong>Cliente:</strong> ${cliente.nombre || '-'} | ${cliente.telefono || '-'} | ${cliente.email || '-'}</p>
      <p><strong>Entrega:</strong> ${(cliente.ciudad||'')} — ${(cliente.direccion||'')}</p>
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px;">
        <tr style="background:#C9A961;color:white;"><th>Producto</th><th>Medida</th><th>SKU</th><th>Precio</th><th>Qty</th><th>Subtotal</th></tr>
        ${rows}
        <tr><td colspan="5" align="right"><strong>Total:</strong></td><td><strong>${total} EUR</strong></td></tr>
      </table>
    `;

    GmailApp.sendEmail(CFG.EMAIL_ADMIN, subject, '', { htmlBody: body, name: CFG.NOMBRE_TIENDA });
  } catch(err) {
    Logger.log('_emailAdminWishlist error: ' + err.message);
  }
}


// ============================================================
// SETUP — ejecutar una vez para crear las hojas
// ============================================================
function setupSheets() {
  const ss = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);

  const sheetDefs = {
    'Wishlists': [
      'Fecha','Referencia','Campaña_ID','Catálogo_ID',
      'Nombre','Teléfono','Email',
      'Ciudad','Dirección',
      'Product_SKU','Producto','Medida','SKU_Variante',
      'Precio_EUR','Cantidad','Subtotal_EUR','Total_EUR',
      'Estado'
    ],
    'Clientes': ['Nombre','Teléfono','Email','Ciudad','Dirección','Fecha_creación'],
    'Campanias': ['Campaña_ID','Descuento_Pct','Activa','Descripción'],
  };

  Object.entries(sheetDefs).forEach(([name, headers]) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length)
        .setBackground('#C9A961')
        .setFontColor('#FFFFFF')
        .setFontWeight('bold');
      sheet.setFrozenRows(1);
      Logger.log('Creada hoja: ' + name);
    } else {
      Logger.log('Hoja ya existe: ' + name);
    }
  });

  Logger.log('setupSheets() completado ✓');
}


// ============================================================
// UTILIDADES
// ============================================================
function _genRef(prefix) {
  return prefix + '-' + Date.now() + '-' + Math.floor(Math.random() * 9999);
}

function _now() {
  return Utilities.formatDate(new Date(), CFG.TZ, 'yyyy-MM-dd HH:mm:ss');
}

function _jsonOut(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
