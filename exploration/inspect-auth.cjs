const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

async function inspectAuth() {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    console.log('Visiting https://secure.getfreed.ai/signup ...');
    await page.goto('https://secure.getfreed.ai/signup', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(4000);
    console.log('Signup URL:', page.url(), 'Title:', await page.title());
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '20-auth-signup-desktop.png'), fullPage: true });

    const signupDOM = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, select, textarea')).map(el => ({
        tag: el.tagName,
        type: el.getAttribute('type'),
        name: el.getAttribute('name'),
        id: el.id,
        placeholder: el.getAttribute('placeholder'),
        ariaLabel: el.getAttribute('aria-label'),
        required: el.required
      }));
      const buttons = Array.from(document.querySelectorAll('button, [role="button"], input[type="submit"]')).map(el => ({
        text: (el.innerText || el.value || '').trim().replace(/\s+/g, ' '),
        type: el.getAttribute('type'),
        id: el.id
      }));
      const bodyText = document.body.innerText;
      return { inputs, buttons, bodyText };
    });

    console.log('Signup DOM:', JSON.stringify(signupDOM, null, 2));

    console.log('Visiting https://secure.getfreed.ai/ ...');
    await page.goto('https://secure.getfreed.ai/', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(4000);
    console.log('Login URL:', page.url(), 'Title:', await page.title());
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '21-auth-login-desktop.png'), fullPage: true });

    const loginDOM = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, select, textarea')).map(el => ({
        tag: el.tagName,
        type: el.getAttribute('type'),
        name: el.getAttribute('name'),
        id: el.id,
        placeholder: el.getAttribute('placeholder'),
        ariaLabel: el.getAttribute('aria-label')
      }));
      const buttons = Array.from(document.querySelectorAll('button, [role="button"], a')).map(el => ({
        text: (el.innerText || '').trim().replace(/\s+/g, ' '),
        href: el.href || null
      }));
      return { inputs, buttons, bodyText: document.body.innerText };
    });
    console.log('Login DOM:', JSON.stringify(loginDOM, null, 2));

    fs.writeFileSync(path.join(__dirname, 'auth-dom.json'), JSON.stringify({ signupDOM, loginDOM }, null, 2));
  } finally {
    await browser.close();
  }
}

inspectAuth().catch(err => {
  console.error(err);
  process.exit(1);
});
