// Creating middleware to check if the token is valid
const jwt = require("jsonwebtoken");

function authManager(){
    const verify = (req, res, next) => {
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({errorMessage: "Unathorized - No token provided"});
        }

        try{
            const verified = jwt.verify(token, 'phredditKey');
            req.userId = verified.userId;

            next();
        } catch (err) {
            return res.status(401).json({errorMessage: "Unauthorized - Invalid token"});
        }
    };

    return {verify};
}

const auth = authManager();
module.exports = auth;