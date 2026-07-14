const bootstrap = require("./src/app.controller.js");
const express = require("express");
const app = express();
const PORT = 3000;

bootstrap(app, express);

app.listen(PORT, () =>
  console.log(`Server runing at http://localhost:${PORT}`),
);

