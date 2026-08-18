import { model, Schema, Types } from "mongoose";

const reviewSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    rate: { type: Number, enum: [1, 2, 3, 4, 5] },
    userId: { type: Types.ObjectId, ref: "User" },
    bookId: { type: Types.ObjectId, ref: "Book" },
    author: { type: Types.ObjectId, ref: "Author" },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const reviewModel =
  mongoose.models.Review || model("Review", reviewSchema);
