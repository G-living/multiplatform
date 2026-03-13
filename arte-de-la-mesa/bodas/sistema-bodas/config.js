/**
 * config.js — Configuración global Sistema Bodas G-Living v3
 * ============================================================
 * Cargar ANTES de cualquier script inline en todas las páginas
 * del sistema (registro, dashboard, guest, checkout).
 *
 * IMPORTANTE: después de desplegar el GAS como webapp, reemplazar
 * GAS_URL con la URL real de la implementación.
 * ============================================================
 */
const BODAS_V3_CONFIG = {

  // ── Backend ────────────────────────────────────────────────
  GAS_URL: 'https://script.google.com/macros/s/AKfycbzuvc8d_EpzzuiiWX9FRudG9X7EtuZ5z2-6oxmKOjehOdKyzkj5zD9DnrtEwk6EEY1W/exec',  // reemplazar tras desplegar code.gs como webapp
  API_TOKEN: 'bodas-GLv3-SbQ8rKpX2mTn4wYz',

  // ── Wompi ──────────────────────────────────────────────────
  WOMPI_PUB_KEY: 'pub_prod_PENDIENTE',   // clave pública Wompi producción
  SIGN_WORKER:   'https://mlg-signature-generator.filippo-massara2016.workers.dev/bodas',

  // ── URLs internas ──────────────────────────────────────────
  URL_REGISTRO:  'registro.html',
  URL_DASHBOARD: 'dashboard-esposos.html',
  URL_GUEST:     'guest.html',
  URL_CHECKOUT:  'guest-checkout.html',

  // ── Google Maps / Places ───────────────────────────────────
  GOOGLE_MAPS_KEY: 'AIzaSyBCHhJjFYCVJ-Yq_nX0VY326Kt-_Khu7r0',

  // ── Sesión ─────────────────────────────────────────────────
  SESSION_KEY:       'bodas_v3_session',     // localStorage key (esposos)
  GUEST_SESSION_KEY: 'bodas_v3_guest',       // localStorage key (invitados)
  ONBOARDING_KEY:    'bodas_v3_onboarding',  // localStorage key (progreso wizard toasts)

  // ── Límites ────────────────────────────────────────────────
  MIN_ITEMS_TO_FINALIZE: 1,   // mínimo de items para poder finalizar la lista
};
