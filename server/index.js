require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const Promise = require('bluebird');
const memjs = require('memjs');
const controller = require('../db/controllers.js');
const port = process.env.PORT || 3000;
const app = express();
const memcached = memjs.Client.create();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(morgan('tiny'));
app.use(cors());

const verifyCache = (req, res, next) => {
  let id = req.params.product_id;
  memcached.get(id, (err, value) => {
    if (err) {
      throw err;
    }
    if (value !== null) {
      return res.send(JSON.parse(value));
    } else {
      return next();
    }
  });
};

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

app.get('/products/:product_id', verifyCache, (req, res) => {
  let id = req.params.product_id;
  controller.retrieveProductFromDatabaseById(id)
  .then(async result => {
    await memcached.set(id, JSON.stringify(result.rows[0].result), { expires: 600 });
    return res.send(result.rows[0].result);
  })
  .catch(err => {
    console.log(err);
    res.end();
  });
});

app.get('/products/:product_id/styles', verifyCache, (req, res) => {
  let id = req.params.product_id;
  controller.retrieveStylesFromDatabaseById(id)
  .then(async result => {
    if (result.rows.length) {
      await memcached.set(id, JSON.stringify(result.rows[0].result), { expires: 600 });
      return res.send(result.rows[0].result);
    } else {
      await memcached.set(id, JSON.stringify({'product_id': id, 'results': []}), { expires: 600 });
      return res.send({'product_id': id, 'results': []})
    }
  })
  .catch(err => {
    console.log(err);
    res.end();
  });
});

app.get('/products/:product_id/related', verifyCache, (req, res) => {
  let id = req.params.product_id;
  controller.retrieveRelatedFromDatabaseById(id)
  .then(async result => {
    await memcached.set(id, JSON.stringify(result.rows[0].related_ids), { expires: 600 });
    return res.send(result.rows[0].related_ids);
  })
  .catch(err => {
    console.log(err);
    res.end();
  });
});

app.get('/products/:product_id/overview', verifyCache, (req, res) => {
  let id = req.params.product_id;
  controller.retrieveOverviewDataFromDatabaseById(id)
  .then(async result => {
    if (result.rows.length) {
      await memcached.set(id, JSON.stringify(result.rows[0].result), { expires: 600 });
      return res.send(result.rows[0].result);
    } else {
      controller.retrieveProductFromDatabaseById(id)
      .then(async result => {
        result.rows[0].result.styles = null;
        await memcached.set(id, JSON.stringify(result.rows[0].result), { expires: 600 });
        return res.send(result.rows[0].result);
      })
    }
  })
  .catch(err => {
    console.log(err);
    res.end();
  });
});

app.get('/products/:product_id/related-cards', verifyCache, (req, res) => {
  let id = req.params.product_id;
  controller.retrieveRelatedFromDatabaseById(id)
  .then(result => {
    return controller.formatProductCardsData(result.rows[0].related_ids);
  })
  .then(async cards => {
    await memcached.set(id, JSON.stringify(cards), { expires: 600 });
    return res.send(cards);
  })
  .catch(err => {
    console.log(err);
    res.end();
  });
});

app.get('/products/:product_id/card', verifyCache, (req, res) => {
  let id = req.params.product_id;
  controller.retrieveProductCardsDataFromDatabaseById(id)
  .then(async result => {
    if (result.rows.length) {
      await memcached.set(id, JSON.stringify(result.rows[0].result), { expires: 600 });
      return res.send(result.rows[0].result);
    } else {
      controller.retrieveProductFromDatabaseById(id)
      .then(async result => {
        result.rows[0].result.styles = null;
        delete result.rows[0].result.slogan;
        delete result.rows[0].result.description;
        await memcached.set(id, JSON.stringify(result.rows[0].result), { expires: 600 });
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