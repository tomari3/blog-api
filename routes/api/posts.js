const express = require("express");
const router = express.Router();
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

const postController = require("../../controllers/postController");
const tag_controller = require("../../controllers/tag_controller");

/* GET home page. */
router.get("/", postController.getAllPosts);

// POSTS_CONTROLLER
router.get("/post/new", postController.new_post_get);
router.post("/post/new", postController.new_post_post);

router.post("/post/:id/like", postController.like_post_post);
router.post("/post/:id/save", postController.save_post_post);

router.get("/post/:id/comments", postController.comment_post_get);
router.post("/post/:id/comment", postController.comment_post_post);

// COMMENT_CONTROLLER
router.get("/comment/:id/comments", postController.sub_comment_post_get);
router.post("/comment/:id/comment", postController.sub_comment_post_post);

router.post("/comment/:id/like", postController.comment_like_post);

// router.post("/post/:id/comment/:id/like", postController.comment_like_post);
// router.post(
//   "/post/:id/comment/:id/comment",
//   postController.comment_comment_post
// );

router.get("/post/:id/update", postController.update_post_get);
router.post("/post/:id/update", postController.update_post_post);

router.get("/post/:id/delete", postController.delete_post_get);
router.post("/post/:id/delete", postController.delete_post_post);

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
