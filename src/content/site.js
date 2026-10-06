/* Single source of truth for company facts and page copy.
   Keep every claim here true. AgroSense360 facts come from the
   pre-seed deck (prototype results, not commercial field results).
   Pipeline products are concepts we are exploring, not shipping. */

/* The site's original photography (Unsplash). Illustrative only: none
   of these show BLOXio deployments or AgroSense360 itself. */
export const IMG = {
  circuit:   '1518770660439-4636190af475',
  pcb:       '1517077304055-6e89abbf09b0',
  soldering: '1563770660941-20978e870e26',
  parts:     '1555664424-778a1e5e1b48',
  drafting:  '1581092160562-40aa08e78837',
  lab:       '1581094794329-c8112a89af12',
  network:   '1620712943543-bcc4688e7485',
  space:     '1451187580459-43490279c0fa',
  maize:     '1625246333195-78d9c38ad449',
  farmers:   '1574943320219-553eb213f72d',
  seedlings: '1530836369250-ef72a3f5cda8',
  field:     '1500382017468-9049fed747ef',
  drone:     '1473968512647-3e447244af8f',
  lighting:  '1513506003901-1e6a229e2d15',
  cctv:      '1557597774-9d273605dfa9',
  solar:     '1509391366360-2e959784a276',
};

export const COMPANY = {
  name: 'BLOXio',
  legalName: 'BLOXio Nigeria Limited',
  tagline: 'Engineering tomorrow',
  positioning: 'We build intelligent hardware and software for the physical world.',
  email: 'contact@bloxio.tech',
  url: 'https://bloxio.tech',
  phones: [
    { display: '+234 706 891 9754', tel: '+2347068919754' },
    { display: '+234 806 243 9424', tel: '+2348062439424' },
  ],
  address: ['Plot AV 27B, 251 Road Festac Phase II', 'Abule Ado, Lagos State, Nigeria'],
  hours: 'Mon–Fri · 9AM – 6PM WAT',
};

/* Status labels used across the site. `tone` drives the badge style. */
export const STATUS = {
  prototype:   { label: 'Prototype',      tone: 'solid' },
  development: { label: 'In development', tone: 'solid' },
  pilot:       { label: 'Pilot',          tone: 'solid' },
  rnd:         { label: 'R&D',            tone: 'outline' },
  concept:     { label: 'Concept',        tone: 'dashed' },
  soon:        { label: 'Coming soon',    tone: 'outline' },
};

/* Words cycled in the home hero: "We engineer ___" */
export const HERO_WORDS = [
  'field rovers',
  'embedded electronics',
  'machine vision',
  'sensor networks',
  'cloud platforms',
  'smart devices',
];

