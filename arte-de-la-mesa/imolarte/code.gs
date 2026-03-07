// ============================================================
// IMOLARTE — Google Apps Script Backend v20
// ============================================================
// Spreadsheet ID : 1lgW9-nhgM6UVL4NvYet4EIjX6fuSJV4ZHtP4lffZ5tg
// Deploy: publicar como nueva versión tras pegar este código
// Setup  (una vez): setupSheets() → setupDropdowns() → setupProtections()
// Reset  GiftCards: resetGiftCardSheet()
// Reset  Clientes : resetClientesSheet()
// Dashboard      : rebuildDashboard()   (o trigger diario)
// Trigger edit   : onSheetChange → On edit
// ============================================================
//
// CAMBIOS v16–v19: ver historial anterior
// ─ v20: _safeCount + _safeMoney + _roundCOP (reemplazan _safeInt)
// ─ v20: interacciones solo en APPROVED (no en createPedidoWompi)
// ─ v20: corrección cumpleaños permitida + log en Historial_cambios
// ─ v20: _instruccionesGiftHTML() función compartida emisor/destinatario
// ─ v20: emails — tono cálido, asunto wishlist corregido, saldo 60% texto tránsito
// ─ v20: _emailWrapper fallback nombre → 'estimada clienta'
// ─ v20: todos los valores COP en emails redondeados por exceso a $1.000
// ─ v20.1: BUG-B fix — String() forzado en _fmtTel y _upsertCliente (crash replace sobre número)
// ─ v20.1: BUG-A fix — _skipEmail propagado correctamente desde api.js → code.gs
// ============================================================

'use strict';

const CFG = {
  SPREADSHEET_ID  : '1lgW9-nhgM6UVL4NvYet4EIjX6fuSJV4ZHtP4lffZ5tg',
  NOMBRE_TIENDA   : 'IMOLARTE by Helena Caballero',
  EMAIL_ADMIN     : 'filippo.massara2016@gmail.com',
  EMAIL_REMITENTE : 'filippo.massara2016@gmail.com',
  WHATSAPP        : '+573004267367',
  WEBSITE         : 'https://www.helenacaballero.com',
  CATALOGO        : 'https://g-living.github.io/multiplatform/imolarte/',
  WISHLIST_ABANDON_MIN: 30,
  // ── Seguridad: token compartido con frontend (config.js → Api.TOKEN)
  // Cambiar por uno propio antes de pasar a producción
  API_TOKEN       : 'e_Z9in_KWciZdhVjoKl6ps471XOrlJi5lzV55WalUBA',
  SHEETS: {
    WISHLIST      : 'Wishlist',
    PEDIDOS_WOMPI : 'Pedidos_Wompi',
    GIFT_CARDS    : 'GiftCards',
    CLIENTES      : 'Clientes',
    DASHBOARD     : 'Dashboard_Clientes',
    CAMPANIAS     : 'Campañas',
    LOG           : 'Log',
  },
};

const ESTADOS_WISHLIST = ['PENDIENTE', 'ENVIADO_WA'];
const ESTADOS_PEDIDO   = [
  'PENDIENTE','CONFIRMADO','CANCELADO',
  'EN_PRODUCCION','EN_TRANSITO','EN_NACIONALIZACION',
  'LISTO_DESPACHO','DISPONIBLE_TIENDA','DESPACHADO',
];

// ============================================================
// PUNTO DE ENTRADA HTTP
// ============================================================

function doPost(e) {
  try {
    let body;
    if (e.parameter && e.parameter.data) {
      body = JSON.parse(e.parameter.data);
    } else {
      body = JSON.parse(e.postData.contents);
    }

    // ── Validación de token — rechazar requests sin token válido
    if (body.action !== 'ping' && body._token !== CFG.API_TOKEN) {
      _log('doPost_AUTH_FAIL', body.action || 'unknown', 'token inválido o ausente');
      return _jsonResponse({ ok: false, error: 'Unauthorized' });
    }

    const action = body.action || '';
    _log('doPost', action, JSON.stringify(body).slice(0, 200));
    let result;
    switch (action) {
      case 'createWishlist'        : result = _createWishlist(body);          break;
      case 'createPedidoWompi'     : result = _createPedidoWompi(body);       break;
      case 'createGiftCard'        : result = _createGiftCard(body);          break;
      case 'updateEstadoWishlist'  : result = _updateEstadoWishlist(body);    break;
      case 'confirmarPagoWompi'    :
        // Ruteo automático: referencias GIFT- van a _confirmarPagoGiftCard
        result = (String(body.referencia || '').startsWith('GIFT-'))
          ? _confirmarPagoGiftCard(body)
          : _confirmarPagoWompi(body);
        break;
      case 'confirmarPagoGiftCard' : result = _confirmarPagoGiftCard(body);   break;
      case 'upsertCliente'         : result = _upsertCliente(body);           break;
      case 'redeemDono'            : result = _redeemDono(body);              break;
      case 'ping'                  : result = { ok: true, ts: new Date().toISOString() }; break;
      // aliases legacy
      case 'createPedidoWA'        : result = _createWishlist(body);          break;
      case 'updateEstadoWA'        : result = _updateEstadoWishlist(body);    break;
      case 'updateEstado'          : result = _confirmarPagoWompi(body);      break;
      case 'paymentConfirmed'      : result = _confirmarPagoWompi(body);      break;
      case 'updatePayment'         : result = _confirmarPagoWompi(body);      break;
      default:
        result = { ok: false, error: 'Acción desconocida: ' + action };
    }
    return _jsonResponse(result);
  } catch (err) {
    _log('doPost_ERROR', err.message, JSON.stringify(e?.parameter || '').slice(0, 200));
    return _jsonResponse({ ok: false, error: err.message });
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action || '';
    let result;
    switch (action) {
      case 'getCliente'    : result = _getCliente(e.parameter.telefono);      break;
      case 'getPedido'     : result = _getPedido(e.parameter.referencia);     break;
      case 'getGiftCard'   : result = _getGiftCard(e.parameter.codigo);       break;
      case 'validateDono'  : result = _getGiftCard(e.parameter.code);         break;
      case 'getCampanias'  : result = _getCampaniasActivas();                  break;
      case 'ping'          : result = { ok: true, ts: new Date().toISOString() }; break;
      default:
        result = { ok: false, error: 'Acción GET desconocida: ' + action };
    }
    return _jsonResponse(result);
  } catch (err) {
    _log('doGet_ERROR', err.message);
    return _jsonResponse({ ok: false, error: err.message });
  }
}

// ============================================================
// WISHLIST
// Cols: Campaña_ID | Timestamp | Referencia | ClienteID |
//       Nombre | Apellido | Email | Teléfono |
//       Tipo_Doc | Num_Doc |
//       Dirección_Wishlist | Barrio_Wishlist | Ciudad_Wishlist | Notas |
//       Productos_JSON | Total_COP | Estado_Wishlist | Notas_internas
// ============================================================

function _createWishlist(b) {
  const sheet    = _getSheet(CFG.SHEETS.WISHLIST);
  const ref      = b.referencia || 'WA-' + Date.now();
  const ts       = new Date();
  const cli      = b.cliente || {};
  const ent      = b.entrega || {};
  const tel      = _fmtTel(cli.codigoPais, cli.telefono);
  const campania = b.campaniaId || '';

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
    campania,                            // A  Campaña_ID
    ts,                                  // B  Timestamp
    ref,                                 // C  Referencia
    cliId,                               // D  ClienteID
    cli.nombre    || '',                 // E  Nombre
    cli.apellido  || '',                 // F  Apellido
    cli.email     || '',                 // G  Email
    tel,                                 // H  Teléfono
    cli.tipoDoc   || '',                 // I  Tipo_Doc
    cli.numDoc    || '',                 // J  Num_Doc
    ent.direccion || '',                 // K  Dirección_Wishlist
    ent.barrio    || '',                 // L  Barrio_Wishlist
    ent.ciudad    || '',                 // M  Ciudad_Wishlist
    ent.notas     || '',                 // N  Notas
    JSON.stringify(b.productos || []),   // O  Productos_JSON
    b.total       || 0,                  // P  Total_COP
    'PENDIENTE',                         // Q  Estado_Wishlist
    '',                                  // R  Notas_internas
  ]);

  _log('createWishlist', ref, cliId, 'OK');
  return { ok: true, referencia: ref, clienteId: cliId };
}

function _updateEstadoWishlist(b) {
  const sheet  = _getSheet(CFG.SHEETS.WISHLIST);
  const ref    = b.referencia || '';
  const estado = b.estadoWA || b.estado || 'ENVIADO_WA';
  if (!ref)    return { ok: false, error: 'Referencia requerida' };
  if (!ESTADOS_WISHLIST.includes(estado)) return { ok: false, error: 'Estado inválido: ' + estado };

  const data   = sheet.getDataRange().getValues();
  const header = data[0];
  const colRef    = header.indexOf('Referencia');
  const colEstado = header.indexOf('Estado_Wishlist');
  if (colRef < 0 || colEstado < 0) return { ok: false, error: 'Columnas no encontradas en Wishlist' };

  for (let i = 1; i < data.length; i++) {
    if (data[i][colRef] === ref) {
      sheet.getRange(i + 1, colEstado + 1).setValue(estado);
      _log('updateEstadoWishlist', ref, estado, 'OK');
      if (estado === 'ENVIADO_WA') {
        const email  = data[i][header.indexOf('Email')]         || '';
        const nombre = data[i][header.indexOf('Nombre')]        || '';
        const prods  = _parseJSON(data[i][header.indexOf('Productos_JSON')]);
        const total  = data[i][header.indexOf('Total_COP')]     || 0;
        if (email) _emailEnviadoWA(email, nombre, ref, prods, total);
      }
      return { ok: true, referencia: ref, estado };
    }
  }
  return { ok: false, error: 'Referencia no encontrada: ' + ref };
}

// ============================================================
// PEDIDOS WOMPI
// Cols: Campaña_ID | Timestamp | Referencia |
//       Wompi_Transaction_ID | Estado_Pago_Wompi |
//       ClienteID | Nombre | Apellido | Email | Teléfono |
//       Tipo_Doc | Num_Doc |
//       Dirección | Barrio | Ciudad | Notas_entrega |
//       Productos_JSON | Subtotal_COP | Descuento_COP |
//       Total_COP | Pct_Pagado | Forma_pago |
//       Estado_Pedido | Fecha_despacho | Notas_internas | SIIGO_Factura_ID
// ============================================================

