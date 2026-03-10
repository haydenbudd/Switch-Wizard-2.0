#!/usr/bin/env bash
# Validate all datasheet PDF URLs from SERIES_DATASHEETS in ProductDetailModal.tsx

urls=(
  "https://linemaster.com/wp-content/uploads/2025/03/hercules_lit-034_rev_d.pdf"
  "https://linemaster.com/wp-content/uploads/2025/03/hercules_anti-trip_lit-033_rev_d_.pdf"
  "https://linemaster.com/wp-content/uploads/2025/03/atlas_lit-054_rev_b.pdf"
  "https://linemaster.com/wp-content/uploads/2025/03/clipper_lit-037_rev_b.pdf"
  "https://linemaster.com/wp-content/uploads/2025/03/classic_iv_lit-010_rev_d.pdf"
  "https://linemaster.com/wp-content/uploads/2025/03/classic_ii_lit-056_rev_b.pdf"
  "https://linemaster.com/wp-content/uploads/2025/03/dolphin_lit-048_rev_b.pdf"
  "https://linemaster.com/wp-content/uploads/2025/03/gem_lit-052_rev_b.pdf"
  "https://linemaster.com/wp-content/uploads/2025/03/varior_lit-006_rev_d.pdf"
  "https://linemaster.com/wp-content/uploads/2025/03/compact_lit-042_rev_c.pdf"
  "https://linemaster.com/wp-content/uploads/2025/03/treadlite_ii_lit-044_rev_b.pdf"
  "https://linemaster.com/wp-content/uploads/2025/03/aquiline_metal_lit-063_rev_b.pdf"
  "https://linemaster.com/wp-content/uploads/2025/03/vanguard_lit-049_rev_b.pdf"
  "https://linemaster.com/wp-content/uploads/2025/03/air_footswitches_lit-025_rev_c.pdf"
  "https://linemaster.com/wp-content/uploads/2025/03/digital_rf_wireless_lit-030_rev_c.pdf"
  "https://linemaster.com/wp-content/uploads/2025/03/explosion_proof_lit-051_rev_b.pdf"
)

total=${#urls[@]}
ok=0

echo "Checking $total datasheet URLs..."
echo ""

for url in "${urls[@]}"; do
  status=$(curl -sI --max-time 10 -o /dev/null -w "%{http_code}" "$url")
  echo "$status  $url"
  if [ "$status" = "200" ]; then
    ok=$((ok + 1))
  fi
done

echo ""
echo "$ok/$total URLs returned 200"
