const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authenticateUserRole,
} = require("../middleware/authentication");

const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/userControllers");

router.route("/").get(authenticateUser, authenticateUserRole, getAllUsers);
router.route("/showme").get(authenticateUser, showCurrentUser);
router.route("/updateuser").patch(authenticateUser, updateUser);
router.route("/updateuserpassword").patch(authenticateUser, updateUserPassword);
router.route("/:id").get(authenticateUser, getSingleUser);
module.exports = router;
