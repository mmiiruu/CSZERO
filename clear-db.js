const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

async function clearDb() {
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI. Make sure you run this with --env-file=.env.local");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI);
    
    const dbName = mongoose.connection.db.databaseName;
    console.log(`Connected! Dropping all collections in database => ${dbName}...`);
    
    await mongoose.connection.db.dropDatabase();
    
    console.log("✅ Database cleared successfully! ข้อมูลถูกลบเกลี้ยงแล้วครับ");
    process.exit(0);
  } catch (err) {
    console.error("Error clearing database:", err);
    process.exit(1);
  }
}

clearDb();
