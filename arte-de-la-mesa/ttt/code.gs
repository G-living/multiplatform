// ============================================================
// TTT — Google Apps Script Backend v2.0
// Tessitura Toscana Telerie | G-Living
// ============================================================
// Spreadsheet ID : 1H094kL9ZtbipFfsm4Gn12RczSYTQdq1u8BxxZDB9waY
// GSA URL        : https://script.google.com/macros/s/AKfycbyDbEdP5a5AhzhpcVGKCK1iS10uw02cscTMG62pW68fw_5PDOVs1RV8lhBcebr-1mEc/exec
// Publicar: Deploy → New deployment → Web App → Execute as: Me → Access: Anyone
// Setup inicial (una vez): setupSheets()
// ============================================================
// v2.0: checkout completo — Wishlists, Pedidos_Wompi, GiftCards,
//       Clientes, Influencers, Campanias, Log
// ============================================================

'use strict';

const CFG = {
  SPREADSHEET_ID  : '1H094kL9ZtbipFfsm4Gn12RczSYTQdq1u8BxxZDB9waY',
  NOMBRE_TIENDA   : 'TTT — Tessitura Toscana Telerie | G-Living | Est. 2018',
  EMAIL_ADMIN     : 'filippo.massara2016@gmail.com',
  EMAIL_REMITENTE : 'filippo.massara2016@gmail.com',
  WHATSAPP        : '+573004257367',
  WEBSITE         : 'https://g-living.github.io/multiplatform/',
  CATALOGO        : 'https://g-living.github.io/multiplatform/arte-de-la-mesa/ttt/ttt-index.html',
  API_TOKEN       : 'ttt_tLaO8fenZj_FyP0HCW8N5KdzXZe28rSSYZyUy_j6',
  CURRENCY        : 'EUR',
  TZ              : 'America/Bogota',
  SHEETS: {
    WISHLIST      : 'Wishlists',
    PEDIDOS_WOMPI : 'Pedidos_Wompi',
    GIFT_CARDS    : 'GiftCards',
    CLIENTES      : 'Clientes',
    CAMPANIAS     : 'Campanias',
    INFLUENCERS   : 'Influencers',
    LOG           : 'Log',
  },
};


// ============================================================
// ROUTER — doPost / doGet
// ============================================================

function doPost(e) {
  try {
    let body = {};
    if (e.parameter && e.parameter.data) {
      body = JSON.parse(e.parameter.data);
    } else if (e.postData && e.postData.contents) {
      const raw = e.postData.contents;
      if (raw.startsWith('data=')) {
        body = JSON.parse(decodeURIComponent(raw.slice(5)));
      } else {
        body = JSON.parse(raw);
      }
    }

    if (body._token !== CFG.API_TOKEN) {
      _log('doPost_AUTH_FAIL', body.action || 'unknown', 'token inválido');
      return _jsonOut({ ok: false, error: 'Unauthorized' });
    }

    const action = body.action || '';
    _log('doPost', action, JSON.stringify(body).slice(0, 200));

    let result;
    switch (action) {
      case 'createWishlist'      : result = _createWishlist(body);        break;
      case 'updateEstadoWishlist': result = _updateEstadoWishlist(body);  break;
      case 'createPedidoWompi'   : result = _createPedidoWompi(body);     break;
      case 'confirmarPagoWompi'  :
        result = (String(body.referencia || '').startsWith('GIFT-'))
          ? _confirmarPagoGiftCard(body)
          : _confirmarPagoWompi(body);
        break;
      case 'createGiftCard'      : result = _createGiftCard(body);        break;
      case 'cancelGiftCard'      : result = _cancelGiftCard(body);        break;
      case 'redeemDono'          : result = _redeemDono(body);            break;
      case 'upsertCliente'       : result = _upsertCliente(body);         break;
      case 'ping'                : result = { ok: true, ts: new Date().toISOString() }; break;
      default:
        result = { ok: false, error: 'Acción POST no reconocida: ' + action };
    }
    return _jsonOut(result);
  } catch(err) {
    _log('doPost_ERROR', err.message);
    return _jsonOut({ ok: false, error: err.message });
  }
}

function doGet(e) {
  try {
    const p = e.parameter || {};
    const action = p.action || '';
    let result;
    switch (action) {
      case 'getCliente'   : result = _getCliente(p.telefono);            break;
      case 'getPedido'    : result = _getPedido(p.referencia);           break;
      case 'getGiftCard'  : result = _getGiftCard(p.codigo || p.code);   break;
      case 'validateDono' : result = _getGiftCard(p.code   || p.codigo); break;
      case 'getCampanias' : result = _getCampanias();                    break;
      case 'getInfluencer': result = _getInfluencer(p.codigo);           break;
      case 'ping'         : result = { ok: true, ts: new Date().toISOString() }; break;
      default:
        result = { ok: false, error: 'Acción GET no reconocida: ' + action };
    }
    return _jsonOut(result);
  } catch(err) {
    _log('doGet_ERROR', err.message);
    return _jsonOut({ ok: false, error: err.message });
  }
}


// ============================================================
// WISHLIST
// Cols: Campaña_ID | Catalogo_ID | Timestamp | Referencia | ClienteID |
//       Nombre | Apellido | Email | Teléfono | Tipo_Doc | Num_Doc |
//       Dirección | Barrio | Ciudad | Notas |
//       Productos_JSON | Total_EUR | Estado_Wishlist | Notas_internas
// ============================================================

