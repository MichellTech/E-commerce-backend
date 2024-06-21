const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors/index");
const { attachCookiesToResponse } = require("../utils/jwt");
const checkPermissions = require("../utils/checkPermission");

const getAllUsers = async (req, res) => {
  console.log(req.user);
  const allusers = await User.find({ role: "user" }).select("-password");

  res.status(StatusCodes.OK).json({ users: allusers, count: allusers.length });
};
const getSingleUser = async (req, res) => {
  const singleuser = await User.findOne({ _id: req.params.id }).select(
    "-password"
  );
  if (!singleuser) {
    throw new CustomError.NotFoundError("No user found with this id");
  }
  checkPermissions(req.user, req.params.id);
  res
    .status(StatusCodes.OK)
    .json({ user: singleuser, count: singleuser.length });
};
const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};
const updateUser = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    throw new CustomError.BadRequestError(
      "please provide either name or email"
    );
  }
  const user = await User.findOneAndUpdate(
    { _id: req.user.id },
    { name, email },
    { new: true, runValidators: true }
  );
  const tokenDetails = {
    name: user.name,
    id: user._id,
    email: user.email,
    role: user.role,
  };
  console.log(tokenDetails);
  attachCookiesToResponse({ res, tokenDetails });
  res.status(StatusCodes.OK).json({
    msg: "profile updated successfully",
    user: tokenDetails,
  });
};
const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError(
      "please oldpassword and new password"
    );
  }
  const user = await User.findOne({ _id: req.user.id });
  const isOldPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isOldPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("wrong password provided");
  }
  user.password = newPassword;
  user.save();
  res.status(StatusCodes.OK).json({ msg: "password updated successfully" });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