function _createPedidoWompi(b) {
  const sheet    = _getSheet(CFG.SHEETS.PEDIDOS_WOMPI);
  // Usar referencia del payload si viene (caso: pago ya confirmado por Wompi)
  // Si no viene, generar nueva (caso legacy / fallback)
  const ref      = (b.referencia && b.referencia !== '') ? b.referencia : ('WP-' + Date.now());
  const ts       = new Date();
  const cli      = b.cliente || {};
  const ent      = b.entrega || {};
  const tel      = _fmtTel(cli.codigoPais, cli.telefono);
  const campania = b.campaniaId || '';

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
    _soloTotal: true,   // no contar interacción — se cuenta solo en APPROVED
  }).clienteId;

  sheet.appendRow([
    campania,                            // A  Campaña_ID
    ts,                                  // B  Timestamp
    ref,                                 // C  Referencia
    b.wompiTransactionId || '',          // D  Wompi_Transaction_ID
    'PENDING',                           // E  Estado_Pago_Wompi
    cliId,                               // F  ClienteID
    cli.nombre    || '',                 // G  Nombre
    cli.apellido  || '',                 // H  Apellido
    cli.email     || '',                 // I  Email
    tel,                                 // J  Teléfono
    cli.tipoDoc   || '',                 // K  Tipo_Doc
    cli.numDoc    || '',                 // L  Num_Doc
    ent.direccion || '',                 // M  Dirección
    ent.barrio    || '',                 // N  Barrio
    ent.ciudad    || '',                 // O  Ciudad
    ent.notas     || '',                 // P  Notas_entrega
    JSON.stringify(b.productos || []),   // Q  Productos_JSON
    b.subtotal    || 0,                  // R  Subtotal_COP
    b.descuento   || 0,                  // S  Descuento_COP
    b.total       || 0,                  // T  Total_COP
    b.porcentajePagado || 100,           // U  Pct_Pagado
    b.formaPago   || 'WOMPI_100',        // V  Forma_pago
    // Saldo pendiente: total × (1 - pct/100), 0 si pago completo o gift
    _roundCOP((b.total || 0) * (1 - ((b.porcentajePagado || 100) / 100))), // W Saldo_Pendiente_COP
    'PENDIENTE',                         // X  Estado_Pedido
    '',                                  // Y  Fecha_despacho
    '',                                  // Z  Notas_internas
    '',                                  // AA SIIGO_Factura_ID
  ]);

  _log('createPedidoWompi', ref, cliId, 'OK');
  // _skipEmail: true cuando el pedido se crea post-pago desde checkout.js
  // En ese caso solo se envía el email de pago confirmado, no el de "pedido recibido"
  if (!b._skipEmail && cli.email) _emailPedidoRecibido(cli.email, cli.nombre, ref, b.productos, b.total);
  return { ok: true, referencia: ref, clienteId: cliId };
}

function _confirmarPagoWompi(b) {
  const sheet  = _getSheet(CFG.SHEETS.PEDIDOS_WOMPI);
  const data   = sheet.getDataRange().getValues();
  const header = data[0];

  const colRef    = header.indexOf('Referencia');
  const colPagoWP = header.indexOf('Estado_Pago_Wompi');
  const colPedido = header.indexOf('Estado_Pedido');
  const colTxId   = header.indexOf('Wompi_Transaction_ID');

  const d      = b.data || {};
  const ref    = b.referencia    || d.pedidoId      || '';
  const status = b.status        || d.paymentStatus  || 'APPROVED';
  const txId   = b.transactionId || d.transactionId  || '';

  if (!ref) return { ok: false, error: 'Referencia requerida' };
  if (colRef < 0 || colPagoWP < 0 || colPedido < 0)
    return { ok: false, error: 'Columnas no encontradas en Pedidos_Wompi' };

  for (let i = 1; i < data.length; i++) {
    if (data[i][colRef] !== ref) continue;

    sheet.getRange(i + 1, colPagoWP + 1).setValue(status);
    const estadoPedido = status === 'APPROVED' ? 'CONFIRMADO'
      : (status === 'PENDING' ? 'PENDIENTE' : 'CANCELADO');
    sheet.getRange(i + 1, colPedido + 1).setValue(estadoPedido);
    if (txId && colTxId >= 0) sheet.getRange(i + 1, colTxId + 1).setValue(txId);

    _log('confirmarPagoWompi', ref, status, estadoPedido);

    const email      = data[i][header.indexOf('Email')]         || '';
    const nombre     = data[i][header.indexOf('Nombre')]        || '';
    const prods      = _parseJSON(data[i][header.indexOf('Productos_JSON')]);
    const total      = data[i][header.indexOf('Total_COP')]     || 0;
    const subtotal   = data[i][header.indexOf('Subtotal_COP')]  || 0;
    const descuento  = data[i][header.indexOf('Descuento_COP')] || 0;
    const formaPago  = String(data[i][header.indexOf('Forma_pago')] || '');
    const pctPagado  = Number(data[i][header.indexOf('Pct_Pagado')])  || 100;

    // Extraer info del bono si aplica
    // Forma_pago puede ser: GIFT_CARD | WOMPI_60+GIFT:HC-XXXXX | WOMPI_100+GIFT:HC-XXXXX
    let giftInfo = null;
    const giftMatch = formaPago.match(/GIFT:([A-Z0-9-]+)/);
    if (giftMatch) {
      // pago mixto wompi + gift
      const montoWompi = total * (pctPagado / 100);
      const montoGift  = total - montoWompi;
      giftInfo = { codigo: giftMatch[1], monto: montoGift, tipo: 'MIXTO', montoWompi };
    } else if (formaPago === 'GIFT_CARD') {
      // pago 100% gift
      giftInfo = { codigo: '', monto: total, tipo: 'TOTAL' };
    }

    if (email) {
      if (status === 'APPROVED') _emailPagoConfirmado(email, nombre, ref, prods, total, giftInfo, pctPagado, subtotal, descuento);
      else if (['DECLINED','ERROR','VOIDED'].includes(status))
        _emailPagoCancelado(email, nombre, ref, status);
    }

    // En APPROVED: contar interacción + acumular total en una sola llamada
    // _soloTotal omitido → _upsertCliente contará la interacción (pago real completado)
    // BUG-SHEET-02: usar subtotal (valor completo del pedido) no total (solo parte Wompi con bono)
    const totalParaHistorico = _roundCOP(subtotal || total);
    if (status === 'APPROVED' && totalParaHistorico > 0) {
      const tel = String(data[i][header.indexOf('Teléfono')] || '');
      const doc = { tipoDoc: String(data[i][header.indexOf('Tipo_Doc')] || ''),
                    numDoc:  String(data[i][header.indexOf('Num_Doc')]  || '') };
      _upsertCliente({ telefono: tel, ...doc, total: totalParaHistorico,
                       _pedidoRef: ref,
                       _pedidoProds: prods,
                       _pedidoTs: new Date() });
    }

    return { ok: true, referencia: ref, status, estadoPedido };
  }
  _log('confirmarPagoWompi', ref, 'NOT_FOUND');
  return { ok: false, error: 'Referencia no encontrada: ' + ref };
}

// ============================================================
// GIFT CARDS
// Cols: Campaña_ID | Timestamp | Referencia | Código_Gift |
//       Saldo_Gift_COP | Válido_Hasta |
//       ClienteID_Emisor |
//       Emisor_Nombre | Emisor_Apellido | Emisor_Email | Emisor_Tel |
//       Emisor_Tipo_Doc | Emisor_Num_Doc |
//       Emisor_Dirección | Emisor_Barrio | Emisor_Ciudad |
//       Dest_Nombre | Dest_Apellido | Dest_Tel | Dest_Mensaje |
//       Estado_Pago | Estado_Gift |
//       Wompi_Transaction_ID | Fecha_Pago | Fecha_Activación |
//       Canjeado_En | Notas_Internas
// ============================================================

function _createGiftCard(b) {
  const sheet = _getSheet(CFG.SHEETS.GIFT_CARDS);
  const ref   = b.referencia || 'GC-' + Date.now();
  const ts    = new Date();
  const em    = b.emisor       || {};
  const dest  = b.destinatario || {};
  const tel   = em.telefono || '';

  const cliId = _upsertCliente({
    telefono  : tel,
    nombre    : em.nombre    || '',
    apellido  : em.apellido  || '',
    email     : em.email     || '',
    tipoDoc   : em.tipoDoc   || '',
    numDoc    : em.numDoc    || '',
    cumpleDia : em.cumpleDia || '',
    cumpleMes : em.cumpleMes || '',
    direccion : em.direccion || '',
    barrio    : em.barrio    || '',
    ciudad    : em.ciudad    || '',
  }).clienteId;

  const destTelRaw = dest.telefono || '';

  sheet.appendRow([
    b.campaniaId  || '',     // A  Campaña_ID
    ts,                      // B  Timestamp
    ref,                     // C  Referencia
    b.codigo      || '',     // D  Código_Gift
    b.valor       || 0,      // E  Saldo_Gift_COP
    b.vigencia    || '',     // F  Válido_Hasta
    cliId,                   // G  ClienteID_Emisor
    em.nombre     || '',     // H  Emisor_Nombre
    em.apellido   || '',     // I  Emisor_Apellido
    em.email      || '',     // J  Emisor_Email
    tel,                     // K  Emisor_Tel
    em.tipoDoc    || '',     // L  Emisor_Tipo_Doc
    em.numDoc     || '',     // M  Emisor_Num_Doc
    em.direccion  || '',     // N  Emisor_Dirección
    em.barrio     || '',     // O  Emisor_Barrio
    em.ciudad     || '',     // P  Emisor_Ciudad
    dest.nombre   || '',     // Q  Dest_Nombre
    dest.apellido || '',     // R  Dest_Apellido
    dest.email    || '',     // S  Dest_Email  ← nuevo
    destTelRaw,              // T  Dest_Tel
    b.mensaje     || '',     // U  Dest_Mensaje
    'PENDIENTE_PAGO',        // V  Estado_Pago
    'INACTIVA',              // W  Estado_Gift
    '',                      // X  Wompi_Transaction_ID
    '',                      // Y  Fecha_Pago
    '',                      // Z  Fecha_Activación
    '',                      // AA Canjeado_En
    '',                      // AB Notas_Internas
  ]);

  _log('createGiftCard', ref, b.codigo, cliId, 'OK');
  // ⚠️ No upsert destinatario — solo se registra cuando él mismo compra
  return { ok: true, referencia: ref, codigo: b.codigo, clienteId: cliId };
}

function _confirmarPagoGiftCard(b) {
  const sheet  = _getSheet(CFG.SHEETS.GIFT_CARDS);
  const data   = sheet.getDataRange().getValues();
  const header = data[0];

  const colRef     = header.indexOf('Referencia');
  const colEstPago = header.indexOf('Estado_Pago');
  const colEstGift = header.indexOf('Estado_Gift');
  const colTxId    = header.indexOf('Wompi_Transaction_ID');
  const colFPago   = header.indexOf('Fecha_Pago');
  const colFAct    = header.indexOf('Fecha_Activación');

  const ref    = b.referencia    || '';
  const status = b.status        || 'APPROVED';
  const txId   = b.transactionId || '';

  if (!ref)       return { ok: false, error: 'Referencia requerida' };
  if (colRef < 0) return { ok: false, error: 'Columna Referencia no encontrada en GiftCards' };

  for (let i = 1; i < data.length; i++) {
    if (data[i][colRef] !== ref) continue;
    const now = new Date();

    if (colEstPago >= 0) sheet.getRange(i + 1, colEstPago + 1).setValue(status);
    const estadoGift = status === 'APPROVED' ? 'ACTIVA'
      : (status === 'PENDING' ? 'PENDIENTE_PAGO' : 'CANCELADA');
    if (colEstGift >= 0) sheet.getRange(i + 1, colEstGift + 1).setValue(estadoGift);

    if (txId   && colTxId  >= 0) sheet.getRange(i + 1, colTxId  + 1).setValue(txId);
    if (colFPago >= 0)            sheet.getRange(i + 1, colFPago + 1).setValue(now);
    if (status === 'APPROVED' && colFAct >= 0) sheet.getRange(i + 1, colFAct + 1).setValue(now);

    _log('confirmarPagoGiftCard', ref, status, estadoGift);

    if (status === 'APPROVED') {
      const colSaldo  = header.indexOf('Saldo_Gift_COP');
      const email     = data[i][header.indexOf('Emisor_Email')]   || '';
      const nombre    = data[i][header.indexOf('Emisor_Nombre')]  || '';
      const apellido  = data[i][header.indexOf('Emisor_Apellido')]|| '';
      const codigo    = data[i][header.indexOf('Código_Gift')]    || '';
      const valor     = data[i][colSaldo >= 0 ? colSaldo : header.indexOf('Valor_COP')] || 0;
      // Vigencia: forzar string limpio — Sheets puede devolver Date object
      const vigRaw    = data[i][header.indexOf('Válido_Hasta')];
      const vig       = (vigRaw instanceof Date)
        ? Utilities.formatDate(vigRaw, 'America/Bogota', 'dd MMM yyyy')
        : String(vigRaw || '');
      const telEmisor = data[i][header.indexOf('Emisor_Tel')]     || '';
      const docTipo   = data[i][header.indexOf('Emisor_Tipo_Doc')] || '';
      const docNum    = data[i][header.indexOf('Emisor_Num_Doc')]  || '';

      const destEmail    = data[i][header.indexOf('Dest_Email')]    || '';
      const destNombre   = data[i][header.indexOf('Dest_Nombre')]   || '';
      const destApellido = data[i][header.indexOf('Dest_Apellido')] || '';
      const mensaje      = data[i][header.indexOf('Dest_Mensaje')]  || '';

      if (email) _emailGiftCardActivada(email, nombre, ref, codigo, valor, vig, destNombre, destApellido);
      if (destEmail) _emailGiftCardDestinatario(destEmail, destNombre, nombre, apellido, codigo, valor, vig, mensaje);

      if (telEmisor && valor > 0)
        _upsertCliente({ telefono: String(telEmisor), tipoDoc: String(docTipo), numDoc: String(docNum), total: valor, _soloTotal: true });
    }

    return { ok: true, referencia: ref, status, estado: estadoGift };
  }
  _log('confirmarPagoGiftCard', ref, 'NOT_FOUND');
  return { ok: false, error: 'Referencia no encontrada: ' + ref };
}

