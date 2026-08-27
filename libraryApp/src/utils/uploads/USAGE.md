# Upload files to Cloudinary

Module: `src/utils/uploads/`

Uploads files (images / PDFs) to Cloudinary using **multer** (memory storage) and **multer**-fed buffers, then `cloudinary.uploader`.

---

## Files

| File                    | Responsibility                                              |
| ----------------------- | ----------------------------------------------------------- |
| `cloudinary.js`         | Cloudinary config + connection check                        |
| `fileValidation.js`     | Allowed MIME types / extensions                             |
| `multerUpload.js`       | Multer middleware (memory storage, 2 MB limit, type filter) |
| `cloudinaryUpload.js`   | Upload / delete buffers to Cloudinary                       |

---

## 1. Setup (one time)

Create an account at <https://cloudinary.com> and copy the credentials into `src/config/.env.dev`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

(Optional) verify connectivity at startup:

```js
// src/app.controller.js (or anywhere before uploads are used)
import { cloudinaryConnect } from "./utils/uploads/cloudinary.js";
await cloudinaryConnect();
```

---

## 2. Middleware (multer)

Pick the shape that fits your route:

```js
singleUpload(field)     // one file under a field name   -> req.file
multipleUpload(field, n) // up to n files under a field   -> req.files[]
multerFields([...])     // multiple named fields          -> req.files
```

### Single file 

```js
import { Router } from "express";
import { singleUpload } from "../../utils/uploads/multerUpload.js";
import { uploadBuffer } from "../../utils/uploads/cloudinaryUpload.js";
import { asyncHandler } from "../../utils/response/error.response.js";
import { successResponse } from "../../utils/response/success.response.js";
import { authentication } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/profile-image",
  authentication(),
  singleUpload("image"),           // <- accepts form-data field named "image"
  asyncHandler(async (req, res) => {
    if (!req.file) throw new Error("No file uploaded", { cause: 400 });

    const result = await uploadBuffer({
      buffer: req.file.buffer,
      folder: "libraryApp/users",
    });

    return successResponse({ res, data: { image: result.secure_url, ...result } });
  }),
);

export default router;
```

### Multiple files

```js
router.post(
  "/gallery",
  singleUpload("images"),
  asyncHandler(async (req, res) => {
    const results = await uploadBuffers({
      files: req.files,
      folder: "libraryApp/gallery",
    });
    return successResponse({ res, data: { images: results.map((r) => r.secure_url) } });
  }),
);
```

---

## 3. API reference

### `uploadBuffer(options)`

| Option          | Type                  | Default              | Description                    |
| --------------- | --------------------- | -------------------- | ------------------------------ |
| `buffer`        | `Buffer` (required)   | —                    | file bytes (`req.file.buffer`) |
| `folder`        | `string`              | `"libraryApp"`       | Cloudinary folder             |
| `publicId`      | `string`              | auto-generated       | custom public id (optional)    |
| `resourceType`  | `"image"\|"raw"`  | `"image"`           | `"raw"` for PDFs; `"auto"` is flaky in the SDK |
| `options`       | `object`              | `{}`                 | extra upload options (transformations, tags, ...) |

Returns:

```json
{
  "secure_url": "https://res.cloudinary.com/.../libraryApp/users/abc.jpg",
  "public_id": "libraryApp/users/abc",
  "format": "jpg",
  "width": 800,
  "height": 600,
  "bytes": 12345
}
```

### `uploadBuffers({ files, folder })`

Uploads an array of files (`req.files`) and returns an array of results.

### `deleteUpload(publicId)`

Deletes a resource:

```js
await deleteUpload("libraryApp/users/abc"); // returns { result: "ok" }
```

store `public_id` alongside `secure_url` so you can delete later.

---

## 4. Middleware on the client (HTML)

Use **FormData** (files can't be sent as JSON). Example fetch:

```js
const form = new FormData();
form.append("image", fileInput.files[0]);

const res = await fetch("http://localhost:3000/book/cover", {
  method: "POST",
  headers: { authorization: `Bearer ${token}` },
  body: form, // do NOT set Content-Type; the browser sets the boundary
});
```

---

## 5. Notes / limits

- Max file size: **2 MB** (`MAX_UPLOAD_SIZE` in `multerUpload.js`).
- Allowed types: `jpeg, png, webp, gif, pdf`.
- Rejected types / oversize files are returned as a `400` JSON error through `globalErrorHandling`.
- Files are kept in memory (`multer.memoryStorage()`), suitable for book covers / avatars. For very large uploads use a disk/streaming strategy instead.
- `overwrite: true` is set, so re-uploading with the same `public_id` replaces the previous asset.