const axios = require("axios");

app.get("/oauth/callback", async (req, res) => {
    const { code } = req.query;

    try {
        const response = await axios.post("https://www.wix.com/oauth/access", {
            client_id: "YOUR_WIX_APP_CLIENT_ID",
            client_secret: "YOUR_WIX_APP_CLIENT_SECRET",
            code,
            redirect_uri: "YOUR_REDIRECT_URI",
            grant_type: "authorization_code",
        });

        const accessToken = response.data.access_token;
        res.json({ message: "Authorization successful!", accessToken });
    } catch (error) {
        console.error("Error exchanging code for token:", error.response.data);
        res.status(500).send("Failed to get access token");
    }
});
