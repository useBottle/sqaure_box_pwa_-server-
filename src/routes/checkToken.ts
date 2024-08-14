import jwt, { JwtPayload } from "jsonwebtoken";
import express, { Request, Response } from "express";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  const accessToken = req.cookies.accessToken;

  try {
    if (!accessToken) {
      return res.status(403).json("A token is required for authentication");
    } else if (accessToken) {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;
      jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string);
      return res.status(200).json({ message: "Access token is valid.", username: decoded.username });
    }
  } catch (error) {
    console.error("An unexpected error occurred", error);
    return res.status(401).json("Invalid token");
  }
});

export default router;
