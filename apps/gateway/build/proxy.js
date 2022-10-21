"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupProxies = void 0;
var http_proxy_middleware_1 = require("http-proxy-middleware");
var setupProxies = function (app, routes) {
    routes.forEach(function (r) {
        app.use(r.url, (0, http_proxy_middleware_1.createProxyMiddleware)(r.proxy));
    });
};
exports.setupProxies = setupProxies;
