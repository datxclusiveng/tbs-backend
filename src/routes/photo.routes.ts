import { Router } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import * as PhotoController from "../controllers/photo.controller";
import authenticate from "../middlewares/auth.middleware";
import path from "path";
import fs from "fs";

const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsDir),
  filename: (_, file, cb) => {
    // Use UUID to avoid collisions and do not trust original name
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uuidv4() + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.mimetype)) return cb(new Error("Invalid file type"));
    cb(null, true);
  },
});

const router = Router();

router.post("/", authenticate, upload.single("photo"), PhotoController.upload);
// bulk upload: main gallery feature — require `groupName` in body and up to 20 files
router.post("/bulk", authenticate, upload.array("photos", 20), PhotoController.bulkUpload);
router.get("/", PhotoController.list);
router.get("/groups", PhotoController.listGroups);
router.get("/groups/:groupId", PhotoController.listByGroup);
router.get("/:id", PhotoController.serve);
router.delete("/:id", authenticate, PhotoController.remove);

export default router;
