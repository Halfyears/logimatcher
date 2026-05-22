# LogiMatcher — One-Click Deployment Guide
> Stop Searching. Start Matching.

## 🗂 Project Structure
```
logimatcher/
├── public/
│   ├── logo.svg          ← Light mode logo (nav on light bg)
│   ├── logo-dark.svg     ← Dark mode logo (nav on dark bg)
│   ├── icon.svg          ← Favicon / app icon (light)
│   └── icon-dark.svg     ← App icon (dark)
├── src/app/
│   ├── page.tsx          ← Frontend: Hero + Quiz + Results + Contact
│   ├── admin/page.tsx    ← Admin dashboard (7 modules)
│   ├── survey/[leadId]/  ← Post-match satisfaction survey
│   └── api/              ← All API routes
├── src/lib/
│   ├── supabase.ts       ← Database client
│   ├── email.ts          ← Resend email service
│   └── utils.ts          ← AI matching engine
└── supabase/migrations/001_schema.sql  ← Full DB schema + seed data
```

---

## ⚡ STEP 1 — Register Free Accounts (15 min total)

### A. Supabase (Database) — supabase.com
1. Sign up → Create New Project
2. Project name: `logimatcher` | Choose region closest to US
3. Wait ~1 min for setup
4. Go to **Settings → API** → copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (reveal it) → `SUPABASE_SERVICE_ROLE_KEY`

### B. Resend (Email) — resend.com
1. Sign up with GitHub → free 3,000 emails/month
2. **API Keys → Create API Key** → copy → `RESEND_API_KEY`
3. Optional: Add & verify your domain for custom sender email

### C. Anthropic (AI Chat) — console.anthropic.com
1. Sign up → **API Keys → Create Key** → copy → `ANTHROPIC_API_KEY`
2. Add $5 credit (sufficient for thousands of AI chats)

### D. Vercel (Hosting) — vercel.com
1. Sign up with GitHub (free)
2. No action needed yet — we'll deploy in Step 4

---

## 🛠 STEP 2 — Local Setup (5 min)

```bash
# 1. Unzip and enter project
unzip logimatcher.zip && cd fulfillmatch

# 2. Install dependencies
npm install

# 3. Create config file
npm run setup
# This creates .env.local from the template

# 4. Edit .env.local — fill in all 7 values:
nano .env.local
# or open in your editor: code .env.local
```

Your `.env.local` should look like:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@logimatcher.com
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
ADMIN_PASSWORD=your_strong_password_here
ADMIN_SECRET=any_random_32_character_string_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
# 5. Start local dev server
npm run dev

# Visit: http://localhost:3000        ← Frontend
# Visit: http://localhost:3000/admin  ← Admin (use ADMIN_PASSWORD)
```

---

## 🗄 STEP 3 — Initialize Database (3 min)

1. Open **supabase.com → your project → SQL Editor**
2. Click **New Query**
3. Open `supabase/migrations/001_schema.sql` in your editor
4. **Copy all contents** → paste into Supabase SQL Editor
5. Click **Run** → wait for "Success"

✅ This creates all tables + seeds 6 sample warehouses + default config

---

## 🚀 STEP 4 — Deploy to Vercel (5 min)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (first time — will open browser for login)
vercel

# Answer prompts:
# ✔ Set up and deploy? → Yes
# ✔ Which scope? → your account
# ✔ Link to existing project? → No
# ✔ Project name → logimatcher
# ✔ Directory → ./
# ✔ Override settings? → No
```

After first deploy, go to **Vercel Dashboard → logimatcher → Settings → Environment Variables**

Add each variable from your `.env.local` (change `NEXT_PUBLIC_APP_URL` to your Vercel URL):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | your supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | your service role key |
| `RESEND_API_KEY` | your resend key |
| `RESEND_FROM_EMAIL` | noreply@logimatcher.com |
| `ANTHROPIC_API_KEY` | your anthropic key |
| `ADMIN_PASSWORD` | your admin password |
| `ADMIN_SECRET` | your 32-char secret |
| `NEXT_PUBLIC_APP_URL` | https://logimatcher.vercel.app |

Then click **Redeploy → Deploy** (without cache).

---

## 🌐 STEP 5 — Connect Domain logimatcher.com (10 min)

1. Buy `logimatcher.com` at Namecheap / GoDaddy / Cloudflare (~$10/yr)
2. In **Vercel → logimatcher → Settings → Domains**
3. Add `logimatcher.com` and `www.logimatcher.com`
4. Vercel shows you DNS records — add them to your domain registrar:
   - A record: `@` → `76.76.21.21`
   - CNAME: `www` → `cname.vercel-dns.com`
5. Wait 5-30 min for DNS propagation
6. Update `NEXT_PUBLIC_APP_URL` to `https://logimatcher.com` → Redeploy

---

## ✅ STEP 6 — Verify Everything Works

| URL | What to check |
|-----|---------------|
| `logimatcher.com` | Hero page loads, quiz works |
| `logimatcher.com/admin` | Login with ADMIN_PASSWORD |
| Submit a test lead | Check it appears in admin |
| Approve a lead | Confirm email sends (check Resend dashboard) |
| `logimatcher.com/survey/[leadId]` | Survey page renders |

---

## 🔧 Admin Panel Features

Login at `/admin` with your `ADMIN_PASSWORD`:

| Module | What you can do |
|--------|----------------|
| **Dashboard** | See all leads, revenue, system status |
| **Lead Management** | Review, approve/reject, reassign, send emails |
| **Warehouses** | Add/edit warehouses, set pricing, ad boosts |
| **Quiz Editor** | Add/remove/reorder quiz questions & options |
| **Email & Surveys** | Edit all email templates, configure survey questions |
| **Billing & Ads** | Set lead fees by plan, ad boost pricing |
| **Survey Results** | View shipper satisfaction data |

---

## 💰 Revenue Model (Once Live)

| Revenue Stream | How |
|----------------|-----|
| Lead fee per match | Charged to warehouse on approval ($100–$300) |
| Ad boost subscription | Warehouses pay monthly for ranking boost ($99–$399/mo) |
| Premium plan | Higher-tier warehouses pay more per lead |

Set all pricing in Admin → Billing & Ads.

---

## 🆘 Troubleshooting

**Quiz shows no questions?**
→ Run the SQL migration in Supabase (Step 3)

**Emails not sending?**
→ Check `RESEND_API_KEY` in Vercel env vars, confirm domain verified in Resend

**AI chat not working?**
→ Check `ANTHROPIC_API_KEY`, confirm account has credit balance

**Admin login fails?**
→ Check `ADMIN_PASSWORD` and `ADMIN_SECRET` match in env vars

**Build fails on Vercel?**
→ Check all 8 environment variables are set, redeploy without cache

---

## 📞 Tech Stack Summary

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend + Backend | Next.js 14 on Vercel | Free |
| Database | Supabase PostgreSQL | Free (500MB) |
| Email | Resend | Free (3k/mo) |
| AI Chat | Anthropic Claude | ~$0.001/chat |
| Domain | logimatcher.com | ~$10/year |
| **Total fixed cost** | | **~$10/year** |
