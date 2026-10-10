export const RISK_LEVELS = ['SAFE', 'MEDIUM', 'HIGH', 'EXTREME'];
export const PERSONAS = ['GENERAL', 'WORKER', 'ELDERLY', 'CHILD'];
const enumValue = (value, allowed) => typeof value === 'string' && allowed.includes(value.toUpperCase()) ? value.toUpperCase() : null;
const numeric = value => typeof value === 'number' && Number.isFinite(value) ? value : null;

export function normalizeStatus(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || !['occupancy', 'persona', 'risk', 'bridge_connected'].some(key => key in raw)) {
    throw new Error('The backend returned an unexpected status format.');
  }
  return {
    occupancy: enumValue(raw.occupancy, ['OCCUPIED', 'EMPTY']),
    persona: enumValue(raw.persona, PERSONAS),
    risk: enumValue(raw.risk, RISK_LEVELS),
    bridge_connected: typeof raw.bridge_connected === 'boolean' ? raw.bridge_connected : null,
    ...Object.fromEntries(['temperature', 'humidity', 'heat_index', 'radiant_temperature', 'light', 'activity'].map(key => [key, numeric(raw[key])])),
    fan_status: typeof raw.fan_status === 'boolean' ? (raw.fan_status ? 'ON' : 'OFF') : enumValue(raw.fan_status, ['ON', 'OFF']),
    ai_mode: enumValue(raw.ai_mode, ['OFFLINE', 'ONLINE']),
    ollama_status: enumValue(raw.ollama_status, ['ONLINE', 'OFFLINE', 'CHECKING']),
  };
}

export function historySample(data, time = Date.now()) {
  // A disconnected bridge cannot vouch for the freshness of hardware readings.
  if (data.bridge_connected !== true) return null;
  return { time, temperature: data.temperature, humidity: data.humidity, heat_index: data.heat_index, risk: data.risk === null ? null : RISK_LEVELS.indexOf(data.risk) };
}
