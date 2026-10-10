import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import './experience.css';
import './lab/lab.css';

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // The live site remains usable if this browser disallows offline caching.
    });
  }, { once: true });
}
