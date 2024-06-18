import bcrypt from "bcrypt";
import express, { Request, Response } from "express";
import { connectDB } from "../database.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.put("/", async (req: Request, res: Response): Promise<Response | void> => {
  const { idValue, passwordValue } = req.body;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!idValue || !passwordValue) {
    return res.status(400).json("ID or password is empty.");
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as { username: string };
      if (decoded.username === idValue) {
        return res.status(200).json({ message: "Already logged in with a valid token" });
      }
    } catch (error: unknown) {
      console.error("Invalid or expired token, proceeding with login");
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

    const accessToken = jwt.sign({ username: idValue }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ username: idValue }, process.env.REFRESH_TOKEN_SECRET as string, {
      expiresIn: "7d",
    });

    res.cookie("accessToken", accessToken, { httpOnly: true, secure: true, maxAge: 360000 });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

    return res.status(200).json({ message: "Logged in successfully" });
  } catch (error: unknown) {
    console.error(error);
    return res.status(500).send("An unexpected error occurred");
  }
});

export default router;
