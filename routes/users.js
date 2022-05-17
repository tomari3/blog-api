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

router.post("/login", (req, res, next) => {
  User.findOne({ username: req.body.username })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ success: false, msg: "no user found" });
      }

      const isValid = utils.validPassword(
        req.body.password,
        user.hash,
        user.salt
      );

      if (isValid) {
        const tokenObject = utils.issueJWT(user);

        res.status(200).json({
          success: true,
          user: { id: user._id, name: user.username },
          accessToken: tokenObject.accessToken,
          refreshToken: tokenObject.refreshToken,
          expiresIn: tokenObject.expires,
        });
      } else {
        res.status(401).json({ success: false, msg: "wrong password" });
      }
    })
    .catch((err) => {
      next(err);
    });
});

router.post("/signup", user_controller.new_user_post);

router.get("/:id/update", user_controller.update_user_get);
// router.post("/:id/update", user_controller.update_user_post);

// router.get("/:id/delete", user_controller.delete_user_get);
// router.post("/:id/delete", user_controller.delete_user_post);

module.exports = router;
