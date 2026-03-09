# Scraping Linemaster Product Data

Two approaches for extracting product images, features, and specs from linemaster.com.

---

## Option A: Claude in Chrome (Recommended for accuracy)

Use Claude with the browser to manually visit each product page and extract structured data.

### Setup

1. Open **Claude Desktop** or **claude.ai** in Chrome
2. Have this prompt ready (paste it into Claude and update the URL for each product)

### Prompt Template

Paste this into Claude for each product page. Open the linemaster.com product page in another tab and either screenshot it or copy the page HTML.

```
I'm extracting product data from a Linemaster footswitch product page.

Product URL: https://linemaster.com/product/167/hercules-full-shield/

From the attached screenshot / page content, extract ALL of the following as JSON:

{
  "part_number": "the SKU/part number shown on the page",
  "title": "full product name",
  "images": ["array of ALL image URLs on the page - product photos, gallery images"],
  "primary_image": "the main/hero product image URL",
  "description": "the marketing description paragraph(s)",
  "features": ["bullet point features as an array"],
  "specifications": {
    "Voltage": "...",
    "Amperage": "...",
    "IP Rating": "...",
    "Material": "...",
    "Certifications": "UL, CSA, etc.",
    "Weight": "...",
    "Dimensions": "...",
    "Cable Length": "...",
    "Connection Type": "...",
    "Operating Force": "..."
  },
  "notes": "any additional details, warnings, or application notes",
  "related_products": ["any related/similar product part numbers mentioned"]
}

Important:
- Include ALL image URLs you can find (check srcset, data-src, gallery thumbnails)
- For the primary image, prefer the CDN shadow image: /cdn/images/products/{id}/{id}-a-shadow@1200.png
- Extract every specification row from the specs table
- Capture ALL bullet point features, not just the first few
- Include any certification logos/text (UL, CSA, CE, etc.)
```

### Product URLs to Scrape

These are the product series pages. Each series has multiple SKUs — you may need to visit sub-pages for individual part numbers.

| Series | URL |
|--------|-----|
| Hercules | https://linemaster.com/product/167/hercules-full-shield/ |
| Atlas | https://linemaster.com/product/77/atlas-full-shield/ |
| Clipper | https://linemaster.com/product/115/clipper-single-momentary/ |
| Classic IV | https://linemaster.com/product/112/classic-iv/ |
| Dolphin | https://linemaster.com/product/129/dolphin/ |
| Gem-V | https://linemaster.com/product/162/gem-v/ |
| Varior | https://linemaster.com/product/407/varior-potentiometer/ |
| RF Wireless Hercules | https://linemaster.com/product/475/radio-frequency-wireless-hercules/ |
| Air Seal | https://linemaster.com/product/2/air-seal-maintained/ |
| Airval Hercules | https://linemaster.com/product/17/airval-hercules-full-shield/ |

> **Tip:** The full product catalog is at https://linemaster.com/footswitches/ — browse there to find additional SKU-specific pages beyond these series pages.

### After Extraction

Once you have JSON for each product, you can:

1. Save all results into `scripts/scraped-products.json`
2. Use the admin CSV import at `/admin` to bulk-update
3. Or update Supabase directly via the MCP:

```
Use Supabase MCP to update the "Stock Switches" table:
- Set image_url, description, Notes, features for each product by id
- Only update fields that are currently null/empty
```

---

## Option B: Playwright Scraper Script (Automated)

A Node.js script that crawls all product pages automatically.

### Setup

```bash
# Install dependencies (one-time)
npm install --save-dev playwright
npx playwright install chromium

# Set Supabase credentials (or it reads from utils/supabase/info.ts)
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
```

### Usage

```bash
# Test with a single product page first
node scripts/scrape-products.mjs --url "https://linemaster.com/product/167/hercules-full-shield/"

# Scrape all products (reads Links from Supabase)
node scripts/scrape-products.mjs

# Scrape all and write enriched data back to Supabase
node scripts/scrape-products.mjs --write-db
```

### Output

Results are saved to `scripts/scraped-products.json` with this structure:

```json
{
  "scrapedAt": "2026-03-09T...",
  "results": [
    {
      "id": 123,
      "part": "632-S",
      "series": "Hercules",
      "link": "https://linemaster.com/product/167/...",
      "title": "Hercules Full Shield",
      "images": ["url1", "url2"],
      "description": "...",
      "features": ["Heavy-duty cast iron", "Full shield guard", ...],
      "voltage": "120V - 240V",
      "amperage": "10A - 15A",
      "certifications": "UL, CSA",
      "specifications": { ... },
      "notes": "..."
    }
  ],
  "errors": []
}
```

### Customizing the Scraper

The scraper uses common CSS selectors for product pages. If linemaster.com uses custom class names, you may need to update the selectors in `scrapeProductPage()` after inspecting the page HTML.

To inspect the actual DOM:
1. Open a product page in Chrome
2. Right-click → Inspect
3. Look for the selectors used for images, features, and spec tables
4. Update the selector arrays in the script accordingly

---

## Database Fields to Enrich

These fields in the `Stock Switches` table can be populated from scraped data:

| Field | Source | Priority |
|-------|--------|----------|
| `image_url` | Per-product CDN image | High — unique product photos |
| `description` | Marketing copy from product page | Medium |
| `Notes` | Features + application notes combined | Medium |
| `features` | Bullet points from product page | Medium |

The app's `deriveImage()` function (in `src/app/lib/transformProduct.ts`) uses this priority:
1. DB `image_url` (if per-product, not a series fallback)
2. CDN URL derived from Link: `https://linemaster.com/cdn/images/products/{id}/{id}-a-shadow@1200.png`
3. Series-level fallback image

So for images, the best approach is to verify the CDN URL works for each product and set `image_url` to null (letting the CDN derivation handle it) or to the verified CDN URL.
