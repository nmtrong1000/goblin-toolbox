import { type Page, expect, test } from '@playwright/test';

const toolPath = '/tools/markdown-to-pdf';
const pdfRoute = '**/api/tools/markdown-to-pdf';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('goblin.locale', 'en'));
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(toolPath);
  await expect(page.getByRole('heading', { name: 'Markdown to PDF' })).toBeVisible();
});

async function openSettings(page: Page) {
  await page.getByRole('button', { name: /^Settings/ }).click();
  return page.getByRole('complementary', { name: 'Document settings' });
}

async function dropFile(page: Page, name: string, text: string) {
  const transfer = await page.evaluateHandle(
    ([fileName, content]) => {
      const data = new DataTransfer();
      data.items.add(new File([content], fileName, { type: 'text/markdown' }));
      return data;
    },
    [name, text],
  );
  const editor = page.getByRole('region', { name: 'Markdown', exact: true });
  await editor.dispatchEvent('dragenter', { dataTransfer: transfer });
  await expect(page.getByText('Drop your .md file to open it')).toBeVisible();
  await editor.dispatchEvent('drop', { dataTransfer: transfer });
}

test('edit, preview, reformat, upload and create a PDF', async ({ page }) => {
  const overflow = () =>
    page.locator('.mdpdf-preview-well').evaluate((well) => {
      const frame = well.querySelector('.mdpdf-page-frame');
      if (!frame) return Infinity;
      const edge = frame.getBoundingClientRect().right - well.getBoundingClientRect().right;
      return Math.max(edge, frame.scrollWidth - frame.clientWidth);
    });
  await expect.poll(overflow).toBeLessThanOrEqual(0);

  await page.locator('.cm-content').fill('# Browser fixture\n\n**Bold text**');
  await expect(page.locator('.mdpdf-preview h1')).toHaveText('Browser fixture');
  await expect(page.locator('.mdpdf-preview strong')).toHaveText('Bold text');
  await expect(page.getByText('32 / 100,000')).toBeVisible();

  const createPdf = page.getByRole('button', { name: 'Create PDF' });
  const [download] = await Promise.all([page.waitForEvent('download'), createPdf.click()]);
  expect(download.suggestedFilename()).toBe('markdown-to-pdf.pdf');
  await expect(page.getByRole('button', { name: 'PDF ready' })).toBeVisible();
  await expect(createPdf).toBeVisible({ timeout: 5000 });

  await page.getByRole('button', { name: 'Reformat' }).click();
  await expect(page.locator('.mdpdf-preview h1')).toHaveText('Browser fixture');

  await page.getByLabel('Upload .md').setInputFiles({
    name: 'uploaded.md',
    mimeType: 'text/markdown',
    buffer: Buffer.from('# Uploaded document'),
  });
  await expect(page.locator('.mdpdf-preview h1')).toHaveText('Uploaded document');
});

test('presets, page settings and advanced settings reach the PDF request', async ({ page }) => {
  const drawer = await openSettings(page);
  await expect(drawer.getByRole('radio', { name: 'Goblin' })).toBeFocused();

  await page.keyboard.press('ArrowRight');
  await expect(drawer.getByRole('radio', { name: 'Classic' }).first()).toBeChecked();
  await expect(page.getByRole('button', { name: /^Settings/ })).toContainText('Classic');
  await expect(page.locator('.mdpdf-preview h1')).toHaveCSS('color', 'rgb(29, 27, 24)');

  await drawer.getByRole('radio', { name: 'A5' }).check({ force: true });
  await expect(page.locator('.mdpdf-preview')).toHaveCSS('min-height', '794px');
  await drawer.getByRole('radio', { name: 'Landscape' }).check({ force: true });
  await drawer.getByRole('radio', { name: 'Wide' }).check({ force: true });
  await drawer.getByRole('switch', { name: 'Show page numbers' }).uncheck({ force: true });
  await expect(page.getByText('A5 · Landscape')).toBeVisible();

  await drawer.getByRole('button', { name: /Advanced/ }).click();
  await drawer.getByRole('radio', { name: 'Sans' }).check({ force: true });
  await expect(page.getByRole('button', { name: /^Settings/ })).toContainText('Custom');
  const linkHex = drawer.getByLabel('Link color value');
  await linkHex.fill('');
  await linkHex.pressSequentially('#123456');
  await expect(linkHex).toBeFocused();
  await expect(linkHex).toHaveValue('#123456');

  let body: { options: Record<string, unknown> } | undefined;
  await page.route(pdfRoute, async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: 'application/pdf', body: '%PDF-1.4' });
  });
  await drawer.getByRole('radio', { name: 'Sans' }).focus();
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  await expect(page.getByRole('button', { name: /^Settings/ })).toBeFocused();
  await page.getByRole('button', { name: 'Create PDF' }).click();

  await expect
    .poll(() => body?.options)
    .toEqual({
      pageSize: 'A5',
      orientation: 'landscape',
      margin: 'wide',
      pageNumbers: false,
      font: 'noto-sans',
      theme: 'classic',
      colors: { text: '#222222', heading: '#1d1b18', link: '#123456' },
      headingStyle: 'underline',
    });
});

