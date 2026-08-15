/**
 * @param {{ res: import('express').Response, statusCode?: number, data?: object, message?: string }} params
 */
export const successResponse = ({
  res = {},
  statusCode = 200,
  data = {},
  message = "Done",
}) => {
  return res.status(statusCode).json({ message, data: { ...data } });
};
