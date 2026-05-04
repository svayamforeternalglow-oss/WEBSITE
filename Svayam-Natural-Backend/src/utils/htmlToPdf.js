import puppeteer from 'puppeteer';

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
    margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
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
