require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const cors = require('cors');

app.use(cors({
  origin: 'https://restaurant-front-one.vercel.app', // Your front-end URL
  methods: ['GET', 'POST', 'OPTIONS'], // Explicitly allow necessary methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
  credentials: true // Allow credentials if required (cookies or auth tokens)
}));

// Handle preflight requests
app.options('*', cors());



// Middleware to parse JSON request bodies
app.use(express.json());

app.get('/', (req, res)=>{
  res.end("welcome to our server")
})
app.get('/about', (req, res)=>{
  res.end("this is a server for a payment process")
})
app.post('/checkout', async (req, res) => {
  res.set('Access-Control-Allow-Origin', 'https://restaurant-front-one.vercel.app');

  const { basket } = req.body;

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

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.BASE_URL}/complete`,
      cancel_url: `${process.env.BASE_URL}/order`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    res.status(500).send('Internal Server Error');
  }
});


module.exports = app; // Export your Express app

