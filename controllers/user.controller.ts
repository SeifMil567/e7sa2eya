import db from "../config/db";
import { aliasedTable, eq } from "drizzle-orm";
import { users } from "../db/schema";
import type { CreateUserType } from "../schemas/user.schema";
import { hashPassword } from "../utils/security";

export class UserController {
  // Get all sections
  static async getAllUsers() {
    try {
      const UserTable = aliasedTable(users, "UserTable");
      const allUsers = await db
        .select({
          uID: users.uID,
          uName: users.uName,
          username: users.username,
          byUserID: UserTable.uID,
          byUserName: UserTable.uName,
          sectionId: users.sectionId,
          activ: users.activ,
          adminlevel: users.adminlevel,
        })
        .from(users)
        .innerJoin(UserTable, eq(users.ByUser, UserTable.uID))
        .orderBy(users.uID);
      return { success: true, data: allUsers };
    } catch (error) {
      console.error("Error in getAllUsers:", error); // Log the actual error
      return { success: false, error: "Failed to fetch nutrtions" };
    }
  }

  // Create a new user
  static async createUser(data: CreateUserType, uID: any) {
    try {
      const [newUser] = await db
        .insert(users)
        .values({
          uName: data.uName,
          username: data.username,
          activ: data.activ,
          adminlevel: data.adminlevel,
          sectionId: data.sectionId,
          password: await hashPassword(data.password),
          ByUser: uID,
        })
        .returning({
          uID: users.uID,
          uName: users.uName,
          username: users.username,
          activ: users.activ,
          adminlevel: users.adminlevel,
          sectionId: users.sectionId,
        });

      return { success: true, data: newUser };
    } catch (error) {
      console.error("Error in createuser:", error);
      return { success: false, error: "Failed to create user" };
    }
  }

  // Update a user
  static async updateUser(
    id: number,
    data: Partial<CreateUserType>,
    uID: number
  ) {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({
          ...data,
          ByUser: uID,
          password: data.password
            ? await hashPassword(data.password)
            : undefined,
        })
        .where(eq(users.uID, id))
        .returning({
          uID: users.uID,
          uName: users.uName,
          username: users.username,
          activ: users.activ,
          adminlevel: users.adminlevel,
          sectionId: users.sectionId,
        });

      if (!updatedUser) {
        return { success: false, error: "User not found" };
      }

      return { success: true, data: updatedUser };
    } catch (error) {
      console.error(`Error in updateUser for ID ${id}:`, error);
      return { success: false, error: "Failed to update user" };
    }
  }

  // Delete a user
  static async deleteUser(id: number) {
    try {
      const deleteduser = await db
        .delete(users)
        .where(eq(users.uID, id))
        .returning();

      if (!deleteduser.length) {
        return { success: false, error: "User not found" };
      }

      return { success: true, data: deleteduser[0] };
    } catch (error) {
      console.error(`Error in deleteduser for ID ${id}:`, error); // Log the actual error
      return { success: false, error: "Failed to delete user" };
    }
  }
}
