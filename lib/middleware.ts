import { v2 } from "cloudinary";
import { NextApiRequest, NextApiResponse } from "next";
import { Middleware } from "next-connect";
import { TAuthRequest } from "./types";
import { getAuthPayload, getResponse } from "./utils";
import NextCors from "nextjs-cors";

export const cors: Middleware<NextApiRequest, NextApiResponse> = async (
  req,
  res,
  next
) => {
  await NextCors(req, res, {
    origin: process.env.PROXY_SERVER,
    credentials: true,
  });
  next();
};

export const isAuth: Middleware<TAuthRequest, NextApiResponse> = (
  req,
  res,
  next
) => {
  const payload = getAuthPayload(req, res);
  if (!payload) return res.json(getResponse(401));
  req.uid = payload.uid;
  next();
};

export const isNotAuth: Middleware<TAuthRequest, NextApiResponse> = (
  req,
  res,
  next
) => {
  const payload = getAuthPayload(req, res);
  if (payload) return res.json(getResponse(401));
  next();
};

export const addCloudinary: Middleware<TAuthRequest, NextApiResponse> = (
  _,
  __,
  next
) => {
  v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  next();
};
