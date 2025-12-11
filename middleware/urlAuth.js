import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const urlAuth = (req, res, next) => {
  const tokenHeader = req.headers.authorization;
  if (!tokenHeader) {
    req.userId = null;
    return next();
  }
  const token = tokenHeader.split(" ")[1];
  if (!token) {
    req.userId = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log("JWT Error", error);
    req.userId = null;
    return next();
  }
};
