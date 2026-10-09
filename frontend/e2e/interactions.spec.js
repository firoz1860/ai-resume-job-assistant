import { test, expect } from '@playwright/test';
import { routeApi, installSession, ok, fail, MOCKS } from './fixtures.js';
import path from 'node:path';
import fs from 'node:fs';

const DIR = path.resolve(process.cwd(), '../qa-evidence/screens');
fs.mkdirSync(DIR, { recursive: true });
const shot = (page, name) => page.screenshot({ path: path.join(DIR, `${name}.png`), fullPage: true });

// ───────────────────────────── Desktop ─────────────────────────────
test.describe('desktop interactions', () => {
  test.beforeEach(({}, testInfo) => { test.skip(testInfo.project.name !== 'desktop', 'desktop only'); });

  test('stacked-card CTAs stay visible and clickable when focused', async ({ page, context }) => {
    await routeApi(context);
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(800);
    const ctas = page.getByRole('link', { name: /Set up your profile|Analyze a role|Open applications|Practice an interview/ });
    const n = await ctas.count();
    expect(n).toBeGreaterThanOrEqual(4);
    for (let i = 0; i < n; i++) {
      const cta = ctas.nth(i);
      await cta.focus();
      await cta.scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);
      await expect(cta).toBeVisible();
      const box = await cta.boundingBox();
      // The element painted at the CTA's centre must be the CTA (not a card on top).
      const notCovered = await page.evaluate(([x, y]) => {
        const el = document.elementFromPoint(x, y);
        const a = document.activeElement;
        return !!a && (el === a || a.contains(el) || el.contains(a));
      }, [box.x + box.width / 2, box.y + box.height / 2]);
      expect.soft(notCovered, `focused CTA #${i} is not covered`).toBeTruthy();
    }
  });

  test('reduced motion: hero paused, no overflow', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await routeApi(ctx);
    const page = await ctx.newPage();
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(700);
    const paused = await page.evaluate(() => document.querySelector('[data-hero-scene]')?.classList.contains('hero-paused'));
    const ov = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
    await shot(page, 'home_reduced-motion__desktop');
    expect.soft(paused, 'hero paused under reduced motion').toBeTruthy();
    expect.soft(ov.sw).toBeLessThanOrEqual(ov.iw + 1);
    await ctx.close();
  });

  test('home: navigate away and back keeps the hero', async ({ page, context }) => {
    await routeApi(context);
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(400);
    await page.goto('/about', { waitUntil: 'load' });
    await page.waitForTimeout(300);
    await page.goBack({ waitUntil: 'load' });
    await page.waitForTimeout(500);
    await expect(page.locator('[data-hero-scene]')).toHaveCount(1);
  });

  test('home extra widths: no horizontal overflow (360 / 768 / 1024 / 1440x600)', async ({ browser }) => {
    for (const [w, h] of [[360, 800], [768, 1024], [1024, 768], [1440, 600]]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      await routeApi(ctx);
      const page = await ctx.newPage();
      await page.goto('/', { waitUntil: 'load' });
      await page.waitForTimeout(500);
      const ov = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
      await shot(page, `home_${w}x${h}__extra`);
      expect.soft(ov.sw, `overflow at ${w}x${h} (${ov.sw}>${ov.iw})`).toBeLessThanOrEqual(ov.iw + 1);
      await ctx.close();
    }
  });

  test('[fixture] dashboard states: loaded / genuine-zero / empty / failed', async ({ browser }) => {
    const zero = {
      stats: [
        { label: 'Career Score', value: '0%', help: 'Run Career DNA to calculate' },
        { label: 'Generated', value: '0', help: 'Application assets' },
        { label: 'Applications', value: '0', help: 'Tracked roles' },
        { label: 'Practice', value: '0', help: 'Interview sessions' },
      ],
      progress: [{ label: 'Profile analyzed', value: 0 }, { label: 'Job matched', value: 0 }],
      nextActions: [], followUpsDue: [], recentActivities: [],
    };
    const cases = [
      ['loaded', (r) => r.fulfill(ok(MOCKS.dashboard))],
      ['zero-empty', (r) => r.fulfill(ok(zero))],
      ['failed', (r) => r.fulfill(fail('Server error'))],
    ];
    for (const [label, handler] of cases) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      await routeApi(ctx);
      await installSession(ctx);
      await ctx.route('**/api/dashboard/stats', handler);
      const page = await ctx.newPage();
      await page.goto('/dashboard', { waitUntil: 'load' });
      await page.waitForTimeout(900);
      await shot(page, `dashboard_${label}__fixture`);
      if (label === 'failed') {
        await expect.soft(page.getByText(/Retry/i).first()).toBeVisible();
        expect.soft(await page.locator('body').innerText()).toContain('—');
      }
      if (label === 'zero-empty') {
        await expect.soft(page.getByText('0%').first()).toBeVisible();
      }
      await ctx.close();
    }
  });
});

