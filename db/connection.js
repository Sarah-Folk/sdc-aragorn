const pg = require('pg');
const path = require('path');
let connectionUrl = 'postgresql://localhost/products';
const pgClient = new pg.Client(connectionUrl);
console.log('after pgClient');
pgClient.connect();
console.log('after connect');

//Test queries to determine if I was successfully connecting to and updating the database:

// let query = pgClient.query(`CREATE TABLE SKUs (
//   id INTEGER,
//   styleId INTEGER,
//   size VARCHAR(50),
//   quantity INTEGER,
//   PRIMARY KEY (id)
// )`)
// let query = pgClient.query(`COPY SKUs(id, styleId, size, quantity) FROM '/Users/sarahfolk/Hack Reactor/sdc-aragorn/db/skus.csv' DELIMITER ',' CSV HEADER;`);
// let query = pgClient.query("INSERT INTO test(col1) VALUES('hello world 2')");


//commands from Rev and Stephen:

// const sqlScript = fs.readFileSync('path/to/sql_file.sql').toString();
//     return client.query(sqlScript);

// \i path/to/sql_file.sql

// COPY products FROM ‘/path/to/product.csv' DELIMITER ',' CSV HEADER;