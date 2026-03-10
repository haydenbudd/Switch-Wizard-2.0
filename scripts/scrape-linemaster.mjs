#!/usr/bin/env node
/**
 * Phase 1: Transform linemaster_all_294_products.json into clean, normalized JSON.
 * Uses only the clean fields from the scraped data (no network requests).
 *
 * Usage: node scripts/scrape-linemaster.mjs
 * Output: scripts/output/linemaster_products_phase1.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const INPUT = join(ROOT, 'linemaster_all_294_products.json');
const OUTPUT = join(ROOT, 'scripts', 'output', 'linemaster_products_phase1.json');

// ---------------------------------------------------------------------------
// Certification image URL → human-readable name
// ---------------------------------------------------------------------------
const CERT_MAP = {
  'cRUus-rectangle.png': 'cRUus',
  'CE-rectangle.png': 'CE',
  'RoHS-rectangle.png': 'RoHS',
  'UL-rectangle.png': 'UL',
  'CSA-rectangle.png': 'CSA',
  'cULus-rectangle.png': 'cULus',
  'cULus-Listed-rectangle.png': 'cULus Listed',
  'RU-rectangle.png': 'RU',
  'Semko-rectangle.png': 'Semko',
  'TUV-rectangle.png': 'TUV',
};

// ---------------------------------------------------------------------------
// Parsers
// ---------------------------------------------------------------------------

/** Extract the marketing tagline from the (partially corrupted) purpose field. */
function cleanDescription(purpose) {
  if (!purpose) return '';
  // The tagline is the first line before the whitespace / "Features & Benefits" noise
  const firstLine = purpose.split('\n')[0].trim();
  return firstLine || '';
}

/** Parse enclosure string into IP rating, NEMA rating, and additional info. */
function parseEnclosure(enclosure) {
  if (!enclosure) return {};
  const result = {};

  // Extract all IP ratings (IP20, IP68, IPXX, etc.)
  const ipMatches = enclosure.match(/IP\d{2}|IPXX/g);
  if (ipMatches) {
    // Filter out IPXX (means "not rated") and deduplicate
    const meaningful = [...new Set(ipMatches.filter(ip => ip !== 'IPXX' && ip !== 'IP00'))];
    if (meaningful.length > 0) {
      result['IP Rating'] = meaningful.join(', ');
    }
  }

  // Extract NEMA types
  const nemaMatch = enclosure.match(/NEMA\s+(?:Type\s+|&\s+UL\s+ENCLOSURE\s+Type\s+)?([\d,\s&XPDA-Z]+?)(?:\s+•|\s*$)/i);
  if (nemaMatch) {
    // Get the full NEMA segment(s)
    const nemaSegments = enclosure.match(/NEMA\s+(?:Type\s+)?[\d,\s&XPDA-Z]+/gi);
    if (nemaSegments) {
      result['NEMA Rating'] = nemaSegments[0].trim();
    }
  }

  // Check for hazardous location ratings (CLASS/DIVISION/GROUP)
  if (/CLASS\s+[I1]/i.test(enclosure)) {
    result['Hazardous Location'] = enclosure
      .split('•')
      .map(s => s.trim())
      .filter(s => /CLASS|DIVISION|GROUP|ZONE/i.test(s))
      .join(', ');
  }

  // Check for IEC 60601 (medical)
  if (/IEC\s*60601/i.test(enclosure)) {
    result['Medical Rating'] = 'IEC 60601-2-2';
  }

  return result;
}

/** Parse electrical ratings string into voltage and amperage components. */
function parseElectricalRatings(ratings) {
  if (!ratings) return {};
  const result = {};

  // Extract amperage — look for patterns like "20A" or "15 A" or "13A"
  const ampMatch = ratings.match(/(\d+(?:\/\d+)?)\s*A(?:mp)?(?:\b|,)/i);
  if (ampMatch) {
    result['Amperage'] = ampMatch[1] + 'A';
  }

  // Extract voltage — look for patterns like "125-250 VAC" or "250 VDC"
  const voltMatches = ratings.match(/\d+(?:-\d+)?\s*V(?:AC|DC)/gi);
  if (voltMatches) {
    // Deduplicate and join
    const unique = [...new Set(voltMatches.map(v => v.replace(/\s+/g, ' ')))];
    result['Voltage'] = unique.join(', ');
  }

  return result;
}

