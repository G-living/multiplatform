// ============================================================
// IMOLARTE — Google Apps Script Backend v2.0
// ============================================================
// Spreadsheet ID : 1lgW9-nhgM6UVL4NvYet4EIjX6fuSJV4ZHtP4lffZ5tg
// Web App URL    : publicar como nueva versión tras pegar este código
// Ejecutar UNA VEZ: setupSheets() para crear hojas y headers
//                   setupDropdowns() para aplicar dropdowns col Estado_Pedido
// Trigger manual : onSheetChange → instalar en Triggers → On edit
// ============================================================

'use strict';

const CFG = {
  SPREADSHEET_ID  : '1lgW9-nhgM6UVL4NvYet4EIjX6fuSJV4ZHtP4lffZ5tg',
  NOMBRE_TIENDA   : 'IMOLARTE by Helena Caballero',
  EMAIL_REMITENTE : 'filippo.massara2016@gmail.com',
  WHATSAPP        : '+573004257367',
  WEBSITE         : 'https://www.helenacaballero.com',
  CATALOGO        : 'https://g-living.github.io/claudecatalogue/',
  WISHLIST_ABANDON_MIN: 30,   // minutos antes de email carrito abandonado
  SHEETS: {
    WISHLIST      : 'Wishlist',        // ex Pedidos_WA
    PEDIDOS_WOMPI : 'Pedidos_Wompi',
    GIFT_CARDS    : 'GiftCards',
    CLIENTES      : 'Clientes',
    CAMPANIAS     : 'Campañas',
    LOG           : 'Log',
  },
};

// Estados válidos
const ESTADOS_WISHLIST = ['PENDIENTE', 'ENVIADO_WA'];
const ESTADOS_PEDIDO   = [
  'PENDIENTE', 'CONFIRMADO', 'CANCELADO',
  'EN_PRODUCCION', 'EN_TRANSITO', 'EN_NACIONALIZACION',
  'LISTO_DESPACHO', 'DISPONIBLE_TIENDA', 'DESPACHADO',
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

    const action = body.action || '';
    _log('doPost', action, JSON.stringify(body).slice(0, 200));

    let result;
    switch (action) {
      case 'createWishlist'        : result = _createWishlist(body);          break;
      case 'createPedidoWompi'     : result = _createPedidoWompi(body);       break;
      case 'createGiftCard'        : result = _createGiftCard(body);          break;
      case 'updateEstadoWishlist'  : result = _updateEstadoWishlist(body);    break;
      case 'confirmarPagoWompi'    : result = _confirmarPagoWompi(body);      break;
      case 'confirmarPagoGiftCard' : result = _confirmarPagoGiftCard(body);   break;
      case 'upsertCliente'         : result = _upsertCliente(body);           break;
      case 'redeemDono'            : result = _redeemDono(body);              break;
      case 'ping'                  : result = { ok: true, ts: new Date().toISOString() }; break;
      // aliases legacy — mantener para compatibilidad
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
// WISHLIST (ex Pedidos_WA)
// Columnas: Campaña_ID | Timestamp | Referencia | ClienteID |
//           Nombre | Apellido | Email | Teléfono |
//           Tipo_Doc | Num_Doc | Tipo_Persona |
//           Dirección_Wishlist | Barrio_Wishlist | Ciudad_Wishlist | Notas |
//           Productos_JSON | Total_COP |
//           Estado_Wishlist | Notas_internas
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
    telefono    : tel,
    codigoPais  : cli.codigoPais   || '+57',
    nombre      : cli.nombre       || '',
    apellido    : cli.apellido     || '',
    email       : cli.email        || '',
    tipoDoc     : cli.tipoDoc      || '',
    numDoc      : cli.numDoc       || '',
    tipoPersona : cli.tipoPersona  || '',
    cumpleDia   : cli.cumpleDia    || '',
    cumpleMes   : cli.cumpleMes    || '',
    direccion   : ent.direccion    || '',
    barrio      : ent.barrio       || '',
    ciudad      : ent.ciudad       || '',
  }).clienteId;

  sheet.appendRow([
    campania,                             // A  Campaña_ID
    ts,                                   // B  Timestamp
    ref,                                  // C  Referencia
    cliId,                                // D  ClienteID
    cli.nombre      || '',                // E  Nombre
    cli.apellido    || '',                // F  Apellido
    cli.email       || '',                // G  Email
    tel,                                  // H  Teléfono
    cli.tipoDoc     || '',                // I  Tipo_Doc
    cli.numDoc      || '',                // J  Num_Doc
    cli.tipoPersona || '',                // K  Tipo_Persona
    ent.direccion   || '',                // L  Dirección_Wishlist
    ent.barrio      || '',                // M  Barrio_Wishlist
    ent.ciudad      || '',                // N  Ciudad_Wishlist
    ent.notas       || '',                // O  Notas
    JSON.stringify(b.productos || []),    // P  Productos_JSON
    b.total         || 0,                 // Q  Total_COP
    'PENDIENTE',                          // R  Estado_Wishlist
    '',                                   // S  Notas_internas
  ]);

  _log('createWishlist', ref, cliId, 'OK');
  return { ok: true, referencia: ref, clienteId: cliId };
}

