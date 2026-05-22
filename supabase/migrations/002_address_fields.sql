-- ─────────────────────────────────────────────────────────────────────────
-- Migration 002: Add detailed address fields to warehouses
-- Run this in Supabase SQL Editor if you already ran 001_schema.sql
-- ─────────────────────────────────────────────────────────────────────────

alter table warehouses
  add column if not exists address_street  text default '',
  add column if not exists address_city    text default '',
  add column if not exists address_state   text default '',
  add column if not exists address_zip     text default '',
  add column if not exists address_country text default 'US';

-- Backfill: try to parse existing "City, ST" location into city/state
update warehouses
set
  address_city  = split_part(location, ', ', 1),
  address_state = split_part(location, ', ', 2)
where location is not null
  and location <> ''
  and address_city = '';
