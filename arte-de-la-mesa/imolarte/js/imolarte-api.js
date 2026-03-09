// ============================================================
// IMOLARTE — api.js v2.1
// Capa de comunicación centralizada con Google Apps Script
//
// CORS note: Apps Script (ContentService) no puede devolver
// Access-Control-Allow-Origin headers. La única forma de hacer
// fetch cross-origin sin CORS es usar URLSearchParams como body
// — el browser lo clasifica como "simple request" y no genera
// preflight OPTIONS. El payload JSON va dentro del campo 'data'.
//
// v2.1: confirmarPagoWompi acepta pedidoPayload opcional.
//       Cuando viene, code.gs hace create+redeem+confirm en una
//       sola llamada HTTP — eliminando riesgo de cancelación
//       del browser en secuencias multi-fetch post-redirect.
// ============================================================

'use strict';

const Api = (() => {

  function _url() {
    return IMOLARTE_CONFIG?.checkout?.sheetsUrl || '';
  }

  // ── POST via URLSearchParams — evita preflight CORS ──────────
  async function _post(payload) {
    const url = _url();
    if (!url) {
      Logger.warn('api.js: sheetsUrl no configurada');
      return { ok: false, error: 'URL no configurada' };
    }
    try {
      const secured = {
        _token: IMOLARTE_CONFIG?.checkout?.apiToken || '',
        ...payload,
      };
      const params = new URLSearchParams();
      params.append('data', JSON.stringify(secured));

      const resp = await fetch(url, {
        method:   'POST',
        redirect: 'follow',
        body:     params,
      });
      const text = await resp.text();
      const data = JSON.parse(text);
      Logger.log('api.js POST ok', payload.action, payload.referencia || '');
      return data;
    } catch (err) {
      Logger.warn('api.js: fetch error', payload.action, err.message);
      return { ok: false, error: err.message };
    }
  }

  async function _get(params) {
    const url = _url();
    if (!url) return { ok: false, error: 'sheetsUrl no configurada' };
    try {
      const qs   = new URLSearchParams(params).toString();
      const resp = await fetch(`${url}?${qs}`);
      const data = await resp.json();
      Logger.log('api.js GET ok', params.action);
      return data;
    } catch (err) {
      Logger.warn('api.js: GET error', params.action, err.message);
      return { ok: false, error: err.message };
    }
  }

  function _genRef(prefix) {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  function _mapProductos(items) {
    return (items || []).map(i => ({
      productId:   i.productId   || '',
      productName: i.productName || '',
      familia:     i.familia     || '',
      collection:  i.collection  || '',
      sku:         i.sku         || '',
      siigo_code:  i.siigo_code  || '',
      price:       i.price       || 0,
      quantity:    i.quantity    || 1,
    }));
  }

  function _campaniaId() {
    return IMOLARTE_CONFIG?.campania?.id || '';
  }

  // ── WISHLIST ──────────────────────────────────────────────────

  async function createWishlist(data, items, totales) {
    const result = await _post({
      action:     'createWishlist',
      campaniaId: _campaniaId(),
      cliente:    data.cliente,
      entrega:    data.entrega,
      productos:  _mapProductos(items),
      total:      totales.total      || 0,
      referencia: totales.referencia || '',
    });
    return result.ok
      ? { ok: true,  referencia: result.referencia || _genRef('WA'), clienteId: result.clienteId || '' }
      : { ok: false, referencia: _genRef('WA'), error: result.error };
  }

  async function updateEstadoWishlist(referencia, estado) {
    return _post({
      action:   'updateEstadoWishlist',
      referencia,
      estadoWA: estado,
    });
  }

  // ── PEDIDOS WOMPI ─────────────────────────────────────────────

  async function createPedidoWompi(data, items, totales) {
    const result = await _post({
      action:             'createPedidoWompi',
      campaniaId:         _campaniaId(),
      cliente:            data.cliente,
      entrega:            data.entrega,
      formaPago:          totales.formaPago       || 'WOMPI_100',
      productos:          _mapProductos(items),
      subtotal:           totales.subtotal         || 0,
      descuento:          totales.descuento        || 0,
      total:              totales.total            || 0,
      porcentajePagado:   totales.porcentajePagado || 100,
      referencia:         totales.referencia       || '',
      wompiTransactionId: '',
      _skipEmail:         totales._skipEmail       || false,
    });
    return result.ok
      ? { ok: true,  referencia: result.referencia || _genRef('WP'), clienteId: result.clienteId || '' }
      : { ok: false, referencia: _genRef('WP'), error: result.error };
  }

  // Confirmar pago post-redirect Wompi.
  // Si se pasa pedidoPayload, code.gs hace create+redeem+confirm
  // en una sola transacción de servidor — una sola llamada HTTP
  // desde el browser, eliminando el riesgo de cancelación.
  async function confirmarPagoWompi(referencia, status, transactionId, pedidoPayload) {
    return _post({
      action:        'confirmarPagoWompi',
      referencia,
      status,
      transactionId: transactionId || '',
      // Solo se incluye si existe — code.gs detecta su presencia
      ...(pedidoPayload ? { pedidoPayload } : {}),
    });
  }

  // ── CLIENTES ─────────────────────────────────────────────────

  async function getCliente(telefono) {
    return _get({ action: 'getCliente', telefono });
  }

  async function getPedido(referencia) {
    return _get({ action: 'getPedido', referencia });
  }

  // ── GIFT CARDS ───────────────────────────────────────────────

  async function createGiftCard(payload) {
    return _post({ action: 'createGiftCard', ...payload });
  }

  async function getGiftCard(codigo) {
    return _get({ action: 'getGiftCard', codigo });
  }

  async function redeemDono(code, amount, referencia) {
    return _post({ action: 'redeemDono', code, amount, referencia: referencia || '' });
  }

  async function validateDono(code) {
    return _get({ action: 'validateDono', code });
  }

  // ── CAMPAÑAS ─────────────────────────────────────────────────

  async function getCampaniasActivas() {
    return _get({ action: 'getCampanias' });
  }

  // ── UTILS ────────────────────────────────────────────────────

  async function ping() {
    return _get({ action: 'ping' });
  }

  return {
    createWishlist,
    updateEstadoWishlist,
    createPedidoWompi,
    confirmarPagoWompi,
    getCliente,
    getPedido,
    createGiftCard,
    getGiftCard,
    redeemDono,
    validateDono,
    getCampaniasActivas,
    ping,
  };

})();

window.Api = Api;
Logger.log('api.js cargado ✓');