function _createWishlist(b) {
  const sheet  = _getSheet(CFG.SHEETS.WISHLIST);
  const ref    = b.referencia || 'WA-TTT-' + Date.now();
  const ts     = new Date();
  const cli    = b.cliente  || {};
  const ent    = b.entrega  || {};
  const prods  = b.productos || [];
  const total  = b.total    || 0;
  const tel    = _fmtTel(cli.codigoPais, cli.telefono);

  const cliId = _upsertCliente({
    telefono  : tel,
    nombre    : cli.nombre    || '',
    apellido  : cli.apellido  || '',
    email     : cli.email     || '',
    tipoDoc   : cli.tipoDoc   || '',
    numDoc    : cli.numDoc    || '',
    cumpleDia : cli.cumpleDia || '',
    cumpleMes : cli.cumpleMes || '',
    direccion : ent.direccion || '',
    barrio    : ent.barrio    || '',
    ciudad    : ent.ciudad    || '',
  }).clienteId;

  sheet.appendRow([
    b.campaniaId  || '',                 // A  Campaña_ID
    b.catalogoId  || 'TTT',             // B  Catalogo_ID
    ts,                                  // C  Timestamp
    ref,                                 // D  Referencia
    cliId,                               // E  ClienteID
    cli.nombre    || '',                 // F  Nombre
    cli.apellido  || '',                 // G  Apellido
    cli.email     || '',                 // H  Email
    tel,                                 // I  Teléfono
    cli.tipoDoc   || '',                 // J  Tipo_Doc
    cli.numDoc    || '',                 // K  Num_Doc
    ent.direccion || '',                 // L  Dirección
    ent.barrio    || '',                 // M  Barrio
    ent.ciudad    || '',                 // N  Ciudad
    ent.notas     || '',                 // O  Notas
    JSON.stringify(prods),               // P  Productos_JSON
    total,                               // Q  Total_EUR
    'PENDIENTE',                         // R  Estado_Wishlist
    '',                                  // S  Notas_internas
  ]);

  SpreadsheetApp.flush();

  if (cli.email) _emailAdminWishlist(ref, cli, prods, total);
  _log('createWishlist', ref, cliId, 'OK');
  return { ok: true, referencia: ref, clienteId: cliId };
}

function _updateEstadoWishlist(b) {
  const sheet  = _getSheet(CFG.SHEETS.WISHLIST);
  const ref    = b.referencia || '';
  const estado = b.estadoWA || b.estado || 'ENVIADO_WA';
  if (!ref) return { ok: false, error: 'Referencia requerida' };

  const data   = sheet.getDataRange().getValues();
  const header = data[0];
  const colRef    = header.indexOf('Referencia');
  const colEstado = header.indexOf('Estado_Wishlist');
  if (colRef < 0 || colEstado < 0) return { ok: false, error: 'Columnas no encontradas en Wishlists' };

  for (let i = 1; i < data.length; i++) {
    if (data[i][colRef] === ref) {
      sheet.getRange(i + 1, colEstado + 1).setValue(estado);
      _log('updateEstadoWishlist', ref, estado, 'OK');
      return { ok: true, referencia: ref, estado };
    }
  }
  return { ok: false, error: 'Referencia no encontrada: ' + ref };
}


// ============================================================
// PEDIDOS WOMPI
// Cols: Campaña_ID | Catalogo_ID | Timestamp | Referencia |
//       Wompi_Transaction_ID | Estado_Pago_Wompi |
//       ClienteID | Nombre | Apellido | Email | Teléfono |
//       Tipo_Doc | Num_Doc |
//       Dirección | Barrio | Ciudad | Notas_entrega |
//       Productos_JSON | Subtotal_EUR |
//       Descuento_Influencer_COP | Descuento_GiftCard_COP |
//       Total_a_Pagar_COP | Porcentaje_Pagado | Forma_Pago |
//       Saldo_Pendiente_COP | Estado_Pedido | Fecha_Despacho |
//       Notas_Internas | Influencer_Codigo
// ============================================================

function _createPedidoWompi(b) {
  const sheet = _getSheet(CFG.SHEETS.PEDIDOS_WOMPI);
  const ref   = (b.referencia && b.referencia !== '') ? b.referencia : ('WP-TTT-' + Date.now());

  // Idempotencia — no duplicar si la referencia ya existe
  if (b.referencia && b.referencia !== '') {
    const existing = sheet.getDataRange().getValues();
    const colRef   = existing[0].indexOf('Referencia');
    if (colRef >= 0) {
      for (let i = 1; i < existing.length; i++) {
        if (existing[i][colRef] === ref) {
          _log('createPedidoWompi', ref, 'DUPLICATE_SKIPPED');
          const colCli = existing[0].indexOf('ClienteID');
          return { ok: true, referencia: ref, clienteId: colCli >= 0 ? existing[i][colCli] : '', rowNum: i + 1 };
        }
      }
    }
  }

  const ts  = new Date();
  const cli = b.cliente || {};
  const ent = b.entrega || {};
  const tel = _fmtTel(cli.codigoPais, cli.telefono);

  const cliId = _upsertCliente({
    telefono  : tel,
    nombre    : cli.nombre    || '',
    apellido  : cli.apellido  || '',
    email     : cli.email     || '',
    tipoDoc   : cli.tipoDoc   || '',
    numDoc    : cli.numDoc    || '',
    cumpleDia : cli.cumpleDia || '',
    cumpleMes : cli.cumpleMes || '',
    direccion : ent.direccion || '',
    barrio    : ent.barrio    || '',
    ciudad    : ent.ciudad    || '',
    _soloTotal: true,
  }).clienteId;

  const saldoPendiente = (b.porcentajePagado || 100) === 60
    ? _roundCOP((b.totalAPagar || 0) * 0.4) : 0;

  sheet.appendRow([
    b.campaniaId          || '',         // A  Campaña_ID
    b.catalogoId          || 'TTT',     // B  Catalogo_ID
    ts,                                  // C  Timestamp
    ref,                                 // D  Referencia
    b.wompiTransactionId  || '',         // E  Wompi_Transaction_ID
    'PENDING',                           // F  Estado_Pago_Wompi
    cliId,                               // G  ClienteID
    cli.nombre            || '',         // H  Nombre
    cli.apellido          || '',         // I  Apellido
    cli.email             || '',         // J  Email
    tel,                                 // K  Teléfono
    cli.tipoDoc           || '',         // L  Tipo_Doc
    cli.numDoc            || '',         // M  Num_Doc
    ent.direccion         || '',         // N  Dirección
    ent.barrio            || '',         // O  Barrio
    ent.ciudad            || '',         // P  Ciudad
    ent.notas             || '',         // Q  Notas_entrega
    JSON.stringify(b.productos || []),   // R  Productos_JSON
    b.subtotal            || 0,          // S  Subtotal_EUR
    b.discInfluencer      || 0,          // T  Descuento_Influencer_COP
    b.discGiftCard        || 0,          // U  Descuento_GiftCard_COP
    b.totalAPagar         || 0,          // V  Total_a_Pagar_COP
    b.porcentajePagado    || 100,        // W  Porcentaje_Pagado
    b.formaPago           || 'WOMPI_100',// X  Forma_Pago
    saldoPendiente,                      // Y  Saldo_Pendiente_COP
    'PENDIENTE',                         // Z  Estado_Pedido
    '',                                  // AA Fecha_Despacho
    '',                                  // AB Notas_Internas
    b.influencerCodigo    || '',         // AC Influencer_Codigo
  ]);

  SpreadsheetApp.flush();
  const rowNum = sheet.getLastRow();

  _log('createPedidoWompi', ref, cliId, 'OK');
  return { ok: true, referencia: ref, clienteId: cliId, rowNum };
}

