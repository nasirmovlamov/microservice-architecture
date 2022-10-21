import { Application } from "express";

const morgan = require("morgan");

const setupLogging = (app:Application) => {
  app.use(morgan("combined"));
};

exports.setupLogging = setupLogging;
