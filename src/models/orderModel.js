const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        required: true,
        ref: 'USER',
        trim: true
    },

    items: [{
        productId: {
            type: ObjectId,
            required: true,
            ref: 'PRODUCT',
            trim: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            trim: true
        }
    }],

    totalPrice: {
        type: Number,
        required: true,
        // comment: "Holds total price of all the items in the cart",
        trim: true
    },

    totalItems: {
        type: Number,
        required: true,
        // comment: "Holds total number of items in the cart",
        trim: true
    },

    totalQuantity: {
        type: Number,
        required: true,
        // comment: "Holds total number of items in the cart",
        trim: true
    },

    cancellable: {
        type: Boolean,
        default: true
    },

    status: {
        type: String,
        default: 'pending',
        enum: ["pending", "completed", "cancelled"]
    },

    deletedAt: {
        type: Date
    },

    isDeleted: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

module.exports = mongoose.model("ORDER", orderSchema)