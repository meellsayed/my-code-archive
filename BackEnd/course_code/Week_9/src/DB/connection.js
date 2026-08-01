import { MongoClient } from "mongodb";
const client = new MongoClient("mongodb://localhost:27017");
export const db = client.db("DBfromNodeJS");
export const checkDBConnection = async () => {
  await client
    .connect()
    .then((res) => {
      console.log("DB Connected", res);
    })
    .catch((err) => {
      console.log("DB Not Connected", err);
    });
};
await checkDBConnection()
