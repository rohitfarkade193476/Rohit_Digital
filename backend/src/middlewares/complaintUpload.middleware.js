import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const ALLOWED_MIMES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const uploadDir = path.resolve(process.cwd(), "uploads", "complaints");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WEBP images are allowed"));
  }
};

const uploadComplaintImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});

export default uploadComplaintImage;
