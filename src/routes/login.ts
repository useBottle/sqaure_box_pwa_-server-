import bcrypt from "bcrypt";
import express, { Request, Response } from "express";
import { connectDB } from "../database.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import authenticateJWT, { CustomRequest } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/", async (req: Request, res: Response): Promise<Response | void> => {
  const { idValue, passwordValue } = req.body;

  if (!idValue || !passwordValue) {
    return res.status(400).json("ID or password is empty.");
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

    res.cookie("accessToken", accessToken, { httpOnly: true, secure: true });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });

    return res.status(200).json({ message: "Logged in successfully" });
  } catch (error: unknown) {
    console.error(error);
    return res.status(500).send("An unexpected error occurred");
  }
});

router.get("/check-token", authenticateJWT, (req: Request, res: Response) => {
  const customReq = req as CustomRequest;
  res.json({ message: `Hello, ${customReq.user.username}` });
});

export default router;
