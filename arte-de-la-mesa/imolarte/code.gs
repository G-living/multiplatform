// ============================================================
// IMOLARTE — Google Apps Script Backend v20.16
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
// ─ v20.02: SpreadsheetApp.flush() incondicional en _confirmarPagoWompi
// ─ v20.03: SpreadsheetApp.flush() incondicional en _confirmarPagoGiftCard
// ─ v20.04: flush() MOVIDO al final de _createPedidoWompi y _createGiftCard (mismo scope de appendRow)
// ─ v20.06: _createGiftCard con idempotencia — evita duplicados si se llama más de una vez
// ─ v20.07: _confirmarPagoWompi lean path — eliminar stale-read de GAS
//           Causa: getDataRange().getValues() devuelve datos pre-appendRow aunque
//           se llame flush() en la misma ejecución. Fix: en lean path usar _leanRowNum
//           para actualizar celdas directamente y pedidoPayload para email/upsertCliente,
//           sin releer la hoja. Flujo estándar (sin pedidoPayload) sin cambios.
// ─ v20.08: _cancelGiftCard — cancela fila PENDIENTE_PAGO cuando usuario regresa de
//           Wompi sin pagar y edita el formulario (evita acumulación de filas huérfanas).
//           BUG-1 fix definitivo: NOT_FOUND resuelto
//           BUG-4 fix: catalogoId propagado en flujo lean de _confirmarPagoWompi
// ─ v20.09: _createGiftCard — idempotencia cambia de referencia→codigo. Si existe fila
//           PENDIENTE con mismo código, actualiza la referencia en lugar de insertar nueva.
//           Evita filas huérfanas cuando el usuario reintenta el pago (nueva referencia/timestamp).
// ─ v20.10: _createGiftCard reintento — además de referencia, actualiza valor, destinatario y
//           mensaje. Evita que cambios del usuario (nombre receptor, monto) queden desincronizados
//           entre el frontend y la fila en Sheets al reintentar el pago.
// ─ v20.11: emailResumenHuerfanos — resumen diario 6am al admin con todas las filas
//           INACTIVA (GiftCards) y PENDIENTE_PAGO (Pedidos_Wompi) detectadas como huérfanas.
//           setupTriggerResumenDiario() crea el trigger (ejecutar una vez desde Apps Script UI).
// ─ v20.12: emailResumenHuerfanos extendido — incluye Wishlists PENDIENTE, Pedidos_Wompi,
//           GiftCards INACTIVA y Cumpleaños del día (desde sheet Clientes).
// ─ v20.13: emailResumenHuerfanos — 5 secciones en orden: Wishlists · Cumpleaños · PedidosWompi
//           · Huérfanas (GiftCards Estado_Pago=PENDIENTE) · Gift Cards INACTIVAS. adminDesactivarGiftCard.
//           manualmente (acepta referencia o codigo, cualquier estado → CANCELADA).
//           _emailGiftCardActivada — texto actualizado: "se pondrá muy feliz…" +
//           "Gracias por confiar en HELENA CABALLERO" + footer con Código/Referencia/TxID.
//           CFG.WHATSAPP corregido: +573004257367 (dígitos invertidos).
// ─ v20.14: setupDropdowns — agrega dropdown Estado_Gift en GiftCards (ACTIVA/INACTIVA/CANCELADA).
// ─ v20.15: Fase 1 influencer — hoja Influencers + columnas Influencer_Código y Base_Comision_COP
//           en Pedidos_Wompi. Frontend: orden de descuentos corregido: bono → 3% → (5% futuro).
// ─ v20.16: Fase 2 influencer — GET getInfluencer valida código; _createPedidoWompi escribe
//           Influencer_Código y Base_Comision_COP; descuento 5% activo en checkout (bono→infl→3%).
// ─ v20.17: Fase 3 influencer — acumulación y liquidación mensual de comisiones:
//           · Comision_Acumulada_COP en hoja Influencers se incrementa en cada APPROVED.
//           · emailResumenHuerfanos (lunes 6am): sección extra con tabla nombre/código/acumulado.
//           · liquidarComisionesInfluencers (día 1 de cada mes, 8am via trigger):
//             ≥ $100.000 → crea Gift Card ACTIVA, email cálido con código, resetea acumulador.
//             < $100.000 → email motivacional con panel y mensajes de apoyo, NO resetea.
//           · repairInfluencersAddComisionAcumulada() para hojas ya existentes.
//           · setupTriggerLiquidacionInfluencers() para activar el trigger 8am.
// ─ v20.16: _emailInfluencerVenta — email automático al influencer en cada APPROVED con su código:
//           comisión estimada destacada, productos del pedido, nombre del cliente (primer nombre).
//           _emailNotificarEstadoPedido — reescrito con tabla de productos, resumen de valores,
//           saldo pendiente callout, mensajes cálidos por estado y footer estándar de seguimiento.
// ============================================================

'use strict';

const CFG = {
  SPREADSHEET_ID  : '1lgW9-nhgM6UVL4NvYet4EIjX6fuSJV4ZHtP4lffZ5tg',
  NOMBRE_TIENDA   : 'IMOLARTE by Helena Caballero',
  EMAIL_ADMIN     : 'filippo.massara2016@gmail.com',
  EMAIL_REMITENTE : 'filippo.massara2016@gmail.com',
  WHATSAPP        : '+573004257367',
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
    INFLUENCERS   : 'Influencers',
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
      case 'cancelGiftCard'        : result = _cancelGiftCard(body);          break;
      case 'adminDesactivarGiftCard': result = _adminDesactivarGiftCard(body); break;
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
      case 'getInfluencer' : result = _getInfluencer(e.parameter.codigo);     break;
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
// Cols: Campaña_ID | Catalogo_ID | Timestamp | Referencia | ClienteID |
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

  const catalogoId = b.catalogoId || '';
  sheet.appendRow([
    campania,                            // A  Campaña_ID
    catalogoId,                          // B  Catalogo_ID
    ts,                                  // C  Timestamp
    ref,                                 // D  Referencia
    cliId,                               // E  ClienteID
    cli.nombre    || '',                 // F  Nombre
    cli.apellido  || '',                 // G  Apellido
    cli.email     || '',                 // H  Email
    tel,                                 // I  Teléfono
    cli.tipoDoc   || '',                 // J  Tipo_Doc
    cli.numDoc    || '',                 // K  Num_Doc
    ent.direccion || '',                 // L  Dirección_Wishlist
    ent.barrio    || '',                 // M  Barrio_Wishlist
    ent.ciudad    || '',                 // N  Ciudad_Wishlist
    ent.notas     || '',                 // O  Notas
    JSON.stringify(b.productos || []),   // P  Productos_JSON
    b.total       || 0,                  // Q  Total_COP
    'PENDIENTE',                         // R  Estado_Wishlist
    '',                                  // S  Notas_internas
  ]);

  // v20.05: email "Lista de deseos recibida" inmediato al crear wishlist (manual §1)
  if (cli.email) _emailPedidoRecibido(cli.email, cli.nombre || '', ref, b.productos, b.total || 0);
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
      // v20.05: email "Lista de deseos recibida" se envía en _createWishlist (inmediato).
      // Manual §1: wishlists NO disparan email en cambio de estado (solo Pedidos_Wompi lo hace).
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

  // IDEMPOTENCIA — si ya existe una fila con esta referencia, no crear duplicado
  if (b.referencia && b.referencia !== '') {
    const existing = sheet.getDataRange().getValues();
    const colRef   = existing[0].indexOf('Referencia');
    if (colRef >= 0) {
      for (let i = 1; i < existing.length; i++) {
        if (existing[i][colRef] === ref) {
          _log('createPedidoWompi', ref, 'DUPLICATE_SKIPPED');
          const colCli = existing[0].indexOf('ClienteID');
          // rowNum = i + 1 (1-based) — devuelto para que _confirmarPagoWompi actualice directamente
          return { ok: true, referencia: ref, clienteId: colCli >= 0 ? existing[i][colCli] : '', rowNum: i + 1 };
        }
      }
    }
  }

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

  const catalogoId = b.catalogoId || '';

  // Lookup influencer para columnas AC-AF (comisionPct, nombre, apellido, codigo)
  let inflComisionPct = 0, inflNombreSolo = '', inflApellido = '';
  if (b.influencerCodigo) {
    const inflData = _getInfluencer(b.influencerCodigo);
    if (inflData.ok) {
      inflComisionPct = inflData.comisionPct || 0;
      inflNombreSolo  = inflData.nombreSolo  || '';
      inflApellido    = inflData.apellido    || '';
    }
  }

  sheet.appendRow([
    campania,                            // A  Campaña_ID
    catalogoId,                          // B  Catalogo_ID
    ts,                                  // C  Timestamp
    ref,                                 // D  Referencia
    b.wompiTransactionId || '',          // E  Wompi_Transaction_ID
    'PENDING',                           // F  Estado_Pago_Wompi
    cliId,                               // G  ClienteID
    cli.nombre    || '',                 // H  Nombre
    cli.apellido  || '',                 // I  Apellido
    cli.email     || '',                 // J  Email
    tel,                                 // K  Teléfono
    cli.tipoDoc   || '',                 // L  Tipo_Doc
    cli.numDoc    || '',                 // M  Num_Doc
    ent.direccion || '',                 // N  Dirección
    ent.barrio    || '',                 // O  Barrio
    ent.ciudad    || '',                 // P  Ciudad
    ent.notas     || '',                 // Q  Notas_entrega
    JSON.stringify(b.productos || []),   // R  Productos_JSON
    b.subtotal    || 0,                  // S  Subtotal_COP
    // T-AF: desglose completo de descuentos e influencer para análisis financiero
    b.discInfluencer   || 0,             // T  Descuento_Influencer_COP
    b.discGiftCard     || 0,             // U  Descuento_GiftCard_COP
    b.totalAPagar      || 0,             // V  Total_a_Pagar_COP
    b.porcentajePagado || 100,           // W  Porcentaje_Pagado
    b.formaPago   || 'WOMPI_100',        // X  Forma_Pago
    // Y Saldo pendiente: 40% de Total_a_Pagar si anticipo 60%, 0 en otro caso
    (b.porcentajePagado || 100) === 60
      ? _roundCOP((b.totalAPagar || 0) * 0.4) : 0,       // Y  Saldo_Pendiente_COP
    'PENDIENTE',                         // Z  Estado_Pedido
    '',                                  // AA Fecha_Despacho
    '',                                  // AB Notas_Internas
    inflComisionPct,                     // AC Comision_Pct_Influencer
    inflNombreSolo,                      // AD Influencer_Nombre
    inflApellido,                        // AE Influencer_Apellido
    b.influencerCodigo || '',            // AF Influencer_Codigo
  ]);

  _log('createPedidoWompi', ref, cliId, 'OK');
  // flush() en el mismo scope del appendRow — garantiza que la fila está escrita.
  SpreadsheetApp.flush();
  const rowNum = sheet.getLastRow(); // fila recién creada (1-based)
  // _skipEmail: true cuando el pedido se crea post-pago desde checkout.js
  const _esGift = String(b.formaPago || '').startsWith('GIFT_CARD');
  if (!b._skipEmail && !_esGift && cli.email) _emailPedidoRecibido(cli.email, cli.nombre, ref, b.productos, b.total);
  return { ok: true, referencia: ref, clienteId: cliId, rowNum };
}

