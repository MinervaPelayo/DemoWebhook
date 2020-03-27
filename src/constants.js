const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    verify_token: process.env.VERIFY_TOKEN,
    page_access_token: process.env.PAGE_ACCESS_TOKEN,
  };
