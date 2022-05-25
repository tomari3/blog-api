const express = require("express");
const router = express.Router();
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

const postController = require("../../controllers/postController");
const tag_controller = require("../../controllers/tag_controller");

/* GET home page. */
router.route("/").get(postController.getAllPosts).post(postController.newPost);

router.route("/:id").get(postController.getPost);

router.post("/:id/like", postController.likePost);
router.post("/:id/save", postController.savePost);

router
  .route("/:id/comments")
  .get(postController.getComments)
  .post(postController.postComment);

router
  .route("/comments/:id/comments")
  .get(postController.getSubComments)
  .post(postController.postSubComment);

router.post("/comments/:id/like", postController.likeComment);

router.get("/:id/update", postController.update_post_get);
router.post("/:id/update", postController.update_post_post);

router.get("/:id/delete", postController.delete_post_get);
router.post("/:id/delete", postController.delete_post_post);

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
