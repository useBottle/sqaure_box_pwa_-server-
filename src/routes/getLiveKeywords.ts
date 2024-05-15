import express, { Router, Request, Response, Application } from "express";
import { Server as SocketIOServer } from "socket.io";
import axios, { AxiosError } from "axios";
import cheerio from "cheerio";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

export const setupKeywordsRoutes = (app: Application, io: SocketIOServer) => {
  const router = Router();

  router.get("/", async (req: Request, res: Response): Promise<void> => {
    if (req.method === "GET") {
      // 데이터 처리 로직
      io.on("connection", (socket) => {
        console.log("New client connected");

        const intervalId = setInterval(async () => {
          try {
            const response = await axios.get(process.env.LIVE_KEYWORDS_URL);
            const html = response.data;
            const $ = cheerio.load(html);
            const number = $(".container .realtime-rank .rank-column .rank-layer .rank-num").text();
            const keyword = $(".container .realtime-rank .rank-column .rank-layer .rank-text").text();
            const iconClassName = $(".container .realtime-rank .rank-column .rank-layer .rank-icon").attr("class");
            const data = {
              number: number,
              keyword: keyword,
              iconClassName: iconClassName,
            };
            socket.emit("data", data);
          } catch (error: any) {
            if (axios.isAxiosError(error)) {
              const axiosError = error as AxiosError;
              res.status(axiosError.response?.status ?? 500).send();
              console.error("error =", axiosError.response?.status);
            } else {
              res.status(500).send("An unexpected error occurred");
              console.error("Non-axios error occurred", error);
            }
          }
        }, 60000);

        socket.on("disconnect", () => {
          console.log("Client disconnected");
          clearInterval(intervalId);
        });
      });
    } else {
      res.status(302).json({ message: "This is an incorrect approach." });
    }
    res.status(200).json({ message: "Data has been transferred." });
  });

  app.use(router);
};

export default router;
