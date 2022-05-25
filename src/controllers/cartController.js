const cartModel = require("../models/cartModel")
const validator = require('../validations/validator')
const userModel = require("../models/userModel")
const productModel = require("../models/productModel")



//------------------ CREATING CART
const createCart = async (req, res) => {
    try{

        const body = req.body
        if (!validator.isValidBody(body)) {
            return res.status(400).send({ status: false, msg: "Please Provide details" });
        }

        const cart = body.cartId
        const userId = req.params.userId

        const { items: [{ productId, quantity }], totalPrice, totalItems } = body

        if(!cart) {
            const cartExistForUser = await cartModel.findOne({userId: userId})
            if(cartExistForUser) return res.status(400).send({ status: false, msg: "Cart already Exist for this user, please provide cartId" });
        }

        // if(!validator.isValid(productId)){
        //     return res.status(400).send({ status: false, msg: "ProductId is required" });
        // }

        if (!validator.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "UserId is required" });
        }

        const userExist = await userModel.findOne({_id:userId})
        if(!userExist){
            return res.status(404).send({ status: false, msg: "User not found with this Id" });
        }

        const cartExist = await cartModel.findOne({_id: cart})
        if(cartExist){
            if(cartExist.userId != userId)
            return res.status(404).send({ status: false, msg: "Something went wrong.. please try again." });
        }
        if (cartExist) {
            if (cartExist.userId != userId) {
                return res.status(403).send({ status: false, message: "This cart does not belong to you. Please check the cart Id" })
            }
            let updateData = {}

            for (let i = 0; i < cartExist.items.length; i++) {
                if (cartExist.items[i].productId == productId) {
                    cartExist.items[i].quantity = cartExist.items[i].quantity + 1;

                    updateData['items'] = cartExist.items

                    const productPrice = await productModel.findOne({ _id: productId, isDeleted: false }).select({ price: 1, _id: 0 })
                    if (!productPrice) { 
                        return res.status(404).send({ status: false, mesaage: `No product found with this ${productId}` }) 
                    }
                    
                    nPrice = productPrice.price;
                    updateData['totalPrice'] = cartExist.totalPrice + (nPrice * 1)
                    updateData['totalItems'] = cartExist.items.length;

                    const updatedCart = await cartModel.findOneAndUpdate({ _id: cart }, updateData, { new: true })
                    return res.status(200).send({ status: true, message: "Updated Cart", data: updatedCart })
                }
                if (cartExist.items[i].productId !== productId && i == cartExist.items.length - 1) {
                    const obj = { productId: productId, quantity: 1 }
                    let arr = cartExist.items
                    arr.push(obj)
                    updateData['items'] = arr

                    const productPrice = await productModel.findOne({ _id: productId, isDeleted: false }).select({ price: 1, _id: 0 })
                    if (!productPrice) { return res.status(404).send({ status: false, mesaage: `No product found with this ${productId}` }) }
                    nPrice = productPrice.price
                    updateData['totalPrice'] = cartExist.totalPrice + (nPrice * 1)
                    updateData['totalItems'] = cartExist.items.length;

                    const updatedCart = await cartModel.findOneAndUpdate({ _id: cart }, updateData, { new: true })
                    return res.status(200).send({ status: true, message: "Updated Cart", data: updatedCart })
                }
            }
        }
        else {
            let newData = {}
            let arr = []
            newData.userId = userId;

            const object = { productId: productId, quantity: 1 }
            arr.push(object)
            newData.items = arr;

            const productPrice = await productModel.findOne({ _id: productId, isDeleted: false }).select({ price: 1, _id: 0 })
            if (!productPrice) { return res.status(404).send({ status: false, mesaage: `No product found with this ${productId}` }) }
            nPrice = productPrice.price;
            newData.totalPrice = nPrice;

            newData.totalItems = arr.length;

            const newCart = await cartModel.create(newData)

            return res.status(201).send({ status: true, message: "Cart details", data: newCart })

        
        }
    }catch(err){
        res.status(500).send({ msg: "Error", error: err.message })
    }
};


