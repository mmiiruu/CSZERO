import clientPromise from "@/lib/mongodb-client";

export async function isClubApplicationOpen(): Promise<boolean> {
  const db = (await clientPromise).db();
  const doc = await db.collection("settings").findOne({ _id: "clubBooking" as unknown as never });
  return doc?.open === true;
}
