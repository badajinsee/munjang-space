const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app: any) {
  app.use(
    "/ttb",
    createProxyMiddleware({
      target: "http://www.aladin.co.kr",
      changeOrigin: true,
    })
  );
};