function _confirmarPagoWompi(b) {
  const ref    = b.referencia    || '';
  const status = b.status        || 'APPROVED';
  const txId   = b.transactionId || '';

  if (!ref) return { ok: false, error: 'Referencia requerida' };

  // ── Lean path: pedidoPayload presente → crear + redimir en un solo call ──
  let _leanRowNum = 0;
  if (b.pedidoPayload && status === 'APPROVED') {
    const p = b.pedidoPayload;
    const cr = _createPedidoWompi({
      campaniaId:       p.campaniaId       || '',
      catalogoId:       p.catalogoId       || 'TTT',
      cliente:          p.cliente          || {},
      entrega:          p.entrega          || {},
      productos:        p.productos        || [],
      formaPago:        p.formaPago        || 'WOMPI_100',
      subtotal:         p.subtotal         || 0,
      descuento:        p.descuento        || 0,
      total:            p.total            || 0,
      porcentajePagado: p.porcentajePagado || 100,
      influencerCodigo: p.influencerCodigo || '',
      discInfluencer:   p.discInfluencer   || 0,
      discGiftCard:     p.discGiftCard     || 0,
      disc3pct:         p.disc3pct         || 0,
      totalAPagar:      p.totalAPagar      || 0,
      referencia:       ref,
      _skipEmail:       true,
    });
    _leanRowNum = cr.rowNum || 0;
    // Redimir bono/GC si aplica
    if (p.bono && p.bono.code && p.bono.monto > 0) {
      _redeemDono({ code: p.bono.code, amount: p.bono.monto, referencia: ref });
    }
  }

  const sheet = _getSheet(CFG.SHEETS.PEDIDOS_WOMPI);
  SpreadsheetApp.flush();

  const lastCol = sheet.getLastColumn();
  const header  = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  const colRef    = header.indexOf('Referencia');
  const colPagoWP = header.indexOf('Estado_Pago_Wompi');
  const colPedido = header.indexOf('Estado_Pedido');
  const colTxId   = header.indexOf('Wompi_Transaction_ID');

  if (colRef < 0 || colPagoWP < 0 || colPedido < 0)
    return { ok: false, error: 'Columnas no encontradas en Pedidos_Wompi' };

  const estadoPedido = status === 'APPROVED' ? 'CONFIRMADO'
    : (status === 'PENDING' ? 'PENDIENTE' : 'CANCELADO');

  // ── Lean: actualizar por rowNum directo ──
  if (_leanRowNum > 0 && b.pedidoPayload) {
    const p   = b.pedidoPayload;
    const cli = p.cliente || {};

    sheet.getRange(_leanRowNum, colPagoWP + 1).setValue(status);
    sheet.getRange(_leanRowNum, colPedido  + 1).setValue(estadoPedido);
    if (txId && colTxId >= 0) sheet.getRange(_leanRowNum, colTxId + 1).setValue(txId);

    _log('confirmarPagoWompi_lean', ref, status, estadoPedido);

    const email       = cli.email         || '';
    const nombre      = cli.nombre        || '';
    const prods       = p.productos       || [];
    const total       = p.total           || 0;
    const pctPagado   = Number(p.porcentajePagado) || 100;
    const formaPago   = String(p.formaPago || '');
    const discGiftCard = Number(p.discGiftCard || 0);

    let giftInfo = null;
    const giftMatch    = formaPago.match(/GIFT:([A-Z0-9-]+)/);
    const giftTotMatch = formaPago.match(/^GIFT_CARD:([A-Z0-9-]+)/);
    if (giftMatch)         giftInfo = { codigo: giftMatch[1],    monto: discGiftCard, tipo: 'MIXTO' };
    else if (giftTotMatch) giftInfo = { codigo: giftTotMatch[1], monto: discGiftCard, tipo: 'TOTAL' };
    else if (formaPago === 'GIFT_CARD') giftInfo = { codigo: '', monto: discGiftCard, tipo: 'TOTAL' };

    if (email) {
      if (status === 'APPROVED')
        _emailPagoConfirmado(email, nombre, ref, prods, total, giftInfo, pctPagado, txId);
      else if (['DECLINED','ERROR','VOIDED'].includes(status))
        _emailPagoCancelado(email, nombre, ref, status);
    }

    if (status === 'APPROVED') {
      const tel = _fmtTel(cli.codigoPais, cli.telefono);
      _upsertCliente({
        telefono: tel,
        tipoDoc:  cli.tipoDoc || '',
        numDoc:   cli.numDoc  || '',
        total:    _roundCOP(p.subtotal || total),
        _pedidoRef: ref,
      });
    }

    return { ok: true, referencia: ref, status, estadoPedido };
  }

  // ── Estándar: escanear hoja ──
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][colRef] !== ref) continue;

    sheet.getRange(i + 1, colPagoWP + 1).setValue(status);
    sheet.getRange(i + 1, colPedido + 1).setValue(estadoPedido);
    if (txId && colTxId >= 0) sheet.getRange(i + 1, colTxId + 1).setValue(txId);

    _log('confirmarPagoWompi', ref, status, estadoPedido);

    const email    = data[i][header.indexOf('Email')]   || '';
    const nombre   = data[i][header.indexOf('Nombre')]  || '';
    const prods    = _parseJSON(data[i][header.indexOf('Productos_JSON')]);
    const pctPagado = Number(data[i][header.indexOf('Porcentaje_Pagado')] || 100);
    const formaPago = String(data[i][header.indexOf('Forma_Pago')] || '');
    const discGiftCard = Number(data[i][header.indexOf('Descuento_GiftCard_COP')] || 0);
    const totalAPagar  = Number(data[i][header.indexOf('Total_a_Pagar_COP')]     || 0);

    let total = 0;
    if (formaPago.startsWith('GIFT_CARD') && !formaPago.includes('+GIFT')) {
      total = 0;
    } else if (pctPagado === 60) {
      total = Math.floor(totalAPagar * 0.6 / 1000) * 1000;
    } else {
      total = Math.floor(totalAPagar * 0.97 / 1000) * 1000;
    }

    let giftInfo = null;
    const giftMatch    = formaPago.match(/GIFT:([A-Z0-9-]+)/);
    const giftTotMatch = formaPago.match(/^GIFT_CARD:([A-Z0-9-]+)/);
    if (giftMatch)         giftInfo = { codigo: giftMatch[1],    monto: discGiftCard, tipo: 'MIXTO' };
    else if (giftTotMatch) giftInfo = { codigo: giftTotMatch[1], monto: discGiftCard, tipo: 'TOTAL' };

    if (email) {
      if (status === 'APPROVED')
        _emailPagoConfirmado(email, nombre, ref, prods, total, giftInfo, pctPagado, txId);
      else if (['DECLINED','ERROR','VOIDED'].includes(status))
        _emailPagoCancelado(email, nombre, ref, status);
    }
    return { ok: true, referencia: ref, status, estadoPedido };
  }
  return { ok: false, error: 'Referencia no encontrada: ' + ref };
}


