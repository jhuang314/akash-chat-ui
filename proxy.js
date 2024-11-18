// import { createProxyMiddleware, fixRequestBody  } from 'http-proxy-middleware';
// import express from 'express';
// import http from 'http';

// const targetBase = 'http://localhost:3000';
// const agent = new http.Agent({ maxSockets: Number.MAX_VALUE });

// const replaceOrigin = (proxyReq, headerKey, newOrigin) => {
//   const headerValue = proxyReq.getHeader(headerKey);
//   typeof headerValue === 'string' &&
//     proxyReq.setHeader(headerKey, headerValue.replace(new URL(headerValue).origin, newOrigin));
// };

// let cookie;
// function relayRequestHeaders(proxyReq, req) {
//   if (cookie) {
//     proxyReq.setHeader('cookie', cookie);
//   }
// };

// function relayResponseHeaders(proxyRes, req, res) {
//   var proxyCookie = proxyRes.headers["set-cookie"];
//   if (proxyCookie) {
//     cookie = proxyCookie;
//   }
// };

// const proxy = createProxyMiddleware({
//   target: targetBase,
//   changeOrigin: true, // replaces only host header but not referer and origin
//   configure: (proxy) => {
//     proxy.on('proxyReq', (proxyReq) => {
//       replaceOrigin(proxyReq, 'referer', targetBase);
//       replaceOrigin(proxyReq, 'origin', targetBase);
//       if (cookie) {
//         proxyReq.setHeader('cookie', cookie);
//       }
//     });
//   },
//   agentOptions: {
//       secureProtocol: 'TLSv1_2_method'
//   },
//   agent: agent,
//   on: {
//     proxyRes: (proxyRes, req, res) => {
//       if (req.url.includes('/_app/immutable/workers')) {
//         console.log('PROXY: setting headers!');
//         console.log(req.url);
//         proxyRes.headers['Cross-Origin-Opener-Policy'] = 'same-origin';
//         proxyRes.headers['Cross-Origin-Embedder-Policy'] = 'require-corp';
//       }

//       let proxyCookie = proxyRes.headers["set-cookie"];
//       if (proxyCookie) {
//         console.log('proxying cookies', proxyCookie);
//         cookie = proxyCookie;
//       }
//     }
//   }
// });

// const app = express();

// app.use('/', proxy);

// app.listen(5000);
