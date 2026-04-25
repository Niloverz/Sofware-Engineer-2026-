const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

app.use('/service1', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: { '^/service1': '' }
}));

app.use('/service2', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: { '^/service2': '' }
}));

app.listen(PORT, () => {
  console.log(`API Gateway berjalan di http://localhost:${PORT}`);
  console.log(` Service1 via http://localhost:${PORT}/service1`);
  console.log(` Service2 via http://localhost:${PORT}/service2`);
});