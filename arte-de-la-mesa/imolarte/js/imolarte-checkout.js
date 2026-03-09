/* ===== IMOLARTE — checkout.js v2.3 =====
 * Maneja confirmación post-Wompi y post-GiftCard.
 *
 * Arquitectura lean:
 *   NADA se escribe en Sheets antes de APPROVED.
 *   Todo payload viaja en sessionStorage/localStorage desde modal.js.
 *
 * Flujos:
 *   A) Wompi clásico (60% o 100%, con o sin bono parcial):
 *      Lee imolarte_pending_pedido → confirmarPagoWompi(ref, status, txId, payload)
 *   B) Compra de Gift Card con Wompi (reference empieza con GIFT-):
 *      Lee imolarte_gift_payload → createGiftCard(payload) → confirmarPagoWompi(ref, APPROVED, txId)
 *   C) Producto pagado 100% con Gift Card (giftPaid=1):
 *      Lee imolarte_pending_pedido (con _giftPaid:true) → confirmarPagoWompi(ref, APPROVED, GIFT_CARD, payload)
 *   D) Fallback (no hay payload, solo txId):
 *      confirmarPagoWompi(ref, status, txId) sin payload
 * =========================================== */

'use strict';

// Leer params INMEDIATAMENTE — antes de DOMContentLoaded
const _checkoutParams    = new URLSearchParams(window.location.search);
const _checkoutStatus    = _checkoutParams.get('transaction_status') || _checkoutParams.get('status');
const _checkoutReference = _checkoutParams.get('reference');
const _checkoutTxId      = _checkoutParams.get('id') || _checkoutParams.get('transaction_id') || '';
const _checkoutIsGift    = _checkoutParams.get('isGiftCard') === '1'
                        || String(_checkoutReference || '').startsWith('GIFT-');
const _checkoutGiftPaid  = _checkoutParams.get('giftPaid') === '1';

