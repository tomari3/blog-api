const mongoose = require("mongoose");
const router = require("express").Router();
const passport = require("passport");
const utils = require("../lib/utils");

auth_controller = require("../controllers/auth_controller");
const User = require("../models/User");

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

router.post("/signup", auth_controller.signup);

router.post("/login", auth_controller.login);

router.post("/logout", auth_controller.logout);

router.post("/refresh", auth_controller.refresh);

module.exports = router;