function _updateEstadoWishlist(b) {
  const sheet  = _getSheet(CFG.SHEETS.WISHLIST);
  const ref    = b.referencia || '';
  const estado = b.estadoWA || b.estado || 'ENVIADO_WA';
  if (!ref) return { ok: false, error: 'Referencia requerida' };
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

      // Email al cliente cuando confirma envío por WA
      if (estado === 'ENVIADO_WA') {
        const colEmail  = header.indexOf('Email');
        const colNombre = header.indexOf('Nombre');
        const colProds  = header.indexOf('Productos_JSON');
        const colTotal  = header.indexOf('Total_COP');
        const email  = data[i][colEmail]  || '';
        const nombre = data[i][colNombre] || '';
        const prods  = _parseJSON(data[i][colProds]);
        const total  = data[i][colTotal]  || 0;
        if (email) _emailEnviadoWA(email, nombre, ref, prods, total);
      }

      return { ok: true, referencia: ref, estado };
    }
  }
  _log('updateEstadoWishlist', ref, 'NOT_FOUND');
  return { ok: false, error: 'Referencia no encontrada: ' + ref };
}

// ============================================================
// PEDIDOS WOMPI
// Columnas: Campaña_ID | Timestamp | Referencia |
//           Wompi_Transaction_ID | Estado_Pago_Wompi |
//           ClienteID | Nombre | Apellido | Email | Teléfono |
//           Tipo_Doc | Num_Doc | Tipo_Persona |
//           Dirección | Barrio | Ciudad | Notas_entrega |
//           Productos_JSON | Subtotal_COP | Descuento_COP |
//           Total_COP | Pct_Pagado | Forma_pago |
//           Estado_Pedido | Fecha_despacho | Notas_internas | SIIGO_Factura_ID
// ============================================================

function _createPedidoWompi(b) {
  const sheet    = _getSheet(CFG.SHEETS.PEDIDOS_WOMPI);
  const ref      = b.referencia || 'WP-' + Date.now();
  const ts       = new Date();
  const cli      = b.cliente || {};
  const ent      = b.entrega || {};
  const tel      = _fmtTel(cli.codigoPais, cli.telefono);
  const campania = b.campaniaId || '';

  const cliId = _upsertCliente({
    telefono    : tel,
    codigoPais  : cli.codigoPais   || '+57',
    nombre      : cli.nombre       || '',
    apellido    : cli.apellido     || '',
    email       : cli.email        || '',
    tipoDoc     : cli.tipoDoc      || '',
    numDoc      : cli.numDoc       || '',
    tipoPersona : cli.tipoPersona  || '',
    cumpleDia   : cli.cumpleDia    || '',
    cumpleMes   : cli.cumpleMes    || '',
    direccion   : ent.direccion    || '',
    barrio      : ent.barrio       || '',
    ciudad      : ent.ciudad       || '',
  }).clienteId;

  sheet.appendRow([
    campania,                             // A  Campaña_ID
    ts,                                   // B  Timestamp
    ref,                                  // C  Referencia
    b.wompiTransactionId || '',           // D  Wompi_Transaction_ID
    'PENDING',                            // E  Estado_Pago_Wompi
    cliId,                                // F  ClienteID
    cli.nombre      || '',                // G  Nombre
    cli.apellido    || '',                // H  Apellido
    cli.email       || '',                // I  Email
    tel,                                  // J  Teléfono
    cli.tipoDoc     || '',                // K  Tipo_Doc
    cli.numDoc      || '',                // L  Num_Doc
    cli.tipoPersona || '',                // M  Tipo_Persona
    ent.direccion   || '',                // N  Dirección
    ent.barrio      || '',                // O  Barrio
    ent.ciudad      || '',                // P  Ciudad
    ent.notas       || '',                // Q  Notas_entrega
    JSON.stringify(b.productos || []),    // R  Productos_JSON
    b.subtotal      || 0,                 // S  Subtotal_COP
    b.descuento     || 0,                 // T  Descuento_COP
    b.total         || 0,                 // U  Total_COP
    b.porcentajePagado || 100,            // V  Pct_Pagado
    b.formaPago     || 'WOMPI_100',       // W  Forma_pago
    'PENDIENTE',                          // X  Estado_Pedido
    '',                                   // Y  Fecha_despacho
    '',                                   // Z  Notas_internas
    '',                                   // AA SIIGO_Factura_ID
  ]);

  _log('createPedidoWompi', ref, cliId, 'OK');

  // Email confirmación de pedido recibido (antes del pago)
  if (cli.email) {
    _emailPedidoRecibido(cli.email, cli.nombre, ref, b.productos, b.total);
  }

  return { ok: true, referencia: ref, clienteId: cliId };
}

function _confirmarPagoWompi(b) {
  const sheet  = _getSheet(CFG.SHEETS.PEDIDOS_WOMPI);
  const data   = sheet.getDataRange().getValues();
  const header = data[0];

  const colRef      = header.indexOf('Referencia');
  const colPagoWP   = header.indexOf('Estado_Pago_Wompi');
  const colPedido   = header.indexOf('Estado_Pedido');
  const colTxId     = header.indexOf('Wompi_Transaction_ID');

  // Acepta llamadas desde checkout.js y desde webhook Cloudflare
  const d      = b.data || {};
  const ref    = b.referencia    || d.pedidoId      || '';
  const status = b.status        || d.paymentStatus  || 'APPROVED';
  const txId   = b.transactionId || d.transactionId  || '';

  if (!ref) return { ok: false, error: 'Referencia requerida' };
  if (colRef < 0 || colPagoWP < 0 || colPedido < 0)
    return { ok: false, error: 'Columnas no encontradas en Pedidos_Wompi' };

  for (let i = 1; i < data.length; i++) {
    if (data[i][colRef] === ref) {
      // Estado_Pago_Wompi — espejo directo Wompi
      sheet.getRange(i + 1, colPagoWP + 1).setValue(status);

      // Estado_Pedido — lógica operativa
      const estadoPedido = status === 'APPROVED'
        ? 'CONFIRMADO'
        : (status === 'PENDING' ? 'PENDIENTE' : 'CANCELADO');
      sheet.getRange(i + 1, colPedido + 1).setValue(estadoPedido);

      // Transaction ID si viene
      if (txId && colTxId >= 0) sheet.getRange(i + 1, colTxId + 1).setValue(txId);

      _log('confirmarPagoWompi', ref, status, estadoPedido);

      // Emails según resultado
      const colEmail  = header.indexOf('Email');
      const colNombre = header.indexOf('Nombre');
      const colProds  = header.indexOf('Productos_JSON');
      const colTotal  = header.indexOf('Total_COP');
      const email  = data[i][colEmail]  || '';
      const nombre = data[i][colNombre] || '';
      const prods  = _parseJSON(data[i][colProds]);
      const total  = data[i][colTotal]  || 0;

      if (email) {
        if (status === 'APPROVED') {
          _emailPagoConfirmado(email, nombre, ref, prods, total);
        } else if (['DECLINED', 'ERROR', 'VOIDED'].includes(status)) {
          _emailPagoCancelado(email, nombre, ref, status);
        }
      }

      return { ok: true, referencia: ref, status, estadoPedido };
    }
  }
  _log('confirmarPagoWompi', ref, 'NOT_FOUND');
  return { ok: false, error: 'Referencia no encontrada: ' + ref };
}

