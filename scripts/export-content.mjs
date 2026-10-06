/* Writes the site's editable content (src/content/site.js) to
   server/app/content_defaults.json. The API seeds the content editor from
   it, so run this after changing site.js by hand: npm run content:export */
import { writeFileSync } from 'node:fs';
import * as site from '../src/content/site.js';

// sections admins can edit (IMG and STATUS stay in code; IMG is offered as photo choices)
export const EDITABLE = ['COMPANY', 'HERO_WORDS', 'AGROSENSE', 'PRODUCTS', 'DISCIPLINES', 'CAPABILITIES',
  'ENGAGEMENTS', 'PROCESS', 'RESEARCH', 'FOUNDERS', 'NUMBERS', 'MILESTONES', 'ARTICLES', 'FAQS'];

const out = Object.fromEntries(EDITABLE.map((k) => [k, site[k]]));
out._IMAGES = site.IMG; // read-only list of photo choices for the editor
writeFileSync(new URL('../server/app/content_defaults.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
console.log('content defaults written:', EDITABLE.length, 'sections');