// ============================================================
// GIFT CARDS
// Cols: Timestamp | Referencia | Codigo | Valor_COP | Estado_Pago |
//       Estado_Gift | Emisor_Nombre | Emisor_Email | Emisor_Tel |
//       Destinatario_Nombre | Destinatario_Email | Mensaje |
//       Wompi_Transaction_ID | Vigencia_Hasta | Saldo_Disponible_COP | Notas
// ============================================================

function _createGiftCard(b) {
  const sheet = _getSheet(CFG.SHEETS.GIFT_CARDS);
  const ref   = b.referencia || 'GIFT-TTT-' + Date.now();
  const code  = b.codigo     || _genGiftCode();

  // Idempotencia por código — si existe PENDIENTE_PAGO con mismo código, actualizar referencia
  const data    = sheet.getDataRange().getValues();
  const header  = data[0];
  const colCod  = header.indexOf('Codigo');
  const colRef  = header.indexOf('Referencia');
  const colEst  = header.indexOf('Estado_Pago');
  if (colCod >= 0 && colRef >= 0) {
    for (let i = 1; i < data.length; i++) {
      if (data[i][colCod] === code && colEst >= 0 && data[i][colEst] === 'PENDIENTE_PAGO') {
        sheet.getRange(i + 1, colRef + 1).setValue(ref);
        _log('createGiftCard', ref, code, 'UPSERTED_REFERENCIA');
        return { ok: true, referencia: ref, codigo: code };
      }
    }
  }

  const ts           = new Date();
  const emisor       = b.emisor       || {};
  const destinatario = b.destinatario || {};
  const vigencia     = _giftVigencia();

  sheet.appendRow([
    ts,                                  // A  Timestamp
    ref,                                 // B  Referencia
    code,                                // C  Codigo
    b.valor         || 0,                // D  Valor_COP
    'PENDIENTE_PAGO',                    // E  Estado_Pago
    'INACTIVA',                          // F  Estado_Gift
    emisor.nombre   || '',               // G  Emisor_Nombre
    emisor.email    || '',               // H  Emisor_Email
    emisor.telefono || '',               // I  Emisor_Tel
    destinatario.nombre   || '',         // J  Destinatario_Nombre
    destinatario.email    || '',         // K  Destinatario_Email
    b.mensaje       || '',               // L  Mensaje
    '',                                  // M  Wompi_Transaction_ID
    vigencia,                            // N  Vigencia_Hasta
    0,                                   // O  Saldo_Disponible_COP
    '',                                  // P  Notas
  ]);

  SpreadsheetApp.flush();
  _log('createGiftCard', ref, code, 'OK');
  return { ok: true, referencia: ref, codigo: code };
}

function _cancelGiftCard(b) {
  const ref  = b.referencia || b.codigo || '';
  if (!ref) return { ok: false, error: 'Referencia o código requerido' };

  const sheet  = _getSheet(CFG.SHEETS.GIFT_CARDS);
  const data   = sheet.getDataRange().getValues();
  const header = data[0];
  const colRef = header.indexOf('Referencia');
  const colCod = header.indexOf('Codigo');
  const colEst = header.indexOf('Estado_Pago');

  for (let i = 1; i < data.length; i++) {
    if (data[i][colRef] === ref || data[i][colCod] === ref) {
      if (colEst >= 0 && data[i][colEst] === 'PENDIENTE_PAGO') {
        sheet.getRange(i + 1, colEst + 1).setValue('CANCELADA');
        _log('cancelGiftCard', ref, 'CANCELADA');
        return { ok: true, referencia: ref };
      }
      return { ok: false, error: 'Gift Card no está en estado PENDIENTE_PAGO' };
    }
  }
  return { ok: false, error: 'Gift Card no encontrada: ' + ref };
}

function _confirmarPagoGiftCard(b) {
  const ref    = b.referencia    || '';
  const status = b.status        || 'APPROVED';
  const txId   = b.transactionId || '';

  if (!ref) return { ok: false, error: 'Referencia requerida' };

  const sheet  = _getSheet(CFG.SHEETS.GIFT_CARDS);
  const data   = sheet.getDataRange().getValues();
  const header = data[0];

  const colRef    = header.indexOf('Referencia');
  const colEstPago = header.indexOf('Estado_Pago');
  const colEstGift = header.indexOf('Estado_Gift');
  const colTxId   = header.indexOf('Wompi_Transaction_ID');
  const colSaldo  = header.indexOf('Saldo_Disponible_COP');
  const colValor  = header.indexOf('Valor_COP');

  for (let i = 1; i < data.length; i++) {
    if (data[i][colRef] !== ref) continue;

    if (status === 'APPROVED') {
      const valor = Number(data[i][colValor] || 0);
      sheet.getRange(i + 1, colEstPago + 1).setValue('APROBADO');
      sheet.getRange(i + 1, colEstGift + 1).setValue('ACTIVA');
      if (colSaldo >= 0) sheet.getRange(i + 1, colSaldo + 1).setValue(valor);
      if (txId && colTxId >= 0) sheet.getRange(i + 1, colTxId + 1).setValue(txId);
      SpreadsheetApp.flush();

      const emisorNombre = data[i][header.indexOf('Emisor_Nombre')] || '';
      const emisorEmail  = data[i][header.indexOf('Emisor_Email')]  || '';
      const destNombre   = data[i][header.indexOf('Destinatario_Nombre')] || '';
      const destEmail    = data[i][header.indexOf('Destinatario_Email')]  || '';
      const codigo       = data[i][header.indexOf('Codigo')]        || '';
      const vigencia     = data[i][header.indexOf('Vigencia_Hasta')] || '';

      if (emisorEmail) _emailGiftCardActivada(emisorEmail, emisorNombre, destNombre, destEmail, codigo, valor, vigencia);
      _log('confirmarPagoGiftCard', ref, status, 'ACTIVA');
      return { ok: true, referencia: ref, status, codigo };
    } else {
      sheet.getRange(i + 1, colEstPago + 1).setValue('CANCELADA');
      SpreadsheetApp.flush();
      _log('confirmarPagoGiftCard', ref, status, 'CANCELADA');
      return { ok: true, referencia: ref, status };
    }
  }
  return { ok: false, error: 'Gift Card no encontrada: ' + ref };
}

