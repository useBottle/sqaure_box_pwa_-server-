import { Readability } from "@mozilla/readability";
import axios, { AxiosError } from "axios";
import cheerio from "cheerio";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { JSDOM } from "jsdom";
import iconv from "iconv-lite";

dotenv.config();

const router = express.Router();
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const numberOfArticles = 10;
const wayOfSort = ["sim", "date"];

const stripHtml = (html: string, document: Document): string => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText;
};

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
      title: string;
      description: string;
      pubDate: string;
      originallink: string;
      link: string;
      imageUrls: string[];
      articleText: string;
      charset?: string;
    }

    const data = response.data.items;

    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    const articleContents = await Promise.all(
      data.map(async (item: Item) => {
        const dateString = item.pubDate;
        const date = new Date(dateString);

        function formatDate(d: Date): string {
          const year = d.getFullYear();
          const month = d.getMonth() + 1;
          const day = d.getDate();
          const hours = d.getHours();
          const minutes = d.getMinutes();
          const pad = (num: number) => num.toString().padStart(2, "0");
          return `${year}년 ${pad(month)}월 ${pad(day)}일 ${pad(hours)}:${pad(minutes)}`;
        }
        const changedDate = formatDate(date);

        const imageUrls: string[] = [];
        let articleText;
        const title = stripHtml(item.title, document);
        const description = stripHtml(item.description, document);
        const pubDate = stripHtml(changedDate, document);
        const originallink = stripHtml(item.originallink, document);
        const link = stripHtml(item.link, document);

        const fetchData = async (url: string): Promise<string | void> => {
          try {
            const response = await axios.get(url, { responseType: "arraybuffer" });
            const contentType = response.headers["content-type"];
            let charset = "UTF-8";
            if (contentType) {
              const match = contentType.match(/charset=([^;]*)/);
              if (match) {
                charset = match[1];
              }
            }

            const dataBuffer = Buffer.from(response.data, "binary");
            let decodedData = iconv.decode(dataBuffer, charset);

            // 한글이 깨졌는지 확인하는 정규식
            const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;

            if (!koreanRegex.test(decodedData)) {
              decodedData = iconv.decode(dataBuffer, "euc-kr");
            }

            const $ = cheerio.load(decodedData);
            const metaTags = $("meta");
            const imagePattern = /\.(jpg|jpeg|gif|png)/i;

            metaTags.each((_, tag) => {
              const contentValue = $(tag).attr("content");
              if (contentValue && imagePattern.test(contentValue)) {
                imageUrls.push(contentValue);
              }
            });

            const dom = new JSDOM(decodedData);
            const document = dom.window.document;

            const tagToRemove = document.querySelectorAll(
              "h1, h2, h3, h4, h5, h6, .heading, .title, a, span, ul, li, table, figcaption, .reveal-container, .date-repoter, .copy_info",
            );
            tagToRemove.forEach((link) => link.parentNode?.removeChild(link));

            const reader = new Readability(document);
            const article = reader.parse();
            const encodedText = article ? stripHtml(article.textContent, document) : null;
            articleText = encodedText !== null && encodedText;
          } catch (error) {
            console.error(`Error fetching Open Graph image or Text from ${url}:`, error);
          }
        };

        for (const url of [item.originallink, item.link]) {
          await fetchData(url);
          if (imageUrls.length > 0) break;
        }

        const textData = {
          title,
          description,
          pubDate,
          originallink,
          link,
          imageUrls,
          articleText,
          charset: item.charset || "UTF-8",
        };
        return textData;
      }),
    );

    res.setHeader("Content-Type", "application/json;charset=utf-8");
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
