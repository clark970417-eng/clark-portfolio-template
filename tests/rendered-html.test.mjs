import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("portfolio source contains the finished public experience", async()=>{
  const [page,layout,css,publicCss,motion,pkg]=await Promise.all([
    readFile(new URL("../app/page.tsx",import.meta.url),"utf8"),
    readFile(new URL("../app/layout.tsx",import.meta.url),"utf8"),
    readFile(new URL("../app/globals.css",import.meta.url),"utf8"),
    readFile(new URL("../app/public.css",import.meta.url),"utf8"),
    readFile(new URL("../app/site-motion.tsx",import.meta.url),"utf8"),
    readFile(new URL("../package.json",import.meta.url),"utf8"),
  ]);
  assert.match(layout,/Clark Lo — Photography/);
  assert.match(page,/getSiteSettings/);
  assert.doesNotMatch(page,/className="hero-scroll"/);
  assert.match(page,/View photos/);
  assert.match(page,/aboutBioEn/);
  assert.match(page,/objectPosition/);
  assert.match(page,/<dt>Nickname<\/dt><dd>\{settings\.alias\}<\/dd>/);
  assert.match(page,/https:\/\/mail\.google\.com\/mail\/\?view=cm&fs=1&to=/);
  assert.match(page,/settings\.githubUrl/);
  assert.match(page,/>GH<\/a>/);
  assert.match(page,/>GitHub ↗<\/a>/);
  assert.equal((page.match(/Back to top ↑/g) ?? []).length,1);
  assert.doesNotMatch(page,/Back ↑/);
  assert.match(css,/prefers-reduced-motion/);
  assert.match(publicCss,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(publicCss,/--academy:#20293a/);
  assert.match(publicCss,/--cosplay:#30242d/);
  assert.doesNotMatch(publicCss,/event-card-2 \{ grid-column:5/);
  assert.doesNotMatch(publicCss,/\.scroll-progress/);
  assert.doesNotMatch(motion,/scroll-progress/);
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
  assert.match(editor,/GitHub URL/);
  assert.match(editor,/Choose profile photo/);
  assert.match(settingsApi,/await isAdmin\(\)/);
  assert.match(profileApi,/await isAdmin\(\)/);
  assert.match(settings,/Pacific American School/);
  assert.match(settings,/https:\/\/github\.com\/clark970417-eng/);
  assert.match(settings,/profilePhotoUrl/);
  assert.match(settings,/I keep the moments that usually pass\./);
});

test("About switches between English and Japanese and keeps features with the biography",async()=>{
  const editorial=await readFile(new URL("../app/about-editorial.tsx",import.meta.url),"utf8");
  assert.match(editorial,/useState<"en" \| "ja">\("en"\)/);
  assert.match(editorial,/aria-selected=\{language === "en"\}/);
  assert.match(editorial,/aria-selected=\{language === "ja"\}/);
  assert.match(editorial,/Selected Features &amp; Official Use/);
});

test("homepage rotates Academy photographs every three seconds without immediate repeats",async()=>{
  const [slideshow,data]=await Promise.all([
    readFile(new URL("../app/hero-slideshow.tsx",import.meta.url),"utf8"),
    readFile(new URL("../app/portfolio-data.ts",import.meta.url),"utf8"),
  ]);
  assert.match(slideshow,/CHANGE_INTERVAL = 3000/);
  assert.match(slideshow,/1 \+ Math\.floor\(Math\.random\(\) \* \(widePhotos\.length - 1\)\)/);
  assert.match(slideshow,/prefers-reduced-motion: reduce/);
  assert.match(slideshow,/onMouseEnter/);
  assert.match(slideshow,/hero-slide-backdrop/);
  assert.match(slideshow,/hero-slide-foreground/);
  assert.match(slideshow,/image\.naturalWidth \* 2 < image\.naturalHeight \* 3/);
  assert.match(slideshow,/\? "contain" : "cover"/);
  assert.match(slideshow,/new window\.Image\(\)/);
  assert.match(slideshow,/image\.naturalWidth \* 20 >= image\.naturalHeight \* 29/);
  assert.match(slideshow,/found\.length < 24/);
  assert.match(data,/SELECT p\.id, e\.title, e\.slug/);
  assert.doesNotMatch(slideshow,/Random frame/);
  assert.match(data,/WHERE e\.status = 'published' AND e\.category = 'school'/);
  assert.doesNotMatch(data,/p\.width \* 20 >= p\.height \* 29/);
  assert.doesNotMatch(slideshow,/hero-slide-timer/);
});

test("contact messages require a server-verified Google identity",async()=>{
  const [form,route,page,googleAuth]=await Promise.all([
    readFile(new URL("../app/contact-form.tsx",import.meta.url),"utf8"),
    readFile(new URL("../app/api/contact/route.ts",import.meta.url),"utf8"),
    readFile(new URL("../app/page.tsx",import.meta.url),"utf8"),
    readFile(new URL("../app/google-auth.ts",import.meta.url),"utf8"),
  ]);
  assert.match(form,/Sign in with Google/);
  assert.match(form,/name="name"/);
  assert.doesNotMatch(form,/name="email"/);
  assert.match(route,/verifyGoogleCredential\(credential\)/);
  assert.match(route,/subject:`Portfolio message from \$\{name\}`/);
  assert.match(route,/reply_to:user\.email/);
  assert.match(page,/process\.env\.GOOGLE_CLIENT_ID/);
  assert.match(googleAuth,/jwtVerify/);
  assert.match(googleAuth,/email_verified !== true/);
});
