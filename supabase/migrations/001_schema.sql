-- ============================================================
-- LogiMatcher Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── QUESTIONS TABLE ────────────────────────────────────────
create table if not exists questions (
  id uuid primary key default uuid_generate_v4(),
  sort_order integer not null default 0,
  question_id text unique not null,
  question text not null,
  subtitle text,
  type text not null check (type in ('single','multi')),
  options jsonb not null default '[]',
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── WAREHOUSES TABLE ───────────────────────────────────────
create table if not exists warehouses (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  location text not null,
  region text not null,
  logo text not null default 'WH',
  rating numeric(3,1) default 4.5,
  reviews integer default 0,
  min_volume integer default 100,
  max_volume integer default 50000,
  specialties text[] default '{}',
  services text[] default '{}',
  integrations text[] default '{}',
  pricing jsonb default '{"setup":0,"storage":0.45,"perOrder":3.00}',
  lead_time text default 'Next Day',
  accuracy numeric(5,2) default 99.0,
  sqft integer default 100000,
  status text default 'pending' check (status in ('active','pending','suspended')),
  contact_email text,
  contact_phone text,
  plan text default 'standard' check (plan in ('standard','premium','enterprise')),
  ad_boost integer default 0,
  lead_fee integer default 120,
  description text,
  badge text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── LEADS TABLE ────────────────────────────────────────────
create table if not exists leads (
  id text primary key default 'L' || to_char(now(),'YYYYMMDD') || lpad(floor(random()*9999)::text,4,'0'),
  shipper_name text not null,
  shipper_email text not null,
  shipper_phone text,
  shipper_company text not null,
  answers jsonb not null default '{}',
  top_match_id uuid references warehouses(id),
  match_score integer default 0,
  all_scores jsonb default '[]',
  status text default 'pending_review' check (status in ('pending_review','approved','rejected')),
  admin_note text default '',
  warehouse_sent boolean default false,
  warehouse_sent_at timestamptz,
  shipper_email_sent boolean default false,
  survey_sent boolean default false,
  survey_sent_at timestamptz,
  survey_completed boolean default false,
  survey_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── CONFIG TABLE ───────────────────────────────────────────
create table if not exists config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- ─── SURVEY RESPONSES TABLE ─────────────────────────────────
create table if not exists survey_responses (
  id uuid primary key default uuid_generate_v4(),
  lead_id text references leads(id),
  token text unique,
  responses jsonb default '{}',
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- ─── UPDATED_AT TRIGGER ─────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger questions_updated_at before update on questions for each row execute function update_updated_at();
create trigger warehouses_updated_at before update on warehouses for each row execute function update_updated_at();
create trigger leads_updated_at before update on leads for each row execute function update_updated_at();

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────
alter table questions enable row level security;
alter table warehouses enable row level security;
alter table leads enable row level security;
alter table config enable row level security;
alter table survey_responses enable row level security;

-- Public read for questions and active warehouses
create policy "questions_public_read" on questions for select using (active = true);
create policy "warehouses_public_read" on warehouses for select using (status = 'active');

-- Anyone can insert a lead (shipper submission)
create policy "leads_public_insert" on leads for insert with check (true);

-- Survey responses - public insert with token
create policy "survey_public_insert" on survey_responses for insert with check (true);
create policy "survey_public_read" on survey_responses for select using (true);

-- Config public read
create policy "config_public_read" on config for select using (true);

-- Service role has full access (for API routes)
create policy "questions_service_all" on questions using (true) with check (true);
create policy "warehouses_service_all" on warehouses using (true) with check (true);
create policy "leads_service_all" on leads using (true) with check (true);
create policy "config_service_all" on config using (true) with check (true);

-- ─── SEED DEFAULT CONFIG ────────────────────────────────────
insert into config (key, value) values
('review_required', 'true'),
('auto_send_after_approval', 'true'),
('survey_delay_days', '7'),
('lead_fee_by_plan', '{"standard":100,"premium":180,"enterprise":300}'),
('ad_boost_prices', '{"10":99,"20":179,"30":249,"50":399}'),
('email_templates', '{
  "warehouseIntro": {
    "subject": "New Qualified Lead: {{shipper_company}} — {{match_score}}% Match",
    "body": "Hi {{warehouse_name}} Team,\n\nYou have a new qualified lead from LogiMatcher.\n\n📦 SHIPPER PROFILE\n• Company: {{shipper_company}}\n• Contact: {{shipper_name}} ({{shipper_email}})\n• Phone: {{shipper_phone}}\n\n📊 REQUIREMENTS\n• Business Type: {{business_type}}\n• Monthly Orders: {{monthly_orders}}\n• Products: {{product_types}}\n• Customer Location: {{location}}\n• Services Needed: {{services}}\n• Timeline: {{timeline}}\n\n🤖 AI MATCH SCORE: {{match_score}}%\n\n✅ TO CONFIRM THIS LEAD\nReply to this email:\n  ACCEPT — connect us\n  DECLINE — not a fit\n\nThis lead expires in 48 hours.\n\n— LogiMatcher Team"
  },
  "shipperConfirm": {
    "subject": "Your Warehouse Match is Ready — {{warehouse_name}}",
    "body": "Hi {{shipper_name}},\n\nWe found your best match:\n\n🏭 {{warehouse_name}}\n📍 {{warehouse_location}}\n⭐ {{warehouse_rating}} rating\n🎯 {{match_score}}% compatibility\n\nThey will reach out within 1-2 business days.\n\n— LogiMatcher Team"
  },
  "surveyInvite": {
    "subject": "Quick check-in: How is your fulfillment going?",
    "body": "Hi {{shipper_name}},\n\nIt has been {{days}} days since we connected you with {{warehouse_name}}.\n\nPlease take 60 seconds: {{survey_link}}\n\n— LogiMatcher Team"
  }
}')
on conflict (key) do nothing;

-- ─── SEED DEFAULT QUESTIONS ─────────────────────────────────
insert into questions (sort_order, question_id, question, subtitle, type, options) values
(1,'business_type','What type of business are you?','This helps us match you with specialists in your space','single','[{"value":"dtc","label":"DTC / eCommerce Brand","icon":"🛍️"},{"value":"b2b","label":"B2B / Wholesale","icon":"🏭"},{"value":"marketplace","label":"Amazon / Marketplace Seller","icon":"📦"},{"value":"subscription","label":"Subscription Box","icon":"🔄"},{"value":"retail","label":"Retail / Omnichannel","icon":"🏪"}]'),
(2,'monthly_orders','How many orders do you ship per month?','We will match you with warehouses that scale with your volume','single','[{"value":"startup","label":"Under 500","icon":"🌱"},{"value":"growing","label":"500 – 2,000","icon":"📈"},{"value":"established","label":"2,000 – 10,000","icon":"🚀"},{"value":"enterprise","label":"10,000+","icon":"🏆"}]'),
(3,'product_type','What do you sell?','Some warehouses specialize in specific product categories','multi','[{"value":"apparel","label":"Apparel & Fashion","icon":"👕"},{"value":"beauty","label":"Beauty & Cosmetics","icon":"💄"},{"value":"supplements","label":"Health & Supplements","icon":"💊"},{"value":"electronics","label":"Electronics & Tech","icon":"💻"},{"value":"food","label":"Food & Beverage","icon":"🍎"},{"value":"industrial","label":"Industrial / Auto Parts","icon":"⚙️"},{"value":"furniture","label":"Furniture / Large Items","icon":"🛋️"},{"value":"other","label":"Other / General","icon":"📦"}]'),
(4,'location','Where are most of your customers?','Proximity to customers reduces shipping time and cost','single','[{"value":"west","label":"West Coast","icon":"🌅"},{"value":"east","label":"East Coast","icon":"🌆"},{"value":"midwest","label":"Midwest","icon":"🌾"},{"value":"south","label":"South / Southeast","icon":"☀️"},{"value":"nationwide","label":"Nationwide","icon":"🗺️"},{"value":"international","label":"International","icon":"🌍"}]'),
(5,'services','What services do you need?','Select all that apply','multi','[{"value":"returns","label":"Returns Management","icon":"↩️"},{"value":"kitting","label":"Kitting & Assembly","icon":"🔧"},{"value":"fba","label":"Amazon FBA Prep","icon":"📬"},{"value":"subscription","label":"Subscription Boxes","icon":"🎁"},{"value":"b2b_dist","label":"B2B / Retail Distribution","icon":"🏬"},{"value":"international","label":"International Shipping","icon":"✈️"},{"value":"climate","label":"Climate Control","icon":"❄️"},{"value":"custom_pack","label":"Custom Packaging","icon":"🎀"}]'),
(6,'timeline','When do you need to get started?','This helps us prioritize warehouses with immediate capacity','single','[{"value":"asap","label":"ASAP","icon":"⚡"},{"value":"month","label":"Within 1 month","icon":"📅"},{"value":"quarter","label":"Within 3 months","icon":"🗓️"},{"value":"exploring","label":"Just exploring","icon":"🔍"}]')
on conflict (question_id) do nothing;

-- ─── SEED SAMPLE WAREHOUSES ─────────────────────────────────
insert into warehouses (name, location, region, logo, rating, reviews, min_volume, max_volume, specialties, services, integrations, pricing, lead_time, accuracy, sqft, status, contact_email, contact_phone, plan, ad_boost, lead_fee, description, badge) values
('PacWest Fulfillment','Los Angeles, CA','West','PW',4.9,312,500,50000,
 array['ecommerce','apparel','beauty','DTC'],
 array['Pick & Pack','Kitting','Returns','FBA Prep','Climate Control'],
 array['Shopify','Amazon','WooCommerce','BigCommerce'],
 '{"setup":0,"storage":0.45,"perOrder":2.85}','Same Day',99.8,280000,
 'active','ops@pacwest.example.com','(213) 555-0101','premium',30,180,
 'LA premier DTC fulfillment partner trusted by 400+ brands.','Top Rated'),
('MidAmerica 3PL','Chicago, IL','Midwest','MA',4.7,208,200,100000,
 array['B2B','wholesale','retail','food & beverage'],
 array['EDI','Retail Distribution','Cross-docking','Cold Storage','Freight'],
 array['NetSuite','SAP','QuickBooks','Shopify'],
 '{"setup":500,"storage":0.35,"perOrder":3.20}','Next Day',99.6,650000,
 'active','leads@midamerica.example.com','(312) 555-0102','standard',20,120,
 'Central US hub connecting brands to nationwide retail.','B2B Specialist'),
('EastPort Logistics','New York, NJ','East','EP',4.8,445,100,30000,
 array['fashion','luxury','apparel','accessories'],
 array['White Glove','Custom Packaging','Returns','Photography'],
 array['Shopify','Magento','Salesforce'],
 '{"setup":0,"storage":0.65,"perOrder":3.50}','Same Day',99.9,120000,
 'active','sales@eastport.example.com','(212) 555-0103','premium',0,180,
 'New York boutique fulfillment for premium fashion brands.','Fashion Expert'),
('SunState Fulfillment','Miami, FL','Southeast','SS',4.6,178,300,75000,
 array['ecommerce','supplements','health & beauty'],
 array['Pick & Pack','Subscription Boxes','International Shipping','Returns'],
 array['Shopify','Amazon','WooCommerce'],
 '{"setup":0,"storage":0.40,"perOrder":2.95}','Same Day',99.5,195000,
 'active','info@sunstate.example.com','(305) 555-0104','standard',0,100,
 'Southeast hub with Latin America connectivity.','Latin America Hub'),
('TexStar 3PL','Dallas, TX','South','TX',4.8,267,500,200000,
 array['auto parts','industrial','B2B','heavy goods'],
 array['Freight','Cross-docking','Bulk Storage','Assembly','Hazmat'],
 array['SAP','Oracle','QuickBooks'],
 '{"setup":1000,"storage":0.28,"perOrder":4.10}','1-2 Days',99.4,950000,
 'active','biz@texstar.example.com','(214) 555-0105','enterprise',10,300,
 'Texas-sized capacity for large-format B2B logistics.','Industrial Expert'),
('NorthWest Pack','Seattle, WA','Northwest','NP',4.7,156,100,25000,
 array['tech accessories','outdoor','subscriptions','ecommerce'],
 array['Subscription Boxes','Kitting','Returns','Amazon FBA Prep'],
 array['Shopify','Amazon','Cratejoy','ReCharge'],
 '{"setup":0,"storage":0.55,"perOrder":3.15}','Same Day',99.7,85000,
 'active','hello@nwpack.example.com','(206) 555-0106','standard',0,100,
 'Pacific Northwest subscription commerce specialist.','Subscription Expert')
on conflict do nothing;
