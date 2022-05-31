const express = require("express");
const router = express.Router();

// IMPORTING CONTROLLERS
const productController = require("../controllers/productController")
const cartController = require("../controllers/cartController")
const userController = require("../controllers/userController")
const orderController = require("../controllers/orderController")
const { authentication } = require('../middleware/authentication')


//----------- USER API'S
router.post('/register', userController.createUser)
router.post('/login', userController.loginUser)
router.get('/user/:userId/profile', authentication, userController.getUserById)
router.put('/user/:userId/profile', authentication, userController.updateUserById)

//----------- PRODUCT API'S
router.post('/products', productController.createProduct)
router.get('/products', productController.getProducts)
router.get('/products/:productId', productController.getProductsById)
router.put('/products/:productId', productController.updateProductById)
router.delete('/products/:productId', productController.deleteProductById)

//----------- CART API'S(PROTECTED ROUTES)
router.post('/users/:userId/cart', authentication, cartController.createCart)
router.put('/users/:userId/cart', authentication, cartController.updateCartById)
router.get('/users/:userId/cart', authentication, cartController.getCartById)
router.delete('/users/:userId/cart', authentication, cartController.deleteCartById)

//----------- ORDER API'S
router.post('/users/:userId/orders', authentication, orderController.placeOrder)
router.put('/users/:userId/orders', authentication, orderController.updateOrderById)

// EXPORTING ROUTER
module.exports = router;