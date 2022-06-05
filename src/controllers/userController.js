
const validator = require('../validations/validator')
const UserModel = require('../models/userModel')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { uploadFile } = require('../AWS_Upload/aws_s3')
const jwt = require('jsonwebtoken')


/////////////////////////////////  CREATING USER  /////////////////////////////////////////////


const createUser = async function (req, res) {
    try {
        const body = req.body
        // const body = req.body.data;
        // const JSONbody = JSON.parse(body)

        // Validate body 
        if (!validator.isValidBody(body)) {
            return res.status(400).send({ status: false, msg: "User body should not be empty" });
        }

        // Validate query (it must not be present)
        const query = req.query;
        if (validator.isValidBody(query)) {
            return res.status(400).send({ status: false, msg: "Invalid parameters" });
        }

        // Validate params (it must not be present)
        const params = req.params;
        if (validator.isValidBody(params)) {
            return res.status(400).send({ status: false, msg: "Invalid parameters" });
        }


        let { fname, lname, email, password, phone, address } = body

        // Validate fname
        if (!validator.isValid(fname)) {
            return res.status(400).send({ status: false, message: "fname must be present" })
        }

        // Validation of fname
        if (!validator.isValidName(fname)) {
            return res.status(400).send({ status: false, msg: "Invalid fname" })
        }

        // Validate lname
        if (!validator.isValid(lname)) {
            return res.status(400).send({ status: false, message: "lname must be present" })
        }

        // Validation of lname
        if (!validator.isValidName(lname)) {
            return res.status(400).send({ status: false, msg: "Invalid lname" })
        }

        // Validate email
        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, message: "email must be present" })
        }

        // Validation of email id
        if (!validator.isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "Invalid email id" })
        }

        // check email is unique or not 
        const emailExists = await UserModel.findOne({ email: email });
        if (emailExists) {
            return res.status(400).send({ status: true, msg: "Email Already Exists!! Please Check with Another" })
        }

        // Validate password
        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: "password must be present" })
        }

        // Validation of password
        if (!validator.isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "Password should be 8-15 characters long and must contain one of 0-9,A-Z,a-z and special characters" })
        }

        // Validate phone
        if (!validator.isValid(phone)) {
            return res.status(400).send({ status: false, message: "phone must be present" })
        }

        // Validation of phone number
        if (!validator.isValidNumber(phone)) {
            return res.status(400).send({ status: false, msg: "Invalid phone number" })
        }

        // check phone is unique or not 
        const phoneExists = await UserModel.findOne({ phone: phone });
        if (phoneExists) {
            return res.status(400).send({ status: true, msg: "Phone Number Already Exists!! Please Check with Another" })
        }

        address = JSON.parse(address);

        // Validate address
        if (!validator.isValid(address)) {
            return res.status(400).send({ status: false, message: "Address is required" })
        }

        // Validate shipping address
        if (!validator.isValid(address.shipping)) {
            return res.status(400).send({ status: false, message: "Shipping address is required" })
        }

        // Validate street, city, pincode of shipping
        if (!validator.isValid(address.shipping.street && address.shipping.city && address.shipping.pincode)) {
            return res.status(400).send({ status: false, message: "Shipping address details is/are missing" })
        }

        // Validate shipping pincode
        if (!validator.isValidPincode(address.shipping.pincode)) {
            return res.status(400).send({ status: false, msg: "Invalid Shipping pincode" })
        }

        // Validate billing address
        if (!validator.isValid(address.billing)) {
            return res.status(400).send({ status: false, message: "Billing address is required" })
        }

        // Validate street, city, pincode of billing
        if (!validator.isValid(address.billing.street && address.billing.city && address.billing.pincode)) {
            return res.status(400).send({ status: false, message: "Billing address details is/are missing" })
        }

        // Validate billing pincode
        if (!validator.isValidPincode(address.billing.pincode)) {
            return res.status(400).send({ status: false, msg: "Invalid billing pincode" })
        }


        // Duplicate entries
        const isAlredyUsed = await UserModel.findOne({ phone }, { email });
        if (isAlredyUsed) {
            return res.status(400).send({ status: false, message: `${phone} number or ${email} mail is already registered` })
        }


        let files = req.files;

        if (files && files.length > 0) {

            if (!validator.isValidImage(files[0])) { return res.status(400).send({ status: false, message: "Invalid Image type" }) }
            let uploadedFileURL = await uploadFile(files[0]);

            // encrypted password
            const salt = await bcrypt.genSalt(10)
            const encryptPassword = await bcrypt.hash(password, salt)

            profileImage = uploadedFileURL

            const userData = { fname, lname, email, profileImage, phone, password: encryptPassword, address }
            const savedData = await UserModel.create(userData)
            return res.status(201).send({ status: true, message: "User created successfully", data: savedData })
        }
        else {
            return res.status(400).send({ status: false, msg: "No User Profile file to write" });
        }

    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
};




