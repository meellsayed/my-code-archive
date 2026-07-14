import userRouter from "../user.controller.js";

export const home = (req,res,next) => {
    res.json({message:"Welcome to the home page"});

};

