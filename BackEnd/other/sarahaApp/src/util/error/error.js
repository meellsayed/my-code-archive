/**
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<any>} fn
 * @returns {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => void}
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    return fn(req, res, next).catch((error) => {
      return next(new Error(error?.message || String(error), { cause: 500 }));
    });
  };
};

/**
 * @param {Error & {cause?: number}} error
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const globalErrorHandling = (error, req, res, next) => {
  return res.status(error.cause || 400).json({
    message: "App Error",
    error,
    msg: error.message,
    stack: error.stack,
  });
};
