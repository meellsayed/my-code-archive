import { asyncHandler } from "../../../utils/error/error.js";

export const profile = asyncHandler(async (req, res, next) => {
  return res.json({ message: "Profile", user: req.user });
});
