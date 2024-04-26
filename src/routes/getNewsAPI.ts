import axios from "axios";
import dotenv from "dotenv";
import express, { Request, Response } from "express";

dotenv.config();

const router = express.Router();
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const numberOfArticles = 10;
const wayOfSort = ["sim", "date"];

router.put("/", async (req: Request, res: Response): Promise<void> => {
  const query = encodeURI(req.body.inputValue);
  const api_url = `https://openapi.naver.com/v1/search/news.json?query=${query}&display=${numberOfArticles}&start=1&sort=${wayOfSort[0]}`;

  try {
    const response = await axios.get(api_url, {
      headers: {
        "X-Naver-Client-Id": client_id,
        "X-Naver-Client-Secret": client_secret,
      },
    });
    res.setHeader("Content-Type", "application/json;charset=utf-8");
    console.log(response.data.items);
    res.status(200).send(response.data.items);
  } catch (error) {
    console.error("API is not response.", error);
  }
});

export default router;
