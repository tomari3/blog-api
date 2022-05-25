const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Tag = require("../models/Tag");

const { body, validationResult } = require("express-validator");
const async = require("async");

exports.getAllPosts = async (req, res) => {
  const posts = await Post.find({})
    .sort({ date: -1 })
    .populate("author", "username")
    .populate("tags");
  if (!posts) return res.status(204).json({ message: "No posts found." });
  res.json(posts);
};

exports.getPost = async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate({
      path: "comments",
      populate: { path: "author", select: "username" },
      populate: {
        path: "subComments",
        select: ["content", "date"],
        populate: { path: "author", select: "username" },
      },
    })
    .populate("author", "username")
    .populate("tags");

  if (!post) return res.status(404).json({ message: "post not found." });
  res.json(post);
};

exports.newPost = async (req, res) => {
  const tags = await Promise.all(
    req.body.tags.split(",").map(async (tag) => {
      tag.trim();
      return await Tag.findOneAndUpdate(
        { name: tag },
        {},
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    })
  );

  body("id").isLength({ min: 1 }).escape().withMessage("must provide user"),
    body("content")
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage("must provide content"),
    body("status").escape().default("private"),
    body("isPinned").escape().default("false"),
    body("tags.*").escape(),
    (errors = validationResult(req));

  if (!errors.isEmpty()) return res.json({ err: errors });
  try {
    let post = await Post.create({
      author: req.body.id,
      content: req.body.content,
      status: req.body.status,
      isPinned: req.body.isPinned,
      tags: tags,
    });
    post = await post.populate([{ path: "author", select: "username" }]);

    res.status(201).json(post);
  } catch (err) {
    console.error(err);
  }
};

exports.likePost = (req, res, next) => {
  if (!req.body.id) {
    return res.status(401).json({ msg: "you're not logged in" });
  }
  Post.findById(req.params.id).exec((err, post) => {
    if (err) {
      return res.status(401).json({ msg: "post not found" });
    }
    if (post.likes.includes(req.body.id)) {
      Post.findByIdAndUpdate(
        req.params.id,
        {
          $pull: { likes: req.body.id },
        },
        { new: true }
      ).exec((err, post) => {
        if (err) {
          return res.status(401).json({ msg: "user not found" });
        }
        res.json(post.likes);
      });
    } else {
      Post.findByIdAndUpdate(
        req.params.id,
        {
          $push: { likes: req.body.id },
        },
        { new: true }
      ).exec((err, post) => {
        if (err) {
          return res.status(401).json({ msg: "user not found" });
        }
        res.json(post.likes);
      });
    }
  });
};

exports.savePost = (req, res, next) => {
  if (!req.body.id) {
    return res.status(401).json({ msg: "you're not logged in" });
  }
  Post.findById(req.params.id).exec((err, post) => {
    if (err) {
      res.status(401).json({ msg: "post not found" });
      next(err);
    }
    if (post.saves.includes(req.body.id)) {
      Post.findByIdAndUpdate(
        req.params.id,
        {
          $pull: { saves: req.body.id },
        },
        { new: true }
      ).exec((err, post) => {
        if (err) {
          return res.status(401).json({ msg: "post or user not found" });
        }
        res.json(post.saves);
      });
    } else {
      Post.findByIdAndUpdate(
        req.params.id,
        {
          $push: { saves: req.body.id },
        },
        { new: true }
      ).exec((err, post) => {
        if (err) {
          return res.status(401).json({ msg: "post or user not found" });
        }
        res.json(post.saves);
      });
    }
  });
};

exports.getComments = (req, res, next) => {
  Post.findById(req.params.id)
    .populate({
      path: "comments",
      populate: { path: "author", select: "username" },
    })
    .exec((err, post) => {
      if (err) {
        next(err);
      }
      res.json(post.comments);
    });
};

exports.getSubComments = (req, res, next) => {
  Comment.findById(req.params.id)
    .populate({
      path: "subComments",
      populate: { path: "author", select: "username" },
    })
    .exec((err, comment) => {
      if (err) {
        next(err);
      }
      console.log(comment.subComments);
      res.json(comment.subComments);
    });
};

exports.postComment = (req, res, next) => {
  console.log(req.body, req.params.id);
  async.waterfall(
    [
      (next) => {
        new Comment({
          author: req.body.id,
          parent: req.params.id,
          content: req.body.content,
        }).save(next);
      },
      (newCom, next) => {
        Post.findByIdAndUpdate(
          req.params.id,
          {
            $push: { comments: { $each: [newCom], $position: 0 } },
          },
          { new: true }
        )
          .populate({
            path: "comments",
            populate: { path: "author", select: "username" },
            options: { sort: { date: -1 } },
          })
          .exec(next);
      },
    ],
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.json(results.comments);
      console.log(results.comments);
    }
  );
};

exports.postSubComment = (req, res, next) => {
  async.waterfall(
    [
      (next) => {
        new Comment({
          author: req.body.id,
          parent: req.params.id,
          content: req.body.content,
        }).save(next);
      },
      (newCom, next) => {
        Comment.findByIdAndUpdate(
          req.params.id,
          {
            $push: { subComments: { $each: [newCom], $position: 0 } },
          },
          { new: true }
        )
          .populate({
            path: "subComments",
            populate: { path: "author", select: "username" },
            options: { sort: { date: -1 } },
          })
          .exec(next);
      },
    ],
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.json(results.subComments);
      console.log(results);
    }
  );
};

exports.likeComment = (req, res, next) => {
  if (!req.body.id) {
    return res.status(401).json({ msg: "you're not logged in" });
  }
  Comment.findById(req.params.id).exec((err, comment) => {
    if (err) {
      return res.status(401).json({ msg: "comment not found" });
    }
    if (comment.likes.includes(req.body.id)) {
      Comment.findByIdAndUpdate(
        req.params.id,
        {
          $pull: { likes: req.body.id },
        },
        { new: true }
      ).exec((err, comment) => {
        console.log(comment);
        if (err) {
          return res.status(401).json({ msg: "user not found" });
        }
        res.json(comment.likes);
      });
    } else {
      Comment.findByIdAndUpdate(
        req.params.id,
        {
          $push: { likes: req.body.id },
        },
        { new: true }
      ).exec((err, comment) => {
        if (err) {
          return res.status(401).json({ msg: "user not found" });
        }
        res.json(comment.likes);
      });
    }
  });
};

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
