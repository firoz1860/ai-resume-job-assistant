import { test } from '@playwright/test';
import { routeApi, installSession } from './fixtures.js';
import path from 'node:path';
import fs from 'node:fs';

const VID = path.resolve(process.cwd(), '../qa-evidence/video');
fs.mkdirSync(VID, { recursive: true });

// Run once (in the desktop project); the tour makes its own sized contexts.
test.describe('tour video', () => {
  test.beforeEach(({}, testInfo) => { test.skip(testInfo.project.name !== 'desktop', 'run once'); });

  async function smoothScrollTo(page, target, steps = 30, delay = 24) {
    const from = await page.evaluate(() => window.scrollY);
    for (let i = 1; i <= steps; i++) {
      const y = Math.round(from + (target - from) * (i / steps));
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(delay);
    }
  }

  test('desktop: hero + logo morph, card stack + release, reverse scroll', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: VID, size: { width: 1440, height: 900 } } });
    await routeApi(ctx);
    const page = await ctx.newPage();
    const video = page.video();
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(1000); // let the oversized wordmark settle
    const max = await page.evaluate(() => document.body.scrollHeight - window.innerHeight);
    await smoothScrollTo(page, Math.round(max * 0.55), 60, 26);
    await page.waitForTimeout(400);
    await smoothScrollTo(page, 0, 50, 24); // reverse
    await page.waitForTimeout(500);
    await ctx.close();
    const src = await video.path();
    fs.copyFileSync(src, path.join(VID, 'tour-desktop.webm'));
  });

  test('[fixture] mobile: navigation drawer', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, recordVideo: { dir: VID, size: { width: 390, height: 844 } } });
    await routeApi(ctx);
    await installSession(ctx);
    const page = await ctx.newPage();
    const video = page.video();
    await page.goto('/dashboard', { waitUntil: 'load' });
    await page.waitForTimeout(900);
    const toggle = page.getByRole('button', { name: /open navigation/i });
    await toggle.click();
    await page.waitForTimeout(900);
    await page.getByRole('link', { name: /Applications/i }).first().click().catch(() => {});
    await page.waitForTimeout(900);
    await ctx.close();
    const src = await video.path();
    fs.copyFileSync(src, path.join(VID, 'tour-mobile.webm'));
  });
});
