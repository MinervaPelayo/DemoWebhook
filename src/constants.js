require('dotenv').load()

const verify_token = process.env.VERIFY_TOKEN;

const page_access_token = process.env.PAGE_ACCESS_TOKEN;

export { verify_token, page_access_token };
