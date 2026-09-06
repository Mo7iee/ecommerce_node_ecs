const express = require('express');
const dotenv = require('dotenv');
const client = require('prom-client');
const registerRouter = require('./routes/register');
const loginRouter = require('./routes/login');
const meRouter = require('./routes/me');
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const normalizeRoute = (req) => {
  const route = req.route && req.route.path ? req.route.path : req.path || '/';
  const base = req.baseUrl || '';
  const fullRoute = `${base}${route}`;

  if (!fullRoute || fullRoute === '') {
    return '/';
  }

  const normalized = fullRoute.replace(/\/+/g, '/');
  return normalized.length > 1 && normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
};

client.collectDefaultMetrics({ register: client.register });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests handled by the application',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});

app.use((req, res, next) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const route = normalizeRoute(req);
    const statusCode = String(res.statusCode);
    const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;

    httpRequestsTotal.inc({ method: req.method, route, status_code: statusCode });
    httpRequestDurationSeconds.observe({ method: req.method, route, status_code: statusCode }, durationSeconds);
  });

  next();
});

app.use(express.json());

app.get('/health', (req, res) => res.status(200).json({ status: 'okk' }));
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

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
