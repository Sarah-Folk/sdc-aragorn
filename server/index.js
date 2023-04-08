const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const connection = require('../db/connection.js');
const port = 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(morgan('tiny'));
app.use(cors());

app.get('/', (req, res) => {
  res.send({info: 'PostgreSQL Product API'});
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});