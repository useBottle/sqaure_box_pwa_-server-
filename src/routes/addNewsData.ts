import express, { Response, Request } from "express";
import NewsData from "../models/newsData.js";
import { connectDB } from "../database.js";

const router = express.Router();

router.post("/", async (req: Request, res: Response): Promise<Response | void> => {
  const { bookMarkNewsData, username } = req.body;

  if (!bookMarkNewsData || !username) {
    res.status(400).json("Username or news data is empty.");
  }

  const newsData = new NewsData({
    category: "news",
    username: username,
    title: bookMarkNewsData.title,
    pubDate: bookMarkNewsData.pubDate,
    originallink: bookMarkNewsData.originallink,
    imageUrl: bookMarkNewsData.imageUrl,
    articleText: bookMarkNewsData.articleText,
  });

  try {
    await connectDB;
    const newsDataInfo = await NewsData.findOne({ originallink: newsData.originallink });

    if (newsDataInfo && newsDataInfo.originallink) {
      console.log("NewsData is already exist.");
      return res.status(409).json("NewsData is already exist.");
    }
    await newsData.save();
    return res.status(200).json("Successfully stored news data.");
  } catch (error) {
    console.error("Error occurred", error);
    return res.status(500).send("An unexpected error occurred.");
  }
});

export default router;