//------------------ GETTING CART BY ID
const updateCartById = async (req, res) => {
    try {
        let data = req.body;
        if (Object.keys(data) == 0) { return res.status(400).send({ status: false, message: "Please provide input " }) }

        let cart = data.cartId;
        let productId = data.productId;
        let userId = req.params.userId;

        if (!cart) {
            let cartExistforUser = await cartModel.findOne({ userId: userId })
            if (cartExistforUser) {
                return res.status(400).send({ status: false, message: "Cart already exist for this user. PLease provide cart Id or delete the existing cart" })
            }
        }

        if (!productId) { return res.status(400).send({ status: false, message: "Please provide Product Id " }) }


        if (Object.keys(userId) == 0) { return res.status(400).send({ status: false, message: "Please provide User Id " }) }

        let userExist = await userModel.findOne({ _id: userId });
        if (!userExist) {
            return res.status(404).send({ status: false, message: `No user found with this ${userId}` })
        }


        let cartExist = await cartModel.findOne({ _id: cart });
        if (cartExist) {
            if (cartExist.userId != userId) {
                return res.status(403).send({ status: false, message: "This cart does not belong to you. Please check the cart Id" })
            }
            let updateData = {}

            for (let i = 0; i < cartExist.items.length; i++) {
                if (cartExist.items[i].productId == productId) {
                    cartExist.items[i].quantity = cartExist.items[i].quantity + 1;

                    updateData['items'] = cartExist.items

                    const productPrice = await productModel.findOne({ _id: productId, isDeleted: false }).select({ price: 1, _id: 0 })
                    if (!productPrice) { 
                        return res.status(404).send({ status: false, mesaage: `No product found with this ${productId}` }) 
                    }
                    
                    nPrice = productPrice.price;
                    updateData['totalPrice'] = cartExist.totalPrice + (nPrice * 1)
                    updateData['totalItems'] = cartExist.items.length;

                    const updatedCart = await cartModel.findOneAndUpdate({ _id: cart }, updateData, { new: true })
                    return res.status(200).send({ status: true, message: "Updated Cart", data: updatedCart })
                }
                if (cartExist.items[i].productId !== productId && i == cartExist.items.length - 1) {
                    const obj = { productId: productId, quantity: 1 }
                    let arr = cartExist.items
                    arr.push(obj)
                    updateData['items'] = arr

                    const productPrice = await productModel.findOne({ _id: productId, isDeleted: false }).select({ price: 1, _id: 0 })
                    if (!productPrice) { return res.status(404).send({ status: false, mesaage: `No product found with this ${productId}` }) }
                    nPrice = productPrice.price
                    
                    updateData['totalPrice'] = cartExist.totalPrice + (nPrice * 1)
                    updateData['totalItems'] = cartExist.items.length;

                    const updatedCart = await cartModel.findOneAndUpdate({ _id: cart }, updateData, { new: true })
                    return res.status(200).send({ status: true, message: "Updated Cart", data: updatedCart })
                }
            }

        }
        else {
            let newData = {}
            let arr = []
            newData.userId = userId;

            const object = { productId: productId, quantity: 1 }
            arr.push(object)
            newData.items = arr;

            const productPrice = await productModel.findOne({ _id: productId, isDeleted: false }).select({ price: 1, _id: 0 })
            if (!productPrice) { return res.status(404).send({ status: false, mesaage: `No product found with this ${productId}` }) }
            nPrice = productPrice.price;
            newData.totalPrice = nPrice;

            newData.totalItems = arr.length;

            const newCart = await cartModel.create(newData)

            return res.status(201).send({ status: true, message: "Cart details", data: newCart })


        }

    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }


};

//------------------ GETTING CART BY ID
const getCartById = async (req, res) => {
    res.send({ message: "hii" })


};



//------------------ UPDATING CART
const deleteCartById = async (req, res) => {
    res.send({ message: "hii" })


};


module.exports = {
    createCart,
    updateCartById,
    getCartById,
    deleteCartById
}