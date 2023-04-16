require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const Promise = require('bluebird');
const controller = require('../db/controllers.js');
const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(morgan('tiny'));
app.use(cors());

app.get('/products', (req, res) => {
  let startingId;
  let endingId;
  let count = req.query.count;
  let page = req.query.page;
  if (!count && !page) {
    startingId = 1;
    endingId = 5;
  } else if (count && !page) {
    startingId = 1;
    endingId = Number(count);
  } else if (!count && page) {
    startingId = (Number(page) - 1) * 5 + 1;
    endingId = startingId + 4;
  } else {
    startingId = (Number(page) - 1) * Number(count) + 1;
    endingId = startingId + Number(count) - 1;
  }
  controller.retrieveProductsFromDatabase(startingId, endingId)
  .then(result => {
    return res.send(result.rows);
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
    return res.send(result.rows[0].result);
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
      return res.send(result.rows[0].result);
    } else {
      return res.send({'product_id': id, 'results': []})
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
    return res.send(result.rows[0].related_ids);
  })
  .catch(err => {
    console.log(err);
    res.end();
  });
});

app.get('/products/:product_id/overview', (req, res) => {
  let id = req.client.parser.incoming.params.product_id;
  controller.retrieveOverviewDataFromDatabaseById(id)
  .then(result => {
    if (result.rows.length) {
      return res.send(result.rows[0].result);
    } else {
      controller.retrieveProductFromDatabaseById(id)
      .then(result => {
        result.rows[0].result.styles = null;
        return res.send(result.rows[0].result);
      })
    }
  })
  .catch(err => {
    console.log(err);
    res.end();
  });
});

app.get('/products/:product_id/related-cards', (req, res) => {
  let id = req.client.parser.incoming.params.product_id;
  controller.retrieveRelatedFromDatabaseById(id)
  .then(result => {
    return controller.formatProductCardsData(result.rows[0].related_ids);
  })
  .then(cards => {
    return res.send(cards);
  })
  .catch(err => {
    console.log(err);
    res.end();
  });
});

app.get('/products/:product_id/card', (req, res) => {
  let id = req.client.parser.incoming.params.product_id;
  controller.retrieveProductCardsDataFromDatabaseById(id)
  .then(result => {
    if (result.rows.length) {
      return res.send(result.rows[0].result);
    } else {
      controller.retrieveProductFromDatabaseById(id)
      .then(result => {
        result.rows[0].result.styles = null;
        delete result.rows[0].result.slogan;
        delete result.rows[0].result.description;
        return res.send(result.rows[0].result);
      })
    }
  })
  .catch(err => {
    console.log(err);
    res.end();
  });
});

app.get('/loaderio-a365e0b8666e71f7c842e4aa192c1778', (req, res) => {
  res.sendFile(path.join(__dirname, '../spec/loaderio-a365e0b8666e71f7c842e4aa192c1778.txt'), err => console.log(err));
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

module.exports = app;