export const AGROSENSE = {
  name: 'AgroSense360',
  code: 'AG360',
  status: 'prototype',
  headline: 'Autonomous intelligence for modern agriculture.',
  oneLiner:
    'A ground rover that drives a farm, reads the leaves and the soil, and tells the farmer exactly what is wrong while there is still time to fix it.',
  summary:
    'AgroSense360 moves through the field, observes the crop, reads the soil and names what is wrong. Diagnosis, treatment and prevention reach the farmer’s phone in seconds.',
  /* Drive / See / Sense / Say: the deck's four-part loop */
  loop: [
    {
      key: 'drive',
      img: IMG.field,
      verb: 'Drive',
      title: 'It walks the rows',
      body: 'It moves through the field on its own, or under control from a phone or browser, and avoids obstacles on the way.',
      tag: 'AUTONOMOUS · REMOTE CONTROL',
    },
    {
      key: 'see',
      img: IMG.maize,
      verb: 'See',
      title: 'It looks at the crop',
      body: 'It photographs foliage up close, and a trained model names one of 38 disease and healthy states across 9 crops.',
      tag: 'CROP VISION · 38 CLASSES',
    },
    {
      key: 'sense',
      img: IMG.seedlings,
      verb: 'Sense',
      title: 'It reads the soil',
      body: 'It reads nitrogen, phosphorus and potassium, plus moisture, light and location, where the plant stands.',
      tag: 'NPK · MOISTURE · LIGHT · LOCATION',
    },
    {
      key: 'say',
      img: IMG.farmers,
      verb: 'Say',
      title: 'It reaches the farmer first',
      body: 'Diagnosis, treatment and prevention land on the farmer’s phone in seconds, while they are still in the field.',
      tag: 'PHONE ALERTS · DASHBOARD',
    },
  ],
  /* Prototype results from the deck. Test track and held-out images only. */
  proof: [
    { value: 96.5, decimals: 1, suffix: '%', label: 'classification accuracy on 1,500 held-out images' },
    { value: 38, label: 'disease and healthy classes across 9 crops' },
    { value: 160, label: 'diagnoses through the live pipeline' },
    { value: 13.6, decimals: 1, suffix: ' s', label: 'from crop photographed to alert on the phone' },
    { value: 95, suffix: '%', label: 'obstacle avoidance over 20 test-track trials' },
  ],
  proofNote:
    'Prototype results measured on a test track and a held-out image set. They are not commercial field results.',
  have: 'Working hardware, a trained model, a deployed API, a live dashboard, an alert path to the farmer’s phone, and 38 written crop advisories.',
  haveNot: 'A paying customer, or field results from a commercial farm. Field validation closes both gaps.',
  problems: [
    { n: '01', title: 'Nobody is looking', body: 'Scouting on foot covers a farm about once a week. Infection does not wait a week.' },
    { n: '02', title: 'Nobody can name it', body: 'Early and late blight look alike and need different responses. Guessing wrong costs the input and the crop.' },
    { n: '03', title: 'Nobody says what to do', body: 'Extension advice is scarce, generic and late.' },
  ],
  lossStat: { value: '20–40%', label: 'of food crops lost to pests and disease each year, worldwide (FAO)' },
  crops: ['Cassava', 'Yam', 'Cocoyam', 'Ugu', 'Tomato', 'Pepper', 'Maize'],
  farmer: [
    { title: 'An instruction, not a score', body: 'A diagnosis, what to do about it this week, and how to stop it coming back.' },
    { title: 'Written for these crops', body: 'Cassava, yam, cocoyam, ugu, tomato, pepper and the rest of the crops in the model, not a generic pest list.' },
  ],
  manager: [
    { title: 'Live and historic', body: 'Soil readings against the ideal band, trends per sensor, every diagnosis logged with confidence, time and location.' },
    { title: 'Hands on the wheel', body: 'Take control from any browser and drive to the plant in question.' },
  ],
  roadmap: [
    { when: 'Months 1–6',   title: 'Field-ready units',      body: 'The next generation, developed for real field deployment.' },
    { when: 'Months 6–12',  title: 'Field testing',          body: 'Design-partner deployments. Model retrained on Nigerian field imagery.' },
    { when: 'Months 12–18', title: 'Commercial validation',  body: 'Outcomes measured against control blocks. Pricing validated. First paid conversions targeted.' },
  ],
  roadmapNote: 'Every milestone is a target, not a result.',
};

/* Product lines. Only AgroSense360 is being built today. */
export const PRODUCTS = [
  {
    slug: 'agrosense360',
    name: 'AgroSense360',
    code: 'AG360',
    category: 'Agriculture · Robotics · AI',
    status: 'prototype',
    blurb: 'An autonomous field rover that spots crop problems early.',
    href: '/products/agrosense360',
    img: IMG.farmers,
  },
  {
    slug: 'smart-systems',
    img: IMG.pcb,
    name: 'BLOXio Smart Systems',
    code: 'SS',
    category: 'Electronics · Lighting · Industrial',
    status: 'concept',
    blurb: 'Connected devices and lighting built for local conditions.',
  },
  {
    slug: 'agricultural-drones',
    img: IMG.drone,
    name: 'Agricultural drones',
    code: 'AD',
    category: 'Agriculture · Aerial',
    status: 'concept',
    blurb: 'Aerial scouting for larger farms.',
  },
  {
    slug: 'security',
    img: IMG.cctv,
    name: 'Security and surveillance',
    code: 'SS',
    category: 'Security',
    status: 'concept',
    blurb: 'Monitoring that works off-grid.',
  },
  {
    slug: 'energy',
    img: IMG.solar,
    name: 'Energy and power systems',
    code: 'EP',
    category: 'Energy',
    status: 'concept',
    blurb: 'Power that keeps devices running.',
  },
];

