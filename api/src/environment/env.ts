import * as dotenv from "dotenv";
// import { z } from "zod";

dotenv.config();

// const envSchema = z.object({
//   APP_PORT: z.string(),
// })
// const env = envSchema.parse(process.env)

const APP_PORT = process.env.APP_PORT;
const NODE_ENV = process.env.NODE_ENV;

export default { APP_PORT, NODE_ENV };