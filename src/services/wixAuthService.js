const axios = require("axios");
const { countDocuments } = require("../models/SyncLog");
require('dotenv').config();
const clientId = process.env.APP_ID;
const clientSecret = process.env.WIX_CLIENT_SECRET;
const redirectUri = process.env.WIX_REDIRECT_URI;

exports.getAuthorizationUrl = () => {
    console.log(`${clientId}, ${clientId}`)
    return `https://www.wix.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=stores.read`;
};

exports.handleOAuthCallback = async (code) => {
    console.log("this is the code -->", code)
    const url = "https://www.wix.com/oauth/access";

    const response = await axios.post(url, {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
    });

    console.log("response ", response);

    return response.data.access_token;
};
