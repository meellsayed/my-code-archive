import { sequelize } from "../connection.js";
import { DataTypes, VIRTUAL } from "sequelize";
import Blog from "./Blog.model.js";

const userModel = sequelize.define(
  "user",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: "u_id",
      validate: { isNull: false },
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "u_firstName",
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "u_lastName",
    },
    // fullName: {
    //   type: VIRTUAL,
    // },
    DOB: {
      type: DataTypes.DATE,
      defaultValue: null, // default is Null
    },
    gender: {
      type: DataTypes.ENUM("male", "female"),
      defaultValue: "male",
    },

    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "u_password",
    },
    confirmEmail: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    paranoid: true, // to soft delete
  },
);
userModel.hasMany(Blog);
export default userModel;
