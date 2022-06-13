const express = require("express");
const router = express.Router();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.get("/config", async (req, res) => {
  const price = await stripe.prices.retrieve(process.env.PRICE);
  console.log(price);
  res.send({
    publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
    unitAmount: price.unit_amount,
    currency: price.currency,
  });
});

// Fetch the Checkout Session to display the JSON result on the success page
router.get("/checkout-session", async (req, res) => {
  const { sessionId } = req.query;
  console.log(sessionId);
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  res.send(session);
});

router.get("/success", async (req, res) => {
  res.send({ msg: "payment success" });
});
router.get("/canceled", async (req, res) => {
  res.send({ msg: "payment declined" });
});
router.post("/create-checkout-session", async (req, res) => {
  const domainURL = process.env.DOMAIN;
  const { line_items, mode } = req.body;

  // Create new Checkout Session for the order
  const session = await stripe.checkout.sessions.create({
    line_items,
    mode,
    success_url: `${domainURL}/api/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${domainURL}/api/canceled`,
    // automatic_tax: {enabled: true},
  });
  console.log(session);

  return res.redirect(303, session.url);
});

// Webhook handler for asynchronous events.
router.post("/webhook", async (req, res) => {
  let data;
  let eventType;
  // Check if webhook signing is configured.
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers["stripe-signature"];

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  switch (eventType) {
    case "checkout.session.completed":
      // Payment is successful and the subscription is created.
      // You should provision the subscription and save the customer ID to your database.
      console.log(`🔔  Payment received!`);
      break;
    case "invoice.paid":
      // Continue to provision the subscription as payments continue to be made.
      // Store the status in your database and check when a user accesses your service.
      // This approach helps you avoid hitting rate limits.
      break;
    case "invoice.payment_failed":
      // The payment failed or the customer does not have a valid payment method.
      // The subscription becomes past_due. Notify your customer and send them to the
      // customer portal to update their payment information.
      break;
    default:
    // Unhandled event type
  }
});

module.exports = router;
