# DukaanWhats

DukaanWhats is a Next.js store builder for Pakistani sellers. Customers browse a public store and send orders to the seller on WhatsApp.

- Production: https://dukaanwhats.pk
- Demo store: https://dukaanwhats.pk/s/premiumstore
- Stack: Next.js 15.5, React 18, TypeScript, Tailwind CSS, Supabase Auth/Postgres/Storage

## Local development

1. Create a Supabase project, enable the authentication providers you intend to offer (email/password and, optionally, Google), and turn on email confirmation for the Email provider. The app signs out any password signup that unexpectedly receives an active session, but Supabase must enforce confirmation before it issues sessions.
2. Create the app's `profiles`, `products`, `plan_payments`, and `store_analytics` tables and the public `product-images` storage bucket. Ensure row-level security lets each authenticated user manage only their own profile/products/payments, and lets storefront visitors read the store/product data needed to render a public shop.
3. Copy `.env.local.example` to `.env.local` and set the Supabase project URL plus `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY` for older projects). Set the server-only `SUPABASE_SERVICE_ROLE_KEY` for admin/user data and validated analytics, plus a comma-separated `ADMIN_EMAILS` allowlist. Never expose or commit the service-role key.
4. In Supabase Auth URL configuration, allow the production, preview, and local URLs used for auth redirects: `/auth/callback`, `/auth/complete`, and `/reset-password`. Email confirmations complete in the browser at `/auth/complete`; password recovery redirects directly to `/reset-password` so the browser client can process Supabase's recovery URL fragment.
5. Run `npm ci`, then `npm run dev`.

## Admin panel

The customer login page does not link to administrator access. Open `/admin/sign-in` directly and sign in using a Supabase account whose email is explicitly listed in `ADMIN_EMAILS`. The sign-in form has no customer sign-up or Google sign-in. Allowlisted administrators must enroll or verify a TOTP authenticator, and the server rejects admin API requests unless the verified Supabase JWT has AAL2. Each request also verifies the Supabase user and allowlist before using the server-only service-role key. The panel contains paginated registered-user data and payment review actions. There is no default administrator account: if `ADMIN_EMAILS` is unset, admin access fails closed. Keep the admin URL private, but do not treat an unlisted URL as a security boundary—the server-side checks are the protection.

## Plans and payments

- Basic: Rs. 0; up to 5 products and 1 image per product.
- Advanced: Rs. 899/month or Rs. 8,388/year; up to 25 products and 5 images per product.
- Premium: Rs. 2,999/month or Rs. 29,988/year; unlimited products and images.
- JazzCash Till ID: `984837533`.

Payment submissions are validated server-side; each transaction is still manually reviewed in the admin panel before the plan is activated. The review now updates the payment and profile plan in one database transaction through `review_plan_payment`. The legacy JazzCash/Alfalah direct-checkout endpoints are disabled because their old callbacks did not verify gateway signatures. Do not enable those routes until the provider's signed callback is verified server-side and the amount, plan, user, and transaction reference are matched to a server-created order.

## Order lifecycle

Seller order statuses progress through New → Confirmed → Preparing → Ready → Out for delivery → Completed, with cancellation available before completion. The database validates these transitions and restores tracked product stock on cancellation. Sellers can open a prefilled WhatsApp status update for a customer; sending remains an explicit seller action, not an automatic message.

## Production checklist

- Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or the legacy anon key), `SUPABASE_SERVICE_ROLE_KEY`, and `ADMIN_EMAILS` in the deployment platform.
- Back up the target database before applying `supabase/migrations/20261106_store_growth_features.sql` and then `supabase/migrations/20261107213502_order_and_payment_reliability.sql` in order. The newer migration does not touch Supabase Storage. Verify the order-status trigger, stock restoration, `review_plan_payment` RPC, grants, and RLS policies before enabling the new workflow.
- Enable Supabase Email confirmation and configure the production Auth redirect allowlist for `/auth/callback`, `/auth/complete`, and `/reset-password`; verify signup confirmation, email/password, Google sign-in (if enabled), and password recovery against the production domain.
- Configure and test automated backups / point-in-time recovery for the Supabase project. Confirm database tables, indexes, RLS policies, storage bucket permissions, and public storefront behavior.
- Confirm every allowlisted admin can enroll a TOTP factor and that the production admin API rejects AAL1 sessions and accepts only AAL2 after a valid code. Keep recovery codes and break-glass access under the project owner's control.
- Verify JazzCash Till ID and payment-review operations before accepting real payments.
- Run `npx tsc --noEmit`, `npm run build`, and authenticated checkout/order/status tests against a staging Supabase project before deployment.
