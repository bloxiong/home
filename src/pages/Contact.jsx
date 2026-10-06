import React, { useId, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { PageMeta, PageHeader, Section, SectionHeading } from '../components/ui';
import FAQList from '../components/FAQList';
import { inputCls } from '../lib/ui-utils';
import { COMPANY, INQUIRY_TOPICS, FAQS, IMG } from '../content/site';
import { postJSON } from '../lib/api';

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


export default function Contact() {
  const [params] = useSearchParams();
  const initialTopic = INQUIRY_TOPICS.some((t) => t.value === params.get('topic')) ? params.get('topic') : 'project';
  const [form, setForm] = useState({ name: '', email: '', phone: '', org: '', topic: initialTopic, message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [honeypot, setHoneypot] = useState('');
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

  const handleSubmit = async (e) => {
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
    setSending(true);
    setSendError('');
    try {
      await postJSON('/public/contact', { ...form, website: honeypot });
      setSent(true);
    } catch {
      // the API is unreachable: fall back to the visitor's own email app
      setSendError('fallback');
      window.location.href = `mailto:${COMPANY.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } finally {
      setSending(false);
    }
  };

  const errProps = (k) => (errors[k] ? { 'aria-invalid': true, 'aria-describedby': `${id(k)}-error` } : {});

  return (
    <>
      <PageMeta
        title="Contact"
        path="/contact"
        description="Contact BLOXio Nigeria Limited in Festac, Lagos: start a project, join the AgroSense360 pilot, discuss investment or partnerships, or ask about careers."
      />

      <PageHeader
        image={IMG.lab}
        label="Contact"
        title="Let’s talk"
        lead="Projects, pilots, investment or careers. The founders aim to reply within 24 hours."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16 items-start">
          <div className="above-stars rounded-2xl border border-line bg-surface p-6 sm:p-10">
            {sent ? (
              <div className="py-8" role="status">
                <CheckCircle2 size={40} className="text-accent" />
                <h2 className="font-ui mt-4 text-2xl font-bold tracking-tight text-ink">Message sent</h2>
                <p className="mt-3 max-w-[52ch] leading-relaxed text-muted">
                  Thanks, {form.name.split(' ')[0]}. It reached the founders, and a confirmation is on its way to {form.email}.
                  We aim to reply within 24 hours on working days.
                </p>
                <button
                  type="button"
                  onClick={() => { setSent(false); setForm((f) => ({ ...f, message: '' })); }}
                  className="mt-8 text-sm font-semibold text-accent link-underline"
                >
                  Send another message
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
                            ? 'border-accent bg-accent text-on-accent'
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
                  <p className="text-xs leading-relaxed text-muted sm:max-w-[34ch]" role={sendError ? 'alert' : undefined}>
                    {sendError
                      ? 'We couldn’t reach our server, so we opened your email app with the message filled in. Press send there.'
                      : 'Your message goes straight to the founders. You’ll get a confirmation email.'}
                  </p>
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-7 text-sm font-semibold text-on-accent transition-all duration-200 hover:brightness-110 active:translate-y-px disabled:opacity-60"
                  >
                    {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} {sending ? 'Sending…' : 'Send message'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <aside className="space-y-8">
            <div>
              <h2 className="font-ui text-lg font-bold tracking-tight text-ink">Reach us directly</h2>
              <ul className="mt-4 space-y-5">
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
                    <a href={MAP_URL} target="_blank" rel="noreferrer" className="link-line mt-2">
                      Open in Google Maps
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
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading className="mb-6!" label="Questions" title="Frequently asked questions" lead="The things people ask us most. Anything else, ask the founders directly." />
            <a href={`mailto:${COMPANY.email}`} className="link-line">Email {COMPANY.email}</a>
          </div>
          <FAQList items={FAQS} />
        </div>
      </Section>
    </>
  );
}