function _getGiftCard(codigo) {
  if (!codigo) return { ok: false, valid: false, error: 'Código requerido', reason: 'Código requerido' };
  const sheet  = _getSheet(CFG.SHEETS.GIFT_CARDS);
  const data   = sheet.getDataRange().getValues();
  const header = data[0];
  const colCod     = header.indexOf('Código_Gift');
  // compatibilidad: acepta Saldo_Gift_COP (nuevo) o Valor_COP (legacy)
  const colSaldo   = header.indexOf('Saldo_Gift_COP') >= 0
    ? header.indexOf('Saldo_Gift_COP') : header.indexOf('Valor_COP');
  const colVig     = header.indexOf('Válido_Hasta');
  const colEstGift = header.indexOf('Estado_Gift');
  const colCanjeado= header.indexOf('Canjeado_En');

  if (colCod < 0) return { ok: false, valid: false, reason: 'Sheet no configurado correctamente' };

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][colCod]).trim() !== String(codigo).trim()) continue;
    const estado    = data[i][colEstGift] || '';
    const saldo     = data[i][colSaldo]   || 0;
    const isActive  = estado === 'ACTIVA';
    const available = isActive ? saldo : 0;
    const reason    = !isActive
      ? (estado === 'CANJEADA'   ? 'Este bono ya fue canjeado'
        : estado === 'CANCELADA' ? 'Este bono fue cancelado'
        : estado === 'INACTIVA'  ? 'Este bono aún no está activo'
        : 'Bono no disponible (' + estado + ')')
      : '';
    return {
      ok        : true,
      valid     : isActive,
      codigo    : data[i][colCod],
      valor     : saldo,
      vigencia  : data[i][colVig]      || '',
      estado,
      canjeadoEn: data[i][colCanjeado] || '',
      available,
      reason,
    };
  }
  return { ok: false, valid: false, error: 'Código no encontrado', reason: 'Código no encontrado' };
}

function _redeemDono(b) {
  const sheet  = _getSheet(CFG.SHEETS.GIFT_CARDS);
  const data   = sheet.getDataRange().getValues();
  const header = data[0];
  const colCod      = header.indexOf('Código_Gift');
  // compatibilidad Saldo_Gift_COP / Valor_COP
  const colSaldo    = header.indexOf('Saldo_Gift_COP') >= 0
    ? header.indexOf('Saldo_Gift_COP') : header.indexOf('Valor_COP');
  const colEstGift  = header.indexOf('Estado_Gift');
  const colCanjeado = header.indexOf('Canjeado_En');
  const colNotas    = header.indexOf('Notas_Internas');

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][colCod]).trim() !== String(b.code).trim()) continue;

    const saldoActual   = Number(data[i][colSaldo]) || 0;
    const montoUsado    = Number(b.amount) || saldoActual;
    const saldoRestante = Math.max(0, saldoActual - montoUsado);
    const ts            = new Date();
    const fechaFmt      = Utilities.formatDate(ts, 'America/Bogota', 'dd/MM/yy HH:mm');

    if (colSaldo   >= 0) sheet.getRange(i + 1, colSaldo   + 1).setValue(saldoRestante);
    const nuevoEstado = saldoRestante === 0 ? 'CANJEADA' : 'ACTIVA';
    if (colEstGift >= 0) sheet.getRange(i + 1, colEstGift + 1).setValue(nuevoEstado);

    // Canjeado_En: una línea por uso — ref | monto | fecha
    if (colCanjeado >= 0) {
      const prev     = String(data[i][colCanjeado] || '');
      const linea    = `${b.referencia || '?'} | ${_fmtCOP(montoUsado)} | ${fechaFmt}`;
      sheet.getRange(i + 1, colCanjeado + 1).setValue(prev ? prev + '\n' + linea : linea);
    }

    // Notas_Internas: log compacto
    if (colNotas >= 0) {
      const prev = String(data[i][colNotas] || '');
      const nota = `[${fechaFmt}] Usado ${_fmtCOP(montoUsado)} en ${b.referencia || '?'}. Saldo: ${_fmtCOP(saldoRestante)}`;
      sheet.getRange(i + 1, colNotas + 1).setValue(prev ? prev + '\n' + nota : nota);
    }

    _log('redeemDono', b.code, nuevoEstado, 'usado:' + montoUsado, 'saldo:' + saldoRestante);
    return { ok: true, saldoRestante, estado: nuevoEstado };
  }
  return { ok: false, error: 'Código no encontrado' };
}

// ── Reset GiftCards ─────────────────────────────────────────
function resetGiftCardSheet() {
  const HEADERS = [
    'Campaña_ID','Timestamp','Referencia','Código_Gift','Saldo_Gift_COP','Válido_Hasta',
    'ClienteID_Emisor',
    'Emisor_Nombre','Emisor_Apellido','Emisor_Email','Emisor_Tel',
    'Emisor_Tipo_Doc','Emisor_Num_Doc',
    'Emisor_Dirección','Emisor_Barrio','Emisor_Ciudad',
    'Dest_Nombre','Dest_Apellido','Dest_Email','Dest_Tel','Dest_Mensaje',
    'Estado_Pago','Estado_Gift',
    'Wompi_Transaction_ID','Fecha_Pago','Fecha_Activación',
    'Canjeado_En','Notas_Internas',
  ];
  const ss    = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CFG.SHEETS.GIFT_CARDS);
  if (!sheet) { Logger.log('Hoja GiftCards no encontrada'); return; }
  sheet.clearContents();
  sheet.appendRow(HEADERS);
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setBackground('#1a1610').setFontColor('#C4A05A').setFontWeight('bold');
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, HEADERS.length);
  Logger.log('✅ resetGiftCardSheet completado — ' + HEADERS.length + ' columnas');
}

// ============================================================
// CLIENTES — v16
// PK dual: TipoDoc+NumDoc (primero) / Teléfono (fallback)
// Cols: TipoDoc | NumDoc | Nombre | Apellido | Email | Teléfono |
//       Cumple_Día | Cumple_Mes |
//       Dirección | Barrio | Ciudad |
//       Primera_interacción | Última_interacción | Num_interacciones |
//       Total_histórico_COP | Historial_cambios | ClienteID
// ============================================================

// Índices de columnas Clientes (base 0, para uso interno)
const CLI = {
  TIPO_DOC     : 0,   // A
  NUM_DOC      : 1,   // B
  NOMBRE       : 2,   // C
  APELLIDO     : 3,   // D
  EMAIL        : 4,   // E
  TELEFONO     : 5,   // F
  CUMPLE_DIA   : 6,   // G
  CUMPLE_MES   : 7,   // H
  DIRECCION    : 8,   // I
  BARRIO       : 9,   // J
  CIUDAD       : 10,  // K
  PRIMERA_INT  : 11,  // L
  ULTIMA_INT   : 12,  // M
  NUM_INT      : 13,  // N
  TOTAL_HIST   : 14,  // O
  HISTORIAL    : 15,  // P
  PRODS_COMPRADOS: 16, // Q  ← nuevo
  CLIENTE_ID   : 17,  // R  ← movido
};

// Convierte valor de celda Sheets a entero de conteo (0–9999).
// Rechaza fechas seriales (1–50000) y valores imposibles.
function _safeCount(val) {
  if (typeof val !== 'number' || isNaN(val)) return 0;
  if (val >= 0 && val < 10000) return Math.round(val);
  return 0;
}

// Convierte valor de celda Sheets a COP redondeado por exceso a $1.000.
// Rechaza fechas seriales de Sheets (1–50000) → devuelve 0.
// $0 = cliente nuevo → válido.
function _safeMoney(val) {
  if (typeof val !== 'number' || isNaN(val)) return 0;
  if (val === 0) return 0;
  if (val > 0 && val <= 50000) return 0;           // fecha serial corrupta
  return Math.ceil(val / 1000) * 1000;             // redondeo por exceso a $1.000
}

// Redondea cualquier valor COP por exceso a la unidad $1.000
function _roundCOP(val) {
  const n = Number(val) || 0;
  if (n <= 0) return 0;
  return Math.ceil(n / 1000) * 1000;
}

