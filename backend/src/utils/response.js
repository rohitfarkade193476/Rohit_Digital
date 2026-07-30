export const successResponse = (
  res,
  statusCode = 200,
  message,
  data
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined && { data }),
  });
};

export const errorResponse = (
  res,
  statusCode = 500,
  message,
  errors
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors !== undefined && { errors }),
  });
};
