const express = require('express');
const api = require('./api');
const middleware = require('./middleware');
const bodyParser = require('body-parser');
const path = require('path');

// Set the port
const port = process.env.PORT || 3000;

// Initialize the app
const app = express();

// Register the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Register middleware
app.use(bodyParser.json()); // Parse incoming JSON requests
app.use(middleware.cors); // Apply CORS middleware

// API Routes
app.get('/', api.handleRoot);
app.get('/products', api.listProducts);
app.get('/products/:id', api.getProduct);
app.put('/products/:id', api.editProduct);
app.delete('/products/:id', api.deleteProduct);
app.post('/products', api.createProduct);

app.get('/orders', api.listOrders);
app.post('/orders', api.createOrder);
app.put('/orders/:id', api.editOrder); 
app.delete('/orders/:id', api.deleteOrder);

// Global error handler for unhandled errors
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error for debugging purposes
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'An unexpected error occurred.',
    },
  });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Boot the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});