/////////////////////////////  USER LOGIN  /////////////////////////////////////////////////////////////////

const loginUser = async (req, res) => {
    try {
        const body = req.body;
        //Validate body 
        if (!validator.isValidBody(body)) {
            return res.status(400).send({ status: false, msg: "User body should not be empty" });
        }

        // Validate query (it must not be present)
        const query = req.query;
        if (validator.isValidBody(query)) {
            return res.status(400).send({ status: false, msg: "Invalid parameters" });
        }

        // Validate params (it must not be present)
        const params = req.params;
        if (validator.isValidBody(params)) {
            return res.status(400).send({ status: false, msg: "Invalid parameters" });
        }


        let email = body.email;
        let password = body.password;

        // Validate email
        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, message: "email must be present" })
        }

        // Validation of email id
        if (!validator.isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "Invalid email id" })
        }

        // Validate password
        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: "password must be present" })
        }

        // Validation of password
        if (!validator.isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "Invalid password" })
        }


        if (email && password) {
            let user = await UserModel.findOne({ email })
            if (!user) {
                return res.status(404).send({ status: false, message: "Email does not exist. Kindly create a new user" })
            }

            let pass = await bcrypt.compare(password, user.password);
            if (pass) {
                const Token = jwt.sign({
                    userId: user._id,
                    iat: Math.floor(Date.now() / 1000), //issue date
                    exp: Math.floor(Date.now() / 1000) + 60 * 60 //expiry date and time (30*60 = 30 min || 60*60 = 1 hr)
                }, "Group8")
                res.header('x-api-key', Token)

                return res.status(200).send({ status: true, message: "User login successfull", data: { userId: user._id, token: Token } })
            }
            else {
                return res.status(400).send({ status: false, message: "Invalid password" })
            }
        }

    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
};





////////////////////////  GETTING USER BY ID///////////////////////////////////////////

const getUserById = async (req, res) => {

    try {
        // Validate of body(It must not be present)
        const body = req.body;
        if (validator.isValidBody(body)) {
            return res.status(400).send({ status: false, msg: "Body must not be present" })
        }

        // Validate query(it must not be present)
        const query = req.query;
        if (validator.isValidBody(query)) {
            return res.status(400).send({ status: false, msg: "Query must not be present" })
        }

        // Validate params
        userId = req.params.userId
        if (!validator.isValidBody(userId)) {
            return res.status(400).send({ status: false, msg: "Credentials are required" })
        }



        if (!validator.isValidobjectId(userId)) {
            return res.status(400).send({ status: false, msg: "UserId is Not Vaild" })
        }


        //AUTHORISATION
        if (userId !== req.userId) {
            return res.status(401).send({ status: false, msg: "Unauthorised access" })
        }


        let findUser = await UserModel.findOne({ _id: userId })
        if (!findUser) {
            return res.status(404).send({ status: false, msg: "User Not Found with this ID" })

        }
        else {
            return res.status(200).send({ status: true, message: "User profile details", data: findUser })
        }

    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }


};

///////////////// UDATING USER BY ID ///////////////////////////////////////////////////////////////////////

