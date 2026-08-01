import userModel from "../../../DB/model/User.model.js";

export const allUsers = async (req, res,next) => {
    try {
        const user = await userModel.findOne()
        return res.json({message:"Done",user})
    } catch (err) {
        return res.status(500).json({message:"error"})
    }
    
    
};