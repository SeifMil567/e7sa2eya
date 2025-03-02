import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const hashPassword = async (password: string): Promise<string> => {
  return await hash(password, SALT_ROUNDS);
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await compare(password, hashedPassword);
};

export const generateToken = (uID: number) => {
  return jwt.sign({ uID }, JWT_SECRET, { expiresIn: "365d" });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as { uID: number };
  } catch (error) {
    throw new Error("Invalid token");
  }
};

export const sqlInjectionCheck = (value: string): boolean => {
  const sqlPattern =
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)|(['"])/gi;
  return sqlPattern.test(value);
};
