const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

const allowedExtensions = new Set(["jpeg", "jpg", "png", "webp", "gif", "pdf"]);

export const isAllowedMimeType = (mimetype = "") =>
  allowedMimeTypes.has(mimetype);

export const isAllowedExtension = (filename = "") => {
  const ext = filename.split(".").pop()?.toLowerCase();
  return allowedExtensions.has(ext);
};

export default { allowedMimeTypes, allowedExtensions };
