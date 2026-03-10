#!/usr/bin/env python3
"""Generate product descriptions and specs SQL from scraped Linemaster data."""

import json
import re
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)
INPUT_FILE = os.path.join(ROOT_DIR, "linemaster_all_294_products.json")
DESC_SQL_FILE = os.path.join(SCRIPT_DIR, "output", "update_descriptions.sql")
SPECS_SQL_FILE = os.path.join(SCRIPT_DIR, "output", "update_specs.sql")


def extract_headline(purpose: str) -> str:
    """Extract the headline from the purpose field (before 'Features & Benefits')."""
    parts = re.split(r"Features & Benefits", purpose, maxsplit=1)
    headline = parts[0].strip().replace("\n", " ").replace("\t", " ")
    headline = re.sub(r"\s+", " ", headline).strip()
    # Remove trailing bullet separators
    headline = headline.rstrip("•").rstrip().rstrip("•").strip()
    return headline


def build_specs_summary(specs: dict) -> str:
    """Build a short specs summary line from the specs object."""
    parts = []

    switch_type = specs.get("Switch Type", "")
    if switch_type:
        parts.append(switch_type)

    actions = specs.get("Actions", "")
    if actions:
        parts.append(actions)

    circuitries = specs.get("Circuitries", "")
    if circuitries:
        parts.append(circuitries)

    # Join first group with commas, then period
    line1 = ", ".join(parts)

    parts2 = []
    material = specs.get("Housing Materials", "")
    if material:
        parts2.append(material)

    ratings = specs.get("Electrical Ratings", "")
    if ratings:
        # Shorten if too long
        if len(ratings) > 60:
            ratings = ratings[:60].rsplit(",", 1)[0]
        parts2.append(ratings)

    line2 = ". ".join(parts2)

    if line1 and line2:
        return f"{line1}. {line2}."
    elif line1:
        return f"{line1}."
    elif line2:
        return f"{line2}."
    return ""


def build_description(product: dict) -> str:
    """Build a description from headline + specs summary."""
    headline = extract_headline(product.get("purpose", ""))
    specs_summary = build_specs_summary(product.get("specs", {}))

    if headline and specs_summary:
        return f"{headline}. {specs_summary}"
    elif headline:
        return headline
    elif specs_summary:
        return specs_summary
    return ""


def escape_sql(s: str) -> str:
    """Escape single quotes for SQL strings."""
    return s.replace("'", "''")


def main():
    with open(INPUT_FILE) as f:
        products = json.load(f)

    os.makedirs(os.path.join(SCRIPT_DIR, "output"), exist_ok=True)

    desc_statements = []
    specs_statements = []

    for p in products:
        sku = p.get("sku", "").strip()
        if not sku:
            continue

        # Description
        desc = build_description(p)
        if desc:
            desc_statements.append(
                f"UPDATE \"Stock Switches\" SET description = '{escape_sql(desc)}' "
                f"WHERE \"Part\" = '{escape_sql(sku)}';"
            )

        # Specs JSONB
        specs = p.get("specs", {})
        if specs:
            specs_json = json.dumps(specs)
            specs_statements.append(
                f"UPDATE \"Stock Switches\" SET specs = '{escape_sql(specs_json)}'::jsonb "
                f"WHERE \"Part\" = '{escape_sql(sku)}';"
            )

    # Write description SQL
    with open(DESC_SQL_FILE, "w") as f:
        f.write(f"-- Update descriptions for {len(desc_statements)} products\n")
        f.write("-- Generated from scraped purpose headlines + specs summaries\n\n")
        for stmt in desc_statements:
            f.write(stmt + "\n")

    # Write specs SQL
    with open(SPECS_SQL_FILE, "w") as f:
        f.write(f"-- Update specs JSONB for {len(specs_statements)} products\n")
        f.write("-- Generated from scraped product specifications\n\n")
        for stmt in specs_statements:
            f.write(stmt + "\n")

    print(f"Generated {len(desc_statements)} description UPDATEs -> {DESC_SQL_FILE}")
    print(f"Generated {len(specs_statements)} specs UPDATEs -> {SPECS_SQL_FILE}")

    # Preview a few
    print("\n--- Sample descriptions ---")
    for p in products[:5]:
        sku = p.get("sku", "")
        desc = build_description(p)
        print(f"  {sku}: {desc[:120]}...")


if __name__ == "__main__":
    main()
