import express, { Router, Request, Response, Application } from "express";
import { Server as SocketIOServer } from "socket.io";
import axios, { AxiosError } from "axios";
import cheerio from "cheerio";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

export const setupKeywordsRoutes = (app: Application, io: SocketIOServer) => {
  const router = Router();

  router.put("/", async (req: Request, res: Response): Promise<void> => {
    // 데이터 처리 로직
    io.on("connection", (socket) => {
      console.log("New client connected");

      const intervalId = setInterval(async () => {
        try {
          const response = await axios.get(process.env.LIVE_KEYWORDS_URL);
          const data = response.data;
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
      }, 1000);

      socket.on("disconnect", () => {
        console.log("Client disconnected");
        clearInterval(intervalId);
      });
    });
    res.status(200).json({ message: "Data has been transferred." });
  });

  app.use(router);
};

export default router;
