import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, CheckCircle2, Eye, Loader2, Pencil, RotateCcw } from 'lucide-react';
import { Button, Brand, BrandText } from '../components/ui';
import { card, inputCls } from '../lib/ui-utils';
import { COMPANY } from '../content/site';
import { postJSON } from '../lib/api';

/* Answers go to a Google Sheet through an Apps Script web app. Field names
   below are the sheet's columns: keep them unchanged. */
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzr7lB1Rc572hvOqwYs4Xbo7oNSbVeDMNubvSymy9JbsBEChYqc8upG6KUCfv6iMKpF/exec';

const initialFormData = {
  respondentType: '',
  yearsExperience: '',
  location: '',
  monitoringChallenges: '',
  biggestChallenges: [],
  detectionMethods: [],
  usefulnessRating: '',
  valuableFeatures: [],
  considerUsing: '',
  willingToPay: '',
  paymentModel: '',
  futureProducts: [],
  openToNewTech: '',
  investmentInterest: '',
  earlyAccess: '',
  email: '',
  respondentOther: '',
  biggestChallengesOther: '',
  detectionMethodsOther: '',
  knowMore: '',
  questions: '',
};

const YES_NO_MAYBE = ['Yes', 'No', 'Maybe'];
const KNOW_MORE = "Yes, I'd like to learn more";

/* The survey, as data. `other` adds a "please specify" field when its
   trigger option is chosen. */
const STEPS = [
  {
    title: 'About you',
    lead: 'Tell us a little about your background.',
    fields: [
      { n: 1, q: 'Which best describes you?', type: 'radio', name: 'respondentType',
        options: ['Farmer', 'Agribusiness owner', 'Agricultural consultant / extension worker', 'Agricultural student / researcher', 'Investor', 'Tech enthusiast', 'Other'],
        other: { trigger: 'Other', name: 'respondentOther', placeholder: 'Please specify…' } },
      { n: 2, q: 'Years of experience in agriculture or agribusiness', type: 'radio', name: 'yearsExperience',
        options: ['Less than 1 year', '1–3 years', '4–10 years', '10+ years', 'Not applicable'] },
      { n: 3, q: 'Where are you located?', type: 'text', name: 'location', placeholder: 'e.g. Lagos, Nigeria' },
    ],
  },
  {
    title: 'Current challenges',
    lead: 'Help us understand the problems you face.',
    fields: [
      { n: 4, q: 'Do you face challenges monitoring your farm or crops effectively?', type: 'radio', name: 'monitoringChallenges',
        options: ['Yes, frequently', 'Sometimes', 'Rarely', 'No'] },
      { n: 5, q: 'What are your biggest challenges?', hint: 'Select all that apply', type: 'check', name: 'biggestChallenges',
        options: ['Crop diseases', 'Poor yield despite effort', 'Soil quality or nutrient imbalance', 'Lack of real-time farm data', 'Weather unpredictability', 'High labor cost', 'Late detection of farm problems', 'Other'],
        other: { trigger: 'Other', name: 'biggestChallengesOther', placeholder: 'Please specify…' } },
      { n: 6, q: 'How do you currently detect crop diseases or farm issues?', hint: 'Select all that apply', type: 'check', name: 'detectionMethods',
        options: ['Manual inspection', 'Advice from experts', 'Trial and error', 'No structured method', 'Other'],
        other: { trigger: 'Other', name: 'detectionMethodsOther', placeholder: 'Please specify…' } },
    ],
  },
  {
    title: 'AgroSense360',
    lead: 'Your honest opinion on the product.',
    note: 'AgroSense360 combines AI, cameras and sensors to monitor crop health, soil conditions and the farm environment, and sends alerts and recommendations.',
    fields: [
      { n: 7, q: 'How useful would AgroSense360 be to you?', type: 'rating', name: 'usefulnessRating', low: 'Not useful', high: 'Extremely useful' },
      { n: 8, q: 'Which features would you find most valuable?', hint: 'Select all that apply', type: 'check', name: 'valuableFeatures',
        options: ['AI-based crop disease detection', 'Soil moisture & nutrient monitoring', 'Early warning alerts (mobile)', 'Yield improvement recommendations', 'Remote farm monitoring', 'Farm data reports', 'Other'] },
      { n: 9, q: 'Would you consider using AgroSense360?', type: 'radio', name: 'considerUsing', options: YES_NO_MAYBE },
    ],
  },
  {
    title: 'Pricing',
    lead: 'How you would prefer to pay.',
    fields: [
      { n: 10, q: 'If this system delivers real value, would you be willing to pay for it?', type: 'radio', name: 'willingToPay', options: YES_NO_MAYBE },
      { n: 11, q: 'What payment model would you prefer?', type: 'radio', name: 'paymentModel',
        options: ['One-time purchase', 'Subscription (monthly/annually)', 'Pay-per-use', 'Not sure'] },
    ],
  },
  {
    title: 'Future products',
    lead: 'What else interests you.',
    fields: [
      { n: 12, q: 'Which technology products would you be interested in beyond agriculture?', hint: 'Select all that apply', type: 'check', name: 'futureProducts',
        options: ['Smart electronic devices', 'Agricultural drones & accessories', 'Smart lighting (e.g., drone lights, industrial lights)', 'Security & surveillance devices', 'Energy & power systems', 'Other electronics'] },
      { n: 13, q: 'Are you open to testing new technology products from a Nigerian tech company?', type: 'radio', name: 'openToNewTech', options: YES_NO_MAYBE },
    ],
  },
  {
    title: 'Investment',
    lead: 'Would you like to be part of the journey?',
    fields: [
      { n: 14, q: 'Would you be interested in investing in or supporting the development of products like this?', type: 'radio', name: 'investmentInterest',
        options: [KNOW_MORE, 'Possibly', 'No'],
        other: { trigger: KNOW_MORE, name: 'knowMore', placeholder: 'What would you like to know about AgroSense360?' } },
    ],
  },
  {
    title: 'Early access',
    lead: 'Be the first to know when we launch.',
    fields: [
      { n: 15, q: 'What questions do you have about BLOXio Nigeria Limited, our products or services?', type: 'text', name: 'questions', placeholder: 'Ask us anything' },
      { n: 16, q: 'Would you like early access, updates, or to be contacted when we launch?', type: 'radio', name: 'earlyAccess', options: ['Yes', 'No'] },
      { n: 17, q: 'Email address', optional: true, type: 'email', name: 'email', placeholder: 'you@example.com' },
    ],
  },
];
const TOTAL = STEPS.length;
const REVIEW = TOTAL + 1;

