const pg = require('pg');
const path = require('path');
let connectionUrl = 'postgresql://localhost/products';
const pgClient = new pg.Client(connectionUrl);
pgClient.connect();

const retrieveProductsFromDatabase = (count) => {
  count = count || 5;
  let query = pgClient.query(`
    SELECT *
    FROM products WHERE id <= ${count};
  `);
  return query;
};

const retrieveProductFromDatabaseById = (id) => {
  let query = pgClient.query(`
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
          'value', f.value
        )), '[]'::json)
        FROM features f WHERE productid = ${id})
      ) AS result
    FROM products p WHERE p.id = ${id}
    GROUP BY p.id;
  `);
  return query;
};

const retrieveStylesFromDatabaseById = (id) => {
  let query = pgClient.query(`
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
  let query = pgClient.query(`
    SELECT COALESCE(json_agg(
      relatedid), '[]'::json) AS related_ids
    FROM related WHERE currentid = ${id};
  `);
  return query;
}

module.exports = {
  retrieveProductsFromDatabase,
  retrieveProductFromDatabaseById,
  retrieveStylesFromDatabaseById,
  retrieveRelatedFromDatabaseById
};