const express = require("express");
const router = express.Router();
const { createMemberShipDocument } = require("../buy_membership");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.get("/config", async (req, res) => {
  const price = await stripe.prices.retrieve(process.env.PRICE);
  // console.log(price);
  res.send({
    publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
    unitAmount: price.unit_amount,
    currency: price.currency,
  });
});


router.post("/payment_links", async (req, res) => {
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price: "price_1L8nchSB01SizmLfEMnJNe5n",
        quantity: 1,
      },
    ],
  });
  res.send(paymentLink);
});

router.get("/success", async (req, res) => {
  const { session_id } = req.query;
  const session = await stripe.checkout.sessions.retrieve(session_id);
  console.log(session);

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
  // membershipHandler(req.body);
  console.log(session);

  return res.send({url: session.url});
});

async function membershipHandler(membershipData) {
  const memberShipDoc = await createMemberShipDocument(
    membershipData,
    studentId
  );
  return res.send(memberShipDoc);
}
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
    case "customer.subscription.created":
      console.log(`🔔  Subscription created!`, data);
    case "checkout.session.completed":
      // Payment is successful and the subscription is created.
      // You should provision the subscription and save the customer ID to your database.
      console.log(`🔔  Payment received!`);
      break;
    case "charge.succeeded":
      console.log(`🔔  amount charged!`);
      const paymentIntent = data.object;
      console.log(paymentIntent.receipt_url);
      break;
    case "invoice.paid":
      break;
    case "invoice.payment_failed":
      break;
    default:
    // Unhandled event type
  }
  res.send({ msg: "success" });
});

function striperErrorHandler(err) {
  switch (err.type) {
    case "StripeCardError":
      // A declined card error
      err.message; // => e.g. "Your card's expiration year is invalid."
      break;
    case "StripeRateLimitError":
      // Too many requests made to the API too quickly
      err.message;
      break;
    case "StripeInvalidRequestError":
      // Invalid parameters were supplied to Stripe's API
      err.message;
      break;
    case "StripeAPIError":
      // An error occurred internally with Stripe's API
      err.message;
      break;
    case "StripeConnectionError":
      // Some kind of error occurred during the HTTPS communication
      err.message;
      break;
    case "StripeAuthenticationError":
      // You probably used an incorrect API key
      err.message;
      break;
    default:
      // Handle any other types of unexpected errors
      break;
  }
}
module.exports = router;
