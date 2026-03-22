/**
 * clearDb.ts
 * Wipes all collections except the superadmin user.
 * Run: npx ts-node -r dotenv/config scripts/clearDb.ts dotenv_config_path=.env.development
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.development") });

const MONGO_URI = process.env.MONGO_URI!;

async function main() {
  if (!MONGO_URI) {
    console.error("❌  MONGO_URI not set");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db!;
  console.log(`✅  Connected to: ${db.databaseName}`);

  // Keep only the superadmin user
  const users = db.collection("users");
  const superadmin = await users.findOne({ role: "superadmin" });

  if (!superadmin) {
    console.warn("⚠️  No superadmin found — aborting to be safe.");
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`🔒  Keeping superadmin: ${superadmin.email}`);

  // Delete all users except superadmin
  const { deletedCount: usersDeleted } = await users.deleteMany({ _id: { $ne: superadmin._id } });
  console.log(`🗑️   users: deleted ${usersDeleted}`);

  // Collections to wipe entirely
  const collections = [
    "addresses",
    "carts",
    "categories",
    "counters",
    "coupons",
    "offers",
    "orders",
    "products",
    "reviews",
    "settings",
  ];

  for (const name of collections) {
    try {
      const col = db.collection(name);
      const { deletedCount } = await col.deleteMany({});
      console.log(`🗑️   ${name}: deleted ${deletedCount}`);
    } catch {
      console.log(`⚠️   ${name}: not found / skipped`);
    }
  }

  console.log("\n✅  Database cleared. Superadmin preserved.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌  Error:", err.message);
  process.exit(1);
});
