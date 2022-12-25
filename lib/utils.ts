import Cookies from "cookies";
import { sign, verify } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { TAuthPayload, TResponse, TServerResponse, TStatus } from "./types";

const JWT_SECRET = process.env.JWT_SECRET as string;

export function getAuthPayload(
  req: NextApiRequest,
  res: NextApiResponse
): TAuthPayload | null {
  const cookies = new Cookies(req, res, { secure: true });
  const token = cookies.get("token");

  if (!token) return null;
  try {
    const payload = verify(token, JWT_SECRET);
    return payload as TAuthPayload;
  } catch {
    return null;
  }
}

export function setAuthPayload(payload: TAuthPayload): string {
  const token = sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
}

export function getResponse(status: TStatus, data?: any): TServerResponse {
  return {
    status,
    message: TResponse[status],
    data,
  };
}

export function getDataURI(file: File): Promise<string> {
  return new Promise<string>((res, rej) => {
    const reader = new FileReader();
    reader.onload = ({ target }) => {
      res(target?.result as string);
    };
    reader.onerror = () => {
      rej();
    };
    reader.readAsDataURL(file);
  });
}
