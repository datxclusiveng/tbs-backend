import { Request, Response } from "express";
import ProjectService from "../services/project.service";

export class ProjectController {
  static async create(req: Request, res: Response) {
    try {
      const { title, description, coreTechs } = req.body;
      const files = (req as any).files as Express.Multer.File[] | undefined;
      const project = await ProjectService.create({ title, description, coreTechs }, files);
      
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      if (project && project.photos) {
        project.photos = project.photos.map(p => ({ ...p, url: `${baseUrl}/api/photos/${p.id}` }));
      }

      return res.status(201).json(project);
    } catch (error: any) {
      return res.status(error.message.includes("description") ? 400 : 500).json({ message: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!id) return res.status(400).json({ message: "Project ID is required" });
      const { title, description, coreTechs } = req.body;
      const files = (req as any).files as Express.Multer.File[] | undefined;
      const project = await ProjectService.update(id, { title, description, coreTechs }, files);
      
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      if (project && project.photos) {
          project.photos = project.photos.map(p => ({ ...p, url: `${baseUrl}/api/photos/${p.id}` }));
      }

      return res.json(project);
    } catch (error: any) {
      return res.status(error.message === "Project not found" ? 404 : 400).json({ message: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!id) return res.status(400).json({ message: "Project ID is required" });
      await ProjectService.delete(id);
      return res.json({ message: "Project deleted successfully" });
    } catch (error: any) {
      return res.status(error.message === "Project not found" ? 404 : 500).json({ message: error.message });
    }
  }

  static async list(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await ProjectService.list(page, limit);
    return res.json(result);
  }

  static async getById(req: Request, res: Response) {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!id) return res.status(400).json({ message: "Project ID is required" });
      const project = await ProjectService.getById(id);
      if (!project) return res.status(404).json({ message: "Project not found" });

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      project.photos = project.photos.map(p => ({ ...p, url: `${baseUrl}/api/photos/${p.id}` }));

      return res.json(project);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default ProjectController;
