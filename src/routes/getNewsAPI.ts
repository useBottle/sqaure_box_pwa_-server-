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
      charset: string;
    }

    const data = response.data.items;

    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    const articleContents = await Promise.all(
      data.map(async (item: Item) => {
        const imageUrls: string[] = [];
        // const articles: string[] = [];
        let articleText;
        const title = stripHtml(item.title, document);
        const description = stripHtml(item.description, document);
        const pubDate = stripHtml(item.pubDate, document);
        const originallink = stripHtml(item.originallink, document);
        const link = stripHtml(item.link, document);

        // Open Graph 메타데이터 이미지 크롤링
        const fetchMetaImage = async (): Promise<string | void> => {
          const urlSet = [item.originallink, item.link];
          for (const url of urlSet) {
            try {
              const response = await axios.get(url, { responseType: "arraybuffer" });

              const $ = cheerio.load(response.data);
              const metaTags = $("meta");
              const imagePattern = /\.(jpg|jpeg)/i;

              for (const tag of metaTags) {
                const contentValue = $(tag).attr("content");
                if (contentValue && imagePattern.test(contentValue)) {
                  imageUrls.push(contentValue);
                }
                if (imageUrls.length === 0) {
                  const ogImage = $('meta[property="og:image"]').attr("content");
                  if (ogImage) {
                    imageUrls.push(ogImage);
                  }
                }
              }

              const dom = new JSDOM(response.data);
              const document = dom.window.document;

              // <a> 태그 제거
              const links = document.querySelectorAll("a");
              links.forEach((link) => link.parentNode?.removeChild(link));

              function convertEncoding(text: string, charset: string) {
                if (charset === "EUC-KR") {
                  return iconv.decode(Buffer.from(text, "binary"), "EUC-KR");
                }
                return text;
              }

              const reader = new Readability(document);
              const article = reader.parse();
              const encodedText = article
                ? stripHtml(convertEncoding(article.textContent, item.charset || "UTF-8"), document)
                : null;
              articleText = encodedText;
            } catch (error) {
              console.error(`Error fetching Open Graph image from ${urlSet[0]} or ${urlSet[1]}:`, error);
            }
          }
        };

        await fetchMetaImage();

        const textData = {
          title: title,
          description: description,
          pubDate: pubDate,
          originallink: originallink,
          link: link,
          imageUrls: imageUrls,
          articleText: articleText,
          charset: item.charset || "UTF-8",
        };
        console.log(textData.articleText);
        return textData;
      }),
    );

    // 응답 데이터의 타입과 문자 인코딩 방식 명시
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
