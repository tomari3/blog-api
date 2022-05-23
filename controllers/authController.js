var User = require("../models/User");

const utils = require("../lib/utils");
const { body, validationResult } = require("express-validator");
var async = require("async");

exports.signup = [
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
      roles: { Admin: 5150, Editor: 1984, User: 2001 },
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
    const { accessToken } = utils.issueJWTAccess(foundUser);
    const { refreshToken } = utils.issueJWTRefresh(foundUser);

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
        secure: true,
      });
    }
    foundUser.refreshToken = [...newRefreshTokenArray, refreshToken];
    const { _id, username, roles } = await foundUser.save();
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ _id, username, roles, accessToken });
  } else {
    res.sendStatus(401);
  }
};

exports.logout = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); // no content
  const refreshToken = cookies.jwt;
  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) {
    res.clearCookie("jwt", { httpOnly: true, secure: true });
    return res.sendStatus(204);
  }
  foundUser.refreshToken = foundUser.refreshToken.filter(
    (rt) => rt !== refreshToken
  );
  const result = await foundUser.save();
  // console.log(result)

  res.clearCookie("jwt", { httpOnly: true, secure: true });
  res.sendStatus(204);
};

exports.refresh = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;
  res.clearCookie("jwt", { httpOnly: true, secure: true });
  const foundUser = await User.findOne({ refreshToken }).exec();

  if (!foundUser) {
    jwt.verify(refreshToken, process.env.PRIV_KEY, async (err, decoded) => {
      if (err) return res.sendStatus(403); //Forbidden
      console.log("attempted refresh token reuse!");
      const hackedUser = await User.findOne({
        username: decoded.username,
      }).exec();
      hackedUser.refreshToken = [];
      const result = await hackedUser.save();
      // console.log(result);
    });
    return res.sendStatus(403); //Forbidden
  }
  const newRefreshTokenArray = foundUser.refreshToken.filter(
    (rt) => rt !== refreshToken
  );

  jwt.verify(refreshToken, process.env.PRIV_KEY, async (err, decoded) => {
    if (err) {
      foundUser.refreshToken = [...newRefreshTokenArray];
      const result = await foundUser.save();
      // console.log(result)
    }
    if (err || foundUser.username !== decoded.username)
      return res.sendStatus(403);

    const accessToken = utils.issueJWTAccess(foundUser);
    const refreshToken = utils.issueJWTRefresh(foundUser);
    foundUser.refreshToken = [...newRefreshTokenArray, refreshToken];
    const result = await foundUser.save();
    // console.log(result)
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  });
};

// exports.update_user_get = function (req, res, next) {
//   User.findById(req.params.id).exec(function (err, user) {
//     if (err) {
//       next(err);
//     }
//     if (user == null) {
//       var err = new Error("user not found");
//       err.status = 404;
//       return next(err);
//     }
//     res.json({ user });
//   });
// };
