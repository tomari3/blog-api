var User = require("../models/User");

exports.getAllUsers = async (req, res) => {
  res.json({ msg: "all users route" });
};

exports.getUser = async (req, res) => {
  console.log(req.body.id);
  const user = await User.findOne({ username: req.params.id });
  if (!user) return res.status(404).json({ message: "user not found." });
  res.json(user);
};
