import { useEffect, useState } from 'react';
import { getStatus } from '../services/api';
import { historySample } from '../services/status';

export function useDevice() {
  const [state, setState] = useState({ data: null, connection: 'loading', error: null, updatedAt: null });
  const [history, setHistory] = useState([]);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let disposed = false;
    let timer;
    const controller = new AbortController();
    async function poll() {
      try {
        const data = await getStatus(controller.signal);
        if (disposed) return;
        const now = Date.now();
        setState({ data, connection: 'connected', error: null, updatedAt: now });
        const sample = historySample(data, now);
        if (sample) setHistory(previous => [...previous, sample].slice(-300));
      } catch (error) {
        if (disposed) return;
        setState(previous => ({ ...previous, data: null, connection: error.message.startsWith('Backend returned') || error.message.includes('format') || error instanceof SyntaxError ? 'error' : 'disconnected', error: error.message }));
      } finally {
        if (!disposed) timer = setTimeout(poll, 1000);
      }
    }
    poll();
    return () => { disposed = true; clearTimeout(timer); controller.abort(); };
  }, [attempt]);
  return { ...state, history, retry: () => { setState(previous => ({ ...previous, connection: 'loading' })); setAttempt(value => value + 1); } };
}
