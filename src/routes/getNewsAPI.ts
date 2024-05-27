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
const numberOfArticles = 10; // 불러올 뉴스 기사 수량 최댓값 = 100
const wayOfSort = ["sim", "date"]; // 검색 결과 정렬 방법 선택

// HTML 태그를 제거하고 순수한 텍스트로 정제.
const stripHtml = (html: string, document: Document): string => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText;
};

// 네이버 뉴스 검색 API 하루 호출 한도 = 25,000회
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

    // 네이버 뉴스 API 에서 받아온 뉴스 기사들의 데이터를 DOM 의 형태로 처리.
    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    const articleContents = await Promise.all(
      data.map(async (item: Item) => {
        // 날짜 포맷 변경하기
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

        // Open Graph 메타데이터 이미지 크롤링
        const fetchMetaImage = async (): Promise<string | void> => {
          const urlSet = [item.originallink, item.link];
          for (const url of urlSet) {
            try {
              const response = await axios.get(url, { responseType: "arraybuffer" });

              const contentType = response.headers["content-type"];
              let charset = "UTF-8"; // 기본값으로 UTF-8 설정
              if (contentType) {
                const match = contentType.match(/charset=([^;]*)/);
                if (match) {
                  charset = match[1];
                }
              }

              const $ = cheerio.load(response.data);
              const metaTags = $("meta");
              const imagePattern = /\.(jpg|jpeg|gif|png)/i;

              for (const tag of metaTags) {
                const contentValue = $(tag).attr("content");
                // meta 태그의 content 속성의 값 중에 imagePattern 에 해당하는 값을 imageUrls 배열에 푸시.
                if (contentValue && imagePattern.test(contentValue)) {
                  imageUrls.push(contentValue);
                }
              }

              // 해당 뉴스 기사 페이지의 데이터를 DOM 의 형태로 처리.
              const dom = new JSDOM(response.data);
              const document = dom.window.document;

              // 각종 불필요한 태그 제거
              const tagToRemove = document.querySelectorAll(
                "h1, h2, h3, h4, h5, h6, .heading, .title, a, span, ul, li, , table, figcaption, .reveal-container, .date-repoter, .copy_info",
              );
              tagToRemove.forEach((link) => link.parentNode?.removeChild(link));

              // 텍스트의 인코딩 포맷이 EUC-KR 인 경우, UTF-8 로 인코딩.
              function convertEncoding(text: string, charset: string) {
                if (charset.toUpperCase() === "EUC-KR") {
                  return iconv.decode(Buffer.from(text, "binary"), "EUC-KR");
                }
                return text;
              }

              const reader = new Readability(document);
              const article = reader.parse();
              const encodedText = article
                ? stripHtml(convertEncoding(article.textContent, charset || "UTF-8"), document)
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
        return textData;
      }),
    );

    console.log(articleContents);

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
