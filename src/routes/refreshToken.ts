import express, { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json("Refresh token is required.");
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as JwtPayload;
    const accessToken = jwt.sign({ username: decoded.username }, process.env.ACCESS_TOKEN_SECRET as string, {
      expiresIn: "1h",
    });

    const isProduction = process.env.NODE_ENV === "production";

    // 실행 환경에 따라 토큰 보안 설정 변경.
    res.cookie("accessToken", accessToken, {
      httpOnly: isProduction,
      secure: isProduction,
      sameSite: isProduction ? "lax" : "none",
      maxAge: 3600000,
    });
    res.status(200).json({ message: "Access token refreshed successfully", username: decoded.username });
  } catch (error) {
    console.error("An unexpected error occurred");
    return res.status(403).json("Invalid refresh token.");
  }
});

export default router;
