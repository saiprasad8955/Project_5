
const jwt = require('jsonwebtoken')

// AUTHENTICATION
const authentication = async (req, res, next) => {
    try {

        let token1 = req.headers['authorization']
        if (!token1) {
            return res.status(401).send({ status: false, msg: "Authentication token is required" })
        } else {
            let token2 = token1.split(' ')
            let token = token2[1]

            let decodedToken = jwt.verify(token, "Group8")
            if (decodedToken) {
                req.user = decodedToken
                next()
            }
            else {
                return res.status(400).send({ status: false, msg: "Token is not valid" })
            }
        }
    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
};


module.exports = { authentication }