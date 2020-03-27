const dotenv = require('dotenv');

dotenv.config();

const VERIFY_TOKEN=process.env.VERIFY_TOKEN;

const PAGE_ACCESS_TOKEN=process.env.PAGE_ACCESS_TOKEN;

export { VERIFY_TOKEN, PAGE_ACCESS_TOKEN };