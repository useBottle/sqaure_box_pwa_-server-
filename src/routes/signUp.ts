import express, { Request, Response } from "express";
import { connectDB } from "../database.js";
import bcrypt from "bcrypt";
import User from "../models/user.js";

const router = express.Router();

router.post("/", async (req: Request, res: Response): Promise<Response> => {
  const { idValue, passwordValue } = req.body;
  const idPattern = /^[A-Za-z0-9]{6,20}$/;
  const passwordPattern = /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{6,}$/;
  const idValid = idPattern.test(idValue);

  if (!idValue || !idValid) {
    return res.status(400).json("ID is empty or invalid.");
  }

  if (!passwordValue) {
    return res.status(400).json("Password is empty or invalid.");
  }

  const hashedPassword = await bcrypt.hash(passwordValue, 10);

  const user = new User({
    id: idValue,
    password: hashedPassword,
  });

  try {
    await connectDB;
    const userInfo = await User.findOne({ id: user.id });

    userInfo && console.log(userInfo.id);

    if (userInfo && userInfo.id) {
      console.log("ID is already exist.");
      return res.status(409).json("ID is already exist.");
    }
    await user.save();
    return res.status(200).json("Successfully stored user data.");
  } catch (error: unknown) {
    console.error("Error occurred", error);
    return res.status(500).send("An unexpected error occurred.");
  }
});

export default router;
