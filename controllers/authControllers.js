const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors/index");
const { attachCookiesToResponse } = require("../utils/jwt");

const register = async (req, res) => {
  const { email, name, password } = req.body;
  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError("Email already exists");
  }

  const user = await User.create({ email, name, password });
  const tokenDetails = {
    name: user.name,
    id: user._id,
    email: user.email,
    role: user.role,
  };

  attachCookiesToResponse({ res, tokenDetails });
  res.status(StatusCodes.CREATED).json({ user: tokenDetails });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError("please provide email and password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError("invalid Credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("invalid credentials");
  }

  const tokenDetails = {
    name: user.name,
    id: user._id,
    email: user.email,
    role: user.role,
  };

  attachCookiesToResponse({ res, tokenDetails });
  res.status(StatusCodes.OK).json({ user: tokenDetails });
};
const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "logout successful" });
};

module.exports = {
  register,
  login,
  logout,
};