// ============================================================
// GIFT CARDS
// ============================================================

function _createGiftCard(b) {
  const sheet = _getSheet(CFG.SHEETS.GIFT_CARDS);
  const ref   = b.referencia || 'GC-' + Date.now();
  const ts    = new Date();
  const em    = b.emisor       || {};
  const dest  = b.destinatario || {};
  const tel   = em.telefono || '';

  const cliId = _upsertCliente({
    telefono   : tel,
    nombre     : em.nombre    || '',
    apellido   : em.apellido  || '',
    email      : em.email     || '',
    tipoDoc    : em.tipoDoc   || '',
    numDoc     : em.numDoc    || '',
    direccion  : em.direccion || '',
    barrio     : em.barrio    || '',
    ciudad     : em.ciudad    || '',
  }).clienteId;

  sheet.appendRow([
    ts,                        // A  Timestamp
    ref,                       // B  Referencia
    b.codigo       || '',      // C  Código (HC-XXXXXXXX)
    b.valor        || 0,       // D  Valor COP
    b.vigencia     || '',      // E  Válido hasta
    cliId,                     // F  ClienteID_Emisor
    em.nombre      || '',      // G  Emisor_Nombre
    em.apellido    || '',      // H  Emisor_Apellido
    em.email       || '',      // I  Emisor_Email
    tel,                       // J  Emisor_Tel
    em.tipoDoc     || '',      // K  Tipo_Documento
    em.numDoc      || '',      // L  Número_Documento
    em.direccion   || '',      // M  Emisor_Dirección
    em.barrio      || '',      // N  Emisor_Barrio
    em.ciudad      || '',      // O  Emisor_Ciudad
    dest.nombre    || '',      // P  Destinatario_Nombre
    dest.telefono  || '',      // Q  Destinatario_WhatsApp
    b.mensaje      || '',      // R  Mensaje
    'PENDIENTE_PAGO',          // S  Estado
    '',                        // T  Fecha activación
    '',                        // U  Canjeado_En
    '',                        // V  Wompi_Transaction_ID
    '',                        // W  Notas internas
    b.campaniaId   || '',      // X  Campaña_ID
  ]);

  _log('createGiftCard', ref, b.codigo, cliId, 'OK');
  return { ok: true, referencia: ref, codigo: b.codigo, clienteId: cliId };
}

function _confirmarPagoGiftCard(b) {
  const sheet  = _getSheet(CFG.SHEETS.GIFT_CARDS);
  const data   = sheet.getDataRange().getValues();
  const header = data[0];

  const colRef   = header.indexOf('Referencia');
  const colEst   = header.indexOf('Estado');
  const colTxId  = header.indexOf('Wompi_Transaction_ID');
  const colFecha = header.indexOf('Fecha activación');

  const ref    = b.referencia    || '';
  const status = b.status        || 'APPROVED';
  const txId   = b.transactionId || '';

  if (!ref) return { ok: false, error: 'Referencia requerida' };
  if (colRef < 0) return { ok: false, error: 'Columna Referencia no encontrada en GiftCards' };

  for (let i = 1; i < data.length; i++) {
    if (data[i][colRef] === ref) {
      const estadoGC = status === 'APPROVED'
        ? 'ACTIVA'
        : (status === 'PENDING' ? 'PENDIENTE_PAGO' : 'CANCELADA');

      sheet.getRange(i + 1, colEst + 1).setValue(estadoGC);
      if (status === 'APPROVED' && colFecha >= 0) {
        sheet.getRange(i + 1, colFecha + 1).setValue(new Date());
      }
      if (txId && colTxId >= 0) {
        sheet.getRange(i + 1, colTxId + 1).setValue(txId);
      }

      _log('confirmarPagoGiftCard', ref, status, estadoGC);

      // Email al emisor si APPROVED
      if (status === 'APPROVED') {
        const colEmail  = header.indexOf('Emisor_Email');
        const colNombre = header.indexOf('Emisor_Nombre');
        const colCodigo = header.indexOf('Código');
        const colValor  = header.indexOf('Valor COP');
        const colVig    = header.indexOf('Válido hasta');
        const email  = data[i][colEmail]  || '';
        const nombre = data[i][colNombre] || '';
        const codigo = data[i][colCodigo] || '';
        const valor  = data[i][colValor]  || 0;
        const vig    = data[i][colVig]    || '';
        if (email) _emailGiftCardActivada(email, nombre, ref, codigo, valor, vig);
      }

      return { ok: true, referencia: ref, status, estado: estadoGC };
    }
  }
  _log('confirmarPagoGiftCard', ref, 'NOT_FOUND');
  return { ok: false, error: 'Referencia no encontrada: ' + ref };
}

