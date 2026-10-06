import { Check } from 'lucide-react'

/* The site's look in light mode. Saved like any other section: pick one,
   save the draft, publish, and the site rebuilds with it. */
const HEROES = [
  {
    id: 'night',
    title: 'Night hero',
    sub: 'Current. Light mode keeps the dark-mode sky, gold glow and stars; the light page starts at the planet.',
    img: '/appearance/night.jpg',
  },
  {
    id: 'morning',
    title: 'Morning glow',
    sub: 'The earlier light mode: a pale green morning sky with a light planet and a gold rim.',
    img: '/appearance/morning.jpg',
  },
]

export default function AppearancePicker({ value, onChange }) {
  const current = value?.lightHero === 'morning' ? 'morning' : 'night'
  return (
    <div>
      <h2 className="font-bold">Light-mode hero</h2>
      <p className="mt-1 text-sm text-muted">How the top of the home page looks when a visitor uses light mode. Dark mode is the same either way.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Light-mode hero">
        {HEROES.map((h) => {
          const on = h.id === current
          return (
            <button key={h.id} type="button" role="radio" aria-checked={on}
              onClick={() => onChange({ ...value, lightHero: h.id })}
              className={`group overflow-hidden rounded-2xl border text-left transition ${on ? 'border-accent ring-2 ring-accent/40' : 'border-line hover:border-ink/30'}`}>
              <img src={h.img} alt="" width="720" height="450" className="aspect-[16/10] w-full object-cover" />
              <div className="flex items-start gap-3 p-4">
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${on ? 'border-accent bg-accent text-on-accent' : 'border-line'}`}>
                  {on && <Check className="h-3.5 w-3.5" />}
                </span>
                <span>
                  <span className="block font-semibold">{h.title}</span>
                  <span className="mt-0.5 block text-sm text-muted">{h.sub}</span>
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
