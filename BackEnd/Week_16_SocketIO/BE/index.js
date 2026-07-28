import express from "express";
import morgan from "morgan";

const app = express();
app.use(express.json());


app.use(morgan("dev"))

app.listen(3000,(err)=>{
    if (err) {
        return console.error(err)
    }
    console.log("Server Running Done");
    
});