test('long lines wrap inside the editor instead of being cut off', async ({ page }) => {
  await page.locator('.cm-content').fill(`${'long words '.repeat(60)}${'x'.repeat(300)}`);

  const layout = await page.locator('.mdpdf-workspace').evaluate((workspace) => {
    const scroller = workspace.querySelector('.cm-scroller');
    const line = workspace.querySelector('.cm-line');
    const preview = workspace.querySelector('.mdpdf-preview-wrap');
    return {
      previewLeft: preview?.getBoundingClientRect().left ?? 0,
      scrollerRight: scroller?.getBoundingClientRect().right ?? Infinity,
      hidden: scroller ? scroller.scrollWidth - scroller.clientWidth : Infinity,
      lineHeight: line?.getBoundingClientRect().height ?? 0,
    };
  });

  expect(layout.scrollerRight).toBeLessThanOrEqual(layout.previewLeft);
  expect(layout.hidden).toBeLessThanOrEqual(1);
  expect(layout.lineHeight).toBeGreaterThan(100);
});

test('frontmatter, diagrams and long documents stay readable inside the paper', async ({
  page,
}) => {
  const paragraphs = Array.from({ length: 40 }, (_, index) => `Paragraph ${index + 1}.`);
  await page
    .locator('.cm-content')
    .fill(
      `---\nid: mkp\nstatus: complete\n---\n\n# Report\n\n\`\`\`mermaid\nflowchart TD\n  A-->B\n  B-->C\n  C-->D\n\`\`\`\n\n${paragraphs.join('\n\n')}\n\nLast line`,
    );
  const firstKey = page.locator('.mdpdf-preview .mdpdf-frontmatter th').first();
  await expect(firstKey).toHaveText('id');
  await expect(firstKey).toHaveCSS('color', 'rgb(120, 53, 31)');
  const drawer = await openSettings(page);
  await drawer.getByRole('radio', { name: 'Forest' }).check({ force: true });
  await expect(firstKey).toHaveCSS('color', 'rgb(47, 93, 52)');
  await page.keyboard.press('Escape');
  await expect(page.locator('.mdpdf-preview .mdpdf-mermaid svg')).toBeVisible();

  const frame = page.locator('.mdpdf-page-frame');
  const sizeGap = () =>
    frame.evaluate((paper) => {
      const article = paper.querySelector<HTMLElement>('.mdpdf-preview');
      const sizer = paper.querySelector('.mdpdf-page-sizer');
      if (!article || !sizer) return Infinity;
      const box = sizer.getBoundingClientRect();
      return Math.abs(box.height - article.scrollHeight * (box.width / article.offsetWidth));
    });
  await expect.poll(sizeGap).toBeLessThan(2);

  const lastVisible = await frame.evaluate((paper) => {
    paper.scrollTo(0, paper.scrollHeight);
    const last = [...paper.querySelectorAll('.mdpdf-preview p')].at(-1);
    return !!last && last.getBoundingClientRect().bottom <= paper.getBoundingClientRect().bottom;
  });
  expect(lastVisible).toBe(true);
});

test('zoom steps from fit to real size and back', async ({ page }) => {
  await page.getByRole('button', { name: 'Zoom in' }).click();
  await page.getByRole('button', { name: 'Zoom in' }).click();
  await expect(page.getByRole('button', { name: /^100%/ })).toBeVisible();
  await expect
    .poll(async () => (await page.locator('.mdpdf-page-sizer').boundingBox())?.width)
    .toBeGreaterThan(790);
  const paper = await page.locator('.mdpdf-preview-well').evaluate((well) => {
    const frame = well.querySelector('.mdpdf-page-frame');
    if (!frame) return undefined;
    return {
      inside: frame.getBoundingClientRect().right <= well.getBoundingClientRect().right,
      paperScrolls: frame.scrollWidth > frame.clientWidth,
      wellScrolls: well.scrollWidth > well.clientWidth,
    };
  });
  expect(paper).toEqual({ inside: true, paperScrolls: true, wellScrolls: false });

  await page.getByRole('button', { name: /Fit page to width/ }).click();
  await expect(page.getByRole('button', { name: 'Fit page to width' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('dropping a file opens Markdown and rejects other files', async ({ page }) => {
  await dropFile(page, 'dropped.md', '# Dropped document');
  await expect(page.locator('.mdpdf-preview h1')).toHaveText('Dropped document');

  await dropFile(page, 'notes.txt', 'plain text');
  await expect(page.getByRole('alert')).toContainText('That file cannot be opened.');
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(page.getByRole('alert')).toBeHidden();
});

test('errors show a translated toast and mobile uses a settings sheet', async ({ page }) => {
  await page.getByRole('button', { name: 'VI', exact: true }).click();
  await page.route(pdfRoute, (route) =>
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

  await page.getByRole('button', { name: /^Thiết lập/ }).click();
  const sheet = page.getByRole('complementary', { name: 'Thiết lập tài liệu' });
  await expect(sheet).toHaveCSS('position', 'fixed');
  await page.locator('.mdpdf-backdrop').click({ position: { x: 20, y: 20 } });
  await expect(sheet).toBeHidden();
});
