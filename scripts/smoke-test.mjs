import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const baseURL = "http://localhost:3000";
const admin = { email: "admin@gdtfieldnotes.com", password: "admin123" };
const user = { email: "user@gdtfieldnotes.com", password: "user123" };

const imagePath = "/tmp/gdt-smoke.png";
if (!fs.existsSync(imagePath)) {
  const pngBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";
  fs.writeFileSync(imagePath, Buffer.from(pngBase64, "base64"));
}

async function login(page, credentials, expectedPath = /\/editor/) {
  await page.goto(`${baseURL}/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', credentials.email);
  await page.fill('input[name="password"]', credentials.password);
  await page.click('button:has-text("Login")');
  await page.waitForURL(expectedPath, { timeout: 10000 });
}

async function waitForUserNotifications(page) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await page.reload({ waitUntil: "networkidle" });
    const notificationCount = await page.locator('button:has-text("Notifications")').count();
    const actionRequiredCount = await page.locator('text=Action required').count();
    if (notificationCount > 0 || actionRequiredCount > 0) {
      return;
    }
    await page.waitForTimeout(1000);
  }

  throw new Error("User notification banner not visible after admin note.");
}

async function openStoriesTab(page, title, tab) {
  await page.goto(`${baseURL}/editor?view=stories&tab=${tab}`, { waitUntil: "networkidle" });
  await page.waitForSelector("#my-stories");
  return page.locator("div.rounded-2xl", {
    has: page.locator("h4", { hasText: title }),
  }).first();
}

async function openFieldNotesStory(page, title) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await page.goto(`${baseURL}/field-notes`, { waitUntil: "networkidle" });
    const storyTitle = page.locator("h3", { hasText: title }).first();
    if (await storyTitle.count()) {
      await storyTitle.click();
      await page.locator('a:has-text("Read full story")').click();
      return;
    }
    await page.waitForTimeout(1000);
  }
  throw new Error("Approved story not visible on Field Notes page.");
}

async function run() {
  const browser = await chromium.launch();

  const userContext = await browser.newContext();
  const userPage = await userContext.newPage();

  const userStoryTitle = `Smoke Test: Coastal Light ${Date.now().toString().slice(-4)}`;
  const adminStoryTitle = `Smoke Admin: Northern Ridge ${Date.now().toString().slice(-4)}`;

  await login(userPage, user, /\/editor/);
  await userPage.goto(`${baseURL}/editor`, { waitUntil: "networkidle" });
  await userPage.fill('input[name="title"]', userStoryTitle);
  await userPage.fill('input[name="excerpt"]', "An atmospheric coastal travel note.");
  await userPage.fill('input[name="metaTitle"]', "Coastal Light | GDT Field Notes");
  await userPage.fill(
    'input[name="metaDesc"]',
    "A coastal travel essay featuring mist, tides, and golden hour light."
  );
  await userPage.fill('input[name="tags"]', "Coast, Light, Smoke Test");
  await userPage.fill('input[name="categories"]', "Nature, Culture");

  const paragraph = userPage.locator('textarea[placeholder="Paragraph text"]').first();
  await paragraph.fill("A short paragraph for the smoke test.");
  await paragraph.click();
  await userPage.click('button:has-text("+ Media")');
  const mediaFileInputs = userPage.locator('input[type="file"][name="mediaFiles"]');
  await mediaFileInputs.last().setInputFiles(imagePath);
  const altInputs = userPage.locator('input[placeholder="Alt text for the media"]');
  await altInputs.last().fill("Golden light over the bay");

  await userPage.click('button:has-text("Submit for Review")');
  await userPage.waitForURL("**/editor?submitted=1", { timeout: 10000 });
  await userPage.goto(`${baseURL}/editor?view=stories&tab=unpublished`, { waitUntil: "networkidle" });
  await userPage.waitForSelector("#my-stories");

  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  await login(adminPage, admin, /\/admin/);

  await adminPage.goto(`${baseURL}/editor`, { waitUntil: "networkidle" });
  await adminPage.fill('input[name="title"]', adminStoryTitle);
  await adminPage.fill('input[name="excerpt"]', "An admin-authored ridge line dispatch.");
  await adminPage.fill('input[name="metaTitle"]', "Northern Ridge | GDT Field Notes");
  await adminPage.fill(
    'input[name="metaDesc"]',
    "An admin-authored story used to validate direct publish edits."
  );
  await adminPage.fill('input[name="tags"]', "Admin, Ridge, Smoke Test");
  await adminPage.fill('input[name="categories"]', "Nature, Mountains");
  const adminParagraph = adminPage.locator('textarea[placeholder="Paragraph text"]').first();
  await adminParagraph.fill("Admin story draft.");
  await adminParagraph.click();
  await adminPage.locator('select[name="status"]').selectOption("APPROVED");
  await adminPage.click('button:has-text("Submit for Review")');
  await adminPage.waitForURL("**/essay/**", { timeout: 10000 });
  await adminPage.click('a:has-text("Edit story")');
  await adminPage.waitForURL("**/editor/edit/**", { timeout: 10000 });
  await adminPage.locator('textarea[placeholder="Paragraph text"]').first().fill("Admin story updated.");
  await adminPage.click('button:has-text("Publish changes")');
  await adminPage.waitForURL("**/essay/**", { timeout: 10000 });

  await adminPage.goto(`${baseURL}/admin/moderation`, { waitUntil: "networkidle" });

  const targetCard = adminPage.locator("button.moderation-card", {
    has: adminPage.locator("h3", { hasText: userStoryTitle }),
  });
  await targetCard.click();
  const moderationModal = adminPage.locator(".modal-panel");
  await moderationModal.locator('select[name="status"]').selectOption("NEEDS_CHANGES");
  await moderationModal.locator('textarea[name="note"]').fill("Please expand the intro paragraph.");
  const moderationUpdate = moderationModal.locator('button:has-text("Update Status")');
  await moderationUpdate.evaluate((element) => element.click());
  await adminPage.waitForURL("**/admin/moderation", { timeout: 10000 });

  let feedbackCard = await openStoriesTab(userPage, userStoryTitle, "unpublished");
  if (await feedbackCard.count() === 0) {
    feedbackCard = await openStoriesTab(userPage, userStoryTitle, "review");
  }
  await feedbackCard.waitFor({ state: "visible" });
  const feedbackButton = feedbackCard.locator('button:has-text("View feedback")');
  if (await feedbackButton.count()) {
    await feedbackButton.click();
    await userPage.waitForSelector("text=Please expand the intro paragraph.");
    await userPage.click('button:has-text("Close")');
  }
  await feedbackCard.locator('a:has-text(\"Edit and resubmit\")').click();
  await userPage.waitForURL("**/editor/edit/**", { timeout: 10000 });
  await userPage.fill('textarea[placeholder="Paragraph text"]', "Updated intro with more detail.");
  await userPage.click('button:has-text("Resubmit for Review")');
  await userPage.waitForURL("**/editor?submitted=1", { timeout: 10000 });
  await userPage.goto(`${baseURL}/editor?view=stories&tab=review`, { waitUntil: "networkidle" });
  const versionCard = userPage.locator("div.rounded-2xl", {
    has: userPage.locator("h4", { hasText: userStoryTitle }),
  }).first();
  await versionCard.waitFor({ state: "visible" });
  await versionCard.locator("text=Version 2").waitFor();

  await adminPage.reload({ waitUntil: "networkidle" });
  const approvalCard = adminPage.locator("button.moderation-card", {
    has: adminPage.locator("h3", { hasText: userStoryTitle }),
  });
  await approvalCard.click();
  const approvalModal = adminPage.locator(".modal-panel");
  await approvalModal.locator('select[name="status"]').selectOption("APPROVED");
  const approvalUpdate = approvalModal.locator('button:has-text("Update Status")');
  await approvalUpdate.evaluate((element) => element.click());
  await adminPage.waitForURL("**/admin/moderation", { timeout: 10000 });

  await openFieldNotesStory(userPage, userStoryTitle);
  await userPage.waitForURL("**/essay/**", { timeout: 10000 });
  await userPage.waitForSelector("text=min read");

  await userPage.click('button[aria-label="Like"]');
  await userPage.click('button[aria-label="Comment"]');
  await userPage.fill('textarea[placeholder="Write your comment..."]', "Loved this short vignette.");
  await userPage.click('button:has-text("Post comment")');
  await userPage.waitForSelector("text=Loved this short vignette.");

  await adminPage.goto(`${baseURL}/admin/layout`, { waitUntil: "networkidle" });
  await adminPage.waitForSelector('button:has-text("Save Layout")');

  await browser.close();
  console.log("Smoke test completed successfully");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
