import express, { Router, Request, Response, Application } from "express";
import { Socket, Server as SocketIOServer } from "socket.io";
import axios, { AxiosError } from "axios";
import cheerio from "cheerio";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const fetchKeywordsData = async (socket: Socket) => {
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
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error("Axios error fetching data:", axiosError.message);
      socket.emit("error", `Axios error: ${axiosError.message}`);
    } else {
      const generalError = error as Error;
      console.error("General error fetching data:", generalError.message);
      socket.emit("error", `Error fetching data: ${generalError.message}`);
    }
  }
};

router.get("/", async (req: Request, res: Response): Promise<void> => {
  res.json({ message: "Websocket server is running. Connect via WebSocket to receive live data." });
});

export const setupKeywordsRoutes = (app: Application, io: SocketIOServer) => {
  io.on("connection", (socket) => {
    console.log("New client connected");

    const intervalId = setInterval(() => fetchKeywordsData(socket), 1000);

    socket.on("disconnect", () => {
      console.log("Client disconnected");
      clearInterval(intervalId);
    });
  });

  app.use(router);
};

export default router;
