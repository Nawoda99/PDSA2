const Joi = require("joi");

const networkEdgeSchema = Joi.object({
  from: Joi.string().required(),
  to: Joi.string().required(),
  capacity: Joi.number().integer().min(0).required(),
});

const generateNetworkSchema = Joi.object({
  minCapacity: Joi.number().integer().min(1).max(100).default(5),
  maxCapacity: Joi.number().integer().min(1).max(100).default(15),
});

const submitAnswerSchema = Joi.object({
  playerId: Joi.number().integer().required(),
  playerName: Joi.string().min(3).max(100).required(),
  network: Joi.array().items(networkEdgeSchema).min(1).required(),
  playerAnswer: Joi.number().integer().min(0).required(),
  timeTaken: Joi.number().integer().min(0).optional(),
});

const calculateMaxFlowSchema = Joi.object({
  network: Joi.array().items(networkEdgeSchema).min(1).required(),
});

module.exports = {
  generateNetworkSchema,
  submitAnswerSchema,
  calculateMaxFlowSchema,
};
