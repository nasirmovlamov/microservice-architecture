"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
var express_1 = __importDefault(require("express"));
exports.app = (0, express_1.default)();
var port = 8080;
var allowlist = ["http://localhost:9000"];
exports.app.use(function (req, res, next) {
    var origin = req.headers.origin;
    console.log("🚀 ~ file: index.ts ~ line 46 ~ app.use ~ origin", origin);
    if (!origin) {
        return res
            .status(403)
            .send('<h1 style="text-align:center;margin-top:300px;">You are not allowed to access this resource. Please contact the administrator.</h1>');
    }
    if (allowlist.indexOf(origin) !== -1) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
exports.app.get("/auth", function (_req, res) {
    res.send("Hello World FROM AUTH!");
});
exports.app.listen(port);
