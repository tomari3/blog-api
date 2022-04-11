var Post = require("../models/Post");
var User = require("../models/User");
var Comment = require("../models/Comment");
var Tag = require("../models/Tag");

exports.index = function (req, res, next) {
  res.send("INDEX");
};
// exports.new_post_get
