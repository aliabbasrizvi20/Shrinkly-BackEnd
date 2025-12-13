import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export const urlAuth = (req, res, next) => {
  const tokenHeader = req.headers.authorization;
  if (!tokenHeader) {
    req.userId = null;
    return next(); // anonymous user
  }

  const token = tokenHeader.split(" ")[1];
  if (!token || token === "null") {
    req.userId = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
  } catch (error) {
    // silently ignore invalid tokens for anonymous users
    req.userId = null;
  }
  next();
};


// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
// dotenv.config();

// export const urlAuth = (req, res, next) => {
//   const tokenHeader = req.headers.authorization;
//   if (!tokenHeader) {
//     req.userId = null;
//     return next();
//   }
//   const token = tokenHeader.split(" ")[1];
//   if (!token) {
//     req.userId = null;
//     return next();
//   }

//   try {
//     if (token) {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.userId = decoded.userId;
//       next();
//     }
//     else {
//       next();
//     }
//   } catch (error) {
//     console.log("JWT Error", error);
//     req.userId = null;
//     return next();
//   }
// };
