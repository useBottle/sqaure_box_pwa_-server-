import axios, { AxiosError } from "axios";
import cheerio from "cheerio";
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

    interface Item {
      originallink: string;
      link: string;
    }

    const data = response.data.items;

    const articleContents = await Promise.all(
      data.map(async (item: Item) => {
        // 메타 데이터의 모든 이미지를 가져오려면 활성화하기.
        // const imageUrls: string[] = [];

        // Open Graph 메타데이터 이미지 크롤링
        const fetchMetaImage = async (): Promise<string | void> => {
          const urlSet = [item.originallink, item.link];
          for (const url of urlSet) {
            try {
              const response = await axios.get(url);
              const $ = cheerio.load(response.data);
              const metaTags = $("meta");
              const imagePattern = /\.(jpg|jpeg)/i;

              for (const tag of metaTags) {
                const contentValue = $(tag).attr("content");
                if (contentValue && imagePattern.test(contentValue)) {
                  // 메타 데이터의 모든 이미지를 가져오려면 아래 코드 활성화하고 return 문 주석처리.
                  // imageUrls.push(contentValue);
                  return contentValue;
                }
              }
            } catch (error) {
              console.error(`Error fetching Open Graph image from ${urlSet[0]} or ${urlSet[1]}:`, error);
            }
          }
        };
        const image = await fetchMetaImage();
        console.log(image);
        return {
          ...item,
          // imageUrls,
          image,
        };
      }),
    );

    // 응답 데이터의 타입과 문자 인코딩 방식 명시
    res.setHeader("Content-Type", "application/json;charset=utf-8");
    // console.log(articleContents);
    res.status(200).send(articleContents);
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
