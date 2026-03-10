/**
 * Transform merged Linemaster scraped data into Stock Switches table rows.
 * Outputs: scripts/output/stock_switches_rows.json
 */
const fs = require('fs');
const merged = JSON.parse(fs.readFileSync('scripts/output/linemaster_merged.json', 'utf-8'));

// --- RFC 4180-compliant CSV line parser ---
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

// --- Load stages lookup from CSV (source of truth for Stages) ---
const csvStagesLookup = {};
const csvLines = fs.readFileSync('Product Finder.csv', 'utf-8').split('\n');
const csvHeader = parseCSVLine(csvLines[0]);
const csvPartIdx = csvHeader.indexOf('Part');
const csvStagesIdx = csvHeader.indexOf('Stages');
const csvConfigIdx = csvHeader.indexOf('Configuration');
for (let i = 1; i < csvLines.length; i++) {
  if (!csvLines[i].trim()) continue;
  const cols = parseCSVLine(csvLines[i]);
  const part = (cols[csvPartIdx] || '').trim();
  const stages = (cols[csvStagesIdx] || '').trim();
  const config = (cols[csvConfigIdx] || '').trim();
  if (part) {
    if (stages) csvStagesLookup[part] = stages;
  }
}

// --- Series derivation from title ---
function deriveSeries(title) {
  if (!title) return 'Unknown';

  // Normalize and match known series names
  const t = title.toLowerCase();

  if (t.startsWith('radio frequency wireless hercules') || t.startsWith('rf wireless hercules')) return 'RF Wireless Hercules';
  if (t.startsWith('hercules potentiometer')) return 'Hercules';
  if (t.startsWith('hercules')) return 'Hercules';
  if (t.startsWith('atlas')) return 'Atlas';
  if (t.startsWith('clipper wide treadle')) return 'Clipper';
  if (t.startsWith('clipper twin')) return 'Clipper';
  if (t.startsWith('clipper ii')) return 'Clipper';
  if (t.startsWith('clipper')) return 'Clipper';
  if (t.startsWith('classic iv')) return 'Classic IV';
  if (t.startsWith('classic ii')) return 'Classic II';
  if (t.startsWith('dolphin')) return 'Dolphin';
  if (t.startsWith('gem')) return 'GEM-V';
  if (t.startsWith('varior')) return 'Varior';
  if (t.startsWith('air seal') || t.startsWith('air-seal')) return 'Air Seal';
  if (t.startsWith('airval')) return 'Airval Hercules';
  if (t.startsWith('aquiline')) return 'Aquiline';
  if (t.startsWith('treadlite')) return 'Treadlite II';
  if (t.startsWith('anti trip') || t.startsWith('anti-trip')) return 'Anti Trip';
  if (t.startsWith('compact twin')) return 'Compact';
  if (t.startsWith('compact')) return 'Compact';
  if (t.startsWith('explosion proof')) return 'Explosion Proof';
  if (t.startsWith('vanguard')) return 'Vanguard';
  if (t.startsWith('nautilus')) return 'Nautilus';
  if (t.startsWith('lektro')) return 'Lektro';
  if (t.startsWith('executive')) return 'Executive';
  if (t.startsWith('electronic ac speed')) return 'Electronic AC Speed Control';
  if (t.startsWith('premier')) return 'Premier';
  if (t.startsWith('junior')) return 'Junior';
  if (t.startsWith('slim')) return 'Slim';
  if (t.startsWith('deluxe')) return 'Deluxe';
  if (t.startsWith('duplex')) return 'Duplex';

  // Fallback: use text before first dash
  return title.split(/\s*-\s*/)[0].trim();
}

// --- Map actions string to On/Off and Linear ---
function deriveOnOff(actions) {
  if (!actions) return { onOff: null, linear: null, stages: null };

  const a = actions.toLowerCase();
  let onOff = null;
  let linear = null;
  let stages = null;

  // Check for variable/potentiometer
  if (a.includes('variable')) {
    linear = 'Yes';
    onOff = 'Mom'; // variable is always momentary actuation
  }

  // Check for multi-stage
  if (a.includes('2-stage')) stages = '2 Stage';
  if (a.includes('3-stage')) stages = '3 Stage';

  // Check for momentary/maintained
  if (a.includes('maintained') && a.includes('momentary')) {
    onOff = 'Mom/Main';
  } else if (a.includes('momentary') && !linear) {
    onOff = 'Mom';
  } else if (a.includes('maintained') && !linear) {
    onOff = 'Main';
  }

  // Default to Mom if nothing matched
  if (!onOff && !linear) onOff = 'Mom';

  return { onOff, linear, stages };
}

