const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const controller = require('../db/controllers.js');
const port = 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(morgan('tiny'));
app.use(cors());

app.get('/products', (req, res) => {
  controller.retrieveProductsFromDatabase(Number(req.query.count))
  .then(result => {
    res.send(result.rows);
  })
  .catch(err => {
    console.log(err);
    res.end();
  });
});

app.get('/products/:product_id', (req, res) => {
  let id = req.client.parser.incoming.params.product_id;
  controller.retrieveProductFromDatabaseById(id)
  .then(result => {
    res.send(result.rows[0].result);
  })
  .catch(err => {
    console.log(err);
    res.end();
  });
});

app.get('/products/:product_id/styles', (req, res) => {
  let id = req.client.parser.incoming.params.product_id;
  controller.retrieveStylesFromDatabaseById(id)
  .then(result => {
    if (result.rows.length) {
      res.send(result.rows[0].result);
    } else {
      res.send({'product_id': id, 'results': []})
    }
  })
  .catch(err => {
    console.log(err);
    res.end();
  });
});

app.get('/products/:product_id/related', (req, res) => {
  let id = req.client.parser.incoming.params.product_id;
  controller.retrieveRelatedFromDatabaseById(id)
  .then(result => {
    res.send(result.rows[0].related_ids);
  })
  .catch(err => {
    console.log(err);
    res.end();
  });
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});