var Post = require("../models/Post");
var User = require("../models/User");
var Comment = require("../models/Comment");
var Tag = require("../models/Tag");

const { body, validationResult } = require("express-validator");
var async = require("async");
const { off } = require("../models/Post");

exports.index = function (req, res, next) {
  async.parallel(
    {
      posts: function (cb) {
        Post.find()
          .sort({ date: 1 })
          .populate("tags")
          .populate("comments")
          .populate("likes")
          .populate("saves")
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
      res.json({ posts: results.posts, tags: results.tags });
    }
  );
};

exports.new_post_get = function (req, res, next) {
  async.parallel(
    {
      posts: function (cb) {
        Post.find()
          .limit(10)
          .populate("tags")
          .populate("comments")
          .populate("user")
          .sort({ date: 1 })
          .exec(cb);
      },
      tags: function (cb) {
        Tag.find({}).exec(cb);
      },
      users: function (cb) {
        User.find().limit(10).exec(cb);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.json({
        posts: results.posts,
        tags: results.tags,
        users: results.users,
      });
    }
  );
};

exports.new_post_post = [
  (req, res, next) => {
    if (!(req.body.tags instanceof Array)) {
      if (typeof req.body.tags === "undefined") req.body.tags = [];
      else req.body.tags = new Array(req.body.tags);
    }
    next();
  },
  body("header")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("must provide header"),
  body("content")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("must provide content"),
  body("status").escape().default("private"),
  body("isPinned").escape().default("false"),
  body("tags.*").escape(),

  (req, res, next) => {
    const errors = validationResult(res);

    var post = new Post({
      header: req.body.header,
      content: req.body.content,
      status: req.body.status,
      isPinned: req.body.isPinned,
      tags: req.body.tags,
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          posts: function (cb) {
            Post.find()
              .limit(10)
              .populate("tags")
              .populate("comments")
              .populate("likes")
              .populate("saves")
              .sort({ date: 1 })
              .exec(cb);
          },
          tags: function (cb) {
            Tag.find({}).exec(cb);
          },
          users: function (cb) {
            User.find().limit(10).exec(cb);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }
        }
      );
      for (let i = 0; i < results.tags.length; i += 1) {
        if (post.tags.indexOf(results.tags[i]._id) > -1) {
          results.tags[i].checked = "true";
        }
      }
      return; // todo
    } else {
      post.save(function (err) {
        if (err) {
          return next(err);
        }
        res.json(post);
      });
    }
  },
];

exports.update_post_get = function (req, res, next) {
  async.parallel(
    {
      post: function (cb) {
        Post.findById(req.params.id)
          .limit(10)
          .populate("tags")
          .populate("comments")
          .populate("likes")
          .populate("saves")
          .sort({ date: 1 })
          .exec(cb);
      },
      tags: function (cb) {
        Tag.find({}).exec(cb);
      },
      users: function (cb) {
        User.find().limit(10).exec(cb);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.post == null) {
        var err = new Error("Post no found");
        err.status = 404;
        return next(err);
      }
      for (let all_tags = 0; all_tags < results.tags.length; all_tags += 1) {
        for (
          let post_tags = 0;
          post_tags < results.post.tags.length;
          post_tags += 1
        ) {
          if (
            results.tags[all_tags]._id.toString() ===
            results.post.tags[post_tags]._id.toString()
          ) {
            results.tags[all_tags].checked = "true";
          }
        }
      }
      res.json({
        post: results.post,
        tags: results.tags,
        users: results.users,
      });
    }
  );
};
exports.update_post_post = [
  (req, res, next) => {
    if (!(req.body.tags instanceof Array)) {
      if (typeof req.body.tags === "undefined") req.body.tags = [];
      else req.body.tags = new Array(req.body.tags);
    }
    next();
  },

  body("header")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("must provide header"),
  body("content")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("must provide content"),
  body("status").escape().default("private"),
  body("isPinned").escape().default("false"),
  body("tags.*").escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    var post = new Post({
      header: req.body.header,
      content: req.body.content,
      status: req.body.status,
      isPinned: req.body.isPinned,
      tags: typeof req.body.tags === "undefined" ? [] : req.body.tags,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          posts: function (cb) {
            Post.find()
              .limit(10)
              .populate("tags")
              .populate("comments")
              .populate("likes")
              .populate("saves")
              .sort({ date: 1 })
              .exec(cb);
          },
          tags: function (cb) {
            Tag.find({}).exec(cb);
          },
          users: function (cb) {
            User.find().limit(10).exec(cb);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }
          for (let i = 0; i < results.tags.length; i += 1) {
            if (post.tags.indexOf(results.tags[i]._id) > -1) {
              results.tags[i].checked = "true";
            }
          }
        }
      );
      res.json({
        post: results.post,
        tags: results.tags,
        users: results.users,
        errors: errors.array(),
      });
      return;
    } else {
      Post.findByIdAndUpdate(req.params.id, post, {}, function (err, thePost) {
        if (err) {
          res.json(err);
        }
        res.redirect("/");
      });
    }
  },
];

exports.delete_post_get = function (req, res, next) {
  async.parallel(
    {
      post: function (cb) {
        Post.findById(req.params.id).exec(cb);
      },
      post_comments: function (cb) {
        Comment.find({ parent: req.params.id }).exec(cb);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.post === null) {
        var error = new Error("No Post Found");
        error.status = 404;
        res.json({ error });
      }
      res.json({ post: results.post, post_comments: results.post.comments });
    }
  );
};
exports.delete_post_post = function (req, res, next) {
  async.parallel(
    {
      post: function (cb) {
        Post.findById(req.params.id).exec(cb);
      },
      post_comments: function (cb) {
        Comment.find({ parent: req.params.id }).exec(cb);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      // post_comments.forEach((comment) => {
      //   Comment.findByIdAndRemove(comment.id, function deleteComment(err) {
      //     if (err) {
      //       return next(err);
      //     }
      //   });
      // });
      Post.findByIdAndRemove(req.params.id, function deletePost(err) {
        if (err) {
          return next(err);
        }

        res.json({ msg: "deleted" });
      });
    }
  );
};