// --- Map switch_type to technology flags ---
function deriveTechFlags(switchType) {
  if (!switchType) return { wireless: null, pneumatic: null };

  const st = switchType.toLowerCase();
  if (st.includes('wireless')) return { wireless: 'Yes', pneumatic: null };
  if (st.includes('air') || st.includes('pneumatic')) return { wireless: null, pneumatic: 'Yes' };
  return { wireless: null, pneumatic: null };
}

// --- Map switch_connections to Connection field ---
function deriveConnection(conn) {
  if (!conn) return null;
  const c = conn.toLowerCase();

  // Return the primary connection type
  if (c.includes('screw')) return 'Screw Terminals';
  if (c.includes('quick-connect') && c.includes('solder')) return 'Solder Terminals + Quick-connect';
  if (c.includes('quick-connect')) return 'Connector';
  if (c.includes('solder') && c.includes('pre-wired')) return 'Flying Leads';
  if (c.includes('solder')) return 'Solder Terminals';
  if (c.includes('pre-wired') && c.includes('wire-nuts')) return 'Wire-nuts';
  if (c.includes('pre-wired')) return 'Flying Leads';
  if (c.includes('wire-nuts')) return 'Wire-nuts';
  return conn; // pass through if unrecognized
}

// --- Map guards to Guard field ---
function deriveGuard(guard) {
  if (!guard) return null;
  const g = guard.toLowerCase();

  if (g.includes('no guard') || g.includes('no shield')) return null;
  if (g.includes('full twin')) return 'Full';
  if (g.includes('full shield') || g.includes('full guard')) return 'Full';
  if (g.includes('oversized') || g.includes('extra oversized')) return 'Full';
  if (g.includes('ox shield') || g.includes('gated')) return 'Standard';
  if (g.includes('o shield')) return 'Standard';
  if (g.includes('guarded')) return 'Standard';
  if (g.includes('vinyl cover')) return 'Standard';
  if (g.includes('optional')) return null; // optional guards listed as text
  return 'Standard';
}

// --- Extract IP rating from description ---
function deriveIP(description) {
  if (!description) return null;
  // Priority: IP68 > IP56 > IP41 > IP20 > IP10 > IPXX
  if (description.includes('IP68')) return 'IP68';
  if (description.includes('IP65')) return 'IP56'; // close enough
  if (description.includes('IP56')) return 'IP56';
  if (description.includes('IP41')) return 'IP41';
  if (description.includes('IP21')) return 'IP20';
  if (description.includes('IP20')) return 'IP20';
  if (description.includes('IP10')) return 'IP10';
  if (description.includes('IPXX') || description.includes('IP00')) return 'IPXX';
  return null;
}

// --- Derive duty from material and series ---
function deriveDuty(material, series) {
  const m = (material || '').toLowerCase();
  const s = (series || '').toLowerCase();

  // Heavy: cast iron, explosion proof
  if (m.includes('cast iron') || s.includes('explosion proof')) return 'heavy';

  // Medium: cast aluminum, cast zinc, formed steel, stainless steel
  if (m.includes('cast aluminum') || m.includes('aluminum die cast') ||
      m.includes('cast zinc') || m.includes('formed steel') ||
      m.includes('stainless steel')) return 'medium';

  // Light: polymeric, plastic, vinyl, chrome cover
  if (m.includes('polymeric') || m.includes('plastic') ||
      m.includes('vinyl') || m.includes('chrome')) return 'light';

  // Fallback by series
  if (s.includes('hercules') || s.includes('atlas') || s.includes('clipper')) return 'heavy';
  if (s.includes('anti trip') || s.includes('compact') || s.includes('treadlite')) return 'medium';
  if (s.includes('gem') || s.includes('dolphin') || s.includes('aquiline')) return 'light';

  return 'medium';
}

// --- Derive pedal count from title ---
function derivePedalCount(title) {
  const t = (title || '').toLowerCase();
  if (t.includes('twin') || t.includes('duo') || t.includes('duplex')) return 2;
  if (t.includes('triple') || t.includes('trio')) return 3;
  return 1;
}

// --- Derive circuit count from circuitries ---
function deriveCircuitCount(circuitries) {
  if (!circuitries) return null;
  const c = circuitries.toUpperCase();
  if (c.includes('TPDT')) return '3';
  if (c.includes('DPDT')) return '2';
  if (c.includes('SPDT') || c.includes('SPST')) return '1';
  return null;
}

