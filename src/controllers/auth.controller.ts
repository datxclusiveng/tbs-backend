import { Request, Response } from "express";
import AuthService from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const user = await AuthService.register(req.body);
    return res.status(201).json(user);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const payload = await AuthService.login(email, password);
    return res.json(payload);
  } catch (err: any) {
    return res.status(401).json({ message: err.message });
  }
};

export const me = async (req: Request, res: Response) => {
  // user is attached by middleware
  return res.json({ user: (req as any).user });
};

export default { register, login, me };
