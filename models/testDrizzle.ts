import { nutritions } from "../db/schema";
import db from "../config/db"; // Make sure db is properly set up with Drizzle ORM

// Assuming you've defined your 'patients' table in a separate file

// async function insertPatient(): Promise<void> {
//   try {
//     // Insert data into the patients table
//     const result = await db.insert(nutritions).values({
//       nName: "لا شئ بالفم",
//       ByUser: 1, // Make sure you have a user with uID = 1 in your 'users' table
//     });

//     console.log("Inserted patient:", result);
//   } catch (error) {
//     console.error("Error inserting patient:", error);
//   }
// }

// insertPatient();

// Uncomment and use this function if you want to fetch the list of patients

import { compare, hash } from "bcrypt";

async function getPatients(password: string): Promise<void> {
  try {
    // Query all patients from the patients table
    const SALT_ROUNDS = 10;

    const result = await hash(password, SALT_ROUNDS);
    const isValidPassword = await compare(password, result);
    console.log("Patients:", result);
    console.log("isValisd:", isValidPassword);
  } catch (error) {
    console.error("Error fetching patients:", error);
  }
}



// export const hashPassword = async (password: string): Promise<string> => {
//   return await hash(password, SALT_ROUNDS);
// };

getPatients("Navy400");
