const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const STATE_PATH = path.join(__dirname, 'auth-storage-state.json');

async function exploreFullApp() {
  const tempMail = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp-account.json'), 'utf8'));
  const apiCaptured = [];

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream'
    ]
  });

  try {
    const context = await browser.newContext({
      storageState: fs.existsSync(STATE_PATH) ? STATE_PATH : undefined,
      viewport: { width: 1440, height: 900 },
      permissions: ['microphone', 'clipboard-read', 'clipboard-write'],
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    page.on('response', async res => {
      const u = res.url();
      if (u.includes('getfreed.ai/api') && !u.includes('csp-report') && !u.includes('analytics_batch_events')) {
        let body = '';
        try { body = await res.text(); } catch (e) {}
        apiCaptured.push({
          method: res.request().method(),
          url: u,
          status: res.status(),
          body: body.slice(0, 20000)
        });
        console.log(`[API ${res.status()}] ${res.request().method()} ${u}`);
      }
    });

    await page.goto('https://secure.getfreed.ai/onboarding-personalization', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(4000);

    // Step 1 if needed
    const specInput = await page.$('input[placeholder="Select your specialty"]');
    if (specInput) {
      await specInput.click();
      await page.waitForTimeout(500);
      const famOpt = await page.$('[role="option"]:has-text("Family Medicine"), li:has-text("Family Medicine")');
      if (famOpt) await famOpt.click();
      await page.fill('input[placeholder="First Name"]', 'Alex');
      await page.fill('input[placeholder="Last Name"]', 'Rivera');
      await page.fill('input[placeholder="MD, NP, etc."]', 'MD');
      await page.waitForTimeout(500);
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(2000);
    }

    // Step 2: Clinician count & EHR
    const clinCountInput = await page.$('input[placeholder="Select the number of clinicians"]');
    if (clinCountInput) {
      await clinCountInput.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '30a-onboarding-clinician-count-options.png') });
      const clinOptions = await page.evaluate(() =>
        Array.from(document.querySelectorAll('[role="option"], li')).map(el => (el.innerText || '').trim()).filter(Boolean)
      );
      console.log('Clinician count options:', clinOptions);
      const firstOpt = await page.$('[role="option"], ul[role="listbox"] li');
      if (firstOpt) await firstOpt.click();
      await page.waitForTimeout(500);
    }

    const ehrInput = await page.$('input[placeholder="Select your EHR"]');
    if (ehrInput) {
      await ehrInput.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '30b-onboarding-ehr-options.png') });
      const ehrOptions = await page.evaluate(() =>
        Array.from(document.querySelectorAll('[role="option"], li')).map(el => (el.innerText || '').trim()).filter(Boolean)
      );
      console.log('EHR options:', ehrOptions);
      const firstEhr = await page.$('[role="option"]:has-text("Athenahealth"), [role="option"]:has-text("Epic"), [role="option"], ul[role="listbox"] li');
      if (firstEhr) await firstEhr.click();
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '30c-onboarding-step2-filled.png'), fullPage: true });
    const getStartedBtn = await page.$('button:has-text("Get started")');
    if (getStartedBtn) {
      await getStartedBtn.click();
      console.log('Clicked Get started, waiting for main app...');
      await page.waitForTimeout(7000);
    }

    console.log('Main App URL:', page.url());
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '31-main-app-initial.png'), fullPage: true });

    const mainDOM = await page.evaluate(() => ({
      url: location.href,
      title: document.title,
      bodyText: document.body.innerText,
      links: Array.from(document.querySelectorAll('a')).map(a => ({
        text: (a.innerText || '').trim().replace(/\s+/g, ' '),
        href: a.href
      })),
      buttons: Array.from(document.querySelectorAll('button, [role="button"], [role="tab"], [role="menuitem"]')).map(b => ({
        text: (b.innerText || '').trim().replace(/\s+/g, ' '),
        ariaLabel: b.getAttribute('aria-label'),
        id: b.id,
        testId: b.getAttribute('data-testid')
      })).filter(b => b.text || b.ariaLabel || b.testId),
      inputs: Array.from(document.querySelectorAll('input, select, textarea, [contenteditable="true"]')).map(i => ({
        tag: i.tagName,
        type: i.getAttribute('type'),
        placeholder: i.getAttribute('placeholder'),
        id: i.id,
        ariaLabel: i.getAttribute('aria-label')
      }))
    }));

    console.log('Main App DOM:', JSON.stringify(mainDOM, null, 2));

    await context.storageState({ path: STATE_PATH });
    fs.writeFileSync(path.join(__dirname, 'main-app-dom.json'), JSON.stringify(mainDOM, null, 2));
    fs.writeFileSync(path.join(__dirname, 'captured-api-responses.json'), JSON.stringify(apiCaptured, null, 2));
  } finally {
    await browser.close();
  }
}

exploreFullApp().catch(err => {
  console.error(err);
  process.exit(1);
});
