db.createCollection("users", {
  validator: { $and: [{ userName: { $type: "string" } }] },
});
