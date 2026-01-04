import * as dotenv from "dotenv";
// import { z } from "zod";

dotenv.config();

// const envSchema = z.object({
//   APP_PORT: z.string(),
// })
// const env = envSchema.parse(process.env)

const APP_PORT = process.env.APP_PORT;
const NODE_ENV = process.env.NODE_ENV;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const APP_EMAIL = process.env.APP_EMAIL;
const APP_EMAIL_PASSWORD = process.env.APP_EMAIL_PASSWORD;

const API_BASE_URL = process.env.API_BASE_URL;
const BASE_URL = process.env.BASE_URL;

export default { APP_PORT, NODE_ENV, JWT_SECRET, JWT_REFRESH_SECRET, APP_EMAIL, APP_EMAIL_PASSWORD, API_BASE_URL, BASE_URL };