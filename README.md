# DukaanWhats

DukaanWhats is a Next.js store builder for Pakistani sellers. Customers browse a public store and send orders to the seller on WhatsApp.

- Production: https://dukaanwhats.pk
- Demo store: https://dukaanwhats.pk/s/premiumstore
- Stack: Next.js 15.5, React 18, TypeScript, Tailwind CSS, Supabase Auth/Postgres/Storage

## Local development

1. Create a Supabase project and enable the authentication providers you intend to offer (email/password and, optionally, Google).
2. Create the app's `profiles`, `products`, `plan_payments`, and `store_analytics` tables and the public `product-images` storage bucket. Ensure row-level security lets each authenticated user manage only their own profile/products/payments, and lets storefront visitors read the store/product data needed to render a public shop.
3. Copy `.env.local.example` to `.env.local` and fill in the Supabase project URL and anon key. Set the server-only service-role key for secure admin/user data and server-validated analytics, plus a comma-separated `ADMIN_EMAILS` allowlist. Never expose the service-role key with a `NEXT_PUBLIC_` prefix or commit it.
4. In Supabase Auth URL configuration, allow the production, preview, and local callback URLs (`/auth/callback`).
5. Run `npm ci`, then `npm run dev`.

## Admin panel

Open `/admin/payments` and sign in using a Supabase account whose email is in `ADMIN_EMAILS`. The server checks the signed-in user's identity and email allowlist before using the service-role key to read user records or review payments. The panel contains paginated registered-user data and payment review actions. The default allowlisted address retained for compatibility is `nexusdeals235@gmail.com`; set `ADMIN_EMAILS` explicitly in production.

## Plans and payments

- Basic: Rs. 0; up to 5 products and 1 image per product.
- Advanced: Rs. 899/month or Rs. 8,388/year; up to 25 products and 5 images per product.
- Premium: Rs. 2,999/month or Rs. 29,988/year; unlimited products and images.
- JazzCash Till ID: `984837533`.

Payment submissions are validated server-side; each transaction is still manually reviewed in the admin panel before the plan is activated.

## Production checklist

- Configure Supabase URL/anon key, service-role key, and admin allowlist in the deployment platform.
- Configure Supabase Auth redirect URLs and verify email/password, Google sign-in (if enabled), and password recovery against the production domain.
- Confirm database tables, indexes, RLS policies, storage bucket permissions, and public storefront behavior in the target Supabase project.
- Verify JazzCash Till ID and payment-review operations before accepting real payments.
- Run `npx tsc --noEmit` and `npm run build` before deployment.
