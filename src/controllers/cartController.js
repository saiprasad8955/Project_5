const cartModel = require("../models/cartModel")
const validator = require('../validations/validator')
const userModel = require("../models/userModel")
//const ProductModel = require("../models/productModel")



//------------------ CREATING CART
const createCart = async (req, res) => {
    
};



//------------------ GETTING CART BY ID
const updateCartById = async (req, res) => {
   
};

//------------------ GETTING CART BY ID
const getCartById = async (req, res) => {

    try{
        const userId = req.params.userId

        if (!validator.isValidobjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please Provide Valid UserID" })
        }

        const cart = await cartModel.findOne({userId: userId})
        if(!cart) {
            return res.status(404).send({ status: false, msg: "Cart is not Exist for this user" });
        }

        const userExist = await userModel.findOne({_id:userId})
        if(!userExist){
            return res.status(404).send({ status: false, msg: "User not found with this Id" });
        }

        return res.status(200).send({ status: true, message: "Cart Details", data: cart })

    }catch(err){
        res.status(500).send({ msg: "Error", error: err.message })
    }
};



//------------------ UPDATING CART
const deleteCartById = async (req, res) => {
    try{
        const userId = req.params.userId

        if (!validator.isValidobjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please Provide Valid UserID" })
        }

        const cart = await cartModel.findOne({userId: userId})
        if(!cart) {
            return res.status(404).send({ status: false, msg: "Cart is not Exist for this user" });
        }

        const userExist = await userModel.findOne({_id:userId})
        if(!userExist){
            return res.status(404).send({ status: false, msg: "User not found with this Id" });
        }

        const cartDeleted = await cartModel.findOneAndUpdate( 
            {_id: cart._id}, 
            {$set: {items: [], totalPrice: 0, totalItems: 0 }},
            {new: true})


        return res.status(200).send({ status: true, message: "Cart Deleted Successfully", data: cartDeleted })

    }catch(err){
        res.status(500).send({ msg: "Error", error: err.message })
    }


};


module.exports = {
    createCart,
    updateCartById,
    getCartById,
    deleteCartById
}