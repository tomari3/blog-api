const mongoose = require("mongoose");
const router = require("express").Router();
const passport = require("passport");
const utils = require("../../lib/utils");

user_controller = require("../../controllers/user_controller");
const User = require("../../models/User");

router.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    res.status(200).json({
      success: true,
      msg: "You are successfully authenticated to this route!",
    });
  }
);

module.exports = router;
