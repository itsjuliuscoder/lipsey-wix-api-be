const axios = require("axios");

const clientId = process.env.WIX_CLIENT_ID;
const clientSecret = process.env.WIX_CLIENT_SECRET;
const redirectUri = process.env.WIX_REDIRECT_URI;

exports.getAuthorizationUrl = () => {
    return `https://www.wix.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=stores.read`;
};

exports.handleOAuthCallback = async (code) => {
    const url = "https://www.wix.com/oauth/access";

    const response = await axios.post(url, {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
    });

    return response.data.access_token;
};
