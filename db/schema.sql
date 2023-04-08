DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS features;
DROP TABLE IF EXISTS related;
DROP TABLE IF EXISTS styles;
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS skus;

CREATE TABLE products (
  id INTEGER,
  name VARCHAR(255),
  slogan VARCHAR(2000),
  description VARCHAR(20000),
  category VARCHAR(255),
  defaultPrice NUMERIC,
  PRIMARY KEY (id)
);

COPY products(id, name, slogan, description, category, defaultPrice)
FROM '/Users/sarahfolk/Hack Reactor/sdc-aragorn/db/product.csv'
DELIMITER ','
CSV HEADER;

CREATE TABLE features (
  id INTEGER,
  productId INTEGER,
  feature VARCHAR(255),
  value VARCHAR(255),
  PRIMARY KEY (id)
);

COPY features(id, productId, feature, value)
FROM '/Users/sarahfolk/Hack Reactor/sdc-aragorn/db/features.csv'
DELIMITER ','
CSV HEADER;

CREATE TABLE related (
  id INTEGER,
  currentId INTEGER,
  relatedId INTEGER,
  PRIMARY KEY (id)
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
  PRIMARY KEY (id)
);

COPY styles(id, productId, name, salePrice, originalPrice, defaultStyle)
FROM '/Users/sarahfolk/Hack Reactor/sdc-aragorn/db/styles.csv'
DELIMITER ','
CSV HEADER;

CREATE TABLE photos (
  id INTEGER,
  styleId INTEGER,
  url VARCHAR,
  thumbnailUrl VARCHAR,
  PRIMARY KEY (id)
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
  PRIMARY KEY (id)
);

COPY skus(id, styleId, size, quantity)
FROM '/Users/sarahfolk/Hack Reactor/sdc-aragorn/db/skus.csv'
DELIMITER ','
CSV HEADER;