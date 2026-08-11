# Clark Photography Portfolio Template

A reusable full-stack photography portfolio built with Next.js, React, vinext, and Cloudflare-compatible storage.

The public template intentionally contains no personal photographs. Add your own profile image, galleries, biography, links, and contact details from the built-in Studio.

## Features

- Responsive photography portfolio with Academy and Cosplay collections
- Editable English and Japanese biography
- Profile photo and event gallery uploads
- Automatic landscape-photo filtering for the homepage slideshow
- Cloudflare D1 metadata and R2 image storage
- Contact form with verified Google Account identity
- Email delivery through Resend
- Cloudflare Workers-compatible production build

## Quick start

Requirements: Node.js 22.13 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open the local URL shown in the terminal. Use `/studio` to edit the profile and upload photographs.

## Environment variables

```env
GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
RESEND_API_KEY=your-resend-api-key
CONTACT_FROM_EMAIL=Portfolio <hello@your-verified-domain.example>
```

`GOOGLE_CLIENT_ID` enables verified Google sign-in on the contact form. `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` enable email delivery.

## Validation

```bash
npm test
```

This builds the Cloudflare-compatible application and runs the template checks.

## Use this template

Click **Use this template** on GitHub, create your own repository, configure the environment variables, and replace the sample profile text in Studio. Photographs uploaded to your deployed copy remain in its own storage and are not part of this repository.
