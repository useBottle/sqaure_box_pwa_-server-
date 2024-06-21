import express, { Response, Request } from "express";

const router = express.Router();

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { currentNews } = req.body;

  if (currentNews) {
    console.log(currentNews);
  }
});

export default router;