function _getGiftCard(codigo) {
  if (!codigo) return { ok: false, error: 'Código requerido' };
  const sheet = _getSheet(CFG.SHEETS.GIFT_CARDS);
  const data  = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === codigo) {
      return {
        ok         : true,
        codigo     : data[i][2],
        valor      : data[i][3],
        vigencia   : data[i][4],
        estado     : data[i][15],
        canjeadoEn : data[i][17],
        available  : data[i][15] === 'ACTIVA' ? data[i][3] : 0,
      };
    }
  }
  return { ok: false, error: 'Código no encontrado' };
}

function _redeemDono(b) {
  const sheet = _getSheet(CFG.SHEETS.GIFT_CARDS);
  const data  = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === b.code) {
      sheet.getRange(i + 1, 16).setValue('CANJEADA');
      sheet.getRange(i + 1, 18).setValue(b.referencia || '');
      _log('redeemDono', b.code, 'CANJEADA');
      return { ok: true };
    }
  }
  return { ok: false, error: 'Código no encontrado' };
}

// ============================================================
// CLIENTES — upsert por teléfono (PK)
// Columnas: Teléfono | Nombre | Apellido | Email |
//           Tipo_Doc | Num_Doc | Tipo_Persona |
//           Cumple_Día | Cumple_Mes |
//           Dirección_1 | Barrio_1 | Ciudad_1 |
//           Dirección_2 | Barrio_2 | Ciudad_2 |
//           Primera_interacción | Última_interacción | Num_interacciones |
//           Total_histórico_COP | Notas | ClienteID
// ============================================================

function _upsertCliente(b) {
  const sheet = _getSheet(CFG.SHEETS.CLIENTES);
  const data  = sheet.getDataRange().getValues();
  const tel   = (b.telefono || '').replace(/\s/g, '');
  const ts    = new Date();

  if (!tel) return { ok: true, clienteId: 'SIN-TEL' };

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).replace(/\s/g, '') === tel) {
      const row = sheet.getRange(i + 1, 1, 1, 21).getValues()[0];

      // Completar campos personales vacíos sin sobrescribir
      if (!row[1]  && b.nombre)       sheet.getRange(i+1,  2).setValue(b.nombre);
      if (!row[2]  && b.apellido)     sheet.getRange(i+1,  3).setValue(b.apellido);
      if (!row[3]  && b.email)        sheet.getRange(i+1,  4).setValue(b.email);
      if (!row[4]  && b.tipoDoc)      sheet.getRange(i+1,  5).setValue(b.tipoDoc);
      if (!row[5]  && b.numDoc)       sheet.getRange(i+1,  6).setValue(b.numDoc);
      if (!row[6]  && b.tipoPersona)  sheet.getRange(i+1,  7).setValue(b.tipoPersona);
      if (!row[7]  && b.cumpleDia)    sheet.getRange(i+1,  8).setValue(b.cumpleDia);
      if (!row[8]  && b.cumpleMes)    sheet.getRange(i+1,  9).setValue(b.cumpleMes);

      // Direcciones: llenar Dir_1 primero, luego Dir_2 si es diferente
      if (b.direccion) {
        const dir1 = String(row[9]  || '').trim();
        const dir2 = String(row[12] || '').trim();
        const nueva = b.direccion.trim();
        if (!dir1) {
          // Dir_1 vacía → llenar Dir_1
          sheet.getRange(i+1, 10).setValue(b.direccion);
          if (b.barrio) sheet.getRange(i+1, 11).setValue(b.barrio);
          if (b.ciudad) sheet.getRange(i+1, 12).setValue(b.ciudad);
        } else if (dir1 !== nueva && !dir2) {
          // Dir_1 tiene otro valor y Dir_2 vacía → llenar Dir_2
          sheet.getRange(i+1, 13).setValue(b.direccion);
          if (b.barrio) sheet.getRange(i+1, 14).setValue(b.barrio);
          if (b.ciudad) sheet.getRange(i+1, 15).setValue(b.ciudad);
        }
        // Si ambas tienen valor y son distintas → no sobrescribir
      }

      // Última interacción + contador
      sheet.getRange(i+1, 17).setValue(ts);
      sheet.getRange(i+1, 18).setValue((row[17] || 0) + 1);

      const clienteId = row[20];
      _log('upsertCliente', 'UPDATE', tel, clienteId);
      return { ok: true, clienteId, nuevo: false };
    }
  }

  // Nuevo cliente
  const clienteId = 'IMO-' + Date.now();
  sheet.appendRow([
    tel,                    // A  Teléfono (PK)
    b.nombre      || '',    // B  Nombre
    b.apellido    || '',    // C  Apellido
    b.email       || '',    // D  Email
    b.tipoDoc     || '',    // E  Tipo_Doc
    b.numDoc      || '',    // F  Num_Doc
    b.tipoPersona || '',    // G  Tipo_Persona
    b.cumpleDia   || '',    // H  Cumple_Día
    b.cumpleMes   || '',    // I  Cumple_Mes
    b.direccion   || '',    // J  Dirección_1
    b.barrio      || '',    // K  Barrio_1
    b.ciudad      || '',    // L  Ciudad_1
    '',                     // M  Dirección_2
    '',                     // N  Barrio_2
    '',                     // O  Ciudad_2
    ts,                     // P  Primera_interacción
    ts,                     // Q  Última_interacción
    1,                      // R  Num_interacciones
    0,                      // S  Total_histórico_COP
    '',                     // T  Notas
    clienteId,              // U  ClienteID
  ]);

  _log('upsertCliente', 'INSERT', tel, clienteId);
  return { ok: true, clienteId, nuevo: true };
}

