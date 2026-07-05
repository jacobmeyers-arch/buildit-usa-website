// site-review-capture.mjs — render live buildit-usa.com pages, save screenshots + text
// Usage: node scripts/site-review-capture.mjs <output-dir>
// Created 2026-07-05 for the site review/redesign session.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const OUT = process.argv[2];
if (!OUT) { console.error('need output dir'); process.exit(1); }
mkdirSync(OUT, { recursive: true });

const PAGES = ['', 'about', 'ai-for-your-work', 'services', 'whole-home-planner', 'property', 'projects'];
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  for (const p of PAGES) {
    const slug = p || 'home';
    const url = `https://www.buildit-usa.com/${p}`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(1500); // let fonts/images settle
    await page.screenshot({ path: join(OUT, `${slug}-${vp.name}.png`), fullPage: true });
    if (vp.name === 'desktop') {
      const text = await page.evaluate(() => document.body.innerText);
      writeFileSync(join(OUT, `${slug}.txt`), text);
    }
    console.log(`captured ${slug} @ ${vp.name}`);
  }
  await ctx.close();
}
await browser.close();
