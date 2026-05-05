import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

export type JwtPayload = {
  sub: string;
  email: string;
};

const accessTokenSecret = process.env.JWT_ACCESS_SECRET ?? "";
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET ?? "";
const accessTokenExpiresIn =
  (process.env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"]) ?? "15m";
const refreshTokenExpiresIn =
  (process.env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"]) ?? "7d";

if (!accessTokenSecret) {
  throw new Error("Missing JWT_ACCESS_SECRET in environment variables");
}
if (!refreshTokenSecret) {
  throw new Error("Missing JWT_REFRESH_SECRET in environment variables");
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, accessTokenSecret, {
    expiresIn: accessTokenExpiresIn,
  });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, refreshTokenSecret, {
    expiresIn: refreshTokenExpiresIn,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, accessTokenSecret);

  if (typeof decoded === "string") {
    throw new Error("Invalid token payload");
  }

  return {
    sub: decoded.sub as string,
    email: decoded.email as string,
  };
}

export function verifyRefreshToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, refreshTokenSecret);

  if (typeof decoded === "string") {
    throw new Error("Invalid token payload");
  }

  return {
    sub: decoded.sub as string,
    email: decoded.email as string,
  };
}
