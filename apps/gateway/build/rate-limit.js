"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRateLimit = void 0;
var rateLimit = require("express-rate-limit");
var setupRateLimit = function (app, routes) {
    routes.forEach(function (r) {
        if (r.rateLimit) {
            app.use(r.url, rateLimit(r.rateLimit));
        }
    });
};
exports.setupRateLimit = setupRateLimit;
