import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Project } from "./project.entity";

@Entity({ name: "photos" })
export class Photo {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  filename: string; // internal filename (uuid + ext)

  @Column({ type: "varchar" })
  originalName: string;

  @Column({ type: "varchar" })
  mimeType: string;

  @Column({ type: "int" })
  size: number;

  @Column({ type: "varchar", nullable: true })
  uploaderId?: string;

  @Column({ type: "varchar", nullable: true })
  groupName?: string;

  @Column({ type: "uuid", nullable: true })
  projectId?: string;

  @ManyToOne(() => Project, (project) => project.photos, { onDelete: "CASCADE" })
  @JoinColumn({ name: "projectId" })
  project?: Project;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