/** Map certification URLs to readable names. */
function mapCertifications(certUrls) {
  if (!certUrls || certUrls.length === 0) return [];
  return certUrls.map(url => {
    const filename = url.split('/').pop();
    return CERT_MAP[filename] || filename.replace(/-rectangle\.png$/, '');
  });
}

// ---------------------------------------------------------------------------
// Main transform
// ---------------------------------------------------------------------------

function transformProduct(raw) {
  const description = cleanDescription(raw.purpose);
  const certNames = mapCertifications(raw.certifications);
  const enclosureData = parseEnclosure(raw.enclosure);
  const electricalData = parseElectricalRatings(raw.specs?.['Electrical Ratings']);

  // Build specifications from clean spec keys
  const specifications = {};
  if (raw.specs) {
    for (const [key, value] of Object.entries(raw.specs)) {
      if (value) specifications[key] = value;
    }
  }

  // Add parsed fields
  if (electricalData.Voltage) specifications['Voltage'] = electricalData.Voltage;
  if (electricalData.Amperage) specifications['Amperage'] = electricalData.Amperage;
  if (enclosureData['IP Rating']) specifications['IP Rating'] = enclosureData['IP Rating'];
  if (enclosureData['NEMA Rating']) specifications['NEMA Rating'] = enclosureData['NEMA Rating'];
  if (enclosureData['Hazardous Location']) specifications['Hazardous Location'] = enclosureData['Hazardous Location'];
  if (enclosureData['Medical Rating']) specifications['Medical Rating'] = enclosureData['Medical Rating'];
  if (certNames.length > 0) specifications['Certifications'] = certNames.join(', ');

  // Alias common fields for downstream consumers
  if (raw.specs?.['Housing Materials']) specifications['Material'] = raw.specs['Housing Materials'];
  if (raw.specs?.['Switch Connections']) specifications['Connection Type'] = raw.specs['Switch Connections'];
  if (raw.specs?.['Cordsets']) specifications['Cable Length'] = raw.specs['Cordsets'];

  // Build notes from available non-corrupted data
  const noteParts = [];
  if (raw.enclosure) noteParts.push(`Enclosure: ${raw.enclosure}`);
  if (raw.applications && raw.applications.trim() && !raw.applications.includes('<')) {
    noteParts.push(`Applications: ${raw.applications.trim()}`);
  }

  return {
    part_number: raw.sku || '',
    title: raw.title || '',
    url: raw.url || '',
    price: raw.price || '',
    images: raw.images || [],
    primary_image: (raw.images || [])[0] || '',
    description,
    features: [],  // Populated by Phase 2 (Chrome scraper)
    specifications,
    notes: noteParts.join('\n\n'),
  };
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

const rawData = JSON.parse(readFileSync(INPUT, 'utf-8'));
console.log(`Transforming ${rawData.length} products...`);

const products = rawData.map(transformProduct);

writeFileSync(OUTPUT, JSON.stringify(products, null, 2));
console.log(`Done. Output: ${OUTPUT}`);
console.log(`Products: ${products.length}`);

// Quick stats
const withIP = products.filter(p => p.specifications['IP Rating']).length;
const withVoltage = products.filter(p => p.specifications['Voltage']).length;
const withCerts = products.filter(p => p.specifications['Certifications']).length;
const withDesc = products.filter(p => p.description).length;
console.log(`  With IP Rating: ${withIP}`);
console.log(`  With Voltage: ${withVoltage}`);
console.log(`  With Certifications: ${withCerts}`);
console.log(`  With Description: ${withDesc}`);
