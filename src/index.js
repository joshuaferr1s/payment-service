require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SK);
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 1337;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 200,
    data: {
      hello: 'world',
    },
  });
});

app.post('/payment', async (req, res) => {
  const { charge, token } = req.body;

  try {
    const paid = await stripe.charges.create({
      amount: charge.amount * 100,
      currency: 'usd',
      receipt_email: charge.email,
      description: charge.reason,
      source: token.id,
      metadata: {
        email: charge.email,
      },
    }, {
      idempotencyKey: uuidv4(),
    });
    res.json({
      status: 200,
      amount: paid.amount / 10,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      status: 500,
      message: 'Our server seems to be a little broken. Please try again later. You will not have been charged.',
    });
  }
});

app.listen(port, () => console.log(`Listening @ http://localhost:${port}`));
