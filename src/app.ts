import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import getNewsAPI from "./routes/getNewsAPI.js";
import getKeywordsAPI from "./routes/getKeywordsAPI.js";
import getYoutubeAPI from "./routes/getYoutubeAPI.js";
import signUp from "./routes/signUp.js";
import idCheck from "./routes/idCheck.js";
import login from "./routes/login.js";
import refreshToken from "./routes/refreshToken.js";
import checkToken from "./routes/checkToken.js";
import cookieParser from "cookie-parser";
import addNewsData from "./routes/addNewsData.js";
import addYoutubeData from "./routes/addYoutubeData.js";

dotenv.config();

const app: Application = express();
const port: number = Number(process.env.PORT as string) || 8080;

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

const corsOptions = {
  origin: process.env.REQUEST_DOMAIN as string,
  credentials: true,
};

app.use(cors(corsOptions));
app.use("/getNewsAPI", getNewsAPI);
app.use("/getKeywordsAPI", getKeywordsAPI);
app.use("/getYoutubeAPI", getYoutubeAPI);
app.use("/signUp", signUp);
app.use("/idCheck", idCheck);
app.use("/logIn", login);
app.use("/refreshToken", refreshToken);
app.use("/checkToken", checkToken);
app.use("/addNewsData", addNewsData);
app.use("/addYoutubeData", addYoutubeData);

app.listen(port, (): void => {
  console.log(`Running server on http://localhost:${port}`);
});