function _upsertCliente(b) {
  const sheet = _getSheet(CFG.SHEETS.CLIENTES);
  const data  = sheet.getDataRange().getValues();
  const tel   = String(b.telefono || '').replace(/\s/g, '');
  const ts    = new Date();
  const dtFmt = () => Utilities.formatDate(ts, 'America/Bogota', 'dd/MM/yy HH:mm');

  // ── Helper: agregar línea al Historial_cambios (lee celda en vivo) ──
  function _addHistorial(i, linea) {
    const cell = sheet.getRange(i + 1, CLI.HISTORIAL + 1);
    const prev = String(cell.getValue() || '');
    cell.setValue(prev ? prev + '\n' + linea : linea);
  }

  // ── Helper: aplicar update a fila encontrada ─────────────
  function _applyUpdate(i) {
    const row = sheet.getRange(i + 1, 1, 1, 18).getValues()[0];

    // Nombre: si el nuevo es más largo (más completo), actualizar y loggear
    if (b.nombre && b.nombre.trim()) {
      const actual = String(row[CLI.NOMBRE] || '').trim();
      const nuevo  = b.nombre.trim();
      if (!actual) {
        sheet.getRange(i + 1, CLI.NOMBRE + 1).setValue(nuevo);
      } else if (nuevo.length > actual.length && nuevo.toLowerCase().includes(actual.toLowerCase())) {
        sheet.getRange(i + 1, CLI.NOMBRE + 1).setValue(nuevo);
        _addHistorial(i, `[${dtFmt()}] Nombre: "${actual}" → "${nuevo}"`);
      } else if (nuevo !== actual && !nuevo.toLowerCase().includes(actual.toLowerCase())) {
        // Nombre completamente diferente — loggear sin sobrescribir
        _addHistorial(i, `[${dtFmt()}] Nombre alt recibido: "${nuevo}" (registrado: "${actual}")`);
      }
    }

    // Apellido: misma lógica que nombre
    if (b.apellido && b.apellido.trim()) {
      const actual = String(row[CLI.APELLIDO] || '').trim();
      const nuevo  = b.apellido.trim();
      if (!actual) {
        sheet.getRange(i + 1, CLI.APELLIDO + 1).setValue(nuevo);
      } else if (nuevo.length > actual.length && nuevo.toLowerCase().includes(actual.toLowerCase())) {
        sheet.getRange(i + 1, CLI.APELLIDO + 1).setValue(nuevo);
        _addHistorial(i, `[${dtFmt()}] Apellido: "${actual}" → "${nuevo}"`);
      } else if (nuevo !== actual && !nuevo.toLowerCase().includes(actual.toLowerCase())) {
        _addHistorial(i, `[${dtFmt()}] Apellido alt recibido: "${nuevo}" (registrado: "${actual}")`);
      }
    }

    // Email: llenar si vacío, loggear si cambia
    if (b.email && b.email.trim()) {
      const actual = String(row[CLI.EMAIL] || '').trim();
      if (!actual) {
        sheet.getRange(i + 1, CLI.EMAIL + 1).setValue(b.email.trim());
      } else if (actual !== b.email.trim()) {
        _addHistorial(i, `[${dtFmt()}] Email alt: ${b.email.trim()} (registrado: ${actual})`);
      }
    }

    // Teléfono: si se encontró por doc y el tel es diferente, actualizar y loggear
    if (tel) {
      const actual = String(row[CLI.TELEFONO] || '').replace(/\s/g, '');
      if (!actual) {
        sheet.getRange(i + 1, CLI.TELEFONO + 1).setValue(tel);
      } else if (actual !== tel) {
        sheet.getRange(i + 1, CLI.TELEFONO + 1).setValue(tel);
        _addHistorial(i, `[${dtFmt()}] Tel: ${actual} → ${tel}`);
      }
    }

    // Cumpleaños: se puede corregir (fecha especial merece exactitud), loggear el cambio
    if (b.cumpleDia) {
      const actual = String(row[CLI.CUMPLE_DIA] || '').trim();
      if (!actual) {
        sheet.getRange(i + 1, CLI.CUMPLE_DIA + 1).setValue(b.cumpleDia);
      } else if (String(b.cumpleDia) !== actual) {
        sheet.getRange(i + 1, CLI.CUMPLE_DIA + 1).setValue(b.cumpleDia);
        _addHistorial(i, `[${dtFmt()}] Cumple_Día: ${actual} → ${b.cumpleDia}`);
      }
    }
    if (b.cumpleMes) {
      const actual = String(row[CLI.CUMPLE_MES] || '').trim();
      if (!actual) {
        sheet.getRange(i + 1, CLI.CUMPLE_MES + 1).setValue(b.cumpleMes);
      } else if (String(b.cumpleMes) !== actual) {
        sheet.getRange(i + 1, CLI.CUMPLE_MES + 1).setValue(b.cumpleMes);
        _addHistorial(i, `[${dtFmt()}] Cumple_Mes: ${actual} → ${b.cumpleMes}`);
      }
    }

    // Dirección: actualizar la principal, loggear cambio si es diferente
    if (b.direccion && b.direccion.trim()) {
      const actual = String(row[CLI.DIRECCION] || '').trim();
      const nueva  = b.direccion.trim();
      if (!actual) {
        sheet.getRange(i + 1, CLI.DIRECCION + 1).setValue(nueva);
        if (b.barrio) sheet.getRange(i + 1, CLI.BARRIO  + 1).setValue(b.barrio);
        if (b.ciudad) sheet.getRange(i + 1, CLI.CIUDAD  + 1).setValue(b.ciudad);
      } else if (actual !== nueva) {
        // Actualizar con la más reciente
        sheet.getRange(i + 1, CLI.DIRECCION + 1).setValue(nueva);
        if (b.barrio) sheet.getRange(i + 1, CLI.BARRIO  + 1).setValue(b.barrio);
        if (b.ciudad) sheet.getRange(i + 1, CLI.CIUDAD  + 1).setValue(b.ciudad);
        _addHistorial(i, `[${dtFmt()}] Dir anterior: ${actual}${row[CLI.BARRIO] ? ', ' + row[CLI.BARRIO] : ''}`);
      }
    }

    // Acumular total histórico — leer en vivo, redondear por exceso a $1.000
    if (b.total && b.total > 0) {
      const cellTotal = sheet.getRange(i + 1, CLI.TOTAL_HIST + 1);
      cellTotal.setNumberFormat('#,##0');
      const prev = _safeMoney(cellTotal.getValue());
      cellTotal.setValue(prev + _roundCOP(b.total));
    }

    // Acumular productos comprados (solo cuando viene con _pedidoRef)
    if (b._pedidoRef && b._pedidoProds && b._pedidoProds.length > 0) {
      const fechaFmt = Utilities.formatDate(b._pedidoTs || new Date(), 'America/Bogota', 'dd/MM/yy');
      const items = b._pedidoProds.map(p => {
        const parts = [p.productName || p.name || ''];
        if (p.collection) parts.push(p.collection);
        parts.push(`x${p.quantity || 1}`);
        return parts.join(' · ');
      }).join(' / ');
      const linea = `[${fechaFmt}] ${b._pedidoRef} — ${items} — ${_fmtCOP(b.total)}`;
      const cell  = sheet.getRange(i + 1, CLI.PRODS_COMPRADOS + 1);
      const prev  = String(cell.getValue() || '');
      cell.setValue(prev ? prev + '\n' + linea : linea);
    }

    // Interacciones — leer en vivo, solo si NO es llamada interna (_soloTotal)
    // Solo se cuenta cuando el pago es APPROVED (no en createPedidoWompi)
    if (!b._soloTotal) {
      sheet.getRange(i + 1, CLI.ULTIMA_INT + 1).setValue(ts);
      const cellInt = sheet.getRange(i + 1, CLI.NUM_INT + 1);
      cellInt.setNumberFormat('0');
      cellInt.setValue(_safeCount(cellInt.getValue()) + 1);
    }

    return String(row[CLI.CLIENTE_ID] || '');
  }

  // ── Helper: detectar identidad sospechosa ────────────────
  function _checkIdentidadSospechosa(rowNombre, rowApellido, rowCumpleDia, rowCumpleMes) {
    if (!b.nombre || !b.apellido) return false;
    const nombreDiff    = b.nombre.trim().toLowerCase()   !== (rowNombre  || '').trim().toLowerCase();
    const apellidoDiff  = b.apellido.trim().toLowerCase() !== (rowApellido|| '').trim().toLowerCase();
    const cumpleDiff    = b.cumpleDia && rowCumpleDia && String(b.cumpleDia) !== String(rowCumpleDia);
    // Sospechoso: nombre Y apellido completamente distintos
    // O nombre+apellido distintos Y fecha nacimiento distinta
    return (nombreDiff && apellidoDiff) || (nombreDiff && apellidoDiff && cumpleDiff);
  }

  // ── 1. Buscar por TipoDoc + NumDoc (PK principal) ────────
  if (b.tipoDoc && b.numDoc) {
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][CLI.TIPO_DOC]).trim() !== b.tipoDoc.trim()) continue;
      if (String(data[i][CLI.NUM_DOC] ).trim() !== b.numDoc.trim() ) continue;

      // Verificar identidad sospechosa antes de actualizar
      const sospechoso = _checkIdentidadSospechosa(
        data[i][CLI.NOMBRE], data[i][CLI.APELLIDO],
        data[i][CLI.CUMPLE_DIA], data[i][CLI.CUMPLE_MES]
      );
      if (sospechoso) {
        _emailIdentidadSospechosa(b, data[i]);
        _addHistorial(i, `[${dtFmt()}] ⚠️ IDENTIDAD SOSPECHOSA: nombre recibido "${b.nombre} ${b.apellido}" no coincide`);
        // Dejar pasar — solo loggear y alertar
      }

      const clienteId = _applyUpdate(i);
      _log('upsertCliente', 'UPDATE_DOC', b.tipoDoc, b.numDoc, clienteId);
      return { ok: true, clienteId, nuevo: false };
    }
  }

  // ── 2. Buscar por Teléfono (fallback) ────────────────────
  if (tel) {
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][CLI.TELEFONO]).replace(/\s/g, '') !== tel) continue;

      const sospechoso = _checkIdentidadSospechosa(
        data[i][CLI.NOMBRE], data[i][CLI.APELLIDO],
        data[i][CLI.CUMPLE_DIA], data[i][CLI.CUMPLE_MES]
      );
      if (sospechoso) {
        _emailIdentidadSospechosa(b, data[i]);
        _addHistorial(i, `[${dtFmt()}] ⚠️ IDENTIDAD SOSPECHOSA: nombre recibido "${b.nombre} ${b.apellido}" no coincide`);
      }

      const clienteId = _applyUpdate(i);
      _log('upsertCliente', 'UPDATE_TEL', tel, clienteId);
      return { ok: true, clienteId, nuevo: false };
    }
  }

  // ── 3. Nuevo cliente ─────────────────────────────────────
  if (!tel && !b.tipoDoc) return { ok: true, clienteId: 'SIN-ID' };

  const clienteId = 'IMO-' + Date.now();
  sheet.appendRow([
    b.tipoDoc  || '',   // A  TipoDoc
    b.numDoc   || '',   // B  NumDoc
    b.nombre   || '',   // C  Nombre
    b.apellido || '',   // D  Apellido
    b.email    || '',   // E  Email
    tel        || '',   // F  Teléfono
    b.cumpleDia|| '',   // G  Cumple_Día
    b.cumpleMes|| '',   // H  Cumple_Mes
    b.direccion|| '',   // I  Dirección
    b.barrio   || '',   // J  Barrio
    b.ciudad   || '',   // K  Ciudad
    ts,                 // L  Primera_interacción
    b._soloTotal ? '' : ts,           // M  Última_interacción — vacía si solo registro inicial
    b._soloTotal ? 0   : 1,           // N  Num_interacciones — 0 si createPedido, 1 si pago confirmado
    b._soloTotal ? 0   : (b.total || 0), // O  Total_histórico_COP — 0 hasta confirmar pago
    '',                 // P  Historial_cambios
    '',                 // Q  Productos_comprados
    clienteId,          // R  ClienteID
  ]);

  // Forzar formato numérico en celdas N (Num_interacciones) y O (Total_histórico_COP)
  // para evitar que hereden formato Fecha de la columna y muestren "2 ene 1900"
  const newRow = sheet.getLastRow();
  sheet.getRange(newRow, CLI.NUM_INT    + 1).setNumberFormat('0');
  sheet.getRange(newRow, CLI.TOTAL_HIST + 1).setNumberFormat('#,##0');

  _log('upsertCliente', 'INSERT', tel || b.tipoDoc, clienteId);
  return { ok: true, clienteId, nuevo: true };
}

// ── Reset Clientes (ejecutar cuando migres a v16) ───────────
function resetClientesSheet() {
  const HEADERS = [
    'TipoDoc','NumDoc','Nombre','Apellido','Email','Teléfono',
    'Cumple_Día','Cumple_Mes',
    'Dirección','Barrio','Ciudad',
    'Primera_interacción','Última_interacción','Num_interacciones',
    'Total_histórico_COP','Historial_cambios','Productos_comprados','ClienteID',
  ];
  const ss    = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CFG.SHEETS.CLIENTES);
  if (!sheet) { Logger.log('Hoja Clientes no encontrada'); return; }
  sheet.clearContents();
  sheet.appendRow(HEADERS);
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setBackground('#1a1610').setFontColor('#C4A05A').setFontWeight('bold');
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, HEADERS.length);
  Logger.log('✅ resetClientesSheet completado — ' + HEADERS.length + ' columnas');
}