function _confirmarPagoWompi(b) {
  const d      = b.data || {};
  const ref    = b.referencia    || d.pedidoId      || '';
  const status = b.status        || d.paymentStatus  || 'APPROVED';
  const txId   = b.transactionId || d.transactionId  || '';

  if (!ref) return { ok: false, error: 'Referencia requerida' };

  // ── Flujo lean: si viene pedidoPayload, hacer create+redeem en servidor ──
  // Una sola llamada HTTP desde el browser — sin riesgo de cancelación.
  // _leanRowNum: número de fila (1-based) devuelto por _createPedidoWompi para
  // evitar re-leer la hoja completa (posible dato desactualizado post-flush).
  let _leanRowNum = 0;
  if (b.pedidoPayload && status === 'APPROVED') {
    const p = b.pedidoPayload;
    // 1. Crear pedido (idempotente — si ya existe, no duplica)
    const _cRes = _createPedidoWompi({
      campaniaId:        p.campaniaId        || '',
      catalogoId:        p.catalogoId        || '',
      cliente:           p.cliente           || {},
      entrega:           p.entrega           || {},
      productos:         p.productos         || [],
      formaPago:         p.formaPago         || 'WOMPI_100',
      subtotal:          p.subtotal          || 0,
      descuento:         p.descuento         || 0,
      total:             p.total             || 0,
      porcentajePagado:  p.porcentajePagado  || 100,
      influencerCodigo:  p.influencerCodigo  || '',
      influencerBase:    p.influencerBase    || 0,
      discInfluencer:    p.discInfluencer    || 0,
      discGiftCard:      p.discGiftCard      || 0,
      disc3pct:          p.disc3pct          || 0,
      totalAPagar:       p.totalAPagar       || 0,
      referencia:        ref,
      _skipEmail:        true,
    });
    _leanRowNum = _cRes.rowNum || 0;
    // 2. Redimir bono si aplica
    if (p.bono && p.bono.code && p.bono.monto > 0) {
      _redeemDono({ code: p.bono.code, amount: p.bono.monto, referencia: ref });
    }
  }

  const sheet  = _getSheet(CFG.SHEETS.PEDIDOS_WOMPI);
  SpreadsheetApp.flush(); // commit todos los writes pendientes (appendRow + redeemDono)

  // ── Obtener header (siempre una sola fila — muy barato) ──────
  const lastCol = sheet.getLastColumn();
  const header  = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  const colRef    = header.indexOf('Referencia');
  const colPagoWP = header.indexOf('Estado_Pago_Wompi');
  const colPedido = header.indexOf('Estado_Pedido');
  const colTxId   = header.indexOf('Wompi_Transaction_ID');

  if (colRef < 0 || colPagoWP < 0 || colPedido < 0)
    return { ok: false, error: 'Columnas no encontradas en Pedidos_Wompi' };

  // ── Vía LEAN (pedidoPayload presente): actualizar celdas directamente ──
  // v20.07 fix: getDataRange().getValues() puede devolver datos cacheados
  // (pre-appendRow) incluso tras flush() — GAS stale-read bug.
  // Solución: usar _leanRowNum para setValues directo + pedidoPayload para
  // emails/upsert. Sin releer la hoja → sin stale-read.
  if (_leanRowNum > 0 && b.pedidoPayload) {
    const p          = b.pedidoPayload;
    const cli        = p.cliente || {};
    const estadoPedido = status === 'APPROVED' ? 'CONFIRMADO'
      : (status === 'PENDING' ? 'PENDIENTE' : 'CANCELADO');

    sheet.getRange(_leanRowNum, colPagoWP + 1).setValue(status);
    sheet.getRange(_leanRowNum, colPedido  + 1).setValue(estadoPedido);
    if (txId && colTxId >= 0) sheet.getRange(_leanRowNum, colTxId + 1).setValue(txId);

    _log('confirmarPagoWompi', ref, status, estadoPedido);

    const email          = cli.email                      || '';
    const nombre         = cli.nombre                     || '';
    const prods          = p.productos                    || [];
    const total          = p.total                        || 0;
    const subtotal       = p.subtotal                     || 0;
    const descuento      = p.descuento                    || 0;
    const formaPago      = String(p.formaPago             || '');
    const pctPagado      = Number(p.porcentajePagado)     || 100;
    const discInfluencer = Number(p.discInfluencer        || 0);
    const inflPct        = Number(p.influencerPct         || 0);
    const discGiftCard   = Number(p.discGiftCard          || 0);
    const disc3pct       = Number(p.disc3pct              || 0);
    const totalAPagar    = Number(p.totalAPagar           || 0);

    // Extraer código de GC para el email (solo el código — el monto viene de discGiftCard)
    let giftInfo = null;
    const giftMatch    = formaPago.match(/GIFT:([A-Z0-9-]+)/);
    const giftTotMatch = formaPago.match(/^GIFT_CARD:([A-Z0-9-]+)/);
    if (giftMatch)         giftInfo = { codigo: giftMatch[1],    monto: discGiftCard, tipo: 'MIXTO'  };
    else if (giftTotMatch) giftInfo = { codigo: giftTotMatch[1], monto: discGiftCard, tipo: 'TOTAL'  };
    else if (formaPago === 'GIFT_CARD') giftInfo = { codigo: '', monto: discGiftCard, tipo: 'TOTAL'  };

    if (email) {
      if (status === 'APPROVED') _emailPagoConfirmado(email, nombre, ref, prods, total, giftInfo, pctPagado, subtotal, descuento, txId, discInfluencer, inflPct, discGiftCard, disc3pct, totalAPagar, p.influencerCodigo || '');
      else if (['DECLINED','ERROR','VOIDED'].includes(status))
        _emailPagoCancelado(email, nombre, ref, status);
    }

    if (status === 'APPROVED' && (p.influencerCodigo || '')) {
      _emailInfluencerVenta(p.influencerCodigo, {
        clienteNombre: `${cli.nombre || ''} ${cli.apellido || ''}`.trim(),
        ref, prods, subtotal: subtotal || total,
      });
    }

    const totalParaHistorico = _roundCOP(subtotal || total);
    if (status === 'APPROVED' && totalParaHistorico > 0) {
      const tel = _fmtTel(cli.codigoPais, cli.telefono);
      const doc = { tipoDoc: cli.tipoDoc || '', numDoc: cli.numDoc || '' };
      _upsertCliente({ telefono: tel, ...doc, total: totalParaHistorico,
                       _pedidoRef: ref,
                       _pedidoProds: prods,
                       _pedidoTs: new Date() });
    }

    return { ok: true, referencia: ref, status, estadoPedido };
  }

  // ── Vía ESTÁNDAR (webhook Wompi sin payload): escanear toda la hoja ──
  // En este caso el pedido fue creado en una llamada previa (no hay stale-read).
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][colRef] !== ref) continue;

    sheet.getRange(i + 1, colPagoWP + 1).setValue(status);
    const estadoPedido = status === 'APPROVED' ? 'CONFIRMADO'
      : (status === 'PENDING' ? 'PENDIENTE' : 'CANCELADO');
    sheet.getRange(i + 1, colPedido + 1).setValue(estadoPedido);
    if (txId && colTxId >= 0) sheet.getRange(i + 1, colTxId + 1).setValue(txId);

    _log('confirmarPagoWompi', ref, status, estadoPedido);

    const email          = data[i][header.indexOf('Email')]                        || '';
    const nombre         = data[i][header.indexOf('Nombre')]                       || '';
    const prods          = _parseJSON(data[i][header.indexOf('Productos_JSON')]);
    const subtotal       = Number(data[i][header.indexOf('Subtotal_COP')]          || 0);
    const formaPago      = String(data[i][header.indexOf('Forma_Pago')]            || '');
    const pctPagado      = Number(data[i][header.indexOf('Porcentaje_Pagado')]     || 100);
    const discInfluencer = Number(data[i][header.indexOf('Descuento_Influencer_COP')] || 0);
    const discGiftCard   = Number(data[i][header.indexOf('Descuento_GiftCard_COP')]   || 0);
    const totalAPagar    = Number(data[i][header.indexOf('Total_a_Pagar_COP')]     || 0);
    // inflPct aproximado: puede derivarse del comisionPct de la columna AC
    const inflPct        = subtotal > 0 ? Math.round(discInfluencer / subtotal * 100) : 0;
    // Reconstruir total Wompi (no se guarda en sheet — se deriva de V + W + X)
    let total = 0;
    if (formaPago.startsWith('GIFT_CARD') && !formaPago.includes('+GIFT')) {
      total = 0;
    } else if (pctPagado === 60) {
      total = Math.floor(totalAPagar * 0.6 / 1000) * 1000;
    } else {
      total = Math.floor(totalAPagar * 0.97 / 1000) * 1000;
    }
    const disc3pct = (pctPagado === 100 && total > 0) ? Math.max(0, totalAPagar - total) : 0;

    // Código de GC para el email — monto viene de discGiftCard (columna U)
    let giftInfo = null;
    const giftMatch    = formaPago.match(/GIFT:([A-Z0-9-]+)/);
    const giftTotMatch = formaPago.match(/^GIFT_CARD:([A-Z0-9-]+)/);
    if (giftMatch)         giftInfo = { codigo: giftMatch[1],    monto: discGiftCard, tipo: 'MIXTO' };
    else if (giftTotMatch) giftInfo = { codigo: giftTotMatch[1], monto: discGiftCard, tipo: 'TOTAL' };
    else if (formaPago === 'GIFT_CARD') giftInfo = { codigo: '', monto: discGiftCard, tipo: 'TOTAL' };

    const inflCodStd = String(data[i][header.indexOf('Influencer_Codigo')] || '').trim();
    if (email) {
      if (status === 'APPROVED') _emailPagoConfirmado(email, nombre, ref, prods, total, giftInfo, pctPagado, subtotal, 0, txId, discInfluencer, inflPct, discGiftCard, disc3pct, totalAPagar, inflCodStd);
      else if (['DECLINED','ERROR','VOIDED'].includes(status))
        _emailPagoCancelado(email, nombre, ref, status);
    }

    if (status === 'APPROVED' && inflCodStd) {
      _emailInfluencerVenta(inflCodStd, {
        clienteNombre: `${nombre} ${data[i][header.indexOf('Apellido')] || ''}`.trim(),
        ref, prods, subtotal: subtotal || total,
      });
    }

    // En APPROVED: contar interacción + acumular total en una sola llamada
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

  // IDEMPOTENCIA v20.09 — busca por Código_Gift (no referencia) para soportar reintentos de pago.
  // Cada reintento genera una referencia nueva (GIFT-timestamp) pero el código es el mismo.
  // Si hay una fila PENDIENTE con el mismo código: actualizar referencia en lugar de insertar nueva.
  // Si hay una fila ya procesada (ACTIVA/CANCELADA): retornar sin crear duplicado.
  const existData    = sheet.getDataRange().getValues();
  const existHeader  = existData[0];
  const existColCode = existHeader.indexOf('Código_Gift');
  const existColRef  = existHeader.indexOf('Referencia');
  const existColEst  = existHeader.indexOf('Estado_Gift');
  const existColCli  = existHeader.indexOf('ClienteID_Emisor');
  if (existColCode >= 0 && b.codigo) {
    for (let i = 1; i < existData.length; i++) {
      if (existData[i][existColCode] !== b.codigo) continue;
      const estadoGift = existColEst >= 0 ? String(existData[i][existColEst] || '') : '';
      if (estadoGift === 'INACTIVA') {
        // v20.10: Reintento de pago — actualizar referencia Y datos que pudieron cambiar
        // (monto, destinatario, mensaje) para que el email salga con info correcta.
        const dest  = b.destinatario || {};
        const row   = i + 1; // 1-indexed
        const updates = [
          ['Referencia',    existColRef,                             ref],
          ['Saldo_Gift_COP',existHeader.indexOf('Saldo_Gift_COP'),  b.valor    || 0],
          ['Válido_Hasta',  existHeader.indexOf('Válido_Hasta'),    b.vigencia || ''],
          ['Dest_Nombre',   existHeader.indexOf('Dest_Nombre'),     dest.nombre    || ''],
          ['Dest_Apellido', existHeader.indexOf('Dest_Apellido'),   dest.apellido  || ''],
          ['Dest_Email',    existHeader.indexOf('Dest_Email'),      dest.email     || ''],
          ['Dest_Tel',      existHeader.indexOf('Dest_Tel'),        dest.telefono  || ''],
          ['Dest_Mensaje',  existHeader.indexOf('Dest_Mensaje'),    b.mensaje      || ''],
        ];
        updates.forEach(([, col, val]) => {
          if (col >= 0) sheet.getRange(row, col + 1).setValue(val);
        });
        // Actualizar cliente emisor si viene con datos
        const em = b.emisor || {};
        const cliId = (em.telefono || em.numDoc)
          ? _upsertCliente({ telefono: em.telefono || '', nombre: em.nombre || '', apellido: em.apellido || '',
              email: em.email || '', tipoDoc: em.tipoDoc || '', numDoc: em.numDoc || '',
              cumpleDia: em.cumpleDia || '', cumpleMes: em.cumpleMes || '',
              direccion: em.direccion || '', barrio: em.barrio || '', ciudad: em.ciudad || '' }).clienteId
          : (existColCli >= 0 ? existData[i][existColCli] : '');
        SpreadsheetApp.flush();
        _log('createGiftCard', ref, b.codigo, cliId, 'REINTENTO — referencia y datos actualizados');
        return { ok: true, referencia: ref, codigo: b.codigo, clienteId: cliId };
      }
      // Ya procesada (ACTIVA, CANCELADA, etc.) — devolver sin tocar
      _log('createGiftCard', ref, b.codigo, 'YA_PROCESADA — estado:', estadoGift);
      const refExistente = existColRef >= 0 ? existData[i][existColRef] : ref;
      return { ok: true, referencia: refExistente,
               codigo:    b.codigo,
               clienteId: existColCli >= 0 ? existData[i][existColCli] : '' };
    }
  }

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
  // v20.04 BUG-1 fix: flush() en el mismo scope del appendRow — garantiza que la fila
  // está comprometida ANTES de que _confirmarPagoGiftCard llame a getDataRange()
  SpreadsheetApp.flush();
  // ⚠️ No upsert destinatario — solo se registra cuando él mismo compra
  return { ok: true, referencia: ref, codigo: b.codigo, clienteId: cliId };
}