/* Three disciplines: what we engineer */
export const DISCIPLINES = [
  {
    id: 'product',
    n: '01',
    img: IMG.soldering,
    title: 'Product engineering',
    lead: 'Electronics built to be manufactured.',
    items: ['Electronics', 'Embedded systems', 'PCB design', 'Firmware', 'Prototyping', 'Design for manufacturing'],
  },
  {
    id: 'software',
    n: '02',
    img: IMG.lab,
    title: 'Software & intelligence',
    lead: 'The cloud, models and data behind devices.',
    items: ['Backend infrastructure', 'Cloud systems', 'AI', 'Computer vision', 'Device platforms', 'Data systems'],
  },
  {
    id: 'research',
    n: '03',
    img: IMG.network,
    title: 'Research & development',
    lead: 'Risky ideas, tested first.',
    items: ['IoT', 'Autonomous systems', 'Sensor networks', 'Edge computing', 'Emerging technologies'],
  },
];

/* Engineering page: capability areas. Stacks are what the team works in. */
export const CAPABILITIES = [
  {
    id: 'embedded',
    n: '01',
    img: IMG.soldering,
    title: 'Embedded systems',
    body: 'PCB design, firmware, microcontrollers, sensor integration and power electronics. Boards and code that keep working in heat, dust and on unstable power.',
    stack: ['C++', 'ESP32', 'Raspberry Pi', 'PCB design', 'Sensor integration'],
    proof: 'AgroSense360: movement, crop imaging and soil sensing working together on one platform.',
  },
  {
    id: 'software',
    n: '02',
    img: IMG.lab,
    title: 'Software & cloud',
    body: 'Backend services, APIs, telemetry, databases and device management. Services that stay correct when traffic spikes and devices drop off the network.',
    stack: ['Python', 'FastAPI', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'Linux'],
    proof: 'AgroSense360: a deployed inference API, a live dashboard and an alert path to the farmer’s phone.',
  },
  {
    id: 'ai',
    n: '03',
    img: IMG.maize,
    title: 'AI & edge computing',
    body: 'Computer vision, intelligent sensing, machine learning and autonomous decision systems. Models trained on the conditions they will actually see.',
    stack: ['Computer vision', 'Transfer learning', 'Inference services', 'Sensor fusion'],
    proof: 'AgroSense360: a 38-class crop-disease classifier at 96.5% accuracy on 1,500 held-out images.',
  },
  {
    id: 'product',
    n: '04',
    img: IMG.parts,
    title: 'Product engineering',
    body: 'System architecture, CAD, prototyping, electronics integration, testing and design for manufacturing. One team owns the whole path, so nothing falls between vendors.',
    stack: ['System architecture', 'CAD', 'Prototyping', 'Test tracks', 'DFM'],
    proof: 'AgroSense360: an integrated prototype that worked end to end, from field to phone.',
  },
];

/* Ways to work with BLOXio (formerly the services list) */
export const ENGAGEMENTS = [
  { id: 'rnd',        title: 'R&D and feasibility',    body: 'Turn an idea into a technical design, testing the riskiest assumptions first.' },
  { id: 'product',    title: 'Prototype to production', body: 'Working prototypes, PCB layout, enclosure and assembly planning, pre-production testing.' },
  { id: 'iot',        title: 'Connected systems',      body: 'Sensor networks, device-to-cloud connectivity, dashboards and alerts that survive dropped networks.' },
  { id: 'consulting', title: 'Technical consulting',   body: 'An independent engineering opinion before you commit money: design review, component and vendor selection.' },
  { id: 'support',    title: 'Support and maintenance', body: 'Monitoring, firmware updates, fault diagnosis and upgrades for systems already in the field.' },
];