const updateUserById = async (req, res) => {
    try {
        // Validate body
        const body = JSON.parse(JSON.stringify(req.body))

        if (!validator.isValidBody(body)) {
            return res.status(400).send({ status: false, msg: "Details must be present to update" })
        }

        // Validate params
        userId = req.params.userId
        if (!validator.isValidobjectId(userId)) {
            return res.status(400).send({ status: false, msg: `${userId} is invalid` })
        }

        const userFound = await UserModel.findOne({ _id: userId })
        if (!userFound) {
            return res.status(404).send({ status: false, msg: "User does not exist" })
        }

        //AUTHORISATION
        if (userId !== req.userId) {
            return res.status(401).send({ status: false, msg: "Unauthorised access" })
        }

        let { fname, lname, email, phone, password, address, profileImage } = body;


        //Updating the fields
        let updatedData = {}
        if (validator.isValid(fname)) {
            updatedData['fname'] = fname
        }
        if (validator.isValid(lname)) {
            updatedData['lname'] = lname
        }

        // Updating of email
        if (validator.isValid(email)) {
            if (!validator.isValidEmail(email)) {
                return res.status(400).send({ status: false, msg: "Invalid email id" })
            }


            // Duplicate email
            const duplicatemail = await UserModel.find({ email: email })
            if (duplicatemail.length) {
                return res.status(400).send({ status: false, msg: "email id already exist" })
            }
            updatedData['email'] = email
        }


        // Updating of phone
        if (validator.isValid(phone)) {
            if (!validator.isValidNumber(phone)) {
                return res.status(400).send({ status: false, msg: "Invalid phone number" })
            }

            // Duplicate phone
            const duplicatePhone = await UserModel.find({ phone: phone })
            if (duplicatePhone.length) {
                return res.status(400).send({ status: false, msg: "phone number already exist" })
            }
            updatedData['phone'] = phone
        }


        // Updating of password
        if (password) {
            if (!validator.isValid(password)) {
                return res.status(400).send({ status: false, message: 'password is required' })
            }
            if (!validator.isValidPassword(password)) {
                return res.status(400).send({ status: false, message: "Password should be Valid min 8 character and max 15 " })
            }
            const encrypt = await bcrypt.hash(password, 10)
            updatedData['password'] = encrypt
        }

        address = JSON.parse(address)
        //Updating the Address
        if (address) {
            if (address.shipping) {
                if (address.shipping.street) {
                    if (!validator.isValid(address.shipping.street)) {
                        return res.status(400).send({ status: false, message: 'Please provide street' })
                    }
                    updatedData['address.shipping.street'] = address.shipping.street
                }
                if (address.shipping.city) {
                    if (!validator.isValid(address.shipping.city)) {
                        return res.status(400).send({ status: false, message: 'Please provide city' })
                    }
                    updatedData['address.shipping.city'] = address.shipping.city
                }
                if (address.shipping.pincode) {
                    if (typeof address.shipping.pincode !== 'number') {
                        return res.status(400).send({ status: false, message: 'Please provide pincode' })
                    }
                    // Validate shipping pincode
                    if (!validator.isValidPincode(address.shipping.pincode)) {
                        return res.status(400).send({ status: false, msg: "Invalid Shipping pincode" })
                    }
                    updatedData['address.shipping.pincode'] = address.shipping.pincode
                }
            }
            if (address.billing) {
                if (address.billing.street) {
                    if (!validator.isValid(address.billing.street)) {
                        return res.status(400).send({ status: false, message: 'Please provide street' })
                    }
                    updatedData['address.billing.street'] = address.billing.street
                }
                if (address.billing.city) {
                    if (!validator.isValid(address.billing.city)) {
                        return res.status(400).send({ status: false, message: 'Please provide city' })
                    }
                    updatedData['address.billing.city'] = address.billing.city
                }
                if (address.billing.pincode) {
                    if (typeof address.billing.pincode !== 'number') {
                        return res.status(400).send({ status: false, message: 'Please provide pincode' })
                    }
                    // Validate billing pincode
                    if (!validator.isValidPincode(address.billing.pincode)) {
                        return res.status(400).send({ status: false, msg: "Invalid billing pincode" })
                    }
                    updatedData['address.billing.pincode'] = address.billing.pincode
                }
            }
        }
        //Updating the Profile Picture

        let files = req.files;

        if (files && files.length > 0) {
            if (!validator.isValidImage(files[0])) { return res.status(400).send({ status: false, message: "Invalid Image type" }) }
            let uploadedFileURL = await uploadFile(files[0]);
            if (uploadedFileURL) {
                updatedData['profileImage'] = uploadedFileURL
            }
        }
        const updated = await UserModel.findOneAndUpdate({ _id: userId }, updatedData, { new: true })
        return res.status(200).send({ status: true, message: "User profile updated", data: updated })
    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }

};




module.exports = {
    createUser,
    loginUser,
    getUserById,
    updateUserById
}
