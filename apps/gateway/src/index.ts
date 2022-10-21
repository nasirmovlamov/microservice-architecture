import express from "express";
import { ROUTES } from "./routes";
const cors = require("cors");
const { setupLogging } = require("./logging");
const { setupProxies } = require("./proxy");
const { setupRateLimit } = require("./rate-limit");

export const app = express();
const port = 9000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
setupLogging(app);
setupRateLimit(app, ROUTES);
setupProxies(app, ROUTES);

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

app.listen(port);
