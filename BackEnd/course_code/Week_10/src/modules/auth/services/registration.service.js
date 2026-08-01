import authRouter from "../auth.controller.js";
import userModel from "../../../DB/models/User.model.js";

export const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // !num 1 to save data
    // const user = new userModel({ userName: username, email, password });
    // user.username += " ana"
    // await user.save({ validateBeforeSave: true }); // ? validateBeforeSave is default val is true

    // !num 2 to save data
    const user = await userModel.create(
      //* arr of opj or opj

      // {
      //   userName: username,
      //   email,
      //   password,
      // },
      req.body.users, // array of opj
    );

    // !num 3 to save data
    // const user = await userModel.insertMany(
    //   //* arr of opj or opj
    //   { userName: username, email, password },
    // );

    return res.status(201).json({ message: "User signup successful", user });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      stack: error.stack,
    });
  }
};

export const login = async (req, res, next) => {};