// Cancela una Gift Card en estado PENDIENTE_PAGO (usuario regresó de Wompi sin pagar
// y va a intentar el pago de nuevo con un nuevo formulario / nueva referencia).
// Solo actúa sobre PENDIENTE_PAGO — nunca cancela ACTIVA, CANCELADA, etc.
function _cancelGiftCard(b) {
  const ref = b.referencia || '';
  if (!ref) return { ok: false, error: 'Referencia requerida' };

  const sheet  = _getSheet(CFG.SHEETS.GIFT_CARDS);
  const data   = sheet.getDataRange().getValues();
  const header = data[0];
  const colRef     = header.indexOf('Referencia');
  const colEstPago = header.indexOf('Estado_Pago');
  const colEstGift = header.indexOf('Estado_Gift');

  if (colRef < 0) return { ok: false, error: 'Columna Referencia no encontrada' };

  for (let i = 1; i < data.length; i++) {
    if (data[i][colRef] !== ref) continue;
    const estadoActual = String(data[i][colEstPago] || '');
    // Solo cancelar si aún está pendiente de pago — no tocar APPROVED ni CANCELADO
    if (estadoActual !== 'PENDIENTE_PAGO') {
      _log('cancelGiftCard', ref, 'SKIP — estado:', estadoActual);
      return { ok: true, referencia: ref, skipped: true, estado: estadoActual };
    }
    if (colEstPago >= 0) sheet.getRange(i + 1, colEstPago + 1).setValue('CANCELADO');
    if (colEstGift >= 0) sheet.getRange(i + 1, colEstGift + 1).setValue('CANCELADA');
    SpreadsheetApp.flush();
    _log('cancelGiftCard', ref, 'CANCELADA');
    return { ok: true, referencia: ref, cancelada: true };
  }
  // No encontrada — igual devolver ok (puede ya haberse limpiado o nunca existido)
  _log('cancelGiftCard', ref, 'NOT_FOUND');
  return { ok: true, referencia: ref, notFound: true };
}

// Desactivación manual por el admin — acepta referencia o codigo.
// Puede actuar sobre cualquier estado (ACTIVA, PENDIENTE_PAGO, INACTIVA).
// Uso: POST { action: 'adminDesactivarGiftCard', referencia: 'GIFT-...' }
//      o    { action: 'adminDesactivarGiftCard', codigo: 'XXXX-XXXX-XXXX' }
function _adminDesactivarGiftCard(b) {
  const ref    = String(b.referencia || '').trim();
  const codigo = String(b.codigo     || '').trim();
  if (!ref && !codigo) return { ok: false, error: 'Se requiere referencia o codigo' };

  const sheet  = _getSheet(CFG.SHEETS.GIFT_CARDS);
  const data   = sheet.getDataRange().getValues();
  const header = data[0];
  const colRef     = header.indexOf('Referencia');
  const colCodigo  = header.indexOf('Código_Gift');
  const colEstPago = header.indexOf('Estado_Pago');
  const colEstGift = header.indexOf('Estado_Gift');

  for (let i = 1; i < data.length; i++) {
    const rowRef    = String(data[i][colRef]    || '');
    const rowCodigo = String(data[i][colCodigo] || '');
    if ((ref && rowRef !== ref) && (codigo && rowCodigo !== codigo)) continue;
    if (!ref && rowCodigo !== codigo) continue;
    if (!codigo && rowRef !== ref)   continue;

    const estadoAnterior = String(data[i][colEstGift] || '');
    if (colEstPago >= 0) sheet.getRange(i + 1, colEstPago + 1).setValue('CANCELADO');
    if (colEstGift >= 0) sheet.getRange(i + 1, colEstGift + 1).setValue('CANCELADA');
    SpreadsheetApp.flush();
    _log('adminDesactivarGiftCard', rowRef || rowCodigo, estadoAnterior, '→ CANCELADA');
    return { ok: true, referencia: rowRef, codigo: rowCodigo, estadoAnterior, cancelada: true };
  }
  _log('adminDesactivarGiftCard', ref || codigo, 'NOT_FOUND');
  return { ok: false, error: 'Gift Card no encontrada', referencia: ref, codigo };
}

