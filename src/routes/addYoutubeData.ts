import express, { Response, Request } from "express";

const router = express.Router();

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { currentYoutube, username } = req.body;

  if (currentYoutube && username) {
    console.log(currentYoutube, username);
  }
});

export default router;
