/**
 * @param {{ res: import('express').Response, message?: string, data?: object, status?: number }} [params]
 */
export const successResponse = ({
  res,
  message = "Done",
  data = {},
  status = 200,
} = {}) => {
  return res.status(status).json({ message, data: { ...data } });
};