function _confirmarPagoGiftCard(b) {
  const sheet  = _getSheet(CFG.SHEETS.GIFT_CARDS);
  SpreadsheetApp.flush(); // garantiza que appendRow de _createGiftCard ya está escrito
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

      if (email) _emailGiftCardActivada(email, nombre, ref, codigo, valor, vig, destNombre, destApellido, txId);
      if (destEmail) _emailGiftCardDestinatario(destEmail, destNombre, nombre, apellido, codigo, valor, vig, mensaje);

      if (telEmisor && valor > 0) {
        // Registrar compra de GC: cuenta interacción (+1) y acumula total histórico.
        // _soloTotal eliminado — compra confirmada de GC = interacción real del cliente.
        _upsertCliente({
          telefono  : String(telEmisor),
          tipoDoc   : String(docTipo),
          numDoc    : String(docNum),
          nombre    : String(nombre),
          apellido  : String(apellido),
          email     : String(email),
          total     : valor,
          _pedidoRef  : ref,
          _pedidoProds: [{ productName: `Gift Card ${codigo}`, collection: 'Gift Card', quantity: 1 }],
          _pedidoTs   : new Date(),
        });
      }
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

// Busca un influencer por Código. Usado por GET action=getInfluencer.
// Retorna: { ok, valid, codigo, nombre, descuentoPct, comisionPct, estado, reason }
function _getInfluencer(codigo) {
  if (!codigo) return { ok: false, valid: false, error: 'Código requerido', reason: 'Código requerido' };
  const sheet  = _getSheet(CFG.SHEETS.INFLUENCERS);
  const data   = sheet.getDataRange().getValues();
  const header = data[0];
  const colCod      = header.indexOf('Código');
  const colNombre   = header.indexOf('Nombre');
  const colApellido = header.indexOf('Apellido');
  const colDesc     = header.indexOf('Descuento_Pct');
  const colCom      = header.indexOf('Comision_Pct');
  const colEstado   = header.indexOf('Estado');

  if (colCod < 0) return { ok: false, valid: false, reason: 'Hoja Influencers no configurada' };

  const codigoNorm = String(codigo).trim().toUpperCase();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][colCod]).trim().toUpperCase() !== codigoNorm) continue;
    const estado   = String(data[i][colEstado] || '').trim();
    const isActive = estado === 'ACTIVO';
    const nombre   = [data[i][colNombre] || '', data[i][colApellido] || '']
      .filter(Boolean).join(' ');
    const reason   = !isActive
      ? (estado === 'INACTIVO' ? 'Código de influencer inactivo' : 'Código no disponible')
      : '';
    return {
      ok          : true,
      valid       : isActive,
      codigo      : String(data[i][colCod]).trim(),
      nombre,                                              // nombre completo (nombre + apellido)
      nombreSolo  : String(data[i][colNombre]   || '').trim(),
      apellido    : String(data[i][colApellido] || '').trim(),
      email       : String(data[i][header.indexOf('Email')] || '').trim(),
      descuentoPct: Number(data[i][colDesc]) || 0,
      comisionPct : Number(data[i][colCom])  || 0,
      estado,
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

    // Teléfono: normalizar ambos lados antes de comparar (strip +, espacios, guiones)
    // para evitar falsos positivos en historial por diferencias de formato
    if (tel) {
      const _norm = v => String(v || '').replace(/[\s+\-]/g, '');
      const actual = String(row[CLI.TELEFONO] || '');
      if (!actual) {
        sheet.getRange(i + 1, CLI.TELEFONO + 1).setValue(tel);
      } else if (_norm(actual) !== _norm(tel)) {
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
    if (!e || !e.range) return;
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
    const subject = `📋 ${CFG.NOMBRE_TIENDA} — Hemos recibido tu lista de deseos`;
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

// discInfluencer, inflPct, discGiftCard, disc3pct, totalAPagar, inflCodigo
// Sin reconstrucción heurística: valores guardados directamente por el frontend.
function _emailPagoConfirmado(email, nombre, ref, productos, total, giftInfo, pctPagado, subtotal, descuento, txId,
                              discInfluencer, inflPct, discGiftCard, disc3pct, totalAPagar, inflCodigo) {
  try {
    const subject = `🎉 ${CFG.NOMBRE_TIENDA} — ¡Pago confirmado! Pedido ${ref}`;

    const tablaProductos  = _productosHTML(productos);
    const pct             = Number(pctPagado)   || 100;
    const subtotalMostrar = _roundCOP(subtotal  || total);
    const totalRedondeado = Number(total)        || 0;

    // ── Componentes de descuento — columnas AE-AH (sin heurísticas) ──────────
    const inflDesc     = Number(discInfluencer || 0);
    const bonoDesc     = Number(discGiftCard   || 0);
    const disc3pctAmt  = Number(disc3pct       || 0);
    const totalAPagarV = Number(totalAPagar    || 0);
    const inflPctLabel = Number(inflPct        || 0);

    // ── Línea descuento influencer ──────────────────────────
    const inflCodigoLabel = String(inflCodigo || '').trim();
    const inflHTML = inflDesc > 0 ? `
        <tr>
          <td style="padding:5px 8px;font-size:13px;color:#555">Descuento Referido${inflCodigoLabel ? ' <strong>' + inflCodigoLabel + '</strong>' : ''}${inflPctLabel > 0 ? ' (' + inflPctLabel + '%)' : ''}</td>
          <td style="padding:5px 8px;font-size:13px;text-align:right;color:#5a9a5a">− ${_fmtCOP(inflDesc)}</td>
        </tr>` : '';

    // ── Línea Gift Card ─────────────────────────────────────
    let bonoHTML = '';
    if (bonoDesc > 0) {
      const codigoLabel = giftInfo?.codigo
        ? `Gift Card <code style="background:#e8f5e8;padding:2px 6px;border-radius:3px;font-size:12px">${giftInfo.codigo}</code>`
        : 'Gift Card';
      bonoHTML = `
        <tr>
          <td style="padding:5px 8px;font-size:13px;color:#555">🎁 ${codigoLabel}</td>
          <td style="padding:5px 8px;font-size:13px;text-align:right;color:#5a9a5a">− ${_fmtCOP(bonoDesc)}</td>
        </tr>`;
    }

    // ── Línea 3% pago anticipado ────────────────────────────
    const descHTML = disc3pctAmt > 0 ? `
        <tr>
          <td style="padding:5px 8px;font-size:13px;color:#555">Dcto. pago anticipado (3%)</td>
          <td style="padding:5px 8px;font-size:13px;text-align:right;color:#5a9a5a">− ${_fmtCOP(disc3pctAmt)}</td>
        </tr>` : '';

    // ── Línea "Total a pagar" — visible si hay infl o bono ─
    const totalAPagarHTML = (inflDesc > 0 || bonoDesc > 0) ? `
        <tr style="border-top:1px solid #ddd">
          <td style="padding:6px 8px;font-size:13px;color:#555">Total a pagar</td>
          <td style="padding:6px 8px;font-size:13px;text-align:right;color:#1a1610">${_fmtCOP(totalAPagarV)}</td>
        </tr>` : '';

    // ── Total pagado hoy ───────────────────────────────────
    const pagadoLabel = pct === 60 ? `Total pagado hoy (60%)` : `Total pagado`;
    const pagadoValor = totalRedondeado;

    // ── Transacción ────────────────────────────────────────
    const txLabel  = (giftInfo?.tipo === 'TOTAL') ? 'GIFT_CARD' : (txId || '—');
    const txHTML   = `
        <tr>
          <td style="padding:5px 8px;font-size:13px;color:#555">Transacción</td>
          <td style="padding:5px 8px;font-size:13px;text-align:right;color:#888;font-size:12px">${txLabel}</td>
        </tr>`;

    // ── Saldo pendiente ────────────────────────────────────
    // Para 60%: saldo = 40% de "Total a Pagar" (sin el 3% que no aplica en anticipo)
    const saldoPendiente = pct === 60 ? _roundCOP(totalAPagarV * 0.4) : 0;
    const saldoValor     = _fmtCOP(saldoPendiente);

    // ── Aviso saldo 40% (solo pct=60) ─────────────────────
    const saldoAvisoHTML = pct === 60 ? `
      <div style="background:#fff8e6;border-left:4px solid #C4A05A;padding:14px 18px;border-radius:4px;margin:16px 0">
        <p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:#7a5c00">Saldo pendiente (40%): ${saldoValor}</p>
        <p style="margin:0;font-size:13px;color:#555">
          Te avisaremos cuando tu pedido esté en tránsito desde Italia, con tiempo suficiente
          para completar el pago sin incurrir en sobrecostos o penalidades.
        </p>
      </div>` : '';

    const resumenHTML = `
      <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#f8f5ee;border-radius:6px">
        <tr>
          <td style="padding:8px 8px 5px;font-size:13px;color:#555">Subtotal</td>
          <td style="padding:8px 8px 5px;font-size:13px;text-align:right">${_fmtCOP(subtotalMostrar)}</td>
        </tr>
        ${inflHTML}
        ${bonoHTML}
        ${descHTML}
        ${totalAPagarHTML}
        <tr style="border-top:2px solid #C4A05A">
          <td style="padding:8px 8px 5px;font-size:14px;font-weight:bold;color:#1a1610">${pagadoLabel}</td>
          <td style="padding:8px 8px 5px;font-size:14px;font-weight:bold;text-align:right;color:#C4A05A">${_fmtCOP(pagadoValor)}</td>
        </tr>
        ${txHTML}
        ${pct === 60 ? `
        <tr>
          <td style="padding:5px 8px 8px;font-size:13px;color:#555">Saldo pendiente (40%)</td>
          <td style="padding:5px 8px 8px;font-size:13px;text-align:right;color:#d97706">${saldoValor}</td>
        </tr>` : ''}
      </table>`;

    const body = _emailWrapper(nombre, `
      <p>¡Qué alegría! Tu pago ha sido confirmado exitosamente. Cada pieza que elegiste es única — hecha a mano en Italia, especialmente para ti.</p>
      <p style="font-size:13px;color:#888">Referencia: <strong>${ref}</strong></p>
      ${tablaProductos}
      ${resumenHTML}
      ${saldoAvisoHTML}
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
    const subject = `❌ ${CFG.NOMBRE_TIENDA} — Problema con tu pago — Pedido ${ref}`;
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

function _emailGiftCardActivada(email, nombre, ref, codigo, valor, vigencia, destNombre, destApellido, txId) {
  try {
    const subject = `🎁 ${CFG.NOMBRE_TIENDA} — ¡Tu Gift Card está lista! ${codigo}`;
    const destCompleto = [destNombre, destApellido].filter(Boolean).join(' ') || 'el destinatario';
    const body = _emailWrapper(nombre, `
      <p>Tu Gift Card ha sido activada exitosamente y <strong>${destCompleto}</strong> se pondrá muy feliz por este super detalle de tu parte.</p>
      <p>Gracias por confiar en HELENA CABALLERO, ha sido un placer atenderte.</p>
      <div style="background:#1a1610;border-radius:12px;padding:24px;text-align:center;margin:20px 0">
        <p style="color:#C4A05A;font-size:12px;letter-spacing:2px;margin:0 0 8px">CÓDIGO DE REGALO</p>
        <p style="color:#fff;font-size:28px;font-weight:bold;font-family:monospace;letter-spacing:4px;margin:0 0 8px">${codigo}</p>
        <p style="color:#C4A05A;font-size:18px;font-weight:bold;margin:0 0 8px">${_fmtCOP(_roundCOP(valor))}</p>
        <p style="color:#888;font-size:12px;margin:0">Válido hasta: ${vigencia}</p>
      </div>
      ${_instruccionesGiftHTML()}
      <p style="font-size:12px;color:#aaa;margin-top:16px">
        Código de la Gift Card: <strong style="font-family:monospace">${codigo}</strong><br>
        Referencia de pedido: <strong>${ref}</strong><br>
        Transacción ID: <strong>${txId || '—'}</strong>
      </p>
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
    const subject = `📋 ${CFG.NOMBRE_TIENDA} — Hemos recibido tu lista de deseos`;
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
    const email    = rowData[header.indexOf('Email')]            || '';
    const nombre   = rowData[header.indexOf('Nombre')]           || '';
    const ref      = rowData[header.indexOf('Referencia')]       || '';
    const subtotal = Number(rowData[header.indexOf('Subtotal_COP')])       || 0;
    const total    = Number(rowData[header.indexOf('Total_COP')])           || 0;
    const pct      = Number(rowData[header.indexOf('Pct_Pagado')])          || 100;
    const saldoPendiente = Number(rowData[header.indexOf('Saldo_Pendiente_COP')]) || 0;
    const productos = _parseJSON(rowData[header.indexOf('Productos_JSON')]);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      _log('emailNotificarEstado_SKIP', ref, 'invalid email: ' + email);
      return;
    }

    const EMOJIS = {
      'EN_PRODUCCION'      : '🏺',
      'EN_TRANSITO'        : '✈️',
      'EN_NACIONALIZACION' : '🛃',
      'LISTO_DESPACHO'     : '📦',
      'DISPONIBLE_TIENDA'  : '🏪',
      'DESPACHADO'         : '🚚',
    };
    const TITULOS = {
      'EN_PRODUCCION'      : '¡Tu pedido está en manos de los artistas!',
      'EN_TRANSITO'        : '¡Tu pedido está en camino desde Italia!',
      'EN_NACIONALIZACION' : '¡Tu pedido llegó a Colombia!',
      'LISTO_DESPACHO'     : '¡Tu pedido está listo para despacharse!',
      'DISPONIBLE_TIENDA'  : '¡Tu pedido te espera en tienda!',
      'DESPACHADO'         : '¡Tu pedido está en camino a tu puerta!',
    };
    const MENSAJES = {
      'EN_PRODUCCION'      : 'Los artistas de Imola, Italia, están creando con dedicación cada pieza de tu pedido. ¡Con tanto amor puesto en cada detalle, el resultado será precioso!',
      'EN_TRANSITO'        : '¡Qué emoción! Tus piezas han salido de Italia y están viajando hacia ti. Pronto las tendrás en casa.',
      'EN_NACIONALIZACION' : 'Tu pedido ha llegado a Colombia y está en proceso de nacionalización en aduana. ¡Ya falta muy poco para que llegue a tus manos!',
      'LISTO_DESPACHO'     : '¡Buenas noticias! Tu pedido está empacado y listo para salir. En breve recibirás la información de seguimiento.',
      'DISPONIBLE_TIENDA'  : '¡Tu pedido está listo y te espera en nuestra tienda en Bogotá! Puedes pasar a recogerlo cuando gustes.',
      'DESPACHADO'         : 'Tu pedido ha sido despachado y está en camino a tu dirección. ¡Muy pronto podrás disfrutar de tus piezas!',
    };

    const emoji  = EMOJIS[estado]  || '📋';
    const titulo = TITULOS[estado] || 'Actualización de tu pedido';
    const msg    = MENSAJES[estado] || 'El estado de tu pedido ha sido actualizado: ' + estado;

    const subject = `${emoji} ${CFG.NOMBRE_TIENDA} — ${titulo} · Pedido ${ref}`;

    const tablaProductos = _productosHTML(productos);

    // ── Resumen de valores ──────────────────────────────────
    const subtotalMostrar = _roundCOP(subtotal || total);
    const pagadoLabel     = pct === 60 ? 'Total pagado (60%)' : 'Total pagado';
    const resumenHTML = subtotalMostrar > 0 ? `
      <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#f8f5ee;border-radius:6px">
        <tr>
          <td style="padding:8px 8px 5px;font-size:13px;color:#555">Subtotal</td>
          <td style="padding:8px 8px 5px;font-size:13px;text-align:right">${_fmtCOP(subtotalMostrar)}</td>
        </tr>
        <tr style="border-top:2px solid #C4A05A">
          <td style="padding:8px 8px 5px;font-size:14px;font-weight:bold;color:#1a1610">${pagadoLabel}</td>
          <td style="padding:8px 8px 5px;font-size:14px;font-weight:bold;text-align:right;color:#C4A05A">${_fmtCOP(total)}</td>
        </tr>
        ${saldoPendiente > 0 ? `
        <tr>
          <td style="padding:5px 8px 8px;font-size:13px;color:#555">Saldo pendiente</td>
          <td style="padding:5px 8px 8px;font-size:13px;text-align:right;color:#555">${_fmtCOP(saldoPendiente)}</td>
        </tr>` : ''}
      </table>` : '';

    // ── Aviso saldo pendiente ───────────────────────────────
    const saldoAvisoHTML = saldoPendiente > 0 ? `
      <div style="background:#fff8e6;border-left:4px solid #C4A05A;padding:14px 18px;border-radius:4px;margin:16px 0">
        <p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:#7a5c00">Saldo pendiente (40%): ${_fmtCOP(saldoPendiente)}</p>
        <p style="margin:0;font-size:13px;color:#555">
          Te avisaremos cuando tu pedido esté en tránsito desde Italia, con tiempo suficiente
          para completar el pago sin incurrir en sobrecostos o penalidades.
        </p>
      </div>` : '';

    const body = _emailWrapper(nombre, `
      <p style="font-size:16px;font-weight:bold;color:#1a1610">${titulo}</p>
      <p>${msg}</p>
      <p style="font-size:13px;color:#888">Referencia: <strong>${ref}</strong></p>
      ${tablaProductos}
      ${resumenHTML}
      ${saldoAvisoHTML}
      <p style="font-size:13px;color:#666;margin-top:20px">
        Te mantendremos informada sobre el estado de tu pedido en cada etapa del proceso.<br>
        Si tienes alguna pregunta, escríbenos por
        <a href="https://wa.me/${CFG.WHATSAPP}" style="color:#C4A05A">WhatsApp</a>, con mucho gusto te atendemos.
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

// Email automático al influencer cuando un pedido con su código queda APPROVED.
// inflCodigo: string código del influencer.
// opts: { clienteNombre, ref, prods, subtotal }
function _emailInfluencerVenta(inflCodigo, opts) {
  if (!inflCodigo) return;
  try {
    const infl = _getInfluencer(inflCodigo);
    if (!infl.valid || !infl.email) return;

    const inflEmail   = infl.email;
    const inflNombre  = (infl.nombre || '').split(' ')[0] || infl.nombre || 'influencer';
    const comisionPct = Number(infl.comisionPct) || 0;
    const subtotal    = Number(opts.subtotal) || 0;
    const comision    = comisionPct > 0
      ? Math.floor(subtotal * comisionPct / 100 / 1000) * 1000
      : 0;
    const clientePrimerNombre = (String(opts.clienteNombre || '').split(' ')[0]) || 'Un cliente';
    const ref         = opts.ref || '';
    const prods       = opts.prods || [];

    // Acumular comisión en la hoja Influencers para liquidación mensual
    if (comision > 0) _acumularComisionInfluencer(inflCodigo, comision);

    const comisionHTML = comision > 0 ? `
      <div style="background:#1a1610;border-radius:8px;padding:18px 22px;margin:20px 0;text-align:center">
        <p style="color:#C4A05A;font-size:10px;letter-spacing:2px;margin:0 0 6px;text-transform:uppercase">Tu comisión estimada por esta venta</p>
        <p style="color:#fff;font-size:30px;font-weight:bold;margin:0;letter-spacing:1px">${_fmtCOP(comision)}</p>
        <p style="color:#aaa;font-size:12px;margin:6px 0 0">${comisionPct}% sobre ${_fmtCOP(subtotal)}</p>
      </div>` : '';

    const body = _emailWrapper(inflNombre, `
      <p>¡Enhorabuena! <strong>${clientePrimerNombre}</strong> acaba de confirmar una compra usando tu código <strong style="background:#f5f0e8;padding:2px 8px;border-radius:4px;font-family:monospace;letter-spacing:1px">${inflCodigo}</strong>. 🛍️✨</p>
      ${comisionHTML}
      <p style="font-weight:bold;margin:18px 0 8px;font-size:14px">Productos del pedido:</p>
      ${_productosHTML(prods)}
      <table width="100%" style="border-collapse:collapse;margin:10px 0 0;font-size:13px">
        <tr>
          <td style="padding:5px 8px;color:#555">Subtotal del pedido</td>
          <td style="padding:5px 8px;text-align:right;font-weight:bold">${_fmtCOP(subtotal)}</td>
        </tr>
        <tr>
          <td style="padding:5px 8px;color:#555">Referencia</td>
          <td style="padding:5px 8px;text-align:right;color:#888;font-family:monospace;font-size:12px">${ref}</td>
        </tr>
      </table>
      <p style="margin:20px 0 6px;font-size:13px;color:#555;font-style:italic">La comisión se liquidará según los términos acordados. Para cualquier consulta escríbenos a <a href="mailto:${CFG.EMAIL_ADMIN}" style="color:#C4A05A">${CFG.EMAIL_ADMIN}</a>.</p>
      <p style="font-size:14px;margin:12px 0 0">¡Gracias por llevar IMOLARTE a tu comunidad! Cada recomendación tuya pone cerámica italiana única en nuevas mesas. 🏺</p>
    `);

    GmailApp.sendEmail(inflEmail, `🛍️ ¡Nueva venta con tu código ${inflCodigo}! — ${CFG.NOMBRE_TIENDA}`, '', { htmlBody: body });
    _log('emailInfluencerVenta', inflCodigo, inflEmail, ref);
  } catch(err) {
    _log('emailInfluencerVenta_ERROR', String(err.message), inflCodigo);
  }
}

function _emailWrapper(nombre, contenido) {
  const saludo = (nombre || '').trim() || 'estimada clienta';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>
<div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#1a1610">
  <div style="background:#1a1610;padding:28px 32px;border-radius:8px 8px 0 0">
    <h1 style="color:#C4A05A;font-size:22px;margin:0;letter-spacing:2px">HELENA CABALLERO</h1>
    <p style="color:#f5f0e8;font-size:13px;margin:6px 0 0">Cerámica artística italiana</p>
  </div>
  <div style="background:#faf8f4;padding:28px 32px;border:1px solid #e8e0d0;border-top:none">
    <p style="font-size:16px">Hola <strong>${saludo}</strong>,</p>
    ${contenido}
  </div>
  <div style="background:#1a1610;padding:12px 32px;border-radius:0 0 8px 8px;text-align:center">
    <p style="color:#888;font-size:11px;margin:0">
      &copy; ${new Date().getFullYear()} Helena Caballero &mdash; Imolarte &middot; Bogot&aacute;
    </p>
  </div>
</div>
</body></html>`;
}

// ============================================================
// SETUP
// ============================================================

function setupSheets() {
  const HEADERS = {
    [CFG.SHEETS.WISHLIST]: [
      'Campaña_ID','Catalogo_ID','Timestamp','Referencia','ClienteID',
      'Nombre','Apellido','Email','Teléfono',
      'Tipo_Doc','Num_Doc',
      'Dirección_Wishlist','Barrio_Wishlist','Ciudad_Wishlist','Notas',
      'Productos_JSON','Total_COP','Estado_Wishlist','Notas_internas',
    ],
    [CFG.SHEETS.PEDIDOS_WOMPI]: [
      'Campaña_ID','Catalogo_ID','Timestamp','Referencia',
      'Wompi_Transaction_ID','Estado_Pago_Wompi',
      'ClienteID','Nombre','Apellido','Email','Teléfono',
      'Tipo_Doc','Num_Doc',
      'Dirección','Barrio','Ciudad','Notas_entrega',
      'Productos_JSON','Subtotal_COP',
      'Descuento_Influencer_COP','Descuento_GiftCard_COP','Total_a_Pagar_COP',
      'Porcentaje_Pagado','Forma_Pago','Saldo_Pendiente_COP',
      'Estado_Pedido','Fecha_Despacho','Notas_Internas',
      'Comision_Pct_Influencer','Influencer_Nombre','Influencer_Apellido','Influencer_Codigo',
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
    [CFG.SHEETS.INFLUENCERS]: [
      'Influencer_ID','Código','Nombre','Apellido','Email','Teléfono',
      'Descuento_Pct','Comision_Pct',
      'Estado','Fecha_Registro','Notas_internas',
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

// Reescribe los headers T-AF de Pedidos_Wompi al nuevo esquema v21.3.
// Ejecutar UNA VEZ desde Apps Script: Ejecutar → migrarColumnasDescuento
// ⚠ Sobreescribe los headers de columna T en adelante; los datos existentes
//   en esas celdas quedan como histórico — no se borran.
function migrarColumnasDescuento() {
  const sheet  = _getSheet(CFG.SHEETS.PEDIDOS_WOMPI);
  const colS   = 19; // columna S (1-based) = Subtotal_COP — invariante

  // Nuevos headers T→AF (columnas 20-32)
  const nuevosHeaders = [
    'Descuento_Influencer_COP',   // T  col 20
    'Descuento_GiftCard_COP',     // U  col 21
    'Total_a_Pagar_COP',          // V  col 22
    'Porcentaje_Pagado',          // W  col 23
    'Forma_Pago',                 // X  col 24
    'Saldo_Pendiente_COP',        // Y  col 25
    'Estado_Pedido',              // Z  col 26
    'Fecha_Despacho',             // AA col 27
    'Notas_Internas',             // AB col 28
    'Comision_Pct_Influencer',    // AC col 29
    'Influencer_Nombre',          // AD col 30
    'Influencer_Apellido',        // AE col 31
    'Influencer_Codigo',          // AF col 32
  ];

  const startCol = colS + 1; // columna T = 20
  nuevosHeaders.forEach((h, i) => {
    const col = startCol + i;
    sheet.getRange(1, col).setValue(h).setFontWeight('bold');
    Logger.log('Header escrito: ' + h + ' → col ' + col);
  });

  // Asegurar que la hoja tenga al menos 32 columnas
  if (sheet.getMaxColumns() < 32) sheet.insertColumnsAfter(sheet.getMaxColumns(), 32 - sheet.getMaxColumns());

  // Agregar columnas de totalizadores a Influencers si no existen
  const inflSheet = _getSheet(CFG.SHEETS.INFLUENCERS);
  const inflH = inflSheet.getRange(1, 1, 1, inflSheet.getLastColumn()).getValues()[0];
  ['Comision_Total_Historica_COP', 'Comision_Mes_Corriente_COP'].forEach(col => {
    if (inflH.indexOf(col) < 0) {
      const nextCol = inflSheet.getLastColumn() + 1;
      inflSheet.getRange(1, nextCol).setValue(col).setFontWeight('bold');
      Logger.log('Influencers: ' + col + ' agregada → col ' + nextCol);
    }
  });

  SpreadsheetApp.flush();
  Logger.log('✅ migrarColumnasDescuento v21.4 completado');
}

// Crea la hoja Influencers con sus cabeceras y formato si no existe.
// Ejecutar UNA VEZ desde el editor de Apps Script: Ejecutar → setupInfluencers
function setupInfluencers() {
  const ss      = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
  const nombre  = CFG.SHEETS.INFLUENCERS;
  const headers = [
    'Influencer_ID','Código','Nombre','Apellido','Email','Teléfono',
    'Descuento_Pct','Comision_Pct',
    'Estado','Fecha_Registro','Notas_internas','Comision_Acumulada_COP','Comision_Total_Historica_COP',
    'Comision_Mes_Corriente_COP',
  ];

  let sheet = ss.getSheetByName(nombre);
  if (!sheet) {
    sheet = ss.insertSheet(nombre);
    Logger.log('✅ Hoja creada: ' + nombre);
  } else {
    Logger.log('ℹ️ La hoja ya existe: ' + nombre);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    const hdrRange = sheet.getRange(1, 1, 1, headers.length);
    hdrRange.setBackground('#1a1610').setFontColor('#C4A05A').setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);

    // Dropdown Estado: ACTIVO / INACTIVO
    const estadoCol  = headers.indexOf('Estado') + 1;
    const estadoRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['ACTIVO', 'INACTIVO'], true).build();
    sheet.getRange(2, estadoCol, 500, 1).setDataValidation(estadoRule);

    Logger.log('✅ Cabeceras escritas en ' + nombre);
  } else {
    Logger.log('ℹ️ La hoja ya tiene datos — cabeceras no modificadas');
  }

  Logger.log('✅ setupInfluencers completado');
}

// Agrega columnas Influencer_Código y Base_Comision_COP al final de Pedidos_Wompi existente.
// Ejecutar UNA VEZ tras desplegar v20.15.
function repairPedidosWompiAddInfluencer() {
  const ss     = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
  const sheet  = ss.getSheetByName(CFG.SHEETS.PEDIDOS_WOMPI);
  if (!sheet) { Logger.log('❌ Hoja Pedidos_Wompi no encontrada'); return; }
  const lastCol  = sheet.getLastColumn();
  const existing = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const toAdd    = ['Influencer_Código', 'Base_Comision_COP'].filter(h => !existing.includes(h));
  if (toAdd.length === 0) { Logger.log('ℹ️ Columnas de influencer ya existen'); return; }
  toAdd.forEach((h, i) => {
    const col = lastCol + i + 1;
    const cell = sheet.getRange(1, col);
    cell.setValue(h)
        .setBackground('#1a1610').setFontColor('#C4A05A').setFontWeight('bold');
  });
  sheet.autoResizeColumns(lastCol + 1, toAdd.length);
  Logger.log('✅ Columnas influencer agregadas a Pedidos_Wompi: ' + toAdd.join(', '));
}

// Repara cabeceras de Pedidos_Wompi sin borrar datos.
// Ejecutar UNA VEZ si la hoja fue creada antes de que se agregara Catalogo_ID.
function repairPedidosWompiHeaders() {
  const ss      = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
  const sheet   = ss.getSheetByName(CFG.SHEETS.PEDIDOS_WOMPI);
  if (!sheet) { Logger.log('❌ Hoja no encontrada'); return; }
  const headers = [
    'Campaña_ID','Catalogo_ID','Timestamp','Referencia',
    'Wompi_Transaction_ID','Estado_Pago_Wompi',
    'ClienteID','Nombre','Apellido','Email','Teléfono',
    'Tipo_Doc','Num_Doc',
    'Dirección','Barrio','Ciudad','Notas_entrega',
    'Productos_JSON','Subtotal_COP','Descuento_COP',
    'Total_COP','Pct_Pagado','Forma_pago','Saldo_Pendiente_COP',
    'Estado_Pedido','Fecha_despacho','Notas_internas','SIIGO_Factura_ID',
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    .setBackground('#1a1610').setFontColor('#C4A05A').setFontWeight('bold');
  Logger.log('✅ Cabeceras Pedidos_Wompi reparadas');
}

// Repara cabeceras de Wishlist sin borrar datos.
// Ejecutar UNA VEZ si la hoja fue creada antes de que se agregara Catalogo_ID.
function repairWishlistHeaders() {
  const ss      = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
  const sheet   = ss.getSheetByName(CFG.SHEETS.WISHLIST);
  if (!sheet) { Logger.log('❌ Hoja no encontrada'); return; }
  const headers = [
    'Campaña_ID','Catalogo_ID','Timestamp','Referencia','ClienteID',
    'Nombre','Apellido','Email','Teléfono',
    'Tipo_Doc','Num_Doc',
    'Dirección_Wishlist','Barrio_Wishlist','Ciudad_Wishlist','Notas',
    'Productos_JSON','Total_COP','Estado_Wishlist','Notas_internas',
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    .setBackground('#1a1610').setFontColor('#C4A05A').setFontWeight('bold');
  Logger.log('✅ Cabeceras Wishlist reparadas');
}

// ============================================================
// DROPDOWNS
// ============================================================

function setupDropdowns() {
  const ss = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);

  // Limpiar TODAS las validaciones existentes antes de reaplicar
  // Evita acumulación de reglas en columnas incorrectas por ejecuciones previas
  [CFG.SHEETS.PEDIDOS_WOMPI, CFG.SHEETS.WISHLIST, CFG.SHEETS.CAMPANIAS, CFG.SHEETS.GIFT_CARDS].forEach(nombre => {
    const sheet = ss.getSheetByName(nombre);
    if (!sheet) return;
    const lastCol = sheet.getLastColumn() || 30;
    sheet.getRange(2, 1, 50, lastCol).clearDataValidations();
  });

  _applyDropdown(ss, CFG.SHEETS.PEDIDOS_WOMPI, 'Estado_Pedido',   ESTADOS_PEDIDO);
  _applyDropdown(ss, CFG.SHEETS.PEDIDOS_WOMPI, 'Pct_Pagado',      ['60', '100']);
  _applyDropdown(ss, CFG.SHEETS.WISHLIST,       'Estado_Wishlist', ESTADOS_WISHLIST);
  _applyDropdown(ss, CFG.SHEETS.CAMPANIAS,      'Estado',         ['ACTIVA','CERRADA','PAUSADA']);
  _applyDropdown(ss, CFG.SHEETS.GIFT_CARDS,     'Estado_Gift',    ['ACTIVA','INACTIVA','CANCELADA']);

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
    ['Campaña_ID','Catalogo_ID','Timestamp','Referencia','Wompi_Transaction_ID',
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

// ============================================================
// MONITOREO — resumen diario de transacciones huérfanas
// ============================================================

/**
 * Escanea Wishlists, Pedidos_Wompi y GiftCards buscando filas pendientes/huérfanas,
 * y detecta cumpleaños del día. Envía resumen al admin a las 6am.
 * Para crear el trigger una sola vez: ejecutar setupTriggerResumenDiario()
 */
function emailResumenHuerfanos() {
  const ahora    = new Date();
  const fechaStr = Utilities.formatDate(ahora, 'America/Bogota', 'dd/MM/yyyy HH:mm');
  const hoyDia   = parseInt(Utilities.formatDate(ahora, 'America/Bogota', 'd'),  10);
  const hoyMes   = parseInt(Utilities.formatDate(ahora, 'America/Bogota', 'M'),  10);
  const esLunes  = Utilities.formatDate(ahora, 'America/Bogota', 'u') === '1'; // lunes = día 1 en ISO
  const urlSheet = 'https://docs.google.com/spreadsheets/d/' + CFG.SPREADSHEET_ID;

  function _tdStyle(extra) { return `style="padding:7px 10px;border-bottom:1px solid #e8e0d0;font-size:12px;${extra || ''}`; }
  function _thStyle(extra) { return `style="padding:7px 10px;font-size:11px;text-align:left;background:#f0ece4;color:#555;${extra || ''}`; }
  function _fmtTs(ts) { return ts instanceof Date ? Utilities.formatDate(ts, 'America/Bogota', 'dd/MM/yyyy HH:mm') : String(ts || '—'); }

  // ── Wishlists PENDIENTE ──────────────────────────────────
  const waSheet  = _getSheet(CFG.SHEETS.WISHLIST);
  const waData   = waSheet.getDataRange().getValues();
  const waH      = waData[0];
  const waColRef = waH.indexOf('Referencia');
  const waColTs  = waH.indexOf('Timestamp');
  const waColNom = waH.indexOf('Nombre');
  const waColApe = waH.indexOf('Apellido');
  const waColEml = waH.indexOf('Email');
  const waColTot = waH.indexOf('Total_COP');
  const waColEst = waH.indexOf('Estado_Wishlist');

  const waPendientes = [];
  for (let i = 1; i < waData.length; i++) {
    if (String(waData[i][waColEst] || '') !== 'PENDIENTE') continue;
    waPendientes.push({
      ref:    waData[i][waColRef] || '—',
      nombre: [waData[i][waColNom], waData[i][waColApe]].filter(Boolean).join(' ') || '—',
      email:  waData[i][waColEml] || '—',
      total:  waData[i][waColTot] || 0,
      fecha:  _fmtTs(waData[i][waColTs]),
    });
  }

  // ── Pedidos_Wompi pendientes ─────────────────────────────
  const pwSheet  = _getSheet(CFG.SHEETS.PEDIDOS_WOMPI);
  const pwData   = pwSheet.getDataRange().getValues();
  const pwH      = pwData[0];
  const pwColRef = pwH.indexOf('Referencia');
  const pwColEst = pwH.indexOf('Estado_Pago_Wompi');
  const pwColTs  = pwH.indexOf('Timestamp');
  const pwColNom = pwH.indexOf('Nombre');
  const pwColApe = pwH.indexOf('Apellido');
  const pwColEml = pwH.indexOf('Email');
  const pwColTot = pwH.indexOf('Total_COP');

  const pwHuerfanos = [];
  for (let i = 1; i < pwData.length; i++) {
    const est = String(pwData[i][pwColEst] || '');
    if (!est || est === 'APPROVED' || est === 'DECLINED' || est === 'ERROR' || est === 'CANCELADO') continue;
    pwHuerfanos.push({
      ref:    pwData[i][pwColRef] || '—',
      nombre: [pwData[i][pwColNom], pwData[i][pwColApe]].filter(Boolean).join(' ') || '—',
      email:  pwData[i][pwColEml] || '—',
      total:  pwData[i][pwColTot] || 0,
      estado: est,
      fecha:  _fmtTs(pwData[i][pwColTs]),
    });
  }

  // ── GiftCards INACTIVA + Huérfanas (Estado_Pago PENDIENTE) ─
  const gcSheet  = _getSheet(CFG.SHEETS.GIFT_CARDS);
  const gcData   = gcSheet.getDataRange().getValues();
  const gcH      = gcData[0];
  const gcColRef = gcH.indexOf('Referencia');
  const gcColCod = gcH.indexOf('Código_Gift');
  const gcColVal = gcH.indexOf('Saldo_Gift_COP');
  const gcColTs  = gcH.indexOf('Timestamp');
  const gcColEst = gcH.indexOf('Estado_Gift');
  const gcColPag = gcH.indexOf('Estado_Pago');
  const gcColEmi = gcH.indexOf('Emisor_Email');
  const gcColNom = gcH.indexOf('Emisor_Nombre');
  const gcColApe = gcH.indexOf('Emisor_Apellido');

  const gcHuerfanas = [];   // Estado_Pago = PENDIENTE
  const gcInactivas = [];   // Estado_Gift = INACTIVA
  for (let i = 1; i < gcData.length; i++) {
    const row = gcData[i];
    const entry = {
      ref:    row[gcColRef] || '—',
      codigo: row[gcColCod] || '—',
      valor:  row[gcColVal] || 0,
      emisor: [row[gcColNom], row[gcColApe]].filter(Boolean).join(' ') || '—',
      email:  row[gcColEmi] || '—',
      fecha:  _fmtTs(row[gcColTs]),
    };
    if (String(row[gcColPag] || '') === 'PENDIENTE') gcHuerfanas.push(entry);
    if (String(row[gcColEst] || '') === 'INACTIVA')  gcInactivas.push(entry);
  }

  // ── Cumpleaños de hoy ────────────────────────────────────
  const cliSheet  = _getSheet(CFG.SHEETS.CLIENTES);
  const cliData   = cliSheet.getDataRange().getValues();
  const cliH      = cliData[0];
  const cliColNom = cliH.indexOf('Nombre');
  const cliColApe = cliH.indexOf('Apellido');
  const cliColEml = cliH.indexOf('Email');
  const cliColTel = cliH.indexOf('Teléfono');
  const cliColDia = cliH.indexOf('Cumple_Día');
  const cliColMes = cliH.indexOf('Cumple_Mes');
  const cliColTot = cliH.indexOf('Total_histórico_COP');

  const cumpleHoy = [];
  for (let i = 1; i < cliData.length; i++) {
    const dia = parseInt(cliData[i][cliColDia] || 0, 10);
    const mes = parseInt(cliData[i][cliColMes] || 0, 10);
    if (!dia || !mes || dia !== hoyDia || mes !== hoyMes) continue;
    cumpleHoy.push({
      nombre: [cliData[i][cliColNom], cliData[i][cliColApe]].filter(Boolean).join(' ') || '—',
      email:  cliData[i][cliColEml] || '—',
      tel:    cliData[i][cliColTel] || '—',
      total:  cliData[i][cliColTot] || 0,
    });
  }

  // ── Construir tablas HTML ────────────────────────────────
  let cumpleTabla = '';
  if (cumpleHoy.length) {
    const filas = cumpleHoy.map(r => `
      <tr>
        <td ${_tdStyle('font-weight:bold')}>${r.nombre}</td>
        <td ${_tdStyle('color:#888')}>${r.email}</td>
        <td ${_tdStyle('')}>${r.tel}</td>
        <td ${_tdStyle('text-align:right')}>${_fmtCOP(r.total)}</td>
      </tr>`).join('');
    cumpleTabla = `
      <h3 style="color:#27ae60;margin:24px 0 8px;font-size:14px">
        🎂 Cumpleaños de hoy — ${cumpleHoy.length} cliente(s)
      </h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <thead><tr>
          <th ${_thStyle('')}>Cliente</th>
          <th ${_thStyle('')}>Email</th>
          <th ${_thStyle('')}>Teléfono</th>
          <th ${_thStyle('text-align:right')}>Histórico COP</th>
        </tr></thead>
        <tbody>${filas}</tbody>
      </table>`;
  }

  let waTabla = '';
  if (waPendientes.length) {
    const filas = waPendientes.map(r => `
      <tr>
        <td ${_tdStyle('')}>${r.fecha}</td>
        <td ${_tdStyle('')}>${r.ref}</td>
        <td ${_tdStyle('')}>${r.nombre}</td>
        <td ${_tdStyle('text-align:right')}>${_fmtCOP(r.total)}</td>
        <td ${_tdStyle('color:#888')}>${r.email}</td>
      </tr>`).join('');
    waTabla = `
      <h3 style="color:#8e44ad;margin:24px 0 8px;font-size:14px">
        📋 Wishlists PENDIENTES — ${waPendientes.length} fila(s)
      </h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <thead><tr>
          <th ${_thStyle('')}>Fecha</th>
          <th ${_thStyle('')}>Referencia</th>
          <th ${_thStyle('')}>Cliente</th>
          <th ${_thStyle('text-align:right')}>Total</th>
          <th ${_thStyle('')}>Email</th>
        </tr></thead>
        <tbody>${filas}</tbody>
      </table>`;
  }

  let pwTabla = '';
  if (pwHuerfanos.length) {
    const filas = pwHuerfanos.map(r => `
      <tr>
        <td ${_tdStyle('')}>${r.fecha}</td>
        <td ${_tdStyle('')}>${r.ref}</td>
        <td ${_tdStyle('')}>${r.nombre}</td>
        <td ${_tdStyle('text-align:right')}>${_fmtCOP(r.total)}</td>
        <td ${_tdStyle('color:#e67e22')}>${r.estado}</td>
        <td ${_tdStyle('color:#888')}>${r.email}</td>
      </tr>`).join('');
    pwTabla = `
      <h3 style="color:#e67e22;margin:24px 0 8px;font-size:14px">
        🛒 Pedidos Wompi pendientes — ${pwHuerfanos.length} fila(s)
      </h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <thead><tr>
          <th ${_thStyle('')}>Fecha</th>
          <th ${_thStyle('')}>Referencia</th>
          <th ${_thStyle('')}>Cliente</th>
          <th ${_thStyle('text-align:right')}>Total</th>
          <th ${_thStyle('')}>Estado</th>
          <th ${_thStyle('')}>Email</th>
        </tr></thead>
        <tbody>${filas}</tbody>
      </table>`;
  }

  function _gcFilas(rows) {
    return rows.map(r => `
      <tr>
        <td ${_tdStyle('')}>${r.fecha}</td>
        <td ${_tdStyle('')}>${r.ref}</td>
        <td ${_tdStyle('font-family:monospace;letter-spacing:2px;color:#C4A05A')}>${r.codigo}</td>
        <td ${_tdStyle('text-align:right')}>${_fmtCOP(r.valor)}</td>
        <td ${_tdStyle('')}>${r.emisor}</td>
        <td ${_tdStyle('color:#888')}>${r.email}</td>
      </tr>`).join('');
  }
  function _gcTable(titulo, color, emoji, rows) {
    return `
      <h3 style="color:${color};margin:24px 0 8px;font-size:14px">
        ${emoji} ${titulo} — ${rows.length} fila(s)
      </h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <thead><tr>
          <th ${_thStyle('')}>Fecha</th>
          <th ${_thStyle('')}>Referencia</th>
          <th ${_thStyle('')}>Código</th>
          <th ${_thStyle('text-align:right')}>Valor</th>
          <th ${_thStyle('')}>Emisor</th>
          <th ${_thStyle('')}>Email</th>
        </tr></thead>
        <tbody>${_gcFilas(rows)}</tbody>
      </table>`;
  }

  const gcHuerfanasTabla = gcHuerfanas.length
    ? _gcTable('Gift Cards Huérfanas (pago PENDIENTE)', '#d35400', '👻', gcHuerfanas)
    : '';
  const gcInactivasTabla = gcInactivas.length
    ? _gcTable('Gift Cards INACTIVAS', '#c0392b', '🎁', gcInactivas)
    : '';

  const totalAlerts = waPendientes.length + pwHuerfanos.length + gcHuerfanas.length + gcInactivas.length;
  const hayAlgo     = totalAlerts > 0 || cumpleHoy.length > 0;

  // ── Sección influencers (solo lunes) ─────────────────────
  // ── Sección influencers — se muestra diariamente ─────────
  let influencerSeccion = '';
  try {
    const inflSheet  = _getSheet(CFG.SHEETS.INFLUENCERS);
    const inflData   = inflSheet.getDataRange().getValues();
    const inflH      = inflData[0];
    const iCod  = inflH.indexOf('Código');
    const iNom  = inflH.indexOf('Nombre');
    const iApe  = inflH.indexOf('Apellido');
    const iEst  = inflH.indexOf('Estado');
    const iAcum = inflH.indexOf('Comision_Acumulada_COP');
    const iCPct = inflH.indexOf('Comision_Pct');
    const iDPct = inflH.indexOf('Descuento_Pct');
    const activos = [];
    for (let i = 1; i < inflData.length; i++) {
      if (String(inflData[i][iEst] || '').trim() !== 'ACTIVO') continue;
      activos.push({
        codigo: String(inflData[i][iCod]  || '').trim(),
        nombre: [String(inflData[i][iNom] || ''), String(inflData[i][iApe] || '')].filter(Boolean).join(' '),
        comPct: Number(inflData[i][iCPct]) || 0,
        dscPct: Number(iDPct >= 0 ? inflData[i][iDPct] : 0) || 0,
        acum:   Number(inflData[i][iAcum]) || 0,
      });
    }
    if (activos.length > 0) {
      const filas = activos.map(inf => {
        const color = inf.acum >= 100000 ? '#27ae60' : (inf.acum > 0 ? '#e67e22' : '#999');
        return `<tr>
          <td ${_tdStyle('')}>${inf.nombre || '—'}</td>
          <td ${_tdStyle('font-family:monospace')}>${inf.codigo}</td>
          <td ${_tdStyle('text-align:center')}>${inf.dscPct}%</td>
          <td ${_tdStyle('text-align:center')}>${inf.comPct}%</td>
          <td ${_tdStyle('text-align:right;font-weight:bold;color:' + color)}>${_fmtCOP(inf.acum)}</td>
        </tr>`;
      }).join('');
      influencerSeccion = `
        <h3 style="color:#8e44ad;margin:24px 0 8px;font-size:14px">📊 Influencers activos</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
          <thead><tr>
            <th ${_thStyle('')}>Nombre</th>
            <th ${_thStyle('')}>Código</th>
            <th ${_thStyle('text-align:center')}>Dcto.%</th>
            <th ${_thStyle('text-align:center')}>Comisión%</th>
            <th ${_thStyle('text-align:right')}>Acumulado mes</th>
          </tr></thead>
          <tbody>${filas}</tbody>
        </table>
        <p style="font-size:11px;color:#888;margin:0">
          🟢 ≥ $100.000 (pago el día 1) · 🟠 en progreso · Meta mínima: $100.000
        </p>`;
    }
  } catch(e) { _log('emailResumenHuerfanos_inflSeccion_ERROR', e.message); }

  const cuerpo = !hayAlgo
    ? `<p style="color:#27ae60;font-size:15px;font-weight:bold">✅ Todo limpio — no hay pendientes ni cumpleaños hoy.</p>${influencerSeccion}`
    : `${waTabla}${cumpleTabla}${pwTabla}${gcHuerfanasTabla}${gcInactivasTabla}${influencerSeccion}
       <p style="margin:16px 0 0;font-size:12px;color:#888">
         ${totalAlerts > 0 ? `Alertas: <strong>${totalAlerts}</strong> pendiente(s) · ` : ''}
         <a href="${urlSheet}" style="color:#C4A05A">Ver Spreadsheet</a>
       </p>`;

  const asunto = cumpleHoy.length > 0 && totalAlerts === 0
    ? `[IMOLARTE] 🎂 ${cumpleHoy.length} cumpleaños hoy — ${fechaStr}`
    : totalAlerts === 0
    ? `[IMOLARTE] ✅ Sin pendientes — ${fechaStr}`
    : cumpleHoy.length > 0
    ? `[IMOLARTE] 🎂 ${cumpleHoy.length} cumpleaños · ⚠️ ${totalAlerts} pendiente(s) — ${fechaStr}`
    : `[IMOLARTE] ⚠️ ${totalAlerts} pendiente(s) — ${fechaStr}`;

  const html = `
<div style="font-family:Georgia,serif;max-width:680px;margin:auto;color:#1a1610">
  <div style="background:#1a1610;padding:20px 28px;border-radius:8px 8px 0 0">
    <h1 style="color:#C4A05A;font-size:18px;margin:0;letter-spacing:2px">HELENA CABALLERO</h1>
    <p style="color:#f5f0e8;font-size:12px;margin:4px 0 0">Monitoreo diario · ${fechaStr} (Bogotá)</p>
  </div>
  <div style="background:#faf8f4;padding:24px 28px;border:1px solid #e8e0d0;border-top:none">
    <p style="margin:0 0 16px;font-size:14px">Hola <strong>Filippo</strong>, este es el resumen automático de hoy:</p>
    ${cuerpo}
  </div>
  <div style="background:#1a1610;padding:10px 28px;border-radius:0 0 8px 8px;text-align:center">
    <p style="color:#888;font-size:10px;margin:0">
      Generado automáticamente · IMOLARTE v20.13 · <a href="${urlSheet}" style="color:#C4A05A">Abrir Sheets</a>
    </p>
  </div>
</div>`;

  GmailApp.sendEmail(CFG.EMAIL_ADMIN, asunto, '', { htmlBody: html });
  _log('emailResumenHuerfanos',
    'wa:' + waPendientes.length,
    'pw:' + pwHuerfanos.length,
    'gcHuerfanas:' + gcHuerfanas.length,
    'gcInactivas:' + gcInactivas.length,
    'cumple:' + cumpleHoy.length);
}

/**
 * Crea el trigger diario a las 6am hora Bogotá.
 * Ejecutar UNA SOLA VEZ desde Apps Script UI → Ejecutar → setupTriggerResumenDiario
 * Verificar en Triggers (reloj) que quedó registrado.
 */
function setupTriggerResumenDiario() {
  // Eliminar triggers previos con el mismo nombre para evitar duplicados
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'emailResumenHuerfanos')
    .forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('emailResumenHuerfanos')
    .timeBased()
    .atHour(6)
    .everyDays(1)
    .inTimezone('America/Bogota')
    .create();

  Logger.log('✅ Trigger diario 6am creado para emailResumenHuerfanos');
}

// ============================================================
// INFLUENCERS — ACUMULACIÓN Y LIQUIDACIÓN DE COMISIONES v20.17
// ============================================================

/** Cuota mínima COP para generar pago vía Gift Card */
const CUOTA_MIN_INFLUENCER = 100000;

/**
 * Suma 'monto' al acumulador Comision_Acumulada_COP del influencer indicado.
 * Llamado automáticamente desde _emailInfluencerVenta en cada APPROVED.
 */
function _acumularComisionInfluencer(codigo, monto) {
  if (!codigo || !monto || monto <= 0) return;
  try {
    const sheet  = _getSheet(CFG.SHEETS.INFLUENCERS);
    const data   = sheet.getDataRange().getValues();
    const header = data[0];
    const colCod  = header.indexOf('Código');
    const colAcum = header.indexOf('Comision_Acumulada_COP');
    const colMes  = header.indexOf('Comision_Mes_Corriente_COP');
    if (colCod < 0 || colAcum < 0) return;
    const norm = String(codigo).trim().toUpperCase();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][colCod]).trim().toUpperCase() !== norm) continue;
      const actual   = Number(data[i][colAcum]) || 0;
      const actualMs = colMes >= 0 ? (Number(data[i][colMes]) || 0) : 0;
      sheet.getRange(i + 1, colAcum + 1).setValue(actual + monto);
      if (colMes >= 0) sheet.getRange(i + 1, colMes + 1).setValue(actualMs + monto);
      SpreadsheetApp.flush();
      _log('_acumularComisionInfluencer', codigo, 'suma:' + monto, 'total:' + (actual + monto), 'mes:' + (actualMs + monto));
      return;
    }
  } catch(err) { _log('_acumularComisionInfluencer_ERROR', err.message, codigo); }
}

/**
 * Liquidación mensual de comisiones de influencers.
 * Trigger diario a las 8am; actúa SOLO el día 1 de cada mes.
 *   ≥ $100.000 acumulado: crea Gift Card por ese monto, envía email cálido, resetea a 0.
 *   < $100.000 acumulado: envía email motivacional, NO resetea (sigue acumulando).
 * Para crear el trigger una sola vez: ejecutar setupTriggerLiquidacionInfluencers()
 */
function liquidarComisionesInfluencers() {
  const ahora  = new Date();
  const tz     = 'America/Bogota';
  const diaMes = parseInt(Utilities.formatDate(ahora, tz, 'd'), 10);
  if (diaMes !== 1) return; // actuar solo el 1er día del mes

  const sheet  = _getSheet(CFG.SHEETS.INFLUENCERS);
  const data   = sheet.getDataRange().getValues();
  const header = data[0];
  const colCod      = header.indexOf('Código');
  const colNom      = header.indexOf('Nombre');
  const colApe      = header.indexOf('Apellido');
  const colEmail    = header.indexOf('Email');
  const colEst      = header.indexOf('Estado');
  const colAcum     = header.indexOf('Comision_Acumulada_COP');
  const colComPct   = header.indexOf('Comision_Pct');
  const colHistorico   = header.indexOf('Comision_Total_Historica_COP');  // puede ser -1 si no migrado aún
  const colMesCorriente = header.indexOf('Comision_Mes_Corriente_COP');   // puede ser -1 si no migrado aún

  if (colAcum < 0) {
    _log('liquidarComisionesInfluencers', 'ERROR: Comision_Acumulada_COP no encontrada — ejecutar repairInfluencersAddComisionAcumulada()');
    return;
  }

  for (let i = 1; i < data.length; i++) {
    const estado = String(data[i][colEst] || '').trim();
    if (estado !== 'ACTIVO') continue;

    const codigo    = String(data[i][colCod]   || '').trim();
    const nombre    = String(data[i][colNom]   || '').trim();
    const apellido  = String(data[i][colApe]   || '').trim();
    const email     = String(data[i][colEmail] || '').trim();
    const acumulado = Number(data[i][colAcum]) || 0;
    const comPct    = Number(data[i][colComPct]) || 0;

    if (acumulado <= 0 || !email || !codigo) continue;

    const infl = { codigo, nombre, apellido, email, comPct,
                   nombreCompleto: [nombre, apellido].filter(Boolean).join(' ') };

    if (acumulado >= CUOTA_MIN_INFLUENCER) {
      // ── Pago: crear GC y enviar email de felicitación ──
      const gcCodigo = _generarCodigoInfluencerGC(codigo);
      const gcVig    = _vigenciaGCInfluencer();
      _crearGiftCardInfluencerComision(infl, acumulado, gcCodigo, gcVig);
      _emailInfluencerComisionGC(infl, acumulado, gcCodigo, gcVig);
      sheet.getRange(i + 1, colAcum + 1).setValue(0); // resetear acumulador pendiente
      // Sumar al totalizador histórico
      if (colHistorico >= 0) {
        const historico = Number(data[i][colHistorico]) || 0;
        sheet.getRange(i + 1, colHistorico + 1).setValue(historico + acumulado);
      }
      _log('liquidarComisionesInfluencers', codigo, 'PAGADO', acumulado, gcCodigo);
    } else {
      // ── Motivación: email recordatorio sin resetear acumulado ──
      _emailInfluencerMotivacion(infl, acumulado);
      _log('liquidarComisionesInfluencers', codigo, 'MOTIVACION', acumulado);
    }
    // Mes corriente siempre resetea el día 1, independiente de si hubo pago o no
    if (colMesCorriente >= 0) sheet.getRange(i + 1, colMesCorriente + 1).setValue(0);
  }
  SpreadsheetApp.flush();
  _log('liquidarComisionesInfluencers', 'FIN', Utilities.formatDate(ahora, tz, 'dd/MM/yyyy'));
}

/** Genera código de GC para comisión: INFL-<4letras código>-XXXXXX */
function _generarCodigoInfluencerGC(codigoInfl) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let sufijo = '';
  for (let i = 0; i < 6; i++) sufijo += chars[Math.floor(Math.random() * chars.length)];
  const pref = (codigoInfl || '').slice(0, 4).toUpperCase();
  return `INFL-${pref}-${sufijo}`;
}

/** Calcula la fecha de vigencia de la GC de comisión (9 meses desde hoy) */
function _vigenciaGCInfluencer() {
  const d = new Date();
  d.setMonth(d.getMonth() + 9);
  return Utilities.formatDate(d, 'America/Bogota', 'dd/MM/yyyy');
}

/**
 * Inserta la Gift Card de comisión directamente como ACTIVA en GiftCards.
 * No requiere pago Wompi — es un reconocimiento interno de comisión.
 */
function _crearGiftCardInfluencerComision(infl, monto, gcCodigo, gcVig) {
  try {
    const sheet = _getSheet(CFG.SHEETS.GIFT_CARDS);
    const ts    = new Date();
    const mesAno = Utilities.formatDate(ts, 'America/Bogota', 'MM/yyyy');
    sheet.appendRow([
      'INFLUENCER_COMISION',                                              // A Campaña_ID
      ts,                                                                  // B Timestamp
      'INFL-' + ts.getTime(),                                             // C Referencia
      gcCodigo,                                                            // D Código_Gift
      monto,                                                               // E Saldo_Gift_COP
      gcVig,                                                               // F Válido_Hasta
      '',                                                                  // G ClienteID_Emisor
      'IMOLARTE',                                                          // H Emisor_Nombre
      '',                                                                  // I Emisor_Apellido
      CFG.EMAIL_ADMIN,                                                     // J Emisor_Email
      '',  '',  '',  '',  '',                                              // K-P Emisor info
      infl.nombre   || '',                                                 // Q Dest_Nombre
      infl.apellido || '',                                                 // R Dest_Apellido
      infl.email    || '',                                                 // S Dest_Email
      '',                                                                  // T Dest_Tel
      `Comisión ${mesAno} — código ${infl.codigo}`,                       // U Dest_Mensaje
      'PAGADO',                                                            // V Estado_Pago
      'ACTIVA',                                                            // W Estado_Gift
      '',                                                                  // X Wompi_Transaction_ID
      ts,                                                                  // Y Fecha_Pago
      ts,                                                                  // Z Fecha_Activación
      '',                                                                  // AA Canjeado_En
      `Comisión influencer ${infl.codigo} — liquidación automática ${mesAno}`, // AB Notas_Internas
    ]);
    SpreadsheetApp.flush();
    _log('_crearGiftCardInfluencerComision', infl.codigo, gcCodigo, monto, 'OK');
  } catch(err) { _log('_crearGiftCardInfluencerComision_ERROR', err.message, infl.codigo); }
}

/**
 * Email cálido y emocional al influencer que alcanzó la cuota mínima.
 * Incluye el código de Gift Card generado y el resumen del mes.
 */
function _emailInfluencerComisionGC(infl, comision, gcCodigo, gcVig) {
  if (!infl.email) return;
  try {
    const primerNombre = (infl.nombre || '').split(' ')[0] || infl.nombre || 'amig@';
    const mesAno = Utilities.formatDate(new Date(), 'America/Bogota', 'MMMM yyyy');
    const body = _emailWrapper(primerNombre, `
      <p style="font-size:15px;line-height:1.7">
        ¡Este momento lo celebramos contigo! 🥂✨ Has alcanzado tu meta de comisiones del mes
        y eso dice mucho de ti: de tu autenticidad, de tu amor por lo que haces y de la confianza
        que tu comunidad deposita en ti cada vez que compartes Helena Caballero.
      </p>
      <p style="font-size:14px;line-height:1.7;margin-top:12px">
        Gracias por llevar la cerámica artística italiana a nuevas mesas, nuevas historias y
        nuevos hogares. Cada código que compartes no es solo una venta —
        <strong>es una pieza única que alguien atesorará de por vida</strong> gracias a ti. 🏺💛
      </p>
      <div style="background:#1a1610;border-radius:12px;padding:28px;text-align:center;margin:24px 0">
        <p style="color:#C4A05A;font-size:11px;letter-spacing:3px;margin:0 0 6px;text-transform:uppercase">Tu comisión — ${mesAno}</p>
        <p style="color:#fff;font-size:36px;font-weight:bold;margin:0 0 4px;letter-spacing:1px">${_fmtCOP(comision)}</p>
        <p style="color:#aaa;font-size:12px;margin:0 0 20px">acumulada con tu código <strong style="color:#C4A05A;font-family:monospace;letter-spacing:1px">${infl.codigo}</strong> · comisión ${infl.comPct}% por venta</p>
        <hr style="border:none;border-top:1px solid #333;margin:16px 0">
        <p style="color:#C4A05A;font-size:11px;letter-spacing:3px;margin:0 0 8px;text-transform:uppercase">Tu Gift Card de reconocimiento</p>
        <p style="color:#fff;font-size:28px;font-weight:bold;font-family:monospace;letter-spacing:4px;margin:0 0 6px">${gcCodigo}</p>
        <p style="color:#aaa;font-size:12px;margin:0">Válida hasta ${gcVig}</p>
      </div>
      ${_instruccionesGiftHTML()}
      ${_ventasDashboardHTML(_ventasInfluencerMes(infl.codigo, infl.comPct), mesAno)}
      <p style="font-size:14px;line-height:1.7;margin-top:20px">
        Puedes usar tu Gift Card para darte un regalo que te mereces, o regalarla a alguien especial.
        Es tuya — con todo nuestro reconocimiento y afecto. 🎁
      </p>
      <p style="font-size:14px;line-height:1.7;margin-top:10px">
        Seguimos juntos en este camino. <strong>El equipo de Helena Caballero cree en ti</strong>
        y está emocionado de ver hasta dónde llegaremos juntos. ¡Gracias por ser parte de esta historia! 💫
      </p>
      <div style="margin-top:24px;text-align:center">
        <a href="${CFG.CATALOGO}" style="background:#C4A05A;color:#fff;padding:13px 32px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:bold">
          Ver catálogo Helena Caballero
        </a>
      </div>
    `);
    GmailApp.sendEmail(
      infl.email,
      `🏆 ¡Lograste tu meta! Tu comisión de ${_fmtCOP(comision)} en Gift Card — ${CFG.NOMBRE_TIENDA}`,
      '',
      { htmlBody: body }
    );
    _log('_emailInfluencerComisionGC', infl.codigo, infl.email, comision, gcCodigo);
  } catch(err) { _log('_emailInfluencerComisionGC_ERROR', err.message, infl.codigo); }
}

/**
 * Devuelve las ventas APPROVED del mes actual para un código influencer.
 * Retorna array de { fecha, ref, comprador, productos, subtotal, comPct, comision }
 * ordenado por fecha descendente.
 */
function _ventasInfluencerMes(codigo, comPct) {
  try {
    const sheet  = _getSheet(CFG.SHEETS.PEDIDOS_WOMPI);
    const data   = sheet.getDataRange().getValues();
    const header = data[0];
    const cTs    = header.indexOf('Timestamp');
    const cRef   = header.indexOf('Referencia');
    const cEst   = header.indexOf('Estado_Pago_Wompi');
    const cSub   = header.indexOf('Subtotal_COP');
    const cTot   = header.indexOf('Total_COP');
    const cNom   = header.indexOf('Nombre');
    const cApe   = header.indexOf('Apellido');
    const cProds = header.indexOf('Productos_JSON');
    const cInfl  = header.indexOf('Influencer_Código');
    if (cInfl < 0) return [];
    const ahora = new Date();
    const mes   = ahora.getMonth();
    const anio  = ahora.getFullYear();
    const norm  = String(codigo).trim().toUpperCase();
    const ventas = [];
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][cInfl] || '').trim().toUpperCase() !== norm) continue;
      if (String(data[i][cEst]  || '') !== 'APPROVED') continue;
      const ts = data[i][cTs];
      if (!(ts instanceof Date) || ts.getMonth() !== mes || ts.getFullYear() !== anio) continue;
      const subtotal  = Number(data[i][cSub]) || Number(data[i][cTot]) || 0;
      const comision  = comPct > 0 ? Math.round(subtotal * comPct / 100) : 0;
      const comprador = [String(data[i][cNom] || ''), String(data[i][cApe] || '')].filter(Boolean).join(' ') || '—';
      const prodsArr  = cProds >= 0 ? _parseJSON(data[i][cProds]) : [];
      const productos = Array.isArray(prodsArr) && prodsArr.length > 0
        ? prodsArr.map(p => {
            const nom = p.productName || p.name || '';
            const qty = p.quantity || 1;
            return qty > 1 ? `${nom} x${qty}` : nom;
          }).filter(Boolean).join(' / ')
        : '—';
      ventas.push({ fecha: ts, ref: String(data[i][cRef] || ''), comprador, productos, subtotal, comPct, comision });
    }
    ventas.sort((a, b) => b.fecha - a.fecha);
    return ventas;
  } catch(e) { return []; }
}

