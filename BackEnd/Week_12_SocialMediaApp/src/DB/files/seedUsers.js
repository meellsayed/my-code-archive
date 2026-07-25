import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { userModel, genderTypes, roleTypes } from "./user.model.js";
import { generateHash } from "../../utils/security/hash.js";

// ==== الاتصال بقاعدة البيانات ====
// غيّر الرابط ده لرابط الداتا بيز بتاعتك
const DB_URI = "mongodb://localhost:27017/socialMediaApp"

// ==== دالة بتعمل هاش للباسورد ====
async function hashPassword(plain) {
  generateHash({plainText:plain})
}

// ==== بيانات الـ 20 يوزر ====
async function buildUsers() {
  const rawPassword = "123456"; // باسورد موحد لكل اليوزرز التجريبيين
  const hashedPassword = await hashPassword(rawPassword);

  const firstNames = [
    "Ahmed", "Mohamed", "Ali", "Omar", "Youssef",
    "Khaled", "Mostafa", "Sara", "Mona", "Nour",
    "Laila", "Hana", "Karim", "Tarek", "Hassan",
    "Amir", "Aya", "Salma", "Rania", "Mahmoud",
  ];

  const users = firstNames.map((name, i) => {
    const index = i + 1;
    return {
      username: `${name}${index}`,
      email: `${name.toLowerCase()}${index}@example.com`,
      password: hashedPassword,
      phone: `0100000${(1000 + index).toString().slice(-4)}`,
      DOB: new Date(1995, i % 12, (i % 28) + 1),
      address: `Cairo, Street ${index}`,
      gender: i % 2 === 0 ? genderTypes.male : genderTypes.female,
      role: roleTypes.user,
      isDeleted: false,
      isTwoStepVerification: false,
      confirmEmail: true,
    };
  });

  return users;
}

// ==== تشغيل عملية الإضافة ====
async function seed() {
  try {
    await mongoose.connect(DB_URI);
    console.log("✅ Connected to MongoDB");

    const users = await buildUsers();

    const result = await userModel.insertMany(users, { ordered: false });
    console.log(`✅ تم إضافة ${result.length} يوزر بنجاح`);
  } catch (err) {
    console.error("❌ حصل خطأ أثناء الإضافة:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 تم قطع الاتصال بقاعدة البيانات");
  }
}

seed();
