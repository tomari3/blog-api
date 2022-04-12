var mongoose = require("mongoose");
// const { DateTime } = require("luxon");

var Schema = mongoose.Schema;

var TagSchema = new Schema({
  name: { type: String, required: true },
});

// TagSchema.virtual("url").get(function () {
//   return "comments/" + this._id;
// });

module.exports = mongoose.model("Tag", TagSchema);
