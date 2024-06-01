import express, { Request, Response } from "express";
import dotenv from "dotenv";
import axios, { AxiosError } from "axios";

dotenv.config();

const router = express.Router();
const cache: { [key: string]: { data: string[]; timestamp: number } } = {};
const CACHE_DURATION = 60 * 60 * 1000; // 1시간 캐시

router.put("/", async (req: Request, res: Response): Promise<void> => {
  const { inputValue } = req.body;

  // 캐시 체크. 동일한 검색어로 검색하면 캐시데이터 보냄.
  if (cache[inputValue] && Date.now() - cache[inputValue].timestamp < CACHE_DURATION) {
    res.status(200).send(cache[inputValue].data);
    return;
  }

  try {
    const params = new URLSearchParams({
      part: "snippet",
      q: inputValue,
      type: "video",
      order: "relevance",
    });

    const response = await axios.get(`${process.env.YOUTUBE_API_URL}${params.toString()}`);
    const result = response.data;

    // 캐시에 데이터 저장
    cache[inputValue] = {
      data: result,
      timestamp: Date.now(),
    };

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
