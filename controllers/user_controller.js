var Post = require("../models/Post");
var User = require("../models/User");
var Comment = require("../models/Comment");
var Tag = require("../models/Tag");

const { body, validationResult } = require("express-validator");
var async = require("async");

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
