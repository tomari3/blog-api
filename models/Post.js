var mongoose = require("mongoose");
// const { DateTime } = require("luxon");

var Schema = mongoose.Schema;

var PostSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User" },
  content: { type: String, required: true },
  status: {
    type: Boolean,
    required: true,
    default: false,
  },
  isPinned: { type: Boolean, required: true, default: false },
  tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  saves: [{ type: Schema.Types.ObjectId, ref: "User" }],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  date: { type: Date, default: new Date() },
});

PostSchema.virtual("url").get(function () {
  return "posts/" + this._id;
});

PostSchema.virtual("date_format").get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model("Post", PostSchema);
