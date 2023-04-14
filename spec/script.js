const http = require('k6/http');
const { check, sleep } = require('k6');

module.exports = {
  options: {
    stages: [
      { duration: '5s', target: 0 },
      { duration: '30s', target: 5000 },
      { duration: '5s', target: 0 }

    ]
    // ,
    // thresholds: {
    //   http_req_duration: ['p(90)<20', 'p(95)<50', 'p(100)<200']
    // }
  },

  default: function () {

    const pages = [
      '/products?count=18&page=4',
      '/products/963547',
      '/products/936565/styles',
      '/products/936547/related',
      '/products/863595/overview',
      '/products/1/related-cards',
      '/products/843760/card'
    ]

    // for (let page of pages) {
      const res = http.get('http://localhost:3000/products');
      // check(res, {
      //   'status was 200': (r) => r.status === 200,
      //   'duration was <= 20ms': (r) => r.timings.duration <= 20,
      //   'duration was <= 50ms': (r) => r.timings.duration <= 50,
      //   'duration was <= 200ms': (r) => r.timings.duration <= 200,
      // });
      check(res, { 'status was 200': (r) => r.status == 200 });
      sleep(1);
    // }
  }
}