// ───────────────────────────── Mobile ─────────────────────────────
test.describe('mobile interactions', () => {
  test.beforeEach(({}, testInfo) => { test.skip(testInfo.project.name !== 'mobile', 'mobile only'); });

  test('[fixture] mobile drawer: opens, contains focus, Escape closes and restores focus', async ({ page, context }) => {
    await routeApi(context);
    await installSession(context);
    await page.goto('/dashboard', { waitUntil: 'load' });
    await page.waitForTimeout(700);
    const toggle = page.getByRole('button', { name: /open navigation/i });
    await expect(toggle).toBeVisible();
    await toggle.click();
    const dialog = page.getByRole('dialog', { name: /navigation/i });
    await expect(dialog).toBeVisible();
    await shot(page, 'mobile_drawer-open__fixture');
    const focusInside = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      return !!(d && d.contains(document.activeElement) && document.activeElement !== document.body);
    });
    expect.soft(focusInside, 'focus moves into the drawer').toBeTruthy();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    const restored = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') || '');
    expect.soft(restored, 'focus restored to the toggle').toMatch(/open navigation/i);
  });
});

// ───────────────────────── Applications drawer ─────────────────────────
test.describe('applications drawer', () => {
  test.beforeEach(({}, testInfo) => { test.skip(testInfo.project.name !== 'desktop', 'desktop only'); });

  test('[fixture] add drawer opens; a failed save shows an error', async ({ page, context }) => {
    await routeApi(context);
    await installSession(context);
    await page.goto('/applications', { waitUntil: 'load' });
    await page.waitForTimeout(800);
    const addBtn = page.getByRole('button', { name: /add application|add role|new application|add/i }).first();
    await expect(addBtn).toBeVisible();
    await addBtn.click();
    await page.waitForTimeout(400);
    await shot(page, 'applications_add-drawer__fixture');

    const dialog = page.getByRole('dialog', { name: /add application/i });
    const submit = dialog.getByRole('button', { name: /add application/i }).last();

    // Validation: company + role are required, so an empty submit is blocked
    // (native constraint validation) and the drawer stays open.
    await submit.click();
    await page.waitForTimeout(250);
    await expect(dialog, 'drawer stays open when required fields are empty').toBeVisible();

    // Now force the save to fail, fill the required fields, and submit.
    await context.unroute('**/api/applications');
    await context.route('**/api/applications', (r) =>
      r.request().method() === 'POST' ? r.fulfill(fail('Could not save application')) : r.fulfill(ok(MOCKS.applications)));
    await page.locator('#companyName').fill('Test Co');
    await page.locator('#role').fill('Backend Engineer');
    await submit.click();
    await page.waitForTimeout(700);
    await shot(page, 'applications_failed-save__fixture');
    // The failed-save error is shown INSIDE the drawer (not just behind it).
    await expect(dialog.getByText(/could not save|unable to save/i)).toBeVisible();
  });
});