function _getGiftCard(codigo) {
  if (!codigo) return { ok: false, error: 'Código requerido' };

  const sheet  = _getSheet(CFG.SHEETS.GIFT_CARDS);
  const data   = sheet.getDataRange().getValues();
  const header = data[0];

  const colCod    = header.indexOf('Codigo');
  const colEstGift = header.indexOf('Estado_Gift');
  const colSaldo  = header.indexOf('Saldo_Disponible_COP');
  const colValor  = header.indexOf('Valor_COP');
  const colVig    = header.indexOf('Vigencia_Hasta');

  for (let i = 1; i < data.length; i++) {
    if (data[i][colCod] !== codigo) continue;

    const estado = data[i][colEstGift] || '';
    const saldo  = Number(data[i][colSaldo] || 0);
    const valor  = Number(data[i][colValor] || 0);
    const vig    = data[i][colVig]   || '';

    if (estado !== 'ACTIVA' || saldo <= 0) {
      const reason = estado === 'CANCELADA' ? 'Gift Card cancelada'
        : estado === 'INACTIVA'  ? 'Gift Card inactiva (pago pendiente)'
        : saldo <= 0             ? 'Saldo insuficiente'
        : 'Gift Card no válida';
      return { ok: false, valid: false, reason };
    }

    // Verificar vigencia
    if (vig) {
      const vigDate = new Date(vig);
      if (!isNaN(vigDate) && vigDate < new Date()) {
        return { ok: false, valid: false, reason: 'Gift Card vencida' };
      }
    }

    return { ok: true, valid: true, codigo, available: saldo, valor, vigencia: vig };
  }
  return { ok: false, valid: false, reason: 'Código no encontrado' };
}

function _redeemDono(b) {
  const code   = b.code      || '';
  const amount = Number(b.amount || 0);
  const ref    = b.referencia || '';

  if (!code || amount <= 0) return { ok: false, error: 'Código y monto requeridos' };

  const sheet  = _getSheet(CFG.SHEETS.GIFT_CARDS);
  const data   = sheet.getDataRange().getValues();
  const header = data[0];

  const colCod    = header.indexOf('Codigo');
  const colSaldo  = header.indexOf('Saldo_Disponible_COP');
  const colEstGift = header.indexOf('Estado_Gift');
  const colNotas  = header.indexOf('Notas');

  for (let i = 1; i < data.length; i++) {
    if (data[i][colCod] !== code) continue;
    if (data[i][colEstGift] !== 'ACTIVA') return { ok: false, error: 'Gift Card no activa' };

    const saldoActual = Number(data[i][colSaldo] || 0);
    if (saldoActual < amount) return { ok: false, error: 'Saldo insuficiente' };

    const saldoNuevo = saldoActual - amount;
    sheet.getRange(i + 1, colSaldo + 1).setValue(saldoNuevo);
    if (saldoNuevo <= 0 && colEstGift >= 0) sheet.getRange(i + 1, colEstGift + 1).setValue('INACTIVA');
    if (colNotas >= 0) {
      const notaActual = String(data[i][colNotas] || '');
      sheet.getRange(i + 1, colNotas + 1).setValue(
        (notaActual ? notaActual + ' | ' : '') + 'Redimido ' + amount + ' ref:' + ref + ' ' + _now()
      );
    }
    SpreadsheetApp.flush();
    _log('redeemDono', code, amount, ref, 'OK saldoNuevo=' + saldoNuevo);
    return { ok: true, codigo: code, redimido: amount, saldoRestante: saldoNuevo };
  }
  return { ok: false, error: 'Código no encontrado: ' + code };
}


// ============================================================
// CLIENTES
// Cols: ClienteID | Teléfono | Nombre | Apellido | Email |
//       Tipo_Doc | Num_Doc | Cumple_Día | Cumple_Mes |
//       Dirección | Barrio | Ciudad |
//       Total_Compras_COP | Num_Pedidos | Último_Pedido | Fecha_Creación
// ============================================================

