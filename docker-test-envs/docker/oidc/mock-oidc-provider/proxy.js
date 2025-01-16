// see ./oidc-mock-provider.js for why we need this proxy
const http = require('http');

const from = process.argv[2];
const to = process.argv[3];

http
  .createServer(function (clientReq, clientRes) {
    const options = {
      hostname: 'localhost',
      port: to,
      path: clientReq.url,
      method: clientReq.method,
      headers: clientReq.headers,
    };

    const proxy = http.request(options, function (res) {
      console.log(
        '[OIDC PROVIDER PROXY]',
        res.statusCode,
        clientReq.method,
        clientReq.url
      );
      res.statusCode !== 200 &&
        (() => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            console.log('[OIDC PROVIDER PROXY - ERROR]', data);
            console.log(
              '[OIDC PROVIDER PROXY - Content Type is]',
              clientReq.headers['content-type']
            );
          });
        })();
      clientRes.writeHead(res.statusCode, res.headers);
      res.pipe(clientRes, { end: true });
    });

    clientReq.pipe(proxy, { end: true });
  })
  .listen(from, '0.0.0.0', () => {
    console.log(`[OIDC PROVIDER PROXY] Listening on http://0.0.0.0:${from}`);
  });
