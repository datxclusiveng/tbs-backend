import { Request, Response } from "express";
import PhotoService from "../services/photo.service";
import { AppDataSource } from "../data-source";
import Photo from "../entities/photo.entity";
import type { Photo as PhotoType } from "../entities/photo.entity";
import path from "path";
import fs from "fs";

export const upload = async (req: Request, res: Response) => {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) return res.status(400).json({ message: "No file uploaded" });
  const uploaderId = (req as any).user?.id;
  const groupName = typeof req.body.groupName === "string" ? req.body.groupName : undefined;
  const photo = await PhotoService.saveFile(file, uploaderId, groupName);
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return res.status(201).json({ ...photo, url: `${baseUrl}/api/photos/${photo.id}` });
};

export const list = async (req: Request, res: Response) => {
  const uploaderId = (req as any).user?.id;
  if (!uploaderId) return res.status(401).json({ message: "Unauthorized" });
  
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const { data: photos, total } = await PhotoService.listByUploader(uploaderId, page, limit);
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const mapped = photos.map((p: PhotoType) => ({ ...p, url: `${baseUrl}/api/photos/${p.id}` }));
  
  return res.json({
    data: mapped,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
};

export const serve = async (req: Request, res: Response) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!id) return res.status(400).json({ message: "Invalid id" });
  const result = await PhotoService.getPhoto(id);
  if (!result) return res.status(404).json({ message: "Not found" });
  const { path: filePath, photo } = result;

  // Ensure resolved path is in uploads dir
  const uploads = PhotoService.uploadsDir();
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(uploads)) return res.status(403).json({ message: "Forbidden" });
  
  const stat = await fs.promises.stat(resolved).catch(() => null);
  if (!stat) return res.status(404).json({ message: "Not found" });

  res.setHeader("Content-Type", req.query.type === "download" ? "application/octet-stream" : photo.mimeType);
  res.setHeader("Cache-Control", "public, max-age=3600");
  const stream = fs.createReadStream(resolved);
  stream.pipe(res);
};

export const remove = async (req: Request, res: Response) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!id) return res.status(400).json({ message: "Invalid id" });
  const uploaderId = (req as any).user?.id;
  const photoRepo = AppDataSource.getRepository(Photo);
  const photo = await photoRepo.findOneBy({ id });
  if (!photo) return res.status(404).json({ message: "Not found" });
  if (photo.uploaderId !== uploaderId && (req as any).user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  const ok = await PhotoService.deletePhoto(id);
  return res.json({ success: ok });
};

export const bulkUpload = async (req: Request, res: Response) => {
  const files = (req as any).files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) return res.status(400).json({ message: "No files uploaded" });
  const groupName = typeof req.body.groupName === "string" ? req.body.groupName : undefined;
  if (!groupName) return res.status(400).json({ message: "groupName is required for bulk uploads" });
  const uploaderId = (req as any).user?.id;
  const photos: PhotoType[] = await PhotoService.saveFiles(files, uploaderId, groupName);
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const mapped = photos.map((p: PhotoType) => ({ ...p, url: `${baseUrl}/api/photos/${p.id}` }));
  return res.status(201).json(mapped);
};

export const listByGroup = async (req: Request, res: Response) => {
  const rawGroupId = req.params.groupId;
  const groupId = Array.isArray(rawGroupId) ? rawGroupId[0] : rawGroupId;
  if (!groupId) return res.status(400).json({ message: "groupId is required" });
  
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const { data: photos, total } = await PhotoService.listByGroupId(groupId, page, limit);
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const mapped = photos.map((p: PhotoType) => ({ ...p, url: `${baseUrl}/api/photos/${p.id}` }));
  
  return res.json({
    data: mapped,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
};

export const listGroups = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const { data: groups, total } = await PhotoService.listAllGroups(page, limit);
  
  return res.json({
    data: groups,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
};

export default { upload, list, serve, remove, listByGroup, listGroups, bulkUpload };
