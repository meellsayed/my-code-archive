export const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => {
      //   return res
      //     .status(500)
      //     .json({
      //       message: "Server Error",
      //       error,
      //       errorMessage: error.message,
      //       stack: error.stack,
      //     });

      return next(new Error(error, { cause: 500 }));
    });
  };
};

export const globalErrorHandling = (error, req, res, next) => {
  return res.status(error.cause || 400).json({
    message: "App Error",
    error,
    msg: error.message,
    stack: error.stack,
  });
};
