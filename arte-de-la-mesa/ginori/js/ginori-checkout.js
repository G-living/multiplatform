/* ===== GINORI — checkout.js v2.5 =====
 * Maneja confirmación post-Wompi y post-GiftCard.
 *
 * Arquitectura lean:
 *   NADA se escribe en Sheets antes de APPROVED.
 *   Todo payload viaja en sessionStorage/localStorage desde modal.js.
 *
 * Flujos:
 *   A) Wompi clásico (60% o 100%, con o sin bono parcial):
 *      Lee ginori_pending_pedido → confirmarPagoWompi(ref, status, txId, payload)
 *   B) Compra de Gift Card con Wompi (reference empieza con GIFT-):
 *      Lee ginori_gift_payload → createGiftCard(payload) → confirmarPagoWompi(ref, APPROVED, txId)
 *   C) Producto pagado 100% con Gift Card (giftPaid=1):
 *      Lee ginori_pending_pedido (con _giftPaid:true) → confirmarPagoWompi(ref, APPROVED, GIFT_CARD, payload)
 *   D) Fallback (no hay payload, solo txId):
 *      confirmarPagoWompi(ref, status, txId) sin payload
 * =========================================== */

'use strict';

// Leer params INMEDIATAMENTE — antes de DOMContentLoaded
const _checkoutParams    = new URLSearchParams(window.location.search);
const _checkoutStatus    = _checkoutParams.get('transaction_status') || _checkoutParams.get('status');
const _checkoutReference = _checkoutParams.get('reference');
const _checkoutTxId      = _checkoutParams.get('id') || _checkoutParams.get('transaction_id') || '';
// Detectar flujo Gift Card:
//   1) param isGiftCard=1 codificado en redirect-url (método principal desde v21.6)
//   2) referencia empieza con GIFT- (Wompi pasa reference en el redirect)
//   3) localStorage flag (backup cross-origin, modaljs lo escribe antes del redirect)
const _checkoutGiftStorage = (() => { try { return sessionStorage.getItem('ginori_gift_redirect') || localStorage.getItem('ginori_gift_redirect') || ''; } catch(e) { return ''; } })();
const _checkoutIsGift    = _checkoutParams.get('isGiftCard') === '1'
                        || String(_checkoutReference || '').startsWith('GIFT-')
                        || !!_checkoutGiftStorage;
const _checkoutGiftPaid  = _checkoutParams.get('giftPaid') === '1';

