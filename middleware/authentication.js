const CustomError = require("../errors/index");
const { isTokenValid } = require("../utils/jwt");

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new CustomError.UnauthenticatedError("Authentication Invalid");
  }
  try {
    const checkValidity = isTokenValid({ token });

    req.user = {
      name: checkValidity.name,
      email: checkValidity.email,
      role: checkValidity.role,
      id: checkValidity.id,
    };

    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Authentication Invalid");
  }
};

const authenticateUserRole = async (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new CustomError.UnauthorizedError(
      "You dont have access to this route"
    );
  }
  next();
};
module.exports = { authenticateUser, authenticateUserRole };
