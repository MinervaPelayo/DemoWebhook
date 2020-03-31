// Imports dependencies and set up http server
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
require("dotenv").config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const app = express().use(bodyParser.json()); // creates express http server

// Index route
app.get("/", function(req, res) {
  res.send("This is my webhook");
});

// Facebook's webhook verification
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

// Creates the endpoint for our webhook
app.post("/webhook", (req, res) => {
  //Send status to Facebook
  res.sendStatus(200);

  const data = req.body;
  console.log("Webhook POST", JSON.stringify(data));

  // Make sure this is a page subscription
  if (data.object === "page") {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(pageEntry => {
      if (!pageEntry.messaging) {
        return;
      }
      // Iterate over each messaging event and handle accordingly
      pageEntry.messaging.forEach(messagingEvent => {
        console.log({ messagingEvent });

        if (messagingEvent.message) {
          handleReceiveMessage(messagingEvent);
        } else {
          console.log("Webhook received unknown messagingEvent: ");
        }
      });
    });
  }
});

//Message Event called when a message is sent to your page
const handleReceiveMessage = event => {
  const message = event.message;
  const senderId = event.sender.id;
  let response;

  if (message.text) {
    response = {
      text: `You sent the message: "${message.text}".`
    };
    sendMessage(senderId, response);
  }
};

const sendMessage = (recipientId, response) => {
  // Construct the message body
  let messageToSend = {
    recipient: {
      id: recipientId
    },
    message: response
  };

  request(
    {
      uri: `https://graph.facebook.com/v3.2/me/messages`,
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: messageToSend
    },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        // Message has been successfully received by Facebook
        console.log(
          `Successfully sent message to endpoint: `,
          JSON.stringify(body)
        );
      } else {
        // Message has not been successfully received by Facebook
        console.error(
          `Failed calling Messenger API endpoint`,
          response.statusCode,
          response.statusMessage,
          body.error
        );
      }
    }
  );
};
