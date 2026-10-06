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

/* Lift the loader only once the page has really loaded: the route's page
   has rendered (bx:page-ready from App), the fonts are in, the window has
   finished loading, and every image on the first screen has arrived. This
   includes moving between bloxio.tech and agrosense360.bloxio.tech. Shown
   at least 0.35s so it never flashes; gives up after 10s on a very slow
   connection so the site is never stuck behind it. */
const boot = document.getElementById('boot');
// a frame later, or straight away in a background tab (frames pause there)
const nextFrame = (cb) => (document.hidden ? setTimeout(cb, 0) : requestAnimationFrame(cb));
if (boot) {
  const shown = new Promise((r) => setTimeout(r, 350));
  const pageReady = new Promise((r) => window.addEventListener('bx:page-ready', r, { once: true }));
  const windowLoaded = new Promise((r) => (document.readyState === 'complete' ? r() : window.addEventListener('load', r, { once: true })));
  const firstScreenImages = pageReady.then(() => new Promise((r) => nextFrame(() => {
    const pending = [...document.images].filter((img) => {
      const box = img.getBoundingClientRect();
      return !img.complete && box.top < window.innerHeight && box.bottom > 0;
    });
    Promise.all(pending.map((img) => new Promise((done) => {
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    }))).then(r);
  })));
  const ready = Promise.all([shown, pageReady, windowLoaded, firstScreenImages, document.fonts?.ready]);
  Promise.race([ready, new Promise((r) => setTimeout(r, 10000))]).then(() => {
    nextFrame(() => {
      boot.classList.add('boot-done');
      setTimeout(() => boot.remove(), 1100);
    });
  });
}