export const PROCESS = [
  { title: 'Discover', body: 'Learn the problem where it happens.' },
  { title: 'Design', body: 'Hardware and software planned together.' },
  { title: 'Prototype', body: 'Something you can hold and break.' },
  { title: 'Validate', body: 'Tested in heat, dust and power cuts.' },
  { title: 'Deliver', body: 'Shipped, supported, kept running.' },
];

/* Research: areas of exploration. None of these are products for sale. */
export const RESEARCH = [
  {
    id: 'autonomy',
    img: IMG.field,
    title: 'Autonomous field robotics',
    status: 'development',
    body: 'Taking AgroSense360 from a test-track prototype to units ready for real field deployment.',
    links: [{ label: 'AgroSense360', to: '/products/agrosense360' }],
  },
  {
    id: 'vision',
    img: IMG.maize,
    title: 'Crop-disease vision for local crops',
    status: 'rnd',
    body: 'Public datasets barely cover cassava, yam, cocoyam or ugu. We are building models on Nigerian field imagery so diagnosis works on the crops farmers here actually grow.',
  },
  {
    id: 'soil',
    img: IMG.seedlings,
    title: 'In-ground soil sensing',
    status: 'prototype',
    body: 'Nitrogen, phosphorus, potassium and moisture read where the plant stands, so a diagnosis can separate nutrition problems from disease.',
  },
  {
    id: 'networks',
    img: IMG.parts,
    title: 'Low-power sensor networks',
    status: 'rnd',
    body: 'Lightweight messaging, payload compression and sleep scheduling for dense networks of battery-powered sensors. Ongoing founder research into MQTT for constrained devices.',
  },
  {
    id: 'edge',
    img: IMG.circuit,
    title: 'Edge versus cloud intelligence',
    status: 'rnd',
    body: 'Deciding what a field device should infer on board and what belongs in the cloud, when connectivity is patchy and power is scarce.',
  },
  {
    id: 'aerial',
    img: IMG.drone,
    title: 'Aerial scouting',
    status: 'concept',
    body: 'Whether drones can extend ground-rover coverage across larger plots. Drones cannot touch the soil, so the rover stays central.',
  },
];

export const FOUNDERS = [
  {
    name: 'Anyakie Owen',
    initials: 'AO',
    role: 'Co-founder & CEO',
    education: 'B.Eng Electrical and Electronics Engineering',
    postnominals: 'GMNSE, P.COREN',
    focus: 'Backend, electronics and systems engineering',
    bio: 'Has shipped production backend systems and IoT device infrastructure, with hands-on electronics and embedded integration.',
    link: { label: 'owenanyakie.com', href: 'https://owenanyakie.com' },
  },
  {
    name: 'Austin-Chris Iwu',
    initials: 'AC',
    role: 'Co-founder & CTO',
    education: 'B.Eng Electrical and Electronics Engineering',
    postnominals: 'GMNSE, P.COREN',
    focus: 'Software, machine learning and firmware',
    bio: 'Engineered the AgroSense360 system end to end: firmware, the 38-class model, the inference service, the dashboard and the advisory content.',
  },
];

/* Truthful numbers only. Small is fine. */
export const NUMBERS = [
  { value: 1, label: 'product in active development' },
  { value: 3, label: 'engineering disciplines under one roof' },
  { value: 6, label: 'research areas being explored' },
  { value: 2, label: 'engineer founders who build it themselves' },
];

export const MILESTONES = [
  { title: 'Incorporated', body: 'BLOXio Nigeria Limited registered with the CAC, with a registered office in Festac, Lagos.', done: true },
  { title: 'First integrated prototype', body: 'AgroSense360 worked end to end, from the field to an alert on the farmer’s phone.', done: true },
  { title: 'Farmer research', body: 'Surveying farmers and agribusinesses about monitoring problems and what they would pay for. Still open.', now: true },
  { title: 'Field-ready units', body: 'The next AgroSense360 generation, developed for real field deployment.', now: true },
  { title: 'Design-partner pilots', body: 'Target: five commercial farms. None recruited yet.' },
  { title: 'More product lines', body: 'Taking the next concept from research into development.' },
];

