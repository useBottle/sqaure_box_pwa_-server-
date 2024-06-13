import { MongoClient } from "mongodb";

const uri: string = process.env.MONGODB_URI;

declare global {
  var _mongo: Promise<MongoClient> | undefined;
}

let connectDB: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!globalThis._mongo) {
    globalThis._mongo = new MongoClient(uri).connect();
  }
  connectDB = globalThis._mongo;
} else {
  connectDB = new MongoClient(uri).connect();
}
export { connectDB };
