import { Application } from "express";
import { ROUTES } from "./routes";

const rateLimit = require("express-rate-limit");

export const setupRateLimit = (app:Application, routes:typeof ROUTES) => {
  routes.forEach((r) => {
    if (r.rateLimit) {
      app.use(r.url, rateLimit(r.rateLimit));
    }
  });
};

