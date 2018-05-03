import http, { ClientRequestArgs } from 'http';
import https from 'https';
import parse from 'url-parse'

class HttpClient {

  getOptions(url: string, method: string): ClientRequestArgs {
    const { protocol, host, pathname } = parse(url);
    return {
      protocol,
      host,
      path: pathname,
      method,
    }
  }

  get(url: string){
    const options = this.getOptions(url, 'GET');
    return this.request(options);
  }

  post(url: string, data: any){
    const options = this.getOptions(url, 'POST');
    return this.request(options, data);
  }

  put(url: string, data: any){
    const options = this.getOptions(url, 'PUT');
    return this.request(options, data);
  }

  patch(url: string, data: any){
    const options = this.getOptions(url, 'PATCH');
    return this.request(options, data);
  }

  delete(url: string){
    const options = this.getOptions(url, 'DELETE');
    return this.request(options);
  }

  request(options: ClientRequestArgs, postData?) {
    return new Promise((resolve, reject) => {
      const client: any = options.protocol == 'http:' ? http : https
      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e)
          }
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


