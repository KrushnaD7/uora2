import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayload {
  id: string;
  email: string;
  role: "ADMIN" | "SUB_ADMIN" | "EDITOR" | "REVIEWER" | "AUTHOR";
}

const SIGN_OPTIONS: jwt.SignOptions = {
  algorithm: "HS256",
  issuer: env.JWT_ISSUER,
  audience: env.JWT_AUDIENCE,
  expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
};

const VERIFY_OPTIONS: jwt.VerifyOptions = {
  algorithms: ["HS256"],
  issuer: env.JWT_ISSUER,
  audience: env.JWT_AUDIENCE,
};

export function generateToken(payload: JwtPayload): string {
  return jwt.sign({ ...payload }, env.JWT_SECRET, SIGN_OPTIONS);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET, VERIFY_OPTIONS) as JwtPayload;
}
