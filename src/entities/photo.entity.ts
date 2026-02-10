import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

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

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}

export default Photo;
