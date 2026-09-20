// Express 4 doesn't catch rejected promises from async route handlers, so
// wrap every controller with this to forward errors to the error middleware.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = asyncHandler;
