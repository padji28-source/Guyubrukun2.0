import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Gracefully handle and ignore benign Vite WebSocket/HMR disconnect errors in sandboxed environments
if (typeof window !== 'undefined') {
  // Override console.error and console.warn to suppress benign [vite] websocket warnings/errors
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = function (...args) {
    const msg = args.map(arg => {
      if (!arg) return '';
      if (typeof arg === 'object') return arg.message || JSON.stringify(arg);
      return String(arg);
    }).join(' ');

    if (
      msg.includes('[vite]') || 
      msg.includes('WebSocket') || 
      msg.includes('ws://') || 
      msg.includes('wss://') || 
      msg.includes('failed to connect') ||
      msg.includes('HMR')
    ) {
      // Silently ignore benign HMR errors
      return;
    }
    originalError.apply(console, args);
  };

  console.warn = function (...args) {
    const msg = args.map(arg => {
      if (!arg) return '';
      if (typeof arg === 'object') return arg.message || JSON.stringify(arg);
      return String(arg);
    }).join(' ');

    if (
      msg.includes('[vite]') || 
      msg.includes('WebSocket') || 
      msg.includes('ws://') || 
      msg.includes('wss://') || 
      msg.includes('failed to connect') ||
      msg.includes('HMR')
    ) {
      // Silently ignore benign HMR warnings
      return;
    }
    originalWarn.apply(console, args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason || '';
    const reasonStr = typeof reason === 'string' ? reason : (reason.message || '');
    if (
      reasonStr.includes('WebSocket') || 
      reasonStr.includes('vite') || 
      reasonStr.includes('ws://') || 
      reasonStr.includes('wss://')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (
      msg.includes('WebSocket') || 
      msg.includes('vite') || 
      msg.includes('ws://') || 
      msg.includes('wss://')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