/**
 * Genera el HTML de la tabla completa de ventas del mes — dashboard del influencer.
 * Compartido por _emailInfluencerComisionGC y _emailInfluencerMotivacion.
 */
function _ventasDashboardHTML(ventas, mesAno) {
  if (!ventas || ventas.length === 0) {
    return `<p style="font-size:13px;color:#888;margin:14px 0;font-style:italic">
      Aún no hay ventas registradas este mes. ¡Comparte tu código y la primera llegará pronto! 🚀
    </p>`;
  }
  const totalSub = ventas.reduce((s, v) => s + v.subtotal, 0);
  const totalCom = ventas.reduce((s, v) => s + v.comision, 0);
  const filas = ventas.map((v, idx) => `
    <tr style="background:${idx % 2 === 0 ? '#faf8f5' : '#fff'};border-bottom:1px solid #ede6d8">
      <td style="padding:7px 8px;font-size:12px;color:#555">${Utilities.formatDate(v.fecha,'America/Bogota','dd/MM')}</td>
      <td style="padding:7px 8px;font-size:12px;font-weight:600;color:#1a1610">${v.comprador}</td>
      <td style="padding:7px 8px;font-size:11px;color:#666;line-height:1.4">${v.productos}</td>
      <td style="padding:7px 8px;font-size:12px;text-align:right">${_fmtCOP(v.subtotal)}</td>
      <td style="padding:7px 8px;font-size:12px;text-align:center;color:#8e44ad;font-weight:600">${v.comPct}%</td>
      <td style="padding:7px 8px;font-size:12px;text-align:right;color:#27ae60;font-weight:bold">${_fmtCOP(v.comision)}</td>
    </tr>`).join('');
  return `
    <h3 style="color:#3a2e1f;font-size:13px;font-weight:700;margin:22px 0 8px;text-transform:uppercase;letter-spacing:1px">
      📦 Tus ventas de ${mesAno}
    </h3>
    <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:4px">
      <thead>
        <tr style="background:#1a1610;color:#C4A05A">
          <th style="padding:8px;text-align:left;font-weight:600;font-size:11px">Fecha</th>
          <th style="padding:8px;text-align:left;font-weight:600;font-size:11px">Comprador</th>
          <th style="padding:8px;text-align:left;font-weight:600;font-size:11px">Productos</th>
          <th style="padding:8px;text-align:right;font-weight:600;font-size:11px">Subtotal</th>
          <th style="padding:8px;text-align:center;font-weight:600;font-size:11px">Com.%</th>
          <th style="padding:8px;text-align:right;font-weight:600;font-size:11px">Tu comisión</th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
      <tfoot>
        <tr style="background:#f0ece4;border-top:2px solid #C4A05A">
          <td colspan="3" style="padding:8px;font-size:12px;font-weight:700;color:#1a1610">
            TOTAL · ${ventas.length} venta${ventas.length !== 1 ? 's' : ''}
          </td>
          <td style="padding:8px;text-align:right;font-size:12px;font-weight:700">${_fmtCOP(totalSub)}</td>
          <td></td>
          <td style="padding:8px;text-align:right;font-size:13px;font-weight:700;color:#27ae60">${_fmtCOP(totalCom)}</td>
        </tr>
      </tfoot>
    </table>`;
}

