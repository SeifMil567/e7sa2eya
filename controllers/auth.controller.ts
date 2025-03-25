import db from "../config/db";
import { users } from "../db/schema";
import type { LoginType } from "../schemas/auth.schema";
import {
  comparePasswords,
  generateToken,
  hashPassword,
} from "../utils/security";
import { eq } from "drizzle-orm";

export class AuthController {
  static async login({ username, password }: LoginType) {
    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (!user.length) {
        return { success: false, error: "Invalid credentials" };
      }

      const isValidPassword = await comparePasswords(
        password,
        user[0].password
      );

      if (!isValidPassword) {
        return { success: false, error: "Invalid credentials" };
      }

      const token = generateToken(user[0].uID);

      return {
        success: true,
        data: {
          token,
          user: {
            uID: user[0].uID,
            username: user[0].username,
            uName: user[0].uName,
            adminLevel: user[0].adminlevel,
            sectionId: user[0].sectionId,
          },
        },
      };
    } catch (error) {
      return { success: false, error: "Login failed" };
    }
  }
}
