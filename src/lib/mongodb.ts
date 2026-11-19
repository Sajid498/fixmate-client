
import dns from "node:dns";
import { MongoClient } from "mongodb";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing from the frontend environment.");
}

const options = {
  maxPoolSize: 10,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 15000,
};

declare global {
  var fixmateMongoClientPromise: Promise<MongoClient> | undefined;
}

const client = new MongoClient(uri, options);

const clientPromise =
  globalThis.fixmateMongoClientPromise ?? client.connect();

if (process.env.NODE_ENV !== "production") {
  globalThis.fixmateMongoClientPromise = clientPromise;
}

export async function getDatabase() {
  const connectedClient = await clientPromise;
  return connectedClient.db("fixmate");
}

export { clientPromise };
