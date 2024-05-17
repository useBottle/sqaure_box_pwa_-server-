import express, { Request, Response } from "express";
import dotenv from "dotenv";
import axios, { AxiosError } from "axios";

dotenv.config();

const router = express.Router();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await axios.get(process.env.KEYWORDS_URL as string);
    const result = response.data;
    res.status(200).send(result);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      res.status(axiosError.response?.status ?? 500).send();
      console.error("error =", axiosError.response?.status);
    } else {
      res.status(500).send("An unexpected error occurred");
      console.error("Non-axios error occurred", error);
    }
  }
});

export default router;
