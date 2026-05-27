import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

export default async function handler(req, res) {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('Thiếu tham số ?url=');

  let browser = null;
  try {
    const executablePath = await chromium.executablePath(
      'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar.br'
    );

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    
    // --- TỐI ƯU HÓA: CHẶN TẢI HÌNH ẢNH, CSS, FONT ĐỂ CHỐNG TIMEOUT ---
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      // Bỏ qua các file nặng, chỉ tập trung tải document, script (JS) và fetch/xhr
      const resourceType = req.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });
    // -----------------------------------------------------------------
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36');
    
    // Đổi 'networkidle2' thành 'domcontentloaded' và tăng timeout cho Chrome lên 20s
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });

    const html = await page.content();
    res.status(200).send(html);
  } catch (error) {
    res.status(500).send(`Lỗi: ${error.message}`);
  } finally {
    if (browser !== null) await browser.close();
  }
}
