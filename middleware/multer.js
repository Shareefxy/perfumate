const express = require("express");
const router = express.Router();
const adminController = require('../controller/adminController')

//set storage

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./public/uploads')

    },
    filename:(req,file,cb)=>{
        const ext = file.originalname.substr(file.originalname.lastIndexOf)
        cb(null,file.filename+" "+Date.now()+ext)
    }
})

module.exports=store =multer({storage:storage})