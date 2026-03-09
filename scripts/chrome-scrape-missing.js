/**
 * Chrome DevTools Console Script — Phase 2
 *
 * Paste this entire script into Chrome DevTools console while on linemaster.com.
 * It fetches each product page (same-origin, no CORS issues) and extracts the
 * missing fields: features, materials, options, applications, and full description.
 *
 * HOW TO USE:
 * 1. Open Chrome and navigate to https://linemaster.com
 * 2. Open DevTools (F12) → Console tab
 * 3. Paste this entire script and press Enter
 * 4. Wait for it to finish (~15-25 min for 294 products at 3s intervals)
 * 5. When done, it auto-downloads linemaster_scraped_phase2.json
 *
 * The script has resume support — if you reload the page and re-paste,
 * it picks up from where it left off using localStorage.
 */

(async function scrapeMissingData() {
  'use strict';

  // ─── Configuration ─────────────────────────────────────────────────
  const DELAY_MS = 3000;         // Base delay between requests
  const JITTER_MS = 2000;        // Random jitter added to delay
  const MAX_RETRIES = 2;         // Retries per URL on failure
  const STORAGE_KEY = 'lm_scrape_progress';

  // ─── Product URL list (all 294 products) ───────────────────────────
  // This will be populated from the Phase 1 output.
  // Replace PRODUCT_URLS below with the actual list, or fetch it.
  //
  // Format: [{ part_number: "41DH12", url: "https://linemaster.com/product/2/..." }, ...]

  /* ==================================================================
   * PASTE YOUR PRODUCT LIST HERE
   * Generate it with:
   *   node -e "const d=JSON.parse(require('fs').readFileSync('scripts/output/linemaster_products_phase1.json','utf-8')); console.log('const PRODUCT_URLS = ' + JSON.stringify(d.map(p=>({part_number:p.part_number,url:p.url})),null,2) + ';')"
   * ================================================================== */
  // @ts-ignore — this gets replaced by the user
  if (typeof PRODUCT_URLS === 'undefined') {
    console.error(
      '%c[Scraper] PRODUCT_URLS not defined!',
      'color:red;font-weight:bold',
      '\nGenerate it by running the node command shown in the script comments,',
      'then paste the output above this block before running.'
    );
    return;
  }

  // ─── Resume support ────────────────────────────────────────────────
  let results = {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      results = JSON.parse(saved);
      console.log(`%c[Scraper] Resuming — ${Object.keys(results).length} products already done`, 'color:green');
    }
  } catch { /* fresh start */ }

  const errors = [];

  // ─── HTML Parser ───────────────────────────────────────────────────

  function extractSections(doc) {
    const data = {
      description: '',
      features: [],
      materials: '',
      options: '',
      applications: '',
      additionalSpecs: {},
    };

    // --- Full description ---
    // Look for the product description area (typically before collapsible sections)
    const descEl = doc.querySelector('.product-description, .pdp-description, [class*="description"]');
    if (descEl) {
      data.description = descEl.textContent.trim();
    } else {
      // Fallback: find the first substantial <p> near the product title
      const paragraphs = doc.querySelectorAll('.product-detail p, .pdp-content p, main p');
      for (const p of paragraphs) {
        const text = p.textContent.trim();
        if (text.length > 30 && !text.includes('function') && !text.includes('{')) {
          data.description = text;
          break;
        }
      }
    }

    // --- Collapsible sections ---
    // The page uses headers (h3, strong, or elements with specific text) followed by content
    // Look for section headers by text content
    const allElements = doc.querySelectorAll('h2, h3, h4, strong, b, .collapsible-header, [class*="section-header"]');

    for (const header of allElements) {
      const headerText = header.textContent.trim().toUpperCase();

      if (headerText.includes('FEATURES') && headerText.includes('BENEFITS')) {
        // Collect list items or text from siblings
        const features = collectSectionContent(header);
        data.features = splitIntoItems(features);
      } else if (headerText.includes('MATERIALS') && headerText.includes('CONSTRUCTION')) {
        data.materials = collectSectionContent(header);
      } else if (headerText === 'OPTIONS:' || headerText === 'OPTIONS') {
        data.options = collectSectionContent(header);
      } else if (headerText.includes('APPLICATION')) {
        data.applications = collectSectionContent(header);
      }
    }

    // --- Additional specs from tables ---
    const specTables = doc.querySelectorAll('table');
    for (const table of specTables) {
      const rows = table.querySelectorAll('tr');
      for (const row of rows) {
        const cells = row.querySelectorAll('td, th');
        if (cells.length >= 2) {
          const key = cells[0].textContent.trim();
          const value = cells[1].textContent.trim();
          if (key && value && !key.includes('{') && key.length < 50) {
            data.additionalSpecs[key] = value;
          }
        }
      }
    }

    return data;
  }

  function collectSectionContent(headerEl) {
    const parts = [];
    let el = headerEl.nextElementSibling;

    // If the header has a collapsible-content wrapper as next sibling, use it
    if (el && el.classList.contains('collapsible-content')) {
      return el.textContent.trim();
    }

    // Otherwise collect siblings until next header or section boundary
    const headerTags = new Set(['H2', 'H3', 'H4']);
    const sectionKeywords = ['FEATURES', 'MATERIALS', 'OPTIONS', 'APPLICATION', 'PRICE'];

    while (el) {
      // Stop if we hit another section header
      if (headerTags.has(el.tagName)) break;
      const text = el.textContent.trim().toUpperCase();
      if (sectionKeywords.some(kw => text.startsWith(kw))) break;
      if (el.classList.contains('collapsible-header')) break;

      parts.push(el.textContent.trim());
      el = el.nextElementSibling;
    }

    return parts.join('\n').trim();
  }

  function splitIntoItems(text) {
    if (!text) return [];
    // Try splitting on list markers, newlines, or tab characters
    return text
      .split(/[\n\t•·►▸‣]/)
      .map(s => s.trim())
      .filter(s => s.length > 3 && !s.includes('function') && !s.includes('{'));
  }

  // ─── Fetch with retry ──────────────────────────────────────────────

  async function fetchWithRetry(url, retries = MAX_RETRIES) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, {
          credentials: 'include',
          headers: { 'Accept': 'text/html' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.text();
      } catch (err) {
        if (attempt < retries) {
          const wait = (attempt + 1) * 2000;
          console.warn(`  Retry ${attempt + 1}/${retries} in ${wait}ms: ${err.message}`);
          await sleep(wait);
        } else {
          throw err;
        }
      }
    }
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // ─── Main loop ─────────────────────────────────────────────────────

  const total = PRODUCT_URLS.length;
  let completed = Object.keys(results).length;

  console.log(`%c[Scraper] Starting — ${total} products, ${completed} already done`, 'color:blue;font-weight:bold');

  for (let i = 0; i < total; i++) {
    const { part_number, url } = PRODUCT_URLS[i];

    // Skip already completed
    if (results[part_number]) continue;

    console.log(`[${completed + 1}/${total}] ${part_number}: ${url}`);

    try {
      const html = await fetchWithRetry(url);
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const extracted = extractSections(doc);

      results[part_number] = extracted;
      completed++;

      // Save progress every 5 products
      if (completed % 5 === 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
        console.log(`  [Progress saved: ${completed}/${total}]`);
      }
    } catch (err) {
      console.error(`  FAILED: ${err.message}`);
      errors.push({ part_number, url, error: err.message });
    }

    // Polite delay
    await sleep(DELAY_MS + Math.random() * JITTER_MS);
  }

  // Final save
  localStorage.setItem(STORAGE_KEY, JSON.stringify(results));

  // ─── Download results ──────────────────────────────────────────────

  const output = { results, errors, timestamp: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'linemaster_scraped_phase2.json';
  document.body.appendChild(a);
  a.click();
  a.remove();

  console.log(
    `%c[Scraper] DONE! ${completed} succeeded, ${errors.length} errors`,
    'color:green;font-weight:bold'
  );
  if (errors.length > 0) {
    console.table(errors);
  }

  console.log('To clear saved progress: localStorage.removeItem("lm_scrape_progress")');
})();
