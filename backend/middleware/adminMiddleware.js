const { getDB } = require("../config/db");

const adminMiddleware = async (req, res, next) => {

    try {

        const db = getDB();

        const user = await db
            .collection("users")
            .findOne({
                email: req.user.email
            });

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        if (user.role !== "admin") {

            return res.status(403).json({
                success: false,
                message: "Admin access only"
            });

        }

        req.dbUser = user;

        next();

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = adminMiddleware;