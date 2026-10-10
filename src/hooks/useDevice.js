import { useEffect, useRef, useState } from 'react';
import { getStatus } from '../services/api';
import { historySample } from '../services/status';
import { stateTransitions } from '../services/events';

export function useDevice() {
  const [state, setState] = useState({ data: null, connection: 'loading', error: null, updatedAt: null });
  const [history, setHistory] = useState([]);
  const [events, setEvents] = useState([]);
  const lastStatus = useRef(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    lastStatus.current = null;
    let disposed = false;
    let timer;
    const controller = new AbortController();
    async function poll() {
      try {
        const data = await getStatus(controller.signal);
        if (disposed) return;
        const now = Date.now();
        const changes = stateTransitions(lastStatus.current, data, now);
        if (changes.length) setEvents(previous => [...changes.reverse(), ...previous].slice(0, 10));
        lastStatus.current = data;
        setState({ data, connection: 'connected', error: null, updatedAt: now });
        const sample = historySample(data, now);
        if (sample) setHistory(previous => [...previous, sample].slice(-300));
      } catch (error) {
        if (disposed) return;
        lastStatus.current = null;
        setState(previous => ({ ...previous, data: null, connection: error.message.startsWith('Backend returned') || error.message.includes('format') || error instanceof SyntaxError ? 'error' : 'disconnected', error: error.message }));
      } finally {
        if (!disposed) timer = setTimeout(poll, 1000);
      }
    }
    poll();
    return () => { disposed = true; clearTimeout(timer); controller.abort(); };
  }, [attempt]);
  return { ...state, history, events, retry: () => { setState(previous => ({ ...previous, connection: 'loading' })); setAttempt(value => value + 1); } };
}
