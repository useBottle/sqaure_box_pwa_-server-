import express, { Request, Response } from "express";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const router = express.Router();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await axios.get(process.env.KEYWORDS_API_URL);
    const result = response.data;
    res.status(200).send(result);
  } catch (error: unknown) {
    console.error("Error occurred", error);
    res.status(500).send("An unexpected error occurred");
  }
});

export default router;
