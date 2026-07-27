import multer from "multer";
import os from "node:os";
import path from "node:path";

export const fileValidations = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  document: ["application/pdf", "application/msword"],
};

/**
 * @param {string[]} allowedMimeTypes
 * @returns {import('multer').Multer}
 */
export const uploadCloudFile = (allowedMimeTypes = []) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, os.tmpdir());
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("In-valid file format", { cause: 400 }), false);
    }
  };
  return multer({ storage, fileFilter });
};