function _upsertCliente(p) {
  const sheet = _getSheet(CFG.SHEETS.CLIENTES);
  const tel   = String(p.telefono || '').replace(/\D/g, '');
  if (!tel) return { clienteId: '' };

  const data   = sheet.getDataRange().getValues();
  const header = data[0];

  const colId    = header.indexOf('ClienteID');
  const colTel   = header.indexOf('Teléfono');
  const colNom   = header.indexOf('Nombre');
  const colApe   = header.indexOf('Apellido');
  const colEmail = header.indexOf('Email');
  const colTDoc  = header.indexOf('Tipo_Doc');
  const colNDoc  = header.indexOf('Num_Doc');
  const colCDia  = header.indexOf('Cumple_Día');
  const colCMes  = header.indexOf('Cumple_Mes');
  const colDir   = header.indexOf('Dirección');
  const colBarr  = header.indexOf('Barrio');
  const colCiu   = header.indexOf('Ciudad');
  const colTotal = header.indexOf('Total_Compras_COP');
  const colPeds  = header.indexOf('Num_Pedidos');
  const colUlt   = header.indexOf('Último_Pedido');

  for (let i = 1; i < data.length; i++) {
    const rowTel = String(data[i][colTel] || '').replace(/\D/g, '');
    if (rowTel !== tel) continue;

    const cliId = data[i][colId] || ('CLI-' + tel.slice(-6));
    // Actualizar campos no vacíos
    const setVal = (col, val) => { if (col >= 0 && val) sheet.getRange(i + 1, col + 1).setValue(val); };
    setVal(colNom,   p.nombre);
    setVal(colApe,   p.apellido);
    setVal(colEmail, p.email);
    setVal(colTDoc,  p.tipoDoc);
    setVal(colNDoc,  p.numDoc);
    if (p.cumpleDia && colCDia >= 0) sheet.getRange(i + 1, colCDia + 1).setValue(p.cumpleDia);
    if (p.cumpleMes && colCMes >= 0) sheet.getRange(i + 1, colCMes + 1).setValue(p.cumpleMes);
    setVal(colDir,  p.direccion);
    setVal(colBarr, p.barrio);
    setVal(colCiu,  p.ciudad);

    if (!p._soloTotal && p.total && colTotal >= 0) {
      const prev = Number(data[i][colTotal] || 0);
      sheet.getRange(i + 1, colTotal + 1).setValue(prev + _roundCOP(p.total));
      if (colPeds >= 0) sheet.getRange(i + 1, colPeds + 1).setValue(Number(data[i][colPeds] || 0) + 1);
      if (colUlt  >= 0) sheet.getRange(i + 1, colUlt  + 1).setValue(_now());
    }
    return { clienteId: cliId };
  }

  // Cliente nuevo
  const cliId = 'CLI-' + tel.slice(-6) + '-' + Date.now().toString(36).slice(-4).toUpperCase();
  sheet.appendRow([
    cliId,                               // A  ClienteID
    p.telefono || '',                    // B  Teléfono
    p.nombre   || '',                    // C  Nombre
    p.apellido || '',                    // D  Apellido
    p.email    || '',                    // E  Email
    p.tipoDoc  || '',                    // F  Tipo_Doc
    p.numDoc   || '',                    // G  Num_Doc
    p.cumpleDia|| '',                    // H  Cumple_Día
    p.cumpleMes|| '',                    // I  Cumple_Mes
    p.direccion|| '',                    // J  Dirección
    p.barrio   || '',                    // K  Barrio
    p.ciudad   || '',                    // L  Ciudad
    p._soloTotal ? 0 : _roundCOP(p.total || 0), // M Total_Compras_COP
    p._soloTotal ? 0 : (p.total ? 1 : 0),       // N Num_Pedidos
    p.total && !p._soloTotal ? _now() : '',      // O Último_Pedido
    _now(),                              // P  Fecha_Creación
  ]);
  return { clienteId: cliId };
}

function _getCliente(telefono) {
  if (!telefono) return { ok: false, error: 'telefono requerido' };
  const sheet = _getSheet(CFG.SHEETS.CLIENTES);
  const data  = sheet.getDataRange().getValues();
  const header = data[0];
  const tel   = String(telefono).replace(/\D/g, '');

  for (let i = 1; i < data.length; i++) {
    const rowTel = String(data[i][header.indexOf('Teléfono')] || '').replace(/\D/g, '');
    if (rowTel !== tel) continue;
    return {
      ok: true,
      cliente: {
        clienteId: data[i][header.indexOf('ClienteID')]  || '',
        nombre:    data[i][header.indexOf('Nombre')]     || '',
        apellido:  data[i][header.indexOf('Apellido')]   || '',
        email:     data[i][header.indexOf('Email')]      || '',
        telefono:  data[i][header.indexOf('Teléfono')]   || '',
        ciudad:    data[i][header.indexOf('Ciudad')]     || '',
        direccion: data[i][header.indexOf('Dirección')]  || '',
      }
    };
  }
  return { ok: false, error: 'Cliente no encontrado' };
}

function _getPedido(referencia) {
  if (!referencia) return { ok: false, error: 'referencia requerida' };
  const sheet  = _getSheet(CFG.SHEETS.PEDIDOS_WOMPI);
  const data   = sheet.getDataRange().getValues();
  const header = data[0];
  const colRef = header.indexOf('Referencia');
  for (let i = 1; i < data.length; i++) {
    if (data[i][colRef] !== referencia) continue;
    const pedido = {};
    header.forEach((h, j) => { pedido[h] = data[i][j]; });
    return { ok: true, pedido };
  }
  return { ok: false, error: 'Pedido no encontrado: ' + referencia };
}


// ============================================================
// INFLUENCERS
// Cols: Codigo | Nombre | Apellido | Email | Descuento_Pct | Comision_Pct | Activo
// ============================================================

function _getInfluencer(codigo) {
  if (!codigo) return { ok: false, valid: false, reason: 'Código requerido' };
  const sheet  = _getSheet(CFG.SHEETS.INFLUENCERS);
  const data   = sheet.getDataRange().getValues();
  const header = data[0];

  const colCod  = header.indexOf('Codigo');
  const colNom  = header.indexOf('Nombre');
  const colApe  = header.indexOf('Apellido');
  const colEmail= header.indexOf('Email');
  const colDesc = header.indexOf('Descuento_Pct');
  const colCom  = header.indexOf('Comision_Pct');
  const colAct  = header.indexOf('Activo');

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][colCod] || '').toUpperCase() !== codigo.toUpperCase()) continue;
    if (colAct >= 0 && String(data[i][colAct]).toLowerCase() === 'false') {
      return { ok: false, valid: false, reason: 'Código de influencer inactivo' };
    }
    return {
      ok:           true,
      valid:        true,
      codigo:       data[i][colCod]  || '',
      nombreSolo:   data[i][colNom]  || '',
      apellido:     data[i][colApe]  || '',
      email:        data[i][colEmail]|| '',
      descuentoPct: Number(data[i][colDesc] || 0),
      comisionPct:  Number(data[i][colCom]  || 0),
    };
  }
  return { ok: false, valid: false, reason: 'Código no encontrado' };
}


// ============================================================
// CAMPAÑAS
// ============================================================

