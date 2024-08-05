import bcrypt from "bcrypt";
import express, { Request, Response } from "express";
import { connectDB } from "../database.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.put("/", async (req: Request, res: Response): Promise<Response | void> => {
  const { idValue, passwordValue } = req.body;
  const accessToken = req.cookies.accessToken;

  if (!idValue || !passwordValue) {
    return res.status(400).json("ID or password is empty.");
  }

  // 토큰으로 사용자가 입력한 ID 검증.
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string) as { username: string };
      if (decoded.username === idValue) {
        return res.status(200).json({ message: "ID and token match." });
      }
    } catch (error: unknown) {
      console.error("Invalid or expired token, proceeding with login.");
    }
  }

  try {
    await connectDB;
    const userInfo = await User.findOne({ id: idValue });

    if (!userInfo) {
      return res.status(404).json("User not found.");
    }

    const isPasswordValid = await bcrypt.compare(passwordValue, userInfo.password);
    if (!isPasswordValid) {
      return res.status(401).json("Invalid password");
    }

    if (!process.env.ACCESS_TOKEN_SECRET) {
      return res.status(500).json("ACCESS_TOKEN_SECRET is not defined");
    }

    const accessToken = jwt.sign({ username: idValue }, process.env.ACCESS_TOKEN_SECRET as string, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign({ username: idValue }, process.env.REFRESH_TOKEN_SECRET as string, {
      expiresIn: "7d",
    });

    const isProduction = process.env.NODE_ENV === "production";

    // 실행 환경에 따라 토큰 보안 설정 변경.
    res.cookie("accessToken", accessToken, {
      httpOnly: isProduction,
      secure: isProduction,
      sameSite: isProduction ? "lax" : "none",
      maxAge: 360000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: isProduction,
      secure: isProduction,
      sameSite: isProduction ? "lax" : "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Logged in successfully" });
  } catch (error: unknown) {
    console.error(error);
    return res.status(500).send("An unexpected error occurred");
  }
});

export default router;
