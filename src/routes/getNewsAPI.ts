import iconv from "iconv-lite";
import { Readability } from "@mozilla/readability";
import axios from "axios";
import cheerio from "cheerio";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { JSDOM } from "jsdom";
import { Item } from "../types/types.js";

dotenv.config();

const router = express.Router();
const client_id = process.env.NAVER_API_CLIENT_ID;
const client_secret = process.env.NAVER_API_CLIENT_SECRET;
const numberOfArticles = 10;
const wayOfSort = ["sim", "date"];

const stripHtml = (html: string, document: Document): string => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText;
};

const cleanText = (text: string): string | void => {
  try {
    // 빈 줄을 기준으로 텍스트를 분할
    let sections = text.split(/\n\s*\n/);

    // 20자 이하의 섹션 제거
    sections = sections.filter((section) => section.trim().length > 20);

    // 모든 섹션을 하나의 문자열로 병합하고, 두 줄 이상의 빈 줄을 하나로 통일
    const pressedText = sections.join("\n\n").replace(/\n{3,}/g, "\n\n");

    // "다." 문자를 기준으로 줄 바꿈 삽입하여 문단 나누기.
    const addEmptyLine = pressedText.replace(/다\.\s*(?=\S)/g, "다.\n\n");

    // 텍스트 전문의 맨 앞과 뒤의 공백 모두 제거.
    const removeSpaces = addEmptyLine.trim();

    return removeSpaces;
  } catch (error) {
    console.error(error);
  }
};

router.put("/", async (req: Request, res: Response): Promise<void> => {
  const { inputValue } = req.body;

  const query = encodeURI(req.body.inputValue);
  const api_url = `https://openapi.naver.com/v1/search/news.json?query=${query}&display=${numberOfArticles}&start=1&sort=${wayOfSort[0]}`;

  try {
    const response = await axios.get(api_url, {
      headers: {
        "X-Naver-Client-Id": client_id,
        "X-Naver-Client-Secret": client_secret,
      },
    });

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
            let charset = "UTF-8";

            const $ = cheerio.load(response.data.toString("binary"), { decodeEntities: false });

            // <meta charset="..."> 태그에서 charset 추출
            const metaCharset = $("meta[charset]").attr("charset");
            if (metaCharset) {
              charset = metaCharset.toUpperCase();
            } else {
              // <meta http-equiv="Content-Type" content="text/html; charset=..."> 태그에서 charset 추출
              const metaContentType = $('meta[http-equiv="Content-Type"]').attr("content");
              if (metaContentType) {
                const match = metaContentType.match(/charset=([^;]+)/);
                if (match && match[1]) {
                  charset = match[1].toUpperCase();
                }
              }
            }

            // 문서에 지정된 인코딩 방식에 따라 iconv 로 디코딩.
            const dataBuffer = Buffer.from(response.data, "binary");
            const decodedData = iconv.decode(dataBuffer, charset);

            const imagePattern = /\.(jpg|jpeg|gif|png)/i;

            const metaTags = $("meta");

            metaTags.each((_: number, tag: cheerio.Element) => {
              const contentValue = $(tag).attr("content");
              if (contentValue && imagePattern.test(contentValue)) {
                // 이미지 경로를 절대경로로 변경.
                const absoluteUrl = new URL(contentValue, item.originallink).toString();
                imageUrls.push(absoluteUrl);
              }
            });

            const dom = new JSDOM(decodedData);
            const document = dom.window.document;

            const tagToRemove = document.querySelectorAll(
              "h1, h2, h3, h4, h5, h6, .heading, .title, a, span, ul, li, table, figcaption, .reveal-container, .date-repoter, .copy_info, .reaction_btn_wrap, .option_group, .v_topimg_wrap, .divtext2, .inner-subtitle, .news_write_info_group, .photojournal, .article_summary, .summary_area, .article-head-sub, .caption, .writer, .subtitle, .view-info, .cnt_title_wrap2, .aboutPhoto, .expendImageWrap, .precis",
            );
            tagToRemove.forEach((link) => link.parentNode?.removeChild(link));

            const reader = new Readability(document);
            const article = reader.parse();
            const encodedText = article ? cleanText(stripHtml(article.textContent, document)) : null;
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
    console.error("Error occurred", error);
    res.status(500).send("An unexpected error occurred");
  }
});

export default router;
