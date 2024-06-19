import jwt from "jsonwebtoken";
import express, { Request, Response } from "express";

const router = express.Router();

router.get("/", async (req: Request, res: Response): Promise<void | Response> => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(403).json("A token is required for authentication");
  }

  try {
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string);
  } catch (error) {
    console.error("An unexpected error occurred", error);
    return res.status(401).json("Invalid token");
  }
});

export default router;
