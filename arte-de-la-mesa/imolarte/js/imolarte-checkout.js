/* ===== IMOLARTE — checkout.js v2.2 =====
 * Maneja confirmación post-Wompi y post-GiftCard.
 *
 * Arquitectura lean (v2.2):
 *   Una sola llamada HTTP a confirmarPagoWompi con el pedidoPayload
 *   completo. code.gs hace create + redeem + confirm + email en el
 *   servidor — atómico, sin riesgo de cancelación del browser.
 *
 * Flujos:
 *   A) Wompi (60% o 100%, con o sin bono parcial):
 *      Lee pedidoPayload de localStorage/sessionStorage.
 *      → confirmarPagoWompi(ref, status, txId, payload)
 *   B) Gift Card total:
 *      modal.js ya procesó todo antes del redirect.
 *      → solo mostrar pantalla de agradecimiento.
 *   C) Fallback (no hay payload, solo txId):
 *      → confirmarPagoWompi(ref, status, txId)  sin payload
 * =========================================== */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const params    = new URLSearchParams(window.location.search);
  const status    = params.get('transaction_status') || params.get('status');
  const reference = params.get('reference');
  const txId      = params.get('id') || params.get('transaction_id') || '';

  const closeBtn = document.getElementById('confirmClose');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => { window.location.href = 'imolarte-index.html'; });
  }

  // Limpiar URL sin recargar
  window.history.replaceState({}, '', window.location.pathname);

  // Sin parámetros → index
  if (!status && !txId) { window.location.replace('imolarte-index.html'); return; }

  if (status) {
    _handleStatus(status, reference, txId);
    return;
  }

  // Solo txId (sandbox sin transaction_status) → consultar Wompi
  _fetchTransactionStatus(txId).then(tx => {
    _handleStatus(tx.status, tx.reference || reference, txId);
  }).catch(() => {
    _handleStatus('UNKNOWN', reference, txId);
  });
});

// ── Consulta estado a Wompi API (sandbox) ───────────────────
async function _fetchTransactionStatus(txId) {
  try {
    const resp = await fetch(`https://api-sandbox.wompi.co/v1/transactions/${txId}`);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const json = await resp.json();
    return {
      status:    json.data?.status    || 'UNKNOWN',
      reference: json.data?.reference || '',
    };
  } catch(e) {
    console.warn('checkout.js: error consultando transacción', e);
    return { status: 'UNKNOWN', reference: '' };
  }
}

// ── Muestra UI y notifica Sheets ─────────────────────────────
function _handleStatus(status, reference, txId) {
  const iconEl    = document.getElementById('confirmIcon');
  const titleEl   = document.getElementById('confirmTitle');
  const msgEl     = document.getElementById('confirmMessage');
  const refEl     = document.getElementById('confirmRef');
  const actionsEl = document.getElementById('confirmActions');

  function setContent(icon, title, msg, ref, actionsHtml, colorClass) {
    if (iconEl)    iconEl.textContent = icon;
    if (titleEl)   { titleEl.textContent = title; if (colorClass) titleEl.classList.add(colorClass); }
    if (msgEl)     msgEl.innerHTML = msg;
    if (refEl)     refEl.textContent = ref ? 'Referencia: ' + ref : '';
    if (actionsEl) actionsEl.innerHTML = actionsHtml;
    const card = document.getElementById('confirmCard');
    if (card) card.classList.add('is-visible');
  }

  const btnCatalogo   = '<a href="imolarte-index.html" class="btn btn-primary">Explorar catálogo</a>';
  const btnReintentar = '<a href="imolarte-index.html" class="btn btn-secondary">Volver al catálogo</a>';

  if (status === 'APPROVED') {
    // Vaciar carrito
    try { localStorage.removeItem(IMOLARTE_CONFIG.cart.storageKey); } catch(e) {}

    setContent(
      '🏺', '¡Gracias por tu compra!',
      `Tu pago fue confirmado exitosamente.<br><br>
       En los próximos minutos recibirás un <strong>email de confirmación</strong> con el detalle de tu pedido.
       Nuestro equipo se pondrá en contacto contigo para coordinar la entrega.<br><br>
       Cada pieza que elegiste es única — <em>hecha a mano en Italia, especialmente para ti.</em>`,
      reference, btnCatalogo, 'confirm-title--success'
    );

    // Leer payload guardado por modal.js antes del redirect a Wompi.
    // sessionStorage es primario; localStorage es backup (el redirect
    // cross-origin de Wompi puede limpiar sessionStorage en algunos browsers).
    let pedidoPayload = null;
    try {
      const raw = sessionStorage.getItem('imolarte_pending_pedido')
               || localStorage.getItem('imolarte_pending_pedido');
      if (raw) pedidoPayload = JSON.parse(raw);
    } catch(e) { console.warn('checkout.js: error leyendo payload', e); }

    // Limpiar siempre ambos storages — independientemente de si había payload
    try { sessionStorage.removeItem('imolarte_pending_pedido'); } catch(e) {}
    try { localStorage.removeItem('imolarte_pending_pedido'); }   catch(e) {}

    if (pedidoPayload && pedidoPayload.referencia === reference) {
      // ── Flujo A: Wompi (con o sin bono) ──────────────────────
      // Una sola llamada HTTP con el payload completo.
      // code.gs hace create + redeem + confirm + email en servidor.
      Api.confirmarPagoWompi(reference, status, txId, {
        campaniaId:       pedidoPayload.campaniaId       || '',
        cliente:          pedidoPayload.cliente,
        entrega:          pedidoPayload.entrega,
        productos:        pedidoPayload.productos,
        formaPago:        pedidoPayload.formaPago,
        subtotal:         pedidoPayload.subtotal,
        descuento:        pedidoPayload.descuento,
        total:            pedidoPayload.total,
        porcentajePagado: pedidoPayload.porcentajePagado,
        bono:             pedidoPayload.bono             || null,
      }).catch(err => console.warn('checkout.js: error confirmarPagoWompi', err));

    } else if (txId) {
      // ── Flujo C: fallback — no hay payload pero hay txId ─────
      Api.confirmarPagoWompi(reference, status, txId)
        .catch(err => console.warn('checkout.js: fallback confirmarPagoWompi', err));
    }
    // ── Flujo B: Gift Card total ──────────────────────────────
    // modal.js ya hizo create + redeem + confirm antes del redirect.
    // No hay payload ni txId → solo mostrar pantalla (ya hecho arriba).

  } else if (status === 'DECLINED' || status === 'ERROR') {
    setContent(
      '✗', 'Pago no procesado',
      `Tu pago no pudo completarse en este momento.<br><br>
       Puedes intentarlo nuevamente — tus productos siguen disponibles.<br>
       Si el problema persiste escríbenos al WhatsApp.`,
      reference, btnReintentar, 'confirm-title--error'
    );

  } else if (status === 'PENDING') {
    setContent(
      '⏳', 'Pago en verificación',
      `Tu pago está siendo procesado.<br><br>
       Te notificaremos por <strong>email</strong> en cuanto se confirme.
       No es necesario realizar otro pago.`,
      reference, btnCatalogo, 'confirm-title--pending'
    );
    Api.confirmarPagoWompi(reference, status, txId)
      .catch(err => console.warn('checkout.js: PENDING confirmarPagoWompi', err));

  } else {
    setContent(
      '?', 'Estado desconocido',
      `No pudimos verificar el estado de tu pago.<br>
       Por favor contáctanos con tu referencia y te ayudamos.`,
      reference, btnCatalogo, null
    );
  }
}
