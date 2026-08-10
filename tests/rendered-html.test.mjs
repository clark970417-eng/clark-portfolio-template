import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("portfolio source contains the finished public experience", async()=>{
  const [page,layout,css,pkg]=await Promise.all([
    readFile(new URL("../app/page.tsx",import.meta.url),"utf8"),
    readFile(new URL("../app/layout.tsx",import.meta.url),"utf8"),
    readFile(new URL("../app/globals.css",import.meta.url),"utf8"),
    readFile(new URL("../package.json",import.meta.url),"utf8"),
  ]);
  assert.match(layout,/Clark Lo — Photography/);
  assert.match(page,/getSiteSettings/);
  assert.match(page,/Selected work/);
  assert.match(page,/View story/);
  assert.match(page,/aboutBioEn/);
  assert.match(page,/objectPosition/);
  assert.match(css,/prefers-reduced-motion/);
  assert.doesNotMatch(page,/SkeletonPreview|codex-preview/);
  assert.doesNotMatch(pkg,/react-loading-skeleton/);
});

test("studio protects writes and strips image metadata client-side",async()=>{
  const [studio,auth,upload]=await Promise.all([
    readFile(new URL("../app/studio/studio.tsx",import.meta.url),"utf8"),
    readFile(new URL("../app/api/studio/auth.ts",import.meta.url),"utf8"),
    readFile(new URL("../app/api/studio/events/[id]/photos/route.ts",import.meta.url),"utf8"),
  ]);
  assert.match(studio,/canvas\.toBlob/);
  assert.match(studio,/image\/webp/);
  assert.match(studio,/Finding the best crop around the subject/);
  assert.match(studio,/coverPhotoId/);
  assert.match(studio,/Update portfolio/);
  assert.match(studio,/Remove from portfolio/);
  assert.match(studio,/Drag photo to reframe/);
  assert.match(studio,/Save crop/);
  assert.match(studio,/compact masonry edit/);
  assert.match(auth,/clark970417@gmail\.com/);
  assert.match(upload,/await isAdmin\(\)/);
});

test("studio can edit the public identity, biography, links, features, and profile photo",async()=>{
  const [editor,settingsApi,profileApi,settings]=await Promise.all([
    readFile(new URL("../app/studio/site-settings-editor.tsx",import.meta.url),"utf8"),
    readFile(new URL("../app/api/studio/settings/route.ts",import.meta.url),"utf8"),
    readFile(new URL("../app/api/studio/settings/profile-photo/route.ts",import.meta.url),"utf8"),
    readFile(new URL("../app/site-settings.ts",import.meta.url),"utf8"),
  ]);
  assert.match(editor,/English biography/);
  assert.match(editor,/Japanese biography/);
  assert.match(editor,/Selected features/);
  assert.match(editor,/Choose profile photo/);
  assert.match(settingsApi,/await isAdmin\(\)/);
  assert.match(profileApi,/await isAdmin\(\)/);
  assert.match(settings,/Pacific American School/);
  assert.match(settings,/profilePhotoUrl/);
});

test("homepage rotates published photographs every five seconds without immediate repeats",async()=>{
  const [slideshow,data]=await Promise.all([
    readFile(new URL("../app/hero-slideshow.tsx",import.meta.url),"utf8"),
    readFile(new URL("../app/portfolio-data.ts",import.meta.url),"utf8"),
  ]);
  assert.match(slideshow,/CHANGE_INTERVAL = 5000/);
  assert.match(slideshow,/1 \+ Math\.floor\(Math\.random\(\) \* \(photos\.length - 1\)\)/);
  assert.match(slideshow,/prefers-reduced-motion: reduce/);
  assert.match(slideshow,/onMouseEnter/);
  assert.match(data,/WHERE e\.status = 'published'/);
});
