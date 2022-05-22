var mongoose = require("mongoose");
// const { DateTime } = require("luxon");
const bcrypt = require("bcrypt");

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  hash: { type: String, required: true },
  salt: { type: String, required: true },
  roles: [{ type: Object }],
  refreshToken: [{ type: String }],

  profilePicture: String,
  likedPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  savedPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }],

  date: { type: Date, default: new Date() },
});

module.exports = mongoose.model("User", UserSchema);
