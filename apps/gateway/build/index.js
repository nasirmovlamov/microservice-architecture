"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
var express_1 = __importDefault(require("express"));
var routes_1 = require("./routes");
var cors = require("cors");
var setupLogging = require("./logging").setupLogging;
var setupProxies = require("./proxy").setupProxies;
var setupRateLimit = require("./rate-limit").setupRateLimit;
exports.app = (0, express_1.default)();
var port = 9000;
exports.app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
setupLogging(exports.app);
setupRateLimit(exports.app, routes_1.ROUTES);
setupProxies(exports.app, routes_1.ROUTES);
exports.app.get("/", function (_req, res) {
    res.send("Hello World!");
});
exports.app.listen(port);
