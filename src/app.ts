import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import getNewsAPI from "./routes/getNewsAPI.js";
import getLiveKeywordsAPI from "./routes/getLiveKeywords.js";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { setupKeywordsRoutes } from "./routes/getLiveKeywords.js";

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer);
const port: number = Number(process.env.PORT as string) || 8080;

app.use(express.json());
app.use(morgan("dev"));

setupKeywordsRoutes(app, io);

const corsOptions = {
  origin: process.env.REQUEST_DOMAIN as string,
  credentials: true,
};

app.use(cors(corsOptions));
app.use("/getNewsAPI", getNewsAPI);
app.use("/getLiveKeywordsAPI", getLiveKeywordsAPI);

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default io;
