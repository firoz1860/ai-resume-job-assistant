import { test } from '@playwright/test';
import { PAGES, routeApi, installSession, ok, fail } from './fixtures.js';
import path from 'node:path';
import fs from 'node:fs';

// Writes the README gallery screenshots into docs/screenshots/<group>/ (compact
// viewport thumbnails) and docs/screenshots/full/ (full-page, linked). Reveal
// sections are triggered first so nothing captures blank.
const DOCS = path.resolve(process.cwd(), '../docs/screenshots');

const GROUP = {
  home: 'public', login: 'public', signup: 'public', about: 'public', notfound: 'public',
  dashboard: 'workspace', 'career-intelligence': 'workspace', 'career-dna': 'workspace',
  'career-vault': 'workspace', profile: 'workspace', roadmap: 'workspace', admin: 'workspace',
  applications: 'applications', 'job-analyzer': 'applications', matcher: 'applications',
  'resume-builder': 'resume', generator: 'resume', 'content-library': 'resume',
  'interview-room': 'interviews', 'voice-interview': 'interviews',
  'interview-history': 'interviews', 'voice-interview-history': 'interviews',
};

async function triggerReveals(page) {
  await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve())).catch(() => {});
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 350) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(45);
  }
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
}

async function capture(browser, vp, { name, path: route, auth }, extra) {
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    deviceScaleFactor: 1,
    isMobile: vp.name === 'mobile',
    hasTouch: vp.name === 'mobile',
  });
  await routeApi(ctx);
  if (auth) await installSession(ctx);
  const page = await ctx.newPage();
  await page.goto(route, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  await triggerReveals(page);
  if (extra) await extra(page);

  const group = GROUP[name] || 'misc';
  fs.mkdirSync(path.join(DOCS, group), { recursive: true });
  fs.mkdirSync(path.join(DOCS, 'full'), { recursive: true });
  await page.screenshot({ path: path.join(DOCS, group, `${name}-${vp.name}.jpg`), type: 'jpeg', quality: 72 });
  await page.screenshot({ path: path.join(DOCS, 'full', `${name}-${vp.name}.jpg`), type: 'jpeg', quality: 72, fullPage: true });
  await ctx.close();
}

const VPS = [{ name: 'desktop', w: 1440, h: 900 }, { name: 'mobile', w: 390, h: 844 }];

async function shotState(browser, name, route, routeOverride, extra) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await routeApi(ctx);
  await installSession(ctx);
  if (routeOverride) await ctx.route('**/api/dashboard/stats', routeOverride);
  const page = await ctx.newPage();
  await page.goto(route, { waitUntil: 'load' });
  await page.waitForTimeout(900);
  if (extra) await extra(page);
  const group = GROUP[route.replace('/', '')] || 'workspace';
  fs.mkdirSync(path.join(DOCS, group), { recursive: true });
  fs.mkdirSync(path.join(DOCS, 'full'), { recursive: true });
  await page.screenshot({ path: path.join(DOCS, group, `${name}-desktop.jpg`), type: 'jpeg', quality: 72 });
  await page.screenshot({ path: path.join(DOCS, 'full', `${name}-desktop.jpg`), type: 'jpeg', quality: 72, fullPage: true });
  await ctx.close();
}

test.describe('gallery capture', () => {
  test.beforeEach(({}, testInfo) => { test.skip(testInfo.project.name !== 'desktop', 'run once'); });

  for (const vp of VPS) {
    for (const p of PAGES) {
      test(`${vp.name} ${p.name}`, async ({ browser }) => {
        await capture(browser, vp, p);
      });
    }
  }

  test('desktop applications-add-drawer (fixture)', async ({ browser }) => {
    await shotState(browser, 'applications-add-drawer', '/applications', null, async (page) => {
      await page.getByRole('button', { name: /add application/i }).first().click();
      await page.waitForTimeout(500);
    });
  });
  test('desktop applications-detail-drawer (fixture)', async ({ browser }) => {
    await shotState(browser, 'applications-detail-drawer', '/applications', null, async (page) => {
      await page.getByText(/view intelligence/i).first().click().catch(() => {});
      await page.waitForTimeout(500);
    });
  });
  test('desktop dashboard-empty (fixture)', async ({ browser }) => {
    await shotState(browser, 'dashboard-empty', '/dashboard',
      (r) => r.fulfill(ok({ stats: [], progress: [], nextActions: [], followUpsDue: [], recentActivities: [] })));
  });
  test('desktop dashboard-error (fixture)', async ({ browser }) => {
    await shotState(browser, 'dashboard-error', '/dashboard', (r) => r.fulfill(fail('Server error')));
  });
});
