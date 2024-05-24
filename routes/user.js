const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const zod  = require("zod");

const userSchema = zod.object({
    username:zod.string(),
    password:zod.string()
})

router.post("/createuser", async(req,res) => {
    const {success} = userSchema.safeParse(req.body);

    if(!success){
        return res.status(400).json({
            message: "Enter the credentials Properly"
        })
    }


});





module.exports = router;
