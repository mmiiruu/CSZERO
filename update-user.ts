import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local" });

import mongoose from "mongoose";
import Registration from "./src/models/Registration";
import dbConnect from "./src/lib/mongodb";

async function main() {
  await dbConnect();

  const email = "nongamer0123@gmail.com";
  const user = await Registration.findOne({ email });

  if (!user) {
    console.error(`User with email ${email} not found.`);
    process.exit(1);
  }

  console.log(`Found user: ${user.name}`);
  console.log(`Old answers:`, user.answers);

  // Update availability to "full"
  const newAnswers = { ...user.answers, availability: "full" };

  await Registration.updateOne({ email }, { $set: { answers: newAnswers } });

  console.log(`Updated availability to "full".`);
  process.exit(0);
}

main().catch(console.error);
