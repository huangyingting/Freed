const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const STATE_PATH = path.join(__dirname, 'auth-storage-state.json');

async function exploreOnboardingAndMain() {
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
          body: body.slice(0, 15000)
        });
        console.log(`[API ${res.status()}] ${res.request().method()} ${u}`);
      }
    });

    console.log('Opening https://secure.getfreed.ai/onboarding-personalization ...');
    await page.goto('https://secure.getfreed.ai/onboarding-personalization', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(5000);

    // If redirected to login, sign in with tempMail
    if (page.url().includes('/login') || (await page.$('#email-input'))) {
      console.log('Signing in with temp account...');
      await page.fill('#email-input', tempMail.address);
      await page.fill('#password-input', tempMail.password);
      await page.click('button:has-text("Sign in")');
      await page.waitForTimeout(6000);
    }

    console.log('Current URL:', page.url());
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '27-onboarding-step1-empty.png'), fullPage: true });

    // Inspect specialty dropdown options by clicking specialty input
    const specInput = await page.$('input[placeholder="Select your specialty"]');
    if (specInput) {
      await specInput.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '28-onboarding-specialty-dropdown.png') });
      const options = await page.evaluate(() =>
        Array.from(document.querySelectorAll('[role="option"], li')).map(el => (el.innerText || '').trim()).filter(Boolean)
      );
      console.log('Specialty options:', options);

      // Select Family Medicine or first option
      const famOpt = await page.$('[role="option"]:has-text("Family Medicine"), li:has-text("Family Medicine")');
      if (famOpt) {
        await famOpt.click();
      } else {
        await specInput.fill('Family Medicine');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
      }
      await page.waitForTimeout(500);

      await page.fill('input[placeholder="First Name"]', 'Alex');
      await page.fill('input[placeholder="Last Name"]', 'Rivera');
      await page.fill('input[placeholder="MD, NP, etc."]', 'MD');
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '29-onboarding-step1-filled.png'), fullPage: true });

      const nextBtn = await page.$('button:has-text("Next")');
      if (nextBtn) {
        await nextBtn.click();
        await page.waitForTimeout(5000);
      }
    }

    // Loop through any subsequent onboarding steps or modals
    for (let step = 2; step <= 6; step++) {
      const url = page.url();
      const domInfo = await page.evaluate(() => ({
        url: location.href,
        bodyText: document.body.innerText,
        buttons: Array.from(document.querySelectorAll('button, [role="button"], a')).map(b => ({
          text: (b.innerText || '').trim().replace(/\s+/g, ' '),
          ariaLabel: b.getAttribute('aria-label'),
          href: b.href || null
        })).filter(b => b.text || b.ariaLabel),
        inputs: Array.from(document.querySelectorAll('input, select, textarea')).map(i => ({
          tag: i.tagName,
          type: i.getAttribute('type'),
          placeholder: i.getAttribute('placeholder'),
          id: i.id,
          name: i.getAttribute('name')
        }))
      }));

      console.log(`Step ${step} URL: ${url}`);
      console.log(`Step ${step} DOM:`, JSON.stringify(domInfo, null, 2));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `30-onboarding-step${step}.png`), fullPage: true });

      // Check if we are still in onboarding or have a modal/step button
      const continueBtn = await page.$(
        'button:has-text("Next"), button:has-text("Continue"), button:has-text("Skip"), button:has-text("Get Started"), button:has-text("Start"), button:has-text("Done")'
      );
      if (continueBtn && (url.includes('onboarding') || step < 4)) {
        const btnText = await continueBtn.innerText();
        console.log(`Clicking button "${btnText.trim()}" on step ${step}...`);
        // If there are radio/card choices on this onboarding screen, click the first card/option if Next is disabled
        const isDisabled = await continueBtn.isDisabled().catch(() => false);
        if (isDisabled) {
          const optionCard = await page.$('[role="radio"], [role="option"], input[type="radio"], label');
          if (optionCard) await optionCard.click().catch(() => {});
          await page.waitForTimeout(500);
        }
        await continueBtn.click().catch(e => console.log('Click err:', e.message));
        await page.waitForTimeout(4000);
      } else {
        break;
      }
    }

    await context.storageState({ path: STATE_PATH });
    fs.writeFileSync(path.join(__dirname, 'captured-api-responses.json'), JSON.stringify(apiCaptured, null, 2));
    console.log('Saved storage state and captured API responses.');
  } finally {
    await browser.close();
  }
}

exploreOnboardingAndMain().catch(err => {
  console.error(err);
  process.exit(1);
});
