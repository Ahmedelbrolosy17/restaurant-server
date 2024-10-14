require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const cors = require('cors');

// Allow specific origins and methods for CORS
app.use(cors({
  origin: 'https://restaurant-front-one.vercel.app', // Your frontend URL
  methods: ['GET', 'POST', 'OPTIONS'], // Allow GET, POST, and OPTIONS methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow headers
  credentials: true // If your frontend needs credentials (like cookies or auth tokens)
}));


// Middleware to parse JSON request bodies
app.use(express.json());

app.options('/checkout', cors());

app.get('/', (req, res)=>{
  res.end("welcome to our server")
})
app.get('/about', (req, res)=>{
  res.end("this is a server for a payment process")
})
app.post('/checkout', async (req, res) => {
  const { basket } = req.body;

  // Prepare line items for Stripe from the basket data
  const line_items = basket.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
      },
      unit_amount: Math.round(item.price * (1 - item.discount) * 100), // Convert to cents
    },
    quantity: item.quantity,
  }));

  // Create Stripe checkout session
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.BASE_URL}/complete`,
      cancel_url: `${process.env.BASE_URL}/order`,
    });

    // Send the session URL back to the frontend
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = app; // Export your Express app

