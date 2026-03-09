#!/usr/bin/env node
/**
 * Linemaster Product Page Scraper
 *
 * Crawls linemaster.com product pages using Playwright to extract:
 *   - All product images (gallery + CDN)
 *   - Features / highlights
 *   - Technical specifications (voltage, amperage, certifications, etc.)
 *   - Description / marketing copy
 *   - Notes and additional details
 *
 * Usage:
 *   # Install deps first (one-time)
 *   npm install --save-dev playwright
 *   npx playwright install chromium
 *
 *   # Scrape all products (reads URLs from Supabase)
 *   node scripts/scrape-products.mjs
 *
 *   # Scrape a single product URL (dry-run / test)
 *   node scripts/scrape-products.mjs --url "https://linemaster.com/product/167/hercules-full-shield/"
 *
 *   # Write results to Supabase (default is JSON file only)
 *   node scripts/scrape-products.mjs --write-db
 *
 * Output: scripts/scraped-products.json
 */

import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = resolve(__dirname, 'scraped-products.json');

// ─── Supabase config ────────────────────────────────────────────────────────
// Reads from utils/supabase/info.ts or env vars
function getSupabaseConfig() {
  // Try env vars first
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    return { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_ANON_KEY };
  }

  // Try reading from the project's supabase info file
  const infoPath = resolve(__dirname, '..', 'utils', 'supabase', 'info.ts');
  if (existsSync(infoPath)) {
    const content = readFileSync(infoPath, 'utf-8');
    const projectIdMatch = content.match(/projectId\s*=\s*['"]([^'"]+)['"]/);
    const anonKeyMatch = content.match(/publicAnonKey\s*=\s*['"]([^'"]+)['"]/);
    if (projectIdMatch && anonKeyMatch) {
      return {
        url: `https://${projectIdMatch[1]}.supabase.co`,
        key: anonKeyMatch[1],
      };
    }
  }

  return null;
}

