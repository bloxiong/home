import React, { useState } from 'react';
import { ClipboardCheck, ExternalLink, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const SERVER_URL = "http://localhost:3001/submit-survey"

export default function Survey() {
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
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
  });
  const resetForm = () => {
    setFormData({
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
    })
    setStep(0)
  }
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => {
        const current = prev[name] || [];
        if (checked) return { ...prev, [name]: [...current, value] };
        else return { ...prev, [name]: current.filter((v) => v !== value) };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 7));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formBody = new URLSearchParams();

    Object.keys(formData).forEach((key) => {
      if (Array.isArray(formData[key])) {
        formData[key].forEach((val) => formBody.append(key, val));
      } else {
        formBody.append(key, formData[key]);
      }
    });

    try {
      const response = await fetch(SERVER_URL, {
        method: "POST",
        body: formBody,
      });
      const text = await response.text();
      console.log("Google Apps Script response:", text);
      resetForm();
    } catch (err) {
      console.error(err);
      alert("There was an error submitting the form.");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-800/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gold-light hover:text-amber-300 transition-colors mb-6 group"
          >
            <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
            <span className="font-medium">Back to Home</span>
          </Link>

          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/50">
              <ClipboardCheck className="text-black" size={40} />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
              Customer Survey
            </span>
          </h1>
          <div className="w-32 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 mx-auto rounded-full mb-6"></div>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Your feedback helps us innovate better. Share your thoughts and help shape the future of technology with Bloxio.
          </p>
        </div>

        {/* Survey Container */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl border-2 border-amber-500/30 shadow-2xl shadow-amber-900/20 overflow-hidden">
            {/* Info Banner */}
            <div className="bg-gradient-to-r from-amber-900/40 to-amber-950/40 border-b border-amber-500/20 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <ClipboardCheck className="text-amber-400" size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base sm:text-lg mb-1">Bloxio Technology Survey</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">Takes approximately 3-5 minutes to complete</p>
                  </div>
                </div>
                {/** <a 
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfq7-m6lHGLhZ6a0EJmi6CbUO1TXRiIkWEck6nLtaWLkA5e9Q/viewform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gradient-to-r from-gold-light to-gold text-black px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-amber-500/50 transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
                >
                  Open in New Tab
                  <ExternalLink size={16} />
                </a>**/}
              </div>
            </div>

            {/* Embedded Form */}
            {/**<div className="relative bg-white" style={{ minHeight: '600px' }}>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading survey...</p>
                  </div>
                </div>
              )}
              
              <iframe 
                src="https://docs.google.com/forms/d/e/1FAIpQLSfq7-m6lHGLhZ6a0EJmi6CbUO1TXRiIkWEck6nLtaWLkA5e9Q/viewform?embedded=true"
                className="w-full border-0"
                style={{ height: '800px', maxHeight: '90vh' }}
                onLoad={() => setIsLoading(false)}
                title="Bloxio Customer Survey"
              >
                Loading survey...
              </iframe>
            </div>**/}

            <div className="max-w-3xl mx-auto p-6 rounded-lg shadow-lg">
              <h2 className="text-center text-2xl font-bold mb-4">
                AgroSense360 Early Access Survey
              </h2>
              <p className="text-center mb-6 text-gray-600">
                This survey is conducted by BLOXIO NIGERIA LIMITED to understand real
                user needs and evaluate interest in upcoming technology products,
                starting with AgroSense360, a smart AI & IoT-based agricultural
                monitoring system.
              </p>

              <form onSubmit={handleSubmit}>
                {/* PAGE 1 – Respondent Profile */}
                {step === 1 && (
                  <div>
                    <h3 className="font-semibold mb-3">1. Which of the following best describes you?</h3>
                    {[
                      "Farmer",
                      "Agribusiness owner",
                      "Agricultural consultant / extension worker",
                      "Agricultural student / researcher",
                      "Investor",
                      "Tech enthusiast",
                      "Other",
                    ].map((option) => (
                      <label key={option} className="block mb-1">
                        <input
                          type="radio"
                          name="respondentType"
                          value={option}
                          checked={formData.respondentType === option}
                          onChange={handleChange}
                          className="mr-2"
                          required
                        />
                        {option}
                        {option === "Other" && formData.respondentType === "Other" && (
                          <input
                            type="text"
                            name="respondentOther"
                            placeholder="Please specify"
                            className="ml-2 border rounded px-2 py-1"
                            onChange={handleChange}
                          />
                        )}
                      </label>
                    ))}

                    <h3 className="font-semibold mt-4 mb-1">
                      2. Years of experience in agriculture or agribusiness
                    </h3>
                    {["Less than 1 year", "1–3 years", "4–10 years", "10+ years", "Not applicable"].map(
                      (option) => (
                        <label key={option} className="block mb-1">
                          <input
                            type="radio"
                            name="yearsExperience"
                            value={option}
                            checked={formData.yearsExperience === option}
                            onChange={handleChange}
                            className="mr-2"
                          />
                          {option}
                        </label>
                      )
                    )}

                    <h3 className="font-semibold mt-4 mb-1">
                      3. Where are you located?
                    </h3>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                )}

                {/* PAGE 2 – Current Problems */}
                {step === 2 && (
                  <div>
                    <h3 className="font-semibold mb-3">
                      4. Do you currently face challenges in monitoring your farm or crops effectively?
                    </h3>
                    {["Yes, frequently", "Sometimes", "Rarely", "No"].map((option) => (
                      <label key={option} className="block mb-1">
                        <input
                          type="radio"
                          name="monitoringChallenges"
                          value={option}
                          checked={formData.monitoringChallenges === option}
                          onChange={handleChange}
                          required
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}

                    <h3 className="font-semibold mt-4 mb-1">5. What are your biggest challenges?</h3>
                    {[
                      "Crop diseases",
                      "Poor yield despite effort",
                      "Soil quality or nutrient imbalance",
                      "Lack of real-time farm data",
                      "Weather unpredictability",
                      "High labor cost",
                      "Late detection of farm problems",
                      "Other",
                    ].map((option) => (
                      <label key={option} className="block mb-1">
                        <input
                          type="checkbox"
                          name="biggestChallenges"
                          value={option}
                          checked={formData.biggestChallenges.includes(option)}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        {option}
                        {option === "Other" && formData.biggestChallenges.includes("Other") && (
                          <input
                            type="text"
                            name="biggestChallengesOther"
                            placeholder="Please specify"
                            className="ml-2 border rounded px-2 py-1"
                            onChange={handleChange}
                          />
                        )}
                      </label>
                    ))}

                    <h3 className="font-semibold mt-4 mb-1">
                      6. How do you currently detect crop diseases or farm issues?
                    </h3>
                    {[
                      "Manual inspection",
                      "Advice from experts",
                      "Trial and error",
                      "No structured method",
                      "Other",
                    ].map((option) => (
                      <label key={option} className="block mb-1">
                        <input
                          type="checkbox"
                          name="detectionMethods"
                          value={option}
                          checked={formData.detectionMethods.includes(option)}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        {option}
                        {option === "Other" && formData.detectionMethods.includes("Other") && (
                          <input
                            type="text"
                            name="detectionMethodsOther"
                            placeholder="Please specify"
                            className="ml-2 border rounded px-2 py-1"
                            onChange={handleChange}
                          />
                        )}
                      </label>
                    ))}
                  </div>
                )}

                {/* PAGE 3 – AgroSense360 Validation */}
                {step === 3 && (
                  <div>
                    <p className="mb-3 text-gray-700">
                      About AgroSense360: A smart system that combines AI, cameras, and
                      sensors to monitor crop health, soil conditions, and farm environment in real
                      time, providing alerts and recommendations.
                    </p>

                    <h3 className="font-semibold mb-3">
                      7. How useful would a system like AgroSense360 be to you?
                    </h3>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <label key={num} className="block mb-1">
                        <input
                          type="radio"
                          name="usefulnessRating"
                          value={num}
                          checked={formData.usefulnessRating === num.toString()}
                          onChange={handleChange}
                          required
                          className="mr-2"
                        />
                        {num}
                      </label>
                    ))}

                    <h3 className="font-semibold mt-4 mb-1">
                      8. Which AgroSense360 features would you find most valuable?
                    </h3>
                    {[
                      "AI-based crop disease detection",
                      "Soil moisture & nutrient monitoring",
                      "Early warning alerts (mobile)",
                      "Yield improvement recommendations",
                      "Remote farm monitoring",
                      "Farm data reports",
                      "Other",
                    ].map((option) => (
                      <label key={option} className="block mb-1">
                        <input
                          type="checkbox"
                          name="valuableFeatures"
                          value={option}
                          checked={formData.valuableFeatures.includes(option)}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}

                    <h3 className="font-semibold mt-4 mb-1">
                      9. Would you consider using a system like AgroSense360 on your farm or business?
                    </h3>
                    {["Yes", "No", "Maybe"].map((option) => (
                      <label key={option} className="block mb-1">
                        <input
                          type="radio"
                          name="considerUsing"
                          value={option}
                          checked={formData.considerUsing === option}
                          onChange={handleChange}
                          required
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}
                
                {/** PAGE 4 – PRICE & COMMITMENT */}
                {step === 4 && (
                  <div>
                    <h3 className="font-semibold mb-3">
                      10. If this system delivers real value, would you be willing to pay for it?
                    </h3>
                    {["Yes", "No", "Maybe"].map((option) => (
                      <label key={option} className="block mb-1">
                        <input
                          type="radio"
                          name="willingToPay"
                          value={option}
                          checked={formData.willingToPay === option}
                          onChange={handleChange}
                          required
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}

                    <h3 className="font-semibold mt-4 mb-1">
                      11. What payment model would you prefer?
                    </h3>
                    {["One-time purchase", "Subscription (monthly/annually)", "Pay-per-use", "Not sure"].map(
                      (option) => (
                        <label key={option} className="block mb-1">
                          <input
                            type="radio"
                            name="paymentModel"
                            value={option}
                            checked={formData.paymentModel === option}
                            onChange={handleChange}
                            className="mr-2"
                          />
                          {option}
                        </label>
                      )
                    )}
                  </div>
                )}

                {/* PAGE 5 – FUTURE PRODUCTS */}
                {step === 5 && (
                  <div>
                    <h3 className="font-semibold mb-3">
                      12. Aside from agriculture, which technology products would you be interested in?
                    </h3>
                    {[
                      "Smart electronic devices",
                      "Agricultural drones & accessories",
                      "Smart lighting (e.g., drone lights, industrial lights)",
                      "Security & surveillance devices",
                      "Energy & power systems",
                      "Other electronics",
                    ].map((option) => (
                      <label key={option} className="block mb-1">
                        <input
                          type="checkbox"
                          name="futureProducts"
                          value={option}
                          checked={formData.futureProducts.includes(option)}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}

                    <h3 className="font-semibold mt-4 mb-1">
                      13. Are you generally open to testing or using new technology products from a Nigerian tech company?
                    </h3>
                    {["Yes", "No", "Maybe"].map((option) => (
                      <label key={option} className="block mb-1">
                        <input
                          type="radio"
                          name="openToNewTech"
                          value={option}
                          checked={formData.openToNewTech === option}
                          onChange={handleChange}
                          required
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}

                {/* PAGE 6 – INVESTMENT INTEREST */}
                {step === 6 && (
                  <div>
                    <h3 className="font-semibold mb-3">
                      14. Would you be interested in investing in or supporting the development of products like this?
                    </h3>
                    {["Yes, I’d like to learn more", "Possibly", "No"].map((option) => (
                      <label key={option} className="block mb-1">
                        <input
                          type="radio"
                          name="investmentInterest"
                          value={option}
                          checked={formData.investmentInterest === option}
                          onChange={handleChange}
                          required
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}

                {/* PAGE 7 – CONTACT / EARLY ACCESS */}
                {step === 7 && (
                  <div>
                    <h3 className="font-semibold mb-3">
                      15. Would you like early access, updates, or to be contacted when we launch?
                    </h3>
                    {["Yes", "No"].map((option) => (
                      <label key={option} className="block mb-1">
                        <input
                          type="radio"
                          name="earlyAccess"
                          value={option}
                          checked={formData.earlyAccess === option}
                          onChange={handleChange}
                          required
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}

                    <h3 className="font-semibold mt-4 mb-1">Email address (optional)</h3>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                )}

                {/* Thank You */}
                {step === 0 && (
                  <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4">
                      <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
                        Thank You for Your Feedback
                      </span>
                    </h1>
                    <div className="w-32 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 mx-auto rounded-full mb-6"></div>
                    <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                      Your insights are incredibly valuable and will directly influence the development of AgroSense360 and our upcoming technology products. We are committed to building solutions that truly solve real-world challenges, and your input helps guide that mission.
                    </p>
                    <Link 
                      to="/" 
                      className="inline-flex items-center gap-2 text-gold-light hover:text-amber-300 transition-colors mb-6 group"
                    >
                      <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
                      <span className="font-medium">Go Back Home</span>
                    </Link>
                  </div>
                )}
                {/* Navigation */}
                <div className="mt-6 flex justify-between">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Previous
                    </button>
                  )}
                  {step !== 0 && step < 7 && (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
                    >
                      Next
                    </button>
                  )}
                  {step === 7 && (
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Submit
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Footer Info */}
            <div className="bg-gradient-to-r from-gray-900 to-black border-t border-amber-500/20 p-4 sm:p-6">
              <div className="text-center text-gray-400 text-xs sm:text-sm">
                <p className="mb-2">
                  <span className="text-amber-400 font-semibold">🔒 Your privacy matters:</span> All responses are confidential and will only be used to improve our services.
                </p>
                <p className="text-gray-500">
                  Thank you for taking the time to help us serve you better!
                </p>
              </div>
            </div>
          </div>

          {/* Additional CTAs */}
          <div className="mt-8 sm:mt-12 grid sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-amber-500/20 hover:border-amber-500/40 transition-all">
              <h4 className="text-gold-light font-bold text-lg mb-2">Need Help?</h4>
              <p className="text-gray-400 text-sm mb-4">
                If you encounter any issues with the survey, please contact our support team.
              </p>
              <a 
                href="mailto:bloxionigerialimited@gmail.com" 
                className="text-amber-400 hover:text-amber-300 text-sm font-medium inline-flex items-center gap-1"
              >
                Contact Support
                <ExternalLink size={14} />
              </a>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-amber-500/20 hover:border-amber-500/40 transition-all">
              <h4 className="text-gold-light font-bold text-lg mb-2">Learn More</h4>
              <p className="text-gray-400 text-sm mb-4">
                Discover how Bloxio is innovating technology solutions for the future.
              </p>
              <Link 
                to="/#about" 
                className="text-amber-400 hover:text-amber-300 text-sm font-medium inline-flex items-center gap-1"
              >
                Explore Our Vision
                <ArrowLeft size={14} className="rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}