// --- Derive applications from series and switch type ---
function deriveApplications(series, switchType) {
  const apps = ['industrial']; // all are industrial by default

  const s = (series || '').toLowerCase();
  const st = (switchType || '').toLowerCase();

  // Medical series
  if (s.includes('gem') || s.includes('aquiline') || s.includes('vanguard')) {
    apps.push('medical');
  }

  // Tattoo series
  if (s.includes('dolphin') || s.includes('slim') || s.includes('junior') ||
      s.includes('premier') || s.includes('deluxe') || s.includes('executive')) {
    apps.push('tattoo');
  }

  return apps;
}

// --- Main transform ---
const rows = [];
let skipped = 0;

for (const product of merged) {
  const series = deriveSeries(product.title);
  const { onOff, linear, stages: derivedStages } = deriveOnOff(product.actions);
  // Use CSV stages as source of truth, fall back to derived
  const stages = csvStagesLookup[product.part_number] || derivedStages;
  const { wireless, pneumatic } = deriveTechFlags(product.switch_type);
  const connection = deriveConnection(product.switch_connections);
  const guard = deriveGuard(product.shields_guards);
  const ip = deriveIP(product.description);
  const duty = deriveDuty(product.housing_materials, series);
  const pedalCount = derivePedalCount(product.title);
  const circuitCount = deriveCircuitCount(product.circuitries);
  const applications = deriveApplications(series, product.switch_type);

  // Derive image URL from product's own URL page ID for 1-to-1 mapping
  const urlMatch = product.url && product.url.match(/\/product\/(\d+)\//);
  const imageUrl = urlMatch
    ? `https://linemaster.com/cdn/images/products/${urlMatch[1]}/${urlMatch[1]}-a-shadow@1200.png`
    : product.primary_image || null;

  const row = {
    series: series,
    Part: product.part_number,
    'Syteline Status': null, // not obsolete
    'On/Off': onOff,
    Wireless: wireless,
    Linear: linear,
    'Pneumatic Flow Control': pneumatic,
    Guard: guard,
    Connection: connection,
    'IP Rating': ip,
    Material: product.housing_materials || null,
    'Number of Pedals': pedalCount,
    Stages: stages,
    Configuration: null,
    'PFC Config': pneumatic ? 'Standard' : null,
    Color: product.housing_colors || null,
    Link: product.url || null,
    description: product.description || `${series} - ${product.part_number}`,
    image_url: imageUrl,
    applications: applications,
    duty: duty,
    features: guard ? 'shield' : null,
    Notes: [
      product.electrical_ratings ? `Ratings: ${product.electrical_ratings}` : '',
      product.circuitries ? `Circuitry: ${product.circuitries}` : '',
      product.cordsets ? `Cordsets: ${product.cordsets}` : '',
      product.cable_entries ? `Cable Entries: ${product.cable_entries}` : '',
    ].filter(Boolean).join('; ') || null,
    'Circuits Controlled': circuitCount,
  };

  rows.push(row);
}

console.log(`Transformed ${rows.length} products into Stock Switches rows`);
console.log(`Skipped: ${skipped}`);

// Validate: show distribution of key fields
const stats = {
  series: {},
  duty: {},
  ip: {},
  technology: {},
  onOff: {},
};
for (const r of rows) {
  stats.series[r.series] = (stats.series[r.series] || 0) + 1;
  stats.duty[r.duty] = (stats.duty[r.duty] || 0) + 1;
  stats.ip[r['IP Rating'] || 'null'] = (stats.ip[r['IP Rating'] || 'null'] || 0) + 1;
  const tech = r.Wireless ? 'wireless' : r['Pneumatic Flow Control'] ? 'pneumatic' : 'electrical';
  stats.technology[tech] = (stats.technology[tech] || 0) + 1;
  stats.onOff[r['On/Off'] || 'null'] = (stats.onOff[r['On/Off'] || 'null'] || 0) + 1;
}

console.log('\n--- Distribution ---');
console.log('Series:', JSON.stringify(stats.series));
console.log('Duty:', JSON.stringify(stats.duty));
console.log('IP:', JSON.stringify(stats.ip));
console.log('Technology:', JSON.stringify(stats.technology));
console.log('On/Off:', JSON.stringify(stats.onOff));

fs.writeFileSync('scripts/output/stock_switches_rows.json', JSON.stringify(rows, null, 2));
console.log('\nWritten to scripts/output/stock_switches_rows.json');
