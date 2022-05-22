var User = require("../models/User");

const utils = require("../lib/utils");
const { body, validationResult } = require("express-validator");
var async = require("async");

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