document.addEventListener('DOMContentLoaded', () => {
  const status    = _checkoutStatus;
  const reference = _checkoutReference;
  const txId      = _checkoutTxId;

  const closeBtn = document.getElementById('confirmClose');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => { window.location.href = 'ginori-index.html'; });
  }

  // Limpiar URL sin recargar
  window.history.replaceState({}, '', window.location.pathname);

  // Sin parámetros → index
  if (!status && !txId) { window.location.replace('ginori-index.html'); return; }

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

  const btnCatalogo   = '<a href="ginori-index.html" class="btn btn-primary">Explorar catálogo</a>';
  const btnReintentar = '<a href="ginori-index.html" class="btn btn-secondary">Volver al catálogo</a>';
  const btnWA         = `<a href="https://wa.me/${(typeof GINORI_CONFIG !== 'undefined' ? GINORI_CONFIG.whatsapp : '573007000000')}" target="_blank" class="btn btn-secondary">Escríbenos por WhatsApp</a>`;

  if (status === 'APPROVED') {
    // Vaciar carrito
    try { localStorage.removeItem(GINORI_CONFIG.cart.storageKey); } catch(e) {}

    // ── Flujo B: Compra de Gift Card con Wompi ─────────────
    // Flujo lean: igual que pedidos normales, la fila se crea en Sheets ahora (APPROVED).
    if (isGiftCard && !giftPaid) {
      // Leer payload del storage (para mostrar código/vigencia en pantalla)
      let giftPayload = null;
      try {
        const raw = sessionStorage.getItem('ginori_gift_payload')
                 || localStorage.getItem('ginori_gift_payload')
                 || localStorage.getItem('ginori_gift_' + reference);
        if (raw) giftPayload = JSON.parse(raw);
      } catch(e) { console.warn('checkout.js: error leyendo gift payload', e); }
      try { sessionStorage.removeItem('ginori_gift_payload'); }     catch(e) {}
      try { localStorage.removeItem('ginori_gift_payload'); }       catch(e) {}
      try { localStorage.removeItem('ginori_gift_' + reference); } catch(e) {}
      // Limpiar flag de redirect Gift (session + local) — evita que pageshow lo restaure
      // incorrectamente en la próxima compra de carrito.
      try { sessionStorage.removeItem('ginori_gift_redirect'); } catch(e) {}
      try { localStorage.removeItem('ginori_gift_redirect'); }   catch(e) {}

      // Leer vigencia para mostrar en pantalla
      const vigencia     = giftPayload?.vigencia     || '';
      const destNombre   = giftPayload?.destinatario?.nombre   || '';
      const destApellido = giftPayload?.destinatario?.apellido || '';
      const destCompleto = [destNombre, destApellido].filter(Boolean).join(' ') || 'el destinatario';
      const destEmail    = giftPayload?.destinatario?.email    || '';
      const emisorNombre = giftPayload?.emisor?.nombre         || '';
      const codigo       = giftPayload?.codigo || '';
      const valor        = giftPayload?.valor  || 0;
      const valorFmt     = valor ? '$' + valor.toLocaleString('es-CO') : '';

      setContent(
        '🎁', '¡Tu Gift Card está lista!',
        `${emisorNombre ? `<p style="margin:0 0 12px">¡Gracias, <strong>${emisorNombre}</strong>! Tu regalo está activado y listo para sorprender. ✨</p>` : '<p style="margin:0 0 12px">¡Gracias por este gesto tan especial! Tu regalo está activado y listo para sorprender. ✨</p>'}
         ${codigo ? `<div style="background:#1a1610;border-radius:10px;padding:20px;text-align:center;margin:14px 0">
           <p style="color:#C4A05A;font-size:11px;letter-spacing:2px;margin:0 0 8px;text-transform:uppercase">Código de Gift Card</p>
           <p style="color:#fff;font-size:28px;font-weight:bold;font-family:monospace;letter-spacing:4px;margin:0 0 8px">${codigo}</p>
           ${valorFmt ? `<p style="color:#C4A05A;font-size:16px;font-weight:bold;margin:0 0 6px">${valorFmt}</p>` : ''}
           ${vigencia ? `<p style="color:#aaa;font-size:12px;margin:0">Válido hasta: <strong style="color:#C4A05A">${vigencia}</strong></p>` : ''}
         </div>` : ''}
         <p style="margin:8px 0"><strong>${destCompleto}</strong>${destEmail ? ` (${destEmail})` : ''} recibirá el código por email con un mensaje personalizado.<br>Tú también recibirás una copia con todos los detalles.</p>
         <div style="background:#f9f6f0;border-radius:8px;padding:14px;margin:14px 0;font-size:13px;text-align:left">
           <p style="margin:0 0 6px;font-weight:bold;color:#3a2e1f">¿Cómo se usa?</p>
           <ol style="margin:0;padding-left:18px;color:#555;line-height:1.7">
             <li>El destinatario visita <strong>ginori-index.html</strong> y elige su pieza.</li>
             <li>En el carrito, ingresa el código en el campo <em>"¿Tienes un Gift Card o bono?"</em>.</li>
             <li>El saldo se aplica automáticamente al total — sin pasos extra.</li>
           </ol>
         </div>
         ${txId ? `<p style="margin:8px 0 0;font-size:11px;color:#aaa">ID de transacción: <code>${txId}</code></p>` : ''}
         <p style="margin:12px 0 0;font-style:italic;color:#888;font-size:13px">Cada pieza es única, hecha a mano en Italia. Un regalo que perdura.</p>`,
        reference,
        btnCatalogo + btnWA,
        'confirm-title--success'
      );

      // Crear fila en Sheets (primer y único write) y luego confirmar/activar.
      const _confirmGift = () => Api.confirmarPagoWompi(reference, 'APPROVED', txId)
        .catch(err => console.warn('checkout.js: error confirmarPagoWompi gift', err));
      if (giftPayload) {
        Api.createGiftCard(giftPayload).then(_confirmGift)
          .catch(err => console.warn('checkout.js: error createGiftCard', err));
      } else {
        _confirmGift();
      }
      return;
    }

    // ── Flujo C: Producto pagado 100% con Gift Card ─────────
    if (giftPaid) {
      // Leer payload UNA SOLA VEZ — para pantalla Y para procesamiento servidor
      let pedidoPayload = null;
      try {
        const raw = sessionStorage.getItem('ginori_pending_pedido')
                 || localStorage.getItem('ginori_pending_pedido');
        if (raw) pedidoPayload = JSON.parse(raw);
      } catch(e) { console.warn('checkout.js: error leyendo payload gift paid', e); }
      try { sessionStorage.removeItem('ginori_pending_pedido'); } catch(e) {}
      try { localStorage.removeItem('ginori_pending_pedido'); }   catch(e) {}

      // Info del bono para pantalla — BUG-3C fix: mostrar saldo restante
      const _bonoCode      = pedidoPayload?.bono?.code      || '';
      const _bonoMonto     = pedidoPayload?.bono?.monto     || 0;
      const _bonoAvailable = pedidoPayload?.bono?.available || 0;
      const _saldoRest     = _bonoAvailable > 0 ? Math.max(0, _bonoAvailable - _bonoMonto) : 0;
      const _saldoLine     = _saldoRest > 0
        ? `Tu Gift Card aún tiene <strong>$${_saldoRest.toLocaleString('es-CO')}</strong> de saldo disponible para próximas compras.`
        : (_bonoCode ? 'Tu Gift Card ha sido canjeada completamente.' : '');
      const _bonoLine = _bonoCode
        ? `<br>Tu <strong>Gift Card ${_bonoCode}</strong> fue aplicada por <strong>$${_bonoMonto.toLocaleString('es-CO')}</strong>. ${_saldoLine}<br>`
        : '';

      setContent(
        '🏺', '¡Gracias por tu compra!',
        `¡Qué alegría tenerte de vuelta! Tu pedido ha sido confirmado y ya estamos trabajando en él con todo el cariño.<br><br>
         ${_bonoLine}
         En los próximos minutos recibirás un <strong>email de confirmación</strong> con el detalle completo de tu pedido.<br><br>
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
          influencerCodigo: pedidoPayload.influencerCodigo || null,
          influencerBase:   pedidoPayload.influencerBase   || 0,
          influencerPct:    pedidoPayload.influencerPct    || 0,
          discInfluencer:   pedidoPayload.discInfluencer   || 0,
          discGiftCard:     pedidoPayload.discGiftCard     || 0,
          disc3pct:         pedidoPayload.disc3pct         || 0,
          totalAPagar:      pedidoPayload.totalAPagar      || 0,
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
    // Leer payload ANTES de setContent para incluir info del bono en pantalla
    let pedidoPayload = null;
    try {
      const raw = sessionStorage.getItem('ginori_pending_pedido')
               || localStorage.getItem('ginori_pending_pedido');
      if (raw) pedidoPayload = JSON.parse(raw);
    } catch(e) { console.warn('checkout.js: error leyendo payload', e); }
    try { sessionStorage.removeItem('ginori_pending_pedido'); } catch(e) {}
    try { localStorage.removeItem('ginori_pending_pedido'); }   catch(e) {}

    // BUG-3C fix: mostrar info del bono (GC parcial) en pantalla de confirmación
    const _bA = pedidoPayload?.bono;
    const _bonoLineA = _bA?.code
      ? `<br>Tu <strong>Gift Card ${_bA.code}</strong> fue aplicada por <strong>$${(_bA.monto||0).toLocaleString('es-CO')}</strong>. ${
          (_bA.available && _bA.available > _bA.monto)
            ? `Saldo restante: <strong>$${(_bA.available - _bA.monto).toLocaleString('es-CO')}</strong>`
            : 'Tu Gift Card ha sido canjeada completamente.'
        }<br>`
      : '';

    setContent(
      '🏺', '¡Gracias por tu compra!',
      `¡Qué alegría! Tu pago fue confirmado exitosamente — cada pieza que elegiste es única, hecha a mano en Italia especialmente para ti.<br><br>
       ${_bonoLineA}
       En los próximos minutos recibirás un <strong>email de confirmación</strong> con el detalle completo de tu pedido.<br><br>
       Nuestro equipo se pondrá en contacto contigo para coordinar la entrega.<br><br>
       <em>Gracias por confiar en GINORI. Es un honor llevar cerámica italiana a tu mesa.</em>`,
      reference,
      btnCatalogo + btnWA,
      'confirm-title--success'
    );

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
        influencerCodigo: pedidoPayload.influencerCodigo || null,
        influencerBase:   pedidoPayload.influencerBase   || 0,
        influencerPct:    pedidoPayload.influencerPct    || 0,
        discInfluencer:   pedidoPayload.discInfluencer   || 0,
        discGiftCard:     pedidoPayload.discGiftCard     || 0,
        disc3pct:         pedidoPayload.disc3pct         || 0,
        totalAPagar:      pedidoPayload.totalAPagar      || 0,
        referencia:       reference,
      }).catch(err => console.warn('checkout.js: error confirmarPagoWompi', err));

    } else if (txId) {
      // ── Flujo D: fallback sin payload ─────────────────────
      Api.confirmarPagoWompi(reference, status, txId)
        .catch(err => console.warn('checkout.js: fallback confirmarPagoWompi', err));
    }

  } else if (status === 'DECLINED' || status === 'ERROR') {
    // Limpiar payloads huérfanos de pedidos normales
    try { sessionStorage.removeItem('ginori_pending_pedido'); } catch(e) {}
    try { localStorage.removeItem('ginori_pending_pedido'); }   catch(e) {}
    // Gift payload se conserva para que restoreGiftStep2 pueda pre-cargar el formulario en retry

    if (isGiftCard) {
      const btnRetryGift = `<a href="ginori-index.html?retryGift=1" class="btn btn-primary">Reintentar pago</a>`;
      setContent(
        '✗', 'Pago no completado',
        `Tu pago no pudo procesarse.<br><br>
         Puedes intentarlo nuevamente — el formulario quedará pre-cargado.<br><br>
         Si el problema persiste, escríbenos por WhatsApp y te ayudamos.`,
        reference, btnRetryGift + btnWA, 'confirm-title--error'
      );
    } else {
      // retryWompi=1: modal.js detecta este flag y reabre el checkout Wompi con carrito intacto
      const btnRetryWompi = `<a href="ginori-index.html?retryWompi=1" class="btn btn-primary">Intentar nuevamente</a>`;
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
