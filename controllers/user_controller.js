var User = require("../models/User");

const utils = require("../lib/utils");
const { body, validationResult } = require("express-validator");
var async = require("async");

exports.new_user_post = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 15 })
    .escape()
    .withMessage("username must between 3 and 15 characters"),
  body("email").isEmail().withMessage("must provide an email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const saltHash = utils.genPassword(req.body.password);

    const salt = saltHash.salt;
    const hash = saltHash.hash;

    const user = new User({
      email: req.body.email,
      username: req.body.username,
      hash: hash,
      salt: salt,
    });

    user.save((err) => {
      if (err) {
        return next(err);
      }
      res.json(user);
    });
  },
];

exports.login = async (req, res) => {
  const cookies = req.cookies;
  const { username, password } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  const foundUser = await User.findOne({ username: username }).exec();
  if (!foundUser) return res.sendStatus(401);

  const valid = utils.validPassword(password, foundUser.hash, foundUser.salt);

  if (valid) {
    const { accessToken, refreshToken } = utils.issueJWT(foundUser);

    let newRefreshTokenArray = !cookies?.jwt
      ? foundUser.refreshToken
      : foundUser.refreshToken.filter((rt) => rt !== cookies.jwt);

    if (cookies?.jwt) {
      const refreshToken = cookies.jwt;
      const foundToken = await User.findOne({ refreshToken }).exec();

      if (!foundToken) {
        newRefreshTokenArray = [];
      }

      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
    }
    foundUser.refreshToken = [...newRefreshTokenArray, refreshToken];
    const result = await foundUser.save();

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken });
  } else {
    res.sendStatus(401);
  }
};

exports.update_user_get = function (req, res, next) {
  User.findById(req.params.id).exec(function (err, user) {
    if (err) {
      next(err);
    }
    if (user == null) {
      var err = new Error("user not found");
      err.status = 404;
      return next(err);
    }
    res.json({ user });
  });
};

// exports.update_user_post = [
//   body("username")
//     .trim()
//     .isLength({ min: 3 })
//     .escape()
//     .withMessage("must provide new username"),

//   (req, res, next) => {
//     const errors = validationResult(req);
//     if(!errors.isEmpty()) ;
//   },
// ];
