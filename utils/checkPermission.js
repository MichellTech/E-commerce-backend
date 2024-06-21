const CustomError = require("../errors/index");

const checkPermissions = (userDetails, requestId) => {
  if (userDetails.role === "admin") return;
  if (userDetails.id === requestId.toString()) return;
  if (userDetails.id !== requestId.toString()) {
    throw new CustomError.UnauthorizedError("Not authorized");
  }
};

module.exports = checkPermissions;
