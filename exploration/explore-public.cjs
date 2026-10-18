const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function explorePublic() {
  const browser = await chromium.launch({ headless: true });
  const report = {
    exploredAt: new Date().toISOString(),
    pages: [],
    navLinks: [],
    ctas: [],
    authUrls: [],
  };

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    console.log('Navigating to https://www.getfreed.ai/ ...');
    await page.goto('https://www.getfreed.ai/', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(4000);

    const homeTitle = await page.title();
    console.log('Home Title:', homeTitle);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-home-desktop.png'), fullPage: false });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-home-desktop-full.png'), fullPage: true });

    // Extract all links, headings, buttons
    const homeData = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a')).map(a => ({
        text: (a.innerText || '').trim().replace(/\s+/g, ' '),
        href: a.href,
      })).filter(l => l.href);

      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => ({
        tag: h.tagName,
        text: (h.innerText || '').trim().replace(/\s+/g, ' ')
      })).filter(h => h.text);

      const buttons = Array.from(document.querySelectorAll('button, [role="button"]')).map(b => ({
        text: (b.innerText || '').trim().replace(/\s+/g, ' '),
        ariaLabel: b.getAttribute('aria-label')
      })).filter(b => b.text || b.ariaLabel);

      return { links, headings, buttons, url: location.href };
    });

    report.pages.push({
      name: 'Home (Desktop)',
      url: homeData.url,
      title: homeTitle,
      viewport: '1440x900',
      screenshots: ['01-home-desktop.png', '01-home-desktop-full.png'],
      headings: homeData.headings,
      buttons: homeData.buttons.slice(0, 40),
    });

    const uniqueLinks = [];
    const seen = new Set();
    for (const l of homeData.links) {
      if (!seen.has(l.href)) {
        seen.add(l.href);
        uniqueLinks.push(l);
      }
    }
    report.navLinks = uniqueLinks;
    report.authUrls = uniqueLinks.filter(l =>
      /secure\.getfreed\.ai|app\.getfreed\.ai|login|sign|register|trial|start/i.test(l.href + ' ' + l.text)
    );

    console.log('Found unique links:', uniqueLinks.length);
    console.log('Auth/App URLs:', JSON.stringify(report.authUrls, null, 2));

    // Check responsive viewports on homepage
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-home-tablet.png'), fullPage: false });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-home-mobile.png'), fullPage: false });

    // Try opening mobile menu if present
    const mobileMenuBtn = await page.$('button[aria-label*="menu" i], .w-nav-button, [aria-label*="Menu"], header button');
    if (mobileMenuBtn) {
      try {
        await mobileMenuBtn.click({ timeout: 3000 });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03b-home-mobile-menu.png'), fullPage: false });
      } catch (e) {
        console.log('Mobile menu click skipped:', e.message);
      }
    }

    // Reset to desktop and explore key subpages
    await page.setViewportSize({ width: 1440, height: 900 });
    const candidateSubpages = uniqueLinks
      .map(l => l.href)
      .filter(href => href.startsWith('https://www.getfreed.ai/') && href !== 'https://www.getfreed.ai/' && !href.includes('#'))
      .slice(0, 12);

    console.log('Exploring candidate subpages:', candidateSubpages);

    let idx = 4;
    for (const subUrl of candidateSubpages) {
      try {
        console.log(`Visiting ${subUrl}...`);
        await page.goto(subUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(2500);
        const title = await page.title();
        const slug = new URL(subUrl).pathname.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'page';
        const shotName = `${String(idx).padStart(2, '0')}-${slug}-desktop.png`;
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, shotName), fullPage: false });

        const pageDetails = await page.evaluate(() => {
          const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
            tag: h.tagName,
            text: (h.innerText || '').trim().replace(/\s+/g, ' ')
          })).filter(h => h.text);
          const interactive = Array.from(document.querySelectorAll('button, input, select, [role="tab"], [role="switch"]')).map(el => ({
            tag: el.tagName,
            role: el.getAttribute('role'),
            text: (el.innerText || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ')
          })).filter(x => x.text);
          return { headings, interactive: interactive.slice(0, 30) };
        });

        report.pages.push({
          name: slug,
          url: subUrl,
          title,
          viewport: '1440x900',
          screenshots: [shotName],
          headings: pageDetails.headings,
          interactive: pageDetails.interactive
        });
        idx++;
      } catch (err) {
        console.log(`Error visiting ${subUrl}:`, err.message);
      }
    }

    // Also test a 404 page on www.getfreed.ai
    try {
      await page.goto('https://www.getfreed.ai/non-existent-route-404-test', { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '99-public-404.png'), fullPage: false });
      report.pages.push({
        name: '404 Error State',
        url: 'https://www.getfreed.ai/non-existent-route-404-test',
        title: await page.title(),
        viewport: '1440x900',
        screenshots: ['99-public-404.png']
      });
    } catch (e) {
      console.log('404 check error:', e.message);
    }

    fs.writeFileSync(path.join(__dirname, 'public-report.json'), JSON.stringify(report, null, 2));
    console.log('Saved public-report.json successfully.');
  } finally {
    await browser.close();
  }
}

explorePublic().catch(err => {
  console.error(err);
  process.exit(1);
});
