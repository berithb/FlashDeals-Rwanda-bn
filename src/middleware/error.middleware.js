export function errorHandler(error, request, response, next) {
  console.error(error);

  if (response.headersSent) {
    return next(error);
  }

  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((item) => item.message);

    return response.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  if (error.code === 11000) {
    const duplicatedField = Object.keys(error.keyValue ?? error.keyPattern ?? {})[0];

    return response.status(409).json({
      success: false,
      message: duplicatedField
        ? `${duplicatedField} is already in use`
        : 'A duplicate value is already in use',
    });
  }

  if (error.name === 'CastError') {
    return response.status(400).json({
      success: false,
      message: 'Invalid resource identifier',
    });
  }

  return response.status(error.statusCode || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'An unexpected server error occurred'
        : error.message || 'Internal server error',
  });
}
