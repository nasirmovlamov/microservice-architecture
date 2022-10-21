"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var morgan = require("morgan");
var setupLogging = function (app) {
    app.use(morgan("combined"));
};
exports.setupLogging = setupLogging;
