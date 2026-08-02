import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";

import { prisma } from "../../lib/prisma";
import AppError from "../../app/errors/AppError";
import { IReviews } from "./reviews.interface";
import { Role, order_status } from "../../../generated/prisma/enums";

const createReviewsInDB = async (user: JwtPayload, payload: IReviews) => {
  const { productId, rating, comment } = payload;

  const order = await prisma.rentalOrder.findFirst({
    where: {
      customerId: user.id,
      orderStatus: order_status.RETURNED,
      rentalItem: {
        some: {
          productId,
        },
      },
    },
    select: {
      id: true,
    },
  });

  if (!order) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can review only returned products.",
    );
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      userId_productId: {
        userId: user.id,
        productId,
      },
    },
  });

  if (existingReview) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You have already reviewed this product.",
    );
  }

  return prisma.review.create({
    data: {
      userId: user.id,
      productId,
      rating,
      comment,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
          brand: true,
          product_image: true,
        },
      },
    },
  });
};

const getAllReviewsInDB = async () => {
  return prisma.review.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
          brand: true,
          product_image: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });
};

const getSingleReviewInDB = async (id: number) => {
  const review = await prisma.review.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
          brand: true,
          product_image: true,
        },
      },
    },
  });

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found.");
  }

  return review;
};

const updateReviewInDB = async (
  user: JwtPayload,
  id: number,
  payload: Partial<IReviews>,
) => {
  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found.");
  }

  if (review.userId !== user.id) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this review.",
    );
  }

  return prisma.review.update({
    where: { id },
    data: payload,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
          brand: true,
          product_image: true,
        },
      },
    },
  });
};

const deleteReviewInDB = async (user: JwtPayload, id: number) => {
  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found.");
  }

  if (review.userId !== user.id && user.role !== Role.ADMIN) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to delete this review.",
    );
  }

  await prisma.review.delete({
    where: { id },
  });

  return null;
};
const getMyReviewsInDB = async (user: JwtPayload) => {
  return prisma.review.findMany({
    where: {
      userId: user.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
          brand: true,
          product_image: true,
          price_per_day: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });
};

export const reviewsService = {
  createReviewsInDB,
  getAllReviewsInDB,
  getSingleReviewInDB,
  updateReviewInDB,
  deleteReviewInDB,
  getMyReviewsInDB,
};
