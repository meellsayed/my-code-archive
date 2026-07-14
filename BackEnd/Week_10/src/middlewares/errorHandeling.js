export const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const response = {
    message: err.message || "Internal Server Error",
  };
  response.stack = err.stack;

  res.status(statusCode).json(response);
};

export const notFound = (req, res, next) => {
  res.status(404);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  next(error);
};
