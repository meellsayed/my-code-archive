import cloudinary from "./cloudinary.js";

/**
 * Upload a single file buffer to Cloudinary (used with multer memory storage).
 *
 * @param {object} options
 * @param {Buffer} options.buffer file buffer from `req.file.buffer`
 * @param {string} [options.folder] Cloudinary folder
 * @param {string} [options.publicId] optional custom public id
 * @param {"image"|"raw"|"auto"} [options.resourceType]
 * @param {object} [options.options] extra upload options (e.g. transformation)
 * @returns {Promise<{secure_url:string, public_id:string, format?:string}>}
 */
export const uploadBuffer = async ({
  buffer,
  folder = "libraryApp",
  publicId,
  resourceType = "auto",
  options = {},
} = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: resourceType,
        overwrite: true,
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        });
      },
    );
    stream.end(buffer);
  });
};

/**
 * Upload several buffers (from `req.files`) at once.
 *
 * @param {object} params
 * @param {Express.Multer.File[]} [params.files]
 * @param {string} [params.folder]
 * @returns {Promise<Array<{secure_url:string, public_id:string}>>}
 */
export const uploadBuffers = async ({
  files = [],
  folder = "libraryApp",
} = {}) =>
  Promise.all(
    files.map((file) =>
      uploadBuffer({ buffer: file.buffer, folder, resourceType: "auto" }),
    ),
  );

/**
 * Delete a previously uploaded resource by its public id.
 */
export const deleteUpload = async (publicId) => {
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId);
};

export default uploadBuffer;
