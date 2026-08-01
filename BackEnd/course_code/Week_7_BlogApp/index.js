const mysql2 = require("mysql2");
const { log, error } = require("node:console");
const express = require("express");
const { ifError } = require("node:assert");
const app = express();
const PORT = 3000;
app.use(express.json());
const DBconnection = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "blogApp",
});
DBconnection.connect((err) => {
  if (err) {
    error("fail to connect to DB");
  } else {
    log("DB connected");
  }
});

app.get("/", (req, res, next) => {
  // // .query not recomnded
  //   DBconnection.query(`Select * from users where u_id=${req.query.id}`, (err, data) => {
  //     if (err) {
  //       return res.status(500).json({ message: "error", data, err });
  //     }
  //     return res.json({ message: "done", data });
  //   });
  //

  DBconnection.execute(
    `Select * from users where u_id=?`,
    [req.query.id],
    (err, data) => {
      if (err) {
        return res.status(500).json({ message: "error", data, err });
      }
      return res.json({ message: "done", data });
    },
  );
}); // to search by id query

app.patch("/user/:id", (req, res, next) => {
  const { id } = req.params;
  const { firstName, lastName, gender } = req.body;
  DBconnection.execute(
    `update users set u_firstName=? ,u_lastName=?,u_gender=? where u_id=?`,
    [firstName, lastName, gender, id],
    (err, data) => {
      if (err) {
        return res.status(500).json({ message: "error", err });
      }
      return data.affectedRows
        ? res.status(200).json({ message: "done", data })
        : res.status(509).json({ message: "invalid id", err });
    },
  );
}); // To Updata
app.delete("/user/:id", (req, res, next) => {
  const { id } = req.params;

  DBconnection.execute(`delete from users where u_id=?`, [id], (err, data) => {
    if (err) {
      return res.status(500).json({ message: "error", err });
    }
    return data.affectedRows
      ? res.status(200).json({ message: "delete done", data })
      : res.status(509).json({ message: "invalid id", err });
  });
}); // to delete
app.get("/user", (req, res, next) => {
  const { searchkey } = req.query;

  DBconnection.execute(
    `select * from users where u_firstName like '%${searchkey}%'`,
    (err, data) => {
      if (err) {
        return res.status(500).json({ message: "error", err });
      }
      res.status(200).json({ message: "done", data });
    },
  );
}); // to search
app.post("/auth/signup", (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  //   log({ firstName, lastName, email, password });

  DBconnection.execute(
    `select u_email from users where u_email=?`,
    [email],
    (err, data) => {
      if (err) {
        return res.status(500).json({ message: "fail", err });
      }

      if (data.length) {
        return res.status(409).json({ message: "email exists" });
      }

      DBconnection.execute(
        `insert into users (u_firstName,u_lastName,u_email,u_password) values(?,?,?,?)`,
        [firstName, lastName, email, password],
        (err, data) => {
          if (err || data.affectedRows == 0) {
            return res.status(500).json({ message: "fail", err });
          }
          return res
            .status(201)
            .json({ message: "email inserted (added)", data });
        },
      );
    },
  );
}); // to signup
app.post("/auth/login", (req, res, next) => {
  const { email, password } = req.body;
  //   log({ email, password });

  DBconnection.execute(
    `select * from users where u_email=? and u_password=?`,
    [email, password],
    (err, data) => {
      if (err) {
        return res.status(500).json({ message: "fail", err });
      }

      if (!data.length) {
        return res
          .status(404)
          .json({ message: "email and password miss mismatch" });
      }
      return res
        .status(200)
        .json({ message: "done", user: data[0], userId: data[0].u_id });
    },
  );
}); // to login
app.get("/user/:id/profile", (req, res, next) => {
  const { id } = req.params;
  DBconnection.execute(
    `SELECT * FROM users where u_id=?`,
    [id],
    (err, data) => {
      if (err) {
        return res.status(500).json({ message: "error", err });
      }
      return res.json({ message: "done", user: data[0] });
    },
  );
}); // to show profile
app.post("/blog", (req, res, next) => {
  const { id, title, contant, createdAt, updatedAt, userId } = req.body;

  DBconnection.execute(`select * from users where u_id=?`, (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error", err });
    }
    if (!data.length) {
      return res.status(404).json({ message: "not found user id ya amm" });
    }
    DBconnection.execute(
      `isert into blogs (b_id, b_title ,b_contant , b_createdAt , b_updatedAt , b_userId) valuse(?,?,?,?,?,?)`,
      [id, title, contant, createdAt, updatedAt, userId],
      (err, data) => {
        if (err) {
          return res.status(500).json({ message: "fail", err });
        }
      return res.status(201).json({ message: "done" ,data});

      },
    );
  });
});

//
//
app.listen(PORT, () => {
  log("server running at http://localhost:" + PORT);
});