function _getCampanias() {
  try {
    const sheet = _getSheet(CFG.SHEETS.CAMPANIAS);
    const data  = sheet.getDataRange().getValues();
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
// EMAILS
// ============================================================

function _emailWrapper(to, subject, bodyHtml) {
  try {
    GmailApp.sendEmail(to, subject, '', {
      htmlBody: `
        <!DOCTYPE html><html><head><meta charset="UTF-8">
        <style>
          body { font-family: Georgia, serif; color: #1A1A1A; background: #FAFAF8; margin: 0; padding: 0; }
          .wrap { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #E8E8E6; }
          .header { background: #1A1A1A; padding: 24px 32px; text-align: center; }
          .header h1 { color: #C9A96E; font-size: 18px; margin: 0; letter-spacing: 2px; }
          .body { padding: 32px; }
          .footer { background: #FAFAF8; padding: 16px 32px; text-align: center; font-size: 12px; color: #9B9B9B; border-top: 1px solid #E8E8E6; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #C9A96E; color: #fff; padding: 8px; text-align: left; }
          td { padding: 8px; border-bottom: 1px solid #E8E8E6; }
          .callout { background: #E8F4EC; border-left: 4px solid #4A7C59; padding: 12px 16px; margin: 16px 0; border-radius: 4px; }
        </style></head><body>
        <div class="wrap">
          <div class="header"><h1>TTT — TESSITURA TOSCANA TELERIE</h1></div>
          <div class="body">${bodyHtml}</div>
          <div class="footer">
            TTT by G-Living | Italian Living & Design | Est. 2018<br>
            Calle 70 # 9-87, Bogotá · ${CFG.WHATSAPP}<br>
            <a href="${CFG.CATALOGO}" style="color:#C9A96E">Ver catálogo</a>
          </div>
        </div>
        </body></html>`,
      name: CFG.NOMBRE_TIENDA,
    });
  } catch(err) {
    _log('_emailWrapper error', to, err.message);
  }
}

function _emailAdminWishlist(ref, cli, prods, total) {
  try {
    const rows = prods.map(p =>
      `<tr><td>${p.productName||''}</td><td>${p.medida||''}</td><td>${p.sku||''}</td><td>€${p.precio||0}</td><td>${p.quantity||1}</td><td>€${(p.precio||0)*(p.quantity||1)}</td></tr>`
    ).join('');
    const body = `
      <h2>Nueva Wishlist TTT</h2>
      <p><strong>Ref:</strong> ${ref}</p>
      <p><strong>Cliente:</strong> ${cli.nombre||'-'} ${cli.apellido||''} | ${cli.telefono||'-'} | ${cli.email||'-'}</p>
      <table><tr style="background:#C9A96E;color:#fff"><th>Producto</th><th>Medida</th><th>SKU</th><th>Precio</th><th>Qty</th><th>Subtotal</th></tr>
      ${rows}
      <tr><td colspan="5" align="right"><strong>Total:</strong></td><td><strong>€${total}</strong></td></tr>
      </table>`;
    GmailApp.sendEmail(CFG.EMAIL_ADMIN, `[TTT] Nueva wishlist ${ref} — ${cli.nombre||'Sin nombre'}`, '', {
      htmlBody: body, name: CFG.NOMBRE_TIENDA,
    });
  } catch(err) {
    _log('_emailAdminWishlist error', err.message);
  }
}

function _emailPagoConfirmado(email, nombre, ref, prods, total, giftInfo, pctPagado, txId) {
  try {
    const nombreFmt = nombre || 'estimada clienta';
    const rows = (prods || []).map(p =>
      `<tr><td>${p.productName||p.nombre||''}</td><td>${p.medida||''}</td><td>${p.sku||''}</td><td>${p.quantity||1}</td></tr>`
    ).join('');

    const saldoTxt = pctPagado === 60
      ? `<div class="callout">Tu pedido tiene un saldo pendiente del 40% (€ ${_fmtCOP(total * 2 / 3 * 0.4)}) que se coordina directamente con nosotros antes del despacho.</div>`
      : '';

    const giftTxt = giftInfo
      ? `<p>✓ Se aplicó un descuento de <strong>$${_fmtCOP(giftInfo.monto)}</strong> de tu Gift Card${giftInfo.codigo ? ' <code>' + giftInfo.codigo + '</code>' : ''}.</p>`
      : '';

    const body = `
      <h2>¡Pago confirmado! ✓</h2>
      <p>Hola ${nombreFmt}, tu pago ha sido aprobado con éxito.</p>
      <p><strong>Referencia:</strong> ${ref}${txId ? ' · TX: ' + txId : ''}</p>
      ${giftTxt}
      <table><tr style="background:#C9A96E;color:#fff"><th>Producto</th><th>Medida</th><th>SKU</th><th>Qty</th></tr>${rows}</table>
      <p style="margin-top:16px"><strong>Total pagado: $${_fmtCOP(total)} COP</strong></p>
      ${saldoTxt}
      <div class="callout">Procesaremos tu pedido de textiles importados desde Toscana, Italia. Te avisaremos cuando esté listo para despacho.</div>
      <p>¿Dudas? Escríbenos al <a href="https://wa.me/${CFG.WHATSAPP.replace('+','')}" style="color:#C9A96E">WhatsApp ${CFG.WHATSAPP}</a></p>`;

    _emailWrapper(email, `[TTT] Pago confirmado — Ref ${ref}`, body);
    GmailApp.sendEmail(CFG.EMAIL_ADMIN, `[TTT] PAGO APROBADO ${ref}`, '', {
      htmlBody: `<p>Pago aprobado. Ref: ${ref} · Cliente: ${nombre} · Email: ${email} · Total COP: $${_fmtCOP(total)}</p>`,
      name: CFG.NOMBRE_TIENDA,
    });
  } catch(err) {
    _log('_emailPagoConfirmado error', err.message);
  }
}

function _emailPagoCancelado(email, nombre, ref, status) {
  try {
    const body = `
      <h2>Hubo un problema con tu pago</h2>
      <p>Hola ${nombre||'estimada clienta'}, el pago para el pedido <strong>${ref}</strong> no pudo completarse (estado: ${status}).</p>
      <p>No se realizó ningún cargo a tu tarjeta. Puedes intentarlo de nuevo cuando quieras.</p>
      <p>¿Necesitas ayuda? Escríbenos al <a href="https://wa.me/${CFG.WHATSAPP.replace('+','')}" style="color:#C9A96E">WhatsApp ${CFG.WHATSAPP}</a></p>`;
    _emailWrapper(email, `[TTT] Pago no procesado — Ref ${ref}`, body);
  } catch(err) {
    _log('_emailPagoCancelado error', err.message);
  }
}

function _emailGiftCardActivada(emisorEmail, emisorNombre, destNombre, destEmail, codigo, valor, vigencia) {
  try {
    const body = `
      <h2>¡Tu Gift Card TTT está activa! 🎁</h2>
      <p>Hola ${emisorNombre||'estimada clienta'}, tu Gift Card para <strong>${destNombre||'tu regalo'}</strong> ha sido activada.</p>
      <div class="callout">
        <p><strong>Código:</strong> <code style="font-size:18px;letter-spacing:2px">${codigo}</code></p>
        <p><strong>Valor:</strong> $${_fmtCOP(valor)} COP</p>
        <p><strong>Válida hasta:</strong> ${vigencia}</p>
      </div>
      <p>Comparte este código con ${destNombre||'el destinatario'} para que lo use en el catálogo TTT.</p>
      <p>Gracias por confiar en <strong>G-Living | Italian Living & Design | Est. 2018</strong></p>`;
    _emailWrapper(emisorEmail, `[TTT] Gift Card activada — ${codigo}`, body);
    if (destEmail && destEmail !== emisorEmail) {
      const bodyDest = `
        <h2>¡Tienes una Gift Card TTT! 🎁</h2>
        <p>Hola ${destNombre||''}, ${emisorNombre||'alguien especial'} te ha enviado una Gift Card.</p>
        <div class="callout">
          <p><strong>Tu código:</strong> <code style="font-size:18px;letter-spacing:2px">${codigo}</code></p>
          <p><strong>Valor:</strong> $${_fmtCOP(valor)} COP</p>
          <p><strong>Válida hasta:</strong> ${vigencia}</p>
        </div>
        <p>Úsalo en <a href="${CFG.CATALOGO}" style="color:#C9A96E">el catálogo TTT</a> al momento del pago.</p>`;
      _emailWrapper(destEmail, `[TTT] ¡Tienes una Gift Card! — ${codigo}`, bodyDest);
    }
  } catch(err) {
    _log('_emailGiftCardActivada error', err.message);
  }
}


// ============================================================
// SETUP — ejecutar una vez
// ============================================================

function setupSheets() {
  const ss = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);

  const sheetDefs = {
    'Wishlists': [
      'Campaña_ID','Catalogo_ID','Timestamp','Referencia','ClienteID',
      'Nombre','Apellido','Email','Teléfono','Tipo_Doc','Num_Doc',
      'Dirección','Barrio','Ciudad','Notas',
      'Productos_JSON','Total_EUR','Estado_Wishlist','Notas_internas'
    ],
    'Pedidos_Wompi': [
      'Campaña_ID','Catalogo_ID','Timestamp','Referencia',
      'Wompi_Transaction_ID','Estado_Pago_Wompi',
      'ClienteID','Nombre','Apellido','Email','Teléfono','Tipo_Doc','Num_Doc',
      'Dirección','Barrio','Ciudad','Notas_entrega',
      'Productos_JSON','Subtotal_EUR',
      'Descuento_Influencer_COP','Descuento_GiftCard_COP',
      'Total_a_Pagar_COP','Porcentaje_Pagado','Forma_Pago',
      'Saldo_Pendiente_COP','Estado_Pedido','Fecha_Despacho',
      'Notas_Internas','Influencer_Codigo'
    ],
    'GiftCards': [
      'Timestamp','Referencia','Codigo','Valor_COP','Estado_Pago','Estado_Gift',
      'Emisor_Nombre','Emisor_Email','Emisor_Tel',
      'Destinatario_Nombre','Destinatario_Email','Mensaje',
      'Wompi_Transaction_ID','Vigencia_Hasta','Saldo_Disponible_COP','Notas'
    ],
    'Clientes': [
      'ClienteID','Teléfono','Nombre','Apellido','Email',
      'Tipo_Doc','Num_Doc','Cumple_Día','Cumple_Mes',
      'Dirección','Barrio','Ciudad',
      'Total_Compras_COP','Num_Pedidos','Último_Pedido','Fecha_Creación'
    ],
    'Campanias': ['Campaña_ID','Descuento_Pct','Activa','Descripción'],
    'Influencers': ['Codigo','Nombre','Apellido','Email','Descuento_Pct','Comision_Pct','Activo'],
    'Log': ['Timestamp','Acción','Arg1','Arg2','Arg3'],
  };

  Object.entries(sheetDefs).forEach(([name, headers]) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length)
        .setBackground('#C9A96E')
        .setFontColor('#FFFFFF')
        .setFontWeight('bold');
      sheet.setFrozenRows(1);
      Logger.log('Creada hoja: ' + name);
    } else {
      Logger.log('Hoja ya existe: ' + name);
    }
  });

  Logger.log('setupSheets() TTT v2.0 completado ✓');
}


