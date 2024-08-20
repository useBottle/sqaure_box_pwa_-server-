import bcrypt from "bcrypt";
import express, { Request, Response } from "express";
import { connectDB } from "../database.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.put("/", async (req: Request, res: Response): Promise<Response | void> => {
  const { idValue, passwordValue } = req.body;
  const browserAccessToken = req.cookies.accessToken;
  await connectDB;
  const userInfo = await User.findOne({ id: idValue });
  const isPasswordValid = userInfo && (await bcrypt.compare(passwordValue, userInfo.password));
  const decoded =
    browserAccessToken &&
    (jwt.verify(browserAccessToken, process.env.ACCESS_TOKEN_SECRET as string) as {
      username: string;
    });
  let accessToken;
  let refreshToken;

  try {
    if (!idValue || !passwordValue) {
      return res.status(400).json("ID or password is empty.");
    }

    // 토큰으로 사용자가 입력한 ID 검증.
    if (browserAccessToken && decoded.username === idValue && userInfo && isPasswordValid) {
      return res.status(200).json({ message: "ID and token match." });
    } else if (!userInfo) {
      return res.status(404).json("User not found.");
    } else if (userInfo && !isPasswordValid) {
      return res.status(401).json("Invalid password");
    } else if (!process.env.ACCESS_TOKEN_SECRET) {
      return res.status(500).json("ACCESS_TOKEN_SECRET is not defined");
      // 토큰이 없을 경우 ID, PW 조회 및 인증 후 토큰 생성
    } else if (!browserAccessToken && userInfo && isPasswordValid) {
      accessToken = jwt.sign({ username: idValue }, process.env.ACCESS_TOKEN_SECRET as string, {
        expiresIn: "1h",
      });
      refreshToken = jwt.sign({ username: idValue }, process.env.REFRESH_TOKEN_SECRET as string, {
        expiresIn: "7d",
      });

      const isProduction = process.env.NODE_ENV === "production";

      // 실행 환경에 따라 토큰 보안 설정 변경.
      res.cookie("accessToken", accessToken, {
        httpOnly: isProduction,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 360000,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: isProduction,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res.status(200).json({ message: "Logged in successfully. Token had benn created." });
    }
  } catch (error: unknown) {
    console.error(error);
    return res.status(500).send("An unexpected error occurred");
  }
});

export default router;
