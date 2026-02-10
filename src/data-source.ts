import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
// import { User } from "./entities/user.entities";

dotenv.config();

// function requireEnv(key: string, fallback?: string): string {
//     const val = process.env[key] ?? fallback;
//     if (val === undefined) throw new Error(`Environment variable ${key} is required`);
//     return val;
// }

export const AppDataSource = new DataSource({
    type: "postgres",
    // If DATABASE_URL is provided, prefer it (useful for Heroku / managed DBs)
    ...(process.env.DATABASE_URL ? { url: process.env.DATABASE_URL } : {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USER || process.env.DB_USERNAME || "postgres",
        password: process.env.DB_PASSWORD || process.env.DB_PASSWORD || "postgres",
        database: process.env.DB_NAME || "urni_schedule",
    }),
    // Use synchronize for initial setup, or set RUN_MIGRATIONS=true to use migrations
    synchronize: process.env.RUN_MIGRATIONS !== "true" && process.env.NODE_ENV !== "production",
    logging: process.env.NODE_ENV !== "production",
    // Automatically run migrations if RUN_MIGRATIONS=true
    migrationsRun: process.env.RUN_MIGRATIONS === "true",
    // Entities / migrations depending on environment
    entities: process.env.NODE_ENV === "production" ? ["dist/src/entities/**/*.js"] : ["src/entities/**/*.ts"],
    migrations: process.env.NODE_ENV === "production" ? ["dist/src/migrations/**/*.js"] : ["src/migrations/**/*.ts"],
    subscribers: process.env.NODE_ENV === "production" ? ["dist/src/subscribers/**/*.js"] : ["src/subscribers/**/*.ts"],
    // SSL for production when using a DATABASE_URL (adjust via env var DATABASE_SSL=true)
    ...((process.env.DATABASE_URL && (process.env.DATABASE_SSL === "true" || process.env.NODE_ENV === "production")) ? {
        ssl: { rejectUnauthorized: false } as any
    } : {}),
});