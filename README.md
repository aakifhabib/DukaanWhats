DukaanWhats.pk - https://github.com/aakifhabib/DukaanWhats
Supabase + Next.js WhatsApp Store Builder for Pakistani Instagram sellers.
Live: https://dukaanwhats.pk / https://dukaanwhats.vercel.app

One-page store in 60 seconds that sends orders to WhatsApp. No coding, no fees.

Stack
Next.js 14, React 18, TypeScript
Tailwind CSS
Supabase (Auth, Postgres, Storage)
Zustand
20 Store Themes (6 Basic + 5 Advanced + 9 Premium: Spike Pro, Shoe App Pro, Trenzo Luxury, Sleek Beige/Dark/Editorial, Saffron Table, Atelier Bloom, Mono Market)
Setup
Create Supabase project
Enable Email + Google Auth
Create tables: profiles, products, plan_payments, store_analytics
Create storage bucket: product-images (public)
Run SQL: alter table profiles add column if not exists premium_custom jsonb default '{}'::jsonb;
Copy .env.local.example to .env.local and fill:
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
npm install && npm run dev
Deploy to Vercel (import GitHub repo)
Plans
Basic: Rs.0 - 5 products, 1 image
Advanced: Rs.899/mo - 25 products, 5 images
Premium: Rs.2999/mo - Unlimited, all themes
Till ID: 984837533 (JazzCash)

