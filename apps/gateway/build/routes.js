"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROUTES = void 0;
exports.ROUTES = [
    {
        url: "/auth",
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            max: 25, // limit each IP to 5 requests per windowMs
        },
        proxy: {
            target: "http://localhost:8080",
            changeOrigin: false,
            allowMethods: ["GET", "POST", "PUT", "DELETE"],
            origin: "http://localhost:9000",
            onProxyReq: function (proxyReq, req, res) {
                proxyReq.setHeader("origin", "http://localhost:9000");
            },
        },
    },
];
