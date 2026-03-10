/**
 * Seed the Supabase "Stock Switches" table with transformed Linemaster product data.
 *
 * Usage: node scripts/seed_supabase.cjs [--dry-run] [--clear-first]
 *   --dry-run      Print what would be inserted without touching the database
 *   --clear-first  Delete all existing rows before inserting (asks for confirmation)
 */
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://dhaqigiwkmsjrchrbllu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoYXFpZ2l3a21zanJjaHJibGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MTYxNTIsImV4cCI6MjA4NDM5MjE1Mn0.0ktzelG2dZzV-36Qz_RbPoUk59TGeLksedQD-xMLH3Q';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BATCH_SIZE = 25;
const BATCH_DELAY_MS = 300;

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const clearFirst = args.includes('--clear-first');

  const rows = JSON.parse(fs.readFileSync('scripts/output/stock_switches_rows.json', 'utf-8'));
  console.log(`Loaded ${rows.length} rows to seed`);

  if (dryRun) {
    console.log('\n--- DRY RUN ---');
    console.log('First 3 rows:');
    for (let i = 0; i < Math.min(3, rows.length); i++) {
      console.log(JSON.stringify(rows[i], null, 2));
    }
    console.log(`\nWould insert ${rows.length} rows in ${Math.ceil(rows.length / BATCH_SIZE)} batches`);
    return;
  }

  // Check existing data
  const { count, error: countErr } = await supabase
    .from('Stock Switches')
    .select('*', { count: 'exact', head: true });

  if (countErr) {
    console.error('Error checking existing data:', countErr.message);
    process.exit(1);
  }

  console.log(`Existing rows in Stock Switches: ${count}`);

  if (clearFirst && count > 0) {
    console.log('Clearing existing data...');
    const { error: delErr } = await supabase
      .from('Stock Switches')
      .delete()
      .neq('id', 0);

    if (delErr) {
      console.error('Error clearing data:', delErr.message);
      process.exit(1);
    }
    console.log('Cleared.');
  }

  // Insert in batches
  const totalBatches = Math.ceil(rows.length / BATCH_SIZE);
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    const { data, error } = await supabase
      .from('Stock Switches')
      .insert(batch)
      .select('id');

    if (error) {
      console.error(`Batch ${batchNum}/${totalBatches} FAILED:`, error.message);
      // Log the failing rows for debugging
      console.error('Failed batch Part numbers:', batch.map(r => r.Part).join(', '));
      errors += batch.length;
    } else {
      inserted += (data || []).length;
      console.log(`Batch ${batchNum}/${totalBatches}: inserted ${(data || []).length} rows`);
    }

    // Small delay between batches to avoid rate limiting
    if (i + BATCH_SIZE < rows.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  console.log(`\nDone! Inserted: ${inserted}, Errors: ${errors}`);

  // Verify final count
  const { count: finalCount } = await supabase
    .from('Stock Switches')
    .select('*', { count: 'exact', head: true });
  console.log(`Final row count in Stock Switches: ${finalCount}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
