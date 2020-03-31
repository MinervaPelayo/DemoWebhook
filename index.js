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
/*
// Creates the endpoint for our webhook
app.post("/webhook", (req, res) => {
  // Returns a '200 OK' response to all requests
  res.sendStatus(200);
  // Parse the request body from the POST
  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === "page") {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {
      // Gets the message. entry.messaging is an array, but
      // will only ever contain one message, so we get index 0
    /*  let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log("Sender PSID: " + sender_psid);

      // Check if the event is a message and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      }               



 // Iterate over each messaging event
 entry.messaging.forEach((messagingEvent) => {
  console.log({messagingEvent});


  if (messagingEvent.message) {
    handleMessage(messagingEvent);
  } else {
    console.error(
      'Webhook received unknown messagingEvent: ',
      messagingEvent
    );
  }
});



    });
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Handles messages events
function handleMessage(received_message) {
  let message = received_message.message;
  let response;
      
              // Get the sender PSID
  let sender_psid = received_message.sender.id;
  console.log("Sender PSID: " + sender_psid);
  // Check if the message contains text
  if (message.text) {

    // Create the payload for a basic text message
    response = {
      text: `You sent the message: "${received_message.text}".`
    };
  }
  // Sends the response message
  callSendAPI(sender_psid, response);
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    recipient: {
      id: sender_psid
    },
    message: response
  };
  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: "https://graph.facebook.com/v2.6/me/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: request_body
    },
    (err, res, body) => {
      if (!err) {
        console.log("Message sent!");
      } else {
        console.error("Unable to send message:" + err);
      }
    }
  );
}*/

app.post('/webhook', (req, res) => {
  /*
  You must send back a status of 200(success) within 20 seconds
  to let us know you've successfully received the callback.
  Otherwise, the request will time out.
  When a request times out from Facebook the service attempts
  to resend the message.
  This is why it is good to send a response immediately so you
  don't get duplicate messages in the event that a request takes
  awhile to process.
*/
res.sendStatus(200);
let timestamp=0;
const data = req.body;
console.log('Webhook POST', JSON.stringify(data));

// Make sure this is a page subscription
if (data.object === 'page') {
  // Iterate over each entry
  // There may be multiple if batched
  data.entry.forEach((pageEntry) => {
    if (!pageEntry.messaging) {
      return;
    }
    // Iterate over each messaging event and handle accordingly
    pageEntry.messaging.forEach((messagingEvent) => {
      console.log({messagingEvent});

      if (messagingEvent.message) {
        if (messagingEvent.timestamp===(timestamp)){
          console.log("Message already handled")
        }else{
        timestamp=messagingEvent.timestamp;
        handleReceiveMessage(messagingEvent);
        }
      }

      else if (messagingEvent.postback) {
        handleReceivePostback(messagingEvent);
      } else {
        console.log(
          'Webhook received unknown messagingEvent: '
        );
      }
    });
  });
}
});

/*
 * handleReceiveMessage - Message Event called when a message is sent to
 * your page. The 'message' object format can vary depending on the kind
 * of message that was received. Read more at: https://developers.facebook.com/
 * docs/messenger-platform/webhook-reference/message-received
 */
const handleReceiveMessage = (event) => {
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

  request({
    uri: `https://graph.facebook.com/v3.2/me/messages`,
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageToSend,

  }, (error, response, body) => {
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
        body.error,
      );
    }
  });
};
