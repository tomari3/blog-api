var Post = require("../models/Post");
var User = require("../models/User");
var Comment = require("../models/Comment");
var Tag = require("../models/Tag");

const { body, validationResult } = require("express-validator");
var async = require("async");
