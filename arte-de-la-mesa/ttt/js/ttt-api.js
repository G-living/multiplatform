// @version    v1.0  @file ttt-api.js  @updated 2026-03-14  @session fix-mlg-404-error-aSVYy
/* ===== TTT - ttt-api.js =====
 * Capa de comunicación con Google Apps Script (code.gs TTT)
 * Clon de imolarte-api.js adaptado para TTT
 * ============================================ */

'use strict';

const Api = (() => {

  function _url() { return TTT_CONFIG?.checkout?.sheetsUrl || ''; }

  async function _post(payload) {
    const url = _url();
    if (!url) { Logger.warn('ttt-api.js: sheetsUrl no configurada'); return { ok: false, error: 'URL no configurada' }; }
    try {
      const secured = { _token: TTT_CONFIG?.checkout?.apiToken || '', ...payload };
      const params = new URLSearchParams();
      params.append('data', JSON.stringify(secured));
      const resp = await fetch(url, { method: 'POST', redirect: 'follow', body: params });
      const data = JSON.parse(await resp.text());
      Logger.log('ttt-api.js POST ok', payload.action);
      return data;
    } catch(err) {
      Logger.warn('ttt-api.js: fetch error', payload.action, err.message);
      return { ok: false, error: err.message };
    }
  }

  async function _get(params) {
    const url = _url();
    if (!url) return { ok: false, error: 'sheetsUrl no configurada' };
    try {
      const qs   = new URLSearchParams(params).toString();
      const data = await (await fetch(`${url}?${qs}`)).json();
      Logger.log('ttt-api.js GET ok', params.action);
      return data;
    } catch(err) {
      Logger.warn('ttt-api.js: GET error', params.action, err.message);
      return { ok: false, error: err.message };
    }
  }

  function _genRef(prefix) { return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`; }

  function _mapProductos(items) {
    return (items || []).map(i => ({
      productSku:  i.productSku  || '',
      productName: i.productName || '',
      medida:      i.medida      || '',
      sku:         i.sku         || '',
      precio:      i.precio      || 0,
      quantity:    i.quantity    || 1,
    }));
  }

  function _campaniaId()  { return TTT_CONFIG?.campania?.id  || ''; }
  function _catalogoId()  { return TTT_CONFIG?.catalogo?.id  || ''; }

  // ── WISHLIST ────────────────────────────────────────────
  async function createWishlist(data, items, totales) {
    const result = await _post({
      action:     'createWishlist',
      campaniaId:  _campaniaId(),
      catalogoId:  _catalogoId(),
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

  // ── CLIENTES ────────────────────────────────────────────
  async function getCliente(telefono) { return _get({ action: 'getCliente', telefono }); }

  // ── CAMPAÑAS ────────────────────────────────────────────
  async function getCampaniasActivas() { return _get({ action: 'getCampanias' }); }

  async function ping() { return _get({ action: 'ping' }); }

  return { createWishlist, getCliente, getCampaniasActivas, ping };

})();

window.Api = Api;
Logger.log('ttt-api.js cargado ✓');
