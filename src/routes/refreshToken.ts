import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/refreshToken", (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json("Refresh token is required.");
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string);
    const accessToken = jwt.sign({ username: (decoded as any).username }, process.env.ACCESS_TOKEN_SECRET as string, {
      expiresIn: "1h",
    });

    res.cookie("accessToken", accessToken, { httpOnly: true, secure: true, maxAge: 360000 });
    res.json({ message: "Access token refreshed successfully" });
  } catch (err) {
    return res.status(403).json("Invalid refresh token.");
  }
});

export default router;
