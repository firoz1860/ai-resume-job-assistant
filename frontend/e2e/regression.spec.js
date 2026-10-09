import { test, expect } from '@playwright/test';
import { routeApi, installSession, ok, fail } from './fixtures.js';

// Regression coverage for the connectivity-audit fixes. Fixture-backed:
// verifies UI robustness/behaviour, not real backend persistence.
test.describe('[fixture] audit regressions', () => {
  test.beforeEach(({}, testInfo) => { test.skip(testInfo.project.name !== 'desktop', 'desktop only'); });

  // Fix: CareerIntelligence defensive guards — a partial overview (missing
  // module objects) must render, not white-screen.
  test('Career Intelligence renders with a partial overview (no crash)', async ({ page, context }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await routeApi(context);
    await installSession(context);
    await context.route('**/api/intelligence/overview', (r) =>
      r.fulfill(ok({ reportCards: [{ label: 'Readiness', score: 70 }] }))); // everything else missing
    await page.goto('/career-intelligence', { waitUntil: 'load' });
    await page.waitForTimeout(900);
    expect(errors, 'no uncaught error on partial data').toEqual([]);
    await expect(page.getByText('Overview').first()).toBeVisible();
  });

  // Fix: VoiceInterviewDetail — a failed detail load shows an error, not an
  // infinite loader.
  test('Voice Interview Detail shows an error state on load failure', async ({ page, context }) => {
    await routeApi(context);
    await installSession(context);
    await context.route('**/api/voice-interview/abc123', (r) => r.fulfill(fail('Not found', 404)));
    await page.goto('/voice-interview/abc123', { waitUntil: 'load' });
    await page.waitForTimeout(900);
    await expect(page.getByText(/could not load this session/i)).toBeVisible();
    await expect(page.getByText(/loading interview details/i)).toHaveCount(0);
  });

  // Fix: InterviewRoom — a failed start surfaces an error instead of silently
  // doing nothing.
  test('Interview Room surfaces an error when start fails', async ({ page, context }) => {
    await routeApi(context);
    await installSession(context);
    await context.route('**/api/interview/start', (r) => r.fulfill(fail('AI service unavailable')));
    await page.goto('/interview-room', { waitUntil: 'load' });
    await page.waitForTimeout(700);
    const inputs = page.locator('form input[type="text"], form input:not([type])');
    const n = await inputs.count();
    for (let i = 0; i < n; i++) await inputs.nth(i).fill('Backend Engineer').catch(() => {});
    await page.getByRole('button', { name: /start/i }).first().click().catch(() => {});
    await page.waitForTimeout(700);
    await expect(page.getByText(/could not start|unavailable|error/i).first()).toBeVisible();
  });

  // Fix: Admin nav link is gated by role (backend still enforces 403).
  test('Admin link is hidden for non-admins and shown for admins', async ({ browser }) => {
    const c1 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await c1.addInitScript(() => {
      localStorage.setItem('careeros_token', 't');
      localStorage.setItem('careeros_user', JSON.stringify({ name: 'Reg User', email: 'u@example.com', role: 'user' }));
    });
    await routeApi(c1);
    await c1.route('**/api/auth/me', (r) => r.fulfill(ok({ user: { name: 'Reg User', email: 'u@example.com', role: 'user' } })));
    const p1 = await c1.newPage();
    await p1.goto('/dashboard', { waitUntil: 'load' });
    await p1.waitForTimeout(700);
    await expect(p1.getByRole('link', { name: /^Admin$/ })).toHaveCount(0);
    await c1.close();

    const c2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await installSession(c2);
    await routeApi(c2);
    const p2 = await c2.newPage();
    await p2.goto('/dashboard', { waitUntil: 'load' });
    await p2.waitForTimeout(700);
    await expect(p2.getByRole('link', { name: /^Admin$/ })).toHaveCount(1);
    await c2.close();
  });
});
