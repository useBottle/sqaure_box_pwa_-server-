import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import getNewsAPI from "./routes/getNewsAPI.js";

dotenv.config();

const app: Application = express();
const port: number = Number(process.env.PORT as string) || 8080;
app.listen(port, (): void => {
  console.log(`Running server on http://localhost:${port}`);
});

app.use(express.json());
app.use(morgan("dev"));

const corsOptions = {
  origin: process.env.REQUEST_DOMAIN as string,
  credentials: true,
};

app.use(cors(corsOptions));
app.use("/getNewsAPI", getNewsAPI);
