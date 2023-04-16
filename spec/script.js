const http = require('k6/http');
const { check, sleep } = require('k6');

module.exports = {
  options: {
    stages: [
      { duration: '5s', target: 0 },
      { duration: '30s', target: 1500 },
      { duration: '5s', target: 0 }
    ]
  },

  default: function () {
    const pages = [
      '/products?count=10&page=4',
      '/products/963547',
      '/products/936565/styles',
      '/products/936547/related',
      '/products/863595/overview',
      '/products/1/related-cards',
      '/products/843760/card'
    ]

    for (let page of pages) {
      const res = http.get('http://hr-products-api-e14073b20de9c418.elb.us-east-2.amazonaws.com:3000' + page);
      // check(res, {
      //   'status was 200': (r) => r.status === 200,
      //   'duration was <= 20ms': (r) => r.timings.duration <= 20,
      //   'duration was <= 50ms': (r) => r.timings.duration <= 50,
      //   'duration was <= 200ms': (r) => r.timings.duration <= 200,
      // });
      check(res, { 'status was 200': (r) => r.status == 200 });
      sleep(1);
    }
  }
}