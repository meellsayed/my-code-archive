import { sequelize } from "../connection.js";
import { DataTypes, VIRTUAL } from "sequelize";
import userModel from "./User.model.js";

const Blog = sequelize.define("blog", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Blog.belongsTo(userModel, {
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  foreignKey: {
    allowNull: false,
  },
});

export default Blog;
