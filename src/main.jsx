import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

function showErrorOverlay(err) {
  try {
    const existing = document.getElementById('global-error-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'global-error-overlay';
    overlay.style.position = 'fixed';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.background = 'rgba(5,8,15,0.95)';
    overlay.style.color = '#fff';
    overlay.style.zIndex = '99999';
    overlay.style.padding = '24px';
    overlay.style.fontFamily = 'monospace';
    overlay.style.overflow = 'auto';
    overlay.innerHTML = `<h2 style="margin:0 0 12px 0;color:#ff6b6b">Runtime Error</h2><pre style="white-space:pre-wrap">${String(err && (err.stack || err))}</pre>`;
    document.body.appendChild(overlay);
  } catch (e) {
    // ignore
  }
}

window.addEventListener('error', (e) => {
  console.error('Global error captured', e.error || e.message);
  showErrorOverlay(e.error || e.message);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled rejection', e.reason);
  showErrorOverlay(e.reason || e);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
