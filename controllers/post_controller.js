var Post = require("../models/Post");
var User = require("../models/User");
var Comment = require("../models/Comment");
var Tag = require("../models/Tag");

const { body, validationResult } = require("express-validator");
var async = require("async");

exports.index = function (req, res, next) {
  async.parallel(
    {
      posts: function (cb) {
        Post.find({ status: "public" })
          .sort({ date: 1 })
          .populate("tag")
          .populate("comment")
          .populate("user")
          .exec(cb);
      },
      tags: function (cb) {
        Tag.find({}).exec(cb);
      },
    },
    function (err, results) {
      if (err) {
        next(err);
      }
      res.json(200, { posts: results.posts, tags: results.tags });
    }
  );
};

exports.new_post_get = function (req, res, next) {
  res.send("NEW POST GET");
};
exports.new_post_post = function (req, res, next) {
  res.send("NEW POST POST");
};

exports.update_post_get = function (req, res, next) {
  res.send("UPDATE POST GET");
};
exports.update_post_post = function (req, res, next) {
  res.send("UPDATE POST POST");
};

exports.delete_post_get = function (req, res, next) {
  res.send("DELETE POST GET");
};
exports.delete_post_post = function (req, res, next) {
  res.send("DELETE POST POST");
};
