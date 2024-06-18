import jwt from "jsonwebtoken";
import express, { Request, Response } from "express";

const router = express.Router();

router.get("/", async (req: Request, res: Response): Promise<void | Response> => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json("A token is required for authentication");
  }

  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
  } catch (err) {
    return res.status(401).json("Invalid token");
  }
});

export default router;
