#!/usr/bin/env node
/**
 * Reads data/catalog.csv and generates data/mockProducts.ts.
 *
 * Run after editing the CSV (e.g. after exporting an updated planilla from
 * a seed store) with `npm run build:catalog`. Never edit mockProducts.ts
 * by hand — it's overwritten on the next run.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.join(__dirname, "..", "data", "catalog.csv");
const OUTPUT_PATH = path.join(__dirname, "..", "data", "mockProducts.ts");

const REQUIRED_COLUMNS = [
  "id",
  "title",
  "category",
  "color",
  "price",
  "sizeAvailable",
  "storeName",
  "address",
  "latitude",
  "longitude",
];
const OPTIONAL_COLUMNS = ["subcategory", "material", "style", "brand", "imageUri"];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.length > 1 || r[0] !== "");
}

function fail(message) {
  console.error(`build-catalog: ${message}`);
  process.exit(1);
}

const csvText = readFileSync(CSV_PATH, "utf8");
const rows = parseCsv(csvText);
if (rows.length < 2) fail("CSV has no data rows");

const header = rows[0];
for (const col of REQUIRED_COLUMNS) {
  if (!header.includes(col)) fail(`missing required column "${col}"`);
}

const seenIds = new Set();
const products = rows.slice(1).map((row, index) => {
  const lineNo = index + 2;
  const record = {};
  header.forEach((col, i) => {
    record[col] = (row[i] ?? "").trim();
  });

  for (const col of REQUIRED_COLUMNS) {
    if (!record[col]) fail(`row ${lineNo}: missing value for "${col}"`);
  }

  if (seenIds.has(record.id)) fail(`row ${lineNo}: duplicate id "${record.id}"`);
  seenIds.add(record.id);

  const price = Number(record.price);
  if (!Number.isFinite(price)) fail(`row ${lineNo}: price "${record.price}" is not a number`);

  const latitude = Number(record.latitude);
  const longitude = Number(record.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    fail(`row ${lineNo}: latitude/longitude must be numbers`);
  }

  const sizeAvailable = record.sizeAvailable
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  if (sizeAvailable.length === 0) fail(`row ${lineNo}: sizeAvailable has no sizes`);

  const product = {
    id: record.id,
    title: record.title,
    category: record.category,
    color: record.color,
    price,
    sizeAvailable,
    storeName: record.storeName,
    address: record.address,
    latitude,
    longitude,
  };

  for (const col of OPTIONAL_COLUMNS) {
    if (record[col]) product[col] = record[col];
  }

  return product;
});

const FIELD_ORDER = [
  "id",
  "title",
  "category",
  "subcategory",
  "color",
  "material",
  "style",
  "brand",
  "price",
  "sizeAvailable",
  "storeName",
  "address",
  "latitude",
  "longitude",
  "imageUri",
];

function serializeProduct(product) {
  const lines = ["  {"];
  for (const key of FIELD_ORDER) {
    if (!(key in product)) continue;
    const value = product[key];
    const serializedValue = JSON.stringify(value, null, 2).replace(/\n/g, "\n    ");
    lines.push(`    ${JSON.stringify(key)}: ${serializedValue},`);
  }
  lines[lines.length - 1] = lines[lines.length - 1].replace(/,$/, "");
  lines.push("  }");
  return lines.join("\n");
}

const header_comment = `/**
 * PrendIA — product catalog.
 *
 * GENERATED FILE — do not edit by hand. Edit data/catalog.csv and run
 * \`npm run build:catalog\` to regenerate this file.
 *
 * Products loaded from a real seed-store planilla carry that store's
 * actual data. Any row still sourced from the original fictitious demo
 * data (Zara, H&M, Renner, etc. used only as recognizable placeholders)
 * is NOT that chain's real inventory — see data/catalog.csv for which
 * rows are which.
 */
import { MockProduct } from "../types";

export const mockProducts: MockProduct[] = [
${products.map(serializeProduct).join(",\n")}
];
`;

writeFileSync(OUTPUT_PATH, header_comment);
console.log(`build-catalog: wrote ${products.length} products to data/mockProducts.ts`);
