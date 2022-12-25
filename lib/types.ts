import { NextApiRequest } from "next";
import { Dispatch, SetStateAction } from "react";

type TCommon = {
  _id: string;
  created_at: string;
  updated_at: string;
};

export type TImage = TCommon & {
  url: string;
};

export type TUser = TCommon & {
  name: string;
  email: string;
  avatar?: TImage;
};

export type TProduct = TCommon & {
  name: string;
  description: string;
  price: number;
  images?: TImage[];
  category: string;
  ratings: number[];
  comments: TComment[];
  stripe_price_id?: string;
};

export type TComment = TCommon & {
  body: string;
  user: TUser;
};

export type TOrder = TCommon & {
  user: TUser;
  items: TOrderItem[];
  ordered: boolean;
};

export type TOrderItem = TCommon & {
  product: TProduct;
  quantity: number;
};

export type TAuthPayload = {
  uid: string;
};

export type TAuthRequest = NextApiRequest & TAuthPayload;

export enum TImageState {
  CHANGE,
  REMOVE,
}

export const TResponse = {
  200: "Request successfull!",
  401: "Request unauthorized!",
  400: "Bad request!",
  500: "Internal server error!",
  404: "Resource not found!",
  422: "Unprocessable information!",
};
export type TStatus = 200 | 401 | 400 | 500 | 404 | 422;

export type TServerResponse = {
  status: TStatus;
  message: string;
  data?: any;
};

export type TGCtx = {
  user: TUser | null;
  cart: TOrder | null;
  setUser: Dispatch<SetStateAction<TUser | null>>;
  setCart: Dispatch<SetStateAction<TOrder | null>>;
};

export const ProductCategories = [
  "All",
  "Electronic Devices",
  "Eatables",
  "Furniture",
  "Movies",
  "Albums",
];
