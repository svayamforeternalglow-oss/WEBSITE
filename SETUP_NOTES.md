Resend and UploadThing setup

- Resend:
  - Add `RESEND_API_KEY` to Svayam-Natural-Backend environment.
  - Optionally set `RESEND_FROM_EMAIL` used by email templates.

- UploadThing:
  - Add `UPLOADTHING_TOKEN` (base64 JSON `{ "apiKey": "sk_...", "appId": "app_...", "regions": ["in"] }`) to the NextJS environment used by the app.
  - The NextJS app route at `/api/uploadthing` proxies UploadThing; ensure `UPLOADTHING_TOKEN` is available to the NextJS runtime.

Testing tips:
- From the admin UI, open Add Product → Image URLs / uploads → click Upload images, verify uploaded images appear in preview and saved product persists URLs.
- Trigger an order confirmation or abandoned-cart email and check Resend dashboard for delivered events.
