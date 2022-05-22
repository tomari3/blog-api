require("dotenv").config();
const crypto = require("crypto");
const jsonwebtoken = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const PRIV_KEY = process.env.PRIV_KEY;
const pathToKey = path.join(__dirname, "..", "id_rsa_pub.pem");
const PUB_KEY = fs.readFileSync(pathToKey, "utf8");
const User = require("../models/User");

function validPassword(password, hash, salt) {
  var hashVerify = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return hash === hashVerify;
}

function genPassword(password) {
  var salt = crypto.randomBytes(32).toString("hex");
  var genHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");

  return {
    salt: salt,
    hash: genHash,
  };
}

function issueJWTAccess(user) {
  const _id = user._id;

  const accessTokenExp = "1m";

  const payload = {
    sub: _id,
    iat: Date.now(),
  };

  const accessToken = jsonwebtoken.sign(payload, PRIV_KEY, {
    expiresIn: accessTokenExp,
    algorithm: "RS256",
  });

  return {
    accessToken: "Bearer " + accessToken,
    expires: accessTokenExp,
  };
}

function issueJWTRefresh(user) {
  const _id = user._id;

  const refreshTokenExp = "1d";

  const payload = {
    sub: _id,
    iat: Date.now(),
  };

  const refreshToken = jsonwebtoken.sign(payload, PRIV_KEY, {
    expiresIn: refreshTokenExp,
    algorithm: "RS256",
  });

  return {
    refreshToken: "Bearer " + refreshToken,
    expires: refreshTokenExp,
  };
}

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("bearer ")) return res.sendStatus(401);
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.PRIV_KEY, (err, decoded) => {
    if (err) return res.sendStatus(403);
    User.findById({ _id: decoded.sub._id }, function (err, user) {
      if (err) {
        return done(err, false); // error no user
      }
      if (user) {
        return done(null, user); // no error, correct user
      } else {
        return done(null, false); // no error, incorrect user
      }
    });
  });
}
module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.issueJWTAccess = issueJWTAccess;
module.exports.issueJWTRefresh = issueJWTRefresh;
module.exports.verifyJWT = verifyJWT;
