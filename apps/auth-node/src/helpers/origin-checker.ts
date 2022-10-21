import { NextFunction, Request, Response } from "express";

export const originChecker = (req:Request, res:Response, next:NextFunction, allowlist: string[]) => {
  const origin = req.headers.origin;
  if (!origin) {
    return next()
  }
  console.log("🚀 ~ file: index.ts ~ line 46 ~ app.use ~ origin", origin);
  if (!origin) {
    return res
      .status(403)
      .send(
        '<h1 style="text-align:center;margin-top:300px;">You are not allowed to access this resource. Please contact the administrator.</h1>'
      );
  }
  if (allowlist.indexOf(origin) !== -1) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
};