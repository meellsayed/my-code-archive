import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

export const fileValidations = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  document: ["application/pdf", "application/msword"],
};

export const uploadCloudFile = (allowedMimeTypes = []) => {
  const storage = multer.diskStorage({});
  function fileFilter(req, file, cb) {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("In-valid file format", { cause: 400 }), false);
    }
  }
  return multer({ storage, fileFilter, det: "tempPath" });
};
