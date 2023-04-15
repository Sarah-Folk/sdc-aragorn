require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const retrieveProductsFromDatabase = (start, end) => {
  start = start || 1;
  end = end || 5;
  let query = pool.query(`
    SELECT *
    FROM products WHERE id >= ${start} AND id <= ${end};
  `);
  return query;
};

const retrieveProductFromDatabaseById = (id) => {
  let query = pool.query(`
    SELECT
      json_build_object(
        'id', p.id,
        'name', p.name,
        'slogan', p.slogan,
        'description', p.description,
        'category', p.category,
        'default_price', p.default_price,
        'features', (SELECT
        COALESCE(json_agg(json_build_object(
          'feature', f.feature,
          'value', CASE WHEN f.value = 'null' THEN null
          ELSE f.value END
        )), '[]'::json)
        FROM features f WHERE productid = ${id})
      ) AS result
    FROM products p WHERE p.id = ${id}
    GROUP BY p.id;
  `);
  return query;
};

const retrieveStylesFromDatabaseById = (id) => {
  let query = pool.query(`
    SELECT
      json_build_object(
        'product_id', s.productid,
        'results', json_agg(
          json_build_object(
            'style_id', s.id,
            'name', s.name,
            'original_price', s.originalprice,
            'sale_price', CASE WHEN s.saleprice = 'null' THEN null
            ELSE s.saleprice END,
            'default?', CASE WHEN s.defaultstyle = 1 THEN true
              ELSE false END,
            'photos', (
              SELECT json_agg(
                json_build_object(
                  'thumbnail_url', p.thumbnailurl,
                  'url', p.url
                )
              )
              FROM photos p WHERE p.styleid = s.id
            ),
            'skus', (
              SELECT json_object_agg(
                sk.id, json_build_object(
                  'quantity', sk.quantity,
                  'size', sk.size
                )
              )
              FROM skus sk WHERE sk.styleid = s.id
            )
          )
        )
      ) AS result
    FROM styles s WHERE s.productid = ${id}
    GROUP BY s.productid;
  `)
  return query;
};

const retrieveRelatedFromDatabaseById = (id) => {
  let query = pool.query(`
    SELECT COALESCE(json_agg(
      relatedid), '[]'::json) AS related_ids
    FROM related WHERE currentid = ${id};
  `);
  return query;
};

const retrieveOverviewDataFromDatabaseById = (id) => {
  let query = pool.query(`
    SELECT json_build_object(
      'id', p.id,
      'name', p.name,
      'category', p.category,
      'slogan', p.slogan,
      'description', p.description,
      'default_price', p.default_price,
      'features', (SELECT
        COALESCE(json_agg(json_build_object(
          'feature', f.feature,
          'value', CASE WHEN f.value = 'null' THEN null
          ELSE f.value END
        )), '[]'::json)
        FROM features f WHERE productid = ${id}),
      'styles', json_agg(
        json_build_object(
          'style_id', s.id,
          'style_name', s.name,
          'original_price', s.originalprice,
          'sale_price', CASE WHEN s.saleprice = 'null' THEN null
          ELSE s.saleprice END,
          'default?', CASE WHEN s.defaultstyle = ${id} THEN true
            ELSE false END,
          'photos', (
            SELECT json_agg(
              json_build_object(
                'thumbnail_url', p.thumbnailurl,
                'url', p.url
              )
            )
            FROM photos p WHERE p.styleid = s.id
          ),
          'skus', (
            SELECT json_object_agg(
              sk.id, json_build_object(
                'quantity', sk.quantity,
                'size', sk.size
              )
            )
            FROM skus sk WHERE sk.styleid = s.id
          )
        )
      )
    ) AS result
    FROM products p
    JOIN styles s ON s.productid = p.id AND p.id = ${id}
    GROUP BY p.id;
  `);
  return query;
};

const retrieveProductCardsDataFromDatabaseById = (id) => {
  let query = pool.query(`
    SELECT json_build_object(
      'id', p.id,
      'name', p.name,
      'category', p.category,
      'default_price', p.default_price,
      'features', (SELECT
        COALESCE(json_agg(json_build_object(
          'feature', f.feature,
          'value', CASE WHEN f.value = 'null' THEN null
          ELSE f.value END
        )), '[]'::json)
        FROM features f WHERE productid = ${id}),
      'styles', json_agg(
        json_build_object(
          'style_id', s.id,
          'style_name', s.name,
          'original_price', s.originalprice,
          'sale_price', CASE WHEN s.saleprice = 'null' THEN null
          ELSE s.saleprice END,
          'default?', CASE WHEN s.defaultstyle = ${id} THEN true
            ELSE false END,
          'photos', (
            SELECT json_agg(
              json_build_object(
                'thumbnail_url', p.thumbnailurl,
                'url', p.url
              )
            )
            FROM photos p WHERE p.styleid = s.id
          )
        )
      )
    ) AS result
    FROM products p
    JOIN styles s ON s.productid = p.id AND p.id = ${id}
    GROUP BY p.id;
  `);
  return query;
};

const formatProductCardsData = (ids) => {
  const promisesObject = {};
  if (ids.length) {
    ids.forEach(id => {
      promisesObject[id] = retrieveProductCardsDataFromDatabaseById(id.toString());
    });
  } else {
    return [];
  }
  const nestedPromisesArray = Object.entries(promisesObject);
  const idKeys = nestedPromisesArray.map(item => {
    return item[0];
  })
  const promiseValues = nestedPromisesArray.map(item => {
    return item[1];
  })
  const idsAndPromisesArray = [idKeys, promiseValues];
  const idsAndResults = {};
  return Promise.all(idsAndPromisesArray[1])
  .then(fulfilledPromises => {
    for (let i = 0; i < idsAndPromisesArray[0].length; i++) {
      idsAndResults[idsAndPromisesArray[0][i]] = fulfilledPromises[i];
    }
    return idsAndResults;
  })
  .then(async idsAndResults => {
    const cards = [];
    for (let id in idsAndResults) {
      if (idsAndResults[id].rows.length) {
        cards.push(idsAndResults[id].rows[0].result);
      } else {
        const result = await retrieveProductFromDatabaseById(id)
        delete result.rows[0].result.slogan;
        delete result.rows[0].result.description;
        result.rows[0].result.styles = [],
        cards.push(result.rows[0].result);
      }
    }
    return cards;
  })
  .catch(err => {
    console.log(err);
  });
};

module.exports = {
  retrieveProductsFromDatabase,
  retrieveProductFromDatabaseById,
  retrieveStylesFromDatabaseById,
  retrieveRelatedFromDatabaseById,
  retrieveOverviewDataFromDatabaseById,
  retrieveProductCardsDataFromDatabaseById,
  formatProductCardsData
};