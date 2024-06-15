import mongoose from "mongoose";

const uri: string = process.env.MONGODB_URI;

declare global {
  var _mongoose: Promise<typeof mongoose> | undefined;
}

let connectDB: Promise<typeof mongoose>;

if (process.env.NODE_ENV === "development") {
  if (!globalThis._mongoose) {
    globalThis._mongoose = mongoose.connect(uri, { dbName: "Square_Box" });
  }
  connectDB = globalThis._mongoose;
} else {
  connectDB = mongoose.connect(uri, { dbName: "Square_Box" });
}
export { connectDB };
