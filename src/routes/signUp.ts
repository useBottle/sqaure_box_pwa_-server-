import axios, { AxiosError } from "axios";
import express, { Request, Response } from "express";
import { connectDB } from "../database.js";
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/", async (req: Request, res: Response): Promise<Response> => {
  const { idValue, passwordValue } = req.body;
  const idPattern = /^[A-Za-z0-9]{6,20}$/;
  const passwordPattern = /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{6,}$/;
  const idValid = idPattern.test(idValue);
  const passwordValid = passwordPattern.test(passwordValue);

  const user = {
    id: "",
    password: "",
  };

  if (idValue && idValid) {
    user.id = idValue;
  } else if (!idValue || !idValid) {
    return res.status(500).json("ID is empty or invalid.");
  }

  if (passwordValue && passwordValid) {
    const hashedPassword = await bcrypt.hash(passwordValue, 10);
    user.password = hashedPassword;
  } else if (!passwordValue || !passwordValid) {
    return res.status(500).json("Password is empty or invalid.");
  }

  try {
    const db = (await connectDB).db("Square_Board");
    const result = db.collection("users").insertOne(user);
    return res.status(200).json(result);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error("error =", axiosError.response?.status);
      return res.status(axiosError.response?.status ?? 500).send();
    } else {
      console.error("Non-axios error occurred", error);
      return res.status(500).send("An unexpected error occurred");
    }
  }
});

export default router;
