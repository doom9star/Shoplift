import axios from "axios";
import { NextApiResponse } from "next";
import nextConnect from "next-connect";
import { TAuthRequest } from "./types";

export const cAxios = axios.create({
  withCredentials: true,
  baseURL: "http://localhost:3000/api",
});

export const NC = () =>
  nextConnect<TAuthRequest, NextApiResponse>({
    onNoMatch: (req, res) => {
      return res
        .status(405)
        .json({ message: `[${req.method}] is not supported!` });
    },
  });
