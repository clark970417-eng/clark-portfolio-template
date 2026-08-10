type D1 = typeof import("cloudflare:workers").env.DB;

let ready: Promise<void> | null = null;

export function ensureSchema(db: D1) {
  if (!ready) ready = initializeSchema(db).catch((error) => {
    ready = null;
    throw error;
  });
  return ready;
}

async function initializeSchema(db: D1) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS events (
      id text PRIMARY KEY NOT NULL,
      title text NOT NULL,
      slug text NOT NULL UNIQUE,
      category text DEFAULT 'school' NOT NULL,
      status text DEFAULT 'draft' NOT NULL,
      cover_photo_id text,
      cover_x integer DEFAULT 50 NOT NULL,
      cover_y integer DEFAULT 50 NOT NULL,
      position integer DEFAULT 0 NOT NULL,
      created_at integer NOT NULL,
      updated_at integer NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS photos (
      id text PRIMARY KEY NOT NULL,
      event_id text NOT NULL,
      object_key text NOT NULL,
      thumbnail_key text,
      alt text DEFAULT '' NOT NULL,
      width integer,
      height integer,
      position integer DEFAULT 0 NOT NULL,
      created_at integer NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS site_settings (
      key text PRIMARY KEY NOT NULL,
      value text NOT NULL,
      updated_at integer NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS verification_codes (
      id text PRIMARY KEY NOT NULL,
      email text NOT NULL,
      code text NOT NULL,
      expires_at integer NOT NULL,
      verified integer DEFAULT 0 NOT NULL
    )`),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS events_slug_unique ON events (slug)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_events_status_position ON events (status, position)"),
    db.prepare("CREATE INDEX IF NOT EXISTS photos_event_position_idx ON photos (event_id, position)"),
  ]);

  const eventColumns = await db.prepare("PRAGMA table_info(events)").all<{ name: string }>();
  if (!eventColumns.results.some((column) => column.name === "category")) {
    await db.prepare("ALTER TABLE events ADD COLUMN category text DEFAULT 'school' NOT NULL").run();
  }
  if (!eventColumns.results.some((column) => column.name === "cover_photo_id")) {
    await db.prepare("ALTER TABLE events ADD COLUMN cover_photo_id text").run();
  }
  if (!eventColumns.results.some((column) => column.name === "cover_x")) {
    await db.prepare("ALTER TABLE events ADD COLUMN cover_x integer DEFAULT 50 NOT NULL").run();
  }
  if (!eventColumns.results.some((column) => column.name === "cover_y")) {
    await db.prepare("ALTER TABLE events ADD COLUMN cover_y integer DEFAULT 50 NOT NULL").run();
  }

  const photoColumns = await db.prepare("PRAGMA table_info(photos)").all<{ name: string }>();
  if (!photoColumns.results.some((column) => column.name === "thumbnail_key")) {
    await db.prepare("ALTER TABLE photos ADD COLUMN thumbnail_key text").run();
  }

  await db.prepare("PRAGMA optimize").run();
}
