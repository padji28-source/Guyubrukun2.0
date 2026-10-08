import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { DashboardProvider } from './DashboardContext.tsx';
import './index.css';

// Gracefully handle and ignore benign Vite WebSocket/HMR disconnect errors in sandboxed environments
if (typeof window !== 'undefined') {
  const origConsoleError = console.error;
  console.error = (...args: any[]) => {
    const firstArg = typeof args[0] === 'string' ? args[0] : '';
    if (
      firstArg.includes('[vite]') &&
      (firstArg.includes('websocket') || firstArg.includes('WebSocket') || firstArg.includes('hmr') || firstArg.includes('HMR'))
    ) {
      return;
    }
    origConsoleError.apply(console, args);
  };

  if ('serviceWorker' in navigator && (import.meta as any).env?.DEV) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    }).catch(() => {});
  }

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
    <DashboardProvider>
      <App />
    </DashboardProvider>
  </StrictMode>,
);


