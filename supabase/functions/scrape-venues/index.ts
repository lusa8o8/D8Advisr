// Supabase Edge Function — scrape-venues
// Fetches named venues in a bounding box from the Overpass API (OpenStreetMap)
// and bulk-upserts them into the raw_venues table.
//
// ┌─ Schema note ────────────────────────────────────────────────────────────┐
// │ The following columns are NOT in the current raw_venues schema.          │
// │ Run the companion migration before deploying to production:              │
// │   ALTER TABLE raw_venues ADD COLUMN IF NOT EXISTS osm_id      TEXT;     │
// │   ALTER TABLE raw_venues ADD COLUMN IF NOT EXISTS raw_phone   TEXT;     │
// │   ALTER TABLE raw_venues ADD COLUMN IF NOT EXISTS raw_website TEXT;     │
// │   ALTER TABLE raw_venues ADD COLUMN IF NOT EXISTS raw_cuisine TEXT;     │
// │   CREATE UNIQUE INDEX IF NOT EXISTS raw_venues_osm_id_idx               │
// │     ON raw_venues (osm_id) WHERE osm_id IS NOT NULL;                    │
// └──────────────────────────────────────────────────────────────────────────┘
//
// Until the migration runs the function falls back to a plain insert
// (stripping the new columns) and warns in the response body.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Constants ────────────────────────────────────────────────────────────────

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const CHUNK_SIZE = 400; // stay well under Supabase payload limits

/** Lusaka, Zambia bounding box (south, west, north, east) */
const LUSAKA_BBOX = {
  south: -15.55,
  west: 28.20,
  north: -15.35,
  east: 28.45,
};

const AMENITY_CATEGORY: Record<string, string> = {
  restaurant: "restaurant",
  bar: "bar",
  cafe: "cafe",
  nightclub: "nightclub",
};

// ─── Types ────────────────────────────────────────────────────────────────────

type BBox = { south: number; west: number; north: number; east: number };

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type RawVenueRow = {
  source: string;
  raw_name: string;
  raw_address: string | null;
  raw_category: string;
  raw_price: string | null;
  raw_hours: string | null;
  raw_latitude: number | null;
  raw_longitude: number | null;
  raw_rating: null;
  raw_data: Record<string, unknown>;
  processed: false;
  ingested_at: string;
};

type RawVenueRowExtended = RawVenueRow & {
  raw_phone: string | null;
  raw_website: string | null;
  raw_cuisine: string | null;
  osm_id: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildOverpassQuery(bbox: BBox): string {
  const amenityPattern = Object.keys(AMENITY_CATEGORY).join("|");
  const b = `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;
  return `
[out:json][timeout:60];
(
  node["amenity"~"^(${amenityPattern})$"](${b});
  way["amenity"~"^(${amenityPattern})$"](${b});
);
out center tags;
  `.trim();
}

function buildAddress(tags: Record<string, string>): string | null {
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
  ].filter(Boolean);
  if (parts.length > 0) return parts.join(" ");
  return tags["addr:full"] ?? null;
}

function mapElement(el: OverpassElement, now: string): RawVenueRowExtended {
  const tags = el.tags ?? {};
  const lat = el.lat ?? el.center?.lat ?? null;
  const lon = el.lon ?? el.center?.lon ?? null;
  const amenity = tags.amenity ?? "";
  const category = AMENITY_CATEGORY[amenity] ?? amenity;

  return {
    source: "overpass",
    raw_name: tags.name!,
    raw_address: buildAddress(tags),
    raw_category: category,
    raw_price: tags.fee ?? null,
    raw_hours: tags.opening_hours ?? null,
    raw_latitude: lat,
    raw_longitude: lon,
    raw_rating: null,
    raw_data: tags as Record<string, unknown>,
    processed: false,
    ingested_at: now,
    // Extended — need migration before these land in the DB
    raw_phone: tags.phone ?? tags["contact:phone"] ?? null,
    raw_website: tags.website ?? tags["contact:website"] ?? null,
    raw_cuisine: tags.cuisine ?? null,
    osm_id: String(el.id),
  };
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  // Allow GET for easy browser/curl testing; POST for parameterised runs
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // ── Parse request body ──────────────────────────────────────────────────
  let bbox: BBox = { ...LUSAKA_BBOX };
  if (req.method === "POST") {
    try {
      const body = await req.json();
      if (body?.bbox && typeof body.bbox === "object") {
        bbox = { ...LUSAKA_BBOX, ...body.bbox };
      }
    } catch {
      // malformed JSON — just use defaults
    }
  }

  // ── Fetch from Overpass ─────────────────────────────────────────────────
  const query = buildOverpassQuery(bbox);
  let overpassRes: Response;
  try {
    overpassRes = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });
  } catch (err) {
    return jsonResponse(502, { error: `Overpass fetch failed: ${String(err)}` });
  }

  if (!overpassRes.ok) {
    const body = await overpassRes.text().catch(() => "");
    return jsonResponse(502, {
      error: `Overpass API returned ${overpassRes.status}`,
      detail: body.slice(0, 300),
    });
  }

  const { elements = [] }: { elements: OverpassElement[] } =
    await overpassRes.json();

  // ── Map elements → rows (named venues only) ─────────────────────────────
  const now = new Date().toISOString();
  const rows: RawVenueRowExtended[] = elements
    .filter((el) => !!el.tags?.name)
    .map((el) => mapElement(el, now));

  const fetched = rows.length;

  if (fetched === 0) {
    return jsonResponse(200, {
      fetched: 0,
      inserted: 0,
      skipped: 0,
      message: "No named venues found in bbox",
    });
  }

  // ── Batch upsert — try extended schema first, fall back if missing ───────
  const chunks = chunkArray(rows, CHUNK_SIZE);
  let inserted = 0;
  let usedFallback = false;
  const MISSING_COLS = ["osm_id", "raw_phone", "raw_website", "raw_cuisine"];

  // Primary attempt: upsert with osm_id unique conflict key
  try {
    for (const chunk of chunks) {
      const { data, error } = await supabase
        .from("raw_venues")
        .upsert(chunk, { onConflict: "osm_id", ignoreDuplicates: true })
        .select("id");

      if (error) throw error;
      inserted += data?.length ?? 0;
    }
  } catch (_primaryErr) {
    // Likely missing columns — strip extended fields and retry with plain insert
    usedFallback = true;
    inserted = 0;

    const baseRows: RawVenueRow[] = rows.map(
      ({ raw_phone: _p, raw_website: _w, raw_cuisine: _c, osm_id: _o, ...rest }) => rest,
    );
    const baseChunks = chunkArray(baseRows, CHUNK_SIZE);

    for (const chunk of baseChunks) {
      const { data, error } = await supabase
        .from("raw_venues")
        .insert(chunk)
        .select("id");

      if (error) {
        return jsonResponse(500, {
          error: error.message,
          hint: `Run the schema migration to add: ${MISSING_COLS.join(", ")}`,
          fetched,
          inserted,
        });
      }
      inserted += data?.length ?? 0;
    }
  }

  const skipped = fetched - inserted;

  return jsonResponse(200, {
    fetched,
    inserted,
    skipped,
    ...(usedFallback && {
      warning: `Extended columns not yet in schema — run migration to add: ${MISSING_COLS.join(", ")}`,
      missingColumns: MISSING_COLS,
    }),
  });
});

// ─── Utility ──────────────────────────────────────────────────────────────────

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
