export const SURVEY_STATUSES = ['new', 'reviewed', 'contacted', 'archived']
export const ENQUIRY_STATUSES = ['new', 'replied', 'closed']
export const EMAIL_KINDS = ['notify', 'confirm', 'compose', 'invite', 'reset']

// Options on the public AgroSense360 survey (src/pages/AgroSense360-Survey.jsx)
export const RESPONDENT_TYPES = [
  'Farmer', 'Agribusiness owner', 'Agricultural consultant / extension worker',
  'Agricultural student / researcher', 'Investor', 'Tech enthusiast', 'Other',
]
export const YES_MAYBE_NO = ['Yes', 'Maybe', 'No']

// Contact form topics (server/app/routers/public.py TOPICS)
export const TOPICS = {
  project: 'Start a project',
  pilot: 'AgroSense360 pilot',
  invest: 'Investment or partnership',
  careers: 'Careers',
  other: 'Something else',
}
export const topicLabel = (t) => TOPICS[t] || t || 'General'

export const UNSPLASH = (id, w = 400) => `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`
