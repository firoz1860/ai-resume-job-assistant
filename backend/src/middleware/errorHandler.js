export function errorHandler(err, req, res, next) {
  console.error(`[Error] ${err.message}`);

  const status = err.status || 500;
  const message = err.isOperational || status < 500 ? err.message : 'An unexpected error occurred. Please try again.';

  res.status(status).json({ success: false, error: message });
}

export function notFound(req, res) {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found.` });
}
