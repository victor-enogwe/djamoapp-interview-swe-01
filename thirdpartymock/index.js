const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;
const getResponseLag = () => Math.random() * (10_000 - 200) + 200;
const getWebhookLag = () => Math.random() * (30_000 - 10_000) + 10_000;
const transactions = {};

const simulateLatency = (latency) => {
  return new Promise((fn) => setTimeout(fn, latency));
};

const sendWebhook = (id) => {
  const { status, webhookUrl } = transactions[id];
  axios
    .post(webhookUrl, { id, status })
    .catch(() => console.log(`Could not post webhook for ${id}`));
};

app.post("/transaction", (req, res) => {
  console.log("Received request", req.body);

  // Persist the transaction in memory
  const { id, webhookUrl } = req.body;
  transactions[id] = { id, status: "pending", webhookUrl };

  // Schedule webhook, for 80% of the cases
  const shouldSendWebhook = Math.random() > 1 / 5;
  if (shouldSendWebhook) {
    simulateLatency(getWebhookLag()).then(() => sendWebhook(id));
  }

  simulateLatency(getResponseLag()).then(() => {
    const status = Math.random() > 1 / 3 ? "completed" : "declined";
    transactions[id].status = status;
    res.send(transactions[id]);
  });
});

app.get("/transaction/:id", (req, res) => {
  const transaction = transactions[req.params.id];
  if (transaction === undefined) {
    res.status(404).send();
  } else {
    res.send(transaction);
  }
});

app.listen(port, () => {
  console.log(`Third party mock is listening on port ${port}`);
});
