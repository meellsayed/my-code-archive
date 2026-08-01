module.exports.signup = (req, res, next) => {
  return res.json({ message: "auth signup" });
};

module.exports.login = (req,res,next)=>
{
    return res.json({ message: "auth login" });
}

