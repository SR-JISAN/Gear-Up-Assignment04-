import { Router } from "express";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { reviewsController } from "./reviews.controller";

const router = Router();


router.post("/create", auth(Role.CUSTOMER), reviewsController.createReviews);

router.get("/my-reviews", auth(Role.CUSTOMER), reviewsController.getMyReviews);

router.patch("/:id", auth(Role.CUSTOMER), reviewsController.updateReview);

router.delete("/:id", auth(Role.CUSTOMER), reviewsController.deleteReview);


router.get("/", reviewsController.getAllReviews);

router.get("/:id", reviewsController.getSingleReview);

export const reviewsRoute = router;
