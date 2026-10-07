export default function errorHandler(err, req, res, next) {
  console.error(`[API Error] ${err.code || 'INTERNAL_ERROR'}: ${err.message}`);

  const status = err.status || 500;
  const response = {
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred.'
    }
  };

  if (err.details) {
    response.error.details = err.details;
  }

  res.status(status).json(response);
}
