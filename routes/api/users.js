const express = require("express");
const router = express.Router();
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

const userController = require("../../controllers/userController");

router.route("/:id").get(userController.getPost);

module.exports = router;
