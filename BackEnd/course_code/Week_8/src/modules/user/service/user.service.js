import { Op, where } from "sequelize";
import userModel from "../../../DB/model/User.model.js";
import { errorHandling } from "../../../utils/errorHandling.js";

export const userList = async (req, res, next) => {
  try {
    const users = await userModel.findAll({
      where: {
        [Op.or]: {
          firstName: "medo",
          lastName: "ali",
        },
      },
    });
    res.json({ message: "done", users });
  } catch (error) {
    await errorHandling(error, res);
  }
};

export const userProfile = async (req, res, next) => {
  try {
    const user = await userModel.findByPk(req.params.id, {
      attributes: ["email", "firstName"],
    });
    return res.json({ message: "Profile", user });
  } catch (error) {
    await errorHandling(error, res);
  }
};

export const userHome = async (req, res, next) => {
  try {
    const user = await userModel.findOne({
      where: { id: req.params.id },
      attributes: { exclude: ["password"] },
    });
    return res.json({ message: "Home Done", user });
  } catch (error) {
    await errorHandling(error, res);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const { age, password } = req.body;
    const { id } = req.params;

    const user = userModel.update(
      { age, password },
      {
        where: {
          id,
        },
      },
    );
    if (!user) {
      return res.status(404).json({ message: "in-valid account id" });
    }
    return res.json({ message: "user update done", user });

    // const user = userModel.findByPk(id);
    // if (!user) {
    //   return res.status(404).json({ message: "in-valid account id" });
    // }
    // user.age = age;
    // user.password = password;
    // await user.save()
    // return res.json({ message: "user update done", user });
  } catch (error) {
    await errorHandling(error, res);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = userModel.destroy({
      // hard delete if paranoid: false in userModel
      where: {
        id,
      },
      // force: true, // to delete it force with paranoid
    });

    // const user = userModel.destroy({
    //   // empty data
    //   truncate: true,
    //   where: {
    //     id,
    //   },
    // });

    if (!user) {
      return res.status(404).json({ message: "in-valid account id" });
    }
    return res.json({ message: "user update done", user });
  } catch (error) {
    await errorHandling(error, res);
  }
};
export const forceDeleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = userModel.destroy({
      where: {
        id,
      },
      force: true, // to delete it force with paranoid
    });

    if (!user) {
      return res.status(404).json({ message: "in-valid account id" });
    }
    return res.json({ message: "user force delete done", user });
  } catch (error) {
    await errorHandling(error, res);
  }
};

export const restoreUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = userModel.restore({
      where: {
        id,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "in-valid account id" });
    }
    return res.json({ message: "user restore done", user });
  } catch (error) {
    await errorHandling(error, res);
  }
};
