const authService = require("./auth.service");

const asyncHandler = require("../../utils/asyncHandler");
const messages = require("../../utils/messages");

exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  return res.created(result, messages.USER_CREATED);
});

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  return res.success(result, messages.LOGIN_SUCCESS);
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  const result = await authService.refreshToken(refreshToken);

  return res.success(result, "Access token refreshed successfully.");
});

exports.logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.uniqueId);

  return res.success(null, "Logout successful.");
});