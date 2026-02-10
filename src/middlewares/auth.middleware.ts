import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User } from "../entities/user.entities";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ message: "Missing token" });
  const token = auth.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ message: "JWT_SECRET not set" });
  try {
    const payload: any = jwt.verify(token, secret);
    const user = await AppDataSource.getRepository(User).findOne({ where: { id: payload.sub }, select: ["id", "email", "firstName", "lastName", "role"] });
    if (!user) return res.status(401).json({ message: "Invalid token" });
    (req as any).user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authenticate;
