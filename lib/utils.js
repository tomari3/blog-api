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
module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.issueJWTAccess = issueJWTAccess;
module.exports.issueJWTRefresh = issueJWTRefresh;
