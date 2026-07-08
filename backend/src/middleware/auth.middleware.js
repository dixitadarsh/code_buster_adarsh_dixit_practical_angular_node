const { verifyAccessToken } = require("../utils/jwt");

const User = require("../database/models").User;


const authenticate = async (req, res, next) => {

    try {

        const token = req.headers.authorization
            ?.split(" ")[1];


        if (!token) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }


        const decoded = verifyAccessToken(token);


        const user = await User.findOne({
            where: {
                uniqueId: decoded.uniqueId,
                deletedAt: null
            },

            attributes: [
                "uniqueId",
                "email"
            ]
        });


        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }


        req.user = user;


        next();


    }
    catch (error) {

        next(error);

    }

};


module.exports = authenticate;