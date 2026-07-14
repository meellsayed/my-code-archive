import userModel from "../../../DB/model/User.model.js";

export const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const checkEmail = await userModel.findOne({ email });
    if (checkEmail) {
      return res.status(409).json({ message: `Email [ ${email} ] Is Exist` });
    }
    const userRes = await userModel.insertOne({ username, email, password });
    return res.status(201).json({ message: "Done", userRes });
  } catch (err) {
    return res.status(500).json({ message: err.message, stack: err.stack });
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = await userModel.findOne({ email, password });
    if (!user) {
      return res.status(404).json({ message: `Email and password not match` });
    }
    return res.status(200).json({ message: "done", user });
  } catch (err) {
    return res.status(500).json({ message: err.message, stack: err.stack });
  }
};
