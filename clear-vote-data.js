// Drops ONLY candidates + votes, and resets user hasVoted flags.
// Run with:  node --env-file=.env.local clear-vote-data.js
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

(async () => {
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI. Run with --env-file=.env.local");
    process.exit(1);
  }
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    console.log(`Connected to ${db.databaseName}`);

    const candidates = await db.collection("candidates").deleteMany({});
    const votes = await db.collection("votes").deleteMany({});
    const users = await db.collection("users").updateMany(
      { hasVoted: true },
      { $set: { hasVoted: false } }
    );

    console.log(`✅ candidates deleted: ${candidates.deletedCount}`);
    console.log(`✅ votes deleted:      ${votes.deletedCount}`);
    console.log(`✅ users reset:        ${users.modifiedCount}`);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
})();
