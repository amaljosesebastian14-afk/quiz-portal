const admin = require("../config/firebase");
const { getDB } = require("../config/db");

const authMiddleware = async (req, res, next) => {

    try {

        const authHeader =
        req.headers.authorization;

        if (!authHeader) {

            return res.status(401).json({
                success:false,
                message:"Token missing"
            });

        }

        const token =
        authHeader.split(" ")[1];

        const decodedToken =
        await admin.auth()
        .verifyIdToken(token);

        const db = getDB();

        const user =
        await db.collection("users")
        .findOne({
            email: decodedToken.email
        });

        if(!user){

            return res.status(404).json({
                success:false,
                message:"User not found"
            });

        }

        req.user = user;

        next();

    }
    catch(error){

        return res.status(401).json({

            success:false,

            message:error.message

        });

    }

};

module.exports = authMiddleware;