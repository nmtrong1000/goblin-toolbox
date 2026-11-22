import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import type { PdfOptions } from '#/shared/options.js';

let browser: Awaited<ReturnType<typeof puppeteer.launch>> | undefined;
const packageRoot =
  [
    path.resolve(process.cwd(), 'tools/markdown-to-pdf'),
    path.resolve(process.cwd(), '../tools/markdown-to-pdf'),
  ].find((candidate) => existsSync(path.join(candidate, 'assets/renderer.js'))) ??
  path.resolve(process.cwd(), 'tools/markdown-to-pdf');

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
        footerTemplate: options.pageNumbers
          ? '<div style="font-size:8px;width:100%;text-align:center"><span class="pageNumber"></span> / <span class="totalPages"></span></div>'
          : '<span></span>',
        margin: {
          top: `${marginMm(options.margin)}mm`,
          bottom: `${marginMm(options.margin)}mm`,
          left: `${marginMm(options.margin)}mm`,
          right: `${marginMm(options.margin)}mm`,
        },
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
    await page.evaluate(({ width, height, margin }) => {
      const documentPage = document.querySelector<HTMLElement>('#document')!;
      documentPage.style.boxSizing = 'border-box';
      documentPage.style.width = `${width}px`;
      documentPage.style.minHeight = `${height}px`;
      documentPage.style.padding = `${margin}px`;
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
    browser = await puppeteer.launch({
      args: localChrome ? ['--no-sandbox', '--disable-setuid-sandbox'] : chromium.args,
      executablePath: localChrome ?? (await chromium.executablePath()),
      headless: true,
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
    const renderer = await readFile(path.join(packageRoot, 'assets/renderer.js'), 'utf8');
    const theme = await inlineFonts(
      await readFile(path.join(packageRoot, 'assets/renderer.css'), 'utf8'),
    );
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
    await page.addStyleTag({ content: `${theme}\n${cssFor(options)}` });
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

function pageDimensions(options: PdfOptions) {
  const sizes = {
    A4: [794, 1123],
    A5: [559, 794],
    Letter: [816, 1056],
    Legal: [816, 1344],
  } as const;
  const [portraitWidth, portraitHeight] = sizes[options.pageSize];
  return {
    width: options.orientation === 'landscape' ? portraitHeight : portraitWidth,
    height: options.orientation === 'landscape' ? portraitWidth : portraitHeight,
    margin: marginMm(options.margin) * (96 / 25.4),
  };
}

function localChromePath() {
  if (process.env.CI === 'true' || process.env.VERCEL === '1') return undefined;
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

function marginMm(margin: PdfOptions['margin']) {
  return margin === 'narrow' ? 10 : margin === 'wide' ? 25 : 20;
}

function cssFor(options: PdfOptions) {
  const family = options.font === 'noto-serif' ? 'Noto Serif, serif' : 'Noto Sans, sans-serif';
  const underline =
    options.headingStyle === 'underline'
      ? 'h1,h2{border-bottom:1px solid currentColor;padding-bottom:.25em}'
      : '';
  const theme = options.theme === 'classic' ? 'line-height:1.55' : 'line-height:1.7';
  return `body{display:flow-root;margin:0;font-family:${family};color:${options.colors.text};${theme};font-size:12pt}h1,h2,h3{color:${options.colors.heading}}a{color:${options.colors.link}}pre{white-space:pre-wrap;background:#f3f0eb;padding:12px}pre,code{font-family:'Noto Sans Mono',monospace}table{border-collapse:collapse;width:100%}td,th{border:1px solid #b8aa98;padding:6px}img{max-width:100%}${underline}`;
}

async function inlineFonts(css: string) {
  const fontPattern = /url\(["']?\.\/fonts\/([^"')]+)["']?\)/g;
  const matches = [...css.matchAll(fontPattern)];
  let result = css;
  for (const match of matches.reverse()) {
    const name = match[1];
    const bytes = await readFile(path.join(packageRoot, 'assets/fonts', name));
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
