import jwt from "jsonwebtoken";

export const authRequired = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export const requireLandlord = (req, res, next) => {
  if (req.user.role !== "LANDLORD") {
    return res.status(403).json({ error: "Landlord access only" });
  }
  next();
};

export const requireTenant = (req, res, next) => {
  if (req.user.role !== "TENANT") {
    return res.status(403).json({ error: "Tenant access only" });
  }
  next();
};
