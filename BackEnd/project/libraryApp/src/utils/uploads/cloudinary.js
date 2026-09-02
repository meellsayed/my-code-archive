import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config({ path: "./src/config/.env.dev" });
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Validate the connection to Cloudinary once at startup.
 * Fails with a clear message when credentials are missing/invalid.
 */
export const cloudinaryConnect = async () => {
  try {
    const result = await cloudinary.api.ping();
    return result;
  } catch (error) {
    console.error("Cloudinary connection failed:", error.message);
    throw new Error("Unable to reach Cloudinary, check its credentials", {
      cause: 500,
    });
  }
};

export default cloudinary;

// router.post("/image", authentication(), singleUpload("cover"), asyncHandler(async (req, res) => {
//   const result = await uploadBuffer({ buffer: req.file.buffer, folder: "libraryApp/books" });
//   return successResponse({ res, data: result });
// }));