document.addEventListener('DOMContentLoaded', () => {
  const status    = _checkoutStatus;
  const reference = _checkoutReference;
  const txId      = _checkoutTxId;

  const closeBtn = document.getElementById('confirmClose');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => { window.location.href = 'imolarte-index.html'; });
  }

  // Limpiar URL sin recargar
  window.history.replaceState({}, '', window.location.pathname);

  // Sin parámetros → index
  if (!status && !txId) { window.location.replace('imolarte-index.html'); return; }

  if (status) {
    _handleStatus(status, reference, txId, _checkoutIsGift, _checkoutGiftPaid);
    return;
  }

  // Solo txId (sandbox sin transaction_status) → consultar Wompi
  _fetchTransactionStatus(txId).then(tx => {
    _handleStatus(tx.status, tx.reference || reference, txId, _checkoutIsGift, _checkoutGiftPaid);
  }).catch(() => {
    _handleStatus('UNKNOWN', reference, txId, _checkoutIsGift, _checkoutGiftPaid);
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
function _handleStatus(status, reference, txId, isGiftCard, giftPaid) {
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
  const btnWA         = `<a href="https://wa.me/${(typeof IMOLARTE_CONFIG !== 'undefined' ? IMOLARTE_CONFIG.whatsapp : '573007000000')}" target="_blank" class="btn btn-secondary" style="margin-top:8px">Escríbenos por WhatsApp</a>`;

  if (status === 'APPROVED') {
    // Vaciar carrito
    try { localStorage.removeItem(IMOLARTE_CONFIG.cart.storageKey); } catch(e) {}

    // ── Flujo B: Compra de Gift Card con Wompi ─────────────
    if (isGiftCard && !giftPaid) {
      // Leer payload de la GC guardado por modal.js
      let giftPayload = null;
      try {
        const raw = sessionStorage.getItem('imolarte_gift_payload')
                 || localStorage.getItem('imolarte_gift_payload');
        if (raw) giftPayload = JSON.parse(raw);
      } catch(e) { console.warn('checkout.js: error leyendo gift payload', e); }
      try { sessionStorage.removeItem('imolarte_gift_payload'); } catch(e) {}
      try { localStorage.removeItem('imolarte_gift_payload'); }   catch(e) {}

      // Leer vigencia para mostrar en pantalla
      const vigencia     = giftPayload?.vigencia     || '';
      const destNombre   = giftPayload?.destinatario?.nombre   || '';
      const destApellido = giftPayload?.destinatario?.apellido || '';
      const destCompleto = [destNombre, destApellido].filter(Boolean).join(' ') || 'el destinatario';
      const codigo       = giftPayload?.codigo || '';

      setContent(
        '🎁', '¡Regalo confirmado!',
        `Tu Gift Card ha sido activada exitosamente.<br><br>
         ${codigo ? `<strong>Código:</strong> <code style="background:#f0ede5;padding:2px 8px;border-radius:4px;font-size:15px;letter-spacing:2px">${codigo}</code><br><br>` : ''}
         ${vigencia ? `<strong>Válida hasta:</strong> ${vigencia}<br><br>` : ''}
         <strong>${destCompleto}</strong> recibirá el código por email en los próximos minutos.<br><br>
         También recibirás una copia en tu correo con todos los detalles.<br><br>
         <em>Cada pieza de nuestra cerámica italiana es única — un regalo que perdura.</em>`,
        reference,
        btnCatalogo + btnWA,
        'confirm-title--success'
      );

      // Registrar en Sheets — ahora que tenemos APPROVED
      if (giftPayload) {
        Api.createGiftCard(giftPayload)
          .then(() => Api.confirmarPagoWompi(reference, 'APPROVED', txId))
          .catch(err => console.warn('checkout.js: error procesando gift card', err));
      } else {
        // Fallback: solo confirmar (sin payload — GC ya podría estar en Sheets de intento previo)
        Api.confirmarPagoWompi(reference, 'APPROVED', txId)
          .catch(err => console.warn('checkout.js: fallback confirmar gift', err));
      }
      return;
    }

    // ── Flujo C: Producto pagado 100% con Gift Card ─────────
    if (giftPaid) {
      setContent(
        '🏺', '¡Gracias por tu compra!',
        `Tu pedido fue confirmado exitosamente.<br><br>
         En los próximos minutos recibirás un <strong>email de confirmación</strong> con el detalle de tu pedido.<br><br>
         Nuestro equipo se pondrá en contacto contigo para coordinar la entrega.<br><br>
         <em>Cada pieza que elegiste es única — hecha a mano en Italia, especialmente para ti.</em>`,
        reference,
        btnCatalogo + btnWA,
        'confirm-title--success'
      );

      // Leer payload y procesar en servidor (lean)
      let pedidoPayload = null;
      try {
        const raw = sessionStorage.getItem('imolarte_pending_pedido')
                 || localStorage.getItem('imolarte_pending_pedido');
        if (raw) pedidoPayload = JSON.parse(raw);
      } catch(e) { console.warn('checkout.js: error leyendo payload gift paid', e); }
      try { sessionStorage.removeItem('imolarte_pending_pedido'); } catch(e) {}
      try { localStorage.removeItem('imolarte_pending_pedido'); }   catch(e) {}

      if (pedidoPayload && pedidoPayload.referencia === reference) {
        Api.confirmarPagoWompi(reference, 'APPROVED', 'GIFT_CARD', {
          campaniaId:       pedidoPayload.campaniaId       || '',
          cliente:          pedidoPayload.cliente,
          entrega:          pedidoPayload.entrega,
          productos:        pedidoPayload.productos,
          formaPago:        pedidoPayload.formaPago,
          subtotal:         pedidoPayload.subtotal,
          descuento:        pedidoPayload.descuento,
          total:            pedidoPayload.total,
          porcentajePagado: pedidoPayload.porcentajePagado,
          bono:             pedidoPayload.bono || null,
        }).catch(err => console.warn('checkout.js: error confirmar gift paid', err));
      }
      return;
    }

    // ── Flujo A: Wompi clásico (con o sin bono parcial) ─────
    setContent(
      '🏺', '¡Gracias por tu compra!',
      `Tu pago fue confirmado exitosamente.<br><br>
       En los próximos minutos recibirás un <strong>email de confirmación</strong> con el detalle de tu pedido.<br><br>
       Nuestro equipo se pondrá en contacto contigo para coordinar la entrega.<br><br>
       <em>Cada pieza que elegiste es única — hecha a mano en Italia, especialmente para ti.</em>`,
      reference,
      btnCatalogo + btnWA,
      'confirm-title--success'
    );

    let pedidoPayload = null;
    try {
      const raw = sessionStorage.getItem('imolarte_pending_pedido')
               || localStorage.getItem('imolarte_pending_pedido');
      if (raw) pedidoPayload = JSON.parse(raw);
    } catch(e) { console.warn('checkout.js: error leyendo payload', e); }
    try { sessionStorage.removeItem('imolarte_pending_pedido'); } catch(e) {}
    try { localStorage.removeItem('imolarte_pending_pedido'); }   catch(e) {}

    if (pedidoPayload && pedidoPayload.referencia === reference) {
      // ── Flujo A: Wompi con payload completo ──────────────
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
      // ── Flujo D: fallback sin payload ─────────────────────
      Api.confirmarPagoWompi(reference, status, txId)
        .catch(err => console.warn('checkout.js: fallback confirmarPagoWompi', err));
    }

  } else if (status === 'DECLINED' || status === 'ERROR') {
    // Limpiar payloads huérfanos
    try { sessionStorage.removeItem('imolarte_pending_pedido'); } catch(e) {}
    try { localStorage.removeItem('imolarte_pending_pedido'); }   catch(e) {}
    try { sessionStorage.removeItem('imolarte_gift_payload'); }   catch(e) {}
    try { localStorage.removeItem('imolarte_gift_payload'); }     catch(e) {}

    if (isGiftCard) {
      const btnRetryGift = `<a href="imolarte-index.html?retryGift=1" class="btn btn-primary">Reintentar pago</a>`;
      setContent(
        '✗', 'Pago no completado',
        `Tu pago no pudo procesarse.<br><br>
         Puedes intentarlo nuevamente — el formulario quedará pre-cargado.<br><br>
         Si el problema persiste, escríbenos por WhatsApp y te ayudamos.`,
        reference, btnRetryGift + btnWA, 'confirm-title--error'
      );
    } else {
      setContent(
        '✗', 'Pago no procesado',
        `Tu pago no pudo completarse en este momento.<br><br>
         Tus productos siguen disponibles. Puedes intentarlo nuevamente.<br><br>
         Si el problema persiste, escríbenos por WhatsApp.`,
        reference, btnReintentar + btnWA, 'confirm-title--error'
      );
    }

    // Notificar backend del rechazo (para actualizar estado en Sheets si hay fila)
    if (reference) {
      Api.confirmarPagoWompi(reference, status, txId)
        .catch(err => console.warn('checkout.js: DECLINED/ERROR notify', err));
    }

  } else if (status === 'PENDING') {
    setContent(
      '⏳', 'Pago en verificación',
      `Tu pago está siendo procesado.<br><br>
       Te notificaremos por <strong>email</strong> en cuanto se confirme.<br>
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
      reference, btnCatalogo + btnWA, null
    );
  }
}
