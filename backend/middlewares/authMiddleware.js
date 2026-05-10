import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to protect routes (auth required)
export const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify token and get user ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request object (without password)
      req.user = await User.findById(decoded.id).select("-password");

      return next();
    } catch (err) {
      console.error("Auth error:", err.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // If no token provided
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Middleware to allow only admins
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Admin access required" });
};
