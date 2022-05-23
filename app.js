const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const passport = require("passport");
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const credentials = require("./middleware/credentials");
const logger = require("morgan");
const utils = require("./lib/utils");

require("dotenv").config();

const app = express();

require("./config/database");

require("./models");

require("./config/passport")(passport);

app.use(passport.initialize());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(credentials);
app.use(cors(corsOptions));

app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

app.use("/auth", require("./routes/auth"));

app.use(passport.authenticate("access", { session: false }));
app.use("/posts", require("./routes/api/posts"));

// app.use(require("./routes/api"));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    error: err,
  });
});

module.exports = app;
