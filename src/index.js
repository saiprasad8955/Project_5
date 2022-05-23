const express =  require("express");
const bodyParser = require("body-parser");
const route = require("./route/route")
const app = express();

const mongoose = require("mongoose")
const multer = require("multer")


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }))

mongoose.connect("mongodb+srv://Sai0047:rXxgqYKPqwnhcXX7@cluster0.qptsw.mongodb.net/group8Database",
{ useNewUrlParser : true })

app.use('/',route);
app.use(multer().any());

app.listen ( process.env.PORT || 3000, function (){
    console.log("Express App Running On Port" + (process.env.PORT || 3000))
})
