type TPrismaError = {
  statusCode: number;
  message: string;
  errorSources: {
    path: string;
    message: string;
  }[];
};

const handlePrismaError = (error: any): TPrismaError => {
  switch (error.code) {
    case "P2002":
      return {
        statusCode: 409,
        message: "Duplicate value found.",
        errorSources: [
          {
            path: error.meta?.target?.join(", ") || "",
            message: "This value already exists.",
          },
        ],
      };

    case "P2003":
      return {
        statusCode: 400,
        message: "Invalid relation.",
        errorSources: [
          {
            path: "",
            message: "Referenced resource does not exist.",
          },
        ],
      };

    case "P2025":
      return {
        statusCode: 404,
        message: "Resource not found.",
        errorSources: [
          {
            path: "",
            message: "Requested resource was not found.",
          },
        ],
      };

    default:
      return {
        statusCode: 500,
        message: "Database error.",
        errorSources: [
          {
            path: "",
            message: error.message,
          },
        ],
      };
  }
};

export default handlePrismaError;
