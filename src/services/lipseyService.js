const axios = require('axios');

const LIPSEY_API_BASE_URL = 'https://api.lipseys.com/api'; // Replace with actual base URL
const LIPSEY_AUTH_TOKEN = process.env.LIPSEY_API_KEY;

const axiosInstance = axios.create({
  baseURL: LIPSEY_API_BASE_URL,
  headers: {
    Token: `${LIPSEY_AUTH_TOKEN}`,
  }
});

// Fetch Lipseys inventory
async function getLipseyInventory() {
  const response = await axiosInstance.get('/inventory');
  return response.data.items;
}

async function getCatalogFeed() {

  // let payload = {
  //   "email": "rboutin249@gmail.com",
  //   "password": "BayState21!"
  // }
  // payload = JSON.stringify(payload);
  // const response = await authLogin(payload);
  // const token = response.token;

  try {
    const response = await axios({
      method: 'get',
      url: `${LIPSEY_API_BASE_URL}/integration/items/CatalogFeed`,
      headers: {
        Token: `${LIPSEY_AUTH_TOKEN}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching catalog feed:", error.response ? error.response.data : error.message);
    throw error;
  }
}

async function pricingQuantityFeed(){


  try {
    const response = await axios({
      method: 'get',
      url: `${LIPSEY_API_BASE_URL}/integration/items/PricingQuantityFeed`,
      headers: {
       //  Token: `${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching catalog feed:", error.response ? error.response.data : error.message);
    throw error;
  }
}

async function authLogin(body) {
  console.log("authLogin body", body);
  const payload = {
    Email: body.email,
    Password: body.password,
  };

  try {
    const response = await axios({
      method: 'post',
      url: 'https://api.lipseys.com/api/integration/authentication/login',
      headers: {
        'Content-Type': 'application/json',
      },
      data: payload,
    });

    console.log("lipseys response", response.data);
    return response.data;
  } catch (error) {
    console.error("Error during authentication:", error.response ? error.response.data : error.message);
    throw error;
  }
}

module.exports = { getLipseyInventory, authLogin, getCatalogFeed, pricingQuantityFeed };
