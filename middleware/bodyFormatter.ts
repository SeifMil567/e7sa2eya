import { Elysia } from "elysia";
import { sqlInjectionCheck } from "../utils/security";

export const bodyFormatter = new Elysia().derive(({ request }) => {
  return {
    formatBody: async () => {
      const body = await request.json();
      // Trim all string values and remove extra spaces
      const formattedBody = Object.keys(body).reduce((acc, key) => {
        if (typeof body[key] === "string") {
          acc[key] = body[key].trim().replace(/\s+/g, " ");
        } else {
          acc[key] = body[key];
        }
        return acc;
      }, {} as Record<string, any>);

      // Check for SQL injection in string values
      Object.values(formattedBody).forEach((value) => {
        if (typeof value === "string" && sqlInjectionCheck(value)) {
          throw new Error("Potential SQL injection detected");
        }
      });

      return formattedBody;
    },
  };
});
