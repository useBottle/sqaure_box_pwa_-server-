import express, { Request, Response } from "express";
import { connectDB } from "../database.js";
import User from "../models/user.js";

const router = express.Router();

router.put("/", async (req: Request, res: Response): Promise<Response | void> => {
  const { idValue } = req.body;
  const idPattern = /^[A-Za-z0-9]{6,20}$/;
  const idValid = idPattern.test(idValue);

  try {
    if (!idValue || !idValid) {
      return res.status(500).json("ID is empty or invalid.");
    } else if (idValue && idValid) {
      await connectDB;
      const userInfo = await User.findOne({ id: idValue });
      if (userInfo && userInfo.id === idValue) {
        return res.status(201).json("ID is already exist.");
      }
      return res.status(200).json("ID is not exist.");
    }
  } catch (error: unknown) {
    console.error("Error occurred", error);
    return res.status(500).send("An unexpected error occurred");
  }
});

export default router;
