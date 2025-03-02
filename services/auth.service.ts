import { db } from "../config/db";
import { users } from "../models/user.model";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export class AuthService {
  static async register({ username, email, password }: any) {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      username,
      email,
      password: hashedPassword,
    });

    return { message: "User registered successfully" };
  }

  static async login({ email, password }: any) {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid credentials");
    }

    return {
      message: "Login successful",
      user: { id: user.id, email: user.email },
    };
  }
}
