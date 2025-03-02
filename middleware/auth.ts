import { Elysia } from "elysia";
import { verifyToken } from "../utils/security";
// import jwtConfig from "../config/jwt.config";

const authMiddleware = (app) =>
  app.derive(async ({ headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("No token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    return { uID: decoded.uID };
  });