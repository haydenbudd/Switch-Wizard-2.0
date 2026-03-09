#!/usr/bin/env node
/**
 * Phase 3: Merge Phase 1 transformed data with Phase 2 Chrome-scraped data.
 *
 * Usage: node scripts/merge-scraped-data.mjs [path-to-phase2-json]
 *
 * Default Phase 2 input: scripts/output/linemaster_scraped_phase2.json
 * Output: scripts/output/linemaster_products_complete.json
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT_DIR = join(ROOT, 'scripts', 'output');

const PHASE1_PATH = join(OUTPUT_DIR, 'linemaster_products_phase1.json');
const PHASE2_DEFAULT = join(OUTPUT_DIR, 'linemaster_scraped_phase2.json');
const OUTPUT_PATH = join(OUTPUT_DIR, 'linemaster_products_complete.json');

// Allow custom Phase 2 path via CLI arg
const phase2Path = process.argv[2] || PHASE2_DEFAULT;

// ─── Validate inputs ────────────────────────────────────────────────

if (!existsSync(PHASE1_PATH)) {
  console.error(`Phase 1 file not found: ${PHASE1_PATH}`);
  console.error('Run: node scripts/scrape-linemaster.mjs');
  process.exit(1);
}

if (!existsSync(phase2Path)) {
  console.error(`Phase 2 file not found: ${phase2Path}`);
  console.error('Run the Chrome console script first, then place the downloaded JSON at:');
  console.error(`  ${PHASE2_DEFAULT}`);
  process.exit(1);
}

// ─── Load data ───────────────────────────────────────────────────────

const phase1 = JSON.parse(readFileSync(PHASE1_PATH, 'utf-8'));
const phase2Raw = JSON.parse(readFileSync(phase2Path, 'utf-8'));

// Phase 2 format: { results: { [part_number]: { description, features, ... } }, errors: [...] }
const phase2 = phase2Raw.results || phase2Raw;
const phase2Errors = phase2Raw.errors || [];

console.log(`Phase 1: ${phase1.length} products`);
console.log(`Phase 2: ${Object.keys(phase2).length} scraped results, ${phase2Errors.length} errors`);

// ─── Merge ───────────────────────────────────────────────────────────

let mergedCount = 0;

for (const product of phase1) {
  const scraped = phase2[product.part_number];
  if (!scraped) continue;

  mergedCount++;

  // Override description if Phase 2 has a better (longer) one
  if (scraped.description && scraped.description.length > (product.description || '').length) {
    product.description = scraped.description;
  }

  // Populate features from Phase 2
  if (scraped.features && scraped.features.length > 0) {
    product.features = scraped.features;
  }

  // Merge additional specs
  if (scraped.additionalSpecs) {
    for (const [key, value] of Object.entries(scraped.additionalSpecs)) {
      if (value && !product.specifications[key]) {
        product.specifications[key] = value;
      }
    }
  }

  // Build notes from materials, options, applications
  const noteParts = [];
  if (product.notes) noteParts.push(product.notes);
  if (scraped.materials) noteParts.push(`Materials of Construction: ${scraped.materials}`);
  if (scraped.options) noteParts.push(`Options: ${scraped.options}`);
  if (scraped.applications) noteParts.push(`Applications: ${scraped.applications}`);
  product.notes = noteParts.join('\n\n');
}

// ─── Write output ────────────────────────────────────────────────────

writeFileSync(OUTPUT_PATH, JSON.stringify(phase1, null, 2));

console.log(`\nMerged: ${mergedCount}/${phase1.length} products enriched`);
console.log(`Output: ${OUTPUT_PATH}`);

if (phase2Errors.length > 0) {
  console.log(`\nPhase 2 had ${phase2Errors.length} scrape errors:`);
  for (const err of phase2Errors) {
    console.log(`  ${err.part_number}: ${err.error}`);
  }
}

// Stats
const withFeatures = phase1.filter(p => p.features.length > 0).length;
const withFullDesc = phase1.filter(p => p.description.length > 50).length;
console.log(`\nFinal stats:`);
console.log(`  With features: ${withFeatures}`);
console.log(`  With full description: ${withFullDesc}`);
