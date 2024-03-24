const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const CLIENT_ID = '';
const CLIENT_SECRET = '';
const REDIRECT_URI = '';
const REFRESH_TOKEN= '';

const oAuth2Client  = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN})

const SendMail = async (from_email,from_name, to_email, to_name, subject, text, html)=>{
    try {
        const accessToken = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: from_email,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken
            }
        })

        const interpolatedHTML = html.replace('${to_name}',to_name);

        const mailOptions = {
            from: from_email,
            to: to_email,
            subject: subject,
            text: text,
            html: interpolatedHTML,
        };

        const result = await transport.sendMail(mailOptions)
        return result

    } catch (error) {
        return error
    }
}

module.exports = SendMail;