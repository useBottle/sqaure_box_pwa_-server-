import express, { Request, Response } from "express";
import { connectDB } from "../database.js";
import NewsData from "../models/newsData.js";
import YoutubeData from "../models/youtubeData.js";
import { findContent } from "../types/types.js";

const router = express.Router();

router.put("/", async (req: Request, res: Response) => {
  const username: string = req.body.username;
  const contents: findContent = {
    newsData: [],
    youtubeData: [],
  };

  try {
    await connectDB;
    const newsResult = await NewsData.find({ category: "news", username: username });
    const youtubeResult = await YoutubeData.find({ category: "youtube", username: username });

    const transformNews = newsResult.map((data) => ({
      ...data.toObject(),
      _id: data._id.toString(),
    }));

    const transformYoutube = youtubeResult.map((data) => ({
      ...data.toObject(),
      _id: data._id.toString(),
    }));

    contents.newsData = transformNews;
    contents.youtubeData = transformYoutube;
    res.status(200).send(contents);
  } catch (error) {
    console.error("Error occurred", error);
    return res.status(500).send("An unexpected error occurred.");
  }
});

export default router;
