import { test, expect } from '@playwright/test';
import { routeApi } from './fixtures.js';
import path from 'node:path';
import fs from 'node:fs';

const VID = path.resolve(process.cwd(), '../qa-evidence/video');
fs.mkdirSync(VID, { recursive: true });

const AMOUNTS = { bg: 8, emblem: 15, resume: 19, app: 25, interview: 30 };

async function readTY(page) {
  return page.evaluate(() => {
    const out = {};
    for (const k of ['bg', 'emblem', 'resume', 'app', 'interview']) {
      const el = document.querySelector(`[data-parallax="${k}"]`);
      out[k] = el ? new DOMMatrixReadOnly(getComputedStyle(el).transform).m42 : null;
    }
    return out;
  });
}
async function smoothScroll(page, to, steps = 40, delay = 22) {
  const from = await page.evaluate(() => window.scrollY);
  for (let i = 1; i <= steps; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(from + (to - from) * (i / steps)));
    await page.waitForTimeout(delay);
  }
}

test.describe('hero parallax', () => {
  test.beforeEach(({}, testInfo) => { test.skip(testInfo.project.name !== 'desktop', 'desktop only'); });

  test('layers move by different, bounded amounts and reverse', async ({ page, context }) => {
    await routeApi(context);
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(900);
    const atTop = await readTY(page);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);
    const scrolled = await readTY(page);

    for (const k of Object.keys(AMOUNTS)) {
      expect(Math.abs(scrolled[k]), `${k} within bound`).toBeLessThanOrEqual(AMOUNTS[k] + 1);
    }
    expect(Math.abs(scrolled.interview)).toBeGreaterThanOrEqual(Math.abs(scrolled.app) - 0.6);
    expect(Math.abs(scrolled.app)).toBeGreaterThanOrEqual(Math.abs(scrolled.resume) - 0.6);
    expect(Math.abs(scrolled.resume)).toBeGreaterThanOrEqual(Math.abs(scrolled.emblem) - 0.6);
    expect(Math.abs(scrolled.emblem)).toBeGreaterThanOrEqual(Math.abs(scrolled.bg) - 0.6);
    expect(Math.abs(scrolled.interview - atTop.interview)).toBeGreaterThan(1);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const back = await readTY(page);
    expect(Math.abs(back.interview - atTop.interview)).toBeLessThan(2);
  });

  test('parallax is disabled under reduced motion (layers static)', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await routeApi(ctx);
    const page = await ctx.newPage();
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(700);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);
    const ty = (await readTY(page)).interview;
    expect(Math.abs(ty)).toBeLessThanOrEqual(1);
    await ctx.close();
  });

  test('offscreen suspension still works', async ({ page, context }) => {
    await routeApi(context);
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);
    const paused = await page.evaluate(() => document.querySelector('[data-hero-scene]')?.classList.contains('hero-paused'));
    expect(paused).toBeTruthy();
  });

  test('no horizontal overflow while scrolling (390/768/1024/1440x600)', async ({ browser }) => {
    for (const [w, h] of [[390, 844], [768, 1024], [1024, 768], [1440, 600]]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      await routeApi(ctx);
      const page = await ctx.newPage();
      await page.goto('/', { waitUntil: 'load' });
      await page.waitForTimeout(400);
      await page.evaluate(() => window.scrollTo(0, 300));
      await page.waitForTimeout(200);
      const ov = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
      expect(ov.sw, `overflow at ${w}x${h}`).toBeLessThanOrEqual(ov.iw + 1);
      await ctx.close();
    }
  });

  test('capture before/after scroll videos', async ({ browser }) => {
    const after = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: VID, size: { width: 1440, height: 900 } } });
    await routeApi(after);
    const pa = await after.newPage();
    const va = pa.video();
    await pa.goto('/', { waitUntil: 'load' });
    await pa.waitForTimeout(1000);
    await smoothScroll(pa, 1100);
    await pa.waitForTimeout(300);
    await smoothScroll(pa, 0);
    await after.close();
    fs.copyFileSync(await va.path(), path.join(VID, 'parallax-after.webm'));

    const before = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', recordVideo: { dir: VID, size: { width: 1440, height: 900 } } });
    await routeApi(before);
    const pb = await before.newPage();
    const vb = pb.video();
    await pb.goto('/', { waitUntil: 'load' });
    await pb.waitForTimeout(1000);
    await smoothScroll(pb, 1100);
    await pb.waitForTimeout(300);
    await smoothScroll(pb, 0);
    await before.close();
    fs.copyFileSync(await vb.path(), path.join(VID, 'parallax-before.webm'));
  });
});
