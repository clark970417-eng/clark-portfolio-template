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
  assert.match(page,/I keep the moments/);
  assert.match(page,/School activities/);
  assert.match(page,/Outside-of-school activities/);
  assert.match(page,/student photographer/);
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
  assert.match(auth,/clark970417@gmail\.com/);
  assert.match(upload,/await isAdmin\(\)/);
});
