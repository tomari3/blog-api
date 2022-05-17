var Post = require("../models/Post");
var User = require("../models/User");
var Comment = require("../models/Comment");
var Tag = require("../models/Tag");

const passport = require("passport");
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
