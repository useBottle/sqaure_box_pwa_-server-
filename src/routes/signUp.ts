import axios, { AxiosError } from "axios";
import express, { Request, Response } from "express";
import { connectDB } from "../database.js";

const router = express.Router();

router.post("/", async (req: Request, res: Response): Promise<Response> => {
  const { idValue, passwordValue } = req.body;

  if (idValue === "") {
    return res.status(500).json("ID is empty.");
  } else if (passwordValue === "") {
    return res.status(500).json("Password is empty.");
  }

  try {
    const db = (await connectDB).db("Square_Board");
    const result = db.collection("users").insertOne(req.body);
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