function _getCliente(telefono) {
  if (!telefono) return { ok: false, error: 'Teléfono requerido' };
  const sheet = _getSheet(CFG.SHEETS.CLIENTES);
  const data  = sheet.getDataRange().getValues();
  const tel   = telefono.replace(/\s/g, '');
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).replace(/\s/g, '') === tel) {
      return {
        ok           : true,
        clienteId    : data[i][20],
        telefono     : data[i][0],
        nombre       : data[i][1],
        apellido     : data[i][2],
        email        : data[i][3],
        tipoDoc      : data[i][4],
        numDoc       : data[i][5],
        tipoPersona  : data[i][6],
        cumpleDia    : data[i][7],
        cumpleMes    : data[i][8],
        direccion1   : data[i][9],
        barrio1      : data[i][10],
        ciudad1      : data[i][11],
        direccion2   : data[i][12],
        barrio2      : data[i][13],
        ciudad2      : data[i][14],
      };
    }
  }
  return { ok: false, error: 'Cliente no encontrado' };
}

// ============================================================
// RECUPERAR PEDIDO (para enlace carrito abandonado)
// ============================================================

function _getPedido(referencia) {
  if (!referencia) return { ok: false, error: 'Referencia requerida' };

  // Buscar en Wishlist
  if (referencia.startsWith('WA-')) {
    const sheet  = _getSheet(CFG.SHEETS.WISHLIST);
    const data   = sheet.getDataRange().getValues();
    const header = data[0];
    const colRef = header.indexOf('Referencia');
    for (let i = 1; i < data.length; i++) {
      if (data[i][colRef] === referencia) {
        const row = {};
        header.forEach((h, j) => row[h] = data[i][j]);
        return {
          ok          : true,
          referencia,
          hoja        : 'Wishlist',
          cliente     : {
            nombre      : row['Nombre'],
            apellido    : row['Apellido'],
            email       : row['Email'],
            telefono    : row['Teléfono'],
            tipoDoc     : row['Tipo_Doc'],
            numDoc      : row['Num_Doc'],
            tipoPersona : row['Tipo_Persona'],
          },
          entrega     : {
            direccion : row['Dirección_Wishlist'],
            barrio    : row['Barrio_Wishlist'],
            ciudad    : row['Ciudad_Wishlist'],
            notas     : row['Notas'],
          },
          productos   : _parseJSON(row['Productos_JSON']),
          total       : row['Total_COP'],
          estado      : row['Estado_Wishlist'],
        };
      }
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

    // Auto-cerrar si Vigencia_Fin pasó y sigue ACTIVA
    const vigFin = row['Vigencia_Fin'] ? new Date(row['Vigencia_Fin']) : null;
    if (vigFin && hoy > vigFin && row['Estado'] === 'ACTIVA') {
      const colEstado = header.indexOf('Estado');
      sheet.getRange(i + 1, colEstado + 1).setValue('CERRADA');
      _log('campania_autocerrada', row['Campaña_ID']);
      continue;
    }

    if (row['Estado'] === 'ACTIVA') activas.push(row);
  }
  return { ok: true, campanias: activas };
}

function _getClientesSegmento(segmento) {
  const sheet  = _getSheet(CFG.SHEETS.CLIENTES);
  const data   = sheet.getDataRange().getValues();
  const header = data[0];
  const todos  = [];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    header.forEach((h, j) => row[h] = data[i][j]);
    todos.push({
      clienteId : row['ClienteID'],
      nombre    : row['Nombre'],
      apellido  : row['Apellido'],
      email     : row['Email'],
      telefono  : row['Teléfono'],
    });
  }
  return todos; // segmentación avanzada — sprint futuro
}

// ============================================================
// TRIGGER onSheetChange — notificar cambio manual de Estado_Pedido
// Instalar: Triggers → onSheetChange → On edit
// ============================================================

function onSheetChange(e) {
  try {
    if (!e || e.changeType !== 'EDIT') return;
    const sheet = e.source.getActiveSheet();
    const hoja  = sheet.getName();

    // Solo monitorear Pedidos_Wompi para cambios manuales de Estado_Pedido
    if (hoja !== CFG.SHEETS.PEDIDOS_WOMPI) return;

    const header    = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const colEstado = header.indexOf('Estado_Pedido');
    if (colEstado < 0 || e.range.getColumn() !== colEstado + 1) return;

    const nuevoEstado = e.range.getValue();
    // Solo estados manuales — CONFIRMADO y CANCELADO los maneja el sistema
    const ESTADOS_MANUALES = [
      'EN_PRODUCCION', 'EN_TRANSITO', 'EN_NACIONALIZACION',
      'LISTO_DESPACHO', 'DISPONIBLE_TIENDA', 'DESPACHADO',
    ];
    if (!ESTADOS_MANUALES.includes(nuevoEstado)) return;

    const rowData = sheet.getRange(e.range.getRow(), 1, 1, header.length).getValues()[0];
    _emailNotificarEstadoPedido(rowData, header, nuevoEstado);
  } catch(err) {
    _log('onSheetChange_ERROR', err.message);
  }
}

