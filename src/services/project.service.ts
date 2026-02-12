import { AppDataSource } from "../data-source";
import { Project } from "../entities/project.entity";
import { Photo } from "../entities/photo.entity";
import PhotoService from "./photo.service";

const projectRepo = () => AppDataSource.getRepository(Project);
const photoRepo = () => AppDataSource.getRepository(Photo);

export class ProjectService {
  static async create(data: { title: string; description: string; coreTechs?: string[] }, files?: Express.Multer.File[]) {
    if (data.description.length < 50) {
      throw new Error("Project description must be at least 50 characters long.");
    }

    const project = projectRepo().create(data);
    await projectRepo().save(project);

    if (files && files.length > 0) {
      const uploadFiles = files.slice(0, 5); // Enforce up to 5 images
      for (const file of uploadFiles) {
        const photo = await PhotoService.saveFile(file);
        photo.projectId = project.id;
        await photoRepo().save(photo);
      }
    }

    return this.getById(project.id);
  }

  static async update(id: string, data: Partial<{ title: string; description: string; coreTechs: string[] }>, files?: Express.Multer.File[]) {
    const project = await projectRepo().findOne({ where: { id }, relations: ["photos"] });
    if (!project) throw new Error("Project not found");

    if (data.description && data.description.length < 50) {
      throw new Error("Project description must be at least 50 characters long.");
    }

    // Only update fields that are provided
    if (data.title !== undefined) project.title = data.title;
    if (data.description !== undefined) project.description = data.description;
    if (data.coreTechs !== undefined) project.coreTechs = data.coreTechs;

    await projectRepo().save(project);

    if (files && files.length > 0) {
      const currentCount = project.photos.length;
      const remainingSlots = 5 - currentCount;
      if (remainingSlots > 0) {
        const uploadFiles = files.slice(0, remainingSlots);
        for (const file of uploadFiles) {
          const photo = await PhotoService.saveFile(file);
          photo.projectId = project.id;
          await photoRepo().save(photo);
        }
      }
    }

    return this.getById(id);
  }

  static async delete(id: string) {
    const project = await projectRepo().findOne({ where: { id }, relations: ["photos"] });
    if (!project) throw new Error("Project not found");

    // Delete associated photos from FS and DB
    for (const photo of project.photos) {
      await PhotoService.deletePhoto(photo.id);
    }

    await projectRepo().remove(project);
    return true;
  }

  static async list(page = 1, limit = 10) {
    const [data, total] = await projectRepo().findAndCount({
      relations: ["photos"],
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Map photo URLs for each project
    const dataWithUrls = data.map(project => ({
      ...project,
      photos: project.photos.map(p => ({
        ...p,
        url: `/api/photos/${p.id}`
      }))
    }));

    return {
      data: dataWithUrls,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getById(id: string) {
    const project = await projectRepo().findOne({
      where: { id },
      relations: ["photos"],
    });
    if (!project) return null;

    // Map photo URLs
    const photosWithUrls = project.photos.map(p => ({
      ...p,
      url: `/api/photos/${p.id}` // Basic internal URL, controller will prepend host
    }));

    return { ...project, photos: photosWithUrls };
  }
}

export default ProjectService;
