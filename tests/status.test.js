import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeStatus, historySample } from '../src/services/status.js';

const status = { occupancy: 'OCCUPIED', persona: 'WORKER', risk: 'HIGH', bridge_connected: true };
test('normalizes the current hardware contract without inventing future values', () => {
  const result = normalizeStatus(status);
  assert.equal(result.risk, 'HIGH');
  assert.equal(result.persona, 'WORKER');
  for (const key of ['temperature','humidity','heat_index','radiant_temperature','light','activity','fan_status','ai_mode','ollama_status']) assert.equal(result[key], null);
});
test('rejects non-status payloads and malformed JSON shapes', () => {
  for (const value of [null, [], 'OK', {}, { detail: 'Not found' }]) assert.throws(() => normalizeStatus(value));
});
test('never converts unknown risk, persona or occupancy to a reassuring default', () => {
  const result = normalizeStatus({ ...status, occupancy: 'UNKNOWN', risk: 'LOW', persona: 'ADMIN', bridge_connected: 'true' });
  assert.equal(result.risk, null);
  assert.equal(result.occupancy, null);
  assert.equal(result.persona, null);
  assert.equal(result.bridge_connected, null);
});
test('optional readings accept zero and reject numeric strings and non-finite numbers', () => {
  const result = normalizeStatus({ ...status, temperature: 0, humidity: '67', light: NaN, heat_index: Infinity, fan_status: false });
  assert.equal(result.temperature, 0);
  assert.equal(result.humidity, null);
  assert.equal(result.light, null);
  assert.equal(result.heat_index, null);
  assert.equal(result.fan_status, 'OFF');
});
test('does not record unverified or disconnected hardware as fresh history', () => {
  assert.equal(historySample(normalizeStatus({ ...status, bridge_connected: false })), null);
  assert.equal(historySample(normalizeStatus({ risk: 'SAFE' })), null);
});
test('records real status history, including risk changes and case normalization', () => {
  const result = historySample(normalizeStatus({ ...status, risk:'safe', temperature:32.8 }), 1000);
  assert.deepEqual(result, { time:1000, temperature:32.8, humidity:null, heat_index:null, risk:0 });
});
