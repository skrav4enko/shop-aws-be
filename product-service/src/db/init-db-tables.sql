-- DROP EXTENSION IF EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create helper function to generate random integer number
CREATE OR REPLACE FUNCTION random_between(low INT ,high INT) 
   RETURNS INT AS
$$
BEGIN
   RETURN floor(random()* (high-low + 1) + low);
END;
$$ language 'plpgsql' STRICT;

-- Create Products Table
CREATE TABLE IF NOT EXISTS products (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    description text,
    price integer,
    logo text
);

-- Create Stocks Table
CREATE TABLE IF NOT EXISTS stocks (
    product_id uuid UNIQUE REFERENCES products (id),
    count integer
);

-- Fill products
INSERT INTO products (title, description, price) 
VALUES 
	(
	    'ProductOne',
	    'Short Product Description1',
	    2
	),
	(
	    'ProductNew',
	    'Short Product Description3',
	    10
	),
	(
	    'ProductTop',
	    'Short Product Description2',
	    23
	),
	(
	    'Product',
	    'Short Product Description7',
	    15
	),
	(
	    'Product',
	    'Short Product Description2',
	    23
	),
	(
	    'ProductTest',
	    'Short Product Description4',
	    15
	),
	(
	    'Product2',
	    'Short Product Descriptio1',
	    23
	),
	(
	    'ProductName',
	    'Short Product Description7',
	    15
	);

-- Fill stocks
INSERT INTO stocks (product_id, count)
SELECT id as product_id, random_between(0, 10) as count
FROM products;
