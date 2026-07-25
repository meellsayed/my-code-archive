export const successResponse = ({
  res,
  status = 200,
  data = {},
  message = "Done",
}) => {
  return res.status(status).json({ message, data: { ...data } });
};
