const fs = require('fs');
const p1 = JSON.parse(fs.readFileSync('scripts/output/linemaster_products_phase1.json', 'utf-8'));
const p2 = JSON.parse(fs.readFileSync('scripts/output/linemaster_scraped_phase2.json', 'utf-8'));

// Build P1 lookup by part_number
const p1ByPart = {};
for (const v of Object.values(p1)) {
  if (v.part_number) p1ByPart[v.part_number] = v;
}

const merged = [];
const p2Parts = new Set(Object.keys(p2.results));

// Merge P2 specs into P1 base data
for (const [partNum, specs] of Object.entries(p2.results)) {
  const base = p1ByPart[partNum];
  if (!base) {
    console.log('No P1 match for', partNum);
    continue;
  }
  merged.push({
    part_number: base.part_number,
    title: base.title,
    url: base.url,
    price: base.price,
    images: base.images,
    primary_image: base.primary_image,
    description: specs.description,
    switch_type: specs.additionalSpecs?.['Switch Type'] || '',
    actions: specs.additionalSpecs?.['Actions'] || '',
    circuitries: specs.additionalSpecs?.['Circuitries'] || '',
    housing_colors: specs.additionalSpecs?.['Housing Colors'] || '',
    housing_materials: specs.additionalSpecs?.['Housing Materials'] || '',
    switch_connections: specs.additionalSpecs?.['Switch Connections'] || '',
    electrical_ratings: specs.additionalSpecs?.['Electrical Ratings'] || '',
    pneumatic_valves: specs.additionalSpecs?.['Pneumatic Valves'] || '',
    input_output_ports: specs.additionalSpecs?.['Input & Output Ports'] || '',
    shields_guards: specs.additionalSpecs?.['Shields & Guards'] || '',
    cable_entries: specs.additionalSpecs?.['Cable Entries'] || '',
    cordsets: specs.additionalSpecs?.['Cordsets'] || '',
  });
}

// Add P1 entries with no P2 match
let noP2 = 0;
for (const v of Object.values(p1)) {
  if (!p2Parts.has(v.part_number)) {
    merged.push({
      part_number: v.part_number,
      title: v.title,
      url: v.url,
      price: v.price,
      images: v.images,
      primary_image: v.primary_image,
      description: '',
      switch_type: '', actions: '', circuitries: '', housing_colors: '',
      housing_materials: '', switch_connections: '', electrical_ratings: '',
      pneumatic_valves: '', input_output_ports: '', shields_guards: '',
      cable_entries: '', cordsets: '',
    });
    noP2++;
  }
}

console.log(`Merged: ${merged.length} products (${merged.length - noP2} with specs, ${noP2} without)`);
fs.writeFileSync('scripts/output/linemaster_merged.json', JSON.stringify(merged, null, 2));
console.log('Written to scripts/output/linemaster_merged.json');
