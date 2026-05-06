import puppeteer from 'puppeteer';

/**
 * Injected into PDF HTML `<head>` so ₹ (U+20B9) renders in headless Chromium
 * (Helvetica/Arial often lack the glyph on Linux).
 */
export const PDF_WEB_FONT_LINKS = `
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
`.trim();

/** Chromium flags for Linux/Docker servers without a full desktop stack */
const LAUNCH_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
];

/**
 * Render HTML string to a PDF buffer (headless Chromium).
 *
 * - Locally: Puppeteer downloads its own Chromium on `npm install`.
 * - Linux/Docker: install Chromium (or compatible) and set `PUPPETEER_EXECUTABLE_PATH`.
 *   Debian/Ubuntu example packages: `chromium` or `chromium-browser`, `fonts-liberation`.
 * - PDF HTML may load Noto Sans from Google Fonts for ₹; host must allow outbound HTTPS or install Noto/DejaVu locally.
 */
export async function renderHtmlToPdf(html, pdfOptions = {}) {
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH?.trim() || undefined;

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: executablePath || undefined,
    args: LAUNCH_ARGS,
  });

  try {
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(90000);
    await page.setContent(html, { waitUntil: 'load', timeout: 90000 });
    await page.emulateMediaType('print');

    try {
      await Promise.race([
        page.evaluate(() => document.fonts?.ready ?? Promise.resolve()),
        new Promise((resolve) => setTimeout(resolve, 5000)),
      ]);
    } catch {
      /* ignore font loading failures */
    }

    const merged = {
      printBackground: true,
      ...pdfOptions,
    };

    const pdfUint8 = await page.pdf(merged);
    return Buffer.from(pdfUint8);
  } finally {
    await browser.close().catch(() => {});
  }
}

/** Standard Svayam invoice layout — A4 */
export function invoicePdfOptions() {
  return {
    format: 'A4',
    printBackground: true,
    margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
  };
}

/** Shipping labels — rely on HTML @page / CSS page size */
export function shippingLabelsPdfOptions() {
  return {
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  };
}
