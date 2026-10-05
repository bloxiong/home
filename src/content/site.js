/* Single source of truth for company facts and page copy.
   Keep every claim here true: AgroSense360 is a prototype,
   pipeline products are areas we are exploring, not shipping. */

const unsplash = (id, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

export const IMG = {
  circuit:   unsplash('1518770660439-4636190af475'),
  pcb:       unsplash('1517077304055-6e89abbf09b0'),
  soldering: unsplash('1563770660941-20978e870e26'),
  parts:     unsplash('1555664424-778a1e5e1b48'),
  drafting:  unsplash('1581092160562-40aa08e78837'),
  lab:       unsplash('1581094794329-c8112a89af12'),
  network:   unsplash('1620712943543-bcc4688e7485'),
  space:     unsplash('1451187580459-43490279c0fa'),
  maize:     unsplash('1625246333195-78d9c38ad449'),
  farmers:   unsplash('1574943320219-553eb213f72d'),
  seedlings: unsplash('1530836369250-ef72a3f5cda8'),
  field:     unsplash('1500382017468-9049fed747ef'),
  drone:     unsplash('1473968512647-3e447244af8f'),
  lighting:  unsplash('1513506003901-1e6a229e2d15'),
  cctv:      unsplash('1557597774-9d273605dfa9'),
  solar:     unsplash('1509391366360-2e959784a276'),
};

export const COMPANY = {
  name: 'Bloxio',
  legalName: 'Bloxio Nigeria Limited',
  tagline: 'One step ahead of tech',
  email: 'contact@bloxio.tech',
  phones: [
    { display: '+234 706 891 9754', tel: '+2347068919754' },
    { display: '+234 806 243 9424', tel: '+2348062439424' },
  ],
  address: ['Plot AV 27B, 251 Road Festac Phase II', 'Abule Ado, Lagos State, Nigeria'],
  hours: 'Mon–Fri · 9AM – 6PM WAT',
};

export const AGROSENSE = {
  name: 'AgroSense360',
  stage: 'Prototype in progress',
  oneLiner: 'Eyes, ears and early warnings for every farm.',
  summary:
    'AgroSense360 combines field sensors, cameras and AI to watch crop health, soil and weather around the clock, then sends farmers clear alerts and recommendations on their phones.',
  problems: [
    { title: 'Problems are found too late', body: 'Disease, pests and nutrient stress usually show up during a walk-through, after damage is already spreading.' },
    { title: 'Effort does not always mean yield', body: 'Without soil and moisture data, fertiliser and irrigation are guesswork, and good effort still produces poor harvests.' },
    { title: 'Weather keeps changing', body: 'Rainfall patterns are harder to predict every season, and farmers rarely get local, field-level readings.' },
    { title: 'Monitoring costs labour', body: 'Inspecting large or distant plots by hand is slow and expensive, and nothing is recorded for next season.' },
  ],
  components: [
    { title: 'Field sensor nodes', body: 'Soil moisture, nutrient and microclimate readings taken in the field at regular intervals.' },
    { title: 'Crop cameras', body: 'Images of the canopy so the system can spot visual signs of disease and stress.' },
    { title: 'AI analysis', body: 'Models that turn readings and images into a diagnosis and a recommended next step.' },
    { title: 'Mobile alerts and reports', body: 'Early warnings on the farmer’s phone, plus farm data reports to plan the next season.' },
  ],
  features: [
    'AI-based crop disease detection',
    'Soil moisture and nutrient monitoring',
    'Early warning alerts on mobile',
    'Yield improvement recommendations',
    'Remote farm monitoring',
    'Farm data reports',
  ],
  audiences: [
    'Smallholder and commercial farmers',
    'Agribusiness owners and farm managers',
    'Agricultural consultants and extension workers',
    'Researchers and agricultural students',
  ],
};

/* Status values are honest labels for where each line actually is. */
export const PRODUCTS = [
  {
    slug: 'agrosense360',
    name: 'AgroSense360',
    category: 'Agriculture · AI · IoT',
    status: 'Prototype in progress',
    live: true,
    blurb: 'Sensors, cameras and AI that warn farmers about crop disease, soil problems and weather before they cost a harvest.',
    img: IMG.maize,
  },
  {
    slug: 'smart-electronics',
    name: 'Smart electronic devices',
    category: 'Consumer · Industrial',
    status: 'Exploring',
    blurb: 'Connected everyday devices designed and assembled for local conditions: power cuts, heat, dust and price.',
    img: IMG.pcb,
  },
  {
    slug: 'agricultural-drones',
    name: 'Agricultural drones and accessories',
    category: 'Agriculture · Aerial',
    status: 'Exploring',
    blurb: 'Aerial scouting and imaging that extends AgroSense360 across larger plots.',
    img: IMG.drone,
  },
  {
    slug: 'smart-lighting',
    name: 'Smart lighting',
    category: 'Lighting · Industrial',
    status: 'Exploring',
    blurb: 'Efficient, controllable lighting for drones, sites and industrial spaces.',
    img: IMG.lighting,
  },
  {
    slug: 'security',
    name: 'Security and surveillance',
    category: 'Security',
    status: 'Exploring',
    blurb: 'Monitoring devices that keep working when the network and the grid do not.',
    img: IMG.cctv,
  },
  {
    slug: 'energy',
    name: 'Energy and power systems',
    category: 'Energy',
    status: 'Exploring',
    blurb: 'Power management that keeps sensors and devices running off-grid.',
    img: IMG.solar,
  },
];

export const SERVICES = [
  {
    id: 'rnd',
    title: 'R&D and engineering',
    short: 'Turn an idea or a problem into a working technical design.',
    body: 'Research across AI, IoT and electronics, carried through to a design that can actually be built. We start from the problem, test the riskiest assumptions first, and document what we learn.',
    deliverables: ['Feasibility study', 'System architecture', 'Circuit and firmware design', 'Technical documentation'],
  },
  {
    id: 'product',
    title: 'Product design and manufacturing',
    short: 'Prototype, test and prepare a device for production.',
    body: 'From sketch to shelf: we prototype, test against real-world conditions, and prepare products for manufacture, with sourcing, enclosure and assembly in mind from day one.',
    deliverables: ['Working prototypes', 'PCB design and layout', 'Enclosure and assembly planning', 'Pre-production testing'],
  },
  {
    id: 'iot',
    title: 'Smart device ecosystems',
    short: 'Connect devices, sensors and software into one system.',
    body: 'Sensors in the field, devices on site, dashboards and alerts on the phone. We design how they talk to each other, what happens when the network drops, and how data turns into decisions.',
    deliverables: ['Sensor networks', 'Device-to-cloud connectivity', 'Dashboards and mobile alerts', 'Offline-tolerant design'],
  },
  {
    id: 'consulting',
    title: 'Technical consulting',
    short: 'Independent engineering advice before you commit money.',
    body: 'Strategic and technical guidance on choosing, implementing and scaling technology systems, from a second opinion on a design to a full technology plan.',
    deliverables: ['Technology assessment', 'Vendor and component selection', 'Implementation roadmap', 'Design review'],
  },
  {
    id: 'innovation',
    title: 'Innovation solutions',
    short: 'Take a bold idea from concept to launch plan.',
    body: 'For founders and organisations with an idea but no engineering team: we validate the concept, build the first version, and plan the path to a commercial launch.',
    deliverables: ['Concept validation', 'Minimum viable product', 'User and field testing', 'Launch planning'],
  },
  {
    id: 'support',
    title: 'Support and maintenance',
    short: 'Keep deployed systems healthy after launch.',
    body: 'Technical support and lifecycle management for systems already in the field: monitoring, fixes, firmware updates and planned upgrades.',
    deliverables: ['Maintenance plans', 'Firmware and software updates', 'Fault diagnosis and repair', 'Upgrade planning'],
  },
];

export const INDUSTRIES = [
  { name: 'Agriculture', note: 'Our first focus, through AgroSense360.' },
  { name: 'Consumer electronics', note: 'Devices built for local conditions.' },
  { name: 'Industrial', note: 'Monitoring, control and lighting.' },
  { name: 'Security', note: 'Surveillance and access devices.' },
  { name: 'Energy', note: 'Power management and off-grid systems.' },
];

export const PROCESS = [
  { title: 'Discover', body: 'We learn the problem on the ground, including who uses the system, where, and under what conditions.' },
  { title: 'Design', body: 'Architecture, circuits, firmware and software are planned together, with the riskiest parts tested first.' },
  { title: 'Prototype', body: 'A working version you can hold, run and break, built quickly so we learn quickly.' },
  { title: 'Validate', body: 'Field and user testing against real conditions: heat, dust, power cuts and patchy networks.' },
  { title: 'Deliver and support', body: 'Production, deployment and ongoing maintenance so the system keeps working after launch.' },
];

export const FOUNDERS = [
  {
    name: 'Anyakie Owen',
    postnominals: 'GMNSE, P.COREN',
    initials: 'AO',
    role: 'Co-Founder & Director',
    education: 'B.Eng Electrical/Electronics Engineering',
    focus: 'Major in Electronics and Computer Engineering',
  },
  {
    name: 'Austin-Chris Iwu',
    postnominals: 'GMNSE, P.COREN',
    initials: 'AC',
    role: 'Co-Founder & Director',
    education: 'B.Eng Electrical/Electronics Engineering',
    focus: 'Major in Electronics and Computer Engineering',
  },
];

/* Where the company is today. `now` marks the current step. */
export const MILESTONES = [
  { title: 'Incorporated', body: 'Bloxio Nigeria Limited registered with the CAC, with a registered office in Festac, Lagos.', done: true },
  { title: 'Farmer research', body: 'Surveying farmers and agribusinesses to understand their monitoring problems and what they would pay for. Still open.', now: true },
  { title: 'AgroSense360 prototype', body: 'Building and testing the sensor, camera and alert prototype in-house.', now: true },
  { title: 'Field pilot', body: 'Testing on partner farms with early-access users, then improving from what we learn.' },
  { title: 'Launch', body: 'Making AgroSense360 available to farmers and agribusinesses, then expanding the product line.' },
];

export const INQUIRY_TOPICS = [
  { value: 'project', label: 'Start a project' },
  { value: 'pilot', label: 'AgroSense360 pilot' },
  { value: 'invest', label: 'Investment or partnership' },
  { value: 'careers', label: 'Careers' },
  { value: 'other', label: 'Something else' },
];

export const FAQS = [
  {
    q: 'What is Bloxio Nigeria Limited?',
    a: 'A technology company in Lagos that researches, designs and builds hardware and software products across AI, IoT and electronics. We are building our own products, starting with AgroSense360, and we take on engineering projects for clients.',
  },
  {
    q: 'What is AgroSense360, and can I buy it?',
    a: 'AgroSense360 is our smart farming system: field sensors, cameras and AI that monitor crop health, soil and weather and send alerts to your phone. It is a prototype right now, so it is not for sale yet. Join the early-access list and we will contact you when the pilot opens.',
  },
  {
    q: 'Can Bloxio build a product or system for my company?',
    a: 'Yes. We take on R&D, product design, IoT systems, consulting and support work. Tell us what you are trying to do on the contact page and we aim to reply within 24 hours.',
  },
  {
    q: 'Who runs Bloxio?',
    a: 'Bloxio was founded by Anyakie Owen and Austin-Chris Iwu, both electrical and electronics engineers (B.Eng) and graduate members of the Nigerian Society of Engineers.',
  },
  {
    q: 'Is Bloxio a registered company?',
    a: 'Yes. Bloxio Nigeria Limited is incorporated and registered with the Corporate Affairs Commission (CAC). Our registered office is at Plot AV 27B, 251 Road Festac Phase II, Abule Ado, Lagos State.',
  },
  {
    q: 'Can I invest in or partner with Bloxio?',
    a: 'Yes. We are actively exploring partnerships and investment with people and organisations who share our vision, including investors, farms that could host a pilot, distributors and research partners. Choose “Investment or partnership” on the contact page.',
  },
  {
    q: 'Are you hiring?',
    a: 'We have no open roles listed right now, but we want to hear from engineers and builders who would like to work on hardware made in Nigeria. See the careers page.',
  },
  {
    q: 'Do you work outside Nigeria?',
    a: 'We are Nigeria-first today, but we design to international standards and plan to serve markets across Africa and beyond.',
  },
];
