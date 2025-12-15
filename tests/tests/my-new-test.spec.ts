import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('first@last.com');
  await page.getByRole('textbox', { name: 'Email address' }).press('Enter');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('QWEasdASDqwe');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('link', { name: 'Search' }).click();
  await page.getByRole('textbox', { name: 'Search Title' }).click();
  await page.getByRole('textbox', { name: 'Search Title' }).fill('one piece');
  await page.getByText('Failed to load more.').click();
  await page.getByRole('textbox', { name: 'Search Title' }).click();
  await page.getByLabel('Anime Type').selectOption('tv');
  await page.getByLabel('Anime Type').selectOption('all');
  await page.getByLabel('Anime Type').selectOption('movie');
  await page.getByLabel('Anime Type').selectOption('ova');
  await page.getByLabel('Anime Type').selectOption('special');
  await page.getByLabel('Anime Type').selectOption('ona');
  await page.getByLabel('Anime Type').selectOption('music');
  await page.getByLabel('Anime Type').selectOption('all');
  await page.getByLabel('Anime Type').selectOption('tv');
  await page.getByLabel('Status').selectOption('airing');
  await page.getByLabel('Status').selectOption('complete');
  await page.getByLabel('Status').selectOption('upcoming');
  await page.getByLabel('Status').selectOption('all');
  await page.getByLabel('Status').selectOption('airing');
  await page.getByLabel('Status').selectOption('all');
  await page.getByLabel('Order By').selectOption('end_date');
  await page.getByLabel('Anime Type').selectOption('all');
  await page.getByLabel('Order By').selectOption('episodes');
  await page.getByLabel('Order By').selectOption('default');
  await page.getByLabel('Order By').selectOption('title');
  await page.getByLabel('Sort Direction').selectOption('asc');
  await page.getByRole('button', { name: 'Reset' }).click();
  await page.getByRole('link', { name: 'AnimeReviewer' }).click();
  await page.getByRole('link', { name: 'Poster for Steins;Gate Steins' }).click();
  await page.getByRole('textbox', { name: 'Write your review here...' }).click();
  await page.getByRole('textbox', { name: 'Write your review here...' }).fill('Reviewing');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Submit Review' }).click();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: '⭐ Add to Favorite List' }).click();
  await page.getByRole('link', { name: 'Favorites' }).click();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Remove' }).click();
});