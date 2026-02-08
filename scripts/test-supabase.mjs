/**
 * Quick Supabase connection test.
 * Run: node scripts/test-supabase.mjs
 *
 * Verifies env vars are set and the API is reachable.
 * If tables don't exist yet, it shows instructions to apply migrations.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!url || !key) {
  console.error("Missing environment variables:");
  if (!url) console.error("  - NEXT_PUBLIC_SUPABASE_URL");
  if (!key) console.error("  - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

console.log("Supabase URL:", url);
console.log("");

// Test categories table
const { data: cats, error: catErr } = await supabase
  .from("categories")
  .select("*")
  .order("sort_order");

if (catErr) {
  if (catErr.message.includes("Could not find the table")) {
    console.log("Tables not found. Apply migrations in the Supabase Dashboard:");
    console.log("  1. Open https://supabase.com/dashboard/project/aqzguzbwpojvrkfcajsg/sql");
    console.log("  2. Paste contents of supabase/migrations/001_initial_schema.sql and run");
    console.log("  3. Paste contents of supabase/migrations/002_seed_data.sql and run");
    process.exit(1);
  }
  console.error("Categories error:", catErr.message);
  process.exit(1);
}

console.log(`Categories: ${cats.length} found`);
cats.forEach((c) => console.log(`  - ${c.name} (sort: ${c.sort_order})`));

// Test products table
const { data: prods, error: prodErr } = await supabase
  .from("products")
  .select("*");

if (prodErr) {
  console.error("Products error:", prodErr.message);
  process.exit(1);
}

console.log(`\nProducts: ${prods.length} found`);
prods
  .slice(0, 5)
  .forEach((p) => console.log(`  - ${p.name} €${(p.base_price / 100).toFixed(2)}`));
if (prods.length > 5) console.log(`  ... and ${prods.length - 5} more`);

console.log("\nConnection test: SUCCESS");
