import { expect, test } from '@playwright/test';

test('a tool remote reuses the Host React instead of loading its own', async ({ page }) => {
  const remoteRequests: string[] = [];
  page.on('request', (request) => {
    const { pathname } = new URL(request.url());
    if (pathname.startsWith('/remotes/')) remoteRequests.push(pathname);
  });

  await page.goto('/tools/markdown-to-pdf');
  await expect(page.getByRole('button', { name: 'Create PDF' })).toBeVisible({ timeout: 15_000 });

  expect(remoteRequests.some((path) => path.endsWith('/remoteEntry.js'))).toBe(true);
  expect(
    remoteRequests.filter((path) => /react-dom|react\.production|react\.development/.test(path)),
  ).toEqual([]);
});

test('a broken remote shows an error and keeps the shell', async ({ page }) => {
  await page.route('**/remotes/markdown-to-pdf/remoteEntry.js', (route) => route.abort());

  await page.goto('/tools/markdown-to-pdf');

  await expect(page.getByRole('alert')).toContainText('This tool could not be loaded');
  await expect(page.getByRole('link', { name: 'Goblin Toolbox' }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Markdown to PDF' })).toBeVisible();
});
