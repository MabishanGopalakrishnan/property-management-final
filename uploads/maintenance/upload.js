import multer from "multer";
import path from "path";

// Local storage (for assignment)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/maintenance/");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

export const maintenanceUpload = multer({ storage });
