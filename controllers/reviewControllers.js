const Review = require("../models/Review");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors/index");
const checkPermissions = require("../utils/checkPermission");

const createReview = async (req, res) => {
  const productId = req.body.product;
  const isProductValid = await Product.findOne({ _id: productId });
  if (!isProductValid) {
    throw new CustomError.NotFoundError("Product not found");
  }
  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.id,
  });

  if (alreadySubmitted) {
    throw new CustomError.BadRequestError("Already dropped a review");
  }
  req.body.user = req.user.id;
  const sendReview = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ sendReview });
};

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({})
    .populate({
      path: "product",
      select: "name price category",
    })
    .populate({ path: "user", select: "name email" });
  res.status(StatusCodes.OK).json({ count: reviews.length, reviews });
};
const getSingleReview = async (req, res) => {
  const reviewId = req.params.id;
  const review = await Review.findOne({ _id: reviewId })
    .populate({
      path: "product",
      select: "name price category",
    })
    .populate({ path: "user", select: "name email" });
  if (!review) {
    throw new CustomError.NotFoundError("No review with id found");
  }
  res.status(StatusCodes.OK).json({ review });
};
const updateReview = async (req, res) => {
  const reviewId = req.params.id;
  const { title, rating, comment } = req.body;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomError.NotFoundError("No review with id found");
  }

  checkPermissions(req.user, review.user);
  review.rating = rating;
  review.title = title;
  review.comment = comment;
  await review.save();
  res.status(StatusCodes.OK).json({ review });
};
const deleteReview = async (req, res) => {
  const reviewId = req.params.id;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomError.NotFoundError("No review with id found");
  }
  console.log(req.user);
  checkPermissions(req.user, review.user);
  await review.deleteOne({ _id: reviewId });
  res.status(StatusCodes.OK).json({ msg: "deleted successefully" });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
};
