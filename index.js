const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const { getCommitCode } = require('./util');

app.use(bodyParser.json())

// Define the endpoint for receiving webhook events
app.post("/webhook", (req, res) => {
  // Process the webhook event here
  // handleWebhookEvent(req.body);
  // console.log("Webhook received", JSON.stringify(req.body));
  const eventData = req.body;
  const owner = eventData.repository.owner.login;
const repo = eventData.repository.name;
const commitSha = eventData.after;
console.log("redis recieved hook", owner, repo, commitSha);
  getCommitCode(owner, repo, commitSha)
  .then(code => {
    for (const filePath in code) {
      console.log(`File: ${filePath}`);
      console.log(code[filePath]);
      console.log("------------------------------");
    }
  })
  .catch(error => {
    console.error("Error occurred:", error);
  });

  // Respond with a 200 status code to acknowledge receipt of the event
  res.sendStatus(200);
});

// Start the server
app.listen(3000, () => {
  console.log("Webhook server listening on port 3000");
});
