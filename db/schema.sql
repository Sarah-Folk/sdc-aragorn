DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS features CASCADE;
DROP TABLE IF EXISTS features CASCADE;
DROP TABLE IF EXISTS related CASCADE;
DROP TABLE IF EXISTS styles CASCADE;
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS skus CASCADE;

CREATE TABLE products (
  id INTEGER,
  name VARCHAR(255),
  slogan VARCHAR(2000),
  description VARCHAR(20000),
  category VARCHAR(255),
  default_price NUMERIC,
  PRIMARY KEY (id)
);

COPY products(id, name, slogan, description, category, default_price)
FROM '/Users/sarahfolk/Hack Reactor/sdc-aragorn/db/product.csv'
DELIMITER ','
CSV HEADER;

CREATE TABLE features (
  id INTEGER,
  productId INTEGER,
  feature VARCHAR(255),
  value VARCHAR(255),
  PRIMARY KEY (id),
  FOREIGN KEY(productId)
  REFERENCES products(id)
);

COPY features(id, productId, feature, value)
FROM '/Users/sarahfolk/Hack Reactor/sdc-aragorn/db/features.csv'
DELIMITER ','
CSV HEADER;

CREATE TABLE related (
  id INTEGER,
  currentId INTEGER,
  relatedId INTEGER,
  PRIMARY KEY (id),
  FOREIGN KEY(currentId)
  REFERENCES products(id)
);

COPY related(id, currentId, relatedId)
FROM '/Users/sarahfolk/Hack Reactor/sdc-aragorn/db/related.csv'
DELIMITER ','
CSV HEADER;

CREATE TABLE styles (
  id INTEGER,
  productId INTEGER,
  name VARCHAR(255),
  salePrice VARCHAR(50),
  originalPrice NUMERIC,
  defaultStyle INTEGER,
  PRIMARY KEY (id),
  FOREIGN KEY(productId)
  REFERENCES products(id)
);

COPY styles(id, productId, name, salePrice, originalPrice, defaultStyle)
FROM '/Users/sarahfolk/Hack Reactor/sdc-aragorn/db/styles.csv'
DELIMITER ','
CSV HEADER;

CREATE TABLE photos (
  id INTEGER,
  styleId INTEGER,
  url VARCHAR(1000),
  thumbnailUrl VARCHAR(1000),
  PRIMARY KEY (id),
  FOREIGN KEY(styleId)
  REFERENCES styles(id)
);

COPY photos(id, styleId, url, thumbnailUrl)
FROM '/Users/sarahfolk/Hack Reactor/sdc-aragorn/db/photos.csv'
DELIMITER ','
CSV HEADER;

CREATE TABLE skus (
  id INTEGER,
  styleId INTEGER,
  size VARCHAR(10),
  quantity INTEGER,
  PRIMARY KEY (id),
  FOREIGN KEY(styleId)
  REFERENCES styles(id)
);

COPY skus(id, styleId, size, quantity)
FROM '/Users/sarahfolk/Hack Reactor/sdc-aragorn/db/skus.csv'
DELIMITER ','
CSV HEADER;