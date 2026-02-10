import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Photo } from "./photo.entity";

@Entity({ name: "projects" })
export class Project {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "simple-array", nullable: true })
  coreTechs: string[];

  @OneToMany(() => Photo, (photo) => photo.project)
  photos: Photo[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
