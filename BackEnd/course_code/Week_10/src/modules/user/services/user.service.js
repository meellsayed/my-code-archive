import userModel from "../../../DB/models/User.model.js";
import userRouter from "../user.controller.js";

export const allUsers = async (req, res, next) => {
  // const users =await userModel.find({$and:[{salary:{$gt:6000}},{gender:"male"}]})
  const users = await userModel.find({})
    // .select("userName -_id").skip(1).limit(4).sort({ salary: -1});

  return res.json({ message:"users list page", users });
};

export const allUsers = async (req, res, next) => {
  // const users =await userModel.find({$and:[{salary:{$gt:6000}},{gender:"male"}]})
  const users = await userModel.find({})
    // .select("userName -_id").skip(1).limit(4).sort({ salary: -1});

  return res.json({ message:"users list page", users });
};
