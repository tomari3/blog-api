require("dotenv").config();

const User = require("../models/User");

var express = require("express");
var router = express.Router();
const passport = require("passport");
const utils = require("../lib/utils");

var post_controller = require("../controllers/post_controller");
var tag_controller = require("../controllers/tag_controller");

/* GET home page. */
router.get("/", post_controller.index);
router.use("/users", require("./users"));

// POSTS_CONTROLLER
router.get("/post/new", post_controller.new_post_get);
router.post("/post/new", post_controller.new_post_post);

router.post("/post/:id/like", post_controller.like_post_post);
router.post("/post/:id/save", post_controller.save_post_post);

router.get("/post/:id/comments", post_controller.comment_post_get);
router.post("/post/:id/comment", post_controller.comment_post_post);

// COMMENT_CONTROLLER
router.get("/comment/:id/comments", post_controller.sub_comment_post_get);
router.post("/comment/:id/comment", post_controller.sub_comment_post_post);

router.post("/comment/:id/like", post_controller.comment_like_post);

// router.post("/post/:id/comment/:id/like", post_controller.comment_like_post);
// router.post(
//   "/post/:id/comment/:id/comment",
//   post_controller.comment_comment_post
// );

router.get("/post/:id/update", post_controller.update_post_get);
router.post("/post/:id/update", post_controller.update_post_post);

router.get("/post/:id/delete", post_controller.delete_post_get);
router.post("/post/:id/delete", post_controller.delete_post_post);

// // USERS_CONTROLLER

// // COMMENTS_CONTROLLER
// router.get("/comment/new", comment_controller.new_comment_get);
// router.post("/comment/new", comment_controller.new_comment_post);

// router.get("/comment/:id/update", comment_controller.update_comment_get);
// router.post("/comment/:id/update", comment_controller.update_comment_post);

// router.get("/comment/:id/delete", comment_controller.delete_comment_get);
// router.post("/comment/:id/delete", comment_controller.delete_comment_post);

// // TAGS_CONTROLLER

router.get("/tag/:id", tag_controller.tags_posts_get);

// router.get("/tag/new", tag_controller.new_tag_get);
// router.post("/tag/new", tag_controller.new_tag_post);

// router.get("/tag/:id/update", tag_controller.update_tag_get);
// router.post("/tag/:id/update", tag_controller.update_tag_post);

// router.get("/tag/:id/delete", tag_controller.delete_tag_get);
// router.post("/tag/:id/delete", tag_controller.delete_tag_post);

module.exports = router;
