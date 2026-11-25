import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('goblin.locale', 'en'));
});

test('home lists tools as cards with their manifest icon', async ({ page }) => {
  await page.goto('/');

  const card = page.getByRole('link', { name: /Markdown to PDF/ });
  await expect(card).toBeVisible();
  await expect(card.getByText('Document Tools')).toBeVisible();
  await expect(card.locator('.tool-icon-glyph')).toHaveCSS(
    'mask-image',
    /\/remotes\/markdown-to-pdf\/icon\.svg/,
  );
  await expect(page.getByText('More tools on the way')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Home' }).first()).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(page.getByText(`© ${new Date().getFullYear()} Goblin Toolbox`)).toBeVisible();
});

test('search types hints while empty, filters, and clears', async ({ page }) => {
  await page.goto('/');

  const hint = page.locator('.typing-placeholder');
  await expect(hint).toHaveText(/^(markdown|pdf|markdown to pdf)$/, { timeout: 5000 });
  const first = await hint.textContent();
  await expect(hint).not.toHaveText(first ?? '', { timeout: 5000 });

  const search = page.getByLabel('Search tools');
  await search.fill('zzz');
  await expect(hint).toBeHidden();
  await expect(page.getByRole('heading', { name: 'No tools match that search.' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Markdown to PDF/ })).toBeHidden();

  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('');
  await expect(hint).toBeVisible();
  await expect(page.getByRole('link', { name: /Markdown to PDF/ })).toBeVisible();
});

test('the hint types two rounds, then rests on the last word without a caret', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  const hint = page.locator('.typing-placeholder');

  await page.clock.runFor(1500);
  await expect(hint.locator('.typing-caret')).toBeVisible();

  await page.clock.runFor(30_000);
  await expect(hint).toHaveText('markdown to pdf');
  await expect(hint.locator('.typing-caret')).toHaveCount(0);
});

test('focusing the search stops the hint at once', async ({ page }) => {
  await page.goto('/');
  const hint = page.locator('.typing-placeholder');
  await expect(hint.locator('.typing-caret')).toBeVisible();

  await page.getByLabel('Search tools').focus();

  await expect(hint).toHaveText('markdown to pdf');
  await expect(hint.locator('.typing-caret')).toHaveCount(0);
});

test('reduced motion keeps the typing hint and the spinning stamp', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  await expect(page.locator('.typing-placeholder .typing-caret')).toBeVisible();
  const stamp = page.locator('.hero-stamp-ring');
  await expect(stamp).toHaveCSS('animation-name', 'stamp-spin');
  await expect(stamp).toHaveCSS('animation-iteration-count', '10');
});

test('dark halftone dots follow the mouse inside the hero', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1100 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const area = page.locator('.hero-halftone');
  const spot = (name: string) =>
    area.evaluate((element, prop) => element.style.getPropertyValue(prop), `--spot-${name}`);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const box = await area.boundingBox();
  if (!box) throw new Error('Hero halftone is not rendered');

  await page.mouse.move(box.x + 300, box.y + 200);
  await expect.poll(() => spot('opacity')).toBe('1');
  await expect.poll(async () => parseFloat(await spot('x'))).toBeCloseTo(300, 0);

  await page.mouse.move(box.x + 900, box.y + 200, { steps: 10 });
  await expect.poll(async () => parseFloat(await spot('x'))).toBeCloseTo(900, 0);

  await page.mouse.move(box.x + 300, box.y + box.height + 100);
  await expect.poll(() => spot('opacity')).toBe('0');
});

test('language toggle switches the shell to Vietnamese', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'VI', exact: true }).click();

  await expect(page.getByRole('button', { name: 'VI', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(
    page.getByRole('heading', { name: 'Tìm công cụ phù hợp cho công việc.' }),
  ).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
});

test('vaults list and a vault page lead to the tool', async ({ page }) => {
  await page.goto('/vaults');
  await page.getByRole('link', { name: /Document Tools/ }).click();

  await expect(page).toHaveURL(/\/vaults\/document-tools$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Document Tools' })).toBeVisible();
  await page.getByRole('link', { name: /Markdown to PDF/ }).click();

  await expect(page).toHaveURL(/\/tools\/markdown-to-pdf$/);
  const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
  await expect(breadcrumb.getByRole('link', { name: 'Document Tools' })).toBeVisible();
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText('Markdown to PDF');
});

test('a missing tool icon falls back to the default icon', async ({ page }) => {
  await page.route('**/remotes/markdown-to-pdf/icon.svg', (route) => route.abort());
  await page.goto('/');

  const card = page.getByRole('link', { name: /Markdown to PDF/ });
  await expect(card.locator('.tool-icon svg')).toBeVisible();
  await expect(card.locator('.tool-icon-glyph')).toHaveCount(0);
});

test('an unknown page shows the not found state with a way home', async ({ page }) => {
  await page.goto('/nowhere');

  await expect(page.getByRole('heading', { name: "We couldn't find that page." })).toBeVisible();
  await page.getByRole('link', { name: 'Back to home' }).click();
  await expect(page).toHaveURL(/\/$/);
});
