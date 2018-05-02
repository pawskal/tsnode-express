const http = require('http');


class HttpClient {

  request(options, postData) {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve(JSON.parse(data));
        });
      });
      if (postData) {
        req.write(JSON.stringify(postData));
      }
      req.end();
      req.on('error', (error) => {
        reject(`problem with request: ${error.message}`);
      });
    });
  }
}

export default HttpClient;


