import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

type JwtPayload = {
  sub: string;
  email: string;
};

const accessTokenSecret = process.env.JWT_ACCESS_SECRET ?? "";
const accessTokenExpiresIn =
  (process.env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"]) ?? "15m";

if (!accessTokenSecret) {
  throw new Error("Missing JWT_ACCESS_SECRET in environment variables");
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, accessTokenSecret, {
    expiresIn: accessTokenExpiresIn,
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