// ============================================================
// TRIGGER time-based — carrito abandonado (cada hora)
// Instalar: Triggers → checkWishlistAbandonadas → Time-driven → Hour timer → Every hour
// ============================================================

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
  const limiteMins = CFG.WISHLIST_ABANDON_MIN;

  for (let i = 1; i < data.length; i++) {
    const estado = data[i][colEstado];
    if (estado !== 'PENDIENTE') continue;

    const ts = new Date(data[i][colTs]);
    const minutos = (ahora - ts) / 60000;

    // Solo enviar si han pasado entre limiteMins y limiteMins+60 (evitar re-envíos)
    if (minutos < limiteMins || minutos > limiteMins + 60) continue;

    const email  = data[i][colEmail]  || '';
    const nombre = data[i][colNombre] || '';
    const ref    = data[i][colRef]    || '';
    const prods  = _parseJSON(data[i][colProds]);
    const total  = data[i][colTotal]  || 0;

    if (!email) continue;

    // Marcar en Notas_internas para no re-enviar
    const notas = String(data[i][colNotas] || '');
    if (notas.includes('ABANDON_EMAIL_SENT')) continue;

    _emailCarritoAbandonado(email, nombre, ref, prods, total);
    sheet.getRange(i + 1, colNotas + 1).setValue(
      (notas ? notas + ' | ' : '') + 'ABANDON_EMAIL_SENT:' + ahora.toISOString()
    );
    _log('carritoAbandonado', ref, email, 'OK');
  }
}

// ============================================================
// EMAILS
// ============================================================

// Email cuando se crea pedido Wompi (antes del pago)
function _emailPedidoRecibido(email, nombre, ref, productos, total) {
  try {
    const subject = `✅ ${CFG.NOMBRE_TIENDA} — Pedido ${ref} recibido`;
    const body = _emailWrapper(nombre, `
      <p>Hemos recibido tu pedido. Aquí está el resumen:</p>
      <p style="font-size:13px;color:#888">Referencia: <strong>${ref}</strong></p>
      ${_productosHTML(productos)}
      <p style="font-size:18px;font-weight:bold;color:#C4A05A;margin-top:16px">
        Total: ${_fmtCOP(total)}
      </p>
      <p style="font-size:13px;color:#666;margin-top:16px">
        Tu pago está siendo procesado. Te confirmaremos en breve.
      </p>
    `);
    GmailApp.sendEmail(email, subject, '', { htmlBody: body });
    _log('emailPedidoRecibido', ref, email, 'OK');
  } catch(err) { _log('emailPedidoRecibido_ERROR', ref, err.message); }
}

// Email cuando Wompi aprueba el pago
function _emailPagoConfirmado(email, nombre, ref, productos, total) {
  try {
    const subject = `🎉 ${CFG.NOMBRE_TIENDA} — ¡Pago confirmado! Pedido ${ref}`;
    const body = _emailWrapper(nombre, `
      <p>¡Gracias por tu compra! Tu pago ha sido confirmado exitosamente.</p>
      <p style="font-size:13px;color:#888">Referencia: <strong>${ref}</strong></p>
      ${_productosHTML(productos)}
      <p style="font-size:18px;font-weight:bold;color:#C4A05A;margin-top:16px">
        Total pagado: ${_fmtCOP(total)}
      </p>
      <p style="font-size:13px;color:#666;margin-top:16px">
        Cada pieza es única — hecha a mano en Italia, especialmente para ti.<br>
        Te mantendremos informado sobre el estado de tu pedido en cada etapa.
      </p>
    `);
    GmailApp.sendEmail(email, subject, '', { htmlBody: body });
    _log('emailPagoConfirmado', ref, email, 'OK');
  } catch(err) { _log('emailPagoConfirmado_ERROR', ref, err.message); }
}

// Email cuando pago es rechazado o hay error
function _emailPagoCancelado(email, nombre, ref, status) {
  try {
    const subject = `❌ ${CFG.NOMBRE_TIENDA} — Problema con tu pago — Pedido ${ref}`;
    const msgs = {
      'DECLINED' : 'Tu pago fue declinado por la entidad bancaria. Por favor verifica tus datos o intenta con otro medio de pago.',
      'VOIDED'   : 'Tu transacción fue anulada.',
      'ERROR'    : 'Ocurrió un error al procesar tu pago. Por favor intenta nuevamente.',
    };
    const msg = msgs[status] || 'Tu pago no pudo ser procesado.';
    const body = _emailWrapper(nombre, `
      <p>${msg}</p>
      <p style="font-size:13px;color:#888">Referencia: <strong>${ref}</strong></p>
      <p style="font-size:13px;color:#666;margin-top:16px">
        Si tienes dudas, escríbenos por 
        <a href="https://wa.me/${CFG.WHATSAPP}" style="color:#C4A05A">WhatsApp</a>
        y te ayudamos de inmediato.
      </p>
      <div style="margin-top:20px;text-align:center">
        <a href="${CFG.CATALOGO}" 
           style="background:#C4A05A;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:14px">
          Volver al catálogo
        </a>
      </div>
    `);
    GmailApp.sendEmail(email, subject, '', { htmlBody: body });
    _log('emailPagoCancelado', ref, email, status, 'OK');
  } catch(err) { _log('emailPagoCancelado_ERROR', ref, err.message); }
}

