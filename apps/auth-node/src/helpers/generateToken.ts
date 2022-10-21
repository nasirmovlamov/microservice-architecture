import jwt from "jsonwebtoken";
require("dotenv").config();

export const generateToken = (payload: {
  id: string;
  username: string;
  email: string;
}) => {
  console.log(process.env.JWT_EXPIRATION);
  return jwt.sign(payload, process.env.JWT_SECRET || "", {
    expiresIn: parseInt(process.env.JWT_EXPIRATION || "10800") || "1h",
  });
};

export const generateRefreshToken = (payload: {
  id: string;
  username: string;
  email: string;
}) => {
  return jwt.sign(payload, process.env.JWT_SECRET || "", {
    expiresIn: process.env.JWT_REFRESH_EXPIRATION || "1d",
  });
};

export const verifyToken = (token: string) => {
  try {
    const isTokenVerified = jwt.verify(token, process.env.JWT_SECRET || "");
    return jwt.verify(token, process.env.JWT_SECRET || "");
  } catch (error) {
    return null;
  }
};
