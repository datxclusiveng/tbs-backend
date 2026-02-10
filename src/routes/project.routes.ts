import { Router } from "express";
import ProjectController from "../controllers/project.controller";
import authenticate from "../middlewares/auth.middleware";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const router = Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images are allowed") as any, false);
  },
});

router.post("/", authenticate, upload.array("images", 5), ProjectController.create);
router.get("/", ProjectController.list);
router.get("/:id", ProjectController.getById);
router.put("/:id", authenticate, upload.array("images", 5), ProjectController.update);
router.delete("/:id", authenticate, ProjectController.delete);

export default router;