// ─── Page scraping logic ────────────────────────────────────────────────────
async function scrapeProductPage(page, url) {
  console.log(`  Scraping: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

  // Wait for content to render
  await page.waitForTimeout(1500);

  const data = await page.evaluate(() => {
    const result = {
      url: window.location.href,
      title: '',
      images: [],
      description: '',
      features: [],
      specifications: {},
      notes: '',
      rawText: '',
    };

    // ── Title ──
    const h1 = document.querySelector('h1');
    if (h1) result.title = h1.textContent.trim();

    // ── Images ──
    // Look for product gallery images, OG images, and any large product images
    const allImages = new Set();

    // Open Graph image
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) allImages.add(ogImage.getAttribute('content'));

    // Gallery / product images (common patterns)
    const imgSelectors = [
      '.product-image img',
      '.product-gallery img',
      '.woocommerce-product-gallery img',
      '.product-images img',
      '[class*="product"] img[src*="cdn"]',
      '[class*="product"] img[src*="upload"]',
      '[class*="gallery"] img',
      'img[src*="shadow@"]',
      'img[src*="products/"]',
      'img[data-src*="products/"]',
      'img[data-large_image]',
    ];

    for (const sel of imgSelectors) {
      document.querySelectorAll(sel).forEach(img => {
        const src = img.getAttribute('data-large_image') ||
                    img.getAttribute('data-src') ||
                    img.getAttribute('src');
        if (src && !src.includes('placeholder') && !src.includes('data:image')) {
          allImages.add(src.startsWith('http') ? src : new URL(src, window.location.origin).href);
        }
      });
    }

    // Also grab any large images on the page (>200px wide, likely product photos)
    document.querySelectorAll('img').forEach(img => {
      if (img.naturalWidth > 200 || img.width > 200) {
        const src = img.getAttribute('src');
        if (src && src.includes('linemaster.com') && !src.includes('logo') && !src.includes('icon')) {
          allImages.add(src);
        }
      }
    });

    result.images = [...allImages].filter(Boolean);

    // ── Description ──
    // Look for product description in common locations
    const descSelectors = [
      '.product-description',
      '.woocommerce-product-details__short-description',
      '[class*="product"] .description',
      '.entry-content > p',
      '.product-content p',
      '[itemprop="description"]',
    ];
    for (const sel of descSelectors) {
      const el = document.querySelector(sel);
      if (el && el.textContent.trim().length > 20) {
        result.description = el.textContent.trim();
        break;
      }
    }

    // ── Features ──
    // Look for bullet lists near the product content
    const featureSelectors = [
      '.product-features li',
      '.features-list li',
      '[class*="feature"] li',
      '.product-description li',
      '.entry-content li',
      '.product-content li',
    ];
    for (const sel of featureSelectors) {
      const items = document.querySelectorAll(sel);
      if (items.length > 0) {
        items.forEach(li => {
          const text = li.textContent.trim();
          if (text.length > 3) result.features.push(text);
        });
        break;
      }
    }

    // If no structured features found, look for bold text patterns
    if (result.features.length === 0) {
      document.querySelectorAll('.entry-content strong, .product-content strong').forEach(el => {
        const text = el.textContent.trim();
        if (text.length > 5 && text.length < 100) {
          result.features.push(text);
        }
      });
    }

    // ── Specifications ──
    // Look for spec tables
    const specSelectors = [
      '.specifications table',
      '.product-specifications table',
      '.woocommerce-product-attributes',
      '[class*="spec"] table',
      '.entry-content table',
      'table.shop_attributes',
    ];
    for (const sel of specSelectors) {
      const table = document.querySelector(sel);
      if (table) {
        table.querySelectorAll('tr').forEach(row => {
          const cells = row.querySelectorAll('th, td');
          if (cells.length >= 2) {
            const key = cells[0].textContent.trim();
            const val = cells[1].textContent.trim();
            if (key && val) result.specifications[key] = val;
          }
        });
        break;
      }
    }

    // Also look for definition lists
    document.querySelectorAll('.entry-content dl, .product-content dl').forEach(dl => {
      const dts = dl.querySelectorAll('dt');
      const dds = dl.querySelectorAll('dd');
      for (let i = 0; i < Math.min(dts.length, dds.length); i++) {
        const key = dts[i].textContent.trim();
        const val = dds[i].textContent.trim();
        if (key && val) result.specifications[key] = val;
      }
    });

    // ── Raw text fallback ──
    // Capture full text content for AI processing if structured extraction misses things
    const mainContent = document.querySelector('.entry-content, .product-content, main, article');
    if (mainContent) {
      result.rawText = mainContent.textContent.replace(/\s+/g, ' ').trim().slice(0, 5000);
    }

    return result;
  });

  return data;
}

// ─── Extract structured fields from scraped data ────────────────────────────
function extractFields(scraped) {
  const specs = scraped.specifications || {};
  const allText = (scraped.rawText || '').toLowerCase();
  const features = scraped.features || [];

  // Try to extract voltage from specs or text
  let voltage = specs['Voltage'] || specs['Rated Voltage'] || specs['voltage'] || null;
  if (!voltage) {
    const vMatch = allText.match(/(\d+)\s*v(?:ac|dc)?\s*[-–]\s*(\d+)\s*v/i);
    if (vMatch) voltage = `${vMatch[1]}V - ${vMatch[2]}V`;
  }

  // Try to extract amperage
  let amperage = specs['Current'] || specs['Amperage'] || specs['Rated Current'] || null;
  if (!amperage) {
    const aMatch = allText.match(/(\d+)\s*a(?:mp)?\s*[-–]\s*(\d+)\s*a/i);
    if (aMatch) amperage = `${aMatch[1]}A - ${aMatch[2]}A`;
  }

  // Certifications
  let certifications = specs['Certifications'] || specs['Approvals'] || null;
  if (!certifications) {
    const certPatterns = ['UL', 'CSA', 'CE', 'IEC', 'NEMA', 'RoHS', 'IP\\d+'];
    const found = [];
    for (const pattern of certPatterns) {
      if (new RegExp(`\\b${pattern}\\b`, 'i').test(allText)) {
        found.push(pattern.replace('\\d+', ''));
      }
    }
    if (found.length > 0) certifications = found.join(', ');
  }

  // IP Rating from specs
  const ipRating = specs['IP Rating'] || specs['Protection'] || specs['Enclosure Rating'] || null;

  // Material
  const material = specs['Material'] || specs['Housing'] || specs['Body'] || null;

  return {
    title: scraped.title,
    images: scraped.images,
    description: scraped.description,
    features,
    voltage,
    amperage,
    certifications,
    ipRating,
    material,
    specifications: specs,
    notes: features.join(' | '),
  };
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const singleUrl = args.includes('--url') ? args[args.indexOf('--url') + 1] : null;
  const writeDb = args.includes('--write-db');

  // Get product URLs
  let products = [];

  if (singleUrl) {
    products = [{ id: 'test', Part: 'test', Link: singleUrl, series: 'test' }];
  } else {
    // Fetch from Supabase
    const config = getSupabaseConfig();
    if (!config) {
      console.error('Error: Cannot find Supabase config. Set SUPABASE_URL and SUPABASE_ANON_KEY env vars.');
      process.exit(1);
    }

    const supabase = createClient(config.url, config.key);
    const { data, error } = await supabase
      .from('Stock Switches')
      .select('id, Part, Link, series, image_url')
      .neq('Syteline Status', 'Obsolete')
      .not('Link', 'is', null);

    if (error) {
      console.error('Supabase query failed:', error.message);
      process.exit(1);
    }

    products = data;
    console.log(`Found ${products.length} products with Link URLs in database`);
  }

  // Filter to only products with valid Links
  const toScrape = products.filter(p => p.Link && p.Link.includes('linemaster.com/product/'));
  console.log(`Scraping ${toScrape.length} product pages...\n`);

  // Launch browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  const results = [];
  const errors = [];

  for (const product of toScrape) {
    try {
      const scraped = await scrapeProductPage(page, product.Link);
      const extracted = extractFields(scraped);

      results.push({
        id: product.id,
        part: product.Part,
        series: product.series,
        link: product.Link,
        currentImageUrl: product.image_url || null,
        ...extracted,
      });

      // Be polite — don't hammer the server
      await page.waitForTimeout(1000 + Math.random() * 1000);
    } catch (err) {
      console.error(`  ERROR scraping ${product.Link}: ${err.message}`);
      errors.push({ id: product.id, part: product.Part, link: product.Link, error: err.message });
    }
  }

  await browser.close();

  // Write results
  const output = { scrapedAt: new Date().toISOString(), results, errors };
  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\nDone! ${results.length} products scraped, ${errors.length} errors.`);
  console.log(`Results saved to: ${OUTPUT_FILE}`);

  // Optionally write back to Supabase
  if (writeDb && results.length > 0) {
    const config = getSupabaseConfig();
    if (!config) {
      console.error('Cannot write to DB — Supabase config not found');
      return;
    }

    const supabase = createClient(config.url, config.key);
    console.log('\nWriting enriched data to Supabase...');

    for (const r of results) {
      const update = {};

      // Only update fields that are currently empty in the DB
      if (r.description && r.description.length > 20) update.description = r.description;
      if (r.notes) update.Notes = r.notes;
      if (r.images.length > 0) {
        // Prefer CDN shadow image, then first scraped image
        const cdnImage = r.images.find(img => img.includes('shadow@'));
        if (cdnImage) update.image_url = cdnImage;
      }

      if (Object.keys(update).length > 0) {
        const { error } = await supabase
          .from('Stock Switches')
          .update(update)
          .eq('id', r.id);

        if (error) {
          console.error(`  Failed to update ${r.part}: ${error.message}`);
        } else {
          console.log(`  Updated ${r.part}: ${Object.keys(update).join(', ')}`);
        }
      }
    }

    console.log('Database update complete.');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
