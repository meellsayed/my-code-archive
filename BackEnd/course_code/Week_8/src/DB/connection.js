import Sequelize from "sequelize";

export const sequelize = new Sequelize("sequelizeDB", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

export const checkConnection = async () => {
  await sequelize
    .authenticate()
    .then((res) => {
      console.log(`DB authenticate Done`);
    })
    .catch((err) => {
      console.error(`fail to authenticate to database`, err);
    });
};

export const syncConnection = async () => {
  await sequelize
    .sync({ alter: true,force:false})
    .then((res /*it's response back from database*/) => {
      console.log(`DB sync Done`);
    })
    .catch((err) => {
      console.error(`fail to sync to database`, err);
    });
};
