// src/middlewares/errorMiddleware.js
const errorHandler = (err, req, res, next) => {
  console.error("Error occurred:");
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  console.log(`Status code: ${statusCode}`);

  const errorMessage = err.message || "Internal Server Error";
  console.log(`Error message: ${errorMessage}`);

  const errorStack = process.env.NODE_ENV === "development" ? err.stack : undefined;
  console.log(`Error stack: ${errorStack}`);

  res.status(statusCode).json({
    message: errorMessage,
    stack: errorStack,
  });
};

module.exports = errorHandler;