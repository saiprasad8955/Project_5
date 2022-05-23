const cartModel = require("../models/cartModel")




//------------------ CREATING PRODUCT
const createCart = async (req,res)=>{
    res.send({msg:"hii"})
};

//------------------ GETTING PRODUCT
const getProducts = async (req,res)=>{
    res.send({msg:"hii"})
};

//------------------ GETTING PRODUCT BY ID
const getProductsById = async (req,res)=>{
    res.send({msg:"hii"})
};

//------------------ GETTING PRODUCT BY ID
const updateProductById = async (req,res)=>{
    res.send({msg:"hii"})
};

//------------------ UPDATING CART
const deleteProductById = async (req,res)=>{
    res.send({msg:"hii"})
};


module.exports = { 
    createCart,
    getProducts,
    getProductsById,
    updateProductById,
    deleteProductById
}