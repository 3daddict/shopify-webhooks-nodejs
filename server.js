require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const getRawBody = require("raw-body");
const crypto = require("crypto");
const app = express();
const port = process.env.PORT || 3000;

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

// Webhook subscribe creates a webhook based on the topic provided.
// Request Body Example:
// {
//   "webhook": {
//     "topic": "<WEBHOOK_TOPIC>",
//     "address": "<SERVER_URL_WITH_ENDPOINT>",
//     "format": "json"
//   }
// }
app.post("/subscribe-webhook-topic", async (req, res) => {
  let response = [];

  await fetch(
    `${process.env.SHOPIFY_STORE_URL}/admin/api/${process.env.SHOPIFY_API_VERSION}/webhooks.json`,
    {
      method: "post",
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_API_PASSWORD,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    }
  )
    .then((res) => res.json())
    .then((json) => (response = json))
    .catch((err) => console.log(err));

  res.status(200).send(response);
});

// Retreive all webhooks
app.get("/get-all-webhooks", async (req, res) => {
  let response = [];

  await fetch(
    `${process.env.SHOPIFY_STORE_URL}/admin/api/${process.env.SHOPIFY_API_VERSION}/webhooks.json`,
    {
      method: "get",
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_API_PASSWORD,
        "Content-Type": "application/json",
      },
    }
  )
    .then((res) => res.json())
    .then((json) => (response = json))
    .catch((err) => console.log(err));

  res.status(200).send(response);
});

// Delete a webhook by ID
app.delete("/delete-webhook", async (req, res) => {
  let response = [];

  await fetch(
    `${process.env.SHOPIFY_STORE_URL}/admin/api/${process.env.SHOPIFY_API_VERSION}/webhooks/${req.query.id}.json`,
    {
      method: "delete",
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_API_PASSWORD,
        "Content-Type": "application/json",
      },
    }
  )
    .then((res) => res.json())
    .then((json) => (response = json))
    .catch((err) => console.log(err));

  res.status(200).send(response);
});

// Catch webhook response
app.post("/webhooks/orders/create", async (req, res) => {
  console.log("🎉 We got an order!");

  const data = await req.rawBody;
  const hmacHeader = await req.get("X-Shopify-Hmac-Sha256");

  try {
    const hmac = crypto
      .createHmac("sha256", process.env.SHOPIFY_API_SHARED_SECRET)
      .update(data, "utf8", "hex")
      .digest("base64");

    if (hmacHeader === hmac) {
      console.log("Phew, it came from Shopify!");
      res.sendStatus(200);
      console.log(req.body);
    } else {
      console.log("Danger! Not from Shopify!");
      res.sendStatus(403);
    }
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
