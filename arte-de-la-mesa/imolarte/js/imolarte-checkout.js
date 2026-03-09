/* ===== IMOLARTE — checkout.js v2.5 =====
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
  const btnWA         = `<a href="https://wa.me/${(typeof IMOLARTE_CONFIG !== 'undefined' ? IMOLARTE_CONFIG.whatsapp : '573007000000')}" target="_blank" class="btn btn-secondary">Escríbenos por WhatsApp</a>`;

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
      try { localStorage.removeItem('imolarte_gift_' + reference); } catch(e) {}

      // Leer vigencia para mostrar en pantalla
      const vigencia     = giftPayload?.vigencia     || '';
      const destNombre   = giftPayload?.destinatario?.nombre   || '';
      const destApellido = giftPayload?.destinatario?.apellido || '';
      const destCompleto = [destNombre, destApellido].filter(Boolean).join(' ') || 'el destinatario';
      const codigo       = giftPayload?.codigo || '';

      setContent(
        '🎁', '¡Regalo confirmado!',
        `¡Tu regalo ha sido enviado con éxito! ✨<br><br>
         ${codigo ? `<div style="background:#1a1610;border-radius:8px;padding:16px;text-align:center;margin:12px 0">
           <p style="color:#C4A05A;font-size:11px;letter-spacing:2px;margin:0 0 6px">CÓDIGO DE REGALO</p>
           <p style="color:#fff;font-size:22px;font-weight:bold;font-family:monospace;letter-spacing:3px;margin:0 0 4px">${codigo}</p>
           ${vigencia ? `<p style="color:#888;font-size:11px;margin:0">Válido hasta: ${vigencia}</p>` : ''}
         </div>` : ''}
         <strong>${destCompleto}</strong> recibirá el código por email en los próximos minutos.<br><br>
         Tú también recibirás una copia con todos los detalles.<br><br>
         <strong>¿Cómo usar la Gift Card?</strong> El destinatario ingresa el código antes del checkout del carrito. Válida para cualquier compra en nuestra tienda.<br><br>
         <em>Un regalo hecho a mano en Italia, con todo el cariño.</em>`,
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
        // Payload perdido (storage bloqueado o limpiado por redirect cross-origin)
        // Intentar recuperar por clave indexada con referencia
        let recoveredPayload = null;
        try {
          const rk = localStorage.getItem('imolarte_gift_' + reference);
          if (rk) recoveredPayload = JSON.parse(rk);
        } catch(e) {}

        if (recoveredPayload) {
          // Recuperado por clave indexada
          Api.createGiftCard(recoveredPayload)
            .then(() => Api.confirmarPagoWompi(reference, 'APPROVED', txId))
            .catch(err => console.warn('checkout.js: fallback indexado gift', err));
        } else {
          // Sin payload: mostrar pantalla con instrucción de contacto
          setContent(
            '🎁', '¡Pago recibido!',
            `Tu pago fue procesado exitosamente.<br><br>
             Estamos activando tu Gift Card — recibirás el código por <strong>email</strong> en los próximos minutos.<br><br>
             Si no recibes el email en 10 minutos, escríbenos por WhatsApp con tu referencia y te lo enviamos de inmediato.`,
            reference,
            btnCatalogo + btnWA,
            'confirm-title--success'
          );
          Api.confirmarPagoWompi(reference, 'APPROVED', txId)
            .catch(err => console.warn('checkout.js: fallback sin payload gift', err));
        }
      }
      return;
    }

    // ── Flujo C: Producto pagado 100% con Gift Card ─────────
    if (giftPaid) {
      // Leer payload UNA SOLA VEZ — para pantalla Y para procesamiento servidor
      let pedidoPayload = null;
      try {
        const raw = sessionStorage.getItem('imolarte_pending_pedido')
                 || localStorage.getItem('imolarte_pending_pedido');
        if (raw) pedidoPayload = JSON.parse(raw);
      } catch(e) { console.warn('checkout.js: error leyendo payload gift paid', e); }
      try { sessionStorage.removeItem('imolarte_pending_pedido'); } catch(e) {}
      try { localStorage.removeItem('imolarte_pending_pedido'); }   catch(e) {}

      // Info del bono para pantalla
      const _bonoCode  = pedidoPayload?.bono?.code  || '';
      const _bonoMonto = pedidoPayload?.bono?.monto || 0;
      const _bonoLine  = _bonoCode
        ? `<br>Tu <strong>Gift Card ${_bonoCode}</strong> fue aplicada exitosamente${_bonoMonto ? ' por <strong>$' + _bonoMonto.toLocaleString('es-CO') + '</strong>' : ''}.<br>`
        : '';

      setContent(
        '🏺', '¡Gracias por tu compra!',
        `Tu pedido fue confirmado exitosamente.<br><br>
         ${_bonoLine}
         En los próximos minutos recibirás un <strong>email de confirmación</strong> con el detalle de tu pedido.<br><br>
         Nuestro equipo se pondrá en contacto contigo para coordinar la entrega.<br><br>
         <em>Cada pieza que elegiste es única — hecha a mano en Italia, especialmente para ti.</em>`,
        reference,
        btnCatalogo + btnWA,
        'confirm-title--success'
      );

      if (pedidoPayload && pedidoPayload.referencia === reference) {
        Api.confirmarPagoWompi(reference, 'APPROVED', 'GIFT_CARD', {
          campaniaId:       pedidoPayload.campaniaId       || '',
          catalogoId:       pedidoPayload.catalogoId       || '',
          cliente:          pedidoPayload.cliente,
          entrega:          pedidoPayload.entrega,
          productos:        pedidoPayload.productos,
          formaPago:        pedidoPayload.formaPago,
          subtotal:         pedidoPayload.subtotal,
          descuento:        pedidoPayload.descuento,
          total:            pedidoPayload.total,
          porcentajePagado: pedidoPayload.porcentajePagado,
          bono:             pedidoPayload.bono             || null,
          referencia:       reference,
        }).catch(err => console.warn('checkout.js: error confirmar gift paid', err));
      } else if (reference) {
        // Fallback: solo confirmar por referencia (sin payload completo)
        Api.confirmarPagoWompi(reference, 'APPROVED', 'GIFT_CARD')
          .catch(err => console.warn('checkout.js: fallback confirmar gift paid', err));
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
        catalogoId:       pedidoPayload.catalogoId       || '',
        cliente:          pedidoPayload.cliente,
        entrega:          pedidoPayload.entrega,
        productos:        pedidoPayload.productos,
        formaPago:        pedidoPayload.formaPago,
        subtotal:         pedidoPayload.subtotal,
        descuento:        pedidoPayload.descuento,
        total:            pedidoPayload.total,
        porcentajePagado: pedidoPayload.porcentajePagado,
        bono:             pedidoPayload.bono             || null,
        referencia:       reference,
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
      // retryWompi=1: modal.js detecta este flag y reabre el checkout Wompi con carrito intacto
      const btnRetryWompi = `<a href="imolarte-index.html?retryWompi=1" class="btn btn-primary">Intentar nuevamente</a>`;
      setContent(
        '✗', 'Pago no procesado',
        `Tu pago no pudo completarse en este momento.<br><br>
         Tus productos <strong>siguen en tu carrito</strong> — puedes intentarlo nuevamente.<br><br>
         Si el problema persiste, escríbenos por WhatsApp y te ayudamos de inmediato.`,
        reference, btnRetryWompi + btnWA, 'confirm-title--error'
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
       No es necesario realizar otro pago.<br><br>
       Si tienes dudas, escríbenos por WhatsApp con tu referencia.`,
      reference, btnCatalogo + btnWA, 'confirm-title--pending'
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
