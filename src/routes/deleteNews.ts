import express, { Request, Response } from "express";
import { connectDB } from "../database.js";
import NewsData from "../models/newsData.js";
import { ObjectId } from "mongodb";

const router = express.Router();

router.put("/", async (req: Request, res: Response) => {
  const { newsId } = req.body;
  const idValue = new ObjectId(newsId);

  try {
    await connectDB;
    const deleteResult = await NewsData.deleteOne({ _id: idValue });
    if (deleteResult.deletedCount === 1) {
      return res.status(200).json("The news data has been successfully deleted.");
    } else {
      return res.status(404).json("Document not found.");
    }
  } catch (error) {
    console.error("Error occurred", error);
    return res.status(500).send("An unexpected error occurred.");
  }
});

export default router;
