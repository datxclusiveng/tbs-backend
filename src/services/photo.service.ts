import { IsNull } from "typeorm";
import { AppDataSource } from "../data-source";
import { Photo } from "../entities/photo.entity";
import fs from "fs";
import path from "path";

const repo = () => AppDataSource.getRepository(Photo);

export class PhotoService {
  static uploadsDir() {
    return path.resolve(process.cwd(), "uploads");
  }

  static async saveFile(
    file: Express.Multer.File,
    uploaderId?: string,
    groupName?: string,
  ): Promise<Photo> {
    const data: Partial<Photo> = {
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
    if (uploaderId) data.uploaderId = uploaderId;
    if (groupName) data.groupName = groupName;

    const photo = repo().create(data);
    await repo().save(photo);
    return photo;
  }

  static async saveFiles(
    files: Express.Multer.File[],
    uploaderId?: string,
    groupName?: string,
  ) {
    if (!files || files.length === 0) return [];
    const saved: any[] = [];
    await AppDataSource.manager.transaction(async (manager) => {
      const r = manager.getRepository(Photo);
      for (const file of files) {
        const data: Partial<Photo> = {
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        };
        if (uploaderId) data.uploaderId = uploaderId;
        if (groupName) data.groupName = groupName;
        const photo = r.create(data as any);
        await r.save(photo);
        saved.push(photo);
      }
    });
    return saved as Photo[];
  }

  static async getPhoto(photoId: string) {
    const photo = await repo().findOneBy({ id: photoId });
    if (!photo) return null;
    return {
      path: path.join(PhotoService.uploadsDir(), photo.filename),
      photo,
    };
  }

  static async deletePhoto(photoId: string) {
    const photo = await repo().findOneBy({ id: photoId });
    if (!photo) return false;
    const filePath = path.join(PhotoService.uploadsDir(), photo.filename);
    try {
      await fs.promises.unlink(filePath);
    } catch (_) {
      // ignore file missing
    }
    await repo().remove(photo);
    return true;
  }

  static async listByUploader(uploaderId: string, page = 1, limit = 20) {
    const [data, total] = await repo().findAndCount({
      where: { uploaderId },
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  static async listAll(page = 1, limit = 20) {
    const [data, total] = await repo().findAndCount({
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  static async listByGroupId(photoId: string, page = 1, limit = 20) {
    const photo = await repo().findOneBy({ id: photoId });
    if (!photo) return { data: [], total: 0 };

    // Find all photos sharing the same groupName
    const [data, total] = await repo().findAndCount({
      where: { groupName: photo.groupName || IsNull() },
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  static async listAllGroups(page = 1, limit = 20) {
    // Use GROUP BY to find unique groups and pick a representative photo id per group.
    // MIN on uuid is not supported in Postgres, so use array_agg ordered by created_at
    // and take the first element (most recent) as the representative id.
    const query = repo()
      .createQueryBuilder("photo")
      .select(
        "(array_agg(photo.id ORDER BY photo.created_at DESC))[1]",
        "groupId",
      )
      .addSelect("photo.groupName", "groupName")
      .where("photo.groupName IS NOT NULL")
      .groupBy("photo.groupName")
      .orderBy("photo.groupName", "ASC")
      .offset((page - 1) * limit)
      .limit(limit);

    const data = await query.getRawMany();

    // For total unique groups count
    const totalResult = await repo()
      .createQueryBuilder("photo")
      .select("COUNT(DISTINCT photo.groupName)", "count")
      .where("photo.groupName IS NOT NULL")
      .getRawOne();

    return {
      data: data.map((g: any) => ({
        groupId: g.groupid || g.groupId,
        groupName: g.groupname || g.groupName,
      })),
      total: parseInt(totalResult.count),
    };
  }
}

export default PhotoService;
