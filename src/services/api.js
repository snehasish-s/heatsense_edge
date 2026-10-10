import { normalizeStatus } from './status';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');
export const CHAT_ENABLED = import.meta.env.VITE_CHAT_ENABLED === 'true';
// Vite forwards development requests to the configured backend origin. This
// supports existing firmware backends without requiring a CORS configuration.
const REQUEST_BASE_URL = import.meta.env.DEV ? '/device-api' : API_BASE_URL;

async function request(path, options = {}) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (options.signal?.aborted) controller.abort();
  options.signal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(abort, 30000);
  try {
    const response = await fetch(`${REQUEST_BASE_URL}${path}`, { ...options, signal: controller.signal, headers: { Accept: 'application/json', ...options.headers } });
    if (!response.ok) throw new Error(`Backend returned HTTP ${response.status}.`);
    return await response.json();
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', abort);
  }
}

export const getStatus = async signal => normalizeStatus(await request('/api/status', { signal }));
export async function sendChat(message, signal) {
  const result = await request('/api/chat', { method: 'POST', signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }) });
  if (typeof result?.response !== 'string' || !result.response.trim()) throw new Error('The assistant returned an empty response.');
  const mode = typeof result.mode === 'string' ? result.mode.toLowerCase() : null;
  return {
    response: result.response,
    mode: mode === 'local_system' || mode === 'offline_ai' ? mode : null,
    provider: typeof result.provider === 'string' ? result.provider : null,
    model: typeof result.model === 'string' ? result.model : null,
  };
}

// Replace this adapter when the backend provides an authenticated persona endpoint.
export async function setPersona() {
  throw new Error('Persona control is available on the physical device.');
}
