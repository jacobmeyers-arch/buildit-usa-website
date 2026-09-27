/**
 * .overflow.mjs — find every element that pushes a page wider than the viewport.
 * Horizontal scroll on a phone is almost always one element, not the layout.
 * Runs real iOS widths in a mobile Safari-ish context.
 */
import { chromium } from 'playwright';

const WIDTHS = [
  ['iPhone SE',      375],
  ['iPhone 14',      390],
  ['iPhone 14 Pro Max', 430],
];
const PAGES = ['/', '/pricing', '/projects',
  '/examples/pig-barn-estimate.html', '/examples/garage-exterior-estimate.html'];

const b = await chromium.launch();
let bad = 0;

for (const [label, width] of WIDTHS) {
  const ctx = await b.newContext({
    viewport: { width, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const p = await ctx.newPage();

  for (const path of PAGES) {
    await p.goto('http://localhost:5173' + path, { waitUntil: 'networkidle' });
    await p.waitForTimeout(500);

    const report = await p.evaluate((vw) => {
      const doc = document.documentElement;
      const scrollW = Math.max(doc.scrollWidth, document.body.scrollWidth);
      const offenders = [];
      if (scrollW > vw + 1) {
        for (const el of document.querySelectorAll('*')) {
          const r = el.getBoundingClientRect();
          if (r.width === 0) continue;
          // Only the element itself sticking out, not a parent that merely contains one.
          const right = r.right + window.scrollX;
          if (right > vw + 1) {
            const kids = [...el.children].some((c) => {
              const cr = c.getBoundingClientRect();
              return cr.width > 0 && cr.right + window.scrollX > vw + 1;
            });
            if (!kids) {
              offenders.push({
                tag: el.tagName.toLowerCase(),
                cls: (typeof el.className === 'string' ? el.className : '').slice(0, 70),
                right: Math.round(right),
                w: Math.round(r.width),
                text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 55),
              });
            }
          }
        }
      }
      return { scrollW, offenders: offenders.slice(0, 8) };
    }, width);

    const over = report.scrollW - width;
    if (over > 1) {
      bad++;
      console.log(`\n✗ ${label} (${width}px)  ${path}  — scrolls ${over}px wide`);
      for (const o of report.offenders) {
        console.log(`    <${o.tag}> w=${o.w} right=${o.right}  "${o.text}"`);
        if (o.cls) console.log(`        .${o.cls}`);
      }
    } else {
      console.log(`✓ ${label} (${width}px)  ${path}`);
    }
  }
  await ctx.close();
}
await b.close();
console.log(bad ? `\n${bad} page/width combinations scroll horizontally.` : '\nNo horizontal scroll anywhere.');
