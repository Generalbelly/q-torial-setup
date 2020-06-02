import * as https from 'https';
import * as http from 'http';

interface requestOptions {
  protocol: string,
  method: string,
  hostname: string,
  path: string,
}

export const makeRequest = async (options: requestOptions): Promise<http.IncomingMessage> => new Promise(
  (resolve, reject) => {
    const req = https.request({
      protocol: options.protocol,
      method: options.method,
      hostname: options.hostname,
      path: options.path,
    }, (res) => {
      resolve(res);
    });
    req.on('error', (e) => {
      reject(e);
    });
    req.end();
  });
