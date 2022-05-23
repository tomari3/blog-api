require("dotenv").config();
const crypto = require("crypto");
const jsonwebtoken = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const PRIV_KEY = process.env.PRIV_KEY;
const pathToKey = path.join(__dirname, "..", "id_rsa_pub.pem");
const PUB_KEY = fs.readFileSync(pathToKey, "utf8");
const User = require("../models/User");

const validPassword = (password, hash, salt) => {
  var hashVerify = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return hash === hashVerify;
};

const genPassword = (password) => {
  var salt = crypto.randomBytes(32).toString("hex");
  var genHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");

  return {
    salt: salt,
    hash: genHash,
  };
};

const issueJWTAccess = (user) => {
  const { _id, roles, username } = user;

  const accessTokenExp = "10s";

  const payload = {
    _id: _id,
    username: username,
    roles: roles,
    iat: Date.now(),
  };

  const accessToken = jsonwebtoken.sign(payload, PRIV_KEY, {
    expiresIn: accessTokenExp,
    algorithm: "RS256",
  });

  return {
    accessToken: accessToken,
    expires: accessTokenExp,
  };
};

const issueJWTRefresh = (user) => {
  const { _id, roles, username } = user;

  const refreshTokenExp = "1d";

  const payload = {
    _id: _id,
    username: username,
    roles: roles,
    iat: Date.now(),
  };

  const refreshToken = jsonwebtoken.sign(payload, PRIV_KEY, {
    expiresIn: refreshTokenExp,
    algorithm: "RS256",
  });

  return {
    refreshToken: refreshToken,
    expires: refreshTokenExp,
  };
};

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.issueJWTAccess = issueJWTAccess;
module.exports.issueJWTRefresh = issueJWTRefresh;
