import React, { useId, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, ExternalLink } from 'lucide-react';
import { PageMeta, PageHeader, Section, SectionHeading } from '../components/ui';
import FAQList from '../components/FAQList';
import { COMPANY, INQUIRY_TOPICS, FAQS } from '../content/site';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY.address.join(', '))}`;

function Field({ label, optional, error, children, id }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between text-sm font-semibold text-ink">
        {label}
        {optional && <span className="text-xs font-normal text-muted">Optional</span>}
      </label>
      {children}
      {error && <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

const inputCls = (err) =>
  `w-full rounded-xl border bg-surface px-4 py-3 text-ink placeholder:text-muted/70 transition-colors duration-150 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 ${
    err ? 'border-red-500/70' : 'border-line'
  }`;

export default function Contact() {
  const [params] = useSearchParams();
  const initialTopic = INQUIRY_TOPICS.some((t) => t.value === params.get('topic')) ? params.get('topic') : 'project';
  const [form, setForm] = useState({ name: '', email: '', phone: '', org: '', topic: initialTopic, message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const uid = useId();
  const id = (k) => `${uid}-${k}`;

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = 'Please tell us your name.';
    if (!form.email.trim()) er.email = 'We need an email address to reply to.';
    else if (!EMAIL_RE.test(form.email.trim())) er.email = 'That email address doesn’t look complete. Check for typos.';
    if (form.message.trim().length < 10) er.message = 'Add a sentence or two so we know how to help.';
    return er;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) {
      document.getElementById(id(Object.keys(er)[0]))?.focus();
      return;
    }
    const topic = INQUIRY_TOPICS.find((t) => t.value === form.topic)?.label ?? 'Enquiry';
    const subject = `${topic}: ${form.name}${form.org ? ` (${form.org})` : ''}`;
    const lines = [`Name: ${form.name}`, `Email: ${form.email}`];
    if (form.phone) lines.push(`Phone: ${form.phone}`);
    if (form.org) lines.push(`Organisation: ${form.org}`);
    lines.push(`Topic: ${topic}`, '', form.message);
    const body = lines.join('\n');
    window.location.href = `mailto:${COMPANY.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const errProps = (k) => (errors[k] ? { 'aria-invalid': true, 'aria-describedby': `${id(k)}-error` } : {});

  return (
    <>
      <PageMeta
        title="Contact"
        description="Contact Bloxio Nigeria Limited in Festac, Lagos: start a project, join the AgroSense360 pilot, discuss investment or partnerships, or ask about careers."
      />

      <PageHeader
        title="Let’s talk"
        lead="Projects, the AgroSense360 pilot, investment, partnerships or careers. Messages go straight to the founders, and we aim to reply within 24 hours."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16 items-start">
          <div className="rounded-2xl border border-line bg-surface p-6 sm:p-10">
            {sent ? (
              <div className="py-8" role="status">
                <CheckCircle2 size={40} className="text-accent" />
                <h2 className="font-ui mt-5 text-2xl font-bold tracking-tight text-ink">Your email is ready to send</h2>
                <p className="mt-3 max-w-[52ch] leading-relaxed text-muted">
                  We opened your email app with the message filled in. Press send there and it reaches us. If nothing opened,
                  email us directly at{' '}
                  <a href={`mailto:${COMPANY.email}`} className="link-underline font-semibold text-accent">{COMPANY.email}</a>.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-8 text-sm font-semibold text-accent link-underline"
                >
                  Edit the message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <fieldset>
                  <legend className="mb-3 text-sm font-semibold text-ink">What is this about?</legend>
                  <div className="flex flex-wrap gap-2">
                    {INQUIRY_TOPICS.map((t) => (
                      <label
                        key={t.value}
                        className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150 has-focus-visible:ring-2 has-focus-visible:ring-accent ${
                          form.topic === t.value
                            ? 'border-accent bg-accent text-canvas'
                            : 'border-line text-ink hover:border-accent'
                        }`}
                      >
                        <input
                          type="radio"
                          name="topic"
                          value={t.value}
                          checked={form.topic === t.value}
                          onChange={set('topic')}
                          className="sr-only"
                        />
                        {t.label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Your name" id={id('name')} error={errors.name}>
                    <input id={id('name')} type="text" autoComplete="name" value={form.name} onChange={set('name')} className={inputCls(errors.name)} {...errProps('name')} />
                  </Field>
                  <Field label="Email" id={id('email')} error={errors.email}>
                    <input id={id('email')} type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" value={form.email} onChange={set('email')} className={inputCls(errors.email)} {...errProps('email')} />
                  </Field>
                  <Field label="Phone" optional id={id('phone')}>
                    <input id={id('phone')} type="tel" autoComplete="tel" placeholder="+234" value={form.phone} onChange={set('phone')} className={inputCls()} />
                  </Field>
                  <Field label="Organisation or farm" optional id={id('org')}>
                    <input id={id('org')} type="text" autoComplete="organization" value={form.org} onChange={set('org')} className={inputCls()} />
                  </Field>
                </div>

                <Field label="Message" id={id('message')} error={errors.message}>
                  <textarea
                    id={id('message')}
                    rows={6}
                    placeholder="What are you trying to build, grow or solve?"
                    value={form.message}
                    onChange={set('message')}
                    className={`${inputCls(errors.message)} resize-y`}
                    {...errProps('message')}
                  />
                </Field>

                <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-relaxed text-muted sm:max-w-[34ch]">
                    Sending opens your email app with this message filled in.
                  </p>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-light via-gold to-gold-dark px-7 py-3.5 text-sm font-semibold text-black shadow-[0_6px_20px_-8px_rgba(189,138,76,0.7)] transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <Send size={15} /> Send message
                  </button>
                </div>
              </form>
            )}
          </div>

          <aside className="space-y-8">
            <div>
              <h2 className="font-ui text-lg font-bold tracking-tight text-ink">Reach us directly</h2>
              <ul className="mt-5 space-y-5">
                <li className="flex gap-4">
                  <Mail size={18} className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <p className="text-sm text-muted">Email</p>
                    <a href={`mailto:${COMPANY.email}`} className="font-semibold text-ink hover:text-accent transition-colors">{COMPANY.email}</a>
                  </div>
                </li>
                <li className="flex gap-4">
                  <Phone size={18} className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <p className="text-sm text-muted">Phone</p>
                    {COMPANY.phones.map((p) => (
                      <a key={p.tel} href={`tel:${p.tel}`} className="block font-semibold text-ink tabular-nums hover:text-accent transition-colors">{p.display}</a>
                    ))}
                  </div>
                </li>
                <li className="flex gap-4">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <p className="text-sm text-muted">Registered office</p>
                    <p className="font-semibold text-ink">{COMPANY.address[0]}</p>
                    <p className="text-ink">{COMPANY.address[1]}</p>
                    <a href={MAP_URL} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-accent link-underline">
                      Open in Google Maps <ExternalLink size={13} />
                    </a>
                  </div>
                </li>
                <li className="flex gap-4">
                  <Clock size={18} className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <p className="text-sm text-muted">Hours</p>
                    <p className="font-semibold text-ink">{COMPANY.hours}</p>
                  </div>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </Section>

      <Section tone="sunken" id="faq">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
          <SectionHeading title="Frequently asked questions" />
          <FAQList items={FAQS} />
        </div>
      </Section>
    </>
  );
}
