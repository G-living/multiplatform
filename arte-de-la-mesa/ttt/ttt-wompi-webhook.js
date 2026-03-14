// ttt-wompi-webhook.js
// Cloudflare Worker — Recibe confirmaciones de pago de Wompi y actualiza Google Sheets (TTT)
// Deploy: cd arte-de-la-mesa/ttt && npx wrangler deploy --config wrangler-ttt-webhook.toml
// Secrets: npx wrangler secret put WOMPI_EVENTS_SECRET --config wrangler-ttt-webhook.toml
//          npx wrangler secret put GOOGLE_SHEETS_WEBHOOK_URL --config wrangler-ttt-webhook.toml
//          npx wrangler secret put GAS_API_TOKEN --config wrangler-ttt-webhook.toml

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const payload = await request.json();
      console.log('Webhook recibido:', JSON.stringify(payload));

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
        id: transactionId,
        reference: pedidoId,
        amount_in_cents: amountInCents,
        status,
        payment_method_type,
      } = transaction;

      console.log(`Procesando APPROVED: ${transactionId} para pedido ${pedidoId}`);

      // Verificación de firma Wompi (X-Event-Checksum)
      const isValid = await verifyWompiSignature(request, payload, env.WOMPI_EVENTS_SECRET);
      if (!isValid) {
        console.error('Firma inválida — rechazando webhook');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
      }

      // Actualizar Google Sheets via GAS
      const sheetsUpdated = await updateGoogleSheets(
        env,
        pedidoId,
        transactionId,
        amountInCents,
        status,
        payment_method_type
      );

      if (sheetsUpdated) {
        console.log(`Sheets actualizado OK para pedido ${pedidoId}`);
        return new Response(
          JSON.stringify({ success: true, message: 'Order updated successfully', orderId: pedidoId, transactionId }),
          { status: 200 }
        );
      } else {
        console.error(`Fallo al actualizar Sheets para ${pedidoId}`);
        return new Response(
          JSON.stringify({ success: false, message: 'Sheets update failed', orderId: pedidoId }),
          { status: 500 }
        );
      }
    } catch (err) {
      console.error('Error procesando webhook:', err);
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

  const encoder = new TextEncoder();
  const keyData = encoder.encode(eventsSecret);
  const msgData = encoder.encode(concat);

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
 * Llama al GAS de TTT para confirmar el pago Wompi en Google Sheets
 */
async function updateGoogleSheets(env, pedidoId, transactionId, amountInCents, status, paymentMethod) {
  try {
    const SHEETS_URL = env.GOOGLE_SHEETS_WEBHOOK_URL;
    const API_TOKEN  = env.GAS_API_TOKEN;

    if (!SHEETS_URL) {
      console.error('GOOGLE_SHEETS_WEBHOOK_URL no configurado');
      return false;
    }
    if (!API_TOKEN) {
      console.error('GAS_API_TOKEN no configurado');
      return false;
    }

    const body = {
      action:        'updatePayment',
      _token:        API_TOKEN,
      data: {
        pedidoId,
        transactionId,
        amountPaid:    amountInCents / 100,
        paymentStatus: status,
        paymentMethod,
        paymentDate:   new Date().toISOString(),
      }
    };

    const response = await fetch(SHEETS_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Respuesta de Sheets:', result);
      return true;
    } else {
      console.error('Fallo en Sheets:', response.status, await response.text());
      return false;
    }
  } catch (error) {
    console.error('Error actualizando Sheets:', error);
    return false;
  }
}
