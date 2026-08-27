/**
 * @param {{ res: import('express').Response, statusCode?: number, data?: object,pagination?: object, message?: string,result?:object{data,pagination} }} params
 */
export const successResponse = ({
  res = {},
  statusCode = 200,
  data = {},
  message = "Done",
  pagination = {},
  result = {},
}) => {
  return res
    .status(statusCode)

    .json({
      message,
      data: { ...result.data, ...data },
      pagination: { ...result.pagination },
    });
};
