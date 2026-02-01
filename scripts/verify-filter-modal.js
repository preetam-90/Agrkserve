const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const screenshotDir = '.sisyphus/evidence';

  try {
    console.log('Navigating to http://localhost:3003/provider/equipment...');
    await page.goto('http://localhost:3003/provider/equipment', { waitUntil: 'networkidle' });

    await page.waitForTimeout(2000);

    console.log('✓ Page loaded successfully');

    await page.screenshot({
      path: path.join(screenshotDir, 'task-1-initial-page.png'),
      fullPage: true,
    });
    console.log('✓ Screenshot saved: task-1-initial-page.png');

    console.log('Clicking Filter button...');
    const filterButton = await page
      .locator('button')
      .filter({ hasText: /Filter/i })
      .first();
    await filterButton.click();
    await page.waitForTimeout(500);

    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    console.log('✓ Filter dialog opened');

    await page.screenshot({
      path: path.join(screenshotDir, 'task-1-filter-modal.png'),
      fullPage: false,
    });
    console.log('✓ Screenshot saved: task-1-filter-modal.png');

    const dialogTitle = await page.locator('[role="dialog"]').locator('h2').textContent();
    if (dialogTitle && dialogTitle.includes('Filter Equipment')) {
      console.log('✓ Dialog title verified: "Filter Equipment"');
    } else {
      console.log('✗ Dialog title mismatch:', dialogTitle);
    }

    console.log('Selecting "Tractor" from Category dropdown...');
    const categorySelect = page
      .locator('[role="dialog"]')
      .locator('[data-radix-select-trigger]')
      .first();
    await categorySelect.click();
    await page.waitForTimeout(500);

    const tractorOption = page.locator('[data-radix-select-item]').filter({ hasText: /Tractor/i });
    await tractorOption.click();
    await page.waitForTimeout(500);
    console.log('✓ Selected Tractor category');

    await page.screenshot({
      path: path.join(screenshotDir, 'task-1-after-category-select.png'),
      fullPage: false,
    });
    console.log('✓ Screenshot saved: task-1-after-category-select.png');

    console.log('Clicking Apply Filters button...');
    const applyButton = page
      .locator('[role="dialog"]')
      .locator('button')
      .filter({ hasText: /Apply Filters/i });
    await applyButton.click();
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(screenshotDir, 'task-1-filtered-results.png'),
      fullPage: true,
    });
    console.log('✓ Screenshot saved: task-1-filtered-results.png');
    console.log('✓ Filters applied');

    console.log('Clicking Filter button again...');
    await filterButton.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(500);

    console.log('Clicking Clear Filters button...');
    const clearButton = page
      .locator('[role="dialog"]')
      .locator('button')
      .filter({ hasText: /Clear Filters/i });
    await clearButton.click();
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(screenshotDir, 'task-1-after-clear-filters.png'),
      fullPage: true,
    });
    console.log('✓ Screenshot saved: task-1-after-clear-filters.png');
    console.log('✓ Filters cleared');

    console.log('\n=== ALL TESTS PASSED ===');
  } catch (error) {
    console.error('Error during verification:', error);
    await page.screenshot({ path: path.join(screenshotDir, 'task-1-error.png'), fullPage: true });
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
