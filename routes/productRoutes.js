const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authenticateUserRole,
} = require("../middleware/authentication");

const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uplodadImage,
} = require("../controllers/productControllers");

router
  .route("/")
  .post([authenticateUser, authenticateUserRole], createProduct)
  .get(getAllProducts);

router
  .route("/uploadimage")
  .post([authenticateUser, authenticateUserRole], uplodadImage);

router
  .route("/:id")
  .get(getSingleProduct)
  .patch([authenticateUser, authenticateUserRole], updateProduct)
  .delete([authenticateUser, authenticateUserRole], deleteProduct);

module.exports = router;