function _getCliente(telefono) {
  if (!telefono) return { ok: false, error: 'Teléfono requerido' };
  const sheet = _getSheet(CFG.SHEETS.CLIENTES);
  const data  = sheet.getDataRange().getValues();
  const tel   = telefono.replace(/\s/g, '');
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][CLI.TELEFONO]).replace(/\s/g, '') === tel) {
      return {
        ok          : true,
        clienteId   : data[i][CLI.CLIENTE_ID],
        tipoDoc     : data[i][CLI.TIPO_DOC],
        numDoc      : data[i][CLI.NUM_DOC],
        nombre      : data[i][CLI.NOMBRE],
        apellido    : data[i][CLI.APELLIDO],
        email       : data[i][CLI.EMAIL],
        telefono    : data[i][CLI.TELEFONO],
        cumpleDia   : data[i][CLI.CUMPLE_DIA],
        cumpleMes   : data[i][CLI.CUMPLE_MES],
        direccion   : data[i][CLI.DIRECCION],
        barrio      : data[i][CLI.BARRIO],
        ciudad      : data[i][CLI.CIUDAD],
      };
    }
  }
  return { ok: false, error: 'Cliente no encontrado' };
}

// ============================================================
// DASHBOARD_CLIENTES — 1 fila por cliente
// Cols: ClienteID | TipoDoc | NumDoc | Nombre | Apellido |
//       Email | Teléfono | Ciudad |
//       Primera_compra | Última_compra | Nº_pedidos |
//       Total_gastado_COP | GiftCards_emitidas | GiftCards_saldo_activo |
//       Historial_pedidos
// ============================================================

function rebuildDashboard() {
  const ss       = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
  const HEADERS  = [
    'ClienteID','TipoDoc','NumDoc','Nombre','Apellido',
    'Email','Teléfono','Ciudad',
    'Primera_compra','Última_compra','Nº_pedidos',
    'Total_gastado_COP','GiftCards_emitidas','GiftCards_saldo_activo',
    'Historial_pedidos',
  ];

  // Asegurar hoja Dashboard existe
  let dash = ss.getSheetByName(CFG.SHEETS.DASHBOARD);
  if (!dash) dash = ss.insertSheet(CFG.SHEETS.DASHBOARD);
  dash.clearContents();
  dash.appendRow(HEADERS);
  dash.getRange(1, 1, 1, HEADERS.length)
    .setBackground('#0d3b2e').setFontColor('#7fc6a4').setFontWeight('bold');
  dash.setFrozenRows(1);

  // Leer Clientes
  const cliSheet = _getSheet(CFG.SHEETS.CLIENTES);
  const cliData  = cliSheet.getDataRange().getValues();

  // Leer Pedidos_Wompi indexados por ClienteID
  const wpSheet  = _getSheet(CFG.SHEETS.PEDIDOS_WOMPI);
  const wpData   = wpSheet.getDataRange().getValues();
  const wpHeader = wpData[0];
  const wpMap    = {}; // clienteId → [pedidos]
  for (let i = 1; i < wpData.length; i++) {
    const row = wpData[i];
    const cid = String(row[wpHeader.indexOf('ClienteID')] || '');
    if (!cid) continue;
    if (!wpMap[cid]) wpMap[cid] = [];
    wpMap[cid].push(row);
  }

  // Leer GiftCards indexadas por ClienteID_Emisor
  const gcSheet  = _getSheet(CFG.SHEETS.GIFT_CARDS);
  const gcData   = gcSheet.getDataRange().getValues();
  const gcHeader = gcData[0];
  const gcMap    = {}; // clienteId → [gifts]
  for (let i = 1; i < gcData.length; i++) {
    const row = gcData[i];
    const cid = String(row[gcHeader.indexOf('ClienteID_Emisor')] || '');
    if (!cid) continue;
    if (!gcMap[cid]) gcMap[cid] = [];
    gcMap[cid].push(row);
  }

  const wpColTotal    = wpHeader.indexOf('Total_COP');
  const wpColTs       = wpHeader.indexOf('Timestamp');
  const wpColRef      = wpHeader.indexOf('Referencia');
  const wpColProds    = wpHeader.indexOf('Productos_JSON');
  const wpColEstado   = wpHeader.indexOf('Estado_Pedido');
  const gcColSaldo    = gcHeader.indexOf('Saldo_Gift_COP') >= 0
    ? gcHeader.indexOf('Saldo_Gift_COP') : gcHeader.indexOf('Valor_COP');
  const gcColEstGift  = gcHeader.indexOf('Estado_Gift');
  const gcColCodigo   = gcHeader.indexOf('Código_Gift');

  const rows = [];

  for (let i = 1; i < cliData.length; i++) {
    const c = cliData[i];
    const cid = String(c[CLI.CLIENTE_ID] || '');
    if (!cid) continue;

    const pedidos = wpMap[cid] || [];
    const gifts   = gcMap[cid] || [];

    // Métricas de pedidos
    const pedidosConfirmados = pedidos.filter(p =>
      ['CONFIRMADO','EN_PRODUCCION','EN_TRANSITO','EN_NACIONALIZACION',
       'LISTO_DESPACHO','DISPONIBLE_TIENDA','DESPACHADO'].includes(String(p[wpColEstado]))
    );

    let totalGastado   = 0;
    let primeraCompra  = null;
    let ultimaCompra   = null;
    const histLineas   = [];

    pedidosConfirmados.forEach(p => {
      const total = Number(p[wpColTotal]) || 0;
      totalGastado += total;
      const ts = p[wpColTs] ? new Date(p[wpColTs]) : null;
      if (ts) {
        if (!primeraCompra || ts < primeraCompra) primeraCompra = ts;
        if (!ultimaCompra  || ts > ultimaCompra)  ultimaCompra  = ts;
      }
      // Historial_pedidos: productos legibles por pedido
      const ref    = String(p[wpColRef] || '');
      const prods  = _parseJSON(p[wpColProds]);
      const fecha  = ts ? Utilities.formatDate(ts, 'America/Bogota', 'dd/MM/yy') : '?';
      const items  = prods.map(pr => {
        const parts = [pr.productName || pr.name || ''];
        if (pr.collection) parts.push(pr.collection);
        parts.push(`x${pr.quantity || 1}`);
        parts.push(_fmtCOP((pr.price || 0) * (pr.quantity || 1)));
        return parts.join(' · ');
      }).join(' / ');
      histLineas.push(`[${fecha}] ${ref} — ${items || 'sin detalle'} — Total: ${_fmtCOP(total)}`);
    });

    // Métricas GiftCards
    const gcEmitidas = gifts.length;
    const gcSaldoActivo = gifts
      .filter(g => String(g[gcColEstGift]) === 'ACTIVA')
      .reduce((s, g) => s + (Number(g[gcColSaldo]) || 0), 0);
    if (gifts.length > 0) {
      gifts.forEach(g => {
        const cod    = String(g[gcColCodigo] || '');
        const estado = String(g[gcColEstGift] || '');
        const saldo  = Number(g[gcColSaldo]) || 0;
        histLineas.push(`[GIFT] ${cod} — ${estado} — Saldo: ${_fmtCOP(saldo)}`);
      });
    }

    const primeraStr = primeraCompra
      ? Utilities.formatDate(primeraCompra, 'America/Bogota', 'dd/MM/yy') : '';
    const ultimaStr  = ultimaCompra
      ? Utilities.formatDate(ultimaCompra,  'America/Bogota', 'dd/MM/yy') : '';

    rows.push([
      cid,                                          // ClienteID
      String(c[CLI.TIPO_DOC]   || ''),              // TipoDoc
      String(c[CLI.NUM_DOC]    || ''),              // NumDoc
      String(c[CLI.NOMBRE]     || ''),              // Nombre
      String(c[CLI.APELLIDO]   || ''),              // Apellido
      String(c[CLI.EMAIL]      || ''),              // Email
      String(c[CLI.TELEFONO]   || ''),              // Teléfono
      String(c[CLI.CIUDAD]     || ''),              // Ciudad
      primeraStr,                                   // Primera_compra
      ultimaStr,                                    // Última_compra
      pedidosConfirmados.length,                    // Nº_pedidos
      totalGastado,                                 // Total_gastado_COP
      gcEmitidas,                                   // GiftCards_emitidas
      gcSaldoActivo,                                // GiftCards_saldo_activo
      histLineas.join('\n'),                        // Historial_pedidos
    ]);
  }

  if (rows.length > 0) {
    dash.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
  }

  // Formato columnas de dinero
  const colTotalG  = HEADERS.indexOf('Total_gastado_COP')    + 1;
  const colSaldoG  = HEADERS.indexOf('GiftCards_saldo_activo')+ 1;
  if (rows.length > 0) {
    dash.getRange(2, colTotalG, rows.length, 1)
      .setNumberFormat('$#,##0');
    dash.getRange(2, colSaldoG, rows.length, 1)
      .setNumberFormat('$#,##0');
  }

  dash.autoResizeColumns(1, HEADERS.length);
  dash.setFrozenRows(1);
  _log('rebuildDashboard', 'OK', rows.length + ' clientes');
  Logger.log('✅ Dashboard_Clientes reconstruido — ' + rows.length + ' filas');
}

// ============================================================
// RECUPERAR PEDIDO
// ============================================================

function _getPedido(referencia) {
  if (!referencia) return { ok: false, error: 'Referencia requerida' };
  if (referencia.startsWith('WA-')) {
    const sheet  = _getSheet(CFG.SHEETS.WISHLIST);
    const data   = sheet.getDataRange().getValues();
    const header = data[0];
    const colRef = header.indexOf('Referencia');
    for (let i = 1; i < data.length; i++) {
      if (data[i][colRef] !== referencia) continue;
      const row = {};
      header.forEach((h, j) => row[h] = data[i][j]);
      return {
        ok        : true,
        referencia,
        hoja      : 'Wishlist',
        cliente   : {
          nombre    : row['Nombre'],
          apellido  : row['Apellido'],
          email     : row['Email'],
          telefono  : row['Teléfono'],
          tipoDoc   : row['Tipo_Doc'],
          numDoc    : row['Num_Doc'],
        },
        entrega   : {
          direccion : row['Dirección_Wishlist'],
          barrio    : row['Barrio_Wishlist'],
          ciudad    : row['Ciudad_Wishlist'],
          notas     : row['Notas'],
        },
        productos : _parseJSON(row['Productos_JSON']),
        total     : row['Total_COP'],
        estado    : row['Estado_Wishlist'],
      };
    }
  }
  return { ok: false, error: 'Pedido no encontrado: ' + referencia };
}

// ============================================================
// CAMPAÑAS
// ============================================================

function _getCampaniasActivas() {
  const sheet  = _getSheet(CFG.SHEETS.CAMPANIAS);
  const data   = sheet.getDataRange().getValues();
  const header = data[0];
  const hoy    = new Date();
  const activas = [];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    header.forEach((h, j) => row[h] = data[i][j]);
    const vigFin = row['Vigencia_Fin'] ? new Date(row['Vigencia_Fin']) : null;
    if (vigFin && hoy > vigFin && row['Estado'] === 'ACTIVA') {
      sheet.getRange(i + 1, header.indexOf('Estado') + 1).setValue('CERRADA');
      _log('campania_autocerrada', row['Campaña_ID']);
      continue;
    }
    if (row['Estado'] === 'ACTIVA') activas.push(row);
  }
  return { ok: true, campanias: activas };
}

function _getClientesSegmento() {
  const sheet  = _getSheet(CFG.SHEETS.CLIENTES);
  const data   = sheet.getDataRange().getValues();
  const todos  = [];
  for (let i = 1; i < data.length; i++) {
    todos.push({
      clienteId : data[i][CLI.CLIENTE_ID],
      nombre    : data[i][CLI.NOMBRE],
      apellido  : data[i][CLI.APELLIDO],
      email     : data[i][CLI.EMAIL],
      telefono  : data[i][CLI.TELEFONO],
    });
  }
  return todos;
}

// ============================================================
// TRIGGERS
// ============================================================

