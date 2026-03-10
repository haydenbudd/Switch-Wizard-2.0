const merged = JSON.parse(require('fs').readFileSync('scripts/output/linemaster_merged.json', 'utf-8'));

// Group by title prefix (before first dash) as series guess
const byPrefix = {};
for (const p of merged) {
  const prefix = (p.title || '').split(/\s*-\s*/)[0].trim();
  if (!byPrefix[prefix]) byPrefix[prefix] = [];
  byPrefix[prefix].push(p.part_number);
}

console.log('Series (by title prefix before dash):');
for (const [k, v] of Object.entries(byPrefix)) {
  console.log(`  ${k}: ${v.length} products`);
}

// Check switch_type distribution
const switchTypes = {};
for (const p of merged) {
  const st = p.switch_type || 'empty';
  switchTypes[st] = (switchTypes[st] || 0) + 1;
}
console.log('\nSwitch types:', switchTypes);

// Check actions distribution
const actionDist = {};
for (const p of merged) {
  const a = p.actions || 'empty';
  actionDist[a] = (actionDist[a] || 0) + 1;
}
console.log('\nActions:', actionDist);

// Check connections
const connDist = {};
for (const p of merged) {
  const c = p.switch_connections || 'empty';
  connDist[c] = (connDist[c] || 0) + 1;
}
console.log('\nConnections:', connDist);

// Check housing_materials
const matDist = {};
for (const p of merged) {
  const m = p.housing_materials || 'empty';
  matDist[m] = (matDist[m] || 0) + 1;
}
console.log('\nMaterials:', matDist);

// Check shields/guards
const guardDist = {};
for (const p of merged) {
  const g = p.shields_guards || 'empty';
  guardDist[g] = (guardDist[g] || 0) + 1;
}
console.log('\nGuards:', guardDist);

// Check IP ratings in descriptions
const ipDist = {};
for (const p of merged) {
  const desc = p.description || '';
  const matches = desc.match(/IP\d+|IPX\d+|IPXX/g);
  const ip = matches ? matches.join(', ') : 'none';
  ipDist[ip] = (ipDist[ip] || 0) + 1;
}
console.log('\nIP ratings from descriptions:', ipDist);

// Check housing_colors
const colorDist = {};
for (const p of merged) {
  const c = p.housing_colors || 'empty';
  colorDist[c] = (colorDist[c] || 0) + 1;
}
console.log('\nColors:', colorDist);

// Check circuitries
const circDist = {};
for (const p of merged) {
  const c = p.circuitries || 'empty';
  circDist[c] = (circDist[c] || 0) + 1;
}
console.log('\nCircuitries:', circDist);
