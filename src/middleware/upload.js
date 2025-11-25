// backend/src/middleware/upload.js
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local storage upload handler (assignment-friendly)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/maintenance"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

export const maintenanceUpload = multer({ storage });
