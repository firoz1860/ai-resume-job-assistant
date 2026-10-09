import { test, expect } from '@playwright/test';
import { PAGES, routeApi, installSession } from './fixtures.js';
import path from 'node:path';
import fs from 'node:fs';

const DIR = path.resolve(process.cwd(), '../qa-evidence/screens');
fs.mkdirSync(DIR, { recursive: true });

for (const p of PAGES) {
  test(`${p.auth ? '[fixture] ' : ''}screenshot ${p.name}`, async ({ page, context }, testInfo) => {
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

    await routeApi(context);
    if (p.auth) await installSession(context);

    await page.goto(p.path, { waitUntil: 'load' });
    await page.waitForTimeout(900);

    const ov = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      iw: window.innerWidth,
    }));

    const file = path.join(DIR, `${p.name}__${testInfo.project.name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    await testInfo.attach(`${p.name}-${testInfo.project.name}`, { path: file, contentType: 'image/png' });

    // Connection-refused / resource errors are the (mocked-away) backend; ignore.
    const nonApi = errors.filter((e) => !/ERR_|net::|Failed to load resource/.test(e));
    expect.soft(nonApi, `console errors on ${p.name}`).toEqual([]);
    expect.soft(ov.sw, `horizontal overflow on ${p.name} (${ov.sw} > ${ov.iw})`).toBeLessThanOrEqual(ov.iw + 1);
  });
}
