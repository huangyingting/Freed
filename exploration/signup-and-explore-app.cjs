const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const STATE_PATH = path.join(__dirname, 'auth-storage-state.json');

async function createTempEmail() {
  const domRes = await fetch('https://api.mail.tm/domains');
  const domData = await domRes.json();
  const domain = domData['hydra:member'][0].domain;
  const rand = Math.floor(100000 + Math.random() * 900000);
  const address = `dr.alex.rivera.${rand}@${domain}`;
  const password = `FreedPass!${rand}Aa`;

  const accRes = await fetch('https://api.mail.tm/accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, password })
  });
  if (!accRes.ok) {
    throw new Error(`Failed to create temp email: ${accRes.status} ${await accRes.text()}`);
  }
  const tokenRes = await fetch('https://api.mail.tm/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, password })
  });
  const tokenData = await tokenRes.json();
  return { address, password, token: tokenData.token };
}

async function pollEmails(token, maxWaitMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const res = await fetch('https://api.mail.tm/messages', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const msgs = data['hydra:member'] || [];
    if (msgs.length > 0) {
      const fullMsgs = [];
      for (const m of msgs) {
        const detailRes = await fetch(`https://api.mail.tm/messages/${m.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fullMsgs.push(await detailRes.json());
      }
      return fullMsgs;
    }
    await new Promise(r => setTimeout(r, 3000));
  }
  return [];
}

async function run() {
  const tempMail = await createTempEmail();
  console.log('Created temp email account:', tempMail.address);
  fs.writeFileSync(path.join(__dirname, 'temp-account.json'), JSON.stringify(tempMail, null, 2));

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream'
    ]
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      permissions: ['microphone'],
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    // 1. Test Login Error State & Forgot Password State first
    console.log('Testing Login Error States on https://secure.getfreed.ai/ ...');
    await page.goto('https://secure.getfreed.ai/', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3000);

    await page.fill('#email-input', 'invalid-email-format');
    await page.fill('#password-input', '123');
    await page.click('button:has-text("Sign in")');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '22-auth-login-error-state.png') });

    // Check Forgot password modal/screen
    const forgotBtn = await page.$('text=Forgot your password?');
    if (forgotBtn) {
      await forgotBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '23-auth-forgot-password.png') });
    }

    // 2. Navigate to Signup and test validation error state first
    console.log('Testing Signup Error State and then creating account...');
    await page.goto('https://secure.getfreed.ai/signup', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3000);

    // Click Create Account empty to capture validation state
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '24-auth-signup-validation-error.png') });

    // Now fill in valid temp email & password and check the agreement checkbox
    await page.fill('#email', tempMail.address);
    await page.fill('#password', tempMail.password);
    const checkbox = await page.$('input[type="checkbox"]');
    if (checkbox) {
      await checkbox.check();
    }
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '25-auth-signup-filled.png') });

    await page.click('button:has-text("Create Account")');
    console.log('Clicked Create Account, waiting for navigation/onboarding...');
    await page.waitForTimeout(7000);

    console.log('Post-signup URL:', page.url());
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '26-post-signup-screen-1.png'), fullPage: true });

    const postSignupDOM = await page.evaluate(() => ({
      url: location.href,
      title: document.title,
      bodyText: document.body.innerText,
      inputs: Array.from(document.querySelectorAll('input, select, textarea')).map(el => ({
        tag: el.tagName,
        type: el.getAttribute('type'),
        name: el.getAttribute('name'),
        id: el.id,
        placeholder: el.getAttribute('placeholder'),
        ariaLabel: el.getAttribute('aria-label')
      })),
      buttons: Array.from(document.querySelectorAll('button, [role="button"], a')).map(el => ({
        text: (el.innerText || '').trim().replace(/\s+/g, ' '),
        href: el.href || null
      })).filter(b => b.text)
    }));

    console.log('Post-signup DOM:', JSON.stringify(postSignupDOM, null, 2));

    // Check if any emails arrived in tempMail
    console.log('Checking temp email inbox...');
    const emails = await pollEmails(tempMail.token, 12000);
    console.log(`Received ${emails.length} emails:`, emails.map(e => ({ subject: e.subject, from: e.from, intro: e.intro })));
    fs.writeFileSync(path.join(__dirname, 'post-signup-state.json'), JSON.stringify({ postSignupDOM, emails }, null, 2));

    await context.storageState({ path: STATE_PATH });
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
