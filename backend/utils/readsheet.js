const { google } = require('googleapis');
const {web} = require("../creds-sheet.json")

const CLIENT_ID = web.client_id;
const CLIENT_SECRET = web.client_secret;
const REDIRECT_URI = web.redirect_uris;
const REFRESH_TOKEN= '';

//Returns an array of cells in Sheet

const authClient =  new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
authClient.setCredentials({ refresh_token: REFRESH_TOKEN });

const ReadSheet = async (auth,sheetId) => {
      const sheets = google.sheets({ version: 'v4', auth});
      let rows;
      try {
        const res = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: 'Sheet1!A2:C',
        });
        rows = res.data.values;
      } catch (err) {
        console.log('The API returned an error: ' + err);
      }
      if (rows && rows.length) {
        console.log('Email, Name, DOB:');

        return rows;
      } else {
        console.log('No data found.');
      }
    }
  module.exports = {
    ReadSheet,
    authClient
  }

