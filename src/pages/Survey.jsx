import React, { useState } from 'react';
import { ClipboardCheck, ExternalLink, ArrowLeft, ChevronRight, ChevronLeft, CheckCircle2, Loader2, Eye, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const SCRIPT_URL = `https://script.google.com/macros/s/AKfycbzr7lB1Rc572hvOqwYs4Xbo7oNSbVeDMNubvSymy9JbsBEChYqc8upG6KUCfv6iMKpF/exec`;

const TOTAL_STEPS = 7; // steps 1-7 = questions, step 8 = review

const initialFormData = {
  respondentType: "",
  yearsExperience: "",
  location: "",
  monitoringChallenges: "",
  biggestChallenges: [],
  detectionMethods: [],
  usefulnessRating: "",
  valuableFeatures: [],
  considerUsing: "",
  willingToPay: "",
  paymentModel: "",
  futureProducts: [],
  openToNewTech: "",
  investmentInterest: "",
  earlyAccess: "",
  email: "",
  respondentOther: "",
  biggestChallengesOther: "",
  detectionMethodsOther: "",
};

/* ─── Reusable field components ─── */

function RadioOption({ name, value, checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer group transition-all duration-200 hover:bg-amber-500/5 border border-transparent hover:border-amber-500/20">
      <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${checked ? 'border-amber-400 bg-amber-400' : 'border-gray-600 group-hover:border-amber-500/60'}`}>
        {checked && <span className="w-2 h-2 rounded-full bg-black" />}
      </span>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      <span className={`text-sm transition-colors duration-200 ${checked ? 'text-amber-300 font-medium' : 'text-gray-300 group-hover:text-white'}`}>{label}</span>
    </label>
  );
}

function CheckOption({ name, value, checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer group transition-all duration-200 hover:bg-amber-500/5 border border-transparent hover:border-amber-500/20">
      <span className={`flex-shrink-0 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${checked ? 'border-amber-400 bg-amber-400' : 'border-gray-600 group-hover:border-amber-500/60'}`}>
        {checked && (
          <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <input type="checkbox" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      <span className={`text-sm transition-colors duration-200 ${checked ? 'text-amber-300 font-medium' : 'text-gray-300 group-hover:text-white'}`}>{label}</span>
    </label>
  );
}

function FieldLabel({ number, children }) {
  return (
    <div className="flex items-start gap-3 mb-3">
      <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold mt-0.5">
        {number}
      </span>
      <h3 className="text-white font-semibold text-sm sm:text-base leading-snug">{children}</h3>
    </div>
  );
}

function FieldBlock({ children }) {
  return <div className="mb-6 last:mb-0">{children}</div>;
}

// Always-visible "please specify" input shown when "Other" is selected
function OtherInput({ show, name, value, onChange }) {
  if (!show) return null;
  return (
    <input
      type="text"
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder="Please specify…"
      className="mt-2 ml-8 w-[calc(100%-2rem)] bg-gray-900 border border-amber-500/40 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-400 transition-colors animate-fadeIn"
    />
  );
}

// ── Review screen ──
function ReviewScreen({ formData, onEdit, onSubmit, isSubmitting }) {
  const sections = [
    {
      title: "About You",
      step: 1,
      rows: [
        { label: "Role", value: formData.respondentType + (formData.respondentOther ? ` — ${formData.respondentOther}` : "") },
        { label: "Experience", value: formData.yearsExperience },
        { label: "Location", value: formData.location },
      ],
    },
    {
      title: "Current Challenges",
      step: 2,
      rows: [
        { label: "Monitoring issues", value: formData.monitoringChallenges },
        { label: "Biggest challenges", value: formData.biggestChallenges.join(", ") + (formData.biggestChallengesOther ? ` — ${formData.biggestChallengesOther}` : "") },
        { label: "Detection methods", value: formData.detectionMethods.join(", ") + (formData.detectionMethodsOther ? ` — ${formData.detectionMethodsOther}` : "") },
      ],
    },
    {
      title: "AgroSense360",
      step: 3,
      rows: [
        { label: "Usefulness rating", value: formData.usefulnessRating ? `${formData.usefulnessRating} / 5` : "" },
        { label: "Valuable features", value: formData.valuableFeatures.join(", ") },
        { label: "Would consider using", value: formData.considerUsing },
      ],
    },
    {
      title: "Pricing",
      step: 4,
      rows: [
        { label: "Willing to pay", value: formData.willingToPay },
        { label: "Payment model", value: formData.paymentModel },
      ],
    },
    {
      title: "Future Products",
      step: 5,
      rows: [
        { label: "Interested in", value: formData.futureProducts.join(", ") },
        { label: "Open to Nigerian tech", value: formData.openToNewTech },
      ],
    },
    {
      title: "Investment",
      step: 6,
      rows: [{ label: "Investment interest", value: formData.investmentInterest }],
    },
    {
      title: "Early Access",
      step: 7,
      rows: [
        { label: "Wants early access", value: formData.earlyAccess },
        { label: "Email", value: formData.email || "Not provided" },
      ],
    },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-1">
          <Eye className="text-amber-400" size={20} />
          <h2 className="text-xl font-bold text-white">Review Your Answers</h2>
        </div>
        <p className="text-gray-500 text-sm pl-8">Double-check everything before submitting. Click <span className="text-amber-400">Edit</span> on any section to go back.</p>
      </div>

      <div className="space-y-3">
        {sections.map((sec) => (
          <div key={sec.title} className="bg-gray-900/60 border border-amber-500/15 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-amber-500/10 bg-amber-500/5">
              <span className="text-amber-300 text-xs font-bold tracking-wide uppercase">{sec.title}</span>
              <button
                type="button"
                onClick={() => onEdit(sec.step)}
                className="flex items-center gap-1 text-amber-400/70 hover:text-amber-300 text-xs font-semibold transition-colors"
              >
                <Edit2 size={11} /> Edit
              </button>
            </div>
            <div className="px-4 py-3 space-y-2">
              {sec.rows.map((row) => (
                <div key={row.label} className="flex gap-3">
                  <span className="text-gray-500 text-xs w-36 flex-shrink-0 pt-0.5">{row.label}</span>
                  <span className={`text-sm flex-1 leading-snug ${row.value ? "text-white" : "text-gray-600 italic"}`}>
                    {row.value || "Not answered"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-800 flex items-center justify-between">
        <button type="button" onClick={() => onEdit(7)} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition-colors group">
          <ChevronLeft className="group-hover:-translate-x-0.5 transition-transform" size={18} />
          Back
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSubmit}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black px-8 py-2.5 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting ? (
            <><Loader2 size={16} className="animate-spin" />Submitting…</>
          ) : (
            <><CheckCircle2 size={16} />Confirm &amp; Submit</>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Step progress bar ─── */

function ProgressBar({ step, total }) {
  const pct = ((step - 1) / (total - 1)) * 100;
  return (
    <div className="px-6 sm:px-10 pt-8 pb-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-amber-400 text-xs font-semibold tracking-widest uppercase">Step {step} of {total}</span>
        <span className="text-gray-500 text-xs">{Math.round(pct)}% complete</span>
      </div>
      <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i + 1 < step ? 'bg-amber-500' : i + 1 === step ? 'bg-amber-400 ring-2 ring-amber-400/30' : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Thank you screen ─── */

function ThankYou() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl scale-150" />
        <div className="relative w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-xl shadow-amber-500/40">
          <CheckCircle2 className="text-black" size={44} />
        </div>
      </div>
      <h2 className="text-3xl sm:text-4xl font-black mb-4">
        <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600 bg-clip-text text-transparent">
          Thank You!
        </span>
      </h2>
      <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full mx-auto mb-6" />
      <p className="text-gray-400 text-sm sm:text-base max-w-md leading-relaxed mb-8">
        Your insights are incredibly valuable and will directly influence the development of <span className="text-amber-400 font-semibold">AgroSense360</span>. We are committed to building solutions that truly solve real-world challenges.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black px-6 py-3 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-amber-500/40 transition-all duration-300 hover:scale-105"
      >
        <ArrowLeft size={16} />
        Go Back Home
      </Link>
    </div>
  );
}

/* ─── Main component ─── */

export default function Survey() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => {
        const current = prev[name] || [];
        return {
          ...prev,
          [name]: checked ? [...current, value] : current.filter((v) => v !== value),
        };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const nextStep = () => setStep((prev) => prev < TOTAL_STEPS ? prev + 1 : 8); // 8 = review
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));
  const goToReview = () => setStep(8);
  const goToEdit = (s) => setStep(s);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const formBody = new URLSearchParams();
    Object.keys(formData).forEach((key) => {
      if (Array.isArray(formData[key])) {
        formData[key].forEach((val) => formBody.append(key, val));
      } else {
        formBody.append(key, formData[key]);
      }
    });

    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: formBody,
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Submission failed. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-amber-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-800/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/4 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-20">

        {/* Page header */}
        <div className="text-center mb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-amber-400/70 hover:text-amber-300 transition-colors mb-8 group"
          >
            <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={18} />
            <span className="font-medium text-sm">Back to Home</span>
          </Link>

          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/30 rounded-2xl blur-xl" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/40">
                <ClipboardCheck className="text-black" size={38} />
              </div>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              Customer Survey
            </span>
          </h1>
          <div className="w-32 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 mx-auto rounded-full mb-5" />
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Your feedback helps us innovate better. Share your thoughts and help shape the future of technology with Bloxio.
          </p>
        </div>

        {/* Survey card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-900/90 rounded-3xl border border-amber-500/25 shadow-2xl shadow-amber-900/20 overflow-hidden backdrop-blur-sm">

            {/* Card top bar */}
            <div className="bg-gradient-to-r from-amber-900/30 to-amber-950/30 border-b border-amber-500/15 px-6 sm:px-10 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-500/15 rounded-lg flex items-center justify-center">
                    <ClipboardCheck className="text-amber-400" size={16} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">AgroSense360 Early Access Survey</p>
                    <p className="text-gray-500 text-xs">by BLOXIO NIGERIA LIMITED · ~3-5 min</p>
                  </div>
                </div>
                {!submitted && (
                  <span className="hidden sm:flex items-center gap-1.5 text-xs text-amber-400/70 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Live
                  </span>
                )}
              </div>
            </div>

            {/* Progress (hidden on review=8 and submitted) */}
            {!submitted && step <= TOTAL_STEPS && <ProgressBar step={step} total={TOTAL_STEPS} />}

            {/* Form body */}
            <form onSubmit={handleSubmit}>
              <div className="px-6 sm:px-10 py-8">

                {submitted ? (
                  <ThankYou />
                ) : (
                  <>
                    {/* ── STEP 1: Respondent Profile ── */}
                    {step === 1 && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="mb-6">
                          <h2 className="text-xl font-bold text-white mb-1">About You</h2>
                          <p className="text-gray-500 text-sm">Tell us a little about your background.</p>
                        </div>

                        <FieldBlock>
                          <FieldLabel number="1">Which best describes you?</FieldLabel>
                          <div className="space-y-1">
                            {["Farmer","Agribusiness owner","Agricultural consultant / extension worker","Agricultural student / researcher","Investor","Tech enthusiast","Other"].map((opt) => (
                              <RadioOption key={opt} name="respondentType" value={opt} checked={formData.respondentType === opt} onChange={handleChange} label={opt} />
                            ))}
                          </div>
                          <OtherInput show={formData.respondentType === "Other"} name="respondentOther" value={formData.respondentOther} onChange={handleChange} />
                        </FieldBlock>

                        <FieldBlock>
                          <FieldLabel number="2">Years of experience in agriculture or agribusiness</FieldLabel>
                          <div className="space-y-1">
                            {["Less than 1 year","1–3 years","4–10 years","10+ years","Not applicable"].map((opt) => (
                              <RadioOption key={opt} name="yearsExperience" value={opt} checked={formData.yearsExperience === opt} onChange={handleChange} label={opt} />
                            ))}
                          </div>
                        </FieldBlock>

                        <FieldBlock>
                          <FieldLabel number="3">Where are you located?</FieldLabel>
                          <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="e.g. Lagos, Nigeria" className="w-full bg-gray-900 border border-amber-500/30 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500/60 transition-colors" />
                        </FieldBlock>
                      </div>
                    )}

                    {/* ── STEP 2: Current Problems ── */}
                    {step === 2 && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="mb-6">
                          <h2 className="text-xl font-bold text-white mb-1">Current Challenges</h2>
                          <p className="text-gray-500 text-sm">Help us understand the problems you face.</p>
                        </div>

                        <FieldBlock>
                          <FieldLabel number="4">Do you face challenges monitoring your farm or crops effectively?</FieldLabel>
                          <div className="space-y-1">
                            {["Yes, frequently","Sometimes","Rarely","No"].map((opt) => (
                              <RadioOption key={opt} name="monitoringChallenges" value={opt} checked={formData.monitoringChallenges === opt} onChange={handleChange} label={opt} />
                            ))}
                          </div>
                        </FieldBlock>

                        <FieldBlock>
                          <FieldLabel number="5">What are your biggest challenges? (select all that apply)</FieldLabel>
                          <div className="space-y-1">
                            {["Crop diseases","Poor yield despite effort","Soil quality or nutrient imbalance","Lack of real-time farm data","Weather unpredictability","High labor cost","Late detection of farm problems","Other"].map((opt) => (
                              <CheckOption key={opt} name="biggestChallenges" value={opt} checked={formData.biggestChallenges.includes(opt)} onChange={handleChange} label={opt} />
                            ))}
                          </div>
                          <OtherInput show={formData.biggestChallenges.includes("Other")} name="biggestChallengesOther" value={formData.biggestChallengesOther} onChange={handleChange} />
                        </FieldBlock>

                        <FieldBlock>
                          <FieldLabel number="6">How do you currently detect crop diseases or farm issues? (select all that apply)</FieldLabel>
                          <div className="space-y-1">
                            {["Manual inspection","Advice from experts","Trial and error","No structured method","Other"].map((opt) => (
                              <CheckOption key={opt} name="detectionMethods" value={opt} checked={formData.detectionMethods.includes(opt)} onChange={handleChange} label={opt} />
                            ))}
                          </div>
                          <OtherInput show={formData.detectionMethods.includes("Other")} name="detectionMethodsOther" value={formData.detectionMethodsOther} onChange={handleChange} />
                        </FieldBlock>
                      </div>
                    )}

                    {/* ── STEP 3: AgroSense360 Validation ── */}
                    {step === 3 && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="mb-6">
                          <h2 className="text-xl font-bold text-white mb-1">AgroSense360</h2>
                          <p className="text-gray-500 text-sm">We'd love your honest opinion on the product.</p>
                        </div>

                        <div className="bg-amber-500/8 border border-amber-500/20 rounded-2xl p-4 mb-6">
                          <p className="text-amber-300/80 text-sm leading-relaxed">
                            <span className="font-semibold text-amber-300">About AgroSense360:</span> A smart system that combines AI, cameras, and sensors to monitor crop health, soil conditions, and farm environment in real time — providing alerts and recommendations.
                          </p>
                        </div>

                        <FieldBlock>
                          <FieldLabel number="7">How useful would AgroSense360 be to you? (1 = Not useful, 5 = Extremely useful)</FieldLabel>
                          <div className="flex gap-2 mt-1">
                            {[1,2,3,4,5].map((num) => (
                              <label key={num} className="flex-1 cursor-pointer">
                                <input type="radio" name="usefulnessRating" value={num} checked={formData.usefulnessRating === num.toString()} onChange={handleChange} className="sr-only" />
                                <div className={`w-full py-3 rounded-xl text-center text-sm font-bold border-2 transition-all duration-200 ${formData.usefulnessRating === num.toString() ? 'bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/30' : 'border-gray-700 text-gray-400 hover:border-amber-500/40 hover:text-amber-300'}`}>
                                  {num}
                                </div>
                              </label>
                            ))}
                          </div>
                          <div className="flex justify-between mt-1.5 px-1">
                            <span className="text-gray-600 text-xs">Not useful</span>
                            <span className="text-gray-600 text-xs">Extremely useful</span>
                          </div>
                        </FieldBlock>

                        <FieldBlock>
                          <FieldLabel number="8">Which features would you find most valuable? (select all that apply)</FieldLabel>
                          <div className="space-y-1">
                            {["AI-based crop disease detection","Soil moisture & nutrient monitoring","Early warning alerts (mobile)","Yield improvement recommendations","Remote farm monitoring","Farm data reports","Other"].map((opt) => (
                              <CheckOption key={opt} name="valuableFeatures" value={opt} checked={formData.valuableFeatures.includes(opt)} onChange={handleChange} label={opt} />
                            ))}
                          </div>
                        </FieldBlock>

                        <FieldBlock>
                          <FieldLabel number="9">Would you consider using AgroSense360?</FieldLabel>
                          <div className="space-y-1">
                            {["Yes","No","Maybe"].map((opt) => (
                              <RadioOption key={opt} name="considerUsing" value={opt} checked={formData.considerUsing === opt} onChange={handleChange} label={opt} />
                            ))}
                          </div>
                        </FieldBlock>
                      </div>
                    )}

                    {/* ── STEP 4: Price & Commitment ── */}
                    {step === 4 && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="mb-6">
                          <h2 className="text-xl font-bold text-white mb-1">Pricing & Commitment</h2>
                          <p className="text-gray-500 text-sm">Help us understand how you'd prefer to pay.</p>
                        </div>

                        <FieldBlock>
                          <FieldLabel number="10">If this system delivers real value, would you be willing to pay for it?</FieldLabel>
                          <div className="space-y-1">
                            {["Yes","No","Maybe"].map((opt) => (
                              <RadioOption key={opt} name="willingToPay" value={opt} checked={formData.willingToPay === opt} onChange={handleChange} label={opt} />
                            ))}
                          </div>
                        </FieldBlock>

                        <FieldBlock>
                          <FieldLabel number="11">What payment model would you prefer?</FieldLabel>
                          <div className="space-y-1">
                            {["One-time purchase","Subscription (monthly/annually)","Pay-per-use","Not sure"].map((opt) => (
                              <RadioOption key={opt} name="paymentModel" value={opt} checked={formData.paymentModel === opt} onChange={handleChange} label={opt} />
                            ))}
                          </div>
                        </FieldBlock>
                      </div>
                    )}

                    {/* ── STEP 5: Future Products ── */}
                    {step === 5 && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="mb-6">
                          <h2 className="text-xl font-bold text-white mb-1">Future Products</h2>
                          <p className="text-gray-500 text-sm">Tell us what else interests you.</p>
                        </div>

                        <FieldBlock>
                          <FieldLabel number="12">Which technology products would you be interested in beyond agriculture? (select all that apply)</FieldLabel>
                          <div className="space-y-1">
                            {["Smart electronic devices","Agricultural drones & accessories","Smart lighting (e.g., drone lights, industrial lights)","Security & surveillance devices","Energy & power systems","Other electronics"].map((opt) => (
                              <CheckOption key={opt} name="futureProducts" value={opt} checked={formData.futureProducts.includes(opt)} onChange={handleChange} label={opt} />
                            ))}
                          </div>
                        </FieldBlock>

                        <FieldBlock>
                          <FieldLabel number="13">Are you open to testing new technology products from a Nigerian tech company?</FieldLabel>
                          <div className="space-y-1">
                            {["Yes","No","Maybe"].map((opt) => (
                              <RadioOption key={opt} name="openToNewTech" value={opt} checked={formData.openToNewTech === opt} onChange={handleChange} label={opt} />
                            ))}
                          </div>
                        </FieldBlock>
                      </div>
                    )}

                    {/* ── STEP 6: Investment Interest ── */}
                    {step === 6 && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="mb-6">
                          <h2 className="text-xl font-bold text-white mb-1">Investment Interest</h2>
                          <p className="text-gray-500 text-sm">Would you like to be part of the journey?</p>
                        </div>

                        <FieldBlock>
                          <FieldLabel number="14">Would you be interested in investing in or supporting the development of products like this?</FieldLabel>
                          <div className="space-y-1">
                            {["Yes, I'd like to learn more","Possibly","No"].map((opt) => (
                              <RadioOption key={opt} name="investmentInterest" value={opt} checked={formData.investmentInterest === opt} onChange={handleChange} label={opt} />
                            ))}
                          </div>
                        </FieldBlock>
                      </div>
                    )}

                    {/* ── STEP 7: Contact / Early Access ── */}
                    {step === 7 && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="mb-6">
                          <h2 className="text-xl font-bold text-white mb-1">Early Access</h2>
                          <p className="text-gray-500 text-sm">Be the first to know when we launch.</p>
                        </div>

                        <FieldBlock>
                          <FieldLabel number="15">Would you like early access, updates, or to be contacted when we launch?</FieldLabel>
                          <div className="space-y-1">
                            {["Yes","No"].map((opt) => (
                              <RadioOption key={opt} name="earlyAccess" value={opt} checked={formData.earlyAccess === opt} onChange={handleChange} label={opt} />
                            ))}
                          </div>
                        </FieldBlock>

                        <FieldBlock>
                          <FieldLabel number="16">Email address <span className="text-gray-500 font-normal">(optional)</span></FieldLabel>
                          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="w-full bg-gray-900 border border-amber-500/30 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500/60 transition-colors" />
                        </FieldBlock>
                      </div>
                    )}

                    {/* ── Step navigation (steps 1-7 only) ── */}
                    {step <= TOTAL_STEPS && (
                      <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-800">
                        {step > 1 ? (
                          <button type="button" onClick={prevStep} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition-colors group">
                            <ChevronLeft className="group-hover:-translate-x-0.5 transition-transform" size={18} />
                            Previous
                          </button>
                        ) : <div />}

                        {step < TOTAL_STEPS ? (
                          <button type="button" onClick={nextStep} className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black px-6 py-2.5 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300 hover:scale-105">
                            Next
                            <ChevronRight size={16} />
                          </button>
                        ) : (
                          <button type="button" onClick={goToReview} className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black px-6 py-2.5 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300 hover:scale-105">
                            <Eye size={16} />
                            Review Answers
                          </button>
                        )}
                      </div>
                    )}

                    {/* ── Review screen (step 8) ── */}
                    {step === 8 && (
                      <ReviewScreen
                        formData={formData}
                        onEdit={goToEdit}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                      />
                    )}
                  </>
                )}
              </div>
            </form>

            {/* Footer */}
            {!submitted && (
              <div className="bg-gradient-to-r from-gray-900/60 to-black/60 border-t border-amber-500/10 px-6 sm:px-10 py-4">
                <p className="text-center text-gray-600 text-xs">
                  <span className="text-amber-500/70">🔒</span> All responses are confidential and used only to improve our products.
                </p>
              </div>
            )}
          </div>

          {/* Bottom CTAs */}
          {!submitted && (
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-gray-900/80 to-black/80 rounded-2xl p-5 border border-amber-500/15 hover:border-amber-500/30 transition-all backdrop-blur-sm">
                <h4 className="text-amber-300 font-bold text-sm mb-1">Need Help?</h4>
                <p className="text-gray-500 text-xs mb-3 leading-relaxed">If you encounter any issues, please reach out to our support team.</p>
                <a href="mailto:bloxionigerialimited@gmail.com" className="text-amber-400 hover:text-amber-300 text-xs font-semibold inline-flex items-center gap-1 transition-colors">
                  Contact Support <ExternalLink size={12} />
                </a>
              </div>
              <div className="bg-gradient-to-br from-gray-900/80 to-black/80 rounded-2xl p-5 border border-amber-500/15 hover:border-amber-500/30 transition-all backdrop-blur-sm">
                <h4 className="text-amber-300 font-bold text-sm mb-1">Learn More</h4>
                <p className="text-gray-500 text-xs mb-3 leading-relaxed">Discover how Bloxio is innovating technology solutions for the future.</p>
                <Link to="/#about" className="text-amber-400 hover:text-amber-300 text-xs font-semibold inline-flex items-center gap-1 transition-colors">
                  Explore Our Vision <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}