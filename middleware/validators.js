const mongoose = require('mongoose');

const badRequest = (msg) => {
  const e = new Error(msg);
  e.statusCode = 400;
  return e;
};

// Rejects malformed :id params before hitting the DB
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(badRequest('Invalid product ID'));
  }
  next();
};

// Body for PATCH /:id/stock -> { "change": 10 } or { "change": -3 }
const validateStockChange = (req, res, next) => {
  const { change } = req.body || {};
  if (typeof change !== 'number' || !Number.isInteger(change) || change === 0) {
    return next(badRequest('"change" must be a non-zero integer (positive = restock, negative = sale)'));
  }
  next();
};

// Body must be a non-empty JSON object for create/update
const requireBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(badRequest('Request body cannot be empty'));
  }
  next();
};

module.exports = { validateObjectId, validateStockChange, requireBody };
