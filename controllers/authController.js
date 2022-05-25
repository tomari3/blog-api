var User = require("../models/User");
const passport = require("passport");
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

  async (req, res, next) => {
    const { username, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const duplicate = await User.findOne({ username: username }).exec();
    if (duplicate) return res.sendStatus(409); //Conflict

    try {
      const saltHash = utils.genPassword(password);
      const salt = saltHash.salt;
      const hash = saltHash.hash;

      const user = await User.create({
        email: req.body.email,
        username: req.body.username,
        hash: hash,
        salt: salt,
        roles: { Admin: 5150, Editor: 1984, User: 2001 },
      });
      res.status(201).json({ success: `New user ${user} created!` });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
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
      const oldRefreshToken = cookies.jwt;
      const foundToken = await User.findOne({
        refreshToken: oldRefreshToken,
      }).exec();

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
  // no cookies, logged out.
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  const refreshToken = cookies.jwt;
  // check refresh token in users
  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) {
    res.clearCookie("jwt", {
      path: "/",
      secure: true,
      httpOnly: true,
    });
    return res.sendStatus(204);
  }
  // delete refresh tokens
  foundUser.refreshToken = "";
  const result = await foundUser.save();
  console.log(result);

  res.clearCookie("jwt", {
    path: "/",
    secure: true,
    httpOnly: true,
  });
  res.sendStatus(204);
};

exports.refresh = async (req, res) => {
  const cookies = req.cookies.jwt;
  res.clearCookie("jwt", {
    path: "/",
    secure: true,
    httpOnly: true,
  });
  const foundUser = await User.findOne({ cookies }).exec();

  if (!foundUser) {
    req.user.refreshToken = [];
    console.log("deleted stolen user's tokens");
    const result = await req.user.save();
    return res.sendStatus(403); //Forbidden
  }

  const newRefreshTokenArray = foundUser.refreshToken.filter(
    (rt) => rt !== cookies
  );

  const { accessToken } = utils.issueJWTAccess(foundUser);
  const { refreshToken } = utils.issueJWTRefresh(foundUser);

  foundUser.refreshToken = [...newRefreshTokenArray, refreshToken];
  const { _id, username, roles } = await foundUser.save();

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({ _id, username, roles, accessToken });
};

// exports.refresh = async (req, res) => {
//   const cookies = req.cookies;
//   if (!cookies?.jwt) return res.sendStatus(401);
//   const refreshToken = cookies.jwt;
//   res.clearCookie("jwt", { httpOnly: true, secure: true });
//   const foundUser = await User.findOne({ refreshToken }).exec();

//   if (!foundUser) {
//     jwt.verify(refreshToken, process.env.PRIV_KEY, async (err, decoded) => {
//       if (err) return res.sendStatus(403); //Forbidden
//       console.log("attempted refresh token reuse!");
//       const hackedUser = await User.findOne({
//         username: decoded.username,
//       }).exec();
//       hackedUser.refreshToken = [];
//       const result = await hackedUser.save();
//       // console.log(result);
//     });
//     return res.sendStatus(403); //Forbidden
//   }
//   const newRefreshTokenArray = foundUser.refreshToken.filter(
//     (rt) => rt !== refreshToken
//   );

//   jwt.verify(refreshToken, process.env.PRIV_KEY, async (err, decoded) => {
//     if (err) {
//       foundUser.refreshToken = [...newRefreshTokenArray];
//       const result = await foundUser.save();
//       // console.log(result)
//     }
//     if (err || foundUser.username !== decoded.username)
//       return res.sendStatus(403);

//     const accessToken = utils.issueJWTAccess(foundUser);
//     const refreshToken = utils.issueJWTRefresh(foundUser);
//     foundUser.refreshToken = [...newRefreshTokenArray, refreshToken];
//     const result = await foundUser.save();
//     // console.log(result)
//     res.cookie("jwt", refreshToken, {
//       httpOnly: true,
//       secure: true,
//       maxAge: 24 * 60 * 60 * 1000,
//     });

//     res.json({ accessToken });
//   });
// };

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
