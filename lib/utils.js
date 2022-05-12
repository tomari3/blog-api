const crypto = require("crypto");
const jsonwebtoken = require("jsonwebtoken");
const PRIV_KEY = process.env.PRIV_KEY;

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

function issueJWT(user) {
  const _id = user._id;

  const accessTokenExp = "5m";
  const refreshTokenExp = "1d";

  const payload = {
    sub: _id,
    iat: Date.now(),
  };

  const accessToken = jsonwebtoken.sign(payload, PRIV_KEY, {
    expiresIn: accessTokenExp,
    algorithm: "RS256",
  });

  const refreshToken = jsonwebtoken.sign(payload, PRIV_KEY, {
    expiresIn: refreshTokenExp,
    algorithm: "RS256",
  });

  return {
    accessToken: "Bearer " + accessToken,
    refreshToken: "Bearer " + refreshToken,
    expires: accessTokenExp,
  };
}
module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.issueJWT = issueJWT;