/**
 * Email motivacional al influencer que aún no alcanzó la cuota mínima.
 * Incluye panel de comisiones con detalle de ventas del mes.
 */
function _emailInfluencerMotivacion(infl, acumulado) {
  if (!infl.email) return;
  try {
    const primerNombre = (infl.nombre || '').split(' ')[0] || infl.nombre || 'amig@';
    const falta   = CUOTA_MIN_INFLUENCER - acumulado;
    const mesAno  = Utilities.formatDate(new Date(), 'America/Bogota', 'MMMM yyyy');
    const ventas     = _ventasInfluencerMes(infl.codigo, infl.comPct);
    const ventasHTML = _ventasDashboardHTML(ventas, mesAno);

    const body = _emailWrapper(primerNombre, `
      <p style="font-size:15px;line-height:1.7">
        ¡Hola ${primerNombre}! Queremos tomarnos un momento para decirte algo importante:
        <strong>creemos en ti y apreciamos enormemente tu dedicación y constancia
        en promocionar Helena Caballero</strong>. 💛
      </p>
      <p style="font-size:14px;line-height:1.7;margin-top:10px">
        Esto va a ser un éxito, y somos un equipo en este camino. 🤝
      </p>
      <div style="background:#1a1610;border-radius:12px;padding:24px;text-align:center;margin:24px 0">
        <p style="color:#C4A05A;font-size:11px;letter-spacing:3px;margin:0 0 8px;text-transform:uppercase">Tu panel de comisiones — ${mesAno}</p>
        <p style="color:#fff;font-size:13px;margin:0 0 4px">Código: <strong style="font-family:monospace;color:#C4A05A;letter-spacing:1px">${infl.codigo}</strong></p>
        <p style="color:#aaa;font-size:12px;margin:0 0 16px">Tu comisión: <strong style="color:#fff">${infl.comPct || 0}%</strong> por cada venta confirmada</p>
        <hr style="border:none;border-top:1px solid #333;margin:12px 0">
        <p style="color:#C4A05A;font-size:11px;letter-spacing:2px;margin:0 0 4px;text-transform:uppercase">Acumulado actual</p>
        <p style="color:#fff;font-size:30px;font-weight:bold;margin:0 0 6px">${_fmtCOP(acumulado)}</p>
        <p style="color:#aaa;font-size:12px;margin:0 0 14px">Meta mínima para recibir tu pago: <strong style="color:#C4A05A">${_fmtCOP(CUOTA_MIN_INFLUENCER)}</strong></p>
        <div style="background:#2a2010;border-radius:6px;padding:10px 16px">
          <p style="color:#f0c060;font-size:13px;margin:0">
            🎯 Te faltan <strong>${_fmtCOP(falta)}</strong> para activar tu Gift Card de comisión
          </p>
        </div>
      </div>
      ${ventasHTML}
      <p style="font-size:14px;line-height:1.7;margin-top:6px">
        Tu acumulado <strong>no se pierde</strong> — sigue creciendo mes a mes hasta que alcances
        la cuota mínima de <strong>${_fmtCOP(CUOTA_MIN_INFLUENCER)}</strong>. En cuanto llegues,
        generamos tu Gift Card automáticamente el primer día del mes siguiente.
      </p>
      <p style="font-size:14px;line-height:1.7;margin-top:14px">
        Si necesitas cualquier información adicional sobre los productos o contenido digital
        para compartir con tu comunidad, <strong>por favor no dudes en contactarte con nosotros</strong>.
        Estamos aquí para darte todas las herramientas que necesitas. 📸🎨
      </p>
      <p style="font-size:14px;line-height:1.7;margin-top:14px">
        ¡Sigue así, ${primerNombre}! Tu constancia y autenticidad son lo que hacen la diferencia. 🌟
      </p>
      <div style="margin-top:24px;text-align:center">
        <a href="${CFG.CATALOGO}" style="background:#C4A05A;color:#fff;padding:13px 28px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:bold">
          Ver catálogo
        </a>
        &nbsp;&nbsp;
        <a href="mailto:${CFG.EMAIL_ADMIN}" style="background:#f5f0e8;color:#1a1610;padding:13px 28px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:bold">
          Contáctanos
        </a>
      </div>
    `);
    GmailApp.sendEmail(
      infl.email,
      `💛 Tu panel de comisiones ${mesAno} — ¡Vamos juntos! · ${CFG.NOMBRE_TIENDA}`,
      '',
      { htmlBody: body }
    );
    _log('_emailInfluencerMotivacion', infl.codigo, infl.email, acumulado, 'ENVIADO');
  } catch(err) { _log('_emailInfluencerMotivacion_ERROR', err.message, infl.codigo); }
}

