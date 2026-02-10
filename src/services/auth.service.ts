import { AppDataSource } from "../data-source";
import { User } from "../entities/user.entities";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const repo = () => AppDataSource.getRepository(User);

export class AuthService {
  static async register(payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const existing = await repo().findOne({ where: { email: payload.email } });
    if (existing) throw new Error("Email already in use");

    const hashed = await bcrypt.hash(payload.password, 10);
    const user = repo().create({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      password: hashed,
    });
    await repo().save(user);

    const { password, ...rest } = user as any;
    return rest as Partial<User>;
  }

  static async login(email: string, password: string) {
    const user = await repo().findOne({ where: { email }, select: ["id", "email", "password", "firstName", "lastName", "role"] });
    if (!user) throw new Error("Invalid credentials");
    const match = await bcrypt.compare(password, user.password as string);
    if (!match) throw new Error("Invalid credentials");

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not set");

    const token = jwt.sign({ sub: user.id, role: user.role }, secret, { expiresIn: "1h" });

    const { password: _p, ...safe } = user as any;
    return { accessToken: token, user: safe };
  }
}

export default AuthService;