/* Journal. Articles are data; the body is a list of blocks. */
export const ARTICLES = [
  {
    slug: 'inside-the-first-agrosense360-prototype',
    img: IMG.farmers,
    title: 'Inside the first AgroSense360 prototype',
    date: '2026-10-05',
    author: 'BLOXio Engineering',
    category: 'Product development',
    summary:
      'What the first integrated rover does, what it measured on the test track, and what it has not proven yet.',
    body: [
      { type: 'p', text: 'The first integrated AgroSense360 prototype was developed and tested during the founders’ engineering work at FUTO. All rights in the system are held by BLOXio. This is what it does, and where it stands.' },
      { type: 'h', text: 'One loop: drive, see, sense, say' },
      { type: 'p', text: 'The rover moves through the rows on its own or under control from a phone. It photographs foliage up close and a model names one of 38 disease and healthy states across 9 crops. It reads nitrogen, phosphorus and potassium, plus moisture, light and location. The diagnosis, a treatment and a prevention list reach the farmer’s phone in seconds.' },
      { type: 'p', text: 'Drones cannot touch the soil, and a phone app only sees the leaf you photographed. The point of a ground rover is to stand in the row and do both.' },
      { type: 'h', text: 'What it measured' },
      { type: 'list', items: [
        '96.5% classification accuracy on 1,500 held-out images.',
        '160 diagnoses through the live pipeline.',
        '13.6 seconds from crop photographed to alert on the phone.',
        '95% obstacle avoidance over 20 test-track trials.',
      ] },
      { type: 'p', text: 'These are prototype results, measured on a test track and a held-out image set. They are not commercial field results.' },
      { type: 'h', text: 'What it has not proven' },
      { type: 'p', text: 'There is no paying customer yet, and no field results from a commercial farm. The next generation is being developed for real field deployment, and the plan is to run it with design-partner farms and measure outcomes against control blocks.' },
    ],
    related: [{ label: 'AgroSense360', to: '/products/agrosense360' }],
  },
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
    q: 'What is BLOXio Nigeria Limited?',
    a: 'An engineering company in Lagos that designs and builds intelligent hardware and software: electronics, embedded systems, cloud backends and AI. We build our own products, starting with AgroSense360, and take on engineering projects for clients.',
  },
  {
    q: 'What is AgroSense360, and can I buy it?',
    a: 'An autonomous field rover that watches crops, reads the soil and tells farmers what is wrong and what to do. The core system has worked end to end as a prototype, but it is not for sale yet. Join the pilot list and we will contact you when field testing opens.',
  },
  {
    q: 'Can BLOXio build a product or system for my company?',
    a: 'Yes. We take on R&D, prototyping, connected systems, consulting and support work. Tell us what you are trying to do on the contact page and we aim to reply within 24 hours.',
  },
  {
    q: 'Who runs BLOXio?',
    a: 'Co-founders Anyakie Owen (CEO) and Austin-Chris Iwu (CTO), both electrical and electronics engineers (B.Eng) and graduate members of the Nigerian Society of Engineers.',
  },
  {
    q: 'Is BLOXio a registered company?',
    a: 'Yes. BLOXio Nigeria Limited is registered with the Corporate Affairs Commission (CAC). Our registered office is at Plot AV 27B, 251 Road Festac Phase II, Abule Ado, Lagos State.',
  },
  {
    q: 'Can I invest in or partner with BLOXio?',
    a: 'Yes. We are talking to investors, farms that could host a pilot, distributors and research partners. Choose “Investment or partnership” on the contact page.',
  },
  {
    q: 'Are you hiring?',
    a: 'No roles are listed right now, but we want to hear from engineers who would like to build hardware made in Nigeria. See the careers page.',
  },
];
