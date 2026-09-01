import mongoose, { model, Schema, Types } from "mongoose";

const bookSchema = new Schema(
  {
    title: {
      type: String,
      unique: true,
      minlength: 2,
      trim: true,
      required: true,
    },
    subtitle: {
      type: String,
      minlength: 2,
      trim: true,
    },
    cover: { type: String },
    description: { type: String },
    author: { type: Types.ObjectId, ref: "Author" },
    categories: [{ type: Types.ObjectId, ref: "Category" }],
    pages: { type: Number, min: 0 },
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number },
    quantity: { type: Number, default: 1, min: 0 },
    minQuantity: { type: Number, min: 0 },
    availableToBorrow: { type: Boolean, default: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    createdBy: { type: Types.ObjectId, ref: "User" },

    isDeleted: { type: Boolean, default: false },
    publisher: { type: String },
  },
  { timestamps: true },
);

export const bookModel = mongoose.models.Book || model("Book", bookSchema);
export const bookPopulate = [
  { path: "categories", select: "name isDeleted" },
  { path: "author", select: "name image isDeleted" },
];
export const bookPopulateAdmin = [{ path: "categories" }, { path: "author" }];
export const bookSelect =
  "-costPrice -quantity -minQuantity -updatedBy -createdBy -updatedAt -createdAt";
