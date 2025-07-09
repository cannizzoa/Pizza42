const express = require("express");
const { join } = require("path");
const morgan = require("morgan");
const helmet = require("helmet");
const app = express();

// for API

const { auth, requiredScopes } = require("express-oauth2-jwt-bearer");
const authConfig = require("./auth_config.json");

// create the JWT middleware
const checkJwt = auth({
  audience: authConfig.audience,
  issuerBaseURL: `https://${authConfig.domain}`
});

//

app.use(morgan("dev"));
app.use(helmet());
app.use(express.static(join(__dirname, "public")));

app.get("/auth_config.json", (req, res) => {
  res.sendFile(join(__dirname, "auth_config.json"));
});

// API Route

app.get("/api/external", checkJwt, requiredScopes("read:orders"), (req, res) => {
  res.send({
    msg: "Your access token was successfully validated with scope!"
  });
});

app.use(function(err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    return res.status(401).send({ msg: "Invalid token" });
  }

  next(err, req, res);
});

app.use(function(err, req, res, next) {
  if (err.name === "InsufficientScopeError") {
    return res.status(403).send({ msg: "Insufficient Scope" });
  }

  next(err, req, res);
});

app.get("/*", (_, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

process.on("SIGINT", function() {
  process.exit();
});

module.exports = app;
