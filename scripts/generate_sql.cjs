/**
 * Generate SQL INSERT statements from stock_switches_rows.json
 * for execution via Supabase MCP execute_sql.
 */
const fs = require('fs');
const rows = JSON.parse(fs.readFileSync('scripts/output/stock_switches_rows.json', 'utf-8'));

const BATCH_SIZE = 25;

function escapeSQL(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  if (Array.isArray(val)) {
    // PostgreSQL array literal
    return `ARRAY[${val.map(v => `'${String(v).replace(/'/g, "''")}'`).join(',')}]::text[]`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

const columns = [
  'series', 'Part', 'Syteline Status', 'On/Off', 'Wireless', 'Linear',
  'Pneumatic Flow Control', 'Guard', 'Connection', 'IP Rating', 'Material',
  'Number of Pedals', 'Stages', 'Configuration', 'PFC Config', 'Color',
  'Link', 'description', 'image_url', 'applications', 'duty', 'features',
  'Notes', 'Circuits Controlled'
];

const colNames = columns.map(c => `"${c}"`).join(', ');

const batches = [];
for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE);
  const values = batch.map(row => {
    const vals = columns.map(col => {
      let val = row[col];
      // Circuits Controlled is bigint in DB
      if (col === 'Circuits Controlled' && val !== null && val !== undefined) {
        val = parseInt(val) || null;
      }
      return escapeSQL(val);
    });
    return `(${vals.join(', ')})`;
  });

  const sql = `INSERT INTO "Stock Switches" (${colNames}) VALUES\n${values.join(',\n')};`;
  batches.push(sql);
}

// Write batches to individual files for easy copy
for (let i = 0; i < batches.length; i++) {
  fs.writeFileSync(`scripts/output/insert_batch_${i + 1}.sql`, batches[i]);
}

console.log(`Generated ${batches.length} batch SQL files`);
console.log(`Total rows: ${rows.length}`);
