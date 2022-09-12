require('dotenv').config()
const express = require("express");

const route = require("./route/route")
const app = express();

const mongoose = require("mongoose")
const multer = require("multer")

app.use(multer().any())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))

app.use('/', route);


app.listen(process.env.PORT || 3000, function () {
    console.log("Express App Running On Port " + (process.env.PORT || 3000))
})
