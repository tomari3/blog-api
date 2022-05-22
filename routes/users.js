const mongoose = require("mongoose");
const router = require("express").Router();
const passport = require("passport");
const utils = require("../lib/utils");

user_controller = require("../controllers/user_controller");
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

router.post("/login", user_controller.login);

router.post("/signup", user_controller.new_user_post);

router.get("/:id/update", user_controller.update_user_get);
// router.post("/:id/update", user_controller.update_user_post);

// router.get("/:id/delete", user_controller.delete_user_get);
// router.post("/:id/delete", user_controller.delete_user_post);

module.exports = router;
