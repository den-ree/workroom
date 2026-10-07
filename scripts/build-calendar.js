#!/usr/bin/env node
// Writes one .ics per dated timeline event to <outDir>/calendar/ for the homepage
// "+ Calendar" button. Run by the deploy workflow; run it locally to preview:
//   node scripts/build-calendar.js        → ./calendar/ (gitignored)
//   node scripts/build-calendar.js _site  → _site/calendar/
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/timeline-data.js'), 'utf8'), ctx);
const cal = require('../js/calendar.js');

const out = path.join(path.resolve(process.argv[2] || root), 'calendar');
fs.mkdirSync(out, { recursive: true });

let written = 0;
for (const ev of ctx.window.TIMELINE_EVENTS) {
    const body = cal.ics(ev);
    if (!body) continue; // only full YYYY-MM-DD dates get an invite
    fs.writeFileSync(path.join(out, cal.fileName(ev)), body);
    written++;
}
console.log(`wrote ${written} calendar files to ${path.relative(process.cwd(), out) || '.'}`);
