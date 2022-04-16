var mongoose = require("mongoose");
// const { DateTime } = require("luxon");

var Schema = mongoose.Schema;

var TagSchema = new Schema({
  name: { type: String, required: true, unique: true },
  created: { type: Date, default: new Date() },
});

module.exports = mongoose.model("Tag", TagSchema);
