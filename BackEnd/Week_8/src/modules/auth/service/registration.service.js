import * as dbConnection from "../../../DB/connection.js";
import userModel from "../../../DB/model/User.model.js";
import { errorHandling } from "../../../utils/errorHandling.js";

export const signup = async (req, res, next) => {
  try {
    // //============= build methods ==============
    // const user = userModel.build({ firstName: "medo", lastName: "elsayed", email: "medo@gmail.com",});
    // user.age=19
    // await user.save()
    const { firstName, lastName, email, age, password } = req.body;
    const user = await userModel.findOrCreate({
      where: {
        email,
      },
      defaults: {
        firstName,
        lastName,
        age,
        email,
        password,
      },
    });
    return user[1]
      ? res.status(201).json({ message: "Signup", user })
      : res.status(409).json({ message: "Email Exist " });
      
  } catch (error) {
    await errorHandling(error, res);

  }
};

export const login = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, age } = req.body;
    const user = await userModel.findOne({
      where: {
        email,
        password,
      },
    });
    return user
      ? res.status(200).json({ message: "Login Done", user: user })
      : res.status(409).json({ message: "In-valid email or password" });
  } catch (error) {
    await errorHandling(error, res);
  }
};
