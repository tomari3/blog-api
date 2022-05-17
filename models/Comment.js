var mongoose = require("mongoose");
// const { DateTime } = require("luxon");

var Schema = mongoose.Schema;

var CommentSchema = new Schema({
  parent: { type: Schema.Types.ObjectId, ref: "Post" || "Comment" },
  author: { type: Schema.Types.ObjectId, ref: "User" },
  content: { type: String, required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: "User", unique: true }],
  subComments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  date: { type: Date, default: new Date() },
});

CommentSchema.virtual("url").get(function () {
  return "comments/" + this._id;
});

// CommentSchema.virtual("date_format").get(function () {
//   return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
// });

module.exports = mongoose.model("Comment", CommentSchema);
