import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

// Intercept Firebase Quota logs so they don't break the IDE or flood the user
const originalConsoleError = console.error;
console.error = (...args) => {
  const argStr = String(args[0] || '');
  if (
    argStr.includes('Quota limit exceeded') || 
    argStr.includes('resource-exhausted') ||
    args[0]?.code === 'resource-exhausted' ||
    args[0]?.message?.includes('Quota limit exceeded')
  ) {
    return; // Suppress expected free tier quota warnings
  }
  originalConsoleError(...args);
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('SW registered: ', registration);
    }).catch((registrationError) => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
