import { test, expect } from "@playwright/test";

test("pa Neon: gabimi është i qartë; paneli publik kërkon hyrje", async ({ page }) => {
  for (const path of ["/", "/udhetimi/2", "/udhetimi/3/kerkesa"]) {
    await page.goto(path);
    await expect(page.locator('main [role="alert"]')).toHaveText("Nuk u lidhëm me databazën. Provo përsëri.");
    await expect(page.locator(".trip-card")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.goto("/panel");
  await expect(page.getByRole("status")).toContainText("Hyrja me GitHub është përkohësisht e padisponueshme.");
  await expect(page.locator("form")).toHaveCount(0);
  await page.goto("/panel?m=ndaluar");
  await expect(page.getByRole("status").filter({ hasText: "Nuk ke leje" })).toBeVisible();
  await page.goto("/panel?m=toString");
  await expect(page.getByRole("status")).toHaveCount(1);
});
