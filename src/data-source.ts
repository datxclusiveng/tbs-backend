import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "./entities/User";

dotenv.config();

function requireEnv(key: string, fallback?: string): string {
    const val = process.env[key] ?? fallback;
    if (val === undefined) throw new Error(`Environment variable ${key} is required`);
    return val;
}

export const AppDataSource = new DataSource({
    type: "postgres",
    host: requireEnv("DB_HOST"),
    port: parseInt(process.env.DB_PORT || "5432"),
    username: requireEnv("DB_USERNAME"),
    password: requireEnv("DB_PASSWORD"),
    database: requireEnv("DB_NAME"),
    synchronize: process.env.NODE_ENV === "development", // Auto-creates tables in dev
    logging: true,
    entities: [User],
    subscribers: [],
    migrations: [],
});