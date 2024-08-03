import jwt from "jsonwebtoken";
import express, { Request, Response } from "express";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken) {
    return res.status(403).json("A token is required for authentication");
  }

  try {
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "The tokens has benn deleted." });
  } catch (error) {
    console.error("An unexpected error occurred", error);
    return res.status(401).json("Invalid token");
  }
});

export default router;