function onSheetChange(e) {
  try {
    if (!e || e.changeType !== 'EDIT') return;
    const sheet = e.source.getActiveSheet();
    if (sheet.getName() !== CFG.SHEETS.PEDIDOS_WOMPI) return;

    const header    = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const colEstado = header.indexOf('Estado_Pedido');
    if (colEstado < 0 || e.range.getColumn() !== colEstado + 1) return;

    const nuevoEstado = e.range.getValue();
    const ESTADOS_MANUALES = [
      'EN_PRODUCCION','EN_TRANSITO','EN_NACIONALIZACION',
      'LISTO_DESPACHO','DISPONIBLE_TIENDA','DESPACHADO',
    ];
    if (!ESTADOS_MANUALES.includes(nuevoEstado)) return;

    const rowData = sheet.getRange(e.range.getRow(), 1, 1, header.length).getValues()[0];
    _emailNotificarEstadoPedido(rowData, header, nuevoEstado);
  } catch(err) {
    _log('onSheetChange_ERROR', err.message);
  }
}

function checkWishlistAbandonadas() {
  const sheet  = _getSheet(CFG.SHEETS.WISHLIST);
  const data   = sheet.getDataRange().getValues();
  const header = data[0];
  const colRef    = header.indexOf('Referencia');
  const colTs     = header.indexOf('Timestamp');
  const colEstado = header.indexOf('Estado_Wishlist');
  const colEmail  = header.indexOf('Email');
  const colNombre = header.indexOf('Nombre');
  const colProds  = header.indexOf('Productos_JSON');
  const colTotal  = header.indexOf('Total_COP');
  const colNotas  = header.indexOf('Notas_internas');
  const ahora     = new Date();

  for (let i = 1; i < data.length; i++) {
    if (data[i][colEstado] !== 'PENDIENTE') continue;
    const minutos = (ahora - new Date(data[i][colTs])) / 60000;
    if (minutos < CFG.WISHLIST_ABANDON_MIN || minutos > CFG.WISHLIST_ABANDON_MIN + 60) continue;
    const email  = data[i][colEmail]  || '';
    const ref    = data[i][colRef]    || '';
    if (!email) continue;
    const notas = String(data[i][colNotas] || '');
    if (notas.includes('ABANDON_EMAIL_SENT')) continue;
    _emailCarritoAbandonado(email, data[i][colNombre] || '', ref,
      _parseJSON(data[i][colProds]), data[i][colTotal] || 0);
    sheet.getRange(i + 1, colNotas + 1).setValue(
      (notas ? notas + ' | ' : '') + 'ABANDON_EMAIL_SENT:' + ahora.toISOString()
    );
    _log('carritoAbandonado', ref, email, 'OK');
  }
}

// ============================================================
// EMAILS
// ============================================================

function _emailPedidoRecibido(email, nombre, ref, productos, total) {
  try {
    const subject = `&#128203; ${CFG.NOMBRE_TIENDA} — Hemos recibido tu lista de deseos`;
    const body = _emailWrapper(nombre, `
      <p>Hemos recibido tu lista de deseos y estamos muy felices de acompañarte en esta selección. Helena o alguien de nuestro equipo te contactará pronto para brindarte asesoría personalizada y coordinar todos los detalles de tu pedido.</p>
      <p style="font-size:13px;color:#888">Referencia: <strong>${ref}</strong></p>
      ${_productosHTML(productos)}
      <p style="font-size:18px;font-weight:bold;color:#C4A05A;margin-top:16px">Total estimado: ${_fmtCOP(_roundCOP(total))}</p>
      <p style="font-size:13px;color:#666;margin-top:16px">
        Cada pieza es única — hecha a mano en Italia, especialmente para ti.<br>
        Si tienes preguntas, escríbenos por 
        <a href="https://wa.me/${CFG.WHATSAPP}" style="color:#C4A05A">WhatsApp</a> con mucho gusto te atendemos.
      </p>
    `);
    GmailApp.sendEmail(email, subject, '', { htmlBody: body });
    _log('emailPedidoRecibido', ref, email, 'OK');
  } catch(err) { _log('emailPedidoRecibido_ERROR', ref, err.message); }
}

function _emailPagoConfirmado(email, nombre, ref, productos, total, giftInfo, pctPagado, subtotal, descuento) {
  try {
    const subject = `&#127881; ${CFG.NOMBRE_TIENDA} — ¡Pago confirmado! Pedido ${ref}`;

    // ── Tabla de ítems ──────────────────────────────────────
    const tablaProductos = _productosHTML(productos);

    // ── Bloque resumen financiero ───────────────────────────
    let resumenHTML = '';

    // Línea bono si aplica
    let bonoHTML = '';
    let bonoDesc = 0;
    if (giftInfo && giftInfo.tipo === 'MIXTO') {
      bonoDesc = _roundCOP(giftInfo.monto);
      bonoHTML = `
        <tr>
          <td style="padding:5px 8px;font-size:13px;color:#555">
            &#127873; Bono <code style="background:#e8f5e8;padding:2px 6px;border-radius:3px;font-size:12px">${giftInfo.codigo}</code>
          </td>
          <td style="padding:5px 8px;font-size:13px;text-align:right;color:#5a9a5a">
            − ${_fmtCOP(bonoDesc)}
          </td>
        </tr>`;
    } else if (giftInfo && giftInfo.tipo === 'TOTAL') {
      bonoDesc = _roundCOP(total);
      bonoHTML = `
        <tr>
          <td style="padding:5px 8px;font-size:13px;color:#555">&#127873; Pagado 100% con Gift Card</td>
          <td style="padding:5px 8px;font-size:13px;text-align:right;color:#5a9a5a">− ${_fmtCOP(bonoDesc)}</td>
        </tr>`;
    }

    // Subtotal + bono + descuento pago anticipado + total pagado — todos redondeados a $1.000
    const subtotalMostrar = _roundCOP(subtotal || total);
    const totalRedondeado = _roundCOP(total);

    // Línea descuento pago anticipado (3%) — solo si aplica
    const descRedondeado = _roundCOP(descuento || 0);
    const descHTML = descRedondeado > 0 ? `
        <tr>
          <td style="padding:5px 8px;font-size:13px;color:#555">Dcto. Descuento pago anticipado</td>
          <td style="padding:5px 8px;font-size:13px;text-align:right;color:#5a9a5a">− ${_fmtCOP(descRedondeado)}</td>
        </tr>` : '';

    resumenHTML = `
      <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#f8f5ee;border-radius:6px">
        <tr>
          <td style="padding:5px 8px;font-size:13px;color:#555">Subtotal</td>
          <td style="padding:5px 8px;font-size:13px;text-align:right">${_fmtCOP(subtotalMostrar)}</td>
        </tr>
        ${bonoHTML}
        ${descHTML}
        <tr style="border-top:2px solid #C4A05A">
          <td style="padding:8px 8px 5px;font-size:14px;font-weight:bold;color:#1a1610">Total pagado</td>
          <td style="padding:8px 8px 5px;font-size:14px;font-weight:bold;text-align:right;color:#C4A05A">${_fmtCOP(totalRedondeado)}</td>
        </tr>
      </table>`;

    // ── Bloque saldo pendiente (solo pct=60) ────────────────
    let saldoHTML = '';
    const pct = Number(pctPagado) || 100;
    if (pct === 60) {
      const saldoPendiente = _roundCOP((subtotalMostrar - bonoDesc) * 0.4);
      saldoHTML = `
        <div style="background:#fff8e6;border-left:4px solid #C4A05A;padding:14px 18px;border-radius:4px;margin:16px 0">
          <p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:#7a5c00">Saldo pendiente: ${_fmtCOP(saldoPendiente)}</p>
          <p style="margin:0;font-size:13px;color:#555">
            Te avisaremos cuando tu pedido esté en tránsito desde Italia, con tiempo suficiente
            para completar el pago sin incurrir en sobrecostos o penalidades.
          </p>
        </div>`;
    }

    const body = _emailWrapper(nombre, `
      <p>¡Qué alegría! Tu pago ha sido confirmado exitosamente. Cada pieza que elegiste es única — hecha a mano en Italia, especialmente para ti.</p>
      <p style="font-size:13px;color:#888">Referencia: <strong>${ref}</strong></p>
      ${tablaProductos}
      ${resumenHTML}
      ${saldoHTML}
      <p style="font-size:13px;color:#666;margin-top:16px">
        Te mantendremos informada sobre el estado de tu pedido en cada etapa del proceso.<br>
        Si tienes alguna pregunta, escríbenos por 
        <a href="https://wa.me/${CFG.WHATSAPP}" style="color:#C4A05A">WhatsApp</a>, con mucho gusto te atendemos.
      </p>
    `);
    GmailApp.sendEmail(email, subject, '', { htmlBody: body });
    _log('emailPagoConfirmado', ref, email, 'OK');
  } catch(err) { _log('emailPagoConfirmado_ERROR', ref, err.message); }
}

function _emailPagoCancelado(email, nombre, ref, status) {
  try {
    const subject = `&#10060; ${CFG.NOMBRE_TIENDA} — Problema con tu pago — Pedido ${ref}`;
    const msgs = {
      'DECLINED' : 'Tu pago fue declinado por la entidad bancaria. Por favor verifica tus datos o intenta con otro medio de pago.',
      'VOIDED'   : 'Tu transacción fue anulada.',
      'ERROR'    : 'Ocurrió un error al procesar tu pago. Por favor intenta nuevamente.',
    };
    const body = _emailWrapper(nombre, `
      <p>${msgs[status] || 'Tu pago no pudo ser procesado.'}</p>
      <p style="font-size:13px;color:#888">Referencia: <strong>${ref}</strong></p>
      <p style="font-size:13px;color:#666;margin-top:16px">
        Si tienes dudas, escríbenos por 
        <a href="https://wa.me/${CFG.WHATSAPP}" style="color:#C4A05A">WhatsApp</a>
        y te ayudamos de inmediato.
      </p>
      <div style="margin-top:20px;text-align:center">
        <a href="${CFG.CATALOGO}" style="background:#C4A05A;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:14px">
          Volver al catálogo
        </a>
      </div>
    `);
    GmailApp.sendEmail(email, subject, '', { htmlBody: body });
    _log('emailPagoCancelado', ref, email, status, 'OK');
  } catch(err) { _log('emailPagoCancelado_ERROR', ref, err.message); }
}

// Instrucciones de uso gift card — compartidas entre email emisor y destinatario
function _instruccionesGiftHTML() {
  return `
    <p style="font-size:13px;color:#555;margin-top:16px">
      <strong>¿Cómo usar la Gift Card?</strong><br>
      Ingresa el código en el campo habilitado antes del checkout del carrito de compras.
      Es válida para cualquier compra en nuestra tienda y tiene vigencia de 9 meses desde
      la fecha de emisión.
    </p>
    <p style="font-size:13px;color:#555;margin-top:10px">
      <strong>Recuerda:</strong> guarda este código en un lugar seguro.
    </p>`;
}

function _emailGiftCardActivada(email, nombre, ref, codigo, valor, vigencia, destNombre, destApellido) {
  try {
    const subject = `&#127873; ${CFG.NOMBRE_TIENDA} — ¡Tu Gift Card está lista! ${codigo}`;
    const destCompleto = [destNombre, destApellido].filter(Boolean).join(' ') || 'el destinatario';
    const body = _emailWrapper(nombre, `
      <p>¡Tu Gift Card ha sido activada exitosamente y enviada a <strong>${destCompleto}</strong>! &#127881;</p>
      <div style="background:#1a1610;border-radius:12px;padding:24px;text-align:center;margin:20px 0">
        <p style="color:#C4A05A;font-size:12px;letter-spacing:2px;margin:0 0 8px">CÓDIGO DE REGALO</p>
        <p style="color:#fff;font-size:28px;font-weight:bold;font-family:monospace;letter-spacing:4px;margin:0 0 8px">${codigo}</p>
        <p style="color:#C4A05A;font-size:18px;font-weight:bold;margin:0 0 8px">${_fmtCOP(_roundCOP(valor))}</p>
        <p style="color:#888;font-size:12px;margin:0">Válido hasta: ${vigencia}</p>
      </div>
      ${_instruccionesGiftHTML()}
      <p style="font-size:12px;color:#aaa;margin-top:16px">Referencia de pago: ${ref}</p>
      <div style="margin-top:20px;text-align:center">
        <a href="${CFG.CATALOGO}" style="background:#C4A05A;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:14px">
          Ir al catálogo
        </a>
      </div>
    `);
    GmailApp.sendEmail(email, subject, '', { htmlBody: body });
    _log('emailGiftCardActivada', ref, email, codigo, 'OK');
  } catch(err) { _log('emailGiftCardActivada_ERROR', ref, err.message); }
}

