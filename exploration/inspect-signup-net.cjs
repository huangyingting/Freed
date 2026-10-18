const { chromium } = require('playwright');

async function testSignupDomains() {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    page.on('response', async res => {
      if (res.url().includes('api') || res.url().includes('auth') || res.url().includes('signup') || res.url().includes('user') || res.status() >= 400) {
        let body = '';
        try { body = await res.text(); } catch (e) {}
        if (!res.url().endsWith('.js') && !res.url().endsWith('.css') && !res.url().endsWith('.png')) {
          console.log(`[RES ${res.status()}] ${res.request().method()} ${res.url()} -> ${body.slice(0, 300)}`);
        }
      }
    });

    await page.goto('https://secure.getfreed.ai/signup', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3000);

    // Check what mail services are reachable
    const services = [
      { name: 'mail.gw', url: 'https://api.mail.gw/domains' },
      { name: 'guerrillamail', url: 'https://api.guerrillamail.com/ajax.php?f=get_email_address' },
    ];
    for (const s of services) {
      try {
        const r = await fetch(s.url);
        console.log(`Service ${s.name}:`, r.status, (await r.text()).slice(0, 250));
      } catch (e) {
        console.log(`Service ${s.name} err:`, e.message);
      }
    }

    // Try filling and submitting to see exact network call
    await page.fill('#email', 'dr.alex.rivera.732444@maxxspace.com');
    await page.fill('#password', 'FreedPass!732444Aa');
    const cb = await page.$('input[type="checkbox"]');
    if (cb) await cb.check();
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(4000);
  } finally {
    await browser.close();
  }
}

testSignupDomains();
