import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { order_status, Role } from "../../../generated/prisma/enums";
import { IReviews } from "./reviews.interface";
import AppError from "../../app/errors/AppError";
import httpStatus from "http-status";

const createReviewInDB = async (
  user: JwtPayload,
  payload: IReviews,
) => {
  if (user.role !== Role.CUSTOMER) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only customers can submit reviews.",
    );
  }

  const product = await prisma.product.findUnique({
    where: {
      id: payload.productId,
    },
  });

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found.");
  }

 
  const rentedProduct = await prisma.rentalOrder.findFirst({
    where: {
      customerId: user.id,
      orderStatus: order_status.RETURNED,
      rentalItem: {
        some: {
          productId: payload.productId,
        },
      },
    },
  });

  if (!rentedProduct) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only review products that you have rented and returned.",
    );
  }

 
  const existingReview = await prisma.review.findFirst({
    where: {
      userId: user.id,
      productId: payload.productId,
    },
  });

  if (existingReview) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You have already reviewed this product.",
    );
  }

  const review = await prisma.review.create({
    data: {
      rating: payload.rating,
      comment: payload.comment,
      userId: user.id,
      productId: payload.productId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return review;
};

export const ReviewsService ={
    createReviewInDB
}