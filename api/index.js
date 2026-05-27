import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

export default async function handler(req, res) {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('Thiếu tham số ?url=');

  let browser = null;
  try {
    // Tải Chromium bản chuẩn từ server (Bypass lỗi thiếu thư viện của Vercel Node 20)
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
    
    // Giả lập trình duyệt chuẩn để chống block
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36');
    
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 8000 });

    const html = await page.content();
    res.status(200).send(html);
  } catch (error) {
    res.status(500).send(`Lỗi: ${error.message}`);
  } finally {
    if (browser !== null) await browser.close();
  }
}
