import express, { Request, Response } from "express";
import { connectDB } from "../database.js";
import NewsData from "../models/newsData.js";
import YoutubeData from "../models/youtubeData.js";

const router = express.Router();

router.put("/", async (req: Request, res: Response) => {
  const username: string = req.body.username;
  const contents = {
    newsData: [],
    youtubeData: [],
  };

  try {
    await connectDB;
    contents.newsData = await NewsData.find({ category: "news", username: username });
    contents.youtubeData = await YoutubeData.find({ category: "youtube", username: username });
    res.status(200).send(contents);
  } catch (error) {
    console.error("Error occurred", error);
    return res.status(500).send("An unexpected error occurred.");
  }
});

export default router;