/**
 * Crea el trigger diario a las 8am para liquidarComisionesInfluencers.
 * La función actúa solo el día 1 de cada mes (guarda por sí misma).
 * Ejecutar UNA SOLA VEZ desde Apps Script UI → Ejecutar → setupTriggerLiquidacionInfluencers
 */
function setupTriggerLiquidacionInfluencers() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'liquidarComisionesInfluencers')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('liquidarComisionesInfluencers')
    .timeBased()
    .atHour(8)
    .everyDays(1)
    .inTimezone('America/Bogota')
    .create();
  Logger.log('✅ Trigger 8am diario creado para liquidarComisionesInfluencers (actúa solo el día 1 del mes)');
}

/**
 * Agrega la columna Comision_Acumulada_COP a la hoja Influencers existente.
 * Ejecutar UNA VEZ si la hoja ya existe y no tiene la columna.
 */
function repairInfluencersAddComisionAcumulada() {
  const ss     = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
  const sheet  = ss.getSheetByName(CFG.SHEETS.INFLUENCERS);
  if (!sheet) { Logger.log('❌ Hoja Influencers no encontrada'); return; }
  const lastCol  = sheet.getLastColumn();
  const existing = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const col      = 'Comision_Acumulada_COP';
  if (existing.includes(col)) { Logger.log('ℹ️ Columna ya existe: ' + col); return; }
  const newCol = lastCol + 1;
  sheet.getRange(1, newCol)
    .setValue(col).setBackground('#1a1610').setFontColor('#C4A05A').setFontWeight('bold');
  sheet.getRange(2, newCol, 500, 1).setValue(0);
  sheet.autoResizeColumns(newCol, 1);
  Logger.log('✅ Columna agregada a Influencers: ' + col);
}

function _log(fn, a1='', a2='', a3='', a4='') {
  try {
    const sheet = _getSheet(CFG.SHEETS.LOG);
    sheet.appendRow([new Date(), fn,
      String(a1).slice(0,200), String(a2).slice(0,200),
      String(a3).slice(0,200), String(a4).slice(0,200)]);
  } catch(e) { Logger.log('LOG_ERROR: ' + e.message); }
}
