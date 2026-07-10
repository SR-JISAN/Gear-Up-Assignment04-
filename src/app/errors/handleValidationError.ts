import { ZodError } from "zod";

const handleValidationError = (error: ZodError) => {
  return {
    statusCode: 400,
    message: "Validation Error",
    errorSources: error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  };
};

export default handleValidationError;
