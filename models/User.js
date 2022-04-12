var mongoose = require("mongoose");
// const { DateTime } = require("luxon");
const bcrypt = require("bcrypt");

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  hash: { type: String, required: true },
  salt: { type: String, required: true },
  isAdmin: { type: Boolean, required: true, default: false },
  likedPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  savedPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  profilePicture: String,
  date: { type: Date, default: new Date() },
});

UserSchema.virtual("url").get(function () {
  return "users/" + this._id;
});

// UserSchema.virtual("date_format").get(function () {
//   return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
// });

module.exports = mongoose.model("User", UserSchema);
