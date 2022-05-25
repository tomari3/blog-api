const express = require("express");
const router = express.Router();
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

const User = require("../../models/User");

const userController = require("../../controllers/userController");

router.route("/").get(userController.getAllUsers);

router.route("/:id").get(userController.getUser);

module.exports = router;
