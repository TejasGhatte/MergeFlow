const express = require('express');
const zod = require('zod');
const {User} = require('../db');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../config');
const {authMiddleware} = require('../middleware')
const router = express.Router();

const signupBody = zod.object({
    username:zod.string(),
    email:zod.string().email(),
    password: zod.string()
});

router.post('/signup', async(req, res)=>{
    const {success} = signupBody.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            message: 'Email already taken/ Incorrect Inputs'
        })
    }

    const existinguser = await User.findOne({
        username:req.body.username
    })

    if(existinguser){
        return res.status(411).json({
            message:'Email already taken'
        })
    }

    const user = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
    })

    const userId =user._id;

    const token = jwt.sign({
        userId
    }, JWT_SECRET)

    res.json({
        message: 'User created successfully',
        token: token
    })
})

const signinBody = zod.object({
    email: zod.string().email(),
    password: zod.string()
})

router.post('/signin', async(req,res)=>{
    const {success} = signinBody.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    
    const user = await User.findOne({
        email: req.body.email,
        password: req.body.password
    });

    if (user) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);
  
        res.json({
            token: token
        })
        return;
    }

    
    res.status(411).json({
        message: "Error while logging in"
    })
})

const updateBody = zod.object({
    password:zod.string().optional(),
    email:zod.string().optional(),
    username:zod.string().optional()
})

router.put("/", authMiddleware, async(req,res)=>{
    const {success}=updateBody.safeParse(req.body);
    if(!success){
        res.status(411).json({
            message: 'Error while updating information'
        })
    }

    await User.updateOne({_id: req.userId}, req.body);

    res.json({
        message: 'Updated succesfully'
    })
})

module.exports = router;