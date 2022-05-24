// VALIDATIONS HERE
const mongoose = require("mongoose")

const isValid = (value)=>{
    if ( typeof value !== "string") return false;
    if ( typeof value === "string" && value.trim().length === 0 ) return false;
    if ( typeof value === "undefined" && typeof value == null ) return false;
    return true;
}


const isValidString = (value) => {
    const dv = /[a-zA-Z]/ 
    if (dv.test(value) === false) return false;
    return true;
}


const isValidRequestBody = (body)=>{
    return (Object.getOwnPropertyNames(body).length > 0)
}


const isValidEmail = (email)=>{
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}


const isValidPincode = (pincode)=>{
    const dv = /^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/; 
    if(typeof pincode !== 'string') return false
    if(dv.test(pincode)=== false) return false
    return true;
}


const isValidPassword = (pass)=>{
    if (pass.length > 15 || pass.length < 8) return false ; 
    if(! (/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/).test(password)) return false;
    return true;
}


const isValidPhone = (phone)=>{
    return (/^[6-9]\d{9}$/.test(phone))
}


const isValidObjectId = (objectId)=> {
    return mongoose.Types.ObjectId.isValid(objectId);
  };


const isValidURL = (url)=> {
return (/^(ftp|http|https):\/\/[^ "]+$/).test(url);
}


const isValidImage = (image)=>{
    if((/.*\.(jpeg|jpg|png)$/).test(image.originalname)) return true;
    return false
}

module.exports = {
    isValid,
    isValidString,
    isValidEmail,
    isValidImage,
    isValidObjectId,
    isValidPassword,
    isValidPhone,
    isValidPincode,
    isValidRequestBody,
    isValidURL
}