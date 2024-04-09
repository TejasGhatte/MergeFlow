const express = require('express');
const zod = require('zod');
const cron = require("node-cron")
const { User, Config } = require('../db');
const { authMiddleware } = require('../middleware');
const router = express.Router();
const SendMail = require("../utils/sendmail");
const { ReadSheet } = require("../utils/readsheet");
const { authClient } = require("../utils/readsheet");
const getSpreadsheetId = require("../utils/getSheetId");
const ObjectId = require('mongoose').Types.ObjectId;
const Fuse = require("fuse.js")


// Adding configurations
const configbody = zod.object({
    title: zod.string(),
    sheetlink: zod.string(),
    subject:zod.string(),
    cardlink:zod.string(),
    htmlTemp: zod.string()
})

router.post("/addConfig", authMiddleware, async (req, res) => {
    const { success } = configbody.safeParse(req.body);
    const { title, sheetlink, subject, cardlink, htmlTemp } = req.body;

    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }
    try {
        const config = await Config.create({
            title,
            sheetlink,
            subject,
            cardlink,
            htmlTemp,
            userId: req.userId

        })

        res.status(201).json({
            message: "Template Created",
            id: config._id
        })
    } catch (error) {
        res.json({
            Error: error
        })
    }

})

//search all configs
router.get("/bulk", authMiddleware, async(req,res)=>{
    const filter = req.query.filter || "";
    
    const configs = await Config.find(
        {
            userId: { $in: [
                new ObjectId(req.userId)
            ]}
        }
    )

    if(filter){
        const fuse = new Fuse(configs, {
            keys: ['title'],
            includeScore: false
        })

        const results = fuse.search(filter);
        return res.status(200).json({
            configs: results
        })
    }else{
        return res.status(200).json({
            configs
        })
    }
})


//send mail
router.post("/:id", authMiddleware, async (req, res) => {
    console.log(typeof (ReadSheet))
    const config = await Config.findById(new ObjectId(req.params.id));

    if (config) {
        //read the sheet

        const sheetID = await getSpreadsheetId(config.sheetlink)
        const result_sheet = await ReadSheet(authClient, sheetID);
        console.log(result_sheet)

        from_person = await User.findById(new ObjectId(req.userId));
        from_name = from_person.username;
        from_email = from_person.email;
        subject = config.subject;
        html_temp = config.htmlTemp;


        //add cronjob
        const task = async () => {
            const currentDate = new Date();
            const strDate = currentDate.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).toString();

            for (let i = 0; i < result_sheet.length; i++) {
                try {
                    if (result_sheet[i][2] === strDate) {
                        to_email = result_sheet[i][0];
                        console.log(to_email)
                        to_name = result_sheet[i][1];
                        console.log(to_name)
                        //send mail
                        const sent = await SendMail(from_email,from_name, to_email, to_name,subject, "Wishing HBD", html_temp);
                    }
                } catch (error) {
                    res.send(error)
                }
            }
        }
        //Schedule task at 00:05 everyday to check birthdays and send mails
        cron.schedule("5 0 * * *", task)
        res.status(201).json({
            message: "Cron Job started..Sending Mails"
        })

    } else {
        res.status(400).json({
            message: "Invalid ID"
        })
    }
})


module.exports = router;