/* ── Fields ─────────────────────────────────────────────────────── */

function Choice({ type, name, value, checked, onChange, label }) {
  return (
    <label
      className={`group flex cursor-pointer items-center gap-3 rounded-[10px] border px-4 py-3 transition-colors duration-200 ${
        checked ? 'border-accent bg-accent/8' : 'border-line hover:border-accent/50 hover:bg-accent/4'
      }`}
    >
      <input type={type} name={name} value={value} checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-colors duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40 ${
          type === 'radio' ? 'rounded-full' : 'rounded-[5px]'
        } ${checked ? 'border-accent bg-accent text-on-accent' : 'border-muted/50 group-hover:border-accent/70'}`}
        aria-hidden="true"
      >
        {checked && (type === 'radio' ? <span className="h-2 w-2 rounded-full bg-on-accent" /> : <Check size={12} strokeWidth={3.5} />)}
      </span>
      <span className={`text-sm leading-snug ${checked ? 'font-semibold text-ink' : 'text-ink/85'}`}>{label}</span>
    </label>
  );
}

function Question({ field, data, onChange }) {
  const { n, q, hint, optional, type, name, options, other, placeholder } = field;
  const legend = (
    <legend className="mb-4 flex items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/12 font-mono text-xs font-semibold text-accent">{n}</span>
      <span className="font-semibold leading-snug text-ink sm:text-[17px]">
        <BrandText>{q}</BrandText>
        {hint && <span className="mt-1 block text-sm font-normal text-muted">{hint}</span>}
        {optional && <span className="ml-2 text-sm font-normal text-muted">Optional</span>}
      </span>
    </legend>
  );

  if (type === 'text' || type === 'email') {
    return (
      <fieldset>
        {legend}
        <input type={type} name={name} value={data[name]} onChange={onChange} placeholder={placeholder}
          autoComplete={type === 'email' ? 'email' : undefined} className={inputCls()} />
      </fieldset>
    );
  }

  if (type === 'rating') {
    return (
      <fieldset>
        {legend}
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((num) => {
            const on = data[name] === String(num);
            return (
              <label key={num} className="cursor-pointer">
                <input type="radio" name={name} value={num} checked={on} onChange={onChange} className="peer sr-only" />
                <span className={`flex h-12 items-center justify-center rounded-[10px] border font-display text-lg transition-all duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40 ${
                  on ? 'scale-[1.04] border-accent bg-accent text-on-accent shadow-[0_10px_24px_-12px_var(--bx-accent)]' : 'border-line text-muted hover:border-accent/50 hover:text-ink'
                }`}>
                  {num}
                </span>
              </label>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted">
          <span>{field.low}</span>
          <span>{field.high}</span>
        </div>
      </fieldset>
    );
  }

  const isCheck = type === 'check';
  return (
    <fieldset>
      {legend}
      <div className="grid gap-2">
        {options.map((opt) => (
          <Choice
            key={opt}
            type={isCheck ? 'checkbox' : 'radio'}
            name={name}
            value={opt}
            checked={isCheck ? data[name].includes(opt) : data[name] === opt}
            onChange={onChange}
            label={opt}
          />
        ))}
      </div>
      {other && (isCheck ? data[name].includes(other.trigger) : data[name] === other.trigger) && (
        <input
          type="text"
          name={other.name}
          value={data[other.name] || ''}
          onChange={onChange}
          placeholder={other.placeholder}
          aria-label={other.placeholder}
          className={`survey-step mt-3 ${inputCls()}`}
        />
      )}
    </fieldset>
  );
}

/* ── Review and thank-you ───────────────────────────────────────── */

const answer = (data, field) => {
  let v = data[field.name];
  if (Array.isArray(v)) v = v.join(', ');
  if (field.type === 'rating' && v) v = `${v} / 5`;
  const extra = field.other && data[field.other.name];
  return [v, extra].filter(Boolean).join(': ');
};

function Review({ data, onEdit }) {
  return (
    <div className="space-y-3">
      {STEPS.map((step, k) => (
        <div key={step.title} className="overflow-hidden rounded-[12px] border border-line">
          <div className="flex items-center justify-between border-b border-line bg-sunken/60 px-4 py-2.5">
            <span className="text-label text-muted">{step.title}</span>
            <button type="button" onClick={() => onEdit(k + 1)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline">
              <Pencil size={13} /> Edit
            </button>
          </div>
          <dl className="divide-y divide-line">
            {step.fields.map((f) => {
              const v = answer(data, f);
              return (
                <div key={f.name} className="grid gap-1 px-4 py-3 sm:grid-cols-[13rem_1fr] sm:gap-4">
                  <dt className="text-sm text-muted"><BrandText>{f.q}</BrandText></dt>
                  <dd className={`text-sm ${v ? 'font-medium text-ink' : 'italic text-muted'}`}>{v || 'Not answered'}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      ))}
    </div>
  );
}

function ThankYou({ onReset }) {
  return (
    <div className="survey-step flex flex-col items-center px-2 py-10 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-on-accent shadow-[0_18px_40px_-16px_var(--bx-accent)]">
        <CheckCircle2 size={32} />
      </span>
      <h2 className="font-display mt-8 uppercase leading-none text-ink" style={{ fontSize: 'clamp(1.05rem, max(4vw, min(8.5vw, 1.75rem)), 2.5rem)' }}>Thank you</h2>
      <p className="mt-4 max-w-md leading-relaxed text-muted">
        Your answers go straight to the founders and directly shape what AgroSense360 does first.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button to="/products/agrosense360" variant="text">See AgroSense360</Button>
        <Button variant="secondary" onClick={onReset}><RotateCcw size={15} /> Submit another response</Button>
      </div>
    </div>
  );
}

/* ── Survey ─────────────────────────────────────────────────────── */

const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); }
  catch { return fallback; }
};
const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage blocked */ } };

export default function AgroSense360Survey() {
  const [step, setStep] = useState(() => {
    const s = Number(load('step', 1));
    return s >= 1 && s <= REVIEW ? s : 1;
  });
  const [dir, setDir] = useState(1);
  const [submitted, setSubmitted] = useState(() => load('submitted', false) === true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState(''); // bots fill hidden fields; people never see it
  const [error, setError] = useState('');
  const [data, setData] = useState(() => ({ ...initialFormData, ...load('formData', {}) }));
  const topRef = useRef(null);

  useEffect(() => save('formData', data), [data]);
  useEffect(() => save('step', step), [step]);
  useEffect(() => save('submitted', submitted), [submitted]);

  const go = (next) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
    topRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((prev) =>
      type === 'checkbox'
        ? { ...prev, [name]: checked ? [...prev[name], value] : prev[name].filter((v) => v !== value) }
        : { ...prev, [name]: value },
    );
  };

  const submit = async () => {
    setIsSubmitting(true);
    setError('');
    const body = new URLSearchParams();
    Object.entries(data).forEach(([k, v]) => (Array.isArray(v) ? v.forEach((x) => body.append(k, x)) : body.append(k, v)));
    // Answers go to the BLOXio API (Neon) and, as a backup, to the Google
    // Sheet. It counts as sent if either one gets it.
    const results = await Promise.allSettled([
      postJSON('/public/survey', { data, website: honeypot }),
      fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body }),
    ]);
    try {
      if (results.every((r) => r.status === 'rejected')) throw new Error('both failed');
      setSubmitted(true);
      setData(initialFormData);
      setStep(1);
    } catch {
      setError('We could not send your answers. Check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => { setSubmitted(false); setStep(1); setDir(-1); };
  const current = STEPS[step - 1];
  const pct = submitted ? 100 : Math.round(((step - 1) / TOTAL) * 100);

  return (
    <div ref={topRef} className="scroll-mt-24">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <div className={`${card()} above-stars overflow-hidden`}>
        {/* header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-8">
          <div>
            <p className="font-semibold text-ink">AgroSense360 early-access survey</p>
            <p className="mt-0.5 text-sm text-muted">About 4 minutes · answers go to the founders</p>
          </div>
          {!submitted && (
            <span className="text-label text-accent">
              {step <= TOTAL ? `Step ${step} of ${TOTAL}` : 'Review'}
            </span>
          )}
        </div>
        <div className="h-1 bg-sunken" aria-hidden="true">
          <div className="h-full bg-accent transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
        </div>

        <div className="px-5 py-8 sm:px-8 sm:py-10">
          {submitted ? (
            <ThankYou onReset={reset} />
          ) : (
            <div key={step} className="survey-step" style={{ '--dir': dir }}>
              <h2 className="font-display uppercase leading-none text-ink" style={{ fontSize: 'clamp(1.05rem, max(3vw, min(8.5vw, 1.4rem)), 1.9rem)' }}>
                {step <= TOTAL ? current.title : 'Review your answers'}
              </h2>
              <p className="mt-3 text-muted">
                {step <= TOTAL ? current.lead : 'Check everything, then send. Use Edit to go back to any step.'}
              </p>

              {step <= TOTAL ? (
                <div className="mt-8 space-y-9">
                  {current.note && (
                    <p className="rounded-[12px] border border-accent/25 bg-accent/6 px-4 py-3 text-sm leading-relaxed text-ink">{current.note}</p>
                  )}
                  {current.fields.map((f) => <Question key={f.name} field={f} data={data} onChange={onChange} />)}
                </div>
              ) : (
                <div className="mt-8"><Review data={data} onEdit={go} /></div>
              )}

              {error && <p role="alert" className="mt-6 rounded-[10px] border border-red-500/40 bg-red-500/8 px-4 py-3 text-sm text-red-700 dark:text-red-300">{error}</p>}

              <div className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-6">
                {step > 1 ? (
                  <Button variant="secondary" onClick={() => go(step - 1)}>Back</Button>
                ) : <span />}
                {step < TOTAL && <Button onClick={() => go(step + 1)}>Next</Button>}
                {step === TOTAL && <Button onClick={() => go(REVIEW)}><Eye size={16} /> Review answers</Button>}
                {step === REVIEW && (
                  <Button onClick={submit} disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : <><CheckCircle2 size={16} /> Send answers</>}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className={`${card()} p-5`}>
          <p className="font-semibold text-ink">Need help?</p>
          <p className="mt-1 text-sm text-muted">Email us and a founder will reply.</p>
          <a href={`mailto:${COMPANY.email}`} className="mt-3 inline-flex text-sm font-semibold text-accent hover:underline">{COMPANY.email}</a>
        </div>
        <div className={`${card()} p-5`}>
          <p className="font-semibold text-ink">About <Brand /></p>
          <p className="mt-1 text-sm text-muted">Who we are and what we are building.</p>
          <Link to="/about" className="link-line mt-3">Meet the company</Link>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-muted">Responses are confidential and used only to improve our products.</p>
    </div>
  );
}