function _emailGiftCardDestinatario(destEmail, destNombre, emisorNombre, emisorApellido, codigo, valor, vigencia, mensaje) {
  try {
    const subject = `&#127873; ${CFG.NOMBRE_TIENDA} — ¡Tienes un regalo esperándote!`;
    const emisorCompleto = [emisorNombre, emisorApellido].filter(Boolean).join(' ');
    const mensajeHTML = mensaje
      ? `<div style="background:#f8f5ee;border-left:4px solid #C4A05A;padding:14px 18px;border-radius:4px;margin:16px 0;font-style:italic;color:#555">
           "${mensaje}"<br><span style="font-size:12px;color:#888;font-style:normal">— ${emisorCompleto}</span>
         </div>`
      : `<p style="font-size:13px;color:#666">${emisorCompleto} te envía este regalo con todo el cariño.</p>`;
    const body = _emailWrapper(destNombre || '', `
      <p><strong>${emisorCompleto}</strong> te ha enviado una Gift Card de ${CFG.NOMBRE_TIENDA}. &#127881;</p>
      ${mensajeHTML}
      <div style="background:#1a1610;border-radius:12px;padding:24px;text-align:center;margin:20px 0">
        <p style="color:#C4A05A;font-size:12px;letter-spacing:2px;margin:0 0 8px">TU CÓDIGO DE REGALO</p>
        <p style="color:#fff;font-size:28px;font-weight:bold;font-family:monospace;letter-spacing:4px;margin:0 0 8px">${codigo}</p>
        <p style="color:#C4A05A;font-size:18px;font-weight:bold;margin:0 0 8px">${_fmtCOP(_roundCOP(valor))}</p>
        <p style="color:#888;font-size:12px;margin:0">Válido hasta: ${vigencia}</p>
      </div>
      ${_instruccionesGiftHTML()}
      <div style="margin-top:20px;text-align:center">
        <a href="${CFG.CATALOGO}" style="background:#C4A05A;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:14px">
          Explorar el catálogo
        </a>
      </div>
    `);
    GmailApp.sendEmail(destEmail, subject, '', { htmlBody: body });
    _log('emailGiftCardDestinatario', codigo, destEmail, 'OK');
  } catch(err) { _log('emailGiftCardDestinatario_ERROR', codigo, err.message); }
}
function _emailEnviadoWA(email, nombre, ref, productos, total) {
  try {
    const subject = `&#128203; ${CFG.NOMBRE_TIENDA} — Hemos recibido tu lista de deseos`;
    const body = _emailWrapper(nombre, `
      <p>¡Recibimos tu lista de deseos y nos alegra mucho saber de ti! Helena o alguien de nuestro equipo se pondrá en contacto contigo pronto para brindarte asesoría personalizada y coordinar todos los detalles de tu pedido.</p>
      <p style="font-size:13px;color:#888">Referencia: <strong>${ref}</strong></p>
      ${_productosHTML(productos)}
      <p style="font-size:18px;font-weight:bold;color:#C4A05A;margin-top:16px">Total estimado: ${_fmtCOP(_roundCOP(total))}</p>
      <p style="font-size:13px;color:#666;margin-top:16px">
        Si tienes preguntas, escríbenos por 
        <a href="https://wa.me/${CFG.WHATSAPP}" style="color:#C4A05A">WhatsApp</a>, con mucho gusto te atendemos.
      </p>
    `);
    GmailApp.sendEmail(email, subject, '', { htmlBody: body });
    _log('emailEnviadoWA', ref, email, 'OK');
  } catch(err) { _log('emailEnviadoWA_ERROR', ref, err.message); }
}

function _emailCarritoAbandonado(email, nombre, ref, productos, total) {
  try {
    const subject = `&#128722; ${CFG.NOMBRE_TIENDA} — ¿Olvidaste algo?`;
    const enlace  = `${CFG.CATALOGO}?ref=${ref}`;
    const body = _emailWrapper(nombre, `
      <p>Notamos que seleccionaste algunas piezas pero no completaste el proceso.</p>
      ${_productosHTML(productos)}
      <p style="font-size:18px;font-weight:bold;color:#C4A05A;margin-top:16px">Total estimado: ${_fmtCOP(total)}</p>
      <div style="margin-top:24px;text-align:center">
        <a href="${enlace}" style="background:#C4A05A;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:bold">
          Recuperar mi carrito
        </a>
      </div>
      <p style="font-size:12px;color:#aaa;margin-top:20px;text-align:center">Referencia: ${ref}</p>
    `);
    GmailApp.sendEmail(email, subject, '', { htmlBody: body });
    _log('emailCarritoAbandonado', ref, email, 'OK');
  } catch(err) { _log('emailCarritoAbandonado_ERROR', ref, err.message); }
}

function _emailNotificarEstadoPedido(rowData, header, estado) {
  try {
    const email  = rowData[header.indexOf('Email')]     || '';
    const nombre = rowData[header.indexOf('Nombre')]    || 'cliente';
    const ref    = rowData[header.indexOf('Referencia')]|| '';
    if (!email) return;
    const MENSAJES = {
      'EN_PRODUCCION'      : 'Tu pedido está en producción en Italia. Te notificaremos cuando esté listo para embarque.',
      'EN_TRANSITO'        : 'Tu pedido está en tránsito desde Italia hacia Colombia.',
      'EN_NACIONALIZACION' : 'Tu pedido está en proceso de nacionalización en aduana.',
      'LISTO_DESPACHO'     : 'Tu pedido está listo para ser despachado.',
      'DISPONIBLE_TIENDA'  : 'Tu pedido está disponible para retirar en nuestra tienda en Bogotá.',
      'DESPACHADO'         : 'Tu pedido ha sido despachado. Pronto recibirás la información de seguimiento.',
    };
    const subject = `&#128230; ${CFG.NOMBRE_TIENDA} — Actualización pedido ${ref}`;
    const body = _emailWrapper(nombre, `
      <p>${MENSAJES[estado] || 'El estado de tu pedido ha sido actualizado: ' + estado}</p>
      <p style="font-size:13px;color:#888">Referencia: <strong>${ref}</strong></p>
      <p style="font-size:13px;color:#666;margin-top:16px">
        Gracias por tu preferencia. Si tienes preguntas escríbenos por 
        <a href="https://wa.me/${CFG.WHATSAPP}" style="color:#C4A05A">WhatsApp</a>.
      </p>
    `);
    GmailApp.sendEmail(email, subject, '', { htmlBody: body });
    _log('emailNotificarEstado', ref, estado, email, 'OK');
  } catch(err) { _log('emailNotificarEstado_ERROR', err.message); }
}

