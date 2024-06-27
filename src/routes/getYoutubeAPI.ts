import express, { Request, Response } from "express";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const router = express.Router();

router.put("/", async (req: Request, res: Response): Promise<void> => {
  const { inputValue } = req.body;

  try {
    const params = new URLSearchParams({
      part: "snippet",
      q: inputValue,
      type: "video",
      order: "relevance",
    });

    const response = await axios.get(`${process.env.YOUTUBE_API_URL}${params.toString()}`);
    const result = response.data;

    res.status(200).send(result);
  } catch (error: unknown) {
    console.error("Error occurred", error);
    res.status(500).send("An unexpected error occurred");
  }
});

export default router;
