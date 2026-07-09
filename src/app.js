const express = require('express');
const dotenv = require('dotenv');
const registerRouter = require('./routes/register');
const loginRouter = require('./routes/login');
const meRouter = require('./routes/me');
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => res.status(200).json({ status: 'okk' }));
app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/me', meRouter);
app.use('/products', productsRouter);
app.use('/cart', cartRouter);
app.use('/orders', ordersRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
