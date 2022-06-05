const validator = require('../validations/validator')
const userModel = require('../Models/UserModel')
const productModel = require('../models/productModel')
const cartModel = require('../models/cartModel')



//------------------  POST /users/:userId/cart ------------------------------------------------------//

const createCart = async (req, res) => {
    try {

        // Extract userId from params
        const userId = req.params.userId

        // console.log(userId)
        // Validate the userID 
        if (!validator.isValidobjectId(userId)) {
            return res.status(400).send({ status: false, message: "Enter a Valid userID" })
        }

        // User Exists or not
        const isUserExist = await userModel.findById(userId)
        if (!isUserExist) {
            return res.status(404).send({ status: false, message: "User not Found" });
        }

        //authorization
        if (userId != req.userId) {
            return res.status(403).send({ status: false, message: "User not authorized to create a cart" })
        }

        // Extract Body from request
        const requestBody = req.body

        // check body is coming or not
        if (!validator.isValidBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please Provide Details In The Body" })
        }

        // Extract data from req Body
        let { cartId, productId } = requestBody

        // if cart id present
        if ('cartId' in requestBody) {
            // check cart Id
            if (!validator.isValid(cartId)) {
                return res.status(400).send({ status: false, message: `Cart Id Should be not be Empty` })
            }

            cartId = cartId.trim()

            // Validate cart Id
            if (!validator.isValidobjectId(cartId)) {
                return res.status(400).send({ status: false, message: `Invalid Cart Id` })
            }
        }

        // Product Id is coming or not
        if (!validator.isValid(productId)) {
            return res.status(400).send({ status: false, message: "Enter the productId" });
        }
        productId = productId.trim()

        // Validate the product ID
        if (!validator.isValidobjectId(productId)) {
            return res.status(400).send({ status: false, msg: "Enter a valid productId" })
        }

        // Check Product exists or not
        const product = await productModel.findOne({ _id: productId, isDeleted: false }).lean().select({ price: 1 });

        if (!product) {
            return res.status(404).send({ status: false, message: "Product not found" })
        }

        // check cart exists or not 
        let isCartExist = await cartModel.findOne({ userId: userId })

        // if not exists then create a new cart for that user
        if (!isCartExist) {

            let newCartData = {
                userId: userId,
                items:
                    [
                        {
                            productId: product._id,
                            quantity: 1
                        }
                    ],
                totalPrice: product.price,
                totalItems: 1
            }

            // finally create new cart
            const newCart = await cartModel.create(newCartData)
            return res.status(201).send({ status: true, message: "Success", data: newCart })
        }


        // Now check for cart not exists
        if (!req.body.hasOwnProperty("cartId")) {
            return res.status(400).send({ status: false, msg: `Please Enter the Card Id for userId ${userId}` })
        }

        // check for cart id and user matches or not
        if (isCartExist._id != cartId) {
            return res.status(400).send({ Status: false, message: "Cart Id and user do not match" })
        }

        // Store Item Lists in a variable
        let itemLists = isCartExist.items;

        // Extracts only product ids
        let productIdLists = itemLists.map((item) => item = item.productId.toString())

        // match productid with items id and then update it 
        if (productIdLists.find((item) => item == (productId))) {

            // Now we update data
            const updatedCart = await cartModel.findOneAndUpdate({ userId: userId, "items.productId": productId },
                {
                    $inc: {
                        "items.$.quantity": + 1,
                        totalPrice: + product.price
                    }
                },
                { new: true })

            // finally send the updated cart 
            return res.status(200).send({ status: true, message: "Success", data: updatedCart })
        }



        // if product Id and product does not match then we will add new item in items
        const addNewItem = await cartModel.findOneAndUpdate({ userId: userId },
            {
                $addToSet: { items: { productId: productId, quantity: 1 } },
                $inc: { totalPrice: + product.price, totalItems: +1 }
            },
            { new: true })

        // Send Response Of New Added Product in Cart 
        return res.status(201).send({ status: true, message: "Success", data: addNewItem })


    } catch (err) {
        console.log("This is the error : ", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
};



















//------------------  PUT /users/:userId/cart ---------------------------------------------------------------//

const updateCartById = async (req, res) => {
    try {

        // Extract userId from params
        let userId = req.params.userId.trim()

        // Validate UserId came from Params
        if (!validator.isValidobjectId(userId)) {
            return res.status(400).send({ status: false, message: "Enter a Valid UserID" });
        }

        // Check User Exists or not
        const isUserExist = await userModel.findById(userId)
        if (!isUserExist) {
            return res.status(404).send({ status: false, message: "User Not Found" })
        }

        // Authorization
        if (userId != req.userId) {
            return res.status(403).send({ status: false, message: "user not authorized to update cart" })
        }

        // Extract requestBody from reqbody
        const requestBody = req.body;

        // Validate the reqBody
        if (!validator.isValidBody(requestBody)) {
            return res.status(400).send({ status: false, message: `Invalid Request parameters` });
        }

        // Destruct the reqBody
        let { cartId, productId, removeProduct } = requestBody

        // Check Cart Exists or not
        const isCartExist = await cartModel.findOne({ userId: userId })
        if (!isCartExist) {
            return res.status(404).send({ status: false, message: `Cart Not Found Please Check Cart Id` })
        }

        //  Check Cart ID is coming or not
        if (!validator.isValid(cartId)) {
            return res.status(400).send({ status: false, message: `Please Enter A Cart ID` })
        }
        cartId = cartId.trim()

        // Validate the cart ID
        if (!validator.isValidobjectId(cartId)) {
            return res.status(400).send({ status: false, message: `invalid Cart Id` })
        }

        // Cart ID from user and cart ID from body matches or not 
        if (isCartExist._id != cartId) {
            return res.status(400).send({ status: false, message: "CartId and user do not match" })
        }

        //  Check  Product ID is coming or not
        if (!validator.isValid(productId)) {
            return res.status(400).send({ status: false, message: "enter the productId" })
        }
        productId = productId.trim()

        // Validate the Product ID
        if (!validator.isValidobjectId(productId)) {
            return res.status(400).send({ status: false, message: "enter a valid productId" });
        }

        // Check Product exists or not
        const isProductExist = await productModel.findOne({ _id: productId, isDeleted: false }).lean()
        if (!isProductExist) {
            return res.status(404).send({ status: false, message: `Product Not Exists` })
        }

        // check remove product is coming or not in reqBody
        if (!req.body.hasOwnProperty('removeProduct')) {
            return res.status(400).send({ status: false, message: "removeProduct key Should Be present" })
        }

        // Check if remove is NAN then throw error
        if (isNaN(removeProduct)) {
            return res.status(400).send({ status: false, message: "Enter the valid value for removeProduct" })
        }

        // Remove Product should be 1 or 0
        if (!(removeProduct === 1 || removeProduct === 0)) {
            return res.status(400).send({ status: false, message: `invalid input - remove Product key Should Be a number 1 or 0` })
        }

        // Store items in a Variable
        itemList = isCartExist.items

        // Take ID List in variable through map
        let idList = itemList.map((ele) => ele = ele.productId.toString())
        let index = idList.indexOf(productId)

        // Check if index is equal to -1 then throw error
        if (index == -1) {
            return res.status(400).send({ status: false, message: `Product Does Not Exist In Cart` })
        }

        // IF Remove Product is ZERO  
        if (removeProduct == 0 || (removeProduct == 1 && itemList[index]['quantity'] == 1)) {

            let productPrice = itemList[index].quantity * isProductExist.price

            const updatedCart = await cartModel.findOneAndUpdate({ userId: userId },
                {
                    $pull: { items: { productId: productId } },
                    $inc: { totalPrice: - productPrice, totalItems: - itemList[index].quantity }

                }, { new: true })

            return res.status(200).send({ status: true, message: 'Sucess', data: updatedCart })


        }

        // If Remove Product Key is ONE 
        if (removeProduct == 1) {

            console.log(isCartExist);
            const updatedCart = await cartModel.findOneAndUpdate({ userId: userId, "items.productId": productId },
                {
                    $inc: {
                        totalPrice: - isProductExist.price,
                        "items.$.quantity": -1
                    }

                }, { new: true })

            return res.status(200).send({ status: true, message: 'Success', data: updatedCart })
        }
    }
    catch (err) {
        console.log("This is the error : ", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }

};
























//------------------  GET /users/:userId/cart -----------------------------//

const getCartById = async (req, res) => {
    try {
        // Validate of body(It must not be present)
        const body = req.body;
        if (validator.isValidBody(body)) {
            return res.status(400).send({ status: false, msg: "Body must not be present" })
        }

        // Validate query (it must not be present)
        const query = req.query;
        if (validator.isValidBody(query)) {
            return res.status(400).send({ status: false, msg: "Query must not be present" });
        }

        // Validate params
        userId = req.params.userId
        if (!validator.isValidobjectId(userId)) {
            return res.status(400).send({ status: false, msg: `${userId} is invalid` })
        }

        // to check user present or not
        const userSearch = await userModel.findById({ _id: userId })
        if (!userSearch) {
            return res.status(400).send({ status: false, msg: "userId does not exist" })
        }

        // AUTHORISATION
        if (userId !== req.userId) {
            return res.status(401).send({ status: false, msg: "Unauthorised access" })
        }

        // To check cart is present or not
        const cartSearch = await cartModel.findOne({ userId })
        if (!cartSearch) {
            return res.status(400).send({ status: true, msg: "UserId does not exist" })
        }
        return res.status(200).send({ status: true, msg: "Success", data: cartSearch })

    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
};

























//------------------ DELETE /users/:userId/cart -----------------------------------//

const deleteCartById = async (req, res) => {
    try {
        // Validate body (it must not be present)
        const body = req.body
        if (validator.isValidBody(body)) {
            return res.status(400).send({ status: false, msg: "Invalid parametes" })
        }

        // Validate query (it must not be present)
        const query = req.query;
        if (validator.isValidBody(query)) {
            return res.status(400).send({ status: false, msg: "Invalid parameters" });
        }

        // Validate params
        userId = req.params.userId
        if (!validator.isValidobjectId(userId)) {
            return res.status(400).send({ status: false, msg: `${userId} is invalid` })
        }

        //  To check user is present or not
        const userSearch = await userModel.findById({ _id: userId })
        if (!userSearch) {
            return res.status(404).send({ status: false, msg: "User doesnot exist" })
        }

        // AUTHORISATION
        if (userId !== req.userId) {
            return res.status(401).send({ status: false, msg: "Unauthorised access" })
        }

        // To check cart is present or not
        const cartSearch = await cartModel.findOne({ userId })
        if (!cartSearch) {
            return res.status(404).send({ status: false, msg: "cart doesnot exist" })
        }

        const cartdelete = await cartModel.findOneAndUpdate({ userId }, { items: [], totalItems: 0, totalPrice: 0 }, { new: true })
        res.status(200).send({ status: true, msg: "Cart deleted" })

    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }

};


module.exports = {
    createCart,
    updateCartById,
    getCartById,
    deleteCartById
}