// ============================================================
// UTILIDADES
// ============================================================

function _getSheet(name) {
  const ss    = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('Hoja no encontrada: ' + name);
  return sheet;
}

function _genRef(prefix) {
  return prefix + '-' + Date.now() + '-' + Math.floor(Math.random() * 9999);
}

function _genGiftCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'HC-';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function _giftVigencia() {
  const d = new Date();
  d.setMonth(d.getMonth() + 9);
  return Utilities.formatDate(d, CFG.TZ, 'yyyy-MM-dd');
}

function _now() {
  return Utilities.formatDate(new Date(), CFG.TZ, 'yyyy-MM-dd HH:mm:ss');
}

function _jsonOut(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function _log(accion, arg1, arg2, arg3) {
  try {
    const sheet = _getSheet(CFG.SHEETS.LOG);
    sheet.appendRow([_now(), accion, String(arg1||''), String(arg2||''), String(arg3||'')]);
  } catch(e) {
    Logger.log('[TTT LOG]', accion, arg1, arg2, arg3);
  }
}

function _fmtTel(codPais, tel) {
  const c = String(codPais || '+57').replace(/[^+\d]/g, '');
  const t = String(tel     || '').replace(/\D/g, '');
  return c + t;
}

function _fmtCOP(val) {
  return Number(val || 0).toLocaleString('es-CO');
}

function _roundCOP(val) {
  if (!val || val <= 0) return 0;
  return Math.ceil(val / 1000) * 1000;
}

function _parseJSON(str) {
  try { return JSON.parse(str || '[]'); } catch(e) { return []; }
}
