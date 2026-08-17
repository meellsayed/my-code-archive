import dotenv from "dotenv";
dotenv.config({ path: "./src/config/.env.dev" });

import mongoose from "mongoose";
import { userModel } from "../models/User.model.js";
import { categoryModel } from "../models/Category.model.js";
import { authorModel } from "../models/Author.model.js";
import { bookModel } from "../models/Book.model.js";
import { customerModel } from "../models/Customer.model.js";
import {
  seedUsers,
  seedCategories,
  seedAuthors,
  seedBooks,
  seedCustomers,
} from "./seed.data.js";

const dbUrl =
  process.env.DB_URL || `mongodb://localhost:27017/${process.env.APP_NAME}`;

const clear = async () => {
  await Promise.all([
    userModel.deleteMany({}),
    categoryModel.deleteMany({}),
    authorModel.deleteMany({}),
    bookModel.deleteMany({}),
    customerModel.deleteMany({}),
  ]);
};

const seed = async () => {
  try {
    await mongoose.connect(dbUrl, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to DataBase");

    await clear();
    console.log("Cleared existing data");

    const users = await userModel.insertMany(seedUsers);
    const admin = users.find((u) => u.role === "admin");
    const staff = users.find((u) => u.role === "staff");

    const categories = await categoryModel.insertMany(
      seedCategories.map((c) => ({ ...c, createdBy: admin._id })),
    );

    const authors = await authorModel.insertMany(
      seedAuthors.map((a) => ({ ...a, createdBy: admin._id })),
    );

    const bookDocs = seedBooks.map((b, i) => ({
      ...b,
      author: authors[i % authors.length]._id,
      categories: [categories[i % categories.length]._id],
      createdBy: admin._id,
      updatedBy: staff._id,
    }));
    const books = await bookModel.insertMany(bookDocs);

    await customerModel.insertMany(
      seedCustomers.map((c) => ({ ...c, createdBy: staff._id })),
    );

    console.log(`Seeded successfully:
  Users:      ${users.length} (password for all: 1234)
  Categories: ${categories.length}
  Authors:    ${authors.length}
  Books:      ${books.length}
  Customers:  ${seedCustomers.length}
`);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
