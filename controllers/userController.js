var User = require("../models/User");

const utils = require("../lib/utils");
const { body, validationResult } = require("express-validator");
var async = require("async");

exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "user not found." });
  res.json(user);
};
