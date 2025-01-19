const axios = require('axios');

const LIPSEY_API_BASE_URL = 'https://api.lipsey.com'; // Replace with actual base URL
const LIPSEY_AUTH_TOKEN = process.env.LIPSEY_AUTH_TOKEN;

const axiosInstance = axios.create({
  baseURL: LIPSEY_API_BASE_URL,
  headers: {
    Authorization: `Bearer ${LIPSEY_AUTH_TOKEN}`,
  },
});

// Fetch Lipseys inventory
async function getLipseyInventory() {
  const response = await axiosInstance.get('/inventory');
  return response.data.items;
}

async function authLogin(body) {
  const response = await axios({
    method: 'post',
    url: 'https://api.lipseys.com/api/integration/authentication/login',
    data: {
      email: body.email,
      password: body.password,
    },
  });

  return response.data;
}

module.exports = { getLipseyInventory, authLogin };
