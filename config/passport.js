const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const fs = require("fs");
const path = require("path");
const User = require("../models/User");

const pathToKey = path.join(__dirname, "..", "id_rsa_pub.pem");
const PUB_KEY = fs.readFileSync(pathToKey, "utf8");

const access = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: PUB_KEY,
  algorithms: ["RS256"],
};

var cookieExtractor = (req) => {
  var token = null;
  if (req && req.cookies) token = req.cookies["jwt"];
  return token;
};

const cookie = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: PUB_KEY,
  algorithms: ["RS256"],
};

module.exports = (passport) => {
  passport.use(
    "access",
    new JwtStrategy(access, (payload, done) => {
      User.findById({ _id: payload._id }, (err, user) => {
        if (err) {
          return done(err, false); // error no user
        }
        if (user) {
          return done(null, user); // no error, correct user
        } else {
          return done(null, false); // no error, incorrect user
        }
      });
    })
  );
  passport.use(
    "cookie",
    new JwtStrategy(cookie, (payload, done) => {
      User.findById({ _id: payload._id }, (err, user) => {
        if (err) {
          console.log("no user");
          return done(err, false); // error no user
        }
        if (user) {
          console.log("correct user");
          return done(null, user); // no error, correct user
        } else {
          console.log("incorrect user");
          return done(null, false); // no error, incorrect user
        }
      });
    })
  );
};
