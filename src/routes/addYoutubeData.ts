import express, { Response, Request } from "express";
import YoutubeData from "../models/youtubeData.js";
import { connectDB } from "../database.js";

const router = express.Router();

router.post("/", async (req: Request, res: Response): Promise<Response | void> => {
  const { currentYoutube, username } = req.body;
  console.log(currentYoutube, username);

  if (!currentYoutube || !username) {
    res.status(400).json("Username or news data is empty.");
  }

  const youtubeData = new YoutubeData({
    category: "youtube",
    username: username,
    videoId: currentYoutube.id.videoId,
    title: currentYoutube.snippet.title,
    timestamp: currentYoutube.snippet.timestamp,
    channelHandle: currentYoutube.snippet.channelHandle,
    channelThumbnail: currentYoutube.snippet.channelThumbnails[0].url,
    channelTitle: currentYoutube.snippet.channelTitle,
  });

  try {
    await connectDB;
    const youtubeDataInfo = await YoutubeData.findOne({ videoId: youtubeData.videoId });

    if (youtubeDataInfo && youtubeDataInfo.videoId) {
      console.log("youtubeData is already exist.");
      return res.status(409).json("YoutubeData is already exist.");
    }
    await youtubeData.save();
    return res.status(200).json("Successfully stored youtube data.");
  } catch (error) {
    console.error("Error occurred", error);
    return res.status(500).send("An unexpected error occurred.");
  }
});

export default router;
