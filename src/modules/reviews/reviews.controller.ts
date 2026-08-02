import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catch.async";

import { sendResponse } from "../../utils/send.response";
import { JwtPayload } from "jsonwebtoken";
import { reviewsService } from "./reviews.service";


const createReviews = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload
  const result = await reviewsService.createReviewsInDB(user, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Review created successfully",
    data: result,
  });
});

const getAllReviews = catchAsync(async (_req: Request, res: Response) => {
  const result = await reviewsService.getAllReviewsInDB();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Reviews retrieved successfully",
    data: result,
  });
});
const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewsService.getMyReviewsInDB(req.user as JwtPayload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "My reviews retrieved successfully",
    data: result,
  });
});

const getSingleReview = catchAsync(async (req: Request, res: Response) => {
const id = Number(req.params.id);
  const result = await reviewsService.getSingleReviewInDB(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review retrieved successfully",
    data: result,
  });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
  const result = await reviewsService.updateReviewInDB(
    user,
    Number(req.params.id),
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review updated successfully",
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
       const user = req.user as JwtPayload;
  const result = await reviewsService.deleteReviewInDB(
    user,
    Number(req.params.id),
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review deleted successfully",
    data: result,
  });
});

export const reviewsController = {
  createReviews,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getMyReviews,
};
