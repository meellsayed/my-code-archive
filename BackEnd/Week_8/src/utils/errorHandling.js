// import { Sequelize } from "sequelize";

export async function errorHandling(error, res) {
  if (error?.name == "SequelizeValidationError") {
    const errorDetails = error.errors.map((err) => {
      return { path: err.path, message: err.message };
    });
    return res.status(400).json({ message: "Validation-Error", errorDetails });
  }
  console.error(error);

  return res
    .status(500)
    .json({ error, message: error.message, stack: error.stack });
}
