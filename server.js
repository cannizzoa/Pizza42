const express = require("express");
const { join } = require("path");
const morgan = require("morgan");
const helmet = require("helmet");
const axios = require('axios');
const app = express();
app.use(express.json()); //to read JSON Body

//Management API SDK for Node.js 
const { ManagementClient } = require('auth0');
const auth0 = new ManagementClient({
  domain: 'dev-4cxpi21z0k7giy4z.us.auth0.com',
  clientId: 'SM1L8w0lo1xi3ygaANaQ8HSGkTr5GiCc',
  clientSecret: 'g-0UMEL4AGxwdBP1X932ppTush3Y5OQ9EbkqOJO-9h2RpIGnpN6qF9mtEEgwPGdI',
  scope: 'read:users update:users'
});

//Get Management Token for custom API
async function getManagementToken() {
  const domain = 'dev-4cxpi21z0k7giy4z.us.auth0.com'; // il tuo
  const clientId = 'SM1L8w0lo1xi3ygaANaQ8HSGkTr5GiCc'; // il tuo
  const clientSecret = 'g-0UMEL4AGxwdBP1X932ppTush3Y5OQ9EbkqOJO-9h2RpIGnpN6qF9mtEEgwPGdI'; // il tuo
  const audience = `https://${domain}/api/v2/`;
  const res = await axios.post(`https://${domain}/oauth/token`, {
    client_id: clientId,
    client_secret: clientSecret,
    audience: audience,
    grant_type: 'client_credentials'
  });
  return res.data.access_token;
}


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

// Define function to add Order
async function addOrderToUser(userId, order) {
  const user = await auth0.users.get({ id: userId });
  
  // Check email verification
  if (user.data.email_verified == false) {
      const err = new Error(
      "Missing email verification: please verify your email before placing a pizza order"
    );
    err.status = 403; // Forbidden
    throw err;
  }
  
  const metadata = user.data.user_metadata || {};
  const orders = Array.isArray(metadata.orders) ? metadata.orders : [];
  orders.push({ ...order, date: new Date().toISOString() });
  await auth0.users.update({ id: userId }, { user_metadata: { ...metadata, orders } });
}


// API Route

app.post("/api/orders", checkJwt, requiredScopes("write:orders"), async (req, res) => {
  const userId = req.auth.payload.sub;
  const order = req.body.order;

  try {
    await addOrderToUser(userId, order);
    res.json({ msg: "Order saved!" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.post('/api/send-verification-email', checkJwt, async (req, res) => {
  const userId = req.auth.payload.sub;
  const domain = 'dev-4cxpi21z0k7giy4z.us.auth0.com';
  const token = await getManagementToken();
  
  try {
    const res = await axios.post(
    `https://dev-4cxpi21z0k7giy4z.us.auth0.com/api/v2/jobs/verification-email`,
    { user_id: userId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
    );
    return res.data;
    res.json({ msg: "Verification email sent!" });
  } catch (e) {
    res.status(500).json({ error: e.message });
    console.log(e.message);
  }
});


// Errors
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


//
app.get("/*", (_, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

process.on("SIGINT", function() {
  process.exit();
});

module.exports = app;
