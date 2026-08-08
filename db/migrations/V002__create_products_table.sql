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

INSERT INTO products (name, description, price, stock, is_active)
SELECT 'Mechanical Keyboard', 'RGB mechanical keyboard with blue switches', 89.99, 30, TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Mechanical Keyboard');

INSERT INTO products (name, description, price, stock, is_active)
SELECT 'Wireless Mouse', 'Ergonomic wireless mouse with adjustable DPI', 39.99, 50, TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Wireless Mouse');

INSERT INTO products (name, description, price, stock, is_active)
SELECT '4K Monitor', '27-inch 4K UHD monitor for productivity and gaming', 349.99, 12, TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = '4K Monitor');

INSERT INTO products (name, description, price, stock, is_active)
SELECT 'USB-C Hub', '7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader', 59.99, 40, TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'USB-C Hub');

INSERT INTO products (name, description, price, stock, is_active)
SELECT 'Laptop Stand', 'Adjustable aluminum laptop stand', 49.99, 35, TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Laptop Stand');

INSERT INTO products (name, description, price, stock, is_active)
SELECT 'Webcam', '1080p USB webcam with built-in microphone', 69.99, 20, TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Webcam');

INSERT INTO products (name, description, price, stock, is_active)
SELECT 'Portable SSD', '1TB USB-C portable solid-state drive', 109.99, 18, TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Portable SSD');

INSERT INTO products (name, description, price, stock, is_active)
SELECT 'Bluetooth Speaker', 'Portable wireless Bluetooth speaker with 12-hour battery', 79.99, 25, TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Bluetooth Speaker');

INSERT INTO products (name, description, price, stock, is_active)
SELECT 'Gaming Controller', 'Wireless controller compatible with PC and console', 64.99, 22, TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Gaming Controller');

INSERT INTO products (name, description, price, stock, is_active)
SELECT 'Power Bank', '20,000mAh portable power bank with USB-C fast charging', 44.99, 45, TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Power Bank');