// ── Alerta identidad sospechosa → admin ─────────────────────
function _emailIdentidadSospechosa(b, rowEncontrada) {
  try {
    const subject = '&#128680;⚠️ ALERTA IDENTIDAD SOSPECHOSA — IMOLARTE — REVISAR DE INMEDIATO ⚠️&#128680;';
    const body = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
  <div style="background:#8b0000;padding:20px 24px;border-radius:8px 8px 0 0">
    <h1 style="color:#fff;font-size:20px;margin:0;letter-spacing:1px">
      &#128680; ALERTA DE SEGURIDAD — IMOLARTE
    </h1>
    <p style="color:#ffcccc;font-size:13px;margin:6px 0 0">
      Se detectó una posible inconsistencia de identidad en una transacción
    </p>
  </div>
  <div style="background:#fff8f8;padding:24px;border:2px solid #8b0000;border-top:none">
    <p style="font-size:15px;color:#333">
      ⚠️ Un cliente completó una transacción con un documento ya registrado 
      pero con un <strong>nombre y/o apellido completamente diferente</strong>.
    </p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px">
      <tr style="background:#f0e8e8">
        <th style="padding:8px;text-align:left;border:1px solid #ddd;width:40%">Campo</th>
        <th style="padding:8px;text-align:left;border:1px solid #ddd">Registrado en sistema</th>
        <th style="padding:8px;text-align:left;border:1px solid #ddd">Recibido en transacción</th>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #ddd"><strong>TipoDoc</strong></td>
        <td style="padding:8px;border:1px solid #ddd">${rowEncontrada[CLI.TIPO_DOC] || '—'}</td>
        <td style="padding:8px;border:1px solid #ddd">${b.tipoDoc || '—'}</td>
      </tr>
      <tr style="background:#fafafa">
        <td style="padding:8px;border:1px solid #ddd"><strong>NumDoc</strong></td>
        <td style="padding:8px;border:1px solid #ddd">${rowEncontrada[CLI.NUM_DOC] || '—'}</td>
        <td style="padding:8px;border:1px solid #ddd">${b.numDoc || '—'}</td>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #ddd"><strong>Nombre</strong></td>
        <td style="padding:8px;border:1px solid #ddd;color:#0a6b0a">${rowEncontrada[CLI.NOMBRE] || '—'}</td>
        <td style="padding:8px;border:1px solid #ddd;color:#cc0000"><strong>${b.nombre || '—'}</strong></td>
      </tr>
      <tr style="background:#fafafa">
        <td style="padding:8px;border:1px solid #ddd"><strong>Apellido</strong></td>
        <td style="padding:8px;border:1px solid #ddd;color:#0a6b0a">${rowEncontrada[CLI.APELLIDO] || '—'}</td>
        <td style="padding:8px;border:1px solid #ddd;color:#cc0000"><strong>${b.apellido || '—'}</strong></td>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #ddd"><strong>Teléfono</strong></td>
        <td style="padding:8px;border:1px solid #ddd">${rowEncontrada[CLI.TELEFONO] || '—'}</td>
        <td style="padding:8px;border:1px solid #ddd">${b.telefono || '—'}</td>
      </tr>
      <tr style="background:#fafafa">
        <td style="padding:8px;border:1px solid #ddd"><strong>Email</strong></td>
        <td style="padding:8px;border:1px solid #ddd">${rowEncontrada[CLI.EMAIL] || '—'}</td>
        <td style="padding:8px;border:1px solid #ddd">${b.email || '—'}</td>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #ddd"><strong>ClienteID</strong></td>
        <td style="padding:8px;border:1px solid #ddd" colspan="2">${rowEncontrada[CLI.CLIENTE_ID] || '—'}</td>
      </tr>
    </table>
    <p style="font-size:13px;color:#666;background:#fff3cd;padding:12px;border-radius:4px;border-left:4px solid #ffc107">
      ⚠️ <strong>La transacción fue procesada normalmente.</strong> Este es solo un aviso.
      Revisa el sheet Clientes y los Pedidos correspondientes para confirmar o bloquear manualmente.
    </p>
    <p style="font-size:12px;color:#aaa;margin-top:16px">
      Generado automáticamente por IMOLARTE Backend · ${new Date().toISOString()}
    </p>
  </div>
</div>`;
    GmailApp.sendEmail(CFG.EMAIL_ADMIN, subject, '', { htmlBody: body });
    _log('emailIdentidadSospechosa', b.tipoDoc, b.numDoc, b.nombre, 'ALERTA_ENVIADA');
  } catch(err) { _log('emailIdentidadSospechosa_ERROR', err.message); }
}

// ============================================================
// EMAIL WRAPPER
// ============================================================

function _emailWrapper(nombre, contenido) {
  const saludo = (nombre || '').trim() || 'estimada clienta';
  return `
<div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#1a1610">
  <div style="background:#1a1610;padding:28px 32px;border-radius:8px 8px 0 0">
    <h1 style="color:#C4A05A;font-size:22px;margin:0;letter-spacing:2px">HELENA CABALLERO</h1>
    <p style="color:#f5f0e8;font-size:13px;margin:6px 0 0">Cerámica artesanal italiana</p>
  </div>
  <div style="background:#faf8f4;padding:28px 32px;border:1px solid #e8e0d0;border-top:none">
    <p style="font-size:16px">Hola <strong>${saludo}</strong>,</p>
    ${contenido}
  </div>
  <div style="background:#1a1610;padding:12px 32px;border-radius:0 0 8px 8px;text-align:center">
    <p style="color:#888;font-size:11px;margin:0">
      © ${new Date().getFullYear()} Helena Caballero — Imolarte · Bogotá
    </p>
  </div>
</div>`;
}

// ============================================================
// SETUP
// ============================================================

function setupSheets() {
  const HEADERS = {
    [CFG.SHEETS.WISHLIST]: [
      'Campaña_ID','Timestamp','Referencia','ClienteID',
      'Nombre','Apellido','Email','Teléfono',
      'Tipo_Doc','Num_Doc',
      'Dirección_Wishlist','Barrio_Wishlist','Ciudad_Wishlist','Notas',
      'Productos_JSON','Total_COP','Estado_Wishlist','Notas_internas',
    ],
    [CFG.SHEETS.PEDIDOS_WOMPI]: [
      'Campaña_ID','Timestamp','Referencia',
      'Wompi_Transaction_ID','Estado_Pago_Wompi',
      'ClienteID','Nombre','Apellido','Email','Teléfono',
      'Tipo_Doc','Num_Doc',
      'Dirección','Barrio','Ciudad','Notas_entrega',
      'Productos_JSON','Subtotal_COP','Descuento_COP',
      'Total_COP','Pct_Pagado','Forma_pago','Saldo_Pendiente_COP',
      'Estado_Pedido','Fecha_despacho','Notas_internas','SIIGO_Factura_ID',
    ],
    [CFG.SHEETS.GIFT_CARDS]: [
      'Campaña_ID','Timestamp','Referencia','Código_Gift','Saldo_Gift_COP','Válido_Hasta',
      'ClienteID_Emisor',
      'Emisor_Nombre','Emisor_Apellido','Emisor_Email','Emisor_Tel',
      'Emisor_Tipo_Doc','Emisor_Num_Doc',
      'Emisor_Dirección','Emisor_Barrio','Emisor_Ciudad',
      'Dest_Nombre','Dest_Apellido','Dest_Email','Dest_Tel','Dest_Mensaje',
      'Estado_Pago','Estado_Gift',
      'Wompi_Transaction_ID','Fecha_Pago','Fecha_Activación',
      'Canjeado_En','Notas_Internas',
    ],
    [CFG.SHEETS.CLIENTES]: [
      'TipoDoc','NumDoc','Nombre','Apellido','Email','Teléfono',
      'Cumple_Día','Cumple_Mes',
      'Dirección','Barrio','Ciudad',
      'Primera_interacción','Última_interacción','Num_interacciones',
      'Total_histórico_COP','Historial_cambios','Productos_comprados','ClienteID',
    ],
    [CFG.SHEETS.CAMPANIAS]: [
      'Campaña_ID','Marca_ID','Nombre','Descripción',
      'Código_Descuento','Descuento_Pct',
      'Vigencia_Inicio','Vigencia_Fin',
      'Estado','Segmento','Canal_Difusión','Enviados',
      'Fecha_creación','Notas_internas',
    ],
    [CFG.SHEETS.LOG]: [
      'Timestamp','Función','Arg1','Arg2','Arg3','Arg4',
    ],
  };

  const ss = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
  Object.entries(HEADERS).forEach(([nombre, headers]) => {
    let sheet = ss.getSheetByName(nombre);
    if (!sheet) {
      sheet = ss.insertSheet(nombre);
      Logger.log('Hoja creada: ' + nombre);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length)
        .setBackground('#1a1610').setFontColor('#C4A05A').setFontWeight('bold');
      sheet.setFrozenRows(1);
      sheet.autoResizeColumns(1, headers.length);
      Logger.log('Headers escritos: ' + nombre);
    }
  });

  Logger.log('✅ setupSheets completado — ejecutar setupDropdowns() y setupProtections() por separado');
}

// ============================================================
// DROPDOWNS
// ============================================================

function setupDropdowns() {
  const ss = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);

  // Limpiar TODAS las validaciones existentes antes de reaplicar
  // Evita acumulación de reglas en columnas incorrectas por ejecuciones previas
  [CFG.SHEETS.PEDIDOS_WOMPI, CFG.SHEETS.WISHLIST, CFG.SHEETS.CAMPANIAS].forEach(nombre => {
    const sheet = ss.getSheetByName(nombre);
    if (!sheet) return;
    const lastCol = sheet.getLastColumn() || 30;
    sheet.getRange(2, 1, 50, lastCol).clearDataValidations();
  });

  _applyDropdown(ss, CFG.SHEETS.PEDIDOS_WOMPI, 'Estado_Pedido',   ESTADOS_PEDIDO);
  _applyDropdown(ss, CFG.SHEETS.PEDIDOS_WOMPI, 'Pct_Pagado',      ['60', '100']);
  _applyDropdown(ss, CFG.SHEETS.WISHLIST,       'Estado_Wishlist', ESTADOS_WISHLIST);
  _applyDropdown(ss, CFG.SHEETS.CAMPANIAS,      'Estado',         ['ACTIVA','CERRADA','PAUSADA']);

  // Forma_pago — texto libre, añadir solo nota en header
  const sheetWP = ss.getSheetByName(CFG.SHEETS.PEDIDOS_WOMPI);
  if (sheetWP) {
    const header = sheetWP.getRange(1, 1, 1, sheetWP.getLastColumn()).getValues()[0];
    const colFP  = header.indexOf('Forma_pago');
    if (colFP >= 0) {
      sheetWP.getRange(1, colFP + 1).setNote(
        'Valores: WOMPI_60 | WOMPI_100 | GIFT_CARD\n' +
        'Con saldo gift: WOMPI_60+GIFT:HC-XXXXX\n' +
        '               WOMPI_100+GIFT:HC-XXXXX'
      );
    }
  }
  Logger.log('✅ setupDropdowns completado');
}

function _applyDropdown(ss, sheetName, colName, valores) {
  const sheet  = ss.getSheetByName(sheetName);
  if (!sheet) { Logger.log('Sheet no encontrada: ' + sheetName); return; }
  const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const col    = header.indexOf(colName);
  if (col < 0) { Logger.log('Columna no encontrada: ' + colName); return; }
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(valores, true).setAllowInvalid(false).build();
  sheet.getRange(2, col + 1, 50, 1).setDataValidation(rule);
  Logger.log('✅ Dropdown: ' + sheetName + ' → ' + colName);
}

// ============================================================
// PROTECCIONES — ejecutar UNA VEZ después de setupSheets
// Protege columnas calculadas por el sistema.
// Tú como editor puedes sobrescribir con advertencia.
// ============================================================

function setupProtections() {
  const ss    = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
  const email = CFG.EMAIL_ADMIN;

  function _protectCols(sheetName, colNames, desc) {
    const sheet  = ss.getSheetByName(sheetName);
    if (!sheet) return;
    const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    colNames.forEach(colName => {
      const col = header.indexOf(colName);
      if (col < 0) return;
      // Rango: fila 2 hasta 1000
      const range = sheet.getRange(2, col + 1, 999, 1);
      const prot  = range.protect();
      prot.setDescription(desc + ' — ' + colName);
      // Solo el admin puede editar sin advertencia
      prot.addEditor(email);
      prot.setWarningOnly(true); // advertencia pero no bloqueo total
      Logger.log('[LOCK] Protección: ' + sheetName + ' → ' + colName);
    });
  }

  // Clientes — cols calculadas por el sistema
  _protectCols(CFG.SHEETS.CLIENTES,
    ['TipoDoc','NumDoc','ClienteID','Primera_interacción','Última_interacción',
     'Num_interacciones','Total_histórico_COP','Historial_cambios'],
    'Sistema IMOLARTE — no editar manualmente'
  );

  // Pedidos_Wompi — cols calculadas
  _protectCols(CFG.SHEETS.PEDIDOS_WOMPI,
    ['Campaña_ID','Timestamp','Referencia','Wompi_Transaction_ID',
     'Estado_Pago_Wompi','ClienteID','Subtotal_COP','Descuento_COP','Total_COP'],
    'Sistema IMOLARTE — no editar manualmente'
  );

  // GiftCards — cols calculadas
  _protectCols(CFG.SHEETS.GIFT_CARDS,
    ['Campaña_ID','Timestamp','Referencia','Código_Gift','Saldo_Gift_COP',
     'ClienteID_Emisor','Estado_Pago','Wompi_Transaction_ID',
     'Fecha_Pago','Fecha_Activación','Canjeado_En'],
    'Sistema IMOLARTE — no editar manualmente'
  );

  Logger.log('✅ setupProtections completado');
}

// ============================================================
// HELPERS
// ============================================================

function _getSheet(nombre) {
  const ss    = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(nombre);
  if (!sheet) throw new Error('Sheet no encontrada: ' + nombre);
  return sheet;
}

function _jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function _fmtTel(codigoPais, telefono) {
  const cp  = (String(codigoPais  || '+57')).replace(/\s/g, '');
  const tel = (String(telefono    || '')).replace(/\D/g, '');
  return tel ? cp + tel : '';
}

function _fmtCOP(valor) {
  if (!valor && valor !== 0) return '$0';
  const n = _roundCOP(Number(valor) || 0);
  return '$' + n.toLocaleString('es-CO');
}

function _parseJSON(str) {
  try { return JSON.parse(str || '[]'); } catch { return []; }
}

function _productosHTML(productos) {
  if (!productos || !productos.length) return '';
  const rows = productos.map(p => `
    <tr>
      <td style="padding:6px 8px;border-bottom:1px solid #e8e0d0;font-size:13px">
        ${p.productName || p.name || ''}${p.collection ? ' — ' + p.collection : ''}
      </td>
      <td style="padding:6px 8px;border-bottom:1px solid #e8e0d0;font-size:13px;text-align:center">
        ×${p.quantity || 1}
      </td>
      <td style="padding:6px 8px;border-bottom:1px solid #e8e0d0;font-size:13px;text-align:right;color:#C4A05A">
        ${_fmtCOP((p.price || 0) * (p.quantity || 1))}
      </td>
    </tr>`).join('');
  return `
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <thead>
        <tr style="background:#f0ece4">
          <th style="padding:6px 8px;font-size:12px;text-align:left;color:#888">Producto</th>
          <th style="padding:6px 8px;font-size:12px;text-align:center;color:#888">Cant.</th>
          <th style="padding:6px 8px;font-size:12px;text-align:right;color:#888">Valor</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function _log(fn, a1='', a2='', a3='', a4='') {
  try {
    const sheet = _getSheet(CFG.SHEETS.LOG);
    sheet.appendRow([new Date(), fn,
      String(a1).slice(0,200), String(a2).slice(0,200),
      String(a3).slice(0,200), String(a4).slice(0,200)]);
  } catch(e) { Logger.log('LOG_ERROR: ' + e.message); }
}
