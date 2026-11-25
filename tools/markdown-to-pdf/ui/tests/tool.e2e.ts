import { expect, test } from '@playwright/test';

test('editor, upload, reformat, preview, options, locale and error states work', async ({
  page,
}) => {
  await page.goto('/tools/markdown-to-pdf');
  await expect(page.getByRole('heading', { name: 'Markdown to PDF' })).toBeVisible();

  await page.setViewportSize({ width: 1280, height: 900 });
  const previewFitsPanel = await page.locator('.mdpdf-preview-wrap').evaluate((panel) => {
    const frame = panel.querySelector('.mdpdf-page-frame');
    if (!frame) return false;
    const panelStyle = getComputedStyle(panel);
    const availableRight =
      panel.getBoundingClientRect().right - Number.parseFloat(panelStyle.paddingRight);
    return frame.getBoundingClientRect().right <= availableRight + 1;
  });
  expect(previewFitsPanel).toBe(true);
  const panelsMatch = await page.locator('.mdpdf-workspace').evaluate((workspace) => {
    const editor = workspace.querySelector('.mdpdf-editor');
    const preview = workspace.querySelector('.mdpdf-preview-wrap');
    const editorTitle = editor?.querySelector('.mdpdf-panel-title');
    const previewTitle = preview?.querySelector('.mdpdf-panel-title');
    if (!editor || !preview || !editorTitle || !previewTitle) return false;
    const editorBounds = editor.getBoundingClientRect();
    const previewBounds = preview.getBoundingClientRect();
    return (
      Math.abs(editorBounds.height - previewBounds.height) <= 1 &&
      getComputedStyle(editorTitle).fontSize === getComputedStyle(previewTitle).fontSize &&
      getComputedStyle(editor).rowGap === getComputedStyle(preview).rowGap
    );
  });
  expect(panelsMatch).toBe(true);
  const controlHeights = await page
    .locator(
      '.mdpdf-toolbar .button-primary, .mdpdf-toolbar .button-secondary, .mdpdf-options select, .mdpdf-options input[type="color"], .mdpdf-options .mdpdf-checkbox',
    )
    .evaluateAll((controls) => controls.map((control) => control.getBoundingClientRect().height));
  expect(controlHeights.every((height) => Math.abs(height - 48) <= 0.5)).toBe(true);

  const editor = page.locator('.cm-content');
  await editor.fill('# Browser fixture\n\n**Bold text**');
  await expect(page.locator('.mdpdf-preview h1')).toHaveText('Browser fixture');
  await expect(page.locator('.mdpdf-preview strong')).toHaveText('Bold text');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Create PDF' }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('markdown-to-pdf.pdf');

  await page.getByRole('button', { name: 'Reformat' }).click();
  await expect(page.locator('.mdpdf-preview h1')).toHaveText('Browser fixture');

  await page.getByLabel('Upload .md').setInputFiles({
    name: 'uploaded.md',
    mimeType: 'text/markdown',
    buffer: Buffer.from('# Uploaded document'),
  });
  await expect(page.locator('.mdpdf-preview h1')).toHaveText('Uploaded document');

  await page.getByLabel('Page size').selectOption('A5');
  await expect(page.locator('.mdpdf-preview')).toHaveCSS('min-height', '794px');

  await page.getByRole('button', { name: 'VI', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Tạo PDF' })).toBeVisible();
  await page.route('**/api/tools/markdown-to-pdf', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ code: 'RENDER_FAILED', message: 'Internal error' }),
    }),
  );
  await page.getByRole('button', { name: 'Tạo PDF' }).click();
  await expect(page.getByRole('alert')).toContainText('Không thể tạo PDF.');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Xem trước' }).click();
  await expect(page.locator('.mdpdf-editor')).toBeHidden();
  await expect(page.locator('.mdpdf-preview-wrap')).toBeVisible();
  await page.getByRole('button', { name: 'Trình soạn thảo' }).click();
  await expect(page.locator('.mdpdf-editor')).toBeVisible();
  await expect(page.locator('.mdpdf-preview-wrap')).toBeHidden();
});
