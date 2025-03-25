import { Elysia } from "elysia";

// Simple response wrapper middleware
export const responseFormatter = new Elysia()
  .onError(({ code, error, set }) => {
    set.status = code === "NOT_FOUND" ? 404 : 400;
    return {
      success: false,
      error: error,
      details: process.env.NODE_ENV === "development" ? error : undefined,
    };
  })
  .onAfterHandle(({ response, set }) => {
    // If response is already formatted, return as-is
    if (response && typeof response === "object" && "success" in response) {
      if (!response) {
        set.status = 400;
      }
      return response;
    }

    // Handle non-object responses
    if (!response || typeof response !== "object") {
      set.status = 500;
      return {
        success: false,
        error: "Invalid response format",
      };
    }

    // Wrap successful responses
    return {
      success: true,
      data: response,
    };
  });
