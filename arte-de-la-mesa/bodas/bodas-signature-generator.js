// bodas-signature-generator.js
// Cloudflare Worker — Genera firma SHA-256 de integridad para Wompi (Bodas)
// Deploy: cd arte-de-la-mesa/bodas && npx wrangler deploy --config wrangler-bodas-signature.toml
// Secrets:
//   npx wrangler secret put WOMPI_INTEGRITY_KEY --config wrangler-bodas-signature.toml
//     Sandbox value: test_integrity_C7XirmACW88BPGAnYUYnxVQLGJmsOIt2
//   npx wrangler secret put API_TOKEN --config wrangler-bodas-signature.toml
//     Value: bodas-GLv2-XkP9mTqR7hNwJ3sE

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://g-living.github.io',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const body = await request.json();
      const { reference, amountInCents, currency = 'COP', apiToken } = body;

      // ── Validar API token ─────────────────────────────────────
      if (!env.API_TOKEN || apiToken !== env.API_TOKEN) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: corsHeaders,
        });
      }

      // ── Validar parámetros requeridos ─────────────────────────
      if (!reference || !amountInCents || typeof amountInCents !== 'number' || amountInCents <= 0) {
        return new Response(JSON.stringify({ error: 'Missing or invalid reference/amountInCents' }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      const integrityKey = env.WOMPI_INTEGRITY_KEY;
      if (!integrityKey) {
        return new Response(JSON.stringify({ error: 'Server configuration error' }), {
          status: 500,
          headers: corsHeaders,
        });
      }

      // ── Generar firma SHA-256 ─────────────────────────────────
      const concat = `${reference}${amountInCents}${currency}${integrityKey}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(concat);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      return new Response(
        JSON.stringify({ integritySignature: signature, reference, amountInCents, currency }),
        { status: 200, headers: corsHeaders },
      );
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Signature generation failed' }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  },
};
