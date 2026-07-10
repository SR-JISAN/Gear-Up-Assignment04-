import { ErrorRequestHandler } from "express";
import AppError from "../errors/AppError";
import handlePrismaError from "../errors/handlePrismaError";

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = "Something went wrong";
  let errorSources = [
    {
      path: "",
      message: "Something went wrong",
    },
  ];

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;

    errorSources = [
      {
        path: "",
        message,
      },
    ];
  } else if (err?.code?.startsWith?.("P")) {
    const simplified = handlePrismaError(err);

    statusCode = simplified.statusCode;
    message = simplified.message;
    errorSources = simplified.errorSources;
  } else if (err instanceof Error) {
    message = err.message;

    errorSources = [
      {
        path: "",
        message,
      },
    ];
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errorSources,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};

export default globalErrorHandler;
