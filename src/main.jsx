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

/* Lift the loader as soon as the app has rendered and the fonts are in
   (not every image), showing it at least 0.35s so it doesn't flash, and
   never longer than 1.5s. Coming from bloxio.tech ↔ agrosense360 it is
   skipped (see index.html). */
const boot = document.getElementById('boot');
if (boot) {
  const shown = new Promise((r) => setTimeout(r, 350));
  const painted = new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const ready = Promise.all([shown, painted, document.fonts?.ready]);
  Promise.race([ready, new Promise((r) => setTimeout(r, 1500))]).then(() => {
    boot.classList.add('boot-done');
    setTimeout(() => boot.remove(), 1100);
  });
}
