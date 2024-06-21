const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const createProduct = async (req, res) => {
  if (req.files && req.files.image) {
    const productImage = req.files.image;

    if (!productImage.mimetype.startsWith("image")) {
      throw new CustomError.BadRequestError("Only images are allowed");
    }

    const imageSize = 1024 * 1024;
    if (productImage.size > imageSize) {
      throw new CustomError.BadRequestError(
        "Please upload an image less than 1MB"
      );
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(productImage.tempFilePath, {
      use_filename: true,
      folder: "products",
    });

    // Remove the temp file
    fs.unlinkSync(productImage.tempFilePath);
    req.body.image = result.secure_url;
  }

  req.body.user = req.user.id;

  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};
const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ count: products.length, products });
};
const getSingleProduct = async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findOne({ _id: productId }).populate("reviews");
  if (!product) {
    throw new CustomError.NotFoundError("No product with id exists");
  }

  res.status(StatusCodes.OK).json({ product });
};
const updateProduct = async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    throw new CustomError.NotFoundError("No product with id exists");
  }

  res.status(StatusCodes.OK).json({ product });
};
const deleteProduct = async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findOne({ _id: productId });
  if (!product) {
    throw new CustomError.NotFoundError("No product with id exists");
  }
  await Product.deleteOne({ _id: productId });
  res.status(StatusCodes.OK).json({ msg: "Product deleted successfully" });
};
const uplodadImage = async (req, res) => {
  if (!req.files || !req.files.image) {
    throw new CustomError.BadRequestError("Please select an image");
  }

  const productImage = req.files.image;

  if (!productImage.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Only images are allowed");
  }

  const imageSize = 1024 * 1024;
  if (productImage.size > imageSize) {
    throw new CustomError.BadRequestError(
      "Please upload an image less than 1MB"
    );
  }

  const imagePath = path.join(
    __dirname,
    "../public/uploads",
    productImage.name
  );

  await productImage.mv(imagePath);

  res
    .status(StatusCodes.OK)
    .json({ image: `../public/uploads/${productImage.name}` });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uplodadImage,
};
