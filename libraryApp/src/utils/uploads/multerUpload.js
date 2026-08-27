import multer from "multer";
import { isAllowedMimeType } from "./fileValidation.js";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (isAllowedMimeType(file.mimetype)) {
      return cb(null, true);
    }
    return cb(
      new Error("Invalid file type, only images or PDFs are allowed", {
        cause: 400,
      }),
      false,
    );
  },
});

export let upload = {};

// single file under the given field name, e.g. upload.fields({ name: "cover" })
upload.singleUpload = (field = "image") => uploadMemory.single(field);

// multiple files under the same field name (max `maxCount`)
upload.multipleUpload = (field = "images", maxCount = 5) =>
  uploadMemory.array(field, maxCount);

// multiple named fields at once, e.g. multerFields([{ name: "cover", maxCount: 1 }])
upload.multerFields = (fields = []) => uploadMemory.fields(fields);

export const MAX_UPLOAD_SIZE = MAX_FILE_SIZE;
export default upload;
