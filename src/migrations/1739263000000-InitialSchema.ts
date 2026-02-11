import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1739263000000 implements MigrationInterface {
  name = "InitialSchema1739263000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure uuid-ossp extension exists for uuid_generate_v4()
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Enums
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'inactive', 'suspended')`,
    );

    // Users table
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "status" "public"."users_status_enum" NOT NULL DEFAULT 'active', "emailVerified" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672df88afb53940691238d81e" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1cbb6412193e4612e31536" PRIMARY KEY ("id"))`,
    );

    // Projects table
    await queryRunner.query(
      `CREATE TABLE "projects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text NOT NULL, "coreTechs" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_627dea0834241e3d304523fb88e" PRIMARY KEY ("id"))`,
    );

    // Photos table
    await queryRunner.query(
      `CREATE TABLE "photos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "filename" character varying NOT NULL, "originalName" character varying NOT NULL, "mimeType" character varying NOT NULL, "size" integer NOT NULL, "uploaderId" character varying, "groupName" character varying, "projectId" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4006e89698d254d3e75e921e06c" PRIMARY KEY ("id"))`,
    );

    // Foreign Keys
    await queryRunner.query(
      `ALTER TABLE "photos" ADD CONSTRAINT "FK_PROJECT_PHOTOS" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "photos" DROP CONSTRAINT "FK_PROJECT_PHOTOS"`,
    );
    await queryRunner.query(`DROP TABLE "photos"`);
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
