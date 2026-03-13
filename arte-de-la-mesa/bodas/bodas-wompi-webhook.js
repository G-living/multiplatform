// bodas-wompi-webhook.js
// Cloudflare Worker — Recibe confirmaciones de pago de Wompi y confirma en Google Sheets (Bodas)
// Deploy: cd arte-de-la-mesa/bodas && npx wrangler deploy --config wrangler-bodas-webhook.toml
// Secrets: npx wrangler secret put WOMPI_EVENTS_SECRET --config wrangler-bodas-webhook.toml
//          npx wrangler secret put GAS_URL            --config wrangler-bodas-webhook.toml
//          npx wrangler secret put GAS_API_TOKEN      --config wrangler-bodas-webhook.toml

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const payload = await request.json();
      console.log('Webhook Bodas recibido:', JSON.stringify(payload));

      const transaction = payload.data?.transaction;
      if (!transaction) {
        console.log('No hay datos de transacción en el payload');
        return new Response(JSON.stringify({ message: 'No transaction data' }), { status: 200 });
      }

      // Solo procesar transacciones APPROVED
      if (transaction.status !== 'APPROVED') {
        console.log(`Estado ignorado: ${transaction.status}`);
        return new Response(JSON.stringify({ message: 'Transaction not approved' }), { status: 200 });
      }

      const {
        id: transactionId,   // wompiRef → col K en Sheets
        reference: pagoId,   // pagoId  → PG-XXXXXXXX creado en createPedidoInvitado
      } = transaction;

      console.log(`Procesando APPROVED: ${transactionId} para pagoId ${pagoId}`);

      // Verificación de firma Wompi (X-Event-Checksum)
      const isValid = await verifyWompiSignature(request, payload, env.WOMPI_EVENTS_SECRET);
      if (!isValid) {
        console.error('Firma inválida — rechazando webhook');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
      }

      // Confirmar pago en Google Sheets via GAS (Bodas)
      const confirmed = await confirmarPagoGAS(env, pagoId, transactionId);

      if (confirmed) {
        console.log(`Pago confirmado OK: pagoId=${pagoId}`);
        return new Response(
          JSON.stringify({ success: true, pagoId, transactionId }),
          { status: 200 }
        );
      } else {
        console.error(`Fallo al confirmar pago: pagoId=${pagoId}`);
        return new Response(
          JSON.stringify({ success: false, pagoId }),
          { status: 500 }
        );
      }
    } catch (err) {
      console.error('Error procesando webhook Bodas:', err);
      return new Response(
        JSON.stringify({ error: 'Webhook processing failed', message: err.message }),
        { status: 500 }
      );
    }
  }
};

/**
 * Verifica la firma del webhook de Wompi (X-Event-Checksum + properties dinámicas)
 */
async function verifyWompiSignature(request, payload, eventsSecret) {
  if (!eventsSecret) {
    console.error('WOMPI_EVENTS_SECRET no configurado');
    return false;
  }

  const receivedChecksum = request.headers.get('x-event-checksum');
  if (!receivedChecksum) {
    console.error('Falta header X-Event-Checksum');
    return false;
  }

  const properties = payload.data?.transaction?.signature?.properties || [];
  if (!properties.length) {
    console.error('No hay signature.properties en el payload');
    return false;
  }

  let concat = '';
  for (const prop of properties) {
    const value = prop.split('.').reduce((obj, key) => obj?.[key], payload.data) ?? '';
    concat += value;
  }
  concat += eventsSecret;

  const encoder  = new TextEncoder();
  const keyData  = encoder.encode(eventsSecret);
  const msgData  = encoder.encode(concat);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  const computedChecksum = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const isValid = computedChecksum === receivedChecksum.toLowerCase();
  if (!isValid) {
    console.error('Firma inválida — esperada:', computedChecksum, '— recibida:', receivedChecksum.toLowerCase());
  } else {
    console.log('Firma verificada OK');
  }
  return isValid;
}

/**
 * Llama al GAS de Bodas con action=confirmarPagoInvitado
 */
async function confirmarPagoGAS(env, pagoId, wompiRef) {
  try {
    const GAS_URL   = env.GAS_URL;
    const API_TOKEN = env.GAS_API_TOKEN;

    if (!GAS_URL) {
      console.error('GAS_URL no configurado');
      return false;
    }
    if (!API_TOKEN) {
      console.error('GAS_API_TOKEN no configurado');
      return false;
    }

    const body = {
      action:   'confirmarPagoInvitado',
      _token:   API_TOKEN,
      pagoId,
      wompiRef,
    };

    const response = await fetch(GAS_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Respuesta GAS Bodas:', result);
      return result.success === true;
    } else {
      console.error('Fallo en GAS Bodas:', response.status, await response.text());
      return false;
    }
  } catch (error) {
    console.error('Error confirmando pago en GAS:', error);
    return false;
  }
}
