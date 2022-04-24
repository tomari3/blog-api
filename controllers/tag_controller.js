var Post = require("../models/Post");
var User = require("../models/User");
var Comment = require("../models/Comment");
var Tag = require("../models/Tag");

const { body, validationResult } = require("express-validator");
var async = require("async");

exports.tags_posts_get = (req, res, next) => {
  async.waterfall(
    [
      (cb) => {
        Tag.findOne({ name: req.params.id }).exec(cb);
      },
      (tag, cb) => {
        Post.find({ tags: tag }).populate("author").exec(cb);
      },
    ],
    (err, results) => {
      if (err) return next(err);
      if (!results.length) {
        return res.status(404).json({ msg: "not posts found" });
      }
      res.json(results);
    }
  );
};
