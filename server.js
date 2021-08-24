require('dotenv').config();
const express = require('express');
const fetch = require("node-fetch");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

// Webhook subscribe creates a webhook based on the topic provided.
app.post('/subscribe-webhook-topic', async (req, res) => {
  let response = [];
  
  await fetch(`${process.env.SHOPIFY_STORE_URL}/admin/api/${process.env.SHOPIFY_API_VERSION}/webhooks.json`,{
    method: 'post',
    headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_API_PASSWORD, 
        'Content-Type': 'application/json' 
    },
    body: JSON.stringify(req.body)
  })
  .then(res => res.json())
  .then(json => response = json)
  .catch(err => console.log(err));

  res.status(200).send(response);
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});