// Email cuando Gift Card es activada (pago APPROVED)
function _emailGiftCardActivada(email, nombre, ref, codigo, valor, vigencia) {
  try {
    const subject = `🎁 ${CFG.NOMBRE_TIENDA} — ¡Tu Gift Card está lista! ${codigo}`;
    const body = _emailWrapper(nombre, `
      <p>¡Tu Gift Card ha sido activada exitosamente!</p>
      <div style="background:#1a1610;border-radius:12px;padding:24px;text-align:center;margin:20px 0">
        <p style="color:#C4A05A;font-size:12px;letter-spacing:2px;margin:0 0 8px">CÓDIGO DE REGALO</p>
        <p style="color:#fff;font-size:28px;font-weight:bold;font-family:monospace;letter-spacing:4px;margin:0 0 8px">${codigo}</p>
        <p style="color:#C4A05A;font-size:18px;font-weight:bold;margin:0 0 8px">${_fmtCOP(valor)}</p>
        <p style="color:#888;font-size:12px;margin:0">Válido hasta: ${vigencia}</p>
      </div>
      <p style="font-size:13px;color:#666">Referencia de pago: <strong>${ref}</strong></p>
      <p style="font-size:13px;color:#666;margin-top:16px">
        <strong>¿Cómo usar tu Gift Card?</strong><br>
        Ingresa el código en el campo de bono/descuento durante el proceso de pago en nuestro catálogo.<br><br>
        <strong>Recuerda:</strong> guarda este código en un lugar seguro — se asimila a dinero en efectivo y 
        puede ser cedido a terceros. Tiene una vigencia de 9 meses desde la fecha de emisión.
      </p>
      <div style="margin-top:20px;text-align:center">
        <a href="${CFG.CATALOGO}" 
           style="background:#C4A05A;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:14px">
          Ir al catálogo
        </a>
      </div>
    `);
    GmailApp.sendEmail(email, subject, '', { htmlBody: body });
    _log('emailGiftCardActivada', ref, email, codigo, 'OK');
  } catch(err) { _log('emailGiftCardActivada_ERROR', ref, err.message); }
}

// Email cuando cliente confirma envío wishlist por WA
function _emailEnviadoWA(email, nombre, ref, productos, total) {
  try {
    const subject = `📋 ${CFG.NOMBRE_TIENDA} — Hemos recibido tu lista de deseos`;
    const body = _emailWrapper(nombre, `
      <p>Hemos recibido tu lista de deseos y nuestro equipo te contactará a la mayor brevedad 
      para brindarte atención personalizada.</p>
      <p style="font-size:13px;color:#888">Referencia: <strong>${ref}</strong></p>
      ${_productosHTML(productos)}
      <p style="font-size:18px;font-weight:bold;color:#C4A05A;margin-top:16px">
        Total estimado: ${_fmtCOP(total)}
      </p>
      <p style="font-size:13px;color:#666;margin-top:16px">
        Eres especial para nosotros — cada pieza que eliges es una obra de arte 
        hecha a mano en Italia. Nos encanta acompañarte en ese proceso.
      </p>
    `);
    GmailApp.sendEmail(email, subject, '', { htmlBody: body });
    _log('emailEnviadoWA', ref, email, 'OK');
  } catch(err) { _log('emailEnviadoWA_ERROR', ref, err.message); }
}

// Email carrito abandonado con enlace de recuperación
function _emailCarritoAbandonado(email, nombre, ref, productos, total) {
  try {
    const enlace = `${CFG.CATALOGO}?ref=${ref}`;
    const subject = `🛒 ${CFG.NOMBRE_TIENDA} — ¿Olvidaste algo?`;
    const body = _emailWrapper(nombre, `
      <p>Notamos que seleccionaste algunas piezas pero no completaste el proceso.</p>
      <p style="font-size:13px;color:#666">¡No pierdas la oportunidad! Tu selección te espera:</p>
      ${_productosHTML(productos)}
      <p style="font-size:18px;font-weight:bold;color:#C4A05A;margin-top:16px">
        Total estimado: ${_fmtCOP(total)}
      </p>
      <p style="font-size:13px;color:#666;margin-top:16px">
        Desde el siguiente enlace recuperas tu carrito original y puedes:<br>
        • Enviarnos tu lista por <strong>WhatsApp</strong> para atención personalizada<br>
        • O confirmar tu pedido directamente con un clic en <strong>Pagar con Wompi</strong>
      </p>
      <div style="margin-top:24px;text-align:center">
        <a href="${enlace}" 
           style="background:#C4A05A;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:bold">
          Recuperar mi carrito
        </a>
      </div>
      <p style="font-size:12px;color:#aaa;margin-top:20px;text-align:center">
        Referencia: ${ref}
      </p>
    `);
    GmailApp.sendEmail(email, subject, '', { htmlBody: body });
    _log('emailCarritoAbandonado', ref, email, 'OK');
  } catch(err) { _log('emailCarritoAbandonado_ERROR', ref, err.message); }
}

