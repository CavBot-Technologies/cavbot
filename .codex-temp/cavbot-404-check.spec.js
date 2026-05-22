const { test, expect } = require('@playwright/test');

test('404 game renders heads, eyes, and accepts clicks', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push('pageerror: ' + error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push('console: ' + message.text());
  });

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('http://127.0.0.1:8765/404.html', { waitUntil: 'networkidle' });

  const frame = page.frame({ url: /cavbot-imposter\/v1\/index\.html/ });
  expect(frame, 'game iframe').toBeTruthy();

  await frame.waitForSelector('.imposter-cell .cavbot-head', { timeout: 10000 });
  await frame.waitForTimeout(800);

  const before = await frame.evaluate(() => ({
    cells: document.querySelectorAll('.imposter-cell').length,
    heads: document.querySelectorAll('.imposter-cell .cavbot-head').length,
    pupils: document.querySelectorAll('.cavbot-eye-pupil').length,
    dmPupils: document.querySelectorAll('.cavbot-dm-avatar .cavbot-eye-pupil').length,
    arenaPupils: document.querySelectorAll('.imposter-arena .cavbot-eye-pupil').length,
    firstCellRect: (() => {
      const element = document.querySelector('.imposter-cell');
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return { x: rect.left, y: rect.top, w: rect.width, h: rect.height };
    })()
  }));

  const box = await frame.locator('.imposter-cell').first().boundingBox();
  expect(box, 'first clickable cell box').toBeTruthy();

  await frame.locator('.imposter-cell').first().click({
    position: { x: Math.min(8, box.width / 2), y: Math.min(8, box.height / 2) }
  });
  await frame.waitForTimeout(350);

  await page.mouse.move(900, 550);
  await frame.waitForTimeout(150);

  const after = await frame.evaluate(() => ({
    movedPupilVars: Array.from(document.querySelectorAll('.cavbot-eye-pupil'))
      .slice(0, 6)
      .map((element) => ({
        x: element.style.getPropertyValue('--cavbot-eye-x'),
        y: element.style.getPropertyValue('--cavbot-eye-y')
      }))
  }));

  await page.screenshot({ path: '/private/tmp/cavbot-404-runtime.png', fullPage: true });

  console.log(JSON.stringify({ errors, before, after }, null, 2));

  expect(errors).toEqual([]);
  expect(before.cells).toBeGreaterThanOrEqual(12);
  expect(before.heads).toBeGreaterThanOrEqual(12);
  expect(before.pupils).toBeGreaterThanOrEqual(20);
  expect(before.dmPupils).toBeGreaterThanOrEqual(2);
  expect(before.arenaPupils).toBeGreaterThanOrEqual(20);
  expect(before.firstCellRect.w).toBeGreaterThan(10);
  expect(after.movedPupilVars.some((value) => value.x || value.y)).toBeTruthy();
});
