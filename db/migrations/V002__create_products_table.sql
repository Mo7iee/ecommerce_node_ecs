CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products (name, description, price, stock, is_active)
SELECT 'Laptop', '15-inch business laptop', 899.99, 10, TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Laptop');

INSERT INTO products (name, description, price, stock, is_active)
SELECT 'Headphones', 'Noise-canceling wireless headphones', 149.50, 25, TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Headphones');

INSERT INTO products (name, description, price, stock, is_active)
SELECT 'Smart Watch', 'Fitness tracking smartwatch', 199.99, 15, TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Smart Watch');