// Email notificación cambio manual de Estado_Pedido por operador
function _emailNotificarEstadoPedido(rowData, header, estado) {
  try {
    const colEmail  = header.indexOf('Email');
    const colNombre = header.indexOf('Nombre');
    const colRef    = header.indexOf('Referencia');
    const email  = rowData[colEmail]  || '';
    const nombre = rowData[colNombre] || 'cliente';
    const ref    = rowData[colRef]    || '';
    if (!email) return;

    const MENSAJES = {
      'EN_PRODUCCION'      : 'Tu pedido está en producción en Italia. Te notificaremos cuando esté listo para embarque.',
      'EN_TRANSITO'        : 'Tu pedido está en tránsito desde Italia hacia Colombia. Te mantendremos informado.',
      'EN_NACIONALIZACION' : 'Tu pedido está en proceso de nacionalización en aduana. Pronto estará disponible.',
      'LISTO_DESPACHO'     : 'Tu pedido está listo para ser despachado. Pronto recibirás la información de envío.',
      'DISPONIBLE_TIENDA'  : 'Tu pedido está disponible para retirar en nuestra tienda en Bogotá.',
      'DESPACHADO'         : 'Tu pedido ha sido despachado. Pronto recibirás la información de seguimiento.',
    };
    const msg = MENSAJES[estado] || `El estado de tu pedido ha sido actualizado: ${estado}.`;

    const subject = `📦 ${CFG.NOMBRE_TIENDA} — Actualización pedido ${ref}`;
    const body = _emailWrapper(nombre, `
      <p>${msg}</p>
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

// ============================================================
// EMAIL WRAPPER — layout compartido
// ============================================================

function _emailWrapper(nombre, contenido) {
  return `
<div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#1a1610">
  <div style="background:#1a1610;padding:28px 32px;border-radius:8px 8px 0 0">
    <h1 style="color:#C4A05A;font-size:22px;margin:0;letter-spacing:2px">HELENA CABALLERO</h1>
    <p style="color:#f5f0e8;font-size:13px;margin:6px 0 0">Cerámica artesanal italiana</p>
  </div>
  <div style="background:#faf8f4;padding:28px 32px;border:1px solid #e8e0d0;border-top:none">
    <p style="font-size:16px">Hola <strong>${nombre}</strong>,</p>
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
// SETUP — ejecutar UNA VEZ manualmente
// ============================================================

function setupSheets() {
  const HEADERS = {
    [CFG.SHEETS.WISHLIST]: [
      'Campaña_ID','Timestamp','Referencia','ClienteID',
      'Nombre','Apellido','Email','Teléfono',
      'Tipo_Doc','Num_Doc','Tipo_Persona',
      'Dirección_Wishlist','Barrio_Wishlist','Ciudad_Wishlist','Notas',
      'Productos_JSON','Total_COP',
      'Estado_Wishlist','Notas_internas',
    ],
    [CFG.SHEETS.PEDIDOS_WOMPI]: [
      'Campaña_ID','Timestamp','Referencia',
      'Wompi_Transaction_ID','Estado_Pago_Wompi',
      'ClienteID','Nombre','Apellido','Email','Teléfono',
      'Tipo_Doc','Num_Doc','Tipo_Persona',
      'Dirección','Barrio','Ciudad','Notas_entrega',
      'Productos_JSON','Subtotal_COP','Descuento_COP',
      'Total_COP','Pct_Pagado','Forma_pago',
      'Estado_Pedido','Fecha_despacho','Notas_internas','SIIGO_Factura_ID',
    ],
    [CFG.SHEETS.GIFT_CARDS]: [
      'Timestamp','Referencia','Código','Valor COP','Válido hasta','ClienteID_Emisor',
      'Emisor_Nombre','Emisor_Apellido','Emisor_Email','Emisor_Tel',
      'Tipo_Documento','Número_Documento',
      'Emisor_Dirección','Emisor_Barrio','Emisor_Ciudad',
      'Destinatario_Nombre','Destinatario_WhatsApp','Mensaje',
      'Estado','Fecha activación','Canjeado_En','Wompi_Transaction_ID',
      'Notas internas','Campaña_ID',
    ],
    [CFG.SHEETS.CLIENTES]: [
      'Teléfono','Nombre','Apellido','Email',
      'Tipo_Doc','Num_Doc','Tipo_Persona','Cumple_Día','Cumple_Mes',
      'Dirección_1','Barrio_1','Ciudad_1',
      'Dirección_2','Barrio_2','Ciudad_2',
      'Primera_interacción','Última_interacción','Num_interacciones',
      'Total_histórico_COP','Notas','ClienteID',
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
        .setBackground('#1a1610')
        .setFontColor('#C4A05A')
        .setFontWeight('bold');
      sheet.setFrozenRows(1);
      sheet.autoResizeColumns(1, headers.length);
      Logger.log('Headers escritos: ' + nombre);
    }
  });

  Logger.log('✅ setupSheets completado');
  setupDropdowns();
}

// ============================================================
// DROPDOWNS — ejecutar para actualizar validaciones
// ============================================================

function setupDropdowns() {
  const ss = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);

  // Estado_Pedido en Pedidos_Wompi
  _applyDropdown(ss, CFG.SHEETS.PEDIDOS_WOMPI, 'Estado_Pedido', ESTADOS_PEDIDO);

  // Estado_Wishlist en Wishlist
  _applyDropdown(ss, CFG.SHEETS.WISHLIST, 'Estado_Wishlist', ESTADOS_WISHLIST);

  // Estado en Campañas
  _applyDropdown(ss, CFG.SHEETS.CAMPANIAS, 'Estado', ['ACTIVA', 'CERRADA', 'PAUSADA']);

  Logger.log('✅ setupDropdowns completado');
}

function _applyDropdown(ss, sheetName, colName, valores) {
  const sheet  = ss.getSheetByName(sheetName);
  if (!sheet) { Logger.log('Sheet no encontrada: ' + sheetName); return; }
  const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const col    = header.indexOf(colName);
  if (col < 0) { Logger.log('Columna no encontrada: ' + colName + ' en ' + sheetName); return; }

  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(valores, true)
    .setAllowInvalid(false)
    .build();

  sheet.getRange(2, col + 1, 499, 1).setDataValidation(rule);
  Logger.log('✅ Dropdown aplicado: ' + sheetName + ' → ' + colName);
}

// ============================================================
// HELPERS
// ============================================================

function _getSheet(nombre) {
  const ss = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
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
  const cp  = (codigoPais || '+57').replace(/\s/g, '');
  const tel = (telefono   || '').replace(/\D/g, '');
  return tel ? cp + tel : '';
}

function _fmtCOP(valor) {
  if (!valor) return '$0';
  return '$' + Number(valor).toLocaleString('es-CO');
}

function _parseJSON(str) {
  try { return JSON.parse(str || '[]'); } catch { return []; }
}

function _productosHTML(productos) {
  if (!productos || !productos.length) return '';
  const rows = productos.map(p => `
    <tr>
      <td style="padding:6px 8px;border-bottom:1px solid #e8e0d0;font-size:13px">
        ${p.productName || p.name || ''} ${p.collection ? '— ' + p.collection : ''}
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
    sheet.appendRow([new Date(), fn, String(a1).slice(0,200), String(a2).slice(0,200), String(a3).slice(0,200), String(a4).slice(0,200)]);
  } catch(e) { Logger.log('LOG_ERROR: ' + e.message); }
}
