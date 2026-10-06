import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)

/* Lift the loader once the page, its fonts and its first images are in,
   held for at least 0.9s so the star has time to glint, and never longer
   than 3.5s on a slow connection. */
const boot = document.getElementById('boot');
if (boot) {
  const shown = new Promise((r) => setTimeout(r, 900));
  const loaded = new Promise((r) => (document.readyState === 'complete' ? r() : window.addEventListener('load', r, { once: true })));
  const ready = Promise.all([shown, loaded, document.fonts?.ready]);
  Promise.race([ready, new Promise((r) => setTimeout(r, 3500))]).then(() => {
    boot.classList.add('boot-done');
    setTimeout(() => boot.remove(), 1100);
  });
}
