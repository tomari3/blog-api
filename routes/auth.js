const router = require("express").Router();
const passport = require("passport");

authController = require("../controllers/authController");

router.get("/", (req, res) => {
  res.json({ msg: "this is the index of auth" });
});

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

router.post("/signup", authController.signup);

router.post("/login", authController.login);

router.get("/logout", authController.logout);

router.get(
  "/refresh",
  passport.authenticate("cookie", { session: false }),
  authController.refresh
);

module.exports = router;
