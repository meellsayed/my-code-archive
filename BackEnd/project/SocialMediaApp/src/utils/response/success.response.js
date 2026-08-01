/**
 * @param {{ res: import('express').Response, status?: number, data?: object, message?: string }} params
 */
export const successResponse = ({
  res,
  status = 200,
  data = {},
  message = "Done",
}) => {
  return res.status(status).json({ message, data: { ...data } });
};
