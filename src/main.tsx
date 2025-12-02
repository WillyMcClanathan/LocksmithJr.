import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/anim.css';
import { registerServiceWorker } from './utils/pwa';
import { initializeTheme } from './utils/theme';

registerServiceWorker();
initializeTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
