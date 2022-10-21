require("dotenv").config();

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION;
export const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION;
