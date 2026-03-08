/* ===== IMOLARTE V2 - checkout.js =====
 * Maneja confirmación post-Wompi.
 * FIX v3: Wompi sandbox envía ?id=...&env=test sin transaction_status.
 *   Se consulta estado via API Wompi si no viene en URL.
 *   Usa Api.confirmarPagoWompi() → api.js → Apps Script (coherente).
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

  // Sin parámetros de Wompi → index
  if (!status && !txId) { window.location.replace('imolarte-index.html'); return; }

  // Si viene status en URL → procesar directo
  if (status) {
    _handleStatus(status, reference, txId);
    return;
  }

  // Solo viene txId (caso sandbox) → consultar estado a Wompi
  _fetchTransactionStatus(txId).then(tx => {
    _handleStatus(tx.status, tx.reference || reference, txId);
  }).catch(() => {
    _handleStatus('UNKNOWN', reference, txId);
  });
});

// ── Consulta estado a Wompi API ──────────────────────────────
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

// ── Muestra UI según estado y notifica Sheets ────────────────
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
    // Vaciar carrito en pago exitoso
    try { localStorage.removeItem(IMOLARTE_CONFIG.cart.storageKey); } catch(e) {}

    setContent(
      '🏺', '¡Gracias por tu compra!',
      `Tu pago fue confirmado exitosamente.<br><br>
       En los próximos minutos recibirás un <strong>email de confirmación</strong> con el detalle de tu pedido.
       Nuestro equipo se pondrá en contacto contigo para coordinar la entrega.<br><br>
       Cada pieza que elegiste es única — <em>hecha a mano en Italia, especialmente para ti.</em>`,
      reference, btnCatalogo, 'confirm-title--success'
    );

    // Recuperar payload guardado por modal.js antes de redirigir a Wompi.
    // Se guarda en sessionStorage (primario) y localStorage (backup).
    // El redirect cross-origin de Wompi puede limpiar sessionStorage — en ese caso
    // se usa localStorage. Ambos se borran después de leer para evitar reutilización.
    let pedidoPayload = null;
    try {
      const rawSession = sessionStorage.getItem('imolarte_pending_pedido');
      const rawLocal   = localStorage.getItem('imolarte_pending_pedido');
      const raw = rawSession || rawLocal;
      if (raw) {
        pedidoPayload = JSON.parse(raw);
      }
    } catch(e) { console.warn('checkout.js: error leyendo payload', e); }
    // Limpiar ambos storages siempre — independientemente de si había payload
    try { sessionStorage.removeItem('imolarte_pending_pedido'); } catch(e) {}
    try { localStorage.removeItem('imolarte_pending_pedido'); }   catch(e) {}

    if (pedidoPayload && pedidoPayload.referencia === reference) {
      // ── Flujo Wompi (60% o 100%, con o sin bono parcial) ──────────
      // Secuencia encadenada con await para garantizar que todas las
      // llamadas HTTP completan antes de que el browser descargue la página.
      (async () => {
        try {
          await Api.createPedidoWompi(
            { cliente: pedidoPayload.cliente, entrega: pedidoPayload.entrega },
            pedidoPayload.productos,
            {
              formaPago:        pedidoPayload.formaPago,
              subtotal:         pedidoPayload.subtotal,
              descuento:        pedidoPayload.descuento,
              total:            pedidoPayload.total,
              porcentajePagado: pedidoPayload.porcentajePagado,
              referencia:       reference,
              campaniaId:       pedidoPayload.campaniaId || '',
              _skipEmail:       true,
            }
          );
        } catch(err) {
          console.warn('checkout.js: error createPedidoWompi', err);
        }
        // Redimir bono si aplica — await para que no se pierda
        if (pedidoPayload.bono?.code) {
          try { await Api.redeemDono(pedidoPayload.bono.code, pedidoPayload.bono.monto, reference); }
          catch(err) { console.warn('checkout.js: error redeemDono', err); }
        }
        // Confirmar pago — await garantiza que llega a Sheets antes de cualquier navegación
        try { await Api.confirmarPagoWompi(reference, status, txId); }
        catch(err) { console.warn('checkout.js: error confirmarPagoWompi', err); }
      })();

    } else if (txId) {
      // ── Fallback Wompi: no hay payload pero hay txId — solo confirmar ──
      Api.confirmarPagoWompi(reference, status, txId);

    }
    // ── Flujo Gift Card total: pedido ya procesado en modal.js ──────
    // No hacer nada — create + redeem + confirmar ya ocurrieron antes
    // del redirect. Solo mostrar pantalla de agradecimiento (ya hecho arriba).

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
    Api.confirmarPagoWompi(reference, status, txId);

  } else {
    setContent(
      '?', 'Estado desconocido',
      `No pudimos verificar el estado de tu pago.<br>
       Por favor contáctanos con tu referencia y te ayudamos.`,
      reference, btnCatalogo, null
    );
  }
}
