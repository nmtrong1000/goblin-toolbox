/*
 * `vercel dev` sets VERCEL=1 too, so VERCEL_ENV tells a real Vercel function (Linux, @sparticuz/chromium)
 * apart from local development, which uses the Chrome installed on the machine.
 * Chrome is launched over a pipe so it exits with the Node process even when that process is killed
 * hard; a WebSocket launch leaves a detached Chrome running after the dev server dies.
 */
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Browser } from 'puppeteer-core';
import type { PdfOptions } from '@goblin/tool-markdown-to-pdf-shared/options';
import {
  documentCss,
  footerTemplate,
  pageDimensions,
  pdfMargins,
} from '#/integrations/pdfPageSetup.ts';

let browser: Browser | undefined;
const assetsDir =
  [
    path.resolve(process.cwd(), 'assets'),
    path.resolve(process.cwd(), 'tools/markdown-to-pdf/api/assets'),
    path.resolve(process.cwd(), '../shared/assets'),
    path.resolve(process.cwd(), 'tools/markdown-to-pdf/shared/assets'),
  ].find((candidate) => existsSync(path.join(candidate, 'renderer.js'))) ??
  path.resolve(process.cwd(), 'assets');

export async function renderPdf(markdown: string, options: PdfOptions) {
  const page = await createRenderPage(markdown, options);
  try {
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      void page.close();
    }, 35_000);
    try {
      return await page.pdf({
        format: options.pageSize,
        landscape: options.orientation === 'landscape',
        printBackground: true,
        displayHeaderFooter: options.pageNumbers,
        headerTemplate: '<div style="width:100%;font-size:1px;line-height:1px">&nbsp;</div>',
        footerTemplate: footerTemplate(options),
        margin: pdfMargins(options),
      });
    } catch (error) {
      if (timedOut) throw new Error('RENDER_TIMEOUT');
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  } finally {
    if (browser?.connected) await page.close().catch(() => undefined);
  }
}

export async function renderPreviewScreenshot(markdown: string, options: PdfOptions) {
  const page = await createRenderPage(markdown, options);
  try {
    const dimensions = pageDimensions(options);
    await page.evaluate(({ width, height, padding }) => {
      const documentPage = document.querySelector<HTMLElement>('#document')!;
      documentPage.style.boxSizing = 'border-box';
      documentPage.style.width = `${width}px`;
      documentPage.style.minHeight = `${height}px`;
      documentPage.style.padding = padding;
      documentPage.style.background = '#ffffff';
    }, dimensions);
    return await page.screenshot({ type: 'png' });
  } finally {
    if (browser?.connected) await page.close().catch(() => undefined);
  }
}

async function createRenderPage(markdown: string, options: PdfOptions) {
  if (!browser?.connected) {
    const localChrome = localChromePath();
    const puppeteer = (await import('puppeteer-core')).default;
    const launchOptions = localChrome
      ? { args: ['--no-sandbox', '--disable-setuid-sandbox'], executablePath: localChrome }
      : await (async () => {
          const chromium = (await import('@sparticuz/chromium')).default;
          return { args: chromium.args, executablePath: await chromium.executablePath() };
        })();
    browser = await puppeteer.launch({
      ...launchOptions,
      headless: true,
      pipe: true,
    });
  }
  const page = await browser.newPage();
  try {
    const dimensions = pageDimensions(options);
    await page.setViewport({
      width: dimensions.width,
      height: dimensions.height,
      deviceScaleFactor: 1,
    });
    const renderer = await readFile(path.join(assetsDir, 'renderer.js'), 'utf8');
    const theme = await inlineFonts(await readFile(path.join(assetsDir, 'renderer.css'), 'utf8'));
    page.setDefaultTimeout(35_000);
    await page.setContent('<main id="document"></main>');
    await page.addScriptTag({ content: renderer });
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (['about:', 'data:'].includes(new URL(request.url()).protocol)) void request.continue();
      else void request.abort();
    });
    await page.evaluate((source) => {
      document.querySelector('#document')!.innerHTML = window.renderMarkdown(source);
      return window.renderDiagrams();
    }, markdown);
    await page.addStyleTag({ content: `${theme}\n${documentCss(options)}` });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        Array.from(document.images, (image) => image.decode().catch(() => undefined)),
      );
    });
    return page;
  } catch (error) {
    if (browser?.connected) await page.close().catch(() => undefined);
    throw error;
  }
}

function localChromePath() {
  if (
    process.env.CI === 'true' ||
    (process.env.VERCEL === '1' && process.env.VERCEL_ENV !== 'development')
  ) {
    return undefined;
  }
  if (process.env.LOCAL_CHROME_PATH && existsSync(process.env.LOCAL_CHROME_PATH)) {
    return process.env.LOCAL_CHROME_PATH;
  }
  const candidates =
    process.platform === 'darwin'
      ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
      : process.platform === 'win32'
        ? ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe']
        : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  return candidates.find((candidate) => existsSync(candidate));
}

async function inlineFonts(css: string) {
  const fontPattern = /url\(["']?\.\/fonts\/([^"')]+)["']?\)/g;
  const matches = [...css.matchAll(fontPattern)];
  let result = css;
  for (const match of matches.reverse()) {
    const name = match[1];
    const bytes = await readFile(path.join(assetsDir, 'fonts', name));
    const type = name.endsWith('.woff2')
      ? 'font/woff2'
      : name.endsWith('.woff')
        ? 'font/woff'
        : 'font/ttf';
    const replacement = `url(data:${type};base64,${bytes.toString('base64')})`;
    const start = match.index ?? 0;
    result = `${result.slice(0, start)}${replacement}${result.slice(start + match[0].length)}`;
  }
  return result;
}
