import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const catalogPath = join(rootDir, "data/exercise-catalog.json");

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(join(rootDir, ".env"));
loadEnvFile(join(rootDir, ".env.local"));

const uri = process.env.MONGO_URL ?? "mongodb://localhost:27017";
const dbName = process.env.DB_NAME ?? "test_database";

function catalogDoc(entry, now) {
  const videoUrl = String(entry.video ?? "").trim();
  const tags = [
    entry.type,
    entry.muscle_target,
    entry.difficulty,
    entry.equipment,
  ]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);

  return {
    id: entry.id,
    name: String(entry.name ?? "").trim(),
    video_url: videoUrl,
    tags,
    type: entry.type,
    muscle_target: entry.muscle_target,
    equipment: entry.equipment,
    difficulty: entry.difficulty,
    description: entry.description,
    source: "catalog",
    media_items: videoUrl
      ? [
          {
            id: "legacy",
            type: "video",
            video_url: videoUrl,
          },
        ]
      : [],
    updated_at: now,
  };
}

async function main() {
  const raw = readFileSync(catalogPath, "utf8");
  const catalog = JSON.parse(raw);
  if (!Array.isArray(catalog)) {
    throw new Error("exercise-catalog.json must be an array");
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection("exercise_videos");
  const now = new Date().toISOString();

  const ops = catalog.map((entry) => ({
    updateOne: {
      filter: { id: entry.id },
      update: {
        $set: catalogDoc(entry, now),
        $setOnInsert: { created_at: now },
      },
      upsert: true,
    },
  }));

  if (ops.length > 0) {
    await collection.bulkWrite(ops, { ordered: false });
  }

  await collection.createIndex({ id: 1 }, { unique: true });
  await collection.createIndex({ type: 1 });
  await collection.createIndex({ name: 1 });

  const total = await collection.countDocuments({ source: "catalog" });
  const host = (() => {
    try {
      return new URL(uri.replace("mongodb+srv://", "https://")).hostname;
    } catch {
      return uri;
    }
  })();
  console.log(`Connected to ${host} (${dbName})`);
  console.log(`Seeded ${catalog.length} catalog exercises (${total} catalog docs in DB).`);
  await client.close();
}

main().catch((error) => {
  if (error?.name === "MongoServerSelectionError") {
    console.error(
      "Could not connect to MongoDB. Check MONGO_URL in .env.local and your network/IP allowlist."
    );
  }
  console.error(error);
  process.exit(1);
});
