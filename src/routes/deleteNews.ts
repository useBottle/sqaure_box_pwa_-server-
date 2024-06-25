import express, { Request, Response } from "express";
import { connectDB } from "../database.js";
import NewsData from "../models/newsData.js";
import { ObjectId } from "mongodb";

const router = express.Router();

router.put("/", async (req: Request, res: Response) => {
  const { newsUniqueValue } = req.body;
  const newsId = new ObjectId(newsUniqueValue);
  console.log(newsId);

  try {
    await connectDB;
    const deleteResult = await NewsData.deleteOne({ _id: newsId });
    // if (deleteResult.deletedCount)
    console.log(deleteResult);
  } catch (error) {
    console.error("Error occurred", error);
    return res.status(500).send("An unexpected error occurred.");
  }
});

export default router;
