import express, { Request, Response } from "express";
import { connectDB } from "../database.js";
import { ObjectId } from "mongodb";
import YoutubeData from "../models/youtubeData.js";

const router = express.Router();

router.put("/", async (req: Request, res: Response) => {
  const { youtubeId } = req.body;
  const idValue = new ObjectId(youtubeId);
  console.log(youtubeId);

  try {
    await connectDB;
    const deleteResult = await YoutubeData.deleteOne({ _id: idValue });
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
