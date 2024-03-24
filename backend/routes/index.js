const express = require("express");
const authRouter = require('./auth');
const mailRouter = require("./mail");

const router = express.Router();

router.use("/auth", authRouter);
router.use("/mail", mailRouter);

module.exports=router;
