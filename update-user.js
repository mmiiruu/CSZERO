const { MongoClient } = require('mongodb');

async function main() {
  const uri = "mongodb+srv://CSZERO:110022Work@cszero.qzzelb8.mongodb.net/?appName=CSZERO";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db('test'); // mongoose default DB is usually 'test' unless specified in URI, but let's check
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    // The collection should be 'registrations' based on Mongoose default
    const collection = db.collection('registrations');
    
    const email = "nongamer0123@gmail.com";
    const user = await collection.findOne({ email });
    
    if (!user) {
      console.log("User not found in 'test' db. Let's try 'cszero' db or similar?");
      process.exit(1);
    }
    
    console.log("Found user:", user.name);
    console.log("Old availability:", user.answers.availability);
    
    const newAnswers = { ...user.answers, availability: "full" };
    await collection.updateOne({ email }, { $set: { answers: newAnswers } });
    
    console.log("Successfully updated availability to full");
  } finally {
    await client.close();
  }
}

main().